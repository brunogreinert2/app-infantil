// Tabelas de referência imprimíveis (A4 retrato), no estilo das tabelas
// que o Bruno usa para estudar grego: alfabeto completo em grade, e a
// tabela de vogais/ditongos. Versão latina ganha vogais + encontros do
// português. Geradas dos MESMOS dados de alfabetos.ts — uma fonte só.

import { GREGO, LATINO, type DadoLetra } from '../conteudo/alfabetos';
import { imprimirDocumento } from './motorImpressao';

const CSS_BASE = `
  @page { size: A4 portrait; margin: 12mm; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #111; }
  h1 { text-align: center; font-size: 26pt; margin: 0 0 8mm; }
  h2 { text-align: center; font-size: 15pt; margin: 6mm 0 3mm; }
  .grade { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
  .celula { text-align: center; padding: 3mm 1mm; border-radius: 3mm; page-break-inside: avoid; }
  .letras { font-size: 27pt; font-weight: bold; }
  .nome { font-size: 12pt; margin-top: 1mm; }
  .nome-sec { font-size: 12pt; color: #333; }
  .caixas { display: grid; gap: 3mm; }
  .caixa { border: 0.5mm solid #111; border-radius: 3mm; text-align: center; padding: 3mm 2mm; page-break-inside: avoid; }
  .caixa .titulo { font-size: 12pt; }
  .caixa .simbolo { font-size: 30pt; font-weight: bold; line-height: 1.15; }
  .caixa .legenda { font-size: 10.5pt; color: #222; }
  .rodape { text-align: center; font-size: 10pt; margin-top: 6mm; color: #333; }
`;

function celulaLetra(l: DadoLetra, secundario: string): string {
  const [mai, min, nome] = l;
  return `<div class="celula">
    <div class="letras">${mai} ${min}</div>
    <div class="nome">${nome}</div>
    <div class="nome-sec">${secundario}</div>
  </div>`;
}

export function imprimirTabelaAlfabeto(idLivro: string): void {
  const grego = idLivro === 'alfabeto-grego';
  const letras = grego ? GREGO : LATINO;
  const titulo = grego ? 'O Alfabeto Grego' : 'O Alfabeto';
  const celulas = letras
    .map((l) => {
      // grego: nome escrito em grego; latino: a palavra-exemplo ("de abelha")
      const secundario = grego ? (l[4] ?? '') : l[3];
      const semSigmaFinal = l[0] === 'Σ' ? (['Σ', 'σ/ς', l[2], l[3], l[4]] as DadoLetra) : l;
      return celulaLetra(semSigmaFinal, secundario);
    })
    .join('');

  imprimirDocumento(titulo, `<h1>${titulo}</h1><div class="grade">${celulas}</div>`, CSS_BASE);
}

function caixa(tituloTopo: string, simbolo: string, legenda: string): string {
  return `<div class="caixa">
    <div class="titulo">${tituloTopo}</div>
    <div class="simbolo">${simbolo}</div>
    <div class="legenda">${legenda}</div>
  </div>`;
}

// Espelho da tabela de estudo do Bruno: breves, longas, ambivalentes, ditongos.
export function imprimirVogaisGrego(): void {
  const corpo = `
    <h1>Vogais e Ditongos Gregos</h1>
    <h2>As Breves &nbsp;·&nbsp; As Longas</h2>
    <div class="caixas" style="grid-template-columns: repeat(4, 1fr);">
      ${caixa('Épsilon (ε)', 'ε', 'breve — "é" curtinho')}
      ${caixa('Ômicron (ο)', 'ο', 'breve — "ó" curtinho')}
      ${caixa('Eta (η)', 'η', 'longa — "ê" comprido')}
      ${caixa('Ômega (ω)', 'ω', 'longa — "ô" comprido')}
    </div>
    <h2>As Ambivalentes (podem ser breves ou longas)</h2>
    <div class="caixas" style="grid-template-columns: repeat(3, 1fr);">
      ${caixa('Alfa (α)', 'α', 'breve ou longa')}
      ${caixa('Iota (ι)', 'ι', 'breve ou longa')}
      ${caixa('Ípsilon (υ)', 'υ', 'breve ou longa')}
    </div>
    <h2>Os Ditongos</h2>
    <div class="caixas" style="grid-template-columns: repeat(3, 1fr);">
      ${caixa('1', 'αι', 'α + ι — exemplo: αιθερ (áither)')}
      ${caixa('2', 'ει', 'ε + ι — exemplo: εις (eis)')}
      ${caixa('3', 'οι', 'ο + ι — exemplo: οινος (oinos)')}
      ${caixa('4', 'αυ', 'α + υ — exemplo: αυτος (autos)')}
      ${caixa('5', 'ευ', 'ε + υ — exemplo: ευ (eu)')}
      ${caixa('6', 'ου', 'ο + υ — exemplo: ου (ou)')}
    </div>
    <p class="rodape">Esta tabela foca nas sete vogais gregas e nos ditongos formados por elas.</p>`;
  imprimirDocumento('Vogais e Ditongos Gregos', corpo, CSS_BASE);
}

// Versão latina: vogais do português + encontros de letras comuns.
export function imprimirVogaisLatino(): void {
  const corpo = `
    <h1>Vogais e Encontros</h1>
    <h2>As Vogais</h2>
    <div class="caixas" style="grid-template-columns: repeat(5, 1fr);">
      ${caixa('A', 'A a', 'abelha')}
      ${caixa('E', 'E e', 'elefante')}
      ${caixa('I', 'I i', 'ilha')}
      ${caixa('O', 'O o', 'ovo')}
      ${caixa('U', 'U u', 'uva')}
    </div>
    <h2>Encontros de letras (duas letras, um som)</h2>
    <div class="caixas" style="grid-template-columns: repeat(3, 1fr);">
      ${caixa('1', 'ch', 'chave, chuva')}
      ${caixa('2', 'lh', 'palhaço, ilha')}
      ${caixa('3', 'nh', 'ninho, sonho')}
      ${caixa('4', 'rr', 'carro, cachorro')}
      ${caixa('5', 'ss', 'pássaro, osso')}
      ${caixa('6', 'qu', 'queijo, quintal')}
    </div>
    <p class="rodape">Toda palavra tem pelo menos uma vogal — elas são o coração das sílabas.</p>`;
  imprimirDocumento('Vogais e Encontros', corpo, CSS_BASE);
}

// Botões extras que a tela de leitura mostra para os livros de alfabeto.
export function botoesTabelas(idLivro: string): Array<{ rotulo: string; acao: () => void }> {
  if (idLivro === 'alfabeto-grego') {
    return [
      { rotulo: '🖨️ Tabela do alfabeto', acao: () => imprimirTabelaAlfabeto(idLivro) },
      { rotulo: '🖨️ Vogais e ditongos', acao: imprimirVogaisGrego },
    ];
  }
  if (idLivro === 'alfabeto') {
    return [
      { rotulo: '🖨️ Tabela do alfabeto', acao: () => imprimirTabelaAlfabeto(idLivro) },
      { rotulo: '🖨️ Vogais e encontros', acao: imprimirVogaisLatino },
    ];
  }
  return [];
}
