import { describe, expect, it, vi } from 'vitest';

// o módulo liga-se à voz; aqui só interessam as duas contas
vi.mock('../tts', () => ({ ouvirPedacos: () => undefined }));
const { acharTrecho, primeiraFrase } = await import('./realceLeitura');

describe('realce da leitura em voz alta', () => {
  it('acha o trecho dentro do texto do bloco', () => {
    expect(acharTrecho('Era uma vez uma lebre. Ela corria muito.', 'Ela corria muito.')).toBe(23);
    expect(acharTrecho('Era uma vez.', 'Outra história.')).toBe(-1);
    expect(acharTrecho('Era uma vez.', '')).toBe(-1);
  });

  it('pedaço que atravessa dois parágrafos: fica a primeira frase', () => {
    expect(primeiraFrase('A corrida começou. Em três pulos a lebre sumiu.')).toBe('A corrida começou.');
    expect(primeiraFrase('Sem ponto no fim')).toBe('Sem ponto no fim');
    expect(primeiraFrase('Você? Correr comigo?')).toBe('Você?');
  });
});
