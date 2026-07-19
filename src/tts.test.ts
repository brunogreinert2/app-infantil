// Prova de Fogo do fatiador do TTS (o contorno do bug de fala longa do
// Chrome só funciona se NENHUM pedaço passar do limite).

import { describe, expect, it } from 'vitest';
import { fatiar } from './tts';

describe('fatiar', () => {
  it('texto curto vira um pedaço só', () => {
    expect(fatiar('Oi, tudo bem?')).toEqual(['Oi, tudo bem?']);
  });

  it('capítulo longo: nenhum pedaço passa de 240 caracteres', () => {
    const capitulo = Array.from(
      { length: 60 },
      (_, i) => `Esta é a frase número ${i} da história, com um tamanho razoável para leitura.`,
    ).join(' ');
    const pedacos = fatiar(capitulo);
    expect(pedacos.length).toBeGreaterThan(5);
    for (const p of pedacos) expect(p.length).toBeLessThanOrEqual(240);
    // nada se perde: o texto remontado contém todas as frases
    expect(pedacos.join(' ')).toContain('frase número 59');
  });

  it('frase gigante sem ponto final quebra por vírgula', () => {
    const semPonto = Array.from({ length: 40 }, (_, i) => `item ${i}`).join(', ');
    const pedacos = fatiar(semPonto);
    expect(pedacos.length).toBeGreaterThan(1);
  });

  it('vazio não explode', () => {
    expect(fatiar('')).toEqual([]);
  });
});
