import { describe, expect, it } from 'vitest';
import {
  aplicarPintura,
  caixaDeVisao,
  contornoPreto,
  montarFolhaPintada,
  mudarRegioes,
} from './folhaPintada';

const ARTE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs><mask id="m1"><rect width="800" height="600" fill="#fff"/></mask></defs>
  <rect id="regiao-ceu" class="colorir-alvo" x="0" y="0" width="800" height="300" fill="#ffffff"/>
  <path class="colorir-alvo extra" id="regiao-sol" d="M10 10h50v50z" fill="#ffffff" mask="url(#m1)"/>
  <g id="regiao-casa" class="colorir-alvo"><rect width="10" height="10"/></g>
  <circle id="olho" cx="5" cy="5" r="2" fill="#000000"/>
</svg>`;

const ids = (svg: string) => [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);

describe('folha pintada', () => {
  it('pinta as regiões salvas e deixa as outras como estavam', () => {
    const svg = aplicarPintura(ARTE, { 'regiao-ceu': '#219ebc', 'regiao-casa': '#e63946' });
    expect(svg).toContain('id="regiao-ceu" class="colorir-alvo" x="0" y="0" width="800" height="300" fill="#219ebc"');
    expect(svg).toMatch(/<g id="regiao-casa" class="colorir-alvo" fill="#e63946">/);
    expect(svg).toMatch(/id="regiao-sol"[^>]*fill="#ffffff"/); // não pintada: branca
    expect(svg).toContain('<circle id="olho" cx="5" cy="5" r="2" fill="#000000"/>'); // não é região
  });

  it('nenhum id muda, some ou troca de ordem', () => {
    expect(ids(aplicarPintura(ARTE, { 'regiao-sol': '#f9e547' }))).toEqual(ids(ARTE));
    expect(ids(contornoPreto(ARTE))).toEqual(ids(ARTE));
  });

  it('só hex vira cor (o valor vem do armazenamento)', () => {
    const svg = aplicarPintura(ARTE, { 'regiao-ceu': '"/><script>x</script>', 'regiao-sol': 'red' });
    expect(svg).toBe(ARTE);
  });

  it('contorno: toda região fica sem preenchimento e com traço preto', () => {
    const svg = contornoPreto(ARTE);
    const alvos = [...svg.matchAll(/<[a-z]+[^>]*colorir-alvo[^>]*>/g)].map((m) => m[0]);
    expect(alvos).toHaveLength(3);
    for (const a of alvos) {
      expect(a).toContain('fill="none"');
      expect(a).toContain('stroke="#000000"');
      expect(a).toContain('stroke-width="3"');
    }
    expect(svg).toContain('mask="url(#m1)"'); // a máscara de oclusão continua
  });

  it('mudarRegioes preserva a tag que se fecha sozinha', () => {
    expect(mudarRegioes('<rect id="a" class="colorir-alvo"/>', () => ({ fill: 'none' }))).toBe(
      '<rect id="a" class="colorir-alvo" fill="none"/>',
    );
  });

  it('lê o viewBox', () => {
    expect(caixaDeVisao(ARTE)).toEqual({ largura: 800, altura: 600 });
    expect(caixaDeVisao('<svg></svg>')).toBeNull();
  });

  it('monta a pilha da tela: pintura, traços, contorno — nessa ordem', () => {
    const png = 'data:image/png;base64,AAAA';
    const folha = montarFolhaPintada(ARTE, { 'regiao-ceu': '#219ebc' }, png)!;
    expect(folha.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">')).toBe(true);
    const pintura = folha.indexOf('fill="#219ebc"');
    const tracos = folha.indexOf('<image ');
    const contorno = folha.indexOf('stroke="#000000"');
    expect(pintura).toBeGreaterThan(0);
    expect(tracos).toBeGreaterThan(pintura);
    expect(contorno).toBeGreaterThan(tracos);
    expect(folha).toContain(`href="${png}"`);
    // duas camadas de arte, cada uma do tamanho da folha
    expect(folha.match(/<svg [^>]*x="0" y="0" width="800" height="600"/g)).toHaveLength(2);
    // cada região aparece uma vez pintada e uma vez no contorno
    expect(folha.match(/id="regiao-ceu"/g)).toHaveLength(2);
  });

  it('sem traços não entra imagem; sem viewBox não monta', () => {
    expect(montarFolhaPintada(ARTE, {})).not.toContain('<image');
    expect(montarFolhaPintada(ARTE, {}, 'javascript:alert(1)')).not.toContain('<image');
    expect(montarFolhaPintada('<svg></svg>', {})).toBeNull();
  });
});
