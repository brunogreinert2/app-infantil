// Matemática de recortar: material dourado, frações em barra e em círculo,
// quadro de valor posicional e tangram. Medidas em milímetros de verdade
// (o Bruno conferiu a régua impressa: bate no milímetro).

import { TINTA, escrever, folhaNua, mm, n } from './comum';
import { cabecalho, type Folha } from './jogosDeMesa';

const Y0 = 28; // mm: depois do cabeçalho

/** Retângulo em mm, com grade interna fina de `passo` mm. */
function bloco(x: number, y: number, w: number, h: number, passo = 10): string {
  let d = '';
  for (let i = passo; i < w - 0.01; i += passo) d += `M${n(mm(x + i))} ${n(mm(y))}V${n(mm(y + h))}`;
  for (let i = passo; i < h - 0.01; i += passo) d += `M${n(mm(x))} ${n(mm(y + i))}H${n(mm(x + w))}`;
  return (
    (d ? `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${n(mm(0.25))}"/>` : '') +
    `<rect x="${n(mm(x))}" y="${n(mm(y))}" width="${n(mm(w))}" height="${n(mm(h))}" fill="none" stroke="${TINTA}" stroke-width="${n(mm(0.6))}"/>`
  );
}

/**
 * Material dourado em papel: uma placa (100 × 100 mm = 100 cubinhos), sete
 * barras (10 × 100 mm = 10 cubinhos) e cubinhos de 10 mm.
 */
export function svgMaterialDouradoA4(): string {
  let corpo = cabecalho('Material dourado', 'Recorte nas linhas grossas. Placa = 100, barra = 10, cubinho = 1. Colar em cartolina ajuda.');
  corpo += bloco(0, Y0, 100, 100);
  for (let i = 0; i < 7; i++) corpo += bloco(110 + i * 11, Y0, 10, 100);
  for (let l = 0; l < 12; l++) for (let c = 0; c < 17; c++) corpo += bloco(c * 11, Y0 + 108 + l * 10.6, 10, 10);
  return folhaNua('Material dourado', corpo);
}

/** Fração escrita como na escola: numerador em cima, traço, denominador embaixo. */
function fracao(num: number, den: number, cx: number, cy: number, tam: number): string {
  if (den === 1) return escrever('1', cx, cy + tam * 0.36, tam * 1.1, 'middle');
  const largura = tam * (String(den).length * 0.62 + 0.3);
  return (
    escrever(String(num), cx, cy - tam * 0.18, tam, 'middle') +
    `<path d="M${n(cx - largura / 2)} ${n(cy)}H${n(cx + largura / 2)}" stroke="${TINTA}" stroke-width="${n(tam * 0.07)}"/>` +
    escrever(String(den), cx, cy + tam * 0.86, tam, 'middle')
  );
}

const PARTES = [1, 2, 3, 4, 5, 6, 8, 10, 12];

/** Muro das frações: barras de 180 mm divididas em 1, 2, 3, 4, 5, 6, 8, 10 e 12 partes. */
export function svgFracoesBarrasA4(): string {
  let corpo = cabecalho('Frações em barras', 'Todas as barras têm o mesmo tamanho: compare as partes. Recorte nas linhas.');
  const x = 5;
  const w = 180;
  const h = 24;
  PARTES.forEach((partes, i) => {
    const y = Y0 + i * (h + 2.5);
    let d = '';
    for (let k = 1; k < partes; k++) d += `M${n(mm(x + (w / partes) * k))} ${n(mm(y))}V${n(mm(y + h))}`;
    corpo += `<rect x="${n(mm(x))}" y="${n(mm(y))}" width="${n(mm(w))}" height="${n(mm(h))}" fill="none" stroke="${TINTA}" stroke-width="${n(mm(0.6))}"/>`;
    if (d) corpo += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${n(mm(0.45))}"/>`;
    const tam = mm(partes >= 10 ? 4.4 : 5.5);
    for (let k = 0; k < partes; k++) corpo += fracao(1, partes, mm(x + (w / partes) * (k + 0.5)), mm(y + h / 2), tam);
  });
  return folhaNua('Frações em barras', corpo);
}

/** Círculos de 72 mm divididos em 2, 3, 4, 5, 6 e 8 partes, com a fração em cada fatia. */
export function svgFracoesCirculosA4(): string {
  let corpo = cabecalho('Frações em círculos', 'Recorte os círculos e depois as fatias. Junte fatias para formar o inteiro.');
  const r = 36;
  [2, 3, 4, 5, 6, 8].forEach((partes, i) => {
    const cx = 47.5 + (i % 2) * 95;
    const cy = Y0 + 39 + Math.floor(i / 2) * 78;
    corpo += `<circle cx="${n(mm(cx))}" cy="${n(mm(cy))}" r="${n(mm(r))}" fill="none" stroke="${TINTA}" stroke-width="${n(mm(0.6))}"/>`;
    let d = '';
    for (let k = 0; k < partes; k++) {
      const a = (k / partes) * Math.PI * 2 - Math.PI / 2;
      d += `M${n(mm(cx))} ${n(mm(cy))}L${n(mm(cx + Math.cos(a) * r))} ${n(mm(cy + Math.sin(a) * r))}`;
      const meio = a + Math.PI / partes;
      corpo += fracao(1, partes, mm(cx + Math.cos(meio) * r * 0.6), mm(cy + Math.sin(meio) * r * 0.6), mm(partes > 6 ? 4.2 : 5.4));
    }
    corpo += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${n(mm(0.45))}"/>`;
  });
  return folhaNua('Frações em círculos', corpo);
}

