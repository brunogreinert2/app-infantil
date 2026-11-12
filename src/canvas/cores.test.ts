import { describe, expect, it } from 'vitest';
import {
  COLUNAS_PALETA,
  MATIZES,
  contraste,
  fundoLegivel,
  matizDe,
  nomeDaCor,
  textoParaFundo,
  tintaSobre,
} from './cores';
import { diferenca, piorDiferenca } from './visaoDeCores';

const TODAS = MATIZES.flatMap((m) => m.tons);

// as 14 cores publicadas antes dos tons: pinturas salvas usam estes hex
const PUBLICADAS = [
  '#e63946', '#f77f00', '#fcbf49', '#f9e547', '#80b918', '#2a9d8f', '#219ebc',
  '#5064eb', '#9b5de5', '#f06fb8', '#8d5a3a', '#495057', '#ffffff', '#1a1a1a',
];

describe('cores de pintar', () => {
  it('toda cor tem nome, e nenhum nome se repete', () => {
    const nomes = TODAS.map((t) => t.nome);
    expect(nomes.every((n) => n.trim().length > 0)).toBe(true);
    expect(new Set(nomes).size).toBe(nomes.length);
  });

  it('nenhum hex se repete (cada cor é uma só)', () => {
    const cores = TODAS.map((t) => t.cor);
    expect(new Set(cores).size).toBe(cores.length);
    expect(cores.every((c) => /^#[0-9a-f]{6}$/.test(c))).toBe(true);
  });

  it('as cores já publicadas continuam na paleta, como cor-base', () => {
    const bases = MATIZES.map((m) => m.base);
    for (const hex of PUBLICADAS) expect(bases).toContain(hex);
  });

  it('cada matiz tem cinco tons com a base no meio; branco e preto, um só', () => {
    for (const m of MATIZES) {
      if (m.nome === 'Branco' || m.nome === 'Preto') {
        expect(m.tons).toHaveLength(1);
      } else {
        expect(m.tons).toHaveLength(5);
        expect(m.tons[2]).toEqual({ cor: m.base, nome: m.nome });
        expect(m.tons[0].nome).toBe(`${m.nome} muito claro`);
        expect(m.tons[4].nome).toBe(`${m.nome} muito escuro`);
      }
    }
  });

  it('nomeDaCor: exato na tabela, sem ligar para maiúsculas', () => {
    expect(nomeDaCor('#219ebc')).toBe('Azul-céu');
    expect(nomeDaCor('#219EBC')).toBe('Azul-céu');
    const claro = MATIZES.find((m) => m.nome === 'Azul')!.tons[1];
    expect(nomeDaCor(claro.cor)).toBe('Azul claro');
  });

  it('nomeDaCor: hex de fora da tabela ganha o nome da cor mais próxima', () => {
    expect(nomeDaCor('#e53a47')).toBe('Vermelho');
    expect(nomeDaCor('#fefefe')).toBe('Branco');
    expect(nomeDaCor('não é cor')).toBe('');
  });

  it('matizDe acha o matiz de um tom', () => {
    const escuro = MATIZES.find((m) => m.nome === 'Rosa')!.tons[3];
    expect(matizDe(escuro.cor)?.nome).toBe('Rosa');
    expect(matizDe('#123456')).toBeUndefined();
  });

  it('a marca ✓ se lê em cima de qualquer cor (contraste ≥ 4,5)', () => {
    const lum = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    for (const t of TODAS) {
      const [a, b] = [lum(t.cor), lum(tintaSobre(t.cor))].sort((x, y) => y - x);
      expect((a + 0.05) / (b + 0.05), t.nome).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('visão de cores (simulação de Machado et al., 2009)', () => {
  it('o modelo reproduz a confusão conhecida: vermelho e verde na deuteranopia', () => {
    expect(diferenca('#e63946', '#2f9e44', 'normal')).toBeGreaterThan(80);
    expect(diferenca('#e63946', '#2f9e44', 'deuteranopia')).toBeLessThan(15);
  });

  const C = COLUNAS_PALETA;
  const pares = (passos: (i: number) => number[]) => {
    const lista: [number, number][] = [];
    for (let i = 0; i < MATIZES.length; i++) {
      for (const j of passos(i)) if (j < MATIZES.length) lista.push([i, j]);
    }
    return lista;
  };
  // encostadas: ao lado (na mesma fileira) e embaixo
  const encostadas = pares((i) => [...(i % C < C - 1 ? [i + 1] : []), i + C]);
  // na diagonal: tocam só pelo canto
  const diagonais = pares((i) => [
    ...(i % C < C - 1 ? [i + C + 1] : []),
    ...(i % C > 0 ? [i + C - 1] : []),
  ]);

  it('a paleta é um xadrez: cor quente só encosta em cor fria', () => {
    expect(C % 2).toBe(1); // com número par de colunas o xadrez não fecha
    for (const [i, j] of encostadas) {
      expect(MATIZES[i].lado, `${MATIZES[i].nome} / ${MATIZES[j].nome}`).not.toBe(MATIZES[j].lado);
    }
  });

  it('a família que o daltonismo vermelho-verde confunde está toda do lado quente', () => {
    const quentes = MATIZES.filter((m) => m.lado === 'quente').map((m) => m.nome).sort();
    expect(quentes).toEqual(
      ['Amarelo', 'Amarelo-sol', 'Bege', 'Laranja', 'Marrom', 'Verde', 'Verde-limão', 'Verde-oliva', 'Vermelho', 'Vinho'].sort(),
    );
  });

  // Piso 30 para as encostadas e 20 para as diagonais (ΔE na PIOR das quatro
  // visões). A ordem antiga, sem xadrez, tinha piso 25 e mesmo assim punha
  // Vermelho ao lado de Amarelo-sol — por isso o xadrez vem antes do número.
  it('nenhuma cor encosta em outra parecida — em nenhuma das visões', () => {
    const fracas = (lista: [number, number][], piso: number) =>
      lista
        .map(([i, j]) => [MATIZES[i].nome, MATIZES[j].nome, piorDiferenca(MATIZES[i].base, MATIZES[j].base)] as const)
        .filter(([, , d]) => d < piso)
        .map(([a, b, d]) => `${a} / ${b}: ${d.toFixed(1)}`);
    expect(fracas(encostadas, 30)).toEqual([]);
    expect(fracas(diagonais, 20)).toEqual([]);
  });

  // Dentro de um matiz os tons diferem pela CLAREZA, que nenhuma das
  // dicromacias apaga — tons vizinhos têm de continuar distinguíveis.
  // O piso aqui é 5, não 25: o par mais fraco é o dos amarelos claros na
  // tritanopia (5,9) — amarelo já é quase tão claro quanto o branco, e o que
  // separa os dois tons é justamente o azul que a tritanopia não vê. Não tem
  // receita que conserte; quem cobre esse caso é o nome escrito ao lado.
  it('tons vizinhos de um mesmo matiz continuam diferentes em todas as visões', () => {
    for (const m of MATIZES) {
      for (let i = 0; i + 1 < m.tons.length; i++) {
        expect(piorDiferenca(m.tons[i].cor, m.tons[i + 1].cor), `${m.tons[i].nome}`).toBeGreaterThan(5);
      }
    }
  });
});

describe('cor como fundo de leitura (Monte o seu tema)', () => {
  it('contraste: preto e branco dão 21; cor consigo mesma dá 1', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contraste('#5064eb', '#5064eb')).toBeCloseTo(1, 5);
  });

  it('todo fundo oferecido tem letra com contraste ≥ 7', () => {
    for (const t of TODAS) {
      if (!fundoLegivel(t.cor)) continue;
      expect(contraste(t.cor, textoParaFundo(t.cor)), t.nome).toBeGreaterThanOrEqual(7);
    }
  });

  it('toda cor da paleta tem pelo menos um tom que serve de fundo', () => {
    for (const m of MATIZES) {
      expect(m.tons.some((t) => fundoLegivel(t.cor)), m.nome).toBe(true);
    }
  });

  it('cores de claridade média NÃO servem de fundo (a letra não chegaria a 7:1)', () => {
    expect(fundoLegivel('#e63946')).toBe(false); // Vermelho
    expect(fundoLegivel('#ffffff')).toBe(true);
    expect(fundoLegivel('#1a1a1a')).toBe(true);
  });
});

