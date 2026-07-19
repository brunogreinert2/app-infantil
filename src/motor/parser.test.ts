// Prova de Fogo do parser — espírito do ProvaDeFogo.html do Pedra Angular:
// provar que o motor central aguenta pancada antes de empilhar coisas em cima.
// Rodar: npm test

import { describe, expect, it } from 'vitest';
import { analisar } from './parser';

describe('parser — regras básicas', () => {
  it('separa cabeçalho, parágrafo e imagem', () => {
    const nos = analisar('# Título\n\nUm parágrafo.\n\n{{img:il01}}\n\nOutro.');
    expect(nos.map((n) => n.tipo)).toEqual(['cabecalho', 'paragrafo', 'imagem', 'paragrafo']);
  });

  it('junta linhas consecutivas num parágrafo só e numera p1..pn', () => {
    const nos = analisar('linha um\nlinha dois\n\nsegundo parágrafo');
    expect(nos).toHaveLength(2);
    expect(nos[0]).toMatchObject({ tipo: 'paragrafo', id: 'p1', texto: 'linha um linha dois' });
    expect(nos[1]).toMatchObject({ id: 'p2' });
  });

  it('aceita CRLF do Windows', () => {
    const nos = analisar('# Oi\r\n\r\nTexto.\r\n');
    expect(nos).toHaveLength(2);
    expect(nos[0]).toMatchObject({ tipo: 'cabecalho', texto: 'Oi' });
  });

  it('arquivo vazio e só espaços → nenhum nó', () => {
    expect(analisar('')).toEqual([]);
    expect(analisar('\n\n   \n\r\n')).toEqual([]);
  });
});

describe('parser — sem teto artificial (princípio 1 da spec)', () => {
  it('profundidade 1 a 40 sem limite de 6 níveis', () => {
    for (const nivel of [1, 6, 7, 12, 40]) {
      const nos = analisar('#'.repeat(nivel) + ' Fundo do poço');
      expect(nos[0]).toMatchObject({ tipo: 'cabecalho', nivel });
    }
  });

  it('profundidade 1000 — absurda de propósito', () => {
    const nos = analisar('#'.repeat(1000) + ' abismo');
    expect(nos[0]).toMatchObject({ tipo: 'cabecalho', nivel: 1000, texto: 'abismo' });
  });
});

describe('parser — entradas malformadas não derrubam nada', () => {
  it('marcas de imagem quebradas viram parágrafo comum', () => {
    for (const lixo of ['{{img:}}', '{{img:a b}}', '{{img:x} }', '{{imagem:x}}', '{{img:x']) {
      const nos = analisar(lixo);
      expect(nos[0].tipo).toBe('paragrafo');
    }
  });

  it('cerquilha sem espaço não é cabeçalho... e cerquilha solta não explode', () => {
    expect(analisar('#semespaco')[0].tipo).toBe('paragrafo');
    expect(analisar('#')[0].tipo).toBe('paragrafo');
  });

  it('imagem no meio de parágrafo fecha o parágrafo anterior', () => {
    const nos = analisar('antes\n{{img:foto}}\ndepois');
    expect(nos.map((n) => n.tipo)).toEqual(['paragrafo', 'imagem', 'paragrafo']);
  });
});

describe('parser — stress', () => {
  it('200 mil linhas em menos de 2 segundos', () => {
    const linhas: string[] = [];
    for (let i = 0; i < 50_000; i++) {
      linhas.push(`## Capítulo ${i}`, '', `Texto do capítulo ${i}.`, '');
    }
    const inicio = performance.now();
    const nos = analisar(linhas.join('\n'));
    const duracao = performance.now() - inicio;
    expect(nos).toHaveLength(100_000); // 50k cabeçalhos + 50k parágrafos
    expect(duracao).toBeLessThan(2000);
  });

  it('parágrafo único de 1 MB não trava', () => {
    const nos = analisar('palavra '.repeat(125_000));
    expect(nos).toHaveLength(1);
  });
});