/** Quadro de valor posicional (UM, C, D, U) com linhas para escrever números. */
export function svgValorPosicionalA4(op: { ordens?: 3 | 4 | 6 } = {}): string {
  const todas = [
    { sigla: 'CM', nome: 'centena de milhar' },
    { sigla: 'DM', nome: 'dezena de milhar' },
    { sigla: 'UM', nome: 'unidade de milhar' },
    { sigla: 'C', nome: 'centena' },
    { sigla: 'D', nome: 'dezena' },
    { sigla: 'U', nome: 'unidade' },
  ];
  const colunas = todas.slice(6 - (op.ordens ?? 4));
  let corpo = cabecalho('Quadro de valor posicional', 'Escreva cada algarismo na sua casa. Do lado, o número por extenso ou desenhado.');
  const w = 704 / colunas.length;
  const y0 = 128;
  const linha = 82;
  colunas.forEach((c, i) => {
    const x = 48 + i * w;
    corpo += `<rect x="${n(x)}" y="${y0}" width="${n(w)}" height="96" fill="#d9d9d9" stroke="${TINTA}" stroke-width="2"/>`;
    corpo += escrever(c.sigla, x + w / 2, y0 + 48, 40, 'middle');
    corpo += escrever(c.nome, x + w / 2, y0 + 80, 15, 'middle', w - 10);
  });
  let d = '';
  for (let i = 0; i <= colunas.length; i++) d += `M${n(48 + i * w)} ${y0 + 96}V${y0 + 96 + linha * 10}`;
  for (let l = 1; l <= 10; l++) d += `M48 ${y0 + 96 + l * linha}H752`;
  corpo += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="2"/>`;
  return folhaNua('Quadro de valor posicional', corpo);
}

/**
 * Tangram de 160 mm: as sete peças clássicas, numeradas. Peças pequenas
 * (1/16 da área), média, paralelogramo e quadrado (1/8), grandes (1/4).
 */
export function svgTangramA4(): string {
  let corpo = cabecalho('Tangram', 'Recorte as sete peças. Com todas elas, sem sobrepor, monte figuras: casa, gato, barco, pessoa.');
  const L = 160;
  const ox = (190 - L) / 2;
  const oy = Y0 + 8;
  const P = (x: number, y: number) => `${n(mm(ox + x * L))} ${n(mm(oy + y * L))}`;
  const pecas: Array<{ pontos: Array<[number, number]>; nome: string }> = [
    { pontos: [[0, 0], [1, 0], [0.5, 0.5]], nome: '1' }, // grande de cima
    { pontos: [[0, 0], [0.5, 0.5], [0, 1]], nome: '2' }, // grande da esquerda
    { pontos: [[1, 0], [1, 0.5], [0.75, 0.25]], nome: '3' }, // pequeno
    { pontos: [[0.75, 0.25], [1, 0.5], [0.75, 0.75], [0.5, 0.5]], nome: '4' }, // quadrado
    { pontos: [[0.5, 0.5], [0.75, 0.75], [0.25, 0.75]], nome: '5' }, // pequeno
    { pontos: [[0.25, 0.75], [0.75, 0.75], [0.5, 1], [0, 1]], nome: '6' }, // paralelogramo
    { pontos: [[1, 0.5], [1, 1], [0.5, 1]], nome: '7' }, // médio
  ];
  for (const p of pecas) {
    corpo += `<path d="M${p.pontos.map(([x, y]) => P(x, y)).join('L')}Z" fill="#ffffff" stroke="${TINTA}" stroke-width="${n(mm(0.7))}" stroke-linejoin="round"/>`;
    const cx = p.pontos.reduce((s, [x]) => s + x, 0) / p.pontos.length;
    const cy = p.pontos.reduce((s, [, y]) => s + y, 0) / p.pontos.length;
    corpo += escrever(p.nome, mm(ox + cx * L), mm(oy + cy * L) + mm(2.2), mm(7), 'middle');
  }
  corpo += escrever('Peças: 2 triângulos grandes, 1 médio, 2 pequenos, 1 quadrado e 1 paralelogramo.', 400, mm(oy + L + 12), 18, 'middle', 704);
  return folhaNua('Tangram', corpo);
}

export type ModeloRecortar = 'dourado' | 'barras' | 'circulos' | 'posicional' | 'tangram';

export function folhasDeRecortar(modelo: ModeloRecortar, ordens: 3 | 4 | 6 = 4): Folha[] {
  switch (modelo) {
    case 'dourado':
      return [{ titulo: 'Material dourado', svg: svgMaterialDouradoA4() }];
    case 'barras':
      return [{ titulo: 'Frações em barras', svg: svgFracoesBarrasA4() }];
    case 'circulos':
      return [{ titulo: 'Frações em círculos', svg: svgFracoesCirculosA4() }];
    case 'posicional':
      return [{ titulo: 'Quadro de valor posicional', svg: svgValorPosicionalA4({ ordens }) }];
    case 'tangram':
      return [{ titulo: 'Tangram', svg: svgTangramA4() }];
  }
}
