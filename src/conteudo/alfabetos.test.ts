import { describe, it, expect } from 'vitest';
import { gerarAlfabetos, gerarCadernoAlfabeto, GREGO, LATINO } from './alfabetos';
import { DIGRAFOS, DITONGOS_GREGOS } from './alfabetoComplementos';
import glifos from './glifos.json';
import legendas from './glifos-legendas.json';
import { DICAS_GREGO, BRINCADEIRAS_PORTUGUES } from './alfabetoBrincadeiras';

describe('cadernos A4 de alfabetos', () => {
  it('usa Cardo para pintar e grego, e Atkinson para legendas latinas', () => {
    for (const g of Object.values(glifos)) expect(g.fonte).toBe('Cardo');
    for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁáÇçÃãÉéÕõ0123456789') {
      expect((legendas as Record<string, {fonte: string}>)[c].fonte).toBe('Atkinson Hyperlegible');
    }
    for (const c of 'ΑαΩωΣσςᾳῃῳἀἁ') {
      expect((legendas as Record<string, {fonte: string}>)[c].fonte).toBe('Cardo');
    }
  });
  it('oferece dicas infantis para todas as letras sem narrar orientações à professora', () => {
    expect(Object.keys(DICAS_GREGO)).toEqual(GREGO.map(l=>l[0]));
    expect(Object.keys(BRINCADEIRAS_PORTUGUES)).toEqual(LATINO.map(l=>l[0]));
    for(const {livro} of gerarAlfabetos()) {
      const textos=livro.nos.filter(n=>n.tipo==='paragrafo'||n.tipo==='bloco').map(n=>n.texto);
      expect(textos.join(' ')).not.toMatch(/professora|para os adultos|convenção didática|outras tradições/i);
      expect(textos.join(' ')).not.toContain('undefined');
    }
    // O tom muda, mas as aspirações e a leitura ZD não viram sons modernos.
    expect(DICAS_GREGO['Ζ']).toContain('z e d');
    for(const letra of ['Θ','Φ','Χ']) expect(DICAS_GREGO[letra]).toContain('sopro');
    expect(DICAS_GREGO['Ω']).toContain('Do alfa ao ômega!');
  });
  it('fecha cada contorno dos glifos para impressão e pintura sem preenchimento', () => {
    for (const g of Object.values(glifos)) {
      expect(g.d.match(/Z/g)?.length).toBe(g.d.match(/M/g)?.length);
      expect(g.d.endsWith('Z')).toBe(true);
    }
  });
  it('mantém as 24 e 26 letras, sem contar sigma final ou cedilha como letras novas', () => {
    expect(GREGO).toHaveLength(24); expect(LATINO).toHaveLength(26);
    expect(gerarCadernoAlfabeto('alfabeto-grego').filter(f=>f.id.startsWith('letra'))).toHaveLength(24);
    expect(gerarCadernoAlfabeto('alfabeto').filter(f=>f.id.startsWith('letra'))).toHaveLength(26);
  });
  it('mantém nomes e IDs publicados e registra todas as fichas no livro', () => {
    for(const {livro,arquivos} of gerarAlfabetos()) {
      const fs=gerarCadernoAlfabeto(livro.id);
      expect(fs.map(f=>f.id)).toContain('tabela'); expect(fs.map(f=>f.id)).toContain('vogais');
      expect(new Set(fs.map(f=>f.id)).size).toBe(fs.length);
      for(const f of fs) {
        expect(arquivos[f.arquivo]).toBe(f.svg);
        expect(livro.metadados.assets?.some(a=>a.id===f.id&&a.arquivo_interativo===f.arquivo)).toBe(true);
        expect(livro.nos.some(n=>n.tipo==='imagem'&&n.assetId===f.id)).toBe(true);
      }
    }
  });
  it('gera todas as folhas sem IDs repetidos, fontes externas ou scripts', () => {
    for(const id of ['alfabeto','alfabeto-grego']) for(const f of gerarCadernoAlfabeto(id)) {
      expect(f.svg).toContain('viewBox="0 0 800 1131"');
      expect(f.svg).toContain('data-folha-a4="true"');
      const ids=[...f.svg.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
      expect(new Set(ids).size).toBe(ids.length);
      expect(f.svg).not.toMatch(/<(script|image|text)\b/);
      expect(f.svg).not.toMatch(/(?:href|src)="https?:/);
      expect(f.svg).toContain('class="colorir-alvo" fill="#ffffff"');
    }
  });
  it('inclui os oito ditongos gregos, iota subscrito e sigma final', () => {
    expect(DITONGOS_GREGOS.map(c=>c.simbolos)).toEqual(['αι','ει','οι','αυ','ευ','ου','ηυ','υι']);
    const ids=gerarCadernoAlfabeto('alfabeto-grego').map(f=>f.id);
    for(const id of ['sigma-final','iota-subscrito-alfa','iota-subscrito-eta','iota-subscrito-omega','sinais']) expect(ids).toContain(id);
  });
  it('separa dígrafos, ditongos e hiato no português e contextualiza QU e GU', () => {
    const ids=gerarCadernoAlfabeto('alfabeto').map(f=>f.id);
    for(const id of ['digrafo-ch','ditongo-ai','hiato','cedilha']) expect(ids).toContain(id);
    for(const c of DIGRAFOS.filter(c=>c.simbolos==='qu'||c.simbolos==='gu')) expect(c.atividade).toContain('U não é pronunciado');
  });
});
