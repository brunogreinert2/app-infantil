import { describe, expect, it } from 'vitest';
import { livros, arquivosAssets, obterLivro } from './catalogo';
import { livrosPrimeirasAventuras, assetsPrimeirasAventuras } from './colecaoPrimeirasAventuras';

describe('coleção Primeiras Aventuras', () => {
  it('acrescenta doze livros distintos e preserva a estante anterior', () => {
    expect(livrosPrimeirasAventuras).toHaveLength(12);
    expect(livros).toHaveLength(22);
    expect(new Set(livros.map(l => l.id)).size).toBe(livros.length);
    for (const id of ['lebre-e-tartaruga', 'o-pequeno-principe', 'o-que-depende-de-mim',
      'socrates-e-as-duas-cestas', 'o-sonho-do-menino-rene', 'o-leao-e-o-ratinho',
      'a-raposa-e-as-uvas', 'o-vento-e-o-sol', 'alfabeto', 'alfabeto-grego']) {
      expect(obterLivro(id)).toBeDefined();
    }
  });

  it('resolve as duas cenas de cada história para pintura e quebra-cabeça', () => {
    expect(Object.keys(assetsPrimeirasAventuras)).toHaveLength(24);
    for (const livro of livrosPrimeirasAventuras) {
      const assets = livro.metadados.assets!;
      expect(assets.map(a => a.id)).toEqual(['il01', 'il02']);
      expect(livro.nos.filter(n => n.tipo === 'imagem').map(n => n.assetId)).toEqual(['il01', 'il02']);
      expect(livro.nos.filter(n => n.tipo === 'cabecalho' && n.nivel === 2)).toHaveLength(2);
      expect(livro.nos.filter(n => n.tipo === 'paragrafo')).toHaveLength(6);
      for (const asset of assets) {
        expect(asset.tipo).toBe('colorir');
        expect(arquivosAssets[asset.arquivo_interativo!]).toContain('<svg');
      }
    }
  });

  it('inclui perguntas válidas com explicação, sem depender de nota', () => {
    for (const livro of livrosPrimeirasAventuras) {
      expect(livro.metadados.tradutor).toContain('adaptação livre própria');
      expect(livro.metadados.quiz).toHaveLength(2);
      for (const q of livro.metadados.quiz!) {
        expect(q.alternativas).toHaveLength(3);
        expect(Number.isInteger(q.correta)).toBe(true);
        expect(q.correta).toBeGreaterThanOrEqual(0);
        expect(q.correta).toBeLessThan(q.alternativas.length);
        expect(q.explicacao!.length).toBeGreaterThan(20);
      }
    }
  });

  it('completa as três fábulas existentes sem perder suas âncoras de quiz', () => {
    for (const id of ['o-leao-e-o-ratinho', 'a-raposa-e-as-uvas', 'o-vento-e-o-sol']) {
      const livro = obterLivro(id)!;
      expect(livro.metadados.assets).toHaveLength(1);
      expect(livro.nos[livro.nos.length - 1]).toMatchObject({ tipo: 'imagem', assetId: 'il01' });
      for (const q of livro.metadados.quiz!) {
        if (q.ancora) expect(livro.nos.some(n => n.id === q.ancora)).toBe(true);
      }
    }
  });

  it('tem 27 SVGs vetoriais horizontais, com IDs únicos e regiões pintáveis', () => {
    const artes = Object.entries(arquivosAssets).filter(([nome]) => nome.startsWith('colecao01-'));
    expect(artes).toHaveLength(27);
    for (const [nome, svg] of artes) {
      expect(svg, nome).toContain('viewBox="0 0 1000 700"');
      const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
      expect(new Set(ids).size, nome).toBe(ids.length);
      expect(ids.some(id => id.startsWith('regiao-')), nome).toBe(true);
      expect(svg, nome).not.toMatch(/<(script|image|text|foreignObject)\b|\son\w+=|(?:href|src)="https?:/);
      expect(svg, nome).toContain('class="colorir-alvo" fill="#ffffff"');
      expect(svg, nome).toContain('<title');
      expect(svg, nome).toContain('<desc>');
    }
  });

  it('resolve todas as máscaras que preservam contornos na impressão', () => {
    for (const [nome, svg] of Object.entries(arquivosAssets).filter(([n]) => n.startsWith('colecao01-'))) {
      const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
      const refs = [...svg.matchAll(/mask="url\(#([^)]*)\)"/g)].map(m => m[1]);
      expect(refs.length, nome).toBeGreaterThan(0);
      for (const ref of refs) expect(ids.has(ref), `${nome}: ${ref}`).toBe(true);
      // Cada máscara tem um prefixo próprio, inclusive quando várias cenas estão na leitura.
      expect(refs.every(ref => ref.startsWith(nome.replace('.svg', '') + '-oclusao-'))).toBe(true);
    }
  });
});
