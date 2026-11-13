// Onde moram os textos próprios: no IndexedDB do navegador, e não no
// localStorage como o resto do app.
//
// POR QUÊ. O localStorage tem um teto pequeno — perto de 5 MB no Safari, e é
// por site, somado a tudo: perfis, pinturas com pincel, posições de leitura.
// Um livro de verdade (um romance em .md) passa de 1 MB. Dois ou três e o app
// pararia de conseguir guardar a pintura da criança, sem aviso. O IndexedDB
// é feito para isso: o navegador dá centenas de MB. É também onde o Pedra
// Angular guarda os textos dele.
//
// Se o IndexedDB não abrir (navegador muito antigo, algum modo privado), os
// textos voltam para o localStorage, como era antes — funciona, só que pequeno.
//
// As anotações antigas (`<perfil>:notas`, no localStorage) passam para cá na
// primeira vez que o perfil abre as anotações; a chave antiga só é apagada
// depois que a nova foi gravada.

import { armazenamento } from './armazenamento';
import { deAnotacaoAntiga, type AnotacaoAntiga, type TextoProprio } from '../conteudo/textosProprios';

interface Registro extends TextoProprio {
  /** `<perfil>:<id>` — a chave do registro */
  chave: string;
  perfil: number;
}

const BANCO = 'historinhas-textos';
const LOJA = 'textos';

let banco: Promise<IDBDatabase | null> | null = null;

function abrir(): Promise<IDBDatabase | null> {
  banco ??= new Promise((ok) => {
    try {
      if (typeof indexedDB === 'undefined') return ok(null);
      const pedido = indexedDB.open(BANCO, 1);
      pedido.onupgradeneeded = () => {
        const loja = pedido.result.createObjectStore(LOJA, { keyPath: 'chave' });
        loja.createIndex('perfil', 'perfil');
      };
      pedido.onsuccess = () => ok(pedido.result);
      pedido.onerror = () => ok(null);
      pedido.onblocked = () => ok(null);
    } catch {
      ok(null);
    }
  });
  return banco;
}

function esperar<T>(pedido: IDBRequest<T>): Promise<T> {
  return new Promise((ok, falhou) => {
    pedido.onsuccess = () => ok(pedido.result);
    pedido.onerror = () => falhou(pedido.error);
  });
}

function terminou(tx: IDBTransaction): Promise<void> {
  return new Promise((ok, falhou) => {
    tx.oncomplete = () => ok();
    tx.onerror = () => falhou(tx.error);
    tx.onabort = () => falhou(tx.error);
  });
}

const chaveReserva = (perfil: number) => `${perfil}:textos`;

const semChave = ({ chave: _c, perfil: _p, ...t }: Registro): TextoProprio => (void _c, void _p, t);

async function migrarAnotacoesAntigas(perfil: number): Promise<void> {
  const antigas = await armazenamento.obter<AnotacaoAntiga[]>(`${perfil}:notas`);
  if (!antigas?.length) return;
  await guardarVarios(perfil, antigas.map(deAnotacaoAntiga));
  await armazenamento.remover(`${perfil}:notas`);
}

/** Os textos de um perfil, do mais recente para o mais antigo. */
export async function listarTextos(perfil: number): Promise<TextoProprio[]> {
  await migrarAnotacoesAntigas(perfil);
  const db = await abrir();
  let lista: TextoProprio[];
  if (db) {
    const tx = db.transaction(LOJA, 'readonly');
    const registros = await esperar(tx.objectStore(LOJA).index('perfil').getAll(perfil) as IDBRequest<Registro[]>);
    lista = registros.map(semChave);
  } else {
    lista = (await armazenamento.obter<TextoProprio[]>(chaveReserva(perfil))) ?? [];
  }
  return lista.sort((a, b) => b.alteradoEm - a.alteradoEm);
}

export async function obterTexto(perfil: number, id: string): Promise<TextoProprio | undefined> {
  return (await listarTextos(perfil)).find((t) => t.id === id);
}

export async function guardarVarios(perfil: number, textos: TextoProprio[]): Promise<void> {
  if (!textos.length) return;
  const db = await abrir();
  if (db) {
    const tx = db.transaction(LOJA, 'readwrite');
    const loja = tx.objectStore(LOJA);
    for (const t of textos) loja.put({ ...t, chave: `${perfil}:${t.id}`, perfil } satisfies Registro);
    await terminou(tx);
    return;
  }
  const lista = (await armazenamento.obter<TextoProprio[]>(chaveReserva(perfil))) ?? [];
  for (const t of textos) {
    const i = lista.findIndex((x) => x.id === t.id);
    if (i >= 0) lista[i] = t;
    else lista.push(t);
  }
  await armazenamento.definir(chaveReserva(perfil), lista);
}

export async function guardarTexto(perfil: number, texto: TextoProprio): Promise<void> {
  await guardarVarios(perfil, [texto]);
}

export async function apagarTexto(perfil: number, id: string): Promise<void> {
  const db = await abrir();
  if (db) {
    const tx = db.transaction(LOJA, 'readwrite');
    tx.objectStore(LOJA).delete(`${perfil}:${id}`);
    await terminou(tx);
    return;
  }
  const lista = (await armazenamento.obter<TextoProprio[]>(chaveReserva(perfil))) ?? [];
  await armazenamento.definir(chaveReserva(perfil), lista.filter((t) => t.id !== id));
}

// ---------- para a cópia de segurança (o aparelho inteiro, todos os perfis) ----------

export type TextosPorPerfil = Record<string, TextoProprio[]>;

export async function todosOsTextos(): Promise<TextosPorPerfil> {
  const db = await abrir();
  const saida: TextosPorPerfil = {};
  if (!db) return saida; // sem IndexedDB os textos estão no localStorage, e a cópia já os leva
  const tx = db.transaction(LOJA, 'readonly');
  const registros = await esperar(tx.objectStore(LOJA).getAll() as IDBRequest<Registro[]>);
  for (const r of registros) (saida[String(r.perfil)] ??= []).push(semChave(r));
  return saida;
}

/** Troca TODOS os textos do aparelho pelos da cópia (a cópia é troca, não mistura). */
export async function trocarTodosOsTextos(textos: TextosPorPerfil): Promise<void> {
  const db = await abrir();
  if (db) {
    const tx = db.transaction(LOJA, 'readwrite');
    tx.objectStore(LOJA).clear();
    await terminou(tx);
  }
  for (const [perfil, lista] of Object.entries(textos)) {
    if (/^\d+$/.test(perfil)) await guardarVarios(Number(perfil), lista);
  }
}

/** Quando um perfil é apagado, os textos dele vão junto. */
export async function apagarTextosDoPerfil(perfil: number): Promise<void> {
  for (const t of await listarTextos(perfil)) await apagarTexto(perfil, t.id);
  await armazenamento.remover(chaveReserva(perfil));
}
