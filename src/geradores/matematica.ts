// Folhas de matemática do dia a dia: relógios (ler e marcar a hora) e reta
// numérica. Mesma receita dos outros geradores: função pura, sem sorte.

import { TINTA, comHalo, escrever, folha, folhaNua, mm, n } from './comum';
import type { Folha } from './jogosDeMesa';

// ---------------------------------------------------------------------------
// Relógios
// ---------------------------------------------------------------------------

export interface Hora {
  h: number;
  m: number;
}

/** "7:15", "7h15", "07.15", "19h" → hora; o que não é hora some. */
export function lerHoras(texto: string): Hora[] {
  const horas: Hora[] = [];
  for (const pedaco of texto.split(/[\n,;]+/)) {
    const m = pedaco.trim().match(/^(\d{1,2})\s*(?:[:h.]\s*(\d{1,2})?)?\s*(?:min)?$/i);
    if (!m) continue;
    const h = Number(m[1]);
    const min = Number(m[2] ?? 0);
    if (h <= 23 && min <= 59) horas.push({ h, m: min });
  }
  return horas;
}

/** 7:05 (como no visor do ônibus e do celular) */
export const escreverHora = ({ h, m }: Hora): string => `${h}:${String(m).padStart(2, '0')}`;

function relogio(cx: number, cy: number, r: number, hora?: Hora): string {
  let s = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="#ffffff" stroke="${TINTA}" stroke-width="5"/>`;
  let d = '';
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180;
    const fora = r * 0.96;
    const dentro = r * (i % 5 === 0 ? 0.86 : 0.91);
    d += `M${n(cx + Math.sin(a) * dentro)} ${n(cy - Math.cos(a) * dentro)}L${n(cx + Math.sin(a) * fora)} ${n(cy - Math.cos(a) * fora)}`;
  }
  s += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="2"/>`;
  const tam = r * 0.24;
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    s += escrever(String(i), cx + Math.sin(a) * r * 0.7, cy - Math.cos(a) * r * 0.7 + tam * 0.36, tam, 'middle');
  }
  if (hora) {
    const am = (hora.m * 6 * Math.PI) / 180;
    const ah = (((hora.h % 12) + hora.m / 60) * 30 * Math.PI) / 180;
    // o ponteiro das horas é curto e grosso; o dos minutos, comprido e fino
    s += `<path d="M${n(cx)} ${n(cy)}L${n(cx + Math.sin(ah) * r * 0.46)} ${n(cy - Math.cos(ah) * r * 0.46)}" stroke="${TINTA}" stroke-width="${n(r * 0.075)}" stroke-linecap="round"/>`;
    s += `<path d="M${n(cx)} ${n(cy)}L${n(cx + Math.sin(am) * r * 0.78)} ${n(cy - Math.cos(am) * r * 0.78)}" stroke="${TINTA}" stroke-width="${n(r * 0.04)}" stroke-linecap="round"/>`;
  }
  s += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * 0.05)}" fill="${TINTA}"/>`;
  return s;
}

export interface OpcoesRelogios {
  /**
   * 'ler': o relógio tem ponteiros e a pessoa escreve a hora.
   * 'marcar': a hora está escrita e a pessoa desenha os ponteiros.
   */
  modo?: 'ler' | 'marcar';
  respostas?: boolean;
  titulo?: string;
}

/** Seis relógios por folha; no máximo doze horas. */
export function svgRelogiosA4(horas: Hora[], op: OpcoesRelogios = {}): Folha[] {
  const modo = op.modo ?? 'ler';
  const titulo = op.titulo ?? (modo === 'ler' ? 'Que horas são?' : 'Marque a hora no relógio');
  const lista = horas.slice(0, 12);
  const folhas: Folha[] = [];
  const desenhar = (respostas: boolean): void => {
    for (let i = 0; i < lista.length; i += 6) {
      let corpo = '';
      lista.slice(i, i + 6).forEach((hora, k) => {
        const cx = 224 + (k % 2) * 352;
        const cy = 300 + Math.floor(k / 2) * 290;
        const r = 108;
        corpo += relogio(cx, cy, r, modo === 'ler' || respostas ? hora : undefined);
        if (modo === 'marcar' || respostas) corpo += escrever(escreverHora(hora), cx, cy + r + 46, 34, 'middle');
        else corpo += `<path d="M${cx - 70} ${cy + r + 48}H${cx + 70}" stroke="${TINTA}" stroke-width="2.4" stroke-linecap="round"/>`;
      });
      const nome = respostas ? `${titulo} — respostas` : titulo;
      folhas.push({ titulo: nome, svg: folha(nome, 'Relógio', corpo, { nome: !respostas }) });
    }
  };
  desenhar(false);
  if (op.respostas) desenhar(true);
  return folhas;
}

