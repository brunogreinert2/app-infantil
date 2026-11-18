// Coordenação motora (tesoura e traçado), HQ em branco e o "salva-vidas" de
// quem ensina: crachás, marcadores de página e etiquetas de caderno.

import { TINTA, escrever, folha, folhaNua, mm, n, negrito, textoSeguro } from './comum';
import { cabecalho, face, paginar, type Folha } from './jogosDeMesa';

// ---------------------------------------------------------------------------
// Tesoura: faixas com um tipo de corte cada, do mais fácil ao mais difícil
// ---------------------------------------------------------------------------

function onda(y: number, altura: number, voltas: number): string {
  let d = `M48 ${y}`;
  const passo = 704 / (voltas * 2);
  for (let i = 0; i < voltas * 2; i++) d += `q${n(passo / 2)} ${i % 2 ? altura : -altura} ${n(passo)} 0`;
  return d;
}

export function svgTesouraA4(): string {
  let corpo = cabecalho('Treino de tesoura', 'Corte em cima da linha, de um lado ao outro. Uma faixa por vez.');
  const faixas: Array<{ nome: string; d: (y: number) => string }> = [
    { nome: 'reta', d: (y) => `M48 ${y}H752` },
    { nome: 'zigue-zague', d: (y) => `M48 ${y}` + Array.from({ length: 16 }, (_, i) => `L${n(48 + (i + 1) * 44)} ${y + (i % 2 ? 0 : -36)}`).join('') },
    { nome: 'ondas', d: (y) => onda(y, 30, 5) },
    { nome: 'degraus', d: (y) => `M48 ${y + 20}` + Array.from({ length: 8 }, (_, i) => `H${n(48 + (i + 0.5) * 88)}V${i % 2 ? y + 20 : y - 20}H${n(48 + (i + 1) * 88)}`).join('') },
    { nome: 'curvas apertadas', d: (y) => onda(y, 34, 9) },
  ];
  faixas.forEach((f, i) => {
    const y = 176 + i * 150;
    corpo += escrever(f.nome, 48, y - 50, 17);
    corpo += `<path d="${f.d(y)}" fill="none" stroke="${TINTA}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    corpo += `<path d="M30 ${y + 64}H770" stroke="${TINTA}" stroke-width="1.4" stroke-dasharray="4 8"/>`;
  });
  // espiral no fim: o desafio maior
  const cx = 400;
  const cy = 990;
  let d = `M${cx} ${cy}`;
  for (let t = 0; t <= Math.PI * 6; t += 0.12) {
    const r = 6 + t * 5.6;
    d += `L${n(cx + Math.cos(t) * r * 1.6)} ${n(cy + Math.sin(t) * r * 0.9)}`;
  }
  corpo += escrever('espiral', 48, 920, 17);
  corpo += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  return folhaNua('Treino de tesoura', corpo);
}

// ---------------------------------------------------------------------------
// Traçado: caminhos pontilhados entre dois desenhos
// ---------------------------------------------------------------------------

const CAMINHOS: Array<{ de: string; ate: string; d: (x0: number, x1: number, y: number) => string }> = [
  { de: 'casa', ate: 'escola', d: (a, b, y) => `M${a} ${y}H${b}` },
  { de: 'onibus', ate: 'rua', d: (a, b, y) => `M${a} ${y}` + Array.from({ length: 8 }, (_, i) => `L${n(a + ((b - a) / 8) * (i + 1))} ${y + (i % 2 ? 0 : -40)}`).join('') },
  { de: 'fruta', ate: 'comer', d: (a, b, y) => `M${a} ${y}` + Array.from({ length: 6 }, (_, i) => `q${n((b - a) / 12)} ${i % 2 ? 46 : -46} ${n((b - a) / 6)} 0`).join('') },
  { de: 'lapis', ate: 'caderno', d: (a, b, y) => `M${a} ${y}C${a + 120} ${y - 90} ${b - 260} ${y + 90} ${(a + b) / 2} ${y}S${b - 80} ${y - 80} ${b} ${y}` },
  { de: 'agua', ate: 'feliz', d: (a, b, y) => `M${a} ${y + 30}` + Array.from({ length: 5 }, (_, i) => `V${i % 2 ? y + 30 : y - 30}h${n((b - a) / 5)}`).join('') + `V${y}` },
];

export function svgTracarA4(): string {
  let corpo = cabecalho('Siga o caminho', 'Com o lápis, vá de um desenho ao outro por cima dos pontinhos, sem tirar o lápis do papel.');
  CAMINHOS.forEach((c, i) => {
    const y = 210 + i * 186;
    corpo += face({ texto: '', figura: c.de }, 48, y - 50, 100, 100, 'figura');
    corpo += face({ texto: '', figura: c.ate }, 652, y - 50, 100, 100, 'figura');
    corpo += `<path d="${c.d(170, 630, y)}" fill="none" stroke="${TINTA}" stroke-width="6" stroke-dasharray="0.1 16" stroke-linecap="round" stroke-linejoin="round"/>`;
    corpo += `<circle cx="170" cy="${y}" r="8" fill="${TINTA}"/>`;
  });
  return folhaNua('Siga o caminho', corpo);
}

// ---------------------------------------------------------------------------
// HQ em branco
// ---------------------------------------------------------------------------

export function svgHqA4(quadros: 3 | 4 | 6 = 4, op: { linhas?: boolean } = {}): string {
  const colunas = quadros === 3 ? 1 : 2;
  const linhas = quadros / colunas;
  const comLinhas = op.linhas ?? true;
  const gap = 18;
  const topo = 186;
  const w = (704 - gap * (colunas - 1)) / colunas;
  const h = (1060 - topo - gap * (linhas - 1)) / linhas;
  let corpo = escrever('Título:', 48, 182 - 12, 20) + `<path d="M124 ${170}H752" stroke="${TINTA}" stroke-width="1.6"/>`;
  for (let i = 0; i < quadros; i++) {
    const x = 48 + (i % colunas) * (w + gap);
    const y = topo + 12 + Math.floor(i / colunas) * (h + gap);
    const escrita = comLinhas ? Math.min(78, h * 0.3) : 0;
    corpo += `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h - escrita)}" rx="10" fill="none" stroke="${TINTA}" stroke-width="4"/>`;
    if (comLinhas) {
      for (let k = 1; k <= 2; k++) corpo += `<path d="M${n(x)} ${n(y + h - escrita + k * (escrita / 2.1))}H${n(x + w)}" stroke="${TINTA}" stroke-width="1.4"/>`;
    }
    corpo += escrever(String(i + 1), x + 12, y + 26, 18);
  }
  return folha('Minha história em quadrinhos', 'Quadrinhos', corpo.replace('Título:', 'Título:'), {});
}

