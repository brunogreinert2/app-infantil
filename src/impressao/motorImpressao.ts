// Motor de impressão. Regra da casa (feedback de teste real): SEMPRE
// projetado para A4 — nada de conteúdo quebrando em várias páginas.
//
// imprimirDocumento é o núcleo genérico (iframe oculto + print), usado
// pelo desenho de colorir (A4 paisagem) e pelas tabelas de referência
// (A4 retrato, ver tabelas.ts).
// Próximo passo (spec 8.3): quando houver traços de pincel, compor
// base colorida + pincel em escala de cinza, com toggle "imprimir em cores".

import { derivarContornoPB } from '../canvas/camadaBase';

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
<html lang="pt-BR"><head><meta charset="utf-8"><title>${titulo}</title>
<style>${css}</style></head>
<body>${corpoHtml}</body></html>`);
  doc.close();

  iframe.contentWindow!.focus();
  iframe.contentWindow!.print();
  setTimeout(() => iframe.remove(), 60_000);
}

export function imprimirParaColorir(svgFonte: string, titulo: string): void {
  // orientação segue a proporção da arte: cena paisagem / pôster retrato
  const vb = svgFonte.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  const retrato = vb ? Number(vb[2]) > Number(vb[1]) : false;
  imprimirDocumento(
    titulo,
    `<h1>${titulo}</h1>${derivarContornoPB(svgFonte)}`,
    `@page { size: A4 ${retrato ? 'portrait' : 'landscape'}; margin: 10mm; }
     html, body { margin: 0; padding: 0; }
     body { font-family: sans-serif; }
     h1 { font-size: 16px; text-align: center; margin: 0 0 5mm; }
     svg { display: block; margin: 0 auto; height: ${retrato ? '250mm' : '150mm'}; width: auto; max-width: 100%; page-break-inside: avoid; }`,
  );
}