/** Um relógio grande, sem ponteiros, para recortar os ponteiros e prender com um colchete. */
export function svgRelogioDeMontarA4(): string {
  let corpo = escrever('Relógio de montar', 48, 56, 26);
  corpo += escrever('Recorte os dois ponteiros e prenda no centro com um colchete ou um percevejo.', 48, 86, 16, 'start', 704);
  corpo += relogio(400, 480, 330);
  const ponteiro = (x: number, comprimento: number, largura: number, nome: string): string =>
    `<rect x="${n(x)}" y="880" width="${n(largura)}" height="${n(comprimento)}" rx="${n(largura / 2)}" fill="#ffffff" stroke="${TINTA}" stroke-width="3" stroke-dasharray="9 7"/>` +
    `<circle cx="${n(x + largura / 2)}" cy="${n(880 + comprimento - largura / 2)}" r="5" fill="${TINTA}"/>` +
    escrever(nome, x + largura + 16, 880 + comprimento / 2, 20);
  corpo += ponteiro(180, 150, 44, 'horas');
  corpo += ponteiro(460, 228, 30, 'minutos');
  return folhaNua('Relógio de montar', corpo);
}

// ---------------------------------------------------------------------------
// Reta numérica
// ---------------------------------------------------------------------------

export interface OpcoesReta {
  de?: number;
  ate?: number;
  /** quantas retas na folha (1 a 8) */
  quantas?: number;
  /** a partir de qual reta os números somem (para a pessoa completar); 0 = todas com número */
  semNumeroDesde?: number;
}

/** Retas numéricas de `de` a `ate` (no máximo 31 marcas), para recortar ou completar. */
export function svgRetasA4(op: OpcoesReta = {}): string {
  let de = Math.round(op.de ?? 0);
  let ate = Math.round(op.ate ?? 10);
  if (ate < de) [de, ate] = [ate, de];
  if (ate === de) ate = de + 1;
  if (ate - de > 30) ate = de + 30;
  const quantas = Math.min(8, Math.max(1, Math.round(op.quantas ?? 5)));
  const semDesde = op.semNumeroDesde ?? 0;
  const x0 = mm(12);
  const x1 = mm(178);
  const passo = (x1 - x0) / (ate - de);
  const tam = Math.min(30, passo * 0.62);
  let corpo = escrever(`Reta numérica de ${de} a ${ate}`.replace(/-/g, '–'), 48, 62, 26);
  for (let k = 0; k < quantas; k++) {
    const y = 170 + k * ((1040 - 170) / Math.max(quantas, 5));
    const comNumero = !semDesde || k + 1 < semDesde;
    // seta nas duas pontas: a reta continua
    corpo += `<path d="M${n(x0 - 26)} ${n(y)}H${n(x1 + 26)}M${n(x0 - 26)} ${n(y)}l12 -8M${n(x0 - 26)} ${n(y)}l12 8M${n(x1 + 26)} ${n(y)}l-12 -8M${n(x1 + 26)} ${n(y)}l-12 8" fill="none" stroke="${TINTA}" stroke-width="3.2" stroke-linecap="round"/>`;
    for (let v = de; v <= ate; v++) {
      const x = x0 + (v - de) * passo;
      const forte = v === 0 || v % 5 === 0;
      corpo += `<path d="M${n(x)} ${n(y - (forte ? 16 : 11))}V${n(y + (forte ? 16 : 11))}" stroke="${TINTA}" stroke-width="${forte ? 3.6 : 2.4}" stroke-linecap="round"/>`;
      if (comNumero) corpo += comHalo(escrever(String(v).replace('-', '–'), x, y + 22 + tam, tam, 'middle'));
    }
  }
  return folhaNua(`Reta numérica de ${de} a ${ate}`, corpo);
}
