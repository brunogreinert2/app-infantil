import { describe, expect, it } from 'vitest';
import { montarPdf } from './pdf';

// um "JPEG" de mentira: para o PDF, é só um punhado de bytes
const jpeg = (tamanho: number) => Uint8Array.from({ length: tamanho }, (_, i) => (i * 37) % 256);
const latin1 = (b: Uint8Array) => Array.from(b, (c) => String.fromCharCode(c)).join('');

describe('PDF feito à mão', () => {
  const paginas = [
    { jpeg: jpeg(500), largura: 1654, altura: 2339 }, // em pé
    { jpeg: jpeg(321), largura: 2339, altura: 1754 }, // deitada
  ];
  const pdf = montarPdf(paginas, 'A Lebre e a Tartaruga (ação)');
  const texto = latin1(pdf);

  it('começa e termina como PDF, com uma página por imagem', () => {
    expect(texto.startsWith('%PDF-1.4')).toBe(true);
    expect(texto.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(texto).toContain('/Count 2');
    expect(texto.match(/\/Type \/Page /g)).toHaveLength(2);
  });

  it('a tabela do fim aponta para o começo exato de cada objeto', () => {
    const onde = Number(texto.match(/startxref\n(\d+)/)![1]);
    expect(texto.slice(onde, onde + 4)).toBe('xref');
    const linhas = [...texto.slice(onde).matchAll(/(\d{10}) 00000 n /g)].map((m) => Number(m[1]));
    expect(linhas).toHaveLength(3 + paginas.length * 3);
    linhas.forEach((inicio, k) => {
      expect(texto.slice(inicio, inicio + `${k + 1} 0 obj`.length), `objeto ${k + 1}`).toBe(`${k + 1} 0 obj`);
    });
  });

  it('página em pé é A4 em pé; página deitada é A4 deitado', () => {
    const caixas = [...texto.matchAll(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(caixas).toEqual([[595.28, 841.89], [841.89, 595.28]]);
  });

  it('a imagem cabe dentro das margens, sem deformar', () => {
    const desenhos = [...texto.matchAll(/q ([\d.]+) 0 0 ([\d.]+) ([\d.]+) ([\d.]+) cm/g)].map((m) => m.slice(1).map(Number));
    desenhos.forEach(([w, h, x, y], i) => {
      const p = paginas[i];
      const [lf, af] = p.largura > p.altura ? [841.89, 595.28] : [595.28, 841.89];
      expect(w / h).toBeCloseTo(p.largura / p.altura, 2);
      expect(x).toBeGreaterThanOrEqual(28.3);
      expect(y).toBeGreaterThanOrEqual(28.3);
      expect(x + w).toBeLessThanOrEqual(lf - 28.3);
      expect(y + h).toBeLessThanOrEqual(af - 28.3);
    });
  });

  it('o JPEG entra inteiro, byte a byte', () => {
    for (const p of paginas) {
      const marca = `/Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`;
      const inicio = texto.indexOf(marca) + marca.length;
      expect(Array.from(pdf.slice(inicio, inicio + p.jpeg.length))).toEqual(Array.from(p.jpeg));
    }
  });

  it('o título fica só com letras simples', () => {
    expect(texto).toContain('/Title (A Lebre e a Tartaruga acao)');
  });
});
