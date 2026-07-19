// Parser de texto — burro de propósito (ESPECIFICACAO.md, seção 2).
// Três regras de linha, nada mais:
//   1. cabeçalho:  /^(#{1,})\s+(.*)$/  — profundidade arbitrária, sem teto de 6
//   2. imagem:     {{img:id}} numa linha própria
//   3. qualquer outra linha não vazia = parágrafo
// Linhas vazias separam parágrafos (linhas consecutivas não vazias se juntam).

import type { No } from './tipos';

const RE_CABECALHO = /^(#{1,})\s+(.*)$/;
const RE_IMAGEM = /^\{\{img:([\w-]+)\}\}$/;

export function analisar(texto: string): No[] {
  const nos: No[] = [];
  let contadorParagrafo = 0;
  let contadorCabecalho = 0;
  let contadorImagem = 0;
  let acumulado: string[] = [];

  const fecharParagrafo = () => {
    if (acumulado.length === 0) return;
    contadorParagrafo++;
    nos.push({
      tipo: 'paragrafo',
      texto: acumulado.join(' '),
      id: `p${contadorParagrafo}`,
    });
    acumulado = [];
  };

  for (const linhaBruta of texto.split(/\r?\n/)) {
    const linha = linhaBruta.trim();

    if (linha === '') {
      fecharParagrafo();
      continue;
    }

    const cab = linha.match(RE_CABECALHO);
    if (cab) {
      fecharParagrafo();
      contadorCabecalho++;
      nos.push({
        tipo: 'cabecalho',
        nivel: cab[1].length,
        texto: cab[2].trim(),
        id: `c${contadorCabecalho}`,
      });
      continue;
    }

    const img = linha.match(RE_IMAGEM);
    if (img) {
      fecharParagrafo();
      contadorImagem++;
      nos.push({ tipo: 'imagem', assetId: img[1], id: `img${contadorImagem}` });
      continue;
    }

    acumulado.push(linha);
  }
  fecharParagrafo();
  return nos;
}
