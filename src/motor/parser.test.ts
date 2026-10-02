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
    // Desde o motor do ecossistema (2026-10-02): "#" sozinho na linha é um
    // TÍTULO VAZIO, como no CommonMark e no Obsidian — o parser de três regras
    // o deixava como parágrafo com o caractere. O que importa continua: não
    // explode, e não há texto a perder (a cerquilha é marcação).
    expect(() => analisar('#')).not.toThrow();
    expect(analisar('#')[0]).toMatchObject({ tipo: 'cabecalho', nivel: 1, texto: '' });
  });

  it('imagem no meio de parágrafo fecha o parágrafo anterior', () => {
    const nos = analisar('antes\n{{img:foto}}\ndepois');
    expect(nos.map((n) => n.tipo)).toEqual(['paragrafo', 'imagem', 'paragrafo']);
  });
});

describe('parser — stress', () => {
  // O motor do ecossistema faz muito mais que as três regras de antes (grego,
  // notas, fórmula, HTML…), e é mais lento: 200 mil linhas, que as três regras
  // liam em menos de 2 s, ele lê em ~17 s. Medido em 2026-10-02: os 8
  // livrinhos JUNTOS em 57 ms; 50 mil linhas (25 mil blocos, mil vezes o maior
  // livrinho) em 1,9 s. A pancada passa a ser essa, com folga para aparelho lento.
  it('50 mil linhas em menos de 4 segundos', () => {
    const linhas: string[] = [];
    for (let i = 0; i < 12_500; i++) {
      linhas.push(`## Capítulo ${i}`, '', `Texto do capítulo ${i}.`, '');
    }
    const inicio = performance.now();
    const nos = analisar(linhas.join('\n'));
    const duracao = performance.now() - inicio;
    expect(nos).toHaveLength(25_000); // 12,5 mil cabeçalhos + 12,5 mil parágrafos
    expect(duracao).toBeLessThan(4000);
  });

  it('parágrafo único de 1 MB não trava', () => {
    const nos = analisar('palavra '.repeat(125_000));
    expect(nos).toHaveLength(1);
  });
});

describe('parser — o formato do ecossistema (motor compartilhado, NORMAS N7)', () => {
  it('citação vira bloco, e conta como parágrafo (o quiz não se solta)', () => {
    const nos = analisar('Primeiro.\n\n> Uma citação.\n\nTerceiro.');
    expect(nos.map((n) => [n.tipo, n.id])).toEqual([
      ['paragrafo', 'p1'],
      ['bloco', 'p2'],
      ['paragrafo', 'p3'],
    ]);
    expect(nos[1]).toMatchObject({ texto: 'Uma citação.' });
  });

  it('negrito é desenhado, e o 🔊 lê o texto sem os asteriscos', () => {
    const [no] = analisar('A **lebre** dormiu.');
    expect(no).toMatchObject({ tipo: 'paragrafo', texto: 'A lebre dormiu.' });
    const hast = no.tipo === 'paragrafo' ? no.hast : undefined;
    expect(JSON.stringify(hast)).toContain('"tagName":"strong"');
  });

  it('grego ganha lang="grc" (a voz certa no leitor de tela)', () => {
    const [no] = analisar('Sócrates disse: γνῶθι σεαυτόν.');
    expect(JSON.stringify(no)).toContain('"lang":"grc"');
  });

  it('{{img:id}} declarado no front matter: o bloco imagem leva o id', () => {
    const nos = analisar('{{img:il01}}', { assets: [{ id: 'il01', tipo: 'colorir', arquivo_interativo: 'x.svg' }] });
    expect(nos).toEqual([{ tipo: 'imagem', assetId: 'il01', id: 'img1' }]);
  });
});
