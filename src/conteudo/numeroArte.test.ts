import { describe, expect, it } from 'vitest';
import { NOMES_DOS_NUMEROS, svgNumeroA4 } from './numeroArte';

const regioes = (svg: string) => [...svg.matchAll(/id="(regiao-[^"]+)" class="colorir-alvo"/g)].map((m) => m[1]);

describe('folhas de números', () => {
  it('há folha de 0 a 10, em A4, e fora disso recusa', () => {
    for (let n = 0; n <= 10; n++) {
      const svg = svgNumeroA4(n);
      expect(svg).toContain('viewBox="0 0 800 1131"');
      expect(svg).toContain('data-folha-a4="true"');
      expect(svg).toContain(`aria-label="O número ${NOMES_DOS_NUMEROS[n]}"`);
    }
    expect(() => svgNumeroA4(11)).toThrow();
    expect(() => svgNumeroA4(2.5)).toThrow();
  });

  it('toda região pintável tem id único, e não há texto que dependa de fonte', () => {
    for (let n = 0; n <= 10; n++) {
      const svg = svgNumeroA4(n);
      const ids = regioes(svg);
      expect(new Set(ids).size, `folha ${n}`).toBe(ids.length);
      expect(svg).not.toContain('<text');
    }
  });

  it('a quantidade de bolinhas é o número: nem mais, nem menos', () => {
    for (let n = 0; n <= 10; n++) {
      const ids = regioes(svgNumeroA4(n));
      expect(ids.filter((id) => id.startsWith('regiao-bolinha-')), `folha ${n}`).toHaveLength(n);
      expect(ids.filter((id) => id.startsWith('regiao-casa-'))).toHaveLength(10);
      expect(ids.filter((id) => id.startsWith('regiao-estrela-'))).toHaveLength(10);
      expect(ids.filter((id) => id.startsWith('regiao-reta-'))).toHaveLength(11);
    }
  });

  it('o número procurado aparece duas vezes entre os seis escondidos', () => {
    for (let n = 0; n <= 10; n++) {
      const svg = svgNumeroA4(n);
      const escondidos = [...svg.matchAll(/id="regiao-busca-numero-\d"[^>]*><g lang="pt-BR" aria-label="(\d+)"/g)].map((m) => m[1]);
      expect(escondidos).toHaveLength(6);
      expect(escondidos.filter((s) => s === String(n)), `folha ${n}`).toHaveLength(2);
    }
  });
});
