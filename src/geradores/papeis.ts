// Papéis para imprimir: pauta (comum e ampliada), caligrafia, quadriculado,
// milimetrado, pontilhado, régua de recortar, plano cartesiano e calendário.
//
// As medidas são em milímetros de verdade (`mm()` de comum.ts) e só valem se a
// impressão sair em TAMANHO REAL (100%, sem "ajustar à página"). No iPhone o
// motor de impressão encolhe a folha (fator 0,86): lá a régua não mede certo.
//
// Área útil: 190 × 268,6 mm (a folha A4 menos 10 mm de margem em cada lado).

import { TINTA, comHalo, escrever, folhaNua, mm, n, negrito, risco, textoSeguro } from './comum';

const LARGURA_MM = 190;
const ALTURA_MM = 268.6;

/** várias linhas retas num caminho só (arquivo menor) */
function tracos(segmentos: Array<[number, number, number, number]>, grossuraMm: number, extra = ''): string {
  if (!segmentos.length) return '';
  const d = segmentos.map(([x1, y1, x2, y2]) => `M${n(mm(x1))} ${n(mm(y1))}L${n(mm(x2))} ${n(mm(y2))}`).join('');
  return `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${n(mm(grossuraMm))}"${extra}/>`;
}

// ---------------------------------------------------------------------------
// Pauta
// ---------------------------------------------------------------------------

export interface OpcoesPauta {
  /** distância entre as linhas, em mm */
  espaco?: number;
  /** grossura do traço, em mm */
  grossura?: number;
  /** linha vertical de margem à esquerda */
  margem?: boolean;
}

/**
 * Pautas prontas. A ampliada segue o caderno de pauta ampliada usado com
 * baixa visão: linhas bem afastadas e traço grosso e preto, para a linha ser
 * achada com o olho e com o lápis.
 */
export const PAUTAS = {
  comum: { espaco: 8, grossura: 0.25 },
  larga: { espaco: 10, grossura: 0.35 },
  ampliada: { espaco: 14, grossura: 0.8 },
  muitoAmpliada: { espaco: 20, grossura: 1.1 },
} satisfies Record<string, OpcoesPauta>;

export function svgPautaA4(op: OpcoesPauta = {}): string {
  const espaco = Math.max(4, op.espaco ?? PAUTAS.comum.espaco);
  const grossura = op.grossura ?? PAUTAS.comum.grossura;
  const linhas: Array<[number, number, number, number]> = [];
  for (let y = Math.max(18, espaco); y <= ALTURA_MM - 4; y += espaco) linhas.push([0, y, LARGURA_MM, y]);
  const margem = op.margem ?? true ? tracos([[22, 0, 22, ALTURA_MM]], grossura) : '';
  return folhaNua(`Pauta de ${espaco} mm`, tracos(linhas, grossura) + margem);
}

/**
 * Pauta de caligrafia: para cada linha de escrita, o teto (fino), o meio
 * (tracejado) e a base (grossa). `corpo` é a altura da letra minúscula, em mm.
 */
export function svgCaligrafiaA4(op: { corpo?: number } = {}): string {
  const corpo = Math.max(3, op.corpo ?? 6);
  const fino: Array<[number, number, number, number]> = [];
  const meio: Array<[number, number, number, number]> = [];
  const base: Array<[number, number, number, number]> = [];
  const passo = corpo * 3.6; // teto + corpo + descida + respiro
  for (let y = 14; y + corpo * 2 <= ALTURA_MM - 6; y += passo) {
    fino.push([0, y, LARGURA_MM, y]);
    meio.push([0, y + corpo, LARGURA_MM, y + corpo]);
    base.push([0, y + corpo * 2, LARGURA_MM, y + corpo * 2]);
  }
  return folhaNua(
    `Pauta de caligrafia, letra de ${corpo} mm`,
    tracos(fino, 0.2) + tracos(meio, 0.2, ` stroke-dasharray="${n(mm(2))} ${n(mm(1.6))}"`) + tracos(base, 0.5),
  );
}

