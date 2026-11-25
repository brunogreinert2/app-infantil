import { describe, expect, it } from 'vitest';
import { CONTA_VAZIA, escreverConta, falarConta, teclaDoTeclado, teclar, type Conta, type Tecla } from './calculadora';

/** Digita uma sequência: '12+7×2=' ou com palavras entre colchetes: '[apagar]'. */
function digitar(seq: string, conta: Conta = CONTA_VAZIA): Conta {
  const teclas = seq.match(/\[[a-z]+\]|./gu) ?? [];
  return teclas.reduce((c, t) => teclar(c, (t.startsWith('[') ? t.slice(1, -1) : t) as Tecla), conta);
}

describe('a calculadora (2026-11-25)', () => {
  it('vezes e dividir antes de mais e menos, como na escola', () => {
    const c = digitar('12+7×2=');
    expect(escreverConta(c)).toBe('12 + 7 × 2');
    expect(c.resultado).toBe('26');
    expect(digitar('10−6÷2=').resultado).toBe('7');
  });

  it('a conta fala por inteiro', () => {
    expect(falarConta(digitar('12+7×2='))).toBe('12 mais 7 vezes 2 é igual a 26');
    expect(falarConta(digitar('8÷2='))).toBe('8 dividido por 2 é igual a 4');
  });

  it('vírgula, e sem o barulho do computador (0,1 + 0,2 = 0,3)', () => {
    expect(digitar('0,1+0,2=').resultado).toBe('0,3');
    expect(digitar('7÷2=').resultado).toBe('3,5');
    expect(digitar(',5+1=').resultado).toBe('1,5');
  });

  it('divisão que não fecha: seis casas cortadas e «e continua», nunca «mais ou menos»', () => {
    const c = digitar('10÷3=');
    expect(c.resultado).toBe('3,333333');
    expect(c.continua).toBe(true);
    expect(falarConta(c)).toBe('10 dividido por 3 é igual a 3,333333, e continua');
    // cortada, não arredondada: as reticências dizem a verdade
    expect(digitar('2÷3=').resultado).toBe('0,666666');
    expect(digitar('7÷2=').continua).toBeUndefined();
  });

  it('dividir por zero explica, não quebra', () => {
    const c = digitar('5÷0=');
    expect(c.resultado).toBeUndefined();
    expect(c.erro).toMatch(/Não dá para dividir por zero/);
  });

  it('resultado negativo sai com o sinal de menos', () => {
    const c = digitar('3−5=');
    expect(c.resultado).toBe('−2');
    expect(falarConta(c)).toBe('3 menos 5 é igual a menos 2');
    // e dá para continuar a partir dele
    expect(digitar('3−5=+10=').resultado).toBe('8');
    expect(digitar('10÷4=×2=').resultado).toBe('5');
  });

  it('trocar de sinal, apagar e continuar do resultado', () => {
    expect(escreverConta(digitar('5+×3'))).toBe('5 × 3');
    expect(escreverConta(digitar('123[apagar]'))).toBe('12');
    expect(escreverConta(digitar('12+[apagar]'))).toBe('12');
    const depois = digitar('2+3=×4=');
    expect(escreverConta(depois)).toBe('5 × 4');
    expect(depois.resultado).toBe('20');
    // número depois do «=» começa conta nova
    expect(escreverConta(digitar('2+3=7'))).toBe('7');
    expect(digitar('2+3=[limpar]')).toEqual(CONTA_VAZIA);
  });

  it('a conta não começa por sinal, e o «=» ignora o sinal solto do fim', () => {
    expect(digitar('+').pedacos).toHaveLength(0);
    expect(digitar('4+=').resultado).toBe('4');
  });

  it('o teclado do computador também serve', () => {
    expect(teclaDoTeclado('*')).toBe('×');
    expect(teclaDoTeclado('/')).toBe('÷');
    expect(teclaDoTeclado('-')).toBe('−');
    expect(teclaDoTeclado('Enter')).toBe('=');
    expect(teclaDoTeclado('Backspace')).toBe('apagar');
    expect(teclaDoTeclado('a')).toBeUndefined();
  });
});
