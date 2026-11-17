import { describe, expect, it } from 'vitest';
import { gerarCacaPalavras, svgCacaPalavrasA4 } from './cacaPalavras';
import { gerarCruzadinha, svgCruzadinhaA4 } from './cruzadinha';
import {
  PAUTAS,
  bhaskara,
  escreverQuadratica,
  feriadosNacionais,
  passosBhaskara,
  pascoa,
  semanasDoMes,
  svgCalendarioA4,
  svgCalendarioAnoA4,
  svgCaligrafiaA4,
  svgMilimetradoA4,
  svgPautaA4,
  svgPlanoCartesianoA4,
  svgPontilhadoA4,
  svgQuadriculadoA4,
  svgReguasA4,
} from './papeis';
import { mm, soLetras } from './comum';
import { TODAS_AS_PALAVRAS } from '../conteudo/lerOMundo';

/** folha inteira, sem número estragado e sem nada desenhado fora do A4 */
function folhaSa(svg: string): void {
  expect(svg).toContain('data-folha-a4="true"');
  expect(svg).toContain('viewBox="0 0 800 1131"');
  expect(svg).not.toMatch(/NaN|undefined|Infinity/);
  for (const m of svg.matchAll(/<(?:rect|line|circle)[^>]*?\b(?:x|x1|x2|cx)="(-?[\d.]+)"[^>]*?>/g)) {
    if (m[0].includes('transform=')) continue;
    expect(Number(m[1])).toBeGreaterThanOrEqual(-1);
    expect(Number(m[1])).toBeLessThanOrEqual(801);
  }
  for (const m of svg.matchAll(/translate\((-?[\d.]+) (-?[\d.]+)\)/g)) {
    expect(Number(m[1])).toBeGreaterThanOrEqual(-1);
    expect(Number(m[1])).toBeLessThanOrEqual(801);
    expect(Number(m[2])).toBeGreaterThanOrEqual(0);
    expect(Number(m[2])).toBeLessThanOrEqual(1131);
  }
}

const TRANSPORTE = ['ÔNIBUS', 'PARADA', 'LINHA', 'CENTRO', 'BAIRRO', 'TERMINAL', 'PASSAGEM', 'MOTORISTA'];