// ---------------------------------------------------------------------------
// Quadriculado, milimetrado, pontilhado
// ---------------------------------------------------------------------------

function grade(ladoMm: number): { x0: number; y0: number; colunas: number; linhas: number } {
  const colunas = Math.floor(LARGURA_MM / ladoMm);
  const linhas = Math.floor(ALTURA_MM / ladoMm);
  return { x0: (LARGURA_MM - colunas * ladoMm) / 2, y0: (ALTURA_MM - linhas * ladoMm) / 2, colunas, linhas };
}

function linhasDaGrade(
  ladoMm: number,
  g: ReturnType<typeof grade>,
  quais: (i: number) => boolean,
): Array<[number, number, number, number]> {
  const s: Array<[number, number, number, number]> = [];
  const x1 = g.x0 + g.colunas * ladoMm;
  const y1 = g.y0 + g.linhas * ladoMm;
  for (let i = 0; i <= g.colunas; i++) if (quais(i)) s.push([g.x0 + i * ladoMm, g.y0, g.x0 + i * ladoMm, y1]);
  for (let i = 0; i <= g.linhas; i++) if (quais(i)) s.push([g.x0, g.y0 + i * ladoMm, x1, g.y0 + i * ladoMm]);
  return s;
}

/** Quadriculado de `lado` mm (5, 10, 20…). Ampliado: lado 20, grossura 0,8. */
export function svgQuadriculadoA4(op: { lado?: number; grossura?: number } = {}): string {
  const lado = Math.max(2, op.lado ?? 10);
  const g = grade(lado);
  return folhaNua(`Quadriculado de ${lado} mm`, tracos(linhasDaGrade(lado, g, () => true), op.grossura ?? 0.25));
}

/** Milimetrado: 1 mm fino e cinza, 5 mm médio, 10 mm preto. */
export function svgMilimetradoA4(): string {
  const g = grade(10);
  const g1 = { x0: g.x0, y0: g.y0, colunas: g.colunas * 10, linhas: g.linhas * 10 };
  const cinza = ' stroke-opacity="0.45"';
  return folhaNua(
    'Papel milimetrado',
    tracos(linhasDaGrade(1, g1, (i) => i % 5 !== 0), 0.08, cinza) +
      tracos(linhasDaGrade(1, g1, (i) => i % 5 === 0 && i % 10 !== 0), 0.16, cinza) +
      tracos(linhasDaGrade(10, g, () => true), 0.3),
  );
}

/** Pontilhado: um ponto a cada `lado` mm. */
export function svgPontilhadoA4(op: { lado?: number; ponto?: number } = {}): string {
  const lado = Math.max(3, op.lado ?? 5);
  const raio = mm((op.ponto ?? 0.5) / 2);
  const g = grade(lado);
  let d = '';
  for (let l = 0; l <= g.linhas; l++) {
    for (let c = 0; c <= g.colunas; c++) {
      const x = mm(g.x0 + c * lado);
      const y = mm(g.y0 + l * lado);
      d += `M${n(x - raio)} ${n(y)}a${n(raio)} ${n(raio)} 0 1 0 ${n(raio * 2)} 0a${n(raio)} ${n(raio)} 0 1 0 ${n(-raio * 2)} 0`;
    }
  }
  return folhaNua(`Pontilhado de ${lado} mm`, `<path d="${d}" fill="${TINTA}"/>`);
}

// ---------------------------------------------------------------------------
// Régua de recortar
// ---------------------------------------------------------------------------

