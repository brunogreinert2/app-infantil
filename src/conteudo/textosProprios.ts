// Os textos da própria criança (e da família): as anotações escritas no app
// e os arquivos .md e .txt trazidos de fora — inclusive livros inteiros.
//
// O FORMATO DE TROCA É O DO PEDRA ANGULAR. O app-leitura guarda os textos
// próprios ("Meus arquivos") como `{id, nome, titulo, autor, tipo: 'md'|'txt',
// conteudo, criadoEm}` e exporta um .json `{app: 'pedra-angular-leitura',
// version: 1, exportedAt, localStorage, files}`. Aqui:
//   • IMPORTAR aceita esse .json como ele sai do Pedra Angular (pega só os
//     textos; tema, fonte e posição de leitura de lá não servem aqui);
//   • EXPORTAR gera esse mesmo .json, com `localStorage` vazio — o Pedra
//     Angular o importa sem saber que veio daqui, e sem mudar nada lá.
// Um campo a mais, `origem: 'historinhas'`, diz de onde veio; o Pedra Angular
// ignora campos que não conhece.
//
// Este arquivo é só conta (texto ↔ objeto), testável sem navegador. Quem
// guarda é ../armazenamento/textos.ts.

import { load } from 'js-yaml';

/**
 * `nota`: escrita no app, texto CRU (comando de Minecraft, código): nunca
 * passa pelo leitor de Markdown. `md`: lida como livro (títulos, negrito…).
 * `txt`: texto puro trazido de fora — também cru.
 */
export type TipoDeTexto = 'nota' | 'md' | 'txt';

export interface TextoProprio {
  id: string;
  titulo: string;
  autor: string;
  tipo: TipoDeTexto;
  conteudo: string;
  /** chave de PILHAS_DE_FONTE para o editor (escolha da criança) */
  fonte: string;
  /** no editor, linha comprida quebra (true) ou rola para o lado (false) */
  quebrar: boolean;
  criadoEm: number;
  alteradoEm: number;
  /** nome do arquivo como chegou, quando veio de fora */
  origem?: string;
}

/** As anotações de antes (guardadas em `<perfil>:notas` até 2026-11-12). */
export interface AnotacaoAntiga {
  id: number;
  titulo: string;
  texto: string;
  fonte: string;
  quebrar: boolean;
  alteradoEm: number;
}

export function deAnotacaoAntiga(a: AnotacaoAntiga): TextoProprio {
  return {
    id: `nota-${a.id}`,
    titulo: a.titulo,
    autor: '',
    tipo: 'nota',
    conteudo: a.texto,
    fonte: a.fonte || 'codigo',
    quebrar: a.quebrar !== false,
    criadoEm: a.alteradoEm,
    alteradoEm: a.alteradoEm,
  };
}

export function idNovo(agora: number, prefixo = 'texto'): string {
  return `${prefixo}-${agora.toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Primeira linha com conteúdo vira o nome, se ninguém deu um. */
export function tituloAutomatico(texto: string): string {
  const linha = texto.split('\n').find((l) => l.trim());
  return linha ? linha.replace(/^#+\s*/, '').trim().slice(0, 60) : 'Sem nome';
}

export function nomeParaMostrar(t: TextoProprio): string {
  return t.titulo || tituloAutomatico(t.conteudo);
}

// o mesmo cuidado do Pedra Angular com `[[link]]` em título e autor
function limparMeta(valor: unknown): string | null {
  if (typeof valor !== 'string' && typeof valor !== 'number') return null;
  return String(valor).replace(/\[\[([^\][|]+)(?:\|[^\][]*)?\]\]/g, '$1').trim() || null;
}

function lerFrontMatter(conteudo: string): Record<string, unknown> | null {
  const m = conteudo.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  try {
    const meta = load(m[1]);
    return meta && typeof meta === 'object' ? (meta as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Um arquivo .md ou .txt escolhido pela pessoa vira um texto próprio. */
export function deArquivo(nome: string, conteudo: string, agora: number): TextoProprio | null {
  if (!/\.(md|markdown|txt)$/i.test(nome)) return null;
  const tipo: TipoDeTexto = /\.txt$/i.test(nome) ? 'txt' : 'md';
  const meta = tipo === 'md' ? lerFrontMatter(conteudo) : null;
  const base = nome.replace(/\.(md|markdown|txt)$/i, '');
  return {
    id: idNovo(agora),
    titulo: limparMeta(meta?.title) ?? limparMeta(meta?.titulo) ?? base,
    autor: limparMeta(meta?.author) ?? limparMeta(meta?.autor) ?? '',
    tipo,
    conteudo,
    fonte: tipo === 'txt' ? 'codigo' : 'padrao',
    quebrar: true,
    criadoEm: agora,
    alteradoEm: agora,
    origem: nome,
  };
}

// ---------- o .json do Pedra Angular ----------

export const MARCA_PEDRA_ANGULAR = 'pedra-angular-leitura';

interface ArquivoDoPedraAngular {
  id: string;
  nome: string;
  titulo: string;
  autor: string;
  tipo: 'md' | 'txt';
  conteudo: string;
  criadoEm: number;
}

/** O .json que o Pedra Angular sabe importar, só com os textos. */
export function paraPedraAngular(textos: TextoProprio[], agora: Date) {
  const files: ArquivoDoPedraAngular[] = textos.map((t) => {
    // nota é texto cru: lá ela vai como .txt, para o `#` de um comando
    // não virar título
    const tipo = t.tipo === 'md' ? 'md' : 'txt';
    const titulo = nomeParaMostrar(t);
    return {
      id: t.id,
      nome: `${titulo.replace(/[\\/:*?"<>|]/g, '').trim() || 'texto'}.${tipo}`,
      titulo,
      autor: t.autor || 'Historinhas',
      tipo,
      conteudo: t.conteudo,
      criadoEm: t.criadoEm,
    };
  });
  return {
    app: MARCA_PEDRA_ANGULAR,
    version: 1,
    exportedAt: agora.toISOString(),
    origem: 'historinhas',
    localStorage: {},
    files,
  };
}

