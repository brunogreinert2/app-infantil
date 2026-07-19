// Prova de Fogo do front matter: YAML bom, ruim e ausente.

import { describe, expect, it } from 'vitest';
import { carregarLivro } from './frontmatter';

const BOM = `---
titulo: "Livro Teste"
faixa_etaria: "6-9"
assets:
  - id: "il01"
    tipo: "colorir"
    arquivo_interativo: "x.svg"
quiz:
  - pergunta: "Oi?"
    alternativas: ["a", "b"]
    correta: 1
    nivel: "capitulo"
---

# Olá

Corpo.
`;

describe('front matter', () => {
  it('carrega metadados completos e o corpo parseado', () => {
    const livro = carregarLivro('teste', BOM);
    expect(livro.metadados.titulo).toBe('Livro Teste');
    expect(livro.metadados.assets?.[0].id).toBe('il01');
    expect(livro.metadados.quiz?.[0].correta).toBe(1);
    expect(livro.nos.map((n) => n.tipo)).toEqual(['cabecalho', 'paragrafo']);
  });

  it('sem front matter: título vira o id e o corpo inteiro é parseado', () => {
    const livro = carregarLivro('sem-nada', '# Só texto\n\nOi.');
    expect(livro.metadados.titulo).toBe('sem-nada');
    expect(livro.nos).toHaveLength(2);
  });

  it('YAML inválido NÃO derruba o app — vira livro sem metadados', () => {
    const quebrado = '---\ntitulo: "sem fechar\n  :::: lixo\n---\n\nCorpo sobrevive.';
    const livro = carregarLivro('quebrado', quebrado);
    expect(livro.metadados.titulo).toBe('quebrado');
    expect(livro.nos.length).toBeGreaterThan(0);
  });

  it('front matter com CRLF', () => {
    const livro = carregarLivro('crlf', '---\r\ntitulo: "Janelas"\r\n---\r\n\r\nOi.\r\n');
    expect(livro.metadados.titulo).toBe('Janelas');
    expect(livro.nos[0].tipo).toBe('paragrafo');
  });
});