function regua(yMm: number, alturaMm: number, cm: number, ampliada: boolean): string {
  const x0 = (LARGURA_MM - cm * 10) / 2;
  const curtos: Array<[number, number, number, number]> = [];
  const medios: Array<[number, number, number, number]> = [];
  const longos: Array<[number, number, number, number]> = [];
  let numeros = '';
  for (let i = 0; i <= cm * 10; i++) {
    const x = x0 + i;
    if (i % 10 === 0) {
      longos.push([x, yMm, x, yMm + alturaMm * 0.42]);
      const tam = mm(ampliada ? 6 : 4);
      const t = escrever(String(i / 10), mm(x), mm(yMm + alturaMm * 0.42) + tam * 0.95, tam, 'middle');
      numeros += ampliada ? negrito(t, 34) : t;
    } else if (i % 5 === 0) medios.push([x, yMm, x, yMm + alturaMm * 0.3]);
    else if (!ampliada) curtos.push([x, yMm, x, yMm + alturaMm * 0.18]);
  }
  const borda = `<rect x="${n(mm(x0 - 4))}" y="${n(mm(yMm))}" width="${n(mm(cm * 10 + 8))}" height="${n(mm(alturaMm))}" fill="none" stroke="${TINTA}" stroke-width="${n(mm(0.3))}" stroke-dasharray="${n(mm(2))} ${n(mm(1.5))}"/>`;
  return (
    borda +
    tracos(curtos, 0.15) +
    tracos(medios, ampliada ? 0.6 : 0.2) +
    tracos(longos, ampliada ? 1 : 0.3) +
    numeros
  );
}

/** Três réguas de 18 cm para recortar: duas comuns e uma ampliada (só cm e meio cm). */
export function svgReguasA4(): string {
  const aviso =
    escrever('Réguas para recortar no tracejado.', mm(1), mm(12), mm(5)) +
    escrever('Só medem certo se a folha for impressa em tamanho real (100%).', mm(1), mm(20), mm(4)) +
    escrever('Confira com uma régua de verdade: o traço abaixo deve medir 10 cm.', mm(1), mm(27), mm(4)) +
    tracos([[1, 33, 101, 33]], 0.5) +
    tracos([[1, 31, 1, 35], [101, 31, 101, 35]], 0.5);
  return folhaNua(
    'Réguas de recortar',
    aviso + regua(50, 26, 18, false) + regua(92, 26, 18, false) + regua(134, 40, 18, true),
  );
}

// ---------------------------------------------------------------------------
// Plano cartesiano e função do 2º grau
// ---------------------------------------------------------------------------

export interface Quadratica {
  a: number;
  b: number;
  c: number;
}

export interface ResultadoBhaskara {
  delta: number;
  /** nenhuma (delta < 0), uma (delta = 0) ou duas, em ordem crescente */
  raizes: number[];
  vertice: { x: number; y: number };
}

/** x = (-b ± raiz de Δ) / 2a, com Δ = b² - 4ac. */
export function bhaskara({ a, b, c }: Quadratica): ResultadoBhaskara {
  if (!a) throw new Error('Com a = 0 não é função do 2º grau');
  const delta = b * b - 4 * a * c;
  const vertice = { x: -b / (2 * a) + 0, y: -delta / (4 * a) + 0 };
  if (delta < 0) return { delta, raizes: [], vertice };
  if (delta === 0) return { delta, raizes: [vertice.x], vertice };
  const r = Math.sqrt(delta);
  return { delta, raizes: [(-b - r) / (2 * a), (-b + r) / (2 * a)].sort((p, q) => p - q), vertice };
}

const numero = (v: number): string =>
  Number(v.toFixed(2)).toLocaleString('pt-BR').replace('-', '–');

/** y = x² – 2x – 3 (com o traço que a letra da folha sabe desenhar) */
export function escreverQuadratica({ a, b, c }: Quadratica): string {
  const termo = (v: number, sufixo: string, primeiro: boolean): string => {
    if (!v) return '';
    const modulo = Math.abs(v) === 1 && sufixo ? '' : numero(Math.abs(v));
    return `${primeiro ? (v < 0 ? '–' : '') : v < 0 ? ' – ' : ' + '}${modulo}${sufixo}`;
  };
  const x2 = termo(a, 'x²', true);
  return `y = ${x2}${termo(b, 'x', !x2)}${termo(c, '', !x2 && !b)}`;
}

