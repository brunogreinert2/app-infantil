import { describe, expect, it } from 'vitest';
import pacote from '../../package.json';
import { textoSobre } from './sobre';

describe('o Sobre dos Ajustes', () => {
  it('mostra a versão do package.json, nunca um número escrito à mão', () => {
    expect(textoSobre()).toContain(`versão ${pacote.version}`);
    expect(textoSobre('1.2.3', '2026-11-15')).toContain('versão 1.2.3, de 15/11/2026');
  });
});
