import { describe, expect, it } from 'vitest';
import { escreverConta, resolver } from './calculadora';
import { contaFalada } from './contaFalada';

const escrita = (s: string) => {
  const p = contaFalada(s);
  return p ? escreverConta({ pedacos: p }) : undefined;
};
const resultado = (s: string) => {
  const p = contaFalada(s);
  return p ? resolver(p).resultado : undefined;
};

describe('a conta falada (calculadora, etapa 2)', () => {
  it('palavras: «quanto é sete vezes oito?»', () => {
    expect(escrita('Quanto é sete vezes oito?')).toBe('7 × 8');
    expect(resultado('quanto é sete vezes oito')).toBe('56');
    expect(escrita('dez dividido por três')).toBe('10 ÷ 3');
    expect(escrita('cinco menos dois')).toBe('5 − 2');
    expect(escrita('três vezes quatro mais um')).toBe('3 × 4 + 1');
    expect(resultado('três vezes quatro mais um')).toBe('13');
  });

  it('algarismos e sinais, como o reconhecedor costuma escrever', () => {
    expect(escrita('7 x 8')).toBe('7 × 8');
    expect(escrita('7x8')).toBe('7 × 8');
    expect(escrita('12 + 7')).toBe('12 + 7');
    expect(escrita('9-3')).toBe('9 − 3');
    expect(escrita('20/4')).toBe('20 ÷ 4');
    expect(escrita('quanto é 12 mais 7?')).toBe('12 + 7');
  });

  it('números grandes por extenso', () => {
    expect(escrita('trezentos e quarenta e dois mais mil e cinco')).toBe('342 + 1005');
    expect(escrita('cento e vinte e três vezes dois')).toBe('123 × 2');
    expect(escrita('dois mil e vinte e seis menos mil novecentos e oitenta')).toBe('2026 − 1980');
    // o que o Vosk escreveu de verdade (voz Maria do Windows, 2026-11-25)
    expect(escrita('trezentos e quarenta dois menos sem')).toBe('342 − 100');
    expect(escrita('quanto e sete vezes oito')).toBe('7 × 8');
    expect(escrita('mil e quinhentos dividido por cinco')).toBe('1500 ÷ 5');
  });

  it('vírgula e meio', () => {
    expect(escrita('dois vírgula cinco mais um')).toBe('2,5 + 1');
    expect(escrita('2,5 + 1')).toBe('2,5 + 1');
    expect(escrita('três mais meio')).toBe('3 + 0,5');
  });

  it('«multiplicado por» e «dividido»', () => {
    expect(escrita('seis multiplicado por sete')).toBe('6 × 7');
    expect(escrita('oito dividido dois')).toBe('8 ÷ 2');
  });

  it('o que não é conta não vira conta (a tela pede para tentar de novo)', () => {
    expect(contaFalada('oi tudo bem')).toBeUndefined();
    expect(contaFalada('sete')).toBeUndefined();
    expect(contaFalada('sete vezes')).toBeUndefined();
    expect(contaFalada('mais mais')).toBeUndefined();
    expect(contaFalada('')).toBeUndefined();
  });
});
