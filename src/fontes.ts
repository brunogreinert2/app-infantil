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
//   opendyslexic-*.woff        build 2.001 · 233 glifos · SEM grego
//                              letras mais justas e encorpadas — é o desenho
//                              que este app usa e que o Bruno quer manter
//   opendyslexic-grego-*.woff2 build 0.920 · 1927 glifos · COM grego
//                              letras mais finas e bem mais espaçadas
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
// navegador escolhe por caractere. Texto em português continua byte a byte com
// o mesmo desenho de antes; só o grego passa a vir do build que o tem. E o
// arquivo grego (115 KB) só é baixado quando aparece um caractere grego na
// tela — ou seja, praticamente só no livro do alfabeto.
//
// Se um dia entrar hebraico, medir antes: nenhum dos dois builds o cobre.
// ---------------------------------------------------------------------------

import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';

import odRegular from './fontes/opendyslexic-400.woff?url';
import odBold from './fontes/opendyslexic-700.woff?url';
import odItalic from './fontes/opendyslexic-400i.woff?url';
import odBoldItalic from './fontes/opendyslexic-700i.woff?url';
import odGregoRegular from './fontes/opendyslexic-grego-400.woff2?url';
import odGregoBold from './fontes/opendyslexic-grego-700.woff2?url';

// Grego e copta (U+0370–03FF) + grego estendido/politônico (U+1F00–1FFF).
const FAIXA_GREGA = 'U+0370-03FF, U+1F00-1FFF';

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
/* Só grego, e declaradas por último: para um caractere grego as duas faces
   casam, e o algoritmo do CSS fica com a última. */
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${odGregoRegular}') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
  unicode-range: ${FAIXA_GREGA};
}
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${odGregoBold}') format('woff2');
  font-weight: 700; font-style: normal; font-display: swap;
  unicode-range: ${FAIXA_GREGA};
}`;
document.head.appendChild(estilo);

export const PILHAS_DE_FONTE: Record<string, string> = {
  padrao: "'Segoe UI', system-ui, -apple-system, sans-serif",
  hyperlegible: "'Atkinson Hyperlegible', 'Segoe UI', system-ui, sans-serif",
  dyslexic: "'OpenDyslexic', 'Segoe UI', system-ui, sans-serif",
};