// ---------------------------------------------------------------------------
// Crachás, marcadores, etiquetas
// ---------------------------------------------------------------------------

/** Uma por linha; linhas vazias saem; no máximo 60. */
export function lerNomes(texto: string): string[] {
  return texto
    .split('\n')
    .map((s) => textoSeguro(s))
    .filter(Boolean)
    .slice(0, 60);
}

function moldura(x: number, y: number, w: number, h: number): string {
  return (
    `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="none" stroke="${TINTA}" stroke-width="1.6" stroke-dasharray="9 7"/>` +
    `<rect x="${n(x + 8)}" y="${n(y + 8)}" width="${n(w - 16)}" height="${n(h - 16)}" rx="12" fill="none" stroke="${TINTA}" stroke-width="3"/>`
  );
}

/** Crachás de 90 × 60 mm, oito por folha. Sem nomes: crachás em branco para escrever. */
export function svgCrachasA4(nomes: string[], linha2 = ''): Folha[] {
  const w = mm(90);
  const h = mm(60);
  const x0 = 400 - w;
  const y0 = 60;
  const lista = nomes.length ? nomes : Array<string>(8).fill('');
  return paginar(lista, 8).map((pagina, i, todas): Folha => {
    let corpo = '';
    pagina.forEach((nome, k) => {
      const x = x0 + (k % 2) * w;
      const y = y0 + Math.floor(k / 2) * h;
      corpo += moldura(x, y, w, h);
      if (nome) corpo += negrito(escrever(nome, x + w / 2, y + h / 2 + (linha2 ? 4 : 18), 54, 'middle', w - 48), 22);
      else corpo += `<path d="M${n(x + 30)} ${n(y + h / 2 + 20)}H${n(x + w - 30)}" stroke="${TINTA}" stroke-width="1.6"/>`;
      if (linha2) corpo += escrever(linha2, x + w / 2, y + h - 34, 22, 'middle', w - 48);
    });
    return { titulo: `Crachás${todas.length > 1 ? ` ${i + 1}` : ''}`, svg: folhaNua('Crachás', corpo) };
  });
}

