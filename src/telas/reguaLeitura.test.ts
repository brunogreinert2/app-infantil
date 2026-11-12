import { describe, expect, it, vi } from 'vitest';

vi.mock('../armazenamento/armazenamento', () => ({ armazenamento: {} }));
vi.mock('../perfis/perfis', () => ({ perfilAtivo: () => ({ id: 1 }) }));
const { proximoModo } = await import('./reguaLeitura');

describe('régua de leitura', () => {
  it('com mouse: desligada → parada → segue o mouse → desligada', () => {
    expect(proximoModo('desligada', true)).toBe('parada');
    expect(proximoModo('parada', true)).toBe('mouse');
    expect(proximoModo('mouse', true)).toBe('desligada');
  });

  it('em tela de toque não existe "segue o mouse"', () => {
    expect(proximoModo('desligada', false)).toBe('parada');
    expect(proximoModo('parada', false)).toBe('desligada');
  });
});
