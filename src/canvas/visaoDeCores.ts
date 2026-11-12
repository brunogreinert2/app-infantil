// Simulação de visão de cores, para MEDIR (em teste) o que antes era só
// palpite: duas cores vizinhas na paleta continuam diferentes para quem tem
// protanopia, deuteranopia ou tritanopia?
//
// Matrizes de Machado, Oliveira e Fernandes (2009), severidade 1,0 — o caso
// extremo (dicromacia). Aplicadas em RGB linear. A diferença entre duas cores
// é o ΔE de 1976 no espaço CIELAB (D65): grosso modo, abaixo de ~10 duas
// cores lado a lado já pedem atenção para distinguir.
//
// É um MODELO. Não substitui uma pessoa com a condição olhando a tela, e a
// anomalia (protanomalia, deuteranomalia) é mais branda que o que se simula
// aqui. Este módulo só é importado por testes: não entra no pacote do app.

export type Visao = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export const VISOES: Visao[] = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];

type Matriz = [number, number, number][];

const MATRIZES: Record<Exclude<Visao, 'normal'>, Matriz> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

function hexParaLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
}

/** A cor como ela chega a cada tipo de visão, em RGB linear (0..1). */
export function simular(hex: string, visao: Visao): [number, number, number] {
  const rgb = hexParaLinear(hex);
  if (visao === 'normal') return rgb;
  const m = MATRIZES[visao];
  return m.map((l) =>
    Math.min(1, Math.max(0, l[0] * rgb[0] + l[1] * rgb[1] + l[2] * rgb[2])),
  ) as [number, number, number];
}

function linearParaLab([r, g, b]: [number, number, number]): [number, number, number] {
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** ΔE (CIE 1976) entre duas cores, do jeito que uma dada visão as recebe. */
export function diferenca(hexA: string, hexB: string, visao: Visao): number {
  const a = linearParaLab(simular(hexA, visao));
  const b = linearParaLab(simular(hexB, visao));
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** A menor diferença entre as quatro visões: o pior caso do par. */
export function piorDiferenca(hexA: string, hexB: string): number {
  return Math.min(...VISOES.map((v) => diferenca(hexA, hexB, v)));
}
