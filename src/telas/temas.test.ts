// O CONTRASTE DE CADA TEMA, medido no próprio estilos.css (2026-11-20).
//
// Não substitui o olho de ninguém: substitui o chute. Nenhum tema — nem os de
// brincar — passa por acessível sem o número ao lado (mesma regra do
// scripts/medir_contraste.py do Pedra Angular).
//
// Pisos (WCAG 2.2):
//   texto e texto suave, no fundo e no cartão ......... 7:1 (1.4.6, AAA)
//   letra do botão (cor do cartão sobre o destaque) .... 7:1 (AAA)
//   destaque no fundo (títulos, que são letra grande) .. 4,5:1 (1.4.6, AAA grande)
//   borda nos temas de enxergar melhor ................. 3:1 (1.4.11)

import { describe, expect, it } from 'vitest';
import { TEMAS } from './temas';
// @ts-expect-error -- o projeto não carrega os tipos do Node; o vitest roda no Node
import { readFileSync } from 'node:fs';

// lido do disco: o ?raw do Vite entrega o CSS vazio dentro do vitest
const css: string = readFileSync(new URL('../estilos.css', import.meta.url), 'utf8');

function luminancia(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: string, b: string): number {
  const x = luminancia(a);
  const y = luminancia(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function coresDoTema(id: string): Record<string, string> {
  const bloco = css.match(new RegExp(`\\[data-theme='${id}'\\] \\{([^}]+)\\}`));
  if (!bloco) throw new Error(`tema sem bloco no CSS: ${id}`);
  const cores: Record<string, string> = {};
  for (const m of bloco[1].matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})\b/gi)) cores[m[1]] = m[2];
  return cores;
}

describe('o contraste de cada tema (AAA)', () => {
  for (const tema of TEMAS) {
    it(`${tema.rotulo} (${tema.id})`, () => {
      const c = coresDoTema(tema.id);
      for (const fundo of ['fundo', 'cartao']) {
        expect(contraste(c.texto, c[fundo]), `texto/${fundo}`).toBeGreaterThanOrEqual(7);
        expect(contraste(c['texto-suave'], c[fundo]), `texto-suave/${fundo}`).toBeGreaterThanOrEqual(7);
      }
      expect(contraste(c.cartao, c.destaque), 'letra do botão').toBeGreaterThanOrEqual(7);
      expect(contraste(c.destaque, c.fundo), 'título').toBeGreaterThanOrEqual(4.5);
      if (tema.grupo === 'enxergar') {
        expect(contraste(c.borda, c.fundo), 'borda/fundo').toBeGreaterThanOrEqual(3);
        expect(contraste(c.borda, c.cartao), 'borda/cartao').toBeGreaterThanOrEqual(3);
      }
    });
  }

  it('os de enxergar melhor vêm primeiro e são os do Pedra Angular', () => {
    const ordem = TEMAS.map((t) => t.grupo);
    expect(ordem.indexOf('conforto')).toBeGreaterThan(ordem.lastIndexOf('enxergar'));
    expect(ordem.indexOf('brincar')).toBeGreaterThan(ordem.lastIndexOf('conforto'));
    // as mesmas cores de lá: quem usa um app reconhece o outro
    expect(coresDoTema('amarelo')).toMatchObject({ fundo: '#000000', texto: '#ffe600' });
    expect(coresDoTema('verde')).toMatchObject({ fundo: '#000000', texto: '#33ff33' });
    expect(coresDoTema('amarelo-azul')).toMatchObject({ fundo: '#001862', texto: '#ffe600' });
    expect(coresDoTema('claro')).toMatchObject({ fundo: '#ffffff', texto: '#000000' });
  });
});
