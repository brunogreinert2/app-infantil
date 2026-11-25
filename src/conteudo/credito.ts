// O CRÉDITO SOB O TÍTULO (revisão da Luiza, aprovada pelo Bruno, 2026-11-25).
// As histórias da estante são RECONTADAS: a ideia é de Esopo, dos Grimm ou de
// Andersen, mas a joaninha, o pedido de desculpa e muitos finais são nossos.
// Escrever só «Esopo» faria crer que o texto é dele. Então, na tela, aparece
// «adaptado de Esopo». Só a tradução de verdade (O Pequeno Príncipe) mostra o
// autor sem mais nada. O front matter não muda: a decisão é de exibição.

import type { Livro } from '../motor/tipos';

const AUTORAL = /^(.*?)\s*\(adaptação autoral livre\)\s*$/u;

/** O que se escreve sob o título: «adaptado de X», ou o autor, numa tradução. */
export function creditoDoAutor(m: Livro['metadados']): string {
  const autor = m.autor_original?.trim();
  if (!autor) return '';
  const autoral = autor.match(AUTORAL);
  if (autoral) return `adaptado ${contracao(autoral[1])}`;
  // tradução própria do original: o autor é o autor
  if (/tradução/iu.test(m.tradutor ?? '')) return autor;
  return `adaptado ${contracao(autor)}`;
}

/** «de Esopo», mas «dos Irmãos Grimm». */
function contracao(autor: string): string {
  return autor.startsWith('Irmãos ') ? `dos ${autor}` : `de ${autor}`;
}
