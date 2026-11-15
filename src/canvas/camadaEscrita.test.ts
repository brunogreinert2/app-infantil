import { describe, expect, it } from 'vitest';
import { escritasEmSvg, escritasValidas } from './camadaEscrita';
import { montarFolhaPintada } from '../impressao/folhaPintada';

const ARTE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1131"><rect id="regiao-a" class="colorir-alvo" fill="#ffffff" width="10" height="10"/></svg>';

describe('escrever no desenho', () => {
  it('a escrita vira <text> no ponto certo, com contorno branco por baixo', () => {
    const svg = escritasEmSvg([{ x: 0.5, y: 0.25, texto: '14', cor: '#e63946', tamanho: 0.045 }], 800, 1131);
    expect(svg).toContain('x="400.0" y="282.8"');
    expect(svg).toContain('fill="#e63946"');
    expect(svg).toContain('paint-order="stroke"');
    expect(svg).toContain('>14</text>');
  });

  it('texto da criança é escapado; cor estranha vira preto', () => {
    const svg = escritasEmSvg([{ x: 0.1, y: 0.1, texto: '<b>"oi"&', cor: 'red', tamanho: 0.045 }], 800, 1131);
    expect(svg).toContain('&lt;b&gt;&quot;oi&quot;&amp;');
    expect(svg).toContain('fill="#1a1a1a"');
  });

  it('do armazenamento só passa o que tem cara de escrita', () => {
    expect(escritasValidas([{ x: 0.5, y: 0.5, texto: 'a', cor: '#000000', tamanho: 0.04 }, { x: 2, y: 0, texto: 'fora' }, 'lixo', null])).toHaveLength(1);
    expect(escritasValidas(undefined)).toEqual([]);
  });

  it('a folha pintada (impressão e galeria) leva a escrita por cima de tudo', () => {
    const folha = montarFolhaPintada(ARTE, {}, undefined, [{ x: 0.5, y: 0.5, texto: '42', cor: '#000000', tamanho: 0.045 }])!;
    expect(folha.lastIndexOf('<text')).toBeGreaterThan(folha.lastIndexOf('stroke="#000000"', folha.indexOf('<text')));
    expect(folha).toContain('>42</text>');
  });
});