/** A conta de Bhaskara escrita passo a passo, para a folha de respostas. */
export function passosBhaskara(q: Quadratica): string[] {
  const r = bhaskara(q);
  const { a, b, c } = q;
  const p = (v: number) => (v < 0 ? `(${numero(v)})` : numero(v));
  const passos = [
    escreverQuadratica(q),
    `a = ${numero(a)}, b = ${numero(b)}, c = ${numero(c)}`,
    `Δ = b² – 4ac = ${p(b)}² – 4 · ${p(a)} · ${p(c)} = ${numero(r.delta)}`,
  ];
  if (r.raizes.length === 0) passos.push('Δ é negativo: a parábola não corta o eixo x.');
  else if (r.raizes.length === 1) passos.push(`Δ = 0: uma raiz só. x = –b / 2a = ${numero(r.raizes[0])}`);
  else {
    passos.push(`x = (–b ± raiz de Δ) / 2a = (${numero(-b)} ± raiz de ${numero(r.delta)}) / ${numero(2 * a)}`);
    passos.push(`x = ${numero(r.raizes[0])} ou x = ${numero(r.raizes[1])}`);
  }
  passos.push(`Vértice: (${numero(r.vertice.x)}; ${numero(r.vertice.y)})`);
  return passos;
}

export interface OpcoesPlano {
  /** os eixos vão de −alcance a +alcance */
  alcance?: number;
  /** lado de cada quadradinho, em mm */
  passo?: number;
  /** desenha a parábola, as raízes e o vértice */
  curva?: Quadratica;
  /** escreve a função e a conta de Bhaskara embaixo (folha de respostas) */
  respostas?: boolean;
}

export function svgPlanoCartesianoA4(op: OpcoesPlano = {}): string {
  const alcance = Math.min(20, Math.max(3, Math.round(op.alcance ?? 10)));
  const passo = Math.min(op.passo ?? 8, 180 / (alcance * 2));
  const lado = passo * alcance * 2;
  const x0 = (LARGURA_MM - lado) / 2;
  const y0 = 16;
  const cx = x0 + lado / 2;
  const cy = y0 + lado / 2;
  const px = (x: number) => mm(cx + x * passo);
  const py = (y: number) => mm(cy - y * passo);

  const finas: Array<[number, number, number, number]> = [];
  for (let i = 0; i <= alcance * 2; i++) {
    finas.push([x0 + i * passo, y0, x0 + i * passo, y0 + lado]);
    finas.push([x0, y0 + i * passo, x0 + lado, y0 + i * passo]);
  }
  let corpo = tracos(finas, 0.15, ' stroke-opacity="0.55"');
  // eixos com seta
  const s = 2.2;
  corpo += tracos(
    [
      [x0 - 3, cy, x0 + lado + 4, cy],
      [cx, y0 + lado + 3, cx, y0 - 4],
      [x0 + lado + 4, cy, x0 + lado + 4 - s, cy - s * 0.6],
      [x0 + lado + 4, cy, x0 + lado + 4 - s, cy + s * 0.6],
      [cx, y0 - 4, cx - s * 0.6, y0 - 4 + s],
      [cx, y0 - 4, cx + s * 0.6, y0 - 4 + s],
    ],
    0.5,
    ' stroke-linecap="round"',
  );
  const tam = mm(Math.min(3.4, passo * 0.42));
  const salto = passo < 5 ? 2 : 1;
  for (let v = -alcance; v <= alcance; v += salto) {
    if (v === 0) continue;
    corpo += comHalo(escrever(numero(v), px(v), py(0) + tam * 1.25, tam, 'middle'));
    corpo += comHalo(escrever(numero(v), px(0) - tam * 0.45, py(v) + tam * 0.36, tam, 'end'));
  }
  corpo += comHalo(escrever('0', px(0) - tam * 0.45, py(0) + tam * 1.25, tam, 'end'));
  corpo += escrever('x', mm(x0 + lado + 5.5), mm(cy) + tam * 1.6, tam * 1.3, 'middle');
  corpo += escrever('y', mm(cx) + tam * 1.4, mm(y0 - 3), tam * 1.3, 'middle');

  let titulo = 'Plano cartesiano';
  if (op.curva) {
    const q = op.curva;
    const r = bhaskara(q);
    titulo = `Parábola ${escreverQuadratica(q)}`;
    const f = (x: number) => q.a * x * x + q.b * x + q.c;
    const pontos: string[] = [];
    for (let i = 0; i <= 400; i++) {
      const x = -alcance + (i / 400) * alcance * 2;
      pontos.push(`${n(px(x))} ${n(py(Math.max(-alcance * 3, Math.min(alcance * 3, f(x)))))}`);
    }
    corpo += `<clipPath id="recorte-plano"><rect x="${n(mm(x0))}" y="${n(mm(y0))}" width="${n(mm(lado))}" height="${n(mm(lado))}"/></clipPath>`;
    corpo += `<path d="M${pontos.join('L')}" fill="none" stroke="${TINTA}" stroke-width="${n(mm(0.7))}" stroke-linejoin="round" clip-path="url(#recorte-plano)"/>`;
    const dentro = (x: number, y: number) => Math.abs(x) <= alcance && Math.abs(y) <= alcance;
    for (const x of r.raizes) {
      if (dentro(x, 0)) corpo += `<circle cx="${n(px(x))}" cy="${n(py(0))}" r="${n(mm(1.1))}" fill="${TINTA}"/>`;
    }
    if (dentro(r.vertice.x, r.vertice.y)) {
      corpo += `<circle cx="${n(px(r.vertice.x))}" cy="${n(py(r.vertice.y))}" r="${n(mm(1.3))}" fill="#ffffff" stroke="${TINTA}" stroke-width="${n(mm(0.5))}"/>`;
    }
    const yTexto = mm(y0 + lado + 14);
    corpo += escrever(escreverQuadratica(q), mm(x0), yTexto, mm(6));
    if (op.respostas) {
      passosBhaskara(q)
        .slice(1)
        .forEach((linha, i) => {
          corpo += escrever(linha, mm(x0), yTexto + mm(9) * (i + 1), mm(4.6), 'start', mm(lado));
        });
    }
  }
  return folhaNua(titulo, corpo);
}

