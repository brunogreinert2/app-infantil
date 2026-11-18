// Amostra das folhas do primeiro lote das sugestões (sílabas, lógica, contas,
// recortar, coordenação, cartões), em SVG, mais "lote.html" com todas.
//   node scripts/exportar-lote.mjs <pasta>
import { createServer } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const destino = process.argv[2] ?? 'lote-exportado';
mkdirSync(destino, { recursive: true });
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { fazerFolhas, pedidoInicial } = await server.ssrLoadModule('/src/geradores/pedido.ts');
  const pedidos = [];
  const variar = (tipo, campo, valores, extra = {}) => {
    for (const v of valores) pedidos.push({ ...pedidoInicial(tipo), ...extra, [campo]: v });
  };
  variar('silabas', 'modelo', ['familias', 'moveis', 'bingo', 'domino']);
  variar('logica', 'modelo', ['labirinto', 'sudoku6', 'sudokuFiguras']);
  pedidos.push({ ...pedidoInicial('logica'), modelo: 'labirinto', nivel: 'dificil' });
  variar('contas', 'operacao', ['+', '/'], { reagrupar: true, algarismos: 3 });
  variar('contas', 'modelo', ['tabuada', 'tabua']);
  variar('recortar', 'modelo', ['dourado', 'barras', 'circulos', 'posicional', 'tangram']);
  variar('motora', 'modelo', ['tesoura', 'tracar']);
  variar('cartoes', 'modelo', ['hq', 'crachas', 'marcadores', 'etiquetas'], { nomes: 'Ana\nTheo\nDavi\nLuiza', linha2: '2º ano B' });

  const nomes = [];
  pedidos.forEach((p, i) => {
    const r = fazerFolhas(p);
    // a folha de respostas, quando há, é a que mostra se o gabarito bate
    const f = r.folhas.find((x) => x.titulo.includes('respostas')) ?? r.folhas[0];
    if (!f) return;
    const nome = `${String(i).padStart(2, '0')}-${p.tipo}-${p.modelo ?? ''}`;
    writeFileSync(join(destino, `${nome}.svg`), f.svg);
    nomes.push(nome);
  });
  writeFileSync(
    join(destino, 'lote.html'),
    `<!doctype html><meta charset="utf-8"><style>body{margin:6px;display:grid;grid-template-columns:repeat(5,1fr);gap:6px;background:#bbb}img{width:100%;display:block;background:#fff}</style>` +
      nomes.map((nome) => `<img src="${nome}.svg" alt="${nome}">`).join(''),
  );
  console.log(`${nomes.length} folhas em ${destino}`);
} finally {
  await server.close();
}
