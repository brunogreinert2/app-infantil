// Gera a prancha essencial de CAA em HTML pronto para imprimir (duas versões:
// com as cores das categorias e tracejada para recortar). Para virar PDF, abrir
// no navegador e imprimir, ou usar o Chromium sem janela (docs/CAA.md).
//   node scripts/exportar-prancha.mjs <pasta>
import { createServer } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const destino = process.argv[2] ?? 'prancha-exportada';
mkdirSync(destino, { recursive: true });
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { htmlDoConjunto } = await server.ssrLoadModule('/src/caa/impressaoCaa.ts');
  const { conjuntoEssencial } = await server.ssrLoadModule('/src/caa/padrao.ts');
  const pagina = `@page { size: A4 portrait; margin: 10mm; } html, body { margin: 0; }
    @font-face { font-family: 'Atkinson Hyperlegible'; src: local('Atkinson Hyperlegible'); }`;
  for (const [nome, op] of [['cores', { cores: true, recortar: false }], ['recortar', { cores: false, recortar: true }]]) {
    const { corpo, css } = htmlDoConjunto(conjuntoEssencial(), op);
    const arquivo = join(destino, `prancha-essencial-${nome}.html`);
    writeFileSync(arquivo, `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Prancha de comunicação</title><style>${pagina}${css}</style>${corpo}</html>`);
    console.log(arquivo);
  }
} finally {
  await server.close();
}
