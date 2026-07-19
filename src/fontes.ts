// Fontes de acessibilidade EMBUTIDAS no bundle (zero CDN, princípio 2 da spec).
// - Atkinson Hyperlegible (Braille Institute, OFL): desenhada para baixa visão.
// - OpenDyslexic (OFL): oferecida como OPÇÃO, nunca padrão forçado — a
//   evidência científica é mista, mas a preferência subjetiva é forte (spec 5).

import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import odRegular from 'open-dyslexic/woff/OpenDyslexic-Regular.woff?url';
import odBold from 'open-dyslexic/woff/OpenDyslexic-Bold.woff?url';

const estilo = document.createElement('style');
estilo.textContent = `
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${odRegular}') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${odBold}') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}`;
document.head.appendChild(estilo);

export const PILHAS_DE_FONTE: Record<string, string> = {
  padrao: "'Segoe UI', system-ui, -apple-system, sans-serif",
  hyperlegible: "'Atkinson Hyperlegible', 'Segoe UI', system-ui, sans-serif",
  dyslexic: "'OpenDyslexic', 'Segoe UI', system-ui, sans-serif",
};
