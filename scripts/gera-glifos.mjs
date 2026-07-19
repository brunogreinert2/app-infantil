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
const TODAS = GREGAS + LATINAS;

const fonte = opentype.parse(readFileSync(caminhoFonte).buffer);

// tamanho de referência 1000; o app aplica scale() para o tamanho final
const glifos = {};
for (const letra of TODAS) {
  const caminho = fonte.getPath(letra, 0, 0, 1000);
  glifos[letra] = {
    d: caminho.toPathData(1),
    adv: Math.round(fonte.getAdvanceWidth(letra, 1000)),
  };
}

const destino = new URL('../src/conteudo/glifos.json', import.meta.url);
writeFileSync(destino, JSON.stringify(glifos));
console.log(`ok: ${Object.keys(glifos).length} glifos → src/conteudo/glifos.json`);