describe('caça-palavras', () => {
  it('põe cada palavra onde o gabarito diz, uma vez só', () => {
    for (const nivel of ['facil', 'medio', 'dificil'] as const) {
      const jogo = gerarCacaPalavras({ palavras: TRANSPORTE, nivel });
      expect(jogo.fora).toEqual([]);
      expect(jogo.conferido).toBe(true);
      expect(jogo.achados.map((a) => a.palavra)).toEqual(TRANSPORTE);
      for (const a of jogo.achados) {
        const lidas = [...a.letras].map((_, k) => jogo.grade[a.linha + a.dl * k][a.coluna + a.dc * k]).join('');
        expect(lidas).toBe(a.letras);
        if (nivel === 'facil') expect(a.dl + a.dc).toBe(1);
      }
      expect(jogo.grade.flat().every((c) => /^[A-Z]$/.test(c))).toBe(true);
    }
  });

  it('sem sorte: a mesma lista dá a mesma folha; a semente dá outra', () => {
    const a = gerarCacaPalavras({ palavras: TRANSPORTE });
    expect(gerarCacaPalavras({ palavras: TRANSPORTE })).toEqual(a);
    expect(gerarCacaPalavras({ palavras: TRANSPORTE, semente: 1 }).grade).not.toEqual(a.grade);
  });

  it('tira acento e espaço na grade, mas a lista fica como foi escrita', () => {
    const jogo = gerarCacaPalavras({ palavras: ['pão de queijo', 'SAÍDA', 'Atenção'] });
    expect(jogo.achados.map((a) => [a.palavra, a.letras])).toEqual([
      ['PÃO DE QUEIJO', 'PAODEQUEIJO'],
      ['SAÍDA', 'SAIDA'],
      ['ATENÇÃO', 'ATENCAO'],
    ]);
  });

  it('explica o que ficou de fora', () => {
    const jogo = gerarCacaPalavras({ palavras: ['PARADA', 'PARA', 'OI', 'PARADA', 'ARAP', '🚌'], lado: 6 });
    expect(jogo.achados.map((a) => a.palavra)).toEqual(['PARADA']);
    expect(jogo.fora.map((f) => f.palavra).sort()).toEqual(['ARAP', 'OI', 'PARA', 'PARADA']);
    expect(gerarCacaPalavras({ palavras: ['EXTRAORDINARIAMENTE', 'CASA'], lado: 8 }).fora[0].motivo).toContain('não cabe');
  });

  it('serve para o catálogo inteiro do Ler o Mundo, grupo por grupo', () => {
    const jogo = gerarCacaPalavras({ palavras: TODAS_AS_PALAVRAS.slice(0, 17).map((p) => p.palavra), nivel: 'dificil' });
    expect(jogo.conferido).toBe(true);
    expect(jogo.achados.length + jogo.fora.length).toBe(17);
  });

  it('desenha folha e gabarito dentro do A4', () => {
    const jogo = gerarCacaPalavras({ palavras: TRANSPORTE, nivel: 'dificil' });
    const folha = svgCacaPalavrasA4(jogo, { titulo: 'Ônibus e transporte' });
    const respostas = svgCacaPalavrasA4(jogo, { titulo: 'Ônibus e transporte', gabarito: true });
    folhaSa(folha);
    folhaSa(respostas);
    expect(folha).not.toContain('rotate(');
    expect(respostas.match(/rotate\(/g)).toHaveLength(TRANSPORTE.length);
    folhaSa(svgCacaPalavrasA4(gerarCacaPalavras({ palavras: [] })));
  });
});

const ESCOLA = [
  { palavra: 'CADERNO', dica: 'Onde a gente escreve na aula.' },
  { palavra: 'LÁPIS', dica: 'Escreve e pode ser apagado.' },
  { palavra: 'RECREIO', dica: 'Hora de brincar e lanchar.' },
  { palavra: 'MERENDA', dica: 'A comida da escola.' },
  { palavra: 'PROFESSORA', dica: 'Quem ensina a turma.' },
  { palavra: 'BORRACHA', dica: 'Apaga o que o lápis escreveu.' },
  { palavra: 'MOCHILA', dica: 'Leva o material nas costas.' },
  { palavra: 'LIVRO', dica: 'Tem páginas e histórias.' },
];

describe('cruzadinha', () => {
  const jogo = gerarCruzadinha(ESCOLA);

  it('encaixa as palavras e cada entrada bate com a grade', () => {
    expect(jogo.fora).toEqual([]);
    expect(jogo.entradas).toHaveLength(ESCOLA.length);
    for (const e of jogo.entradas) {
      const dl = e.direcao === 'vertical' ? 1 : 0;
      const dc = 1 - dl;
      expect([...e.letras].map((_, k) => jogo.grade[e.linha + dl * k][e.coluna + dc * k]).join('')).toBe(e.letras);
      // a palavra não emenda em outra letra antes nem depois
      expect(jogo.grade[e.linha - dl]?.[e.coluna - dc] ?? '').toBe('');
      expect(jogo.grade[e.linha + dl * e.letras.length]?.[e.coluna + dc * e.letras.length] ?? '').toBe('');
    }
    expect(Math.max(jogo.linhas, jogo.colunas)).toBeLessThanOrEqual(15);
  });

  it('toda sequência de letras da grade é uma palavra da lista', () => {
    const validas = new Set(ESCOLA.map((i) => soLetras(i.palavra)));
    const seqs: string[] = [];
    const colunas = jogo.grade[0].map((_, c) => jogo.grade.map((l) => l[c]));
    for (const fila of [...jogo.grade, ...colunas]) {
      seqs.push(...fila.map((c) => c || ' ').join('').split(/\s+/).filter((s) => s.length > 1));
    }
    expect(seqs.length).toBe(ESCOLA.length);
    for (const s of seqs) expect(validas.has(s), s).toBe(true);
  });

  it('numera como jornal e não usa sorte', () => {
    const numeros = jogo.entradas.map((e) => e.numero);
    expect(numeros).toEqual([...numeros].sort((a, b) => a - b));
    expect(numeros[0]).toBe(1);
    expect(gerarCruzadinha(ESCOLA)).toEqual(jogo);
  });

  it('deixa de fora o que não cruza, dizendo por quê', () => {
    const j = gerarCruzadinha([...ESCOLA, { palavra: 'XYZ', dica: '' }, { palavra: 'livro', dica: 'de novo' }]);
    expect(j.fora).toEqual([
      { palavra: 'LIVRO', motivo: 'repetida' },
      { palavra: 'XYZ', motivo: 'não cruza com as outras' },
    ]);
    expect(gerarCruzadinha([]).entradas).toEqual([]);
  });

  it('desenha folha e gabarito dentro do A4, com as dicas', () => {
    const folha = svgCruzadinhaA4(jogo, { titulo: 'Coisas da escola' });
    folhaSa(folha);
    folhaSa(svgCruzadinhaA4(jogo, { gabarito: true }));
    expect(folha).toContain('Hora de brincar e lanchar.');
    expect(folha).not.toContain('aria-label="P"');
    folhaSa(svgCruzadinhaA4(gerarCruzadinha(TODAS_AS_PALAVRAS.slice(0, 20).map((p) => ({ palavra: p.palavra, dica: p.onde ?? '' })))));
  });
});

describe('papéis', () => {
  it('mede em milímetros de verdade: 190 mm são as 800 unidades da folha', () => {
    expect(mm(190)).toBe(800);
    expect(mm(10)).toBeCloseTo(42.11, 2);
  });

  it('todas as folhas saem inteiras', () => {
    const folhas = [
      svgPautaA4(),
      svgPautaA4(PAUTAS.ampliada),
      svgPautaA4({ ...PAUTAS.muitoAmpliada, margem: false }),
      svgCaligrafiaA4(),
      svgQuadriculadoA4(),
      svgQuadriculadoA4({ lado: 20, grossura: 0.8 }),
      svgMilimetradoA4(),
      svgPontilhadoA4(),
      svgReguasA4(),
      svgPlanoCartesianoA4(),
      svgPlanoCartesianoA4({ curva: { a: 1, b: -2, c: -3 }, respostas: true }),
      svgCalendarioA4({ ano: 2026, mes: 11 }),
      svgCalendarioA4({ ano: 2027, mes: 2, modelo: 'anotar' }),
      svgCalendarioAnoA4(2027),
    ];
    for (const f of folhas) folhaSa(f);
  });

  it('a pauta ampliada tem menos linhas e traço mais grosso que a comum', () => {
    const conta = (svg: string) => (svg.match(/M0 /g) ?? []).length;
    expect(conta(svgPautaA4(PAUTAS.ampliada))).toBeLessThan(conta(svgPautaA4()));
    expect(svgPautaA4(PAUTAS.ampliada)).toContain(`stroke-width="${mm(0.8)}"`);
  });

  it('Bhaskara: raízes, vértice e os três casos de delta', () => {
    expect(bhaskara({ a: 1, b: -2, c: -3 })).toEqual({ delta: 16, raizes: [-1, 3], vertice: { x: 1, y: -4 } });
    expect(bhaskara({ a: 1, b: -4, c: 4 })).toEqual({ delta: 0, raizes: [2], vertice: { x: 2, y: 0 } });
    expect(bhaskara({ a: 1, b: 0, c: 1 }).raizes).toEqual([]);
    expect(bhaskara({ a: -1, b: 0, c: 4 }).raizes).toEqual([-2, 2]);
    expect(() => bhaskara({ a: 0, b: 1, c: 1 })).toThrow();
    expect(escreverQuadratica({ a: 1, b: -2, c: -3 })).toBe('y = x² – 2x – 3');
    expect(escreverQuadratica({ a: -1, b: 0, c: 4 })).toBe('y = –x² + 4');
    expect(escreverQuadratica({ a: 2, b: 1, c: 0 })).toBe('y = 2x² + x');
    expect(passosBhaskara({ a: 1, b: -2, c: -3 })).toContain('x = –1 ou x = 3');
    expect(passosBhaskara({ a: 1, b: 0, c: 1 }).join(' ')).toContain('não corta o eixo x');
  });

  it('calendário: semanas, Páscoa e feriados nacionais', () => {
    // novembro de 2026 começa num domingo; fevereiro de 2027 começa numa segunda
    expect(semanasDoMes(2026, 11)[0]).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(semanasDoMes(2026, 11)).toHaveLength(5);
    expect(semanasDoMes(2027, 2)[0]).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(semanasDoMes(2028, 2).flat().filter(Boolean)).toHaveLength(29);
    expect(pascoa(2026)).toEqual({ mes: 4, dia: 5 });
    expect(pascoa(2027)).toEqual({ mes: 3, dia: 28 });
    expect(feriadosNacionais(2026, 4).map((f) => f.dia)).toEqual([3, 21]);
    expect(feriadosNacionais(2026, 11).map((f) => f.dia)).toEqual([2, 15, 20]);
    expect(feriadosNacionais(2026, 6)).toEqual([]);
  });

  it('calendário aceita figura só se for imagem embutida', () => {
    const png = 'data:image/png;base64,iVBORw0KGgo=';
    expect(svgCalendarioA4({ ano: 2026, mes: 12, imagem: png })).toContain('<image');
    expect(svgCalendarioA4({ ano: 2026, mes: 12, imagem: 'https://exemplo.com/x.png' })).not.toContain('<image');
    expect(svgCalendarioA4({ ano: 2026, mes: 12, imagem: 'data:image/svg+xml;base64,AAAA' })).not.toContain('<image');
  });
});

describe('do formulário à folha', () => {
  it('cada tipo tem um pedido de partida que já dá folha', async () => {
    const { TIPOS, fazerFolhas, pedidoInicial } = await import('./pedido');
    for (const t of TIPOS) {
      const r = fazerFolhas(pedidoInicial(t.tipo, new Date(2026, 10, 16)));
      expect(r.folhas.length, t.tipo).toBeGreaterThan(0);
      expect(r.titulo).toBeTruthy();
      for (const f of r.folhas) folhaSa(f.svg);
    }
  });

  it('lê a lista como quem ensina escreve', async () => {
    const { lerItens, lerPalavras } = await import('./pedido');
    expect(lerPalavras('casa, bola;\n  pão de queijo \n\n')).toEqual(['casa', 'bola', 'pão de queijo']);
    expect(lerItens('LÁPIS: escreve: e apaga\nBOLA = redonda\nSOL\n\n')).toEqual([
      { palavra: 'LÁPIS', dica: 'escreve: e apaga' },
      { palavra: 'BOLA', dica: 'redonda' },
      { palavra: 'SOL', dica: '' },
    ]);
  });

  it('avisa em vez de quebrar', async () => {
    const { fazerFolhas } = await import('./pedido');
    const vazio = fazerFolhas({ tipo: 'caca', titulo: '', palavras: '', nivel: 'facil', semente: NaN, respostas: true });
    expect(vazio.folhas).toHaveLength(2);
    expect(vazio.avisos[0]).toContain('Escreva as palavras');
    const fora = fazerFolhas({ tipo: 'caca', titulo: 'x', palavras: 'PARADA\nPARA', nivel: 'facil', semente: 0, respostas: false });
    expect(fora.folhas).toHaveLength(1);
    expect(fora.avisos.join(' ')).toContain('PARA ficou de fora');
    const reta = fazerFolhas({ tipo: 'plano', alcance: 10, curva: true, a: 0, b: 1, c: 1, respostas: true });
    expect(reta.folhas).toHaveLength(1);
    expect(reta.avisos[0]).toContain('a = 0');
    const parabola = fazerFolhas({ tipo: 'plano', alcance: 10, curva: true, a: 1, b: NaN, c: -4, respostas: true });
    expect(parabola.folhas).toHaveLength(2);
    const ano = fazerFolhas({ tipo: 'calendario', modelo: 'ano', ano: NaN, mes: 99, feriados: true });
    expect(ano.folhas).toHaveLength(1);
  });

  it('a tela nasce desligada', async () => {
    const { FOLHAS_LIGADAS } = await import('./ligado');
    expect(FOLHAS_LIGADAS).toBe(false);
  });
});

describe('jogos de mesa', () => {
  const LISTA = 'FELIZ\nTRISTE\nBRAVO\nCASA\nÔNIBUS\nÁGUA\nSUCO\nPÃO\nFRUTA\nLIVRO\nLÁPIS\nMÚSICA\nTHEO';

  it('acha o desenho pela palavra, com ou sem acento, e tira repetidas', async () => {
    const { lerPecas } = await import('./jogosDeMesa');
    expect(lerPecas('ônibus, Sala de aula; por favor\nTheo\nONIBUS\n\n')).toEqual([
      { texto: 'ÔNIBUS', figura: 'onibus' },
      { texto: 'SALA DE AULA', figura: 'sala' },
      { texto: 'POR FAVOR', figura: 'por-favor' },
      { texto: 'THEO', figura: undefined },
    ]);
  });

  it('memória: duas cartas por palavra; na de leitura, figura numa e palavra na outra', async () => {
    const { lerPecas, svgMemoriaA4 } = await import('./jogosDeMesa');
    const pecas = lerPecas(LISTA);
    const iguais = svgMemoriaA4(pecas);
    expect(iguais).toHaveLength(3); // 26 cartas, 12 por folha
    const conta = (svg: string, s: string) => svg.split(s).length - 1;
    expect(iguais.reduce((t, f) => t + conta(f.svg, 'aria-label="CASA"'), 0)).toBe(2);
    const leitura = svgMemoriaA4(pecas, { par: 'leitura', verso: true });
    expect(leitura).toHaveLength(4);
    expect(leitura.at(-1)!.titulo).toContain('verso');
    expect(leitura.slice(0, 3).reduce((t, f) => t + conta(f.svg, 'aria-label="CASA"'), 0)).toBe(1);
    // palavra sem desenho: as duas cartas levam a palavra
    expect(leitura.slice(0, 3).reduce((t, f) => t + conta(f.svg, 'aria-label="THEO"'), 0)).toBe(2);
    for (const f of [...iguais, ...leitura]) folhaSa(f.svg);
  });

  it('dominó: todas as combinações, cada uma uma vez', async () => {
    const { gerarDomino, lerPecas, svgDominoA4 } = await import('./jogosDeMesa');
    const pecas = lerPecas(LISTA);
    const pedras = gerarDomino(pecas);
    expect(pedras).toHaveLength(28);
    expect(new Set(pedras.map(([a, b]) => `${a.texto}|${b.texto}`)).size).toBe(28);
    for (const p of pecas.slice(0, 7)) {
      expect(pedras.filter(([a, b]) => a === p || b === p)).toHaveLength(7);
    }
    expect(gerarDomino(pecas.slice(0, 5))).toHaveLength(15);
    const folhas = svgDominoA4(pecas);
    expect(folhas).toHaveLength(2);
    for (const f of folhas) folhaSa(f.svg);
  });

  it('bingo: cartelas todas diferentes, sem casa repetida, sempre as mesmas', async () => {
    const { gerarBingo, lerPecas, svgBingoA4 } = await import('./jogosDeMesa');
    const pecas = lerPecas(LISTA);
    const cartelas = gerarBingo(pecas, { cartelas: 30 });
    expect(cartelas).toHaveLength(30);
    for (const c of cartelas) expect(new Set(c).size).toBe(9);
    expect(new Set(cartelas.map((c) => c.map((p) => p.texto).sort().join('|'))).size).toBe(30);
    expect(gerarBingo(pecas, { cartelas: 30 })).toEqual(cartelas);
    expect(gerarBingo(pecas, { cartelas: 30, semente: 1 })).not.toEqual(cartelas);
    expect(gerarBingo(pecas.slice(0, 8))).toEqual([]);
    // com 9 palavras só existe uma cartela possível: devolve uma, não trava
    expect(gerarBingo(pecas.slice(0, 9), { cartelas: 5 })).toHaveLength(1);
    const folhas = svgBingoA4(pecas, { cartelas: 5 });
    expect(folhas).toHaveLength(4); // 3 de cartelas + 1 de fichas
    for (const f of folhas) folhaSa(f.svg);
  });

  it('tabuleiro: 32 casas escuras, a do canto inferior direito clara; 24 pedras e 32 peças', async () => {
    const { svgPecasDamasA4, svgPecasXadrezA4, svgTabuleiroA4 } = await import('./jogosDeMesa');
    const tabuleiro = svgTabuleiroA4();
    folhaSa(tabuleiro);
    const escuras = [...tabuleiro.matchAll(/<rect x="([\d.]+)" y="([\d.]+)"[^>]*fill="#bdbdbd"/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(escuras).toHaveLength(32);
    const maiorX = Math.max(...escuras.map((e) => e[0]));
    const maiorY = Math.max(...escuras.map((e) => e[1]));
    expect(escuras.some(([x, y]) => x === maiorX && y === maiorY)).toBe(false);
    const damas = svgPecasDamasA4();
    const xadrez = svgPecasXadrezA4();
    folhaSa(damas);
    folhaSa(xadrez);
    expect((xadrez.match(/aria-label="P"/g) ?? []).length).toBe(16);
    expect((xadrez.match(/aria-label="R"/g) ?? []).length).toBe(2);
    expect((xadrez.match(/<circle/g) ?? []).length).toBe(32);
  });

  it('pelo formulário: avisa do que falta e do que vai sem desenho', async () => {
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    const base = pedidoInicial('jogo');
    if (base.tipo !== 'jogo') throw new Error('tipo');
    expect(fazerFolhas({ ...base, jogo: 'bingo' }).folhas.length).toBeGreaterThan(1);
    const pouco = fazerFolhas({ ...base, jogo: 'bingo', lado: 4 });
    expect(pouco.folhas).toEqual([]);
    expect(pouco.avisos.join(' ')).toContain('pelo menos 19');
    expect(fazerFolhas({ ...base, pecas: 'THEO\nDAVI' }).avisos[0]).toContain('THEO, DAVI');
    expect(fazerFolhas({ ...base, jogo: 'xadrez' }).folhas).toHaveLength(2);
    expect(fazerFolhas({ ...base, jogo: 'domino', pecas: 'A' }).folhas).toEqual([]);
  });
});