// ---------------------------------------------------------------------------
// Calendário
// ---------------------------------------------------------------------------

const MESES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
const DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher, calendário gregoriano). */
export function pascoa(ano: number): { mes: number; dia: number } {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  return { mes, dia: ((h + l - 7 * m + 114) % 31) + 1 };
}

/** Feriados NACIONAIS do Brasil no mês (não inclui estaduais, municipais nem pontos facultativos). */
export function feriadosNacionais(ano: number, mes: number): Array<{ dia: number; nome: string }> {
  const fixos: Array<[number, number, string]> = [
    [1, 1, 'Confraternização Universal'],
    [4, 21, 'Tiradentes'],
    [5, 1, 'Dia do Trabalho'],
    [9, 7, 'Independência'],
    [10, 12, 'Nossa Senhora Aparecida'],
    [11, 2, 'Finados'],
    [11, 15, 'Proclamação da República'],
    [11, 20, 'Consciência Negra'],
    [12, 25, 'Natal'],
  ];
  const p = pascoa(ano);
  const sexta = new Date(Date.UTC(ano, p.mes - 1, p.dia - 2));
  fixos.push([sexta.getUTCMonth() + 1, sexta.getUTCDate(), 'Sexta-feira Santa']);
  return fixos
    .filter(([m]) => m === mes)
    .map(([, dia, nome]) => ({ dia, nome }))
    .sort((a, b) => a.dia - b.dia);
}

/** As semanas do mês, de domingo a sábado; 0 = casa vazia. */
export function semanasDoMes(ano: number, mes: number): number[][] {
  const primeiro = new Date(Date.UTC(ano, mes - 1, 1)).getUTCDay();
  const dias = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const semanas: number[][] = [];
  let semana = Array<number>(primeiro).fill(0);
  for (let d = 1; d <= dias; d++) {
    semana.push(d);
    if (semana.length === 7) {
      semanas.push(semana);
      semana = [];
    }
  }
  if (semana.length) semanas.push([...semana, ...Array<number>(7 - semana.length).fill(0)]);
  return semanas;
}

