// Gera src/conteudo/glifos.json: cada letra dos alfabetos vira um caminho
// SVG real (com furos de verdade), extraído da Cardo Bold em BUILD.
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
// Mesmos glifos dos WOFF2 locais, descompactados em TTF para opentype.js.
const caminhoFonte = new URL('./fontes/cardo-bold.ttf', import.meta.url);

const GREGAS = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψως';
const LATINAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
// algarismos: as folhas de Números (src/conteudo/numeroArte.ts)
const ALGARISMOS = '0123456789';
// maiúsculas acentuadas: as fichas de palavra de Ler o Mundo (SAÍDA, ÔNIBUS, ATENÇÃO…)
const MAIUSCULAS_ACENTUADAS = 'ÁÉÍÓÚÂÊÔÃÕÀ';
const TODAS = GREGAS + LATINAS + 'çÇãõáéíóúâêôàᾳῃῳἀἁάὰᾶ' + ALGARISMOS + MAIUSCULAS_ACENTUADAS;

function lerFonte(caminho) {
  const bytes = readFileSync(caminho);
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}
const fonte = lerFonte(caminhoFonte);

// tamanho de referência 1000; o app aplica scale() para o tamanho final
const glifos = {};
for (const letra of TODAS) {
  if (!fonte.charToGlyphIndex(letra)) throw new Error(`Cardo sem glifo: ${letra}`);
  const caminho = fonte.getPath(letra, 0, 0, 1000);
  glifos[letra] = {
    fonte: 'Cardo',
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
const atkinson = ['latin', 'latin-ext'].map(sub => lerFonte(require.resolve(
  `@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-${sub}-400-normal.woff`)));
const cardo = lerFonte(new URL('./fontes/cardo-regular.ttf', import.meta.url));
const fontePara = c => {
  if (/[\u0370-\u03ff\u1f00-\u1fff]/u.test(c)) return cardo;
  return atkinson.find(f => f.charToGlyphIndex(c)) ?? cardo;
};
const caracteres = new Set();
for (const [inicio, fim] of [[32, 126], [160, 383], [0x370, 0x3ff], [0x1f00, 0x1fff]]) {
  for (let n = inicio; n <= fim; n++) {
    const c = String.fromCodePoint(n);
    if (fontePara(c).charToGlyphIndex(c)) caracteres.add(c);
  }
}
for (const c of '–—“”‘’…•→') caracteres.add(c);
const legendas = {};
for (const c of caracteres) {
  const fonteLegendas = fontePara(c);
  if (!fonteLegendas.charToGlyphIndex(c)) throw new Error(`Sem glifo nas fontes da identidade: ${c}`);
  const p = fonteLegendas.getPath(c, 0, 0, 1000);
  legendas[c] = { fonte: fonteLegendas === cardo ? 'Cardo' : 'Atkinson Hyperlegible', d: p.toPathData(1), adv: fonteLegendas.getAdvanceWidth(c, 1000) };
}
writeFileSync(new URL('../src/conteudo/glifos-legendas.json', import.meta.url), JSON.stringify(legendas));
console.log(`ok: ${Object.keys(legendas).length} caracteres para legendas vetoriais`);

// Letras das folhas geradas (src/geradores/): além da Atkinson das legendas,
// a Cardo e a OpenDyslexic, para quem ensina escolher. Só o latim que as
// folhas usam; o que faltar numa fonte cai na Atkinson (marcado em `fonte`).
// Derivado ignorado pelo git, como as legendas.
const opendyslexic = (() => {
  const bytes = readFileSync(new URL('../src/fontes/opendyslexic-400.woff', import.meta.url));
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
})();
const latim = new Set();
for (const [inicio, fim] of [[32, 126], [160, 255]]) for (let n = inicio; n <= fim; n++) latim.add(String.fromCodePoint(n));
for (const c of '–—“”‘’…•→×÷') latim.add(c);
const ler = (caminho) => {
  const bytes = readFileSync(caminho);
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
};
const atk = (peso) => ler(require.resolve(`@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-${peso}.woff`));
// negrito e itálico de verdade (2026-11-18, pedido do Bruno para as capas):
// nada de engrossar o traço nem inclinar a letra quando a fonte tem a variante
const variantes = [
  ['cardo', cardo],
  ['opendyslexic', opendyslexic],
  ['atkinson-negrito', atk('700-normal')],
  ['atkinson-italico', atk('400-italic')],
  ['cardo-negrito', ler(new URL('./fontes/cardo-bold.ttf', import.meta.url))],
  ['cardo-italico', ler(new URL('./fontes/cardo-italic.ttf', import.meta.url))],
  ['opendyslexic-negrito', ler(new URL('../src/fontes/opendyslexic-700.woff', import.meta.url))],
  ['opendyslexic-italico', ler(new URL('../src/fontes/opendyslexic-400i.woff', import.meta.url))],
];
const letrasDasFolhas = {};
for (const [nome, fonte] of variantes) {
  const tabela = {};
  for (const c of latim) {
    const propria = fonte.charToGlyphIndex(c) ? fonte : atkinson.find(f => f.charToGlyphIndex(c));
    if (!propria) continue;
    const p = propria.getPath(c, 0, 0, 1000);
    tabela[c] = { d: p.toPathData(1), adv: Math.round(propria.getAdvanceWidth(c, 1000) * 10) / 10, ...(propria === fonte ? {} : { fonte: 'Atkinson Hyperlegible' }) };
  }
  letrasDasFolhas[nome] = tabela;
}
writeFileSync(new URL('../src/geradores/letras.json', import.meta.url), JSON.stringify(letrasDasFolhas));
console.log(`ok: letras das folhas (${variantes.map(([n]) => n).join(', ')}; ${latim.size} caracteres cada)`);
