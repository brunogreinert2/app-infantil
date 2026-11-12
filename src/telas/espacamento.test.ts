import { describe, expect, it } from 'vitest';
import { ENTRELINHAS, ESPACAMENTOS, PESOS, naGrade, tracoDoPeso } from './espacamento';

const PASSO_FONTE = 1.125; // o mesmo de preferencias.ts

describe('espaço entre linhas e entre letras', () => {
  // Os ids e valores são os do app-leitura (ThemeDialog.tsx). Se um dia
  // mudarem, mudam nos dois apps juntos — este teste é o lembrete.
  it('mesmos ids e valores do app-leitura', () => {
    expect(ENTRELINHAS.map((e) => [e.id, e.mult])).toEqual([
      ['minima', 1.2],
      ['compacta', 1.4],
      ['normal', 1.7],
      ['ampla', 2.2],
    ]);
    expect(ESPACAMENTOS.map((e) => [e.id, e.letra, e.palavra])).toEqual([
      ['normal', 0, 0],
      ['amplo', 0.06, 0.18],
      ['muito-amplo', 0.12, 0.36],
    ]);
  });

  it('a palavra se afasta ~3x mais que a letra (senão a palavra se desmancha)', () => {
    for (const e of ESPACAMENTOS) {
      if (e.letra > 0) expect(e.palavra / e.letra).toBeCloseTo(3, 5);
    }
  });

  it('o piso da entrelinha é 1,2 (grego com sinais em cima e embaixo)', () => {
    expect(Math.min(...ENTRELINHAS.map((e) => e.mult))).toBe(1.2);
  });
});

describe('grade de pixels do aparelho', () => {
  // todos os corpos que o A−/A+ alcança, de 12 a 180
  const corpos: number[] = [];
  for (let px = 12; px <= 180; px = Math.max(px + 1, Math.round(px * PASSO_FONTE))) corpos.push(px);
  if (corpos[corpos.length - 1] !== 180) corpos.push(180);

  // 1 = monitor comum; 1,25 e 1,5 = Windows com escala; 2 e 3 = iPhone;
  // 2,625 = Android comum
  const DENSIDADES = [1, 1.25, 1.5, 2, 2.625, 3];

  it('corpo e entrelinha caem em pixel inteiro do aparelho, em toda densidade', () => {
    for (const dpr of DENSIDADES) {
      for (const px of corpos) {
        for (const pedido of [px, ...ENTRELINHAS.map((e) => px * e.mult)]) {
          const naTela = naGrade(pedido, dpr);
          const emPixelsDoAparelho = naTela * dpr;
          expect(Math.abs(emPixelsDoAparelho - Math.round(emPixelsDoAparelho))).toBeLessThan(1e-9);
          // o encaixe nunca muda o pedido em mais de meio pixel do aparelho
          expect(Math.abs(naTela - pedido)).toBeLessThanOrEqual(0.5 / dpr + 1e-9);
        }
      }
    }
  });

  it('densidade inválida não quebra', () => {
    expect(naGrade(30.6, 0)).toBe(31);
    expect(naGrade(30.6, NaN)).toBe(31);
  });
});

describe('peso da letra', () => {
  it('mesmos ids e valores do app-leitura', () => {
    expect(PESOS.map((p) => [p.id, p.pixels])).toEqual([
      ['fino', 0.02],
      ['medio', 1],
      ['grosso', 2],
    ]);
  });

  it('média e grossa dão pixel inteiro do aparelho em toda densidade', () => {
    for (const dpr of [1, 1.25, 1.5, 2, 2.625, 3]) {
      for (const [id, pixels] of [['medio', 1], ['grosso', 2]] as Array<[string, number]>) {
        expect(parseFloat(tracoDoPeso(id, dpr)) * dpr).toBeCloseTo(pixels, 2);
      }
    }
    expect(tracoDoPeso('grosso', 2)).toBe('1px');
  });

  it('a fina é um fio, nunca zero; peso desconhecido cai na fina', () => {
    expect(parseFloat(tracoDoPeso('fino', 3))).toBeGreaterThan(0);
    expect(tracoDoPeso('nao-existe', 1)).toBe(tracoDoPeso('fino', 1));
  });
});