export interface OpcoesCalendario {
  ano: number;
  /** 1 a 12 */
  mes: number;
  /**
   * 'figura' (padrão): espaço no alto para uma imagem e números grandes,
   * legíveis de longe. 'anotar': a grade ocupa a folha, com lugar para escrever.
   */
  modelo?: 'figura' | 'anotar';
  /** imagem para o alto (data: PNG/JPEG); sem ela fica a moldura para desenhar ou colar */
  imagem?: string;
  /** largura ÷ altura da imagem; sem isto, a figura só preenche a moldura, centrada */
  aspecto?: number;
  /** 1 = preenche a moldura; menor mostra mais da figura; maior aproxima (0,2 a 4) */
  zoom?: number;
  /** de 0 a 100: que parte da figura aparece (50 = o meio) */
  posX?: number;
  posY?: number;
  feriados?: boolean;
}

/** A moldura da figura do calendário, nas unidades da folha. */
export const MOLDURA_DA_FIGURA = { x: 48, y: 36, w: 704, h: 420 };

/**
 * Onde a figura fica dentro da moldura. O zoom 1 cobre a moldura toda; a
 * posição diz o que sobra de cada lado (0 = encostada à esquerda/no alto).
 */
export function encaixeDaFigura(aspecto: number, zoom = 1, posX = 50, posY = 50): { x: number; y: number; w: number; h: number } {
  const m = MOLDURA_DA_FIGURA;
  const a = aspecto > 0 && Number.isFinite(aspecto) ? aspecto : 1;
  const z = Math.min(4, Math.max(0.2, Number.isFinite(zoom) ? zoom : 1));
  const cobre = Math.max(m.w / a, m.h);
  const w = a * cobre * z;
  const h = cobre * z;
  const px = Math.min(100, Math.max(0, Number.isFinite(posX) ? posX : 50)) / 100;
  const py = Math.min(100, Math.max(0, Number.isFinite(posY) ? posY : 50)) / 100;
  return { x: m.x + (m.w - w) * px, y: m.y + (m.h - h) * py, w, h };
}

/** O zoom em que a figura aparece inteira, sem cortar nada. */
export function zoomFiguraInteira(aspecto: number): number {
  const m = MOLDURA_DA_FIGURA;
  const a = aspecto > 0 && Number.isFinite(aspecto) ? aspecto : 1;
  return Math.min(m.w / a, m.h) / Math.max(m.w / a, m.h);
}

