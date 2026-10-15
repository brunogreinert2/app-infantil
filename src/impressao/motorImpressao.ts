// Motor de impressão. Regra da casa (feedback de teste real): SEMPRE
// projetado para A4 — nada de conteúdo quebrando em várias páginas.
//
// imprimirDocumento é o núcleo genérico (iframe oculto + print), usado
// pelo desenho de colorir (A4 paisagem) e pelas tabelas de referência
// (A4 retrato, ver tabelas.ts).
// Próximo passo (spec 8.3): quando houver traços de pincel, compor
// base colorida + pincel em escala de cinza, com toggle "imprimir em cores".

import { derivarContornoPB } from '../canvas/camadaBase';
import fonteImpressao from '../fontes/opendyslexic-400.woff?url';
import fonteCardo from '../fontes/cardo-regular.woff2?url';

const FONTES_IMPRESSAO = `
  @font-face { font-family: 'Historinhas Impresso'; src: url('${fonteImpressao}') format('woff'); }
  @font-face { font-family: 'Cardo'; src: url('${fonteCardo}') format('woff2'); }
`;
export const CSS_CADERNO_A4 = `
  @page { size: A4 portrait; margin: 10mm; }
  :root { --ui-impressao-tinta: #000000; --ui-impressao-papel: #ffffff; }
  html, body { margin: 0; padding: 0; color: var(--ui-impressao-tinta); background: var(--ui-impressao-papel); }
  .folha-a4 { width: 190mm; height: 269mm; margin: 0; padding: 0; break-after: page; break-inside: avoid; line-height: 0; }
  .folha-a4:last-child { break-after: auto; }
  .folha-a4 svg { display: block; width: 190mm; height: 268.6125mm; }
`;

const escaparHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function corpoCadernoA4(folhas: Array<{titulo: string; svg: string}>): string {
  return folhas.map(f => `<section class="folha-a4" aria-label="${escaparHtml(f.titulo)}">${derivarContornoPB(f.svg)}</section>`).join('');
}

export function imprimirDocumento(titulo: string, corpoHtml: string, css: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${escaparHtml(titulo)}</title>
<style>${css}</style></head>
<body>${corpoHtml}</body></html>`);
  doc.close();

  // O documento de impressão tem seu próprio ciclo de carregamento de fontes.
  void doc.fonts.ready.then(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!iframe.isConnected) return;
      iframe.contentWindow!.focus();
      iframe.contentWindow!.print();
      setTimeout(() => iframe.remove(), 60_000);
    }));
  });
}

export function imprimirParaColorir(svgFonte: string, titulo: string): void {
  if (svgFonte.includes('data-folha-a4="true"')) {
    imprimirDocumento(titulo, corpoCadernoA4([{titulo,svg:svgFonte}]), CSS_CADERNO_A4);
    return;
  }
  // orientação segue a proporção da arte: cena paisagem / pôster retrato
  const vb = svgFonte.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  const retrato = vb ? Number(vb[2]) > Number(vb[1]) : false;
  imprimirDocumento(
    titulo,
    `<h1>${escaparHtml(titulo)}</h1>${derivarContornoPB(svgFonte)}`,
    `${FONTES_IMPRESSAO}
     @page { size: A4 ${retrato ? 'portrait' : 'landscape'}; margin: 10mm; }
     html, body { margin: 0; padding: 0; }
     body { font-family: 'Historinhas Impresso', 'Cardo'; }
     h1 { font-size: 12pt; text-align: center; margin: 0 0 5mm; }
     svg { display: block; margin: 0 auto; height: ${retrato ? '250mm' : '150mm'}; width: auto; max-width: 100%; page-break-inside: avoid; }`,
  );
}
