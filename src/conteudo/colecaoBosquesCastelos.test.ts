import { describe, expect, it } from 'vitest';
import { livros, arquivosAssets, obterLivro } from './catalogo';
import { livrosBosquesCastelos, assetsBosquesCastelos } from './colecaoBosquesCastelos';

describe('coleção Entre Bosques e Castelos', () => {
  it('registra oito histórias sem duplicar IDs ou retirar coleções anteriores', () => {
    expect(livrosBosquesCastelos).toHaveLength(8);
    expect(livros.length).toBeGreaterThanOrEqual(30);
    expect(new Set(livros.map(l => l.id)).size).toBe(livros.length);
    for (const l of livrosBosquesCastelos) expect(obterLivro(l.id)).toBe(l);
    for (const id of ['o-corvo-e-o-jarro', 'alfabeto', 'alfabeto-grego', 'o-pequeno-principe']) {
      expect(obterLivro(id)).toBeDefined();
    }
  });

  it('resolve três capítulos completos e suas cenas na ordem de leitura', () => {
    expect(Object.keys(assetsBosquesCastelos)).toHaveLength(24);
    for (const l of livrosBosquesCastelos) {
      expect(l.nos.filter(n => n.tipo === 'cabecalho' && n.nivel === 2)).toHaveLength(3);
      expect(l.nos.filter(n => n.tipo === 'imagem').map(n => n.assetId)).toEqual(['il01', 'il02', 'il03']);
      expect(l.metadados.assets?.map(a => a.id)).toEqual(['il01', 'il02', 'il03']);
      for (const a of l.metadados.assets!) {
        expect(a.tipo).toBe('colorir');
        expect(arquivosAssets[a.arquivo_interativo!]).toBe(assetsBosquesCastelos[a.arquivo_interativo!]);
        expect(arquivosAssets[a.arquivo_interativo!]).toContain('<svg');
      }
      expect(l.metadados.tradutor).toContain('adaptação livre própria');
    }
  });

  it('oferece três perguntas com respostas e explicações válidas', () => {
    for (const l of livrosBosquesCastelos) {
      expect(l.metadados.quiz).toHaveLength(3);
      for (const q of l.metadados.quiz!) {
        expect(q.alternativas).toHaveLength(3);
        expect(new Set(q.alternativas).size).toBe(3);
        expect(Number.isInteger(q.correta)).toBe(true);
        expect(q.correta).toBeGreaterThanOrEqual(0);
        expect(q.correta).toBeLessThan(q.alternativas.length);
        expect(q.explicacao!.length).toBeGreaterThan(30);
      }
    }
  });

  it('mantém arte vetorial acessível, pintável e independente de fontes ou rede', () => {
    for (const [nome, svg] of Object.entries(assetsBosquesCastelos)) {
      // Evita multiplicação acidental de formas sobrepostas e do custo das máscaras.
      expect(svg.length, nome).toBeLessThan(250_000);
      expect(svg, nome).toContain('viewBox="0 0 1000 700"');
      expect(svg, nome).toContain('<title');
      expect(svg, nome).toContain('<desc>');
      expect(svg, nome).not.toMatch(/<(script|image|text|foreignObject)\b|\son\w+=|(?:href|src)="https?:/);
      const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
      expect(new Set(ids).size, nome).toBe(ids.length);
      expect(ids.filter(id => id.startsWith('regiao-')).length, nome).toBeGreaterThan(35);
      expect(svg, nome).toContain('class="colorir-alvo" fill="#ffffff"');
      const refs = [...svg.matchAll(/mask="url\(#([^)]*)\)"/g)].map(m => m[1]);
      expect(refs.length, nome).toBeGreaterThan(0);
      for (const ref of refs) expect(ids.includes(ref), `${nome}: ${ref}`).toBe(true);
      expect(refs.every(ref => ref.startsWith(nome.replace('.svg', '') + '-oclusao-'))).toBe(true);
    }
  });
});
