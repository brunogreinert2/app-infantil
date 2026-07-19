// Motor de impressão — v0: livro de colorir clássico (contorno P&B),
// reaproveitando o padrão de impressão por unidade do rolo.html.
// Próximo passo (spec 8.3): quando houver traços de pincel, compor
// base colorida + pincel em escala de cinza, com toggle "imprimir em cores".

import { derivarContornoPB } from '../canvas/camadaBase';

export function imprimirParaColorir(svgFonte: string, titulo: string): void {
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
<html lang="pt-BR"><head><meta charset="utf-8"><title>${titulo}</title>
<style>
  /* Sempre com A4 paisagem em mente (feedback de teste real: o desenho
     quebrava em 3 páginas). Título + desenho cabem juntos numa página só. */
  @page { size: A4 landscape; margin: 10mm; }
  html, body { margin: 0; padding: 0; }
  body { font-family: sans-serif; }
  h1 { font-size: 16px; text-align: center; margin: 0 0 5mm; }
  svg { display: block; margin: 0 auto; height: 150mm; width: auto; max-width: 100%; page-break-inside: avoid; }
</style></head>
<body><h1>${titulo}</h1>${derivarContornoPB(svgFonte)}</body></html>`);
  doc.close();

  iframe.contentWindow!.focus();
  iframe.contentWindow!.print();
  setTimeout(() => iframe.remove(), 60_000);
}
