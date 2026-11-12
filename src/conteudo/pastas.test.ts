import { describe, expect, it } from 'vitest';
import { livros } from './catalogo';
import {
  PASTAS,
  PASTA_DOS_SEM_PASTA,
  PASTA_PADRAO,
  acharPasta,
  contarLivros,
  pastaDoLivro,
  secoesDaPasta,
  todasAsPastas,
} from './pastas';

const ids = livros.map((l) => l.id);

describe('pastas da estante', () => {
  it('ids de pasta são únicos, e as pastas especiais existem', () => {
    const todas = todasAsPastas().map((p) => p.id);
    expect(new Set(todas).size).toBe(todas.length);
    expect(acharPasta(PASTA_PADRAO)).toBeDefined();
    expect(acharPasta(PASTA_DOS_SEM_PASTA)).toBeDefined();
  });

  it('todo livro do catálogo foi posto numa pasta, e numa só', () => {
    for (const id of ids) {
      const donas = todasAsPastas().filter((p) => p.livros.includes(id));
      expect(donas.map((p) => p.id), `livro ${id}`).toHaveLength(1);
    }
  });

  it('nenhuma pasta aponta para livro que não existe', () => {
    for (const p of todasAsPastas()) {
      for (const id of p.livros) expect(ids, `pasta ${p.id}`).toContain(id);
    }
  });

  it('as pastas de fora, juntas, mostram todos os livros — nenhum some', () => {
    const mostrados = PASTAS.flatMap((p) => secoesDaPasta(p, ids).flatMap((s) => s.livros));
    expect([...mostrados].sort()).toEqual([...ids].sort());
    expect(PASTAS.reduce((n, p) => n + contarLivros(p, ids), 0)).toBe(ids.length);
  });

  it('livro que ninguém reclamou cai na pasta dos sem-pasta', () => {
    expect(pastaDoLivro('livro-que-ainda-nao-existe').id).toBe(PASTA_DOS_SEM_PASTA);
    const secoes = secoesDaPasta(acharPasta(PASTA_DOS_SEM_PASTA)!, [...ids, 'novo-sem-pasta']);
    expect(secoes[0].livros).toContain('novo-sem-pasta');
  });

  it('Histórias abre em seções, uma por coleção', () => {
    const secoes = secoesDaPasta(acharPasta('historias')!, ids);
    expect(secoes.map((s) => s.pasta.id)).toEqual([
      'primeiras-aventuras',
      'bosques-castelos',
      'classicos',
      'para-pensar',
    ]);
    expect(secoesDaPasta(acharPasta('alfabetos')!, ids)[0].livros.sort()).toEqual([
      'alfabeto',
      'alfabeto-grego',
    ]);
  });
});
