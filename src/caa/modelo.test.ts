import { describe, expect, it } from 'vitest';
import { CORES_CAA, TINTA_CAA } from './cores';
import { htmlDoConjunto, medidasDaGrade } from './impressaoCaa';
import {
  deArquivo,
  entraNaFrase,
  falaDaCasa,
  idLivre,
  paraArquivo,
  textoDaFrase,
  validarConjunto,
  type CasaCaa,
} from './modelo';
import { conjuntoEmBranco, conjuntoEssencial } from './padrao';
import { PICTOGRAMAS, NOMES_DOS_PICTOGRAMAS, svgDoPictograma } from './pictogramas';

const CONHECIDOS = new Set(Object.keys(PICTOGRAMAS));
const casa = (rotulo: string, extra: Partial<CasaCaa> = {}): CasaCaa => ({ id: rotulo, rotulo, categoria: 'coisa', ...extra });

describe('frase', () => {
  it('casa sozinha diz a fala; sem fala, o rótulo em minúsculas', () => {
    expect(falaDaCasa(casa('ÁGUA'))).toBe('água');
    expect(falaDaCasa(casa('DOR', { fala: 'estou com dor' }))).toBe('estou com dor');
  });
  it('várias casas usam naFrase e juntam na ordem do toque', () => {
    const eu = casa('EU');
    const estou = casa('ESTOU');
    const dor = casa('DOR', { fala: 'estou com dor', naFrase: 'com dor' });
    expect(textoDaFrase([dor])).toBe('estou com dor');
    expect(textoDaFrase([eu, estou, dor])).toBe('eu estou com dor');
    expect(textoDaFrase([])).toBe('');
  });
  it('pasta e casa vazia não entram na frase', () => {
    expect(entraNaFrase(casa('LUGARES', { abre: 'lugares' }))).toBe(false);
    expect(entraNaFrase(casa(''))).toBe(false);
    expect(entraNaFrase(casa('SIM'))).toBe(true);
  });
});

describe('conjunto essencial', () => {
  const ess = conjuntoEssencial();
  it('passa pela própria validação sem nenhum aviso', () => {
    const v = validarConjunto(ess, CONHECIDOS);
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.avisos).toEqual([]);
      expect(v.conjunto).toEqual(ess);
    }
  });
  it('inicial 5 × 6 e quatro pastas que abrem pranchas que existem', () => {
    const inicio = ess.pranchas.find((p) => p.id === ess.inicial)!;
    expect(inicio.casas).toHaveLength(30);
    const pastas = inicio.casas.filter((c) => c.abre);
    expect(pastas.map((c) => c.abre)).toEqual(['sinto', 'lugares', 'comida', 'escola']);
    for (const p of pastas) expect(ess.pranchas.some((x) => x.id === p.abre)).toBe(true);
  });
  it('ids únicos por prancha, todo desenho existe e tem nome', () => {
    for (const p of ess.pranchas) {
      const ids = p.casas.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const c of p.casas) {
        expect(PICTOGRAMAS[c.pictograma!], c.id).toBeTruthy();
        expect(c.rotulo).toBe(c.rotulo.toLocaleUpperCase('pt-BR'));
      }
    }
    for (const k of Object.keys(PICTOGRAMAS)) expect(NOMES_DOS_PICTOGRAMAS[k], k).toBeTruthy();
  });
  it('cópias são independentes', () => {
    const a = conjuntoEssencial();
    a.pranchas[0].casas[0].rotulo = 'MUDEI';
    expect(conjuntoEssencial().pranchas[0].casas[0].rotulo).toBe('EU');
  });
});