/** Marcadores de página de 45 × 190 mm, quatro por folha, com o desenho do livro. */
export function svgMarcadoresA4(nomes: string[]): Folha[] {
  const w = mm(45);
  const h = mm(190);
  const x0 = 400 - w * 2;
  const y0 = (1131 - h) / 2;
  const lista = nomes.length ? nomes : Array<string>(4).fill('');
  return paginar(lista, 4).map((pagina, i, todas): Folha => {
    let corpo = '';
    pagina.forEach((nome, k) => {
      const x = x0 + k * w;
      corpo += moldura(x, y0, w, h);
      corpo += face({ texto: '', figura: 'livro' }, x + 30, y0 + 30, w - 60, w - 60, 'figura');
      const campos = ['Este livro é de:', 'Comecei em:', 'Parei na página:', 'Terminei em:'];
      campos.forEach((c, j) => {
        const y = y0 + w + 30 + j * 130;
        corpo += escrever(c, x + 22, y, 15, 'start', w - 44);
        if (j === 0 && nome) corpo += escrever(nome, x + 22, y + 46, 26, 'start', w - 44);
        corpo += `<path d="M${n(x + 22)} ${y + 56}H${n(x + w - 22)}" stroke="${TINTA}" stroke-width="1.4"/>`;
      });
    });
    return { titulo: `Marcadores${todas.length > 1 ? ` ${i + 1}` : ''}`, svg: folhaNua('Marcadores de página', corpo) };
  });
}

/** Etiquetas de caderno de 90 × 50 mm, dez por folha: nome, turma e matéria. */
export function svgEtiquetasA4(nomes: string[], turma = '', materia = ''): Folha[] {
  const w = mm(90);
  const h = mm(50);
  const x0 = 400 - w;
  const y0 = (1131 - h * 5) / 2;
  const lista = nomes.length ? nomes : Array<string>(10).fill('');
  return paginar(lista, 10).map((pagina, i, todas): Folha => {
    let corpo = '';
    pagina.forEach((nome, k) => {
      const x = x0 + (k % 2) * w;
      const y = y0 + Math.floor(k / 2) * h;
      corpo += moldura(x, y, w, h);
      [
        ['Nome:', nome],
        ['Turma:', turma],
        ['Matéria:', materia],
      ].forEach(([rotulo, valor], j) => {
        const yy = y + 56 + j * 52;
        corpo += escrever(rotulo, x + 24, yy, 17);
        if (valor) corpo += escrever(valor, x + 108, yy, 24, 'start', w - 132);
        corpo += `<path d="M${n(x + 104)} ${yy + 6}H${n(x + w - 24)}" stroke="${TINTA}" stroke-width="1.2"/>`;
      });
    });
    return { titulo: `Etiquetas${todas.length > 1 ? ` ${i + 1}` : ''}`, svg: folhaNua('Etiquetas de caderno', corpo) };
  });
}
