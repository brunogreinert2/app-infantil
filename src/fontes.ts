// Fontes de acessibilidade EMBUTIDAS no bundle (zero CDN, princípio 2 da spec).
// - Atkinson Hyperlegible (Braille Institute, OFL): desenhada para baixa visão.
// - OpenDyslexic (OFL): padrão deste app por decisão do Bruno (2026-07-19,
//   revisando a spec §5) — continua trocável no 🎨.
//
// ---------------------------------------------------------------------------
// POR QUE HÁ DOIS ARQUIVOS DE OpenDyslexic AQUI
//
// Existem dois builds da mesma família, e nenhum dos dois serve sozinho:
//
//   opendyslexic-*.woff             build 2.001 · 233 glifos · só latim
//                                   letras justas e encorpadas — é o desenho
//                                   que o ecossistema adota
//   opendyslexic-suplemento-*.woff2 build 0.920 · 1927 glifos
//                                   finas e bem mais espaçadas; entra apenas
//                                   onde o 2.001 não tem o caractere
//
// O número engana: 0.920 é POSTERIOR a 2.001 (o projeto renumerou depois de
// reescrever a fonte; dá para conferir pela ferramenta de build e pelo nome da
// designer na tabela `name`). Não confiar no número — abrir o arquivo.
//
// O problema que isto resolve: cada página do livro do alfabeto é
// "## Α α — Alfa", com os caracteres gregos COMO TEXTO. Como o build 2.001 não
// tem grego e a OpenDyslexic é a fonte padrão daqui, as 24 letras gregas caíam
// numa serifada do sistema enquanto o resto da página era OpenDyslexic — justo
// as letras que o livro existe para ensinar, e justo para o Davi.
//
// A saída é `unicode-range`: as duas faces se declaram sob a MESMA família, e o
// navegador escolhe por caractere. O texto do dia a dia continua com o mesmo
// desenho de antes, caractere por caractere; só o que faltava passa a vir do
// build que o tem.
//
// Mesma montagem no app-leitura, com a mesma lista de faixas (NORMAS.md N70).
// Se um dia entrar hebraico ou árabe, medir antes: nenhum dos dois builds cobre.
// ---------------------------------------------------------------------------

import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';

import odRegular from './fontes/opendyslexic-400.woff?url';
import odBold from './fontes/opendyslexic-700.woff?url';
import odItalic from './fontes/opendyslexic-400i.woff?url';
import odBoldItalic from './fontes/opendyslexic-700i.woff?url';
import odSupRegular from './fontes/opendyslexic-suplemento-400.woff2?url';
import odSupBold from './fontes/opendyslexic-suplemento-700.woff2?url';
import cardoRegular from './fontes/cardo-regular.woff2?url';
import cardoBold from './fontes/cardo-bold.woff2?url';
// DejaVu Sans Mono (licença Bitstream Vera, livre): a monoespaçada do editor de
// anotações. Código precisa de largura fixa — é ela que faz a indentação
// alinhar e que separa l de 1 e O de 0, letras que num comando trocado custam
// uma hora de tentativa.
//
// Subconjuntada dos 3322 glifos originais para 349: ASCII, acentos do
// português, travessão e aspas curvas, setas, certo e errado. De 332 KB para
// 19 KB. O que sobrou cobre comando de Minecraft e recado de criança; se um dia
// faltar caractere, medir com fontTools antes de aumentar a faixa.
import dejavuMono from './fontes/dejavu-mono.woff2?url';

// Cardo é o PISO do ecossistema (NORMAS.md N72): a serifada canônica, que
// cobre latim com macrons, grego politônico e hebraico com niqud. Aqui ela
// entra só no fim de cada pilha, para o que as fontes escolhidas não têm —
// sem ela, o grego do livro do Davi na opção "Atkinson" (que também é só
// latim) sairia numa fonte do aparelho, diferente em cada aparelho.
//
// Restrita por unicode-range para não pesar: os 143 KB só são baixados se
// aparecer grego ou hebraico na tela.
const FAIXAS_CARDO = [
  'U+0370-03FF', // grego e copta
  'U+1F00-1FFF', // grego estendido (politônico)
  'U+0590-05FF', // hebraico com niqud
  'U+FB1D-FB4F', // hebraico, formas de apresentação
].join(', ');

// As faixas onde o build 2.001 NÃO tem o caractere e o 0.920 tem — medidas
// com fontTools, não escolhidas a olho. São 868 caracteres. A lista é a mesma
// no app-leitura e vale para toda superfície nova (NORMAS.md N70).
//
// Travessão, aspas curvas, reticências e apóstrofo ficam DE FORA de propósito:
// o 2.001 os tem, e desviá-los trocaria o desenho no meio de uma frase em
// português. Hebraico e árabe não estão em nenhum dos dois builds.
const FAIXAS_SUPLEMENTO = [
  'U+0100-024F', // latim estendido A/B — macrons do latim clássico
  'U+0370-03FF', // grego e copta
  'U+0400-052F', // cirílico e suplemento
  'U+1F00-1FFF', // grego estendido (politônico)
  'U+2020-2021', // † ‡ do aparato crítico
  'U+2070-209F', // sobrescritos e subscritos
  'U+2150-218F', // formas numéricas — algarismos romanos
  'U+2190-21FF', // setas
  'U+2200-22FF', // operadores matemáticos
  'U+27E8-27E9', // ⟨ ⟩ colchetes editoriais
].join(', ');

const estilo = document.createElement('style');
estilo.textContent = `
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${odRegular}') format('woff');
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${odBold}') format('woff');
  font-weight: 700; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${odItalic}') format('woff');
  font-weight: 400; font-style: italic; font-display: swap;
}
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${odBoldItalic}') format('woff');
  font-weight: 700; font-style: italic; font-display: swap;
}
/* Suplemento, declarado por último: para um caractere dentro das faixas as
   duas faces casam, e o algoritmo do CSS fica com a última. */
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${odSupRegular}') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
  unicode-range: ${FAIXAS_SUPLEMENTO};
}
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${odSupBold}') format('woff2');
  font-weight: 700; font-style: normal; font-display: swap;
  unicode-range: ${FAIXAS_SUPLEMENTO};
}
@font-face {
  font-family: 'Cardo';
  src: url('${cardoRegular}') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
  unicode-range: ${FAIXAS_CARDO};
}
@font-face {
  font-family: 'Cardo';
  src: url('${cardoBold}') format('woff2');
  font-weight: 700; font-style: normal; font-display: swap;
  unicode-range: ${FAIXAS_CARDO};
}
@font-face {
  font-family: 'DejaVu Mono';
  src: url('${dejavuMono}') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
}`;
document.head.appendChild(estilo);

// Toda pilha passa pelas fontes NOSSAS antes de chegar ao sistema operacional
// (NORMAS.md N72). Em "padrão" a fonte do aparelho é a escolha explícita, então
// ela vem primeiro; a Cardo entra logo atrás, para o que faltar.
export const PILHAS_DE_FONTE: Record<string, string> = {
  padrao: "'Segoe UI', system-ui, -apple-system, 'Cardo', sans-serif",
  hyperlegible: "'Atkinson Hyperlegible', 'Cardo', 'Segoe UI', system-ui, sans-serif",
  dyslexic: "'OpenDyslexic', 'Cardo', 'Segoe UI', system-ui, sans-serif",
  // Só do editor de anotações: a única pilha do app que começa monoespaçada.
  // Termina em `monospace` do sistema por último recurso, mas a nossa vem
  // primeiro — a N72 continua valendo.
  codigo: "'DejaVu Mono', 'Cardo', ui-monospace, monospace",
};
