// Onde as pranchas ficam: no aparelho, pela abstração de armazenamento de
// sempre. As pranchas NÃO são de um perfil de criança: são do aparelho (o
// tablet do aluno, o computador da professora). Por isso as chaves não têm
// prefixo de perfil — e a cópia de segurança dos Ajustes já as leva junto,
// porque copia todas as chaves.
//
//   caa:conjuntos   → ConjuntoCaa[]   (as figuras vão dentro, já reduzidas)
//   caa:ativo       → string          (id do conjunto que a prancha abre)

import { armazenamento } from '../armazenamento/armazenamento';
import { copiar, idLivre, validarConjunto, type ConjuntoCaa } from './modelo';
import { conjuntoEmBranco, conjuntoEssencial } from './padrao';
import { PICTOGRAMAS } from './pictogramas';

const CHAVE_CONJUNTOS = 'caa:conjuntos';
const CHAVE_ATIVO = 'caa:ativo';
export const PICTOGRAMAS_CONHECIDOS: ReadonlySet<string> = new Set(Object.keys(PICTOGRAMAS));

export async function listarConjuntos(): Promise<ConjuntoCaa[]> {
  const brutos = await armazenamento.obter<unknown[]>(CHAVE_CONJUNTOS);
  if (!Array.isArray(brutos) || brutos.length === 0) {
    // primeira vez: o aparelho já nasce com a essencial pronta para usar
    const lista = [conjuntoEssencial()];
    await armazenamento.definir(CHAVE_CONJUNTOS, lista);
    return lista;
  }
  // o que está guardado também passa pela validação (pode ser de versão antiga)
  const lista: ConjuntoCaa[] = [];
  for (const b of brutos) {
    const v = validarConjunto(b, PICTOGRAMAS_CONHECIDOS);
    if (v.ok && !lista.some((x) => x.id === v.conjunto.id)) lista.push(v.conjunto);
  }
  return lista.length ? lista : [conjuntoEssencial()];
}

async function gravar(lista: ConjuntoCaa[]): Promise<void> {
  await armazenamento.definir(CHAVE_CONJUNTOS, lista);
}

export async function salvarConjunto(conjunto: ConjuntoCaa): Promise<void> {
  const lista = await listarConjuntos();
  const i = lista.findIndex((x) => x.id === conjunto.id);
  if (i >= 0) lista[i] = conjunto;
  else lista.push(conjunto);
  await gravar(lista);
}

export async function excluirConjunto(id: string): Promise<void> {
  const lista = (await listarConjuntos()).filter((x) => x.id !== id);
  await gravar(lista);
  if ((await armazenamento.obter<string>(CHAVE_ATIVO)) === id) await armazenamento.remover(CHAVE_ATIVO);
}

export async function conjuntoAtivo(): Promise<ConjuntoCaa> {
  const lista = await listarConjuntos();
  const id = await armazenamento.obter<string>(CHAVE_ATIVO);
  return lista.find((x) => x.id === id) ?? lista[0];
}

export async function idDoAtivo(): Promise<string> {
  return (await conjuntoAtivo()).id;
}

export async function definirAtivo(id: string): Promise<void> {
  await armazenamento.definir(CHAVE_ATIVO, id);
}

export type ComoComecar = 'essencial' | 'branco';

/** Cria e guarda um conjunto novo; devolve o criado. */
export async function novoConjunto(nome: string, como: ComoComecar): Promise<ConjuntoCaa> {
  const lista = await listarConjuntos();
  const id = idLivre(nome || 'prancha', lista.map((x) => x.id));
  const conjunto = como === 'essencial' ? conjuntoEssencial(id, nome) : conjuntoEmBranco(id, nome);
  await gravar([...lista, conjunto]);
  return conjunto;
}

/** Guarda um conjunto que veio de arquivo, sem pisar em nenhum que já existe. */
export async function guardarImportado(conjunto: ConjuntoCaa): Promise<ConjuntoCaa> {
  const lista = await listarConjuntos();
  const novo = copiar(conjunto);
  novo.id = idLivre(conjunto.id, lista.map((x) => x.id));
  if (lista.some((x) => x.nome === novo.nome)) novo.nome = `${novo.nome} (do arquivo)`.slice(0, 60);
  await gravar([...lista, novo]);
  return novo;
}

export async function duplicarConjunto(conjunto: ConjuntoCaa): Promise<ConjuntoCaa> {
  const lista = await listarConjuntos();
  const novo = copiar(conjunto);
  novo.id = idLivre(conjunto.id, lista.map((x) => x.id));
  novo.nome = `${conjunto.nome} (cópia)`.slice(0, 60);
  await gravar([...lista, novo]);
  return novo;
}