describe('validação do que vem de fora', () => {
  it('recusa o que não é prancha', () => {
    expect(validarConjunto(null, CONHECIDOS).ok).toBe(false);
    expect(validarConjunto({ pranchas: [] }, CONHECIDOS).ok).toBe(false);
    expect(deArquivo('não é json', CONHECIDOS).ok).toBe(false);
    expect(deArquivo('{"formato":"outro"}', CONHECIDOS).ok).toBe(false);
  });
  it('vai e volta pelo arquivo sem perder nada', () => {
    const ess = conjuntoEssencial();
    const v = deArquivo(paraArquivo(ess), CONHECIDOS);
    expect(v.ok && v.conjunto).toEqual(ess);
  });
  it('descarta figura que não é imagem, desenho desconhecido e pasta sem destino', () => {
    const v = validarConjunto(
      {
        nome: 'x',
        pranchas: [
          {
            id: 'a',
            titulo: 'A',
            colunas: 99,
            casas: [
              { id: 'b', rotulo: 'B', categoria: 'inventada', imagem: 'javascript:alert(1)' },
              { id: 'b', rotulo: 'C', pictograma: 'nao-existe', abre: 'zzz' },
              { rotulo: 'D', imagem: 'data:image/png;base64,iVBORw0KGgo=' },
              { rotulo: 'E', abre: 'a' },
            ],
          },
        ],
        ajustes: { varredura: 100, cores: 'sim' },
      },
      CONHECIDOS,
    );
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    const [b, c, d, e] = v.conjunto.pranchas[0].casas;
    expect(v.conjunto.pranchas[0].colunas).toBe(8);
    expect(b.imagem).toBeUndefined();
    expect(b.categoria).toBe('coisa');
    expect(c.id).not.toBe('b'); // id repetido ganha outro
    expect(c.pictograma).toBeUndefined();
    expect(c.abre).toBeUndefined();
    expect(d.imagem).toMatch(/^data:image\/png/);
    expect(e.abre).toBeUndefined(); // pasta que abre a si mesma
    expect(v.conjunto.ajustes.varredura).toBe(800);
    expect(v.conjunto.ajustes.cores).toBe(true);
    expect(v.avisos.length).toBeGreaterThanOrEqual(4);
  });
  it('id livre não repete e não leva acento', () => {
    expect(idLivre('Ônibus da Linha', [])).toBe('onibus-da-linha');
    expect(idLivre('casa', ['casa', 'casa-2'])).toBe('casa-3');
  });
});

describe('papel', () => {
  it('a grade cabe na folha A4 em qualquer tamanho permitido', () => {
    for (let colunas = 2; colunas <= 8; colunas++) {
      for (const n of [1, 8, 30, 64]) {
        const p = { id: 'x', titulo: 'x', colunas, casas: Array.from({ length: n }, (_, i) => casa(`C${i}`)) };
        const { altura, fileiras } = medidasDaGrade(p);
        expect(fileiras * altura + (fileiras - 1) * 3).toBeLessThanOrEqual(246.01);
      }
    }
  });
  it('uma folha por prancha, inicial primeiro, texto escapado', () => {
    const c = conjuntoEmBranco('t', '<b>Turma</b>');
    c.pranchas[0].casas[0].rotulo = '<script>';
    const { corpo } = htmlDoConjunto(c, { cores: true, recortar: false });
    expect(corpo).not.toContain('<script>');
    expect(corpo).toContain('&lt;b&gt;Turma');
    const ess = htmlDoConjunto(conjuntoEssencial(), { cores: false, recortar: true });
    expect(ess.corpo.match(/class="folha-caa"/g)).toHaveLength(5);
    expect(ess.corpo.indexOf('Início')).toBeLessThan(ess.corpo.indexOf('Sinto'));
    expect(ess.css).toContain('dashed');
  });
  it('pictograma vira SVG; chave desconhecida, nada', () => {
    expect(svgDoPictograma('onibus')).toMatch(/^<svg/);
    expect(svgDoPictograma('nada')).toBe('');
  });
});

// contraste WCAG entre a tinta e cada cor de categoria (Perkins pede ≥ 7:1)
function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
describe('cores', () => {
  it('toda cor de categoria tem contraste ≥ 7:1 com a tinta', () => {
    for (const [cat, cor] of Object.entries(CORES_CAA)) {
      const razao = (luminancia(cor) + 0.05) / (luminancia(TINTA_CAA) + 0.05);
      expect(razao, cat).toBeGreaterThanOrEqual(7);
    }
  });
});

describe('casa no papel', () => {
  it('rótulo de duas palavras ocupa duas linhas e a figura encolhe; tudo cabe na altura', async () => {
    const { medidasDaCasa } = await import('./impressaoCaa');
    const um = medidasDaCasa('FRIO', 45, 50);
    const dois = medidasDaCasa('COM MEDO', 45, 50);
    expect(um.linhas).toBe(1);
    expect(dois.linhas).toBe(2);
    expect(dois.figura).toBeLessThan(um.figura);
    for (const r of ['DESCANSAR', 'OBRIGADO', 'POR FAVOR', 'COM MEDO', 'ÔNIBUS DA LINHA 10']) {
      for (const [lado, altura] of [[35.6, 39.8], [45, 50], [21.1, 23.6]]) {
        const m = medidasDaCasa(r, lado, altura);
        expect(m.figura + m.linhas * m.letra * 1.12, r).toBeLessThanOrEqual(altura - 5.9);
        const maior = Math.max(...r.split(' ').map((p) => p.length));
        expect(maior * 0.72 * m.letra, r).toBeLessThanOrEqual(lado * 0.881);
      }
    }
  });
});
