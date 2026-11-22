import { describe, expect, it } from 'vitest';
import { TODAS_AS_PALAVRAS, fichaDePalavraPropria } from './lerOMundo';
import { svgPlacaDaPalavra } from './lerOMundoArte';
import {
  gruposDaTela,
  letrasParaMontar,
  mesmaLetra,
  mesmaLetraNoTeclado,
  opcoesDaBusca,
  paraFalar,
  pedacosDe,
} from './lerOMundoNaTela';

describe('Ler o Mundo na tela', () => {
  it('as partes formam a palavra, com sílabas ou letra por letra', () => {
    for (const p of TODAS_AS_PALAVRAS) expect(pedacosDe(p).join('')).toBe(p.palavra);
    const semSilabas = fichaDePalavraPropria({ palavra: 'Vitória' });
    expect(pedacosDe(semSilabas)).toEqual(['V', 'I', 'T', 'Ó', 'R', 'I', 'A']);
  });

  it('o «encontre» tem a palavra uma vez, em segundo, e as outras são diferentes', () => {
    for (const p of TODAS_AS_PALAVRAS) {
      const opcoes = opcoesDaBusca(p);
      expect(opcoes[1]).toBe(p.palavra);
      expect(opcoes.filter((x) => x === p.palavra)).toHaveLength(1);
      expect(opcoes.length).toBeGreaterThanOrEqual(4);
      // sempre igual: nada de sorte
      expect(opcoesDaBusca(p)).toEqual(opcoes);
    }
  });

  it('as letras para montar são as da palavra, numa ordem que não é a resposta', () => {
    for (const p of TODAS_AS_PALAVRAS) {
      const letras = letrasParaMontar(p.palavra);
      expect([...letras].sort().join('')).toBe([...p.palavra].sort().join(''));
      expect(letras.join('')).not.toBe(p.palavra);
    }
    // AMOR já está em ordem alfabética: vira de trás para frente
    expect(letrasParaMontar('AMOR').join('')).toBe('ROMA');
    expect(letrasParaMontar('OI').join('')).toBe('IO');
  });

  it('o acento conta nas peças; no teclado, O vale por Ô', () => {
    expect(mesmaLetra('Ô', 'ô')).toBe(true);
    expect(mesmaLetra('Ô', 'O')).toBe(false);
    expect(mesmaLetraNoTeclado('Ô', 'o')).toBe(true);
    expect(mesmaLetraNoTeclado('Ç', 'c')).toBe(true);
    expect(mesmaLetraNoTeclado('A', 'E')).toBe(false);
  });

  it('a voz recebe minúsculas (PARE não vira P-A-R-E)', () => {
    expect(paraFalar('ÔNIBUS')).toBe('ônibus');
  });

  it('as palavras de quem ensina entram por último, num grupo só delas', () => {
    expect(gruposDaTela([]).some((g) => g.id === 'proprias')).toBe(false);
    const grupos = gruposDaTela([fichaDePalavraPropria({ palavra: 'INTER' })]);
    expect(grupos[grupos.length - 1].id).toBe('proprias');
  });

  it('a placa da tela desenha só a moldura, com a palavra dentro', () => {
    for (const p of TODAS_AS_PALAVRAS) {
      const svg = svgPlacaDaPalavra(p);
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('viewBox=');
      expect(svg).not.toContain('Leia a palavra');
    }
  });
});
