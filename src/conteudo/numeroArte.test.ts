import { describe, expect, it } from 'vitest';
import { livros } from './catalogo';
import { NOMES_DOS_NUMEROS, svgNumeroA4 } from './numeroArte';
import { gerarCadernoNumeros, gerarNumeros } from './numeros';

const regioes = (svg: string) => [...svg.matchAll(/id="(regiao-[^"]+)" class="colorir-alvo"/g)].map((m) => m[1]);

describe('folhas de números', () => {
  it('há folha de 0 a 10, em A4, e fora disso recusa', () => {
    for (let n = 0; n <= 10; n++) {
      const svg = svgNumeroA4(n);
      expect(svg).toContain('viewBox="0 0 800 1131"');
      expect(svg).toContain('data-folha-a4="true"');
      expect(svg).toContain(`aria-label="O número ${NOMES_DOS_NUMEROS[n]}"`);
    }
    expect(() => svgNumeroA4(11)).toThrow();
    expect(() => svgNumeroA4(2.5)).toThrow();
  });

  it('toda região pintável tem id único, e não há texto que dependa de fonte', () => {
    for (let n = 0; n <= 10; n++) {
      const svg = svgNumeroA4(n);
      const ids = regioes(svg);
      expect(new Set(ids).size, `folha ${n}`).toBe(ids.length);
      expect(svg).not.toContain('<text');
    }
  });

  it('a quantidade de bolinhas é o número: nem mais, nem menos', () => {
    for (let n = 0; n <= 10; n++) {
      const ids = regioes(svgNumeroA4(n));
      expect(ids.filter((id) => id.startsWith('regiao-bolinha-')), `folha ${n}`).toHaveLength(n);
      expect(ids.filter((id) => id.startsWith('regiao-casa-'))).toHaveLength(10);
      expect(ids.filter((id) => id.startsWith('regiao-estrela-'))).toHaveLength(10);
      expect(ids.filter((id) => id.startsWith('regiao-reta-'))).toHaveLength(11);
    }
  });

  it('o número procurado aparece duas vezes entre os seis escondidos', () => {
    for (let n = 0; n <= 10; n++) {
      const svg = svgNumeroA4(n);
      const escondidos = [...svg.matchAll(/id="regiao-busca-numero-\d"[^>]*><g lang="pt-BR" aria-label="(\d+)"/g)].map((m) => m[1]);
      expect(escondidos).toHaveLength(6);
      expect(escondidos.filter((s) => s === String(n)), `folha ${n}`).toHaveLength(2);
    }
  });
});

describe('o livro Os Números', () => {
  const fichas = gerarCadernoNumeros();

  it('tem as vinte folhas, com ids de asset únicos', () => {
    expect(fichas.map((f) => f.id)).toEqual([
      'tabela',
      ...Array.from({ length: 11 }, (_, n) => `numero${String(n).padStart(2, '0')}`),
      'dezenas', 'romanos', 'relogio', 'juntar', 'tirar', 'vezes', 'repartir', 'tabuada',
    ]);
    expect(new Set(fichas.map((f) => f.arquivo)).size).toBe(fichas.length);
  });

  it('toda folha é A4, só com contorno preto e regiões brancas de id único', () => {
    for (const f of fichas) {
      expect(f.svg, f.id).toContain('data-folha-a4="true"');
      expect(f.svg, f.id).not.toContain('<text');
      const ids = regioes(f.svg);
      expect(ids.length, f.id).toBeGreaterThan(5);
      expect(new Set(ids).size, f.id).toBe(ids.length);
      const cores = new Set([...f.svg.matchAll(/(?:fill|stroke)="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1]));
      expect([...cores].sort(), f.id).toEqual(['#000000', '#ffffff']);
    }
  });

  it('nenhum título de folha tem algarismo (o zero da legenda é cortado)', () => {
    for (const f of fichas) {
      const titulo = f.svg.match(/<title>([^<]*)<\/title>/)![1];
      expect(titulo, f.id).not.toMatch(/\d/);
    }
  });

  it('as contas das folhas de operação cabem na reta de zero a dez', () => {
    // as respostas ficam em branco na folha; aqui só garantimos que dá para conferir na reta
    const total = (id: string, k: number, pedaco: string) =>
      regioes(fichas.find((f) => f.id === id)!.svg).filter((r) => r.startsWith(`regiao-conta-${k}-${pedaco}`)).length;
    for (const k of [1, 2, 3]) {
      expect(total('juntar', k, 'a') + total('juntar', k, 'b')).toBeLessThanOrEqual(10);
      expect(total('tirar', k, 'a-')).toBeLessThanOrEqual(10);
      expect(total('repartir', k, 'bola')).toBeLessThanOrEqual(10);
    }
  });

  it('entra no catálogo pelo pipeline comum, com cada folha ancorada no texto', () => {
    const livro = livros.find((l) => l.id === 'numeros')!;
    expect(livro.metadados.titulo).toBe('Os Números');
    expect(livro.metadados.assets).toHaveLength(20);
    const { arquivos } = gerarNumeros();
    for (const a of livro.metadados.assets!) expect(arquivos[a.arquivo_interativo!]).toBeTruthy();
    expect(livro.metadados.quiz).toHaveLength(1);
  });
});

