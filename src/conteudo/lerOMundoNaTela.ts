// LER O MUNDO NA TELA (2026-11-22): as regras dos cinco passos da ficha,
// puras (sem DOM), para a tela e para os testes. A tela faz o MESMO que a
// folha impressa — ler a palavra como ela aparece, as partes, encontrar,
// escrever, onde se vê — só que tocando e ouvindo.
//
// Nada de sorte: as opções do «encontre» e as letras do «escreva» saem sempre
// na mesma ordem para a mesma palavra.

import { CATALOGO, idDaPalavra, parecidasDe, type PalavraDoMundo } from './lerOMundo';

/** Passo 2: as partes da palavra — as sílabas, ou letra por letra. */
export function pedacosDe(p: PalavraDoMundo): string[] {
  return p.silabas?.length ? p.silabas : [...p.palavra];
}

/** Passo 3: a palavra entre quatro parecidas, nos lugares da folha (2ª casa). */
export function opcoesDaBusca(p: PalavraDoMundo): string[] {
  const outras = parecidasDe(p).filter((x) => x !== p.palavra);
  return [outras[0], p.palavra, ...outras.slice(1, 4)].filter(Boolean);
}

/**
 * Passo 4: as letras da palavra para montar, em ordem alfabética (fixa, nunca
 * sorteada). Se a ordem alfabética for a própria palavra (ex.: OI), vira de
 * trás para frente — senão não há o que montar.
 */
export function letrasParaMontar(palavra: string): string[] {
  const letras = [...palavra].sort((a, b) => a.localeCompare(b, 'pt-BR') || (a < b ? -1 : a > b ? 1 : 0));
  return letras.join('') === palavra && letras.length > 1 ? letras.reverse() : letras;
}

/** A letra digitada vale pela de cima? Acento conta; maiúscula e minúscula, não. */
export function mesmaLetra(certa: string, tocada: string): boolean {
  return certa.toLocaleUpperCase('pt-BR') === tocada.toLocaleUpperCase('pt-BR');
}

/**
 * No teclado do computador, quem digita O para Ô ainda acertou a letra: a
 * tela completa com o acento (e mostra). Nas peças de tocar, o acento conta.
 */
export function mesmaLetraNoTeclado(certa: string, digitada: string): boolean {
  const base = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleUpperCase('pt-BR');
  return base(certa) === base(digitada);
}

/** O que se fala ao tocar: em minúsculas, para a voz não soletrar a sigla. */
export function paraFalar(s: string): string {
  return s.toLocaleLowerCase('pt-BR');
}

export interface GrupoNaTela {
  id: string;
  titulo: string;
  palavras: PalavraDoMundo[];
}

/** Os grupos da lista: os do catálogo e, por último, as palavras de quem ensina. */
export function gruposDaTela(proprias: PalavraDoMundo[]): GrupoNaTela[] {
  const grupos: GrupoNaTela[] = CATALOGO.map((g) => ({ id: g.id, titulo: g.titulo, palavras: g.palavras }));
  if (proprias.length) grupos.push({ id: 'proprias', titulo: 'Palavras de quem ensina', palavras: proprias });
  return grupos;
}

/** id da palavra na tela (marca de «feita»); as de quem ensina têm prefixo. */
export function idNaTela(p: PalavraDoMundo, propria: boolean): string {
  return `${propria ? 'propria-' : ''}${idDaPalavra(p.palavra)}`;
}
