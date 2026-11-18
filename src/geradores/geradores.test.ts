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
  for (const m of svg.matchAll(/<rect[^>]*?\by="(-?[\d.]+)"[^>]*?\bheight="([\d.]+)"[^>]*?>/g)) {
    if (m[0].includes('transform=')) continue;
    expect(Number(m[1]) + Number(m[2])).toBeLessThanOrEqual(1131.5);
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
    expect(leitura[leitura.length - 1].titulo).toContain('verso');
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

describe('relógio e reta numérica', () => {
  it('lê as horas como a pessoa escreve', async () => {
    const { escreverHora, lerHoras } = await import('./matematica');
    expect(lerHoras('7:15\n7h30, 19h; 07.05\n25:00\nabc\n8')).toEqual([
      { h: 7, m: 15 },
      { h: 7, m: 30 },
      { h: 19, m: 0 },
      { h: 7, m: 5 },
      { h: 8, m: 0 },
    ]);
    expect(escreverHora({ h: 7, m: 5 })).toBe('7:05');
  });

  it('relógios: seis por folha; ponteiros só onde devem estar', async () => {
    const { lerHoras, svgRelogioDeMontarA4, svgRelogiosA4 } = await import('./matematica');
    const horas = lerHoras('7:00\n7:15\n12:30\n3:45\n9:10\n6:50\n1:00');
    const ponteiros = (svg: string) => (svg.match(/stroke-linecap="round"\/>/g) ?? []).length;
    const ler = svgRelogiosA4(horas, { respostas: true });
    expect(ler).toHaveLength(4);
    expect(ler[0].svg).not.toContain('aria-label="7:15"');
    expect(ler[2].svg).toContain('aria-label="7:15"');
    const marcar = svgRelogiosA4(horas.slice(0, 6), { modo: 'marcar' });
    expect(marcar).toHaveLength(1);
    expect(marcar[0].svg).toContain('aria-label="12:30"');
    expect(ponteiros(marcar[0].svg)).toBe(0);
    expect(ponteiros(svgRelogiosA4(horas.slice(0, 6), { modo: 'marcar', respostas: true })[1].svg)).toBe(12);
    for (const f of [...ler, ...marcar]) folhaSa(f.svg);
    folhaSa(svgRelogioDeMontarA4());
    // às 3:00 o ponteiro das horas aponta para a direita; às 6:00, para baixo
    const tres = svgRelogiosA4([{ h: 3, m: 0 }])[0].svg;
    expect(tres).toContain('M224 300L273.68 300');
    expect(svgRelogiosA4([{ h: 18, m: 0 }])[0].svg).toContain('M224 300L224 349.68');
  });

  it('reta numérica: marcas certas, com e sem número, e limites seguros', async () => {
    const { svgRetasA4 } = await import('./matematica');
    const reta = svgRetasA4({ de: 0, ate: 10, quantas: 2 });
    folhaSa(reta);
    expect((reta.match(/aria-label="10"/g) ?? []).length).toBe(4); // 2 retas, número + contorno branco
    const completar = svgRetasA4({ de: 0, ate: 10, quantas: 4, semNumeroDesde: 3 });
    expect((completar.match(/aria-label="7"/g) ?? []).length).toBe(4);
    folhaSa(svgRetasA4({ de: -10, ate: 10 }));
    folhaSa(svgRetasA4({ de: 50, ate: 0 }));
    expect(svgRetasA4({ de: 0, ate: 500 })).toContain('de 0 a 30');
    folhaSa(svgRetasA4({ de: 3, ate: 3 }));
  });
});

describe('primeiro lote das sugestões', () => {
  it('silabário: famílias, monte a palavra e peças de sílaba sem desenho', async () => {
    const s = await import('./silabario');
    const { lerPecas } = await import('./jogosDeMesa');
    expect(s.lerFamilias('b, c qu QU lh 9 abcd')).toEqual(['B', 'C', 'QU', 'LH']);
    expect(s.familia('QU')).toEqual(['QUA', 'QUE', 'QUI', 'QUO', 'QUU']);
    const fam = s.svgFamiliasA4(s.lerFamilias('B C D F G L M N P'), { completar: true });
    expect(fam).toHaveLength(2);
    expect(fam[0].svg).toContain('aria-label="BA"');
    expect(fam[0].svg).not.toContain('aria-label="BE"');
    for (const f of fam) folhaSa(f.svg);
    const palavras = s.emSilabas(lerPecas('CASA\nMACACO\nTHEO\nLINHA 10'));
    expect(palavras.map((p) => p.silabas.join('-'))).toEqual(['CA-SA', 'MA-CA-CO', 'THE-O']);
    const moveis = s.svgSilabasMoveisA4(palavras);
    expect(moveis).toHaveLength(1);
    folhaSa(moveis[0].svg);
    const { pecas, separadas } = s.pecasDeSilabas('BA BE bola casa');
    expect(pecas.map((p) => p.texto)).toEqual(['BA', 'BE', 'BO', 'LA', 'CA', 'SA']);
    expect(pecas.every((p) => !p.figura)).toBe(true);
    expect(separadas).toEqual(['BO-LA', 'CA-SA']);
    // "IR" é sílaba, não o desenho de "ir"
    expect(s.pecasDeSilabas('IR').pecas[0].figura).toBeUndefined();
  });

  it('labirinto: todas as casas alcançáveis e o caminho só atravessa paredes abertas', async () => {
    const { gerarLabirinto, svgLabirintoA4 } = await import('./logica');
    for (const nivel of ['facil', 'medio', 'dificil'] as const) {
      const lab = gerarLabirinto(nivel, 3);
      // labirinto perfeito é uma árvore: casas − 1 passagens internas
      let abertas = 0;
      for (let l = 0; l < lab.linhas; l++) {
        for (let c = 0; c < lab.colunas; c++) {
          if (!lab.paredes[l][c][1] && c < lab.colunas - 1) abertas++;
          if (!lab.paredes[l][c][2] && l < lab.linhas - 1) abertas++;
        }
      }
      expect(abertas).toBe(lab.linhas * lab.colunas - 1);
      expect(lab.solucao[0]).toEqual([0, 0]);
      expect(lab.solucao[lab.solucao.length - 1]).toEqual([lab.linhas - 1, lab.colunas - 1]);
      for (let i = 1; i < lab.solucao.length; i++) {
        const [l0, c0] = lab.solucao[i - 1];
        const [l1, c1] = lab.solucao[i];
        expect(Math.abs(l1 - l0) + Math.abs(c1 - c0)).toBe(1);
        const lado = l1 < l0 ? 0 : c1 > c0 ? 1 : l1 > l0 ? 2 : 3;
        expect(lab.paredes[l0][c0][lado]).toBe(false);
      }
      folhaSa(svgLabirintoA4(lab, { respostas: true }));
    }
    expect(gerarLabirinto('medio', 1)).toEqual(gerarLabirinto('medio', 1));
    expect(gerarLabirinto('medio', 2).paredes).not.toEqual(gerarLabirinto('medio', 1).paredes);
  });

  it('sudoku: solução válida, pistas dentro dela e uma solução só', async () => {
    const { gerarSudoku, svgSudokuA4 } = await import('./logica');
    for (const lado of [4, 6] as const) {
      for (const semente of [0, 1, 2]) {
        const s = gerarSudoku(lado, semente);
        const certo = Array.from({ length: lado }, (_, i) => i + 1).join();
        for (let i = 0; i < lado; i++) {
          expect([...s.solucao[i]].sort().join()).toBe(certo);
          expect(s.solucao.map((l) => l[i]).sort().join()).toBe(certo);
        }
        const [bl, bc] = s.bloco;
        for (let l0 = 0; l0 < lado; l0 += bl) {
          for (let c0 = 0; c0 < lado; c0 += bc) {
            const b: number[] = [];
            for (let i = 0; i < bl; i++) for (let j = 0; j < bc; j++) b.push(s.solucao[l0 + i][c0 + j]);
            expect(b.sort().join()).toBe(certo);
          }
        }
        s.pistas.forEach((linha, l) => linha.forEach((v, c) => v && expect(v).toBe(s.solucao[l][c])));
        const vazias = s.pistas.flat().filter((v) => !v).length;
        expect(vazias).toBeGreaterThan(lado === 4 ? 6 : 12);
        folhaSa(svgSudokuA4(s, { figuras: lado === 4 }));
        folhaSa(svgSudokuA4(s, { respostas: true }));
      }
    }
  });

  it('contas: resultados certos, "vai um" respeitado, divisão exata', async () => {
    const { gerarContas, svgContasA4, svgTabuaA4, svgTabuadaA4 } = await import('./contas');
    const sem = gerarContas({ operacao: '+', algarismos: 2, reagrupar: false, quantas: 12 });
    expect(sem).toHaveLength(12);
    for (const c of sem) {
      expect(c.resultado).toBe(c.a + c.b);
      expect((c.a % 10) + (c.b % 10)).toBeLessThan(10);
      expect(Math.floor(c.a / 10) + Math.floor(c.b / 10)).toBeLessThan(10);
    }
    const com = gerarContas({ operacao: '-', algarismos: 3, reagrupar: true, quantas: 12 });
    for (const c of com) {
      expect(c.resultado).toBe(c.a - c.b);
      expect(c.resultado).toBeGreaterThanOrEqual(0);
    }
    for (const c of gerarContas({ operacao: '/', algarismos: 3, reagrupar: false, quantas: 20 })) {
      expect(c.a).toBe(c.b * c.resultado);
      expect(String(c.a)).toHaveLength(3);
    }
    for (const c of gerarContas({ operacao: 'x', algarismos: 2, reagrupar: false, quantas: 20 })) expect(c.resultado).toBe(c.a * c.b);
    expect(gerarContas({ operacao: '+', algarismos: 2, reagrupar: false, quantas: 12, semente: 0 })).toEqual(sem);
    const folhas = svgContasA4(gerarContas({ operacao: '/', algarismos: 4, reagrupar: false, quantas: 14 }), { respostas: true });
    expect(folhas).toHaveLength(4);
    for (const f of folhas) folhaSa(f.svg);
    folhaSa(svgContasA4(com)[0].svg);
    folhaSa(svgTabuadaA4(7, { completar: true }));
    expect(svgTabuadaA4(7)).toContain('aria-label="63"');
    folhaSa(svgTabuaA4());
    expect(svgTabuaA4({ completar: true })).toContain('aria-label="49"');
    expect(svgTabuaA4({ completar: true })).not.toContain('aria-label="42"');
  });

  it('recortar: medidas de verdade e as sete peças do tangram', async () => {
    const r = await import('./recortar');
    const dourado = r.svgMaterialDouradoA4();
    folhaSa(dourado);
    expect(dourado).toContain(`width="${mm(100)}" height="${mm(100)}"`);
    expect((dourado.match(new RegExp(`width="${mm(10)}" height="${mm(100)}"`, 'g')) ?? []).length).toBe(7);
    for (const f of [r.svgFracoesBarrasA4(), r.svgFracoesCirculosA4(), r.svgValorPosicionalA4({ ordens: 6 }), r.svgTangramA4()]) folhaSa(f);
    expect((r.svgTangramA4().match(/Z" fill="#ffffff"/g) ?? []).length).toBe(7);
    expect(r.svgValorPosicionalA4({ ordens: 3 })).not.toContain('aria-label="UM"');
  });

  it('coordenação, quadrinhos e cartões', async () => {
    const c = await import('./cartoes');
    for (const f of [c.svgTesouraA4(), c.svgTracarA4(), c.svgHqA4(3), c.svgHqA4(4), c.svgHqA4(6, { linhas: false })]) folhaSa(f);
    expect(c.lerNomes('  Ana \n\nTheo\n')).toEqual(['Ana', 'Theo']);
    const crachas = c.svgCrachasA4(c.lerNomes('Ana\nTheo\nDavi\nLuiza\nBruno\nMaria\nJoão\nPedro\nCarla'), '2º ano B');
    expect(crachas).toHaveLength(2);
    expect(crachas[1].svg).toContain('aria-label="Carla"');
    for (const f of [...crachas, ...c.svgCrachasA4([]), ...c.svgMarcadoresA4(['Theo']), ...c.svgEtiquetasA4([], '3º ano')]) folhaSa(f.svg);
  });

  it('pelo formulário: cada novo tipo dá folha com o pedido de partida', async () => {
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    for (const tipo of ['silabas', 'logica', 'contas', 'recortar', 'motora', 'cartoes'] as const) {
      const r = fazerFolhas(pedidoInicial(tipo));
      expect(r.folhas.length, tipo).toBeGreaterThan(0);
    }
    const silabas = pedidoInicial('silabas');
    if (silabas.tipo !== 'silabas') throw new Error('tipo');
    for (const modelo of ['familias', 'moveis', 'bingo', 'domino'] as const) {
      expect(fazerFolhas({ ...silabas, modelo }).folhas.length, modelo).toBeGreaterThan(0);
    }
    expect(fazerFolhas({ ...silabas, modelo: 'bingo', palavras: 'BA BE' }).folhas).toEqual([]);
  });
});