export function nomeDoArquivoDeTextos(agora: Date): string {
  const d = (n: number) => String(n).padStart(2, '0');
  return `historinhas-textos-${agora.getFullYear()}-${d(agora.getMonth() + 1)}-${d(agora.getDate())}.json`;
}

export type LeituraDeTextos =
  | { ok: true; textos: TextoProprio[]; doPedraAngular: boolean }
  | { ok: false; motivo: string };

/**
 * Lê um .json de textos: o do Pedra Angular (de lá ou exportado daqui).
 * Recusa o resto com uma frase que diz o que fazer.
 */
export function lerJsonDeTextos(texto: string, agora: number): LeituraDeTextos {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    return { ok: false, motivo: 'Este arquivo não é um .json de textos.' };
  }
  const obj = (bruto && typeof bruto === 'object' ? bruto : {}) as Record<string, unknown>;
  if (obj.app === 'historinhas') {
    return {
      ok: false,
      motivo: 'Esta é uma cópia de segurança do Historinhas inteiro. Ela se traz em Ajustes → Cópia de segurança.',
    };
  }
  if (obj.app !== MARCA_PEDRA_ANGULAR || !Array.isArray(obj.files)) {
    return { ok: false, motivo: 'Este arquivo não é um .json de textos do Pedra Angular nem do Historinhas.' };
  }
  const textos: TextoProprio[] = [];
  for (const f of obj.files as unknown[]) {
    if (!f || typeof f !== 'object') continue;
    const a = f as Partial<ArquivoDoPedraAngular>;
    if (typeof a.conteudo !== 'string') continue;
    const tipo: TipoDeTexto = a.tipo === 'txt' ? 'txt' : 'md';
    const criado = typeof a.criadoEm === 'number' ? a.criadoEm : agora;
    textos.push({
      id: typeof a.id === 'string' && /^[\w.\-]{1,120}$/.test(a.id) ? a.id : idNovo(agora),
      titulo: typeof a.titulo === 'string' ? a.titulo.slice(0, 200) : '',
      // o autor-carimbo que o Pedra Angular põe em texto sem autor não é autor
      autor:
        typeof a.autor === 'string' && !/^(Arquivo|Texto) próprio$|^Historinhas$/.test(a.autor)
          ? a.autor.slice(0, 200)
          : '',
      tipo,
      conteudo: a.conteudo,
      fonte: tipo === 'txt' ? 'codigo' : 'padrao',
      quebrar: true,
      criadoEm: criado,
      alteradoEm: criado,
      origem: typeof a.nome === 'string' ? a.nome : undefined,
    });
  }
  return { ok: true, textos, doPedraAngular: obj.origem !== 'historinhas' };
}

// ---------- juntar sem apagar nada ----------

const mesmoTexto = (a: string, b: string) => a.replace(/\r\n/g, '\n') === b.replace(/\r\n/g, '\n');

/**
 * Junta textos que chegaram aos que já existem, como o Pedra Angular faz:
 * NUNCA grava por cima. Mesmo id e mesmo conteúdo: já está aqui, fica de
 * fora. Mesmo id e conteúdo diferente: entra AO LADO, como "título (cópia)".
 */
export function juntar(
  existentes: TextoProprio[],
  chegando: TextoProprio[],
  agora: number,
): { novos: TextoProprio[]; iguais: number } {
  const porId = new Map(existentes.map((t) => [t.id, t]));
  const nomes = new Set(existentes.map((t) => nomeParaMostrar(t).toLowerCase()));
  const novos: TextoProprio[] = [];
  let iguais = 0;
  for (const t of chegando) {
    const ja = porId.get(t.id);
    if (ja && mesmoTexto(ja.conteudo, t.conteudo)) {
      iguais++;
      continue;
    }
    // o mesmo texto com outro id também já está aqui
    if (existentes.some((e) => mesmoTexto(e.conteudo, t.conteudo) && nomeParaMostrar(e) === nomeParaMostrar(t))) {
      iguais++;
      continue;
    }
    let item = t;
    if (ja || porId.has(t.id)) {
      const base = nomeParaMostrar(t);
      let titulo = `${base} (cópia)`;
      for (let n = 2; nomes.has(titulo.toLowerCase()); n++) titulo = `${base} (cópia ${n})`;
      item = { ...t, id: idNovo(agora), titulo };
    }
    porId.set(item.id, item);
    nomes.add(nomeParaMostrar(item).toLowerCase());
    novos.push(item);
  }
  return { novos, iguais };
}

// ---------- pesquisar ----------

/** minúsculas e sem acento: "historia" acha "História" */
export function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function combina(consulta: string, ...campos: Array<string | undefined>): boolean {
  const palavras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (!palavras.length) return true;
  const onde = normalizar(campos.filter(Boolean).join(' '));
  return palavras.every((p) => onde.includes(p));
}
