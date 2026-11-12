import { describe, expect, it } from 'vitest';
import { nomeDaParte } from './partes';

describe('nome das partes do desenho', () => {
  it('tira o prefixo, põe acento e junta as palavras', () => {
    expect(nomeDaParte('regiao-ceu')).toBe('céu');
    expect(nomeDaParte('regiao-arvore-tronco')).toBe('árvore tronco');
    expect(nomeDaParte('regiao-quadro-maiuscula')).toBe('quadro maiúscula');
  });

  it('número perde os zeros da frente', () => {
    expect(nomeDaParte('regiao-detalhe-003')).toBe('detalhe 3');
    expect(nomeDaParte('regiao-reta-10')).toBe('reta 10');
  });

  it('nunca fica sem nome', () => {
    expect(nomeDaParte('regiao-')).toBe('parte');
    expect(nomeDaParte('')).toBe('parte');
  });
});
