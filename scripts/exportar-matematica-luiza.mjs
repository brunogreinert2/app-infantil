// Folhas de matemática da oficina para a revisão da Luiza (36 folhas A4 numa página só).
//   node scripts/exportar-matematica-luiza.mjs <pasta>   → <pasta>/folhas.html (imprimir em PDF) e lista.txt
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const destino = process.argv[2];
mkdirSync(destino, { recursive: true });
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const c = await server.ssrLoadModule('/src/geradores/contas.ts');
  const l = await server.ssrLoadModule('/src/geradores/logica.ts');
  const r = await server.ssrLoadModule('/src/geradores/recortar.ts');
  const m = await server.ssrLoadModule('/src/geradores/matematica.ts');
  const p = await server.ssrLoadModule('/src/geradores/papeis.ts');
  const horas = m.lerHoras('7:00\n7:15\n12:30\n3:45\n9:10\n6:50');
  const contas = (operacao, algarismos, reagrupar) =>
    c.gerarContas({ operacao, algarismos, reagrupar, quantas: operacao === '/' ? 10 : 12 });
  const par = (lista, rotulo) => {
    const [conta, resp] = c.svgContasA4(lista, { respostas: true });
    return [[rotulo, conta.svg], [rotulo + ' — respostas', resp.svg]];
  };
  const sud4 = l.gerarSudoku(4), sud6 = l.gerarSudoku(6), sudF = l.gerarSudoku(4, 1);
  const curva = { a: 1, b: -2, c: -3 };
  const folhas = [
    ...par(contas('+', 2, false), 'Adição sem vai-um (2 algarismos)'),
    ...par(contas('+', 3, true), 'Adição com vai-um (3 algarismos)'),
    ...par(contas('-', 3, true), 'Subtração com empresta (3 algarismos)'),
    ...par(contas('x', 2, false), 'Multiplicação (2 algarismos)'),
    ...par(contas('/', 2, false), 'Divisão (2 algarismos)'),
    ['Tabuada do 7', c.svgTabuadaA4(7)],
    ['Tabuada do 7 — para completar', c.svgTabuadaA4(7, { completar: true })],
    ['Tábua de Pitágoras', c.svgTabuaA4()],
    ['Tábua de Pitágoras — para completar', c.svgTabuaA4({ completar: true })],
    ['Material dourado', r.svgMaterialDouradoA4()],
    ['Frações em barras', r.svgFracoesBarrasA4()],
    ['Frações em círculos', r.svgFracoesCirculosA4()],
    ['Valor posicional (4 ordens)', r.svgValorPosicionalA4({ ordens: 4 })],
    ['Valor posicional (6 ordens)', r.svgValorPosicionalA4({ ordens: 6 })],
    ['Tangram', r.svgTangramA4()],
    ['Reta numérica 0 a 20', m.svgRetasA4({ de: 0, ate: 20, semNumeroDesde: 3 })],
    ['Reta com negativos', m.svgRetasA4({ de: -10, ate: 10 })],
    ['Relógios — ler a hora', m.svgRelogiosA4(horas)[0].svg],
    ['Relógios — marcar a hora', m.svgRelogiosA4(horas, { modo: 'marcar' })[0].svg],
    ['Relógio de montar', m.svgRelogioDeMontarA4()],
    ['Plano cartesiano', p.svgPlanoCartesianoA4()],
    ['Parábola x² − 2x − 3 — respostas com Bhaskara', p.svgPlanoCartesianoA4({ curva, respostas: true })],
    ['Quadriculado 10 mm', p.svgQuadriculadoA4()],
    ['Milimetrado', p.svgMilimetradoA4()],
    ['Réguas de recortar', p.svgReguasA4()],
    ['Sudoku 4 × 4', l.svgSudokuA4(sud4)],
    ['Sudoku 4 × 4 — respostas', l.svgSudokuA4(sud4, { respostas: true })],
    ['Sudoku 4 × 4 com figuras', l.svgSudokuA4(sudF, { figuras: true })],
    ['Sudoku 6 × 6', l.svgSudokuA4(sud6)],
    ['Sudoku 6 × 6 — respostas', l.svgSudokuA4(sud6, { respostas: true })],
    ['Calendário do mês', p.svgCalendarioA4({ ano: 2026, mes: 12, modelo: 'anotar' })],
  ];
  const paginas = folhas
    .map(([, svg]) => `<section>${svg.replace('<svg ', '<svg width="210mm" height="297mm" ')}</section>`)
    .join('\n');
  writeFileSync(
    join(destino, 'folhas.html'),
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Matemática da oficina</title>
<style>@page{size:A4;margin:0}html,body{margin:0}section{width:210mm;height:297mm;page-break-after:always;overflow:hidden}section:last-child{page-break-after:auto}svg{display:block}</style>
${paginas}</html>`,
  );
  writeFileSync(join(destino, 'lista.txt'), folhas.map(([t], i) => `${i + 1}. ${t}`).join('\n'));
  console.log(folhas.length, 'folhas');
  console.log(p.passosBhaskara(curva).join('\n'));
} finally {
  await server.close();
}
