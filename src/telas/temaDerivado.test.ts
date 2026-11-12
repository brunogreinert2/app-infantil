import { describe, expect, it } from 'vitest';
import { MATIZES, contraste, fundoLegivel } from '../canvas/cores';
import { derivarPaleta } from './temaDerivado';

const TODAS = MATIZES.flatMap((m) => m.tons);
const FUNDOS = TODAS.filter((t) => fundoLegivel(t.cor));

describe('tema "Monte o seu"', () => {
  // todas as combinações que a tela Aparência deixa escolher
  it('nenhuma combinação de fundo e cor favorita fica ilegível', () => {
    expect(FUNDOS.length).toBeGreaterThan(30);
    const ruins: string[] = [];
    for (const fundo of FUNDOS) {
      for (const favorita of TODAS) {
        const p = derivarPaleta({ fundo: fundo.cor, destaque: favorita.cor });
        const texto = contraste(p['--texto'], p['--fundo']);
        const titulo = contraste(p['--titulo'], p['--fundo']);
        const botao = contraste(p['--cartao'], p['--destaque']);
        const suave = contraste(p['--texto-suave'], p['--fundo']);
        if (texto < 7 || titulo < 4.5 || botao < 4.5 || suave < 4.5) {
          ruins.push(`${fundo.nome} + ${favorita.nome}: texto ${texto.toFixed(1)}, título ${titulo.toFixed(1)}, botão ${botao.toFixed(1)}, suave ${suave.toFixed(1)}`);
        }
      }
    }
    expect(ruins).toEqual([]);
  });

  it('os temas antigos (cores de antes dos tons) continuam legíveis', () => {
    const fundosAntigos = ['#fff6ec', '#ffe8f1', '#e8f4ff', '#eefadc', '#fdf3d8', '#efe8ff', '#1a1a2e', '#12251a', '#2b1a2e', '#0d1130', '#232323', '#3a2440'];
    const favoritasAntigas = ['#d62839', '#c2571b', '#1c7a3d', '#166b8a', '#5064eb', '#8e44ad', '#ff7ab8', '#ffd400', '#7fd4ff', '#96e46b'];
    for (const fundo of fundosAntigos) {
      for (const destaque of favoritasAntigas) {
        const p = derivarPaleta({ fundo, destaque });
        expect(contraste(p['--texto'], p['--fundo']), fundo).toBeGreaterThanOrEqual(7);
        expect(contraste(p['--titulo'], p['--fundo']), `${fundo}+${destaque}`).toBeGreaterThanOrEqual(4.5);
        expect(contraste(p['--cartao'], p['--destaque']), `${fundo}+${destaque}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
