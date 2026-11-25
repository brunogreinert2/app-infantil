import { describe, expect, it } from 'vitest';
import { livros } from './catalogo';
import { creditoDoAutor } from './credito';

const de = (id: string) => creditoDoAutor(livros.find((l) => l.id === id)!.metadados);

describe('o crédito sob o título (2026-11-25)', () => {
  it('as histórias recontadas dizem «adaptado de»', () => {
    expect(de('a-formiga-e-a-pomba')).toBe('adaptado de Esopo');
    expect(de('lebre-e-tartaruga')).toBe('adaptado de Esopo');
    expect(de('o-que-depende-de-mim')).toBe('adaptado de Epicteto');
    expect(de('a-panela-de-mingau')).toBe('adaptado dos Irmãos Grimm');
  });

  it('a tradução de verdade mostra só o autor', () => {
    expect(de('o-pequeno-principe')).toBe('Antoine de Saint-Exupéry');
  });

  it('nenhum livro da estante fica com o «(adaptação autoral livre)» na tela', () => {
    for (const l of livros) expect(creditoDoAutor(l.metadados)).not.toContain('autoral livre');
  });
});
