// A tabela, a ficha individual e o caderno completo usam a MESMA arte A4.
import { gerarCadernoAlfabeto } from '../conteudo/alfabetos';
import { ID_LIVRO_NUMEROS, gerarCadernoNumeros } from '../conteudo/numeros';
import { cssCadernoA4, corpoCadernoA4, imprimirDocumento } from './motorImpressao';

function imprimirFichas(idLivro: string, ids?: string[]): void {
  const todas = idLivro === ID_LIVRO_NUMEROS ? gerarCadernoNumeros() : gerarCadernoAlfabeto(idLivro);
  const fichas = ids ? todas.filter(f => ids.includes(f.id)) : todas;
  if (!fichas.length) return;
  const titulos: Record<string, string> = {
    'alfabeto-grego': 'Historinhas - grego antigo',
    [ID_LIVRO_NUMEROS]: 'Historinhas - números',
  };
  imprimirDocumento(titulos[idLivro] ?? 'Historinhas - alfabeto e encontros', corpoCadernoA4(fichas), cssCadernoA4());
}

export function imprimirTabelaAlfabeto(idLivro: string): void { imprimirFichas(idLivro, ['tabela']); }
export function imprimirVogaisGrego(): void { imprimirFichas('alfabeto-grego', ['vogais']); }
export function imprimirVogaisLatino(): void { imprimirFichas('alfabeto', ['vogais']); }
export function imprimirCadernoAlfabeto(idLivro: string): void { imprimirFichas(idLivro); }

export function botoesTabelas(idLivro: string): Array<{ rotulo: string; acao: () => void }> {
  if (idLivro === ID_LIVRO_NUMEROS) {
    return [
      { rotulo: '🖨️ De zero a dez · 1 folha A4', acao: () => imprimirFichas(idLivro, ['tabela']) },
      { rotulo: '🖨️ Tabuada para pintar · A4', acao: () => imprimirFichas(idLivro, ['tabuada']) },
      { rotulo: '🖨️ Caderno completo · A4', acao: () => imprimirFichas(idLivro) },
    ];
  }
  if (idLivro !== 'alfabeto' && idLivro !== 'alfabeto-grego') return [];
  const grego = idLivro === 'alfabeto-grego';
  return [
    { rotulo: '🖨️ Alfabeto completo · 1 folha A4', acao: () => imprimirTabelaAlfabeto(idLivro) },
    { rotulo: grego ? '🖨️ Vogais e ditongos · A4' : '🖨️ Vogais e dígrafos · A4', acao: grego ? imprimirVogaisGrego : imprimirVogaisLatino },
    { rotulo: '🖨️ Caderno completo · A4', acao: () => imprimirCadernoAlfabeto(idLivro) },
  ];
}