export function svgCalendarioA4(op: OpcoesCalendario): string {
  const mes = Math.min(12, Math.max(1, Math.round(op.mes)));
  const semanas = semanasDoMes(op.ano, mes);
  const feriados = op.feriados ?? true ? feriadosNacionais(op.ano, mes) : [];
  const figura = (op.modelo ?? 'figura') === 'figura';
  const titulo = `${MESES[mes - 1]} ${op.ano}`;
  let corpo = '';

  let yTitulo = 96;
  if (figura) {
    const img = op.imagem && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(op.imagem) ? op.imagem : '';
    corpo += `<clipPath id="recorte-figura"><rect x="48" y="36" width="704" height="420" rx="18"/></clipPath>`;
    if (img) {
      if (op.aspecto) {
        const e = encaixeDaFigura(op.aspecto, op.zoom, op.posX, op.posY);
        corpo += `<image href="${img}" x="${n(e.x)}" y="${n(e.y)}" width="${n(e.w)}" height="${n(e.h)}" preserveAspectRatio="none" clip-path="url(#recorte-figura)"/>`;
      } else {
        corpo += `<image href="${img}" x="48" y="36" width="704" height="420" preserveAspectRatio="xMidYMid slice" clip-path="url(#recorte-figura)"/>`;
      }
    }
    corpo += `<rect x="48" y="36" width="704" height="420" rx="18" fill="none" stroke="${TINTA}" stroke-width="2.5"${img ? '' : ' stroke-dasharray="10 8"'}/>`;
    yTitulo = 536;
  }
  corpo += negrito(escrever(titulo, 400, yTitulo, 64, 'middle', 704), 30);

  const yDias = yTitulo + 52;
  const topo = yDias + 16;
  const fundo = feriados.length ? 1052 : 1090;
  const larg = 704 / 7;
  const alt = (fundo - topo) / semanas.length;
  DIAS.forEach((d, i) => {
    corpo += negrito(escrever(d, 48 + larg * (i + 0.5), yDias, 24, 'middle'), 22);
  });
  const linhas: string[] = [];
  for (let i = 0; i <= 7; i++) linhas.push(`M${n(48 + i * larg)} ${n(topo)}V${n(fundo)}`);
  for (let i = 0; i <= semanas.length; i++) linhas.push(`M48 ${n(topo + i * alt)}H752`);
  corpo += `<path d="${linhas.join('')}" fill="none" stroke="${TINTA}" stroke-width="2.4" stroke-linecap="square"/>`;

  const tam = figura ? Math.min(58, alt * 0.6) : 38;
  semanas.forEach((semana, l) => {
    semana.forEach((dia, c) => {
      if (!dia) return;
      const x = 48 + c * larg;
      const y = topo + l * alt;
      const feriado = feriados.some((f) => f.dia === dia);
      const cxNum = figura ? x + larg / 2 : x + 14 + tam * 0.6;
      const yNum = figura ? y + alt / 2 + tam * 0.36 : y + 12 + tam * 0.74;
      const t = escrever(String(dia), cxNum, yNum, tam, 'middle');
      corpo += negrito(t, c === 0 || feriado ? 46 : 22);
      // feriado: aro em volta do número (a cor nunca é a única pista; aqui nem há cor)
      if (feriado) {
        corpo += `<circle cx="${n(cxNum)}" cy="${n(yNum - tam * 0.36)}" r="${n(tam * 0.78)}" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
      }
    });
  });
  if (feriados.length) {
    const texto = feriados.map((f) => `${f.dia}: ${f.nome}`).join(' · ');
    corpo += escrever(`Feriado nacional — ${texto}`, 400, 1086, 19, 'middle', 704);
  }
  return folhaNua(textoSeguro(titulo), corpo);
}

/** O ano inteiro numa folha: doze meses pequenos. */
export function svgCalendarioAnoA4(ano: number): string {
  let corpo = negrito(escrever(String(ano), 400, 92, 70, 'middle'), 30);
  const larg = 216;
  const alt = 236;
  for (let m = 1; m <= 12; m++) {
    const x = 48 + ((m - 1) % 3) * (larg + 28);
    const y = 130 + Math.floor((m - 1) / 3) * (alt + 6);
    corpo += negrito(escrever(MESES[m - 1], x + larg / 2, y + 24, 21, 'middle'), 24);
    const passo = larg / 7;
    DIAS.forEach((d, i) => {
      corpo += escrever(d[0], x + passo * (i + 0.5), y + 52, 15, 'middle');
    });
    corpo += risco(x, y + 59, x + larg, y + 59, 1.2);
    const feriados = feriadosNacionais(ano, m);
    semanasDoMes(ano, m).forEach((semana, l) => {
      semana.forEach((dia, c) => {
        if (!dia) return;
        const cx = x + passo * (c + 0.5);
        const yy = y + 84 + l * 27;
        const feriado = feriados.some((f) => f.dia === dia);
        const t = escrever(String(dia), cx, yy, 18, 'middle');
        corpo += c === 0 || feriado ? negrito(t, 46) : t;
        if (feriado) corpo += `<circle cx="${n(cx)}" cy="${n(yy - 6.5)}" r="13" fill="none" stroke="${TINTA}" stroke-width="1.6"/>`;
      });
    });
  }
  corpo += escrever('Domingos em letra forte. Feriados nacionais com aro.', 400, 1100, 17, 'middle');
  return folhaNua(`Calendário de ${ano}`, corpo);
}
