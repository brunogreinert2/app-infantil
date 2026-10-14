// Gera src/conteudo/glifos.json: cada letra dos alfabetos vira um caminho
// SVG real (com furos de verdade), extraído da DejaVu Serif Bold em BUILD.
//
// Por que caminhos e não <text>: no SVG, <text> captura cliques pela caixa
// retangular inteira do caractere — o vão do "O" nunca deixaria o clique
// passar para o azulejo de trás. Caminho com furo resolve, e de quebra as
// letras ficam idênticas em qualquer aparelho (WebView Android varia fontes).
//
// Rodar: npm run gera:glifos  (só quando mudar o conjunto de letras)

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
const caminhoFonte = require.resolve('dejavu-fonts-ttf/ttf/DejaVuSerif-Bold.ttf');

const GREGAS = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψως';
const LATINAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const TODAS = GREGAS + LATINAS + 'çÇãõáéíóúâêôàᾳῃῳἀἁάὰᾶ';

function lerFonte(caminho) {
  const bytes = readFileSync(caminho);
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}
const fonte = lerFonte(caminhoFonte);

// tamanho de referência 1000; o app aplica scale() para o tamanho final
const glifos = {};
for (const letra of TODAS) {
  const caminho = fonte.getPath(letra, 0, 0, 1000);
  glifos[letra] = {
    // A otimização da opentype remove o último segmento de alguns contornos
    // porque o fill fecha implicitamente. Para letras vazadas precisamos de
    // todos os segmentos e fechamento explícito em cada subcaminho.
    d: caminho.toPathData({ decimalPlaces: 1, optimize: false, flipY: false })
      .replace(/M/g, 'ZM').replace(/^Z/, '') + 'Z',
    adv: Math.round(fonte.getAdvanceWidth(letra, 1000)),
    ...caminho.getBoundingBox(),
  };
}

const destino = new URL('../src/conteudo/glifos.json', import.meta.url);
writeFileSync(destino, JSON.stringify(glifos));
console.log(`ok: ${Object.keys(glifos).length} glifos → src/conteudo/glifos.json`);

// Legendas também são vetoriais: um SVG exportado não depende da fonte do aparelho.
// Derivado ignorado pelo git; pretest/prebuild o regeneram a partir da fonte licenciada.
const fonteLegendas = lerFonte(require.resolve('dejavu-fonts-ttf/ttf/DejaVuSans.ttf'));
const caracteres = new Set();
for (const [inicio, fim] of [[32, 126], [160, 383], [0x370, 0x3ff], [0x1f00, 0x1fff]]) {
  for (let n = inicio; n <= fim; n++) {
    const c = String.fromCodePoint(n);
    if (fonteLegendas.charToGlyphIndex(c)) caracteres.add(c);
  }
}
for (const c of '–—“”‘’…•→') caracteres.add(c);
const legendas = {};
for (const c of caracteres) {
  const p = fonteLegendas.getPath(c, 0, 0, 1000);
  legendas[c] = { d: p.toPathData(1), adv: fonteLegendas.getAdvanceWidth(c, 1000) };
}
writeFileSync(new URL('../src/conteudo/glifos-legendas.json', import.meta.url), JSON.stringify(legendas));
console.log(`ok: ${Object.keys(legendas).length} caracteres para legendas vetoriais`);
