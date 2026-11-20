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
function folhaSa(svgInteiro: string): void {
  // um desenho de livro aninhado (folha de pintar) tem as coordenadas dele: fica de fora da conta
  const aninhado = svgInteiro.indexOf('<svg', 1);
  const svg = aninhado < 0 ? svgInteiro : svgInteiro.slice(0, aninhado) + svgInteiro.slice(svgInteiro.lastIndexOf('</svg>', svgInteiro.lastIndexOf('</svg>') - 1) + 6);
  expect(svg).toContain('data-folha-a4="true"');
  expect(svg).toContain('viewBox="0 0 800 1131"');
  expect(svg).not.toMatch(/NaN|undefined|Infinity/);
  for (const m of svg.matchAll(/<(?:rect|line|circle)[^>]*?\b(?:x|x1|x2|cx)="(-?[\d.]+)"[^>]*?>/g)) {
    if (m[0].includes('transform=')) continue;
    expect(Number(m[1])).toBeGreaterThanOrEqual(-1);
    expect(Number(m[1])).toBeLessThanOrEqual(801);
  }
  // círculo também não pode passar da borda de baixo (os das frações passavam)
  for (const m of svg.matchAll(/<circle[^>]*?\bcy="(-?[\d.]+)"[^>]*?\br="([\d.]+)"[^>]*?>/g)) {
    expect(Number(m[1]) + Number(m[2])).toBeLessThanOrEqual(1131.5);
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

  it('a oficina está ligada (desde 2026-11-19)', async () => {
    const { FOLHAS_LIGADAS } = await import('./ligado');
    expect(FOLHAS_LIGADAS).toBe(true);
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

describe('ajustes pedidos pelo Bruno (2026-11-18)', () => {
  it('etiquetas levam a matéria quando ela é escrita', async () => {
    const { svgEtiquetasA4 } = await import('./cartoes');
    const [f] = svgEtiquetasA4(['Theo'], '2º ano', 'Ciências');
    expect(f.svg).toContain('aria-label="Ciências"');
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    const base = pedidoInicial('cartoes');
    if (base.tipo !== 'cartoes') throw new Error('tipo');
    expect(fazerFolhas({ ...base, modelo: 'etiquetas', nomes: 'Ana', materia: 'Português' }).folhas[0].svg).toContain('aria-label="Português"');
    // pedido guardado por uma versão sem o campo
    expect(fazerFolhas({ ...base, modelo: 'etiquetas', nomes: 'Ana' }).folhas).toHaveLength(1);
  });

  it('figura do calendário: preenche, cabe inteira e anda dentro da moldura', async () => {
    const { MOLDURA_DA_FIGURA: m, encaixeDaFigura, svgCalendarioA4, zoomFiguraInteira } = await import('./papeis');
    // foto deitada (4:3): no zoom 1 cobre a moldura toda
    const cobre = encaixeDaFigura(4 / 3);
    expect(cobre.w).toBeGreaterThanOrEqual(m.w - 0.01);
    expect(cobre.h).toBeGreaterThanOrEqual(m.h - 0.01);
    // inteira: cabe sem cortar
    const inteira = encaixeDaFigura(4 / 3, zoomFiguraInteira(4 / 3));
    expect(inteira.w).toBeLessThanOrEqual(m.w + 0.01);
    expect(inteira.h).toBeLessThanOrEqual(m.h + 0.01);
    // posição 0 encosta à esquerda; 100 encosta à direita
    expect(encaixeDaFigura(2, 1, 0, 50).x).toBeCloseTo(m.x);
    const direita = encaixeDaFigura(2, 1, 100, 50);
    expect(direita.x + direita.w).toBeCloseTo(m.x + m.w);
    // valores estragados não quebram
    expect(Number.isFinite(encaixeDaFigura(NaN, NaN, NaN, NaN).x)).toBe(true);
    const png = 'data:image/png;base64,iVBORw0KGgo=';
    const svg = svgCalendarioA4({ ano: 2027, mes: 11, imagem: png, aspecto: 1.5, zoom: 2, posX: 0, posY: 100 });
    expect(svg).toContain('preserveAspectRatio="none"');
    folhaSa(svg);
  });

  it('frações em círculos cabem na folha', async () => {
    const { svgFracoesCirculosA4 } = await import('./recortar');
    folhaSa(svgFracoesCirculosA4());
  });
});

describe('letra das folhas', () => {
  it('as três letras desenham as mesmas folhas, cada uma do seu jeito, e voltam à padrão', async () => {
    const { TIPOS, fazerFolhas, pedidoInicial } = await import('./pedido');
    const { escrever } = await import('./comum');
    const atkinson = escrever('Ação 2027', 0, 0, 100);
    for (const letra of ['atkinson', 'cardo', 'opendyslexic'] as const) {
      for (const t of TIPOS) {
        const r = fazerFolhas(pedidoInicial(t.tipo, new Date(2026, 10, 18)), letra);
        for (const f of r.folhas) folhaSa(f.svg);
      }
    }
    const cardo = fazerFolhas(pedidoInicial('reguas'), 'cardo').folhas[0].svg;
    const padrao = fazerFolhas(pedidoInicial('reguas')).folhas[0].svg;
    expect(cardo).not.toBe(padrao);
    // depois de fazer com outra letra, a padrão continua a mesma
    expect(escrever('Ação 2027', 0, 0, 100)).toBe(atkinson);
    // o texto continua legível para o leitor de tela, em qualquer letra
    expect(fazerFolhas(pedidoInicial('caca'), 'opendyslexic').folhas[0].svg).toContain('aria-label="MOTORISTA"');
  });
});

describe('rotina visual', () => {
  it('lê hora e passo, e acha o desenho pela frase ou pela palavra mais longa', async () => {
    const { figuraDoPasso, lerPassos } = await import('./rotina');
    expect(lerPassos('7:00 Acordar\n7h30 café da manhã\n8 - Pegar o ônibus\nIr para a escola\n\n19h Jantar')).toEqual([
      { hora: '7:00', texto: 'Acordar', figura: 'acordar' },
      { hora: '7:30', texto: 'café da manhã', figura: 'cafe' },
      { hora: '8:00', texto: 'Pegar o ônibus', figura: 'onibus' },
      { hora: '', texto: 'Ir para a escola', figura: 'escola' },
      { hora: '19:00', texto: 'Jantar', figura: 'comer' },
    ]);
    expect(figuraDoPasso('Escovar os dentes')).toBe('escovar-dentes');
    expect(figuraDoPasso('Lavar as mãos')).toBe('esfregar');
    expect(figuraDoPasso('Natação')).toBeUndefined();
    // número sozinho não é hora de um passo vazio
    expect(lerPassos('25 Acordar')[0].hora).toBe('');
  });

  it('os modelos prontos têm desenho em todos os passos', async () => {
    const { MODELOS, lerPassos } = await import('./rotina');
    for (const [nome, m] of Object.entries(MODELOS)) {
      for (const p of lerPassos(m.passos)) expect(p.figura, `${nome}: ${p.texto}`).toBeTruthy();
    }
  });

  it('as quatro folhas cabem no A4, com e sem hora, com muitos e poucos passos', async () => {
    const { MODELOS, folhasDaRotina, lerPassos } = await import('./rotina');
    const manha = lerPassos(MODELOS.manha.passos);
    const maos = lerPassos(MODELOS.maos.passos);
    const muitos = lerPassos(Array.from({ length: 13 }, (_, i) => `Passo ${i + 1} da escola`).join('\n'));
    for (const modelo of ['lista', 'passos', 'cartoes', 'primeiroDepois'] as const) {
      for (const passos of [manha, maos, muitos, manha.slice(0, 2), manha.slice(0, 1)]) {
        for (const f of folhasDaRotina(modelo, passos, { titulo: 'Teste', hora: true })) folhaSa(f.svg);
      }
    }
    expect(folhasDaRotina('lista', muitos)).toHaveLength(2);
    expect(folhasDaRotina('passos', maos)[0].svg).toContain('aria-label="SECAR COM A TOALHA"');
    expect(folhasDaRotina('passos', maos, { maiusculas: false })[0].svg).toContain('aria-label="Secar com a toalha"');
    // primeiro → depois com dois passos já vem preenchido; com mais, traz os cartões
    expect(folhasDaRotina('primeiroDepois', manha.slice(0, 2))).toHaveLength(1);
    expect(folhasDaRotina('primeiroDepois', manha.slice(0, 2))[0].svg).toContain('aria-label="ACORDAR"');
    expect(folhasDaRotina('primeiroDepois', manha).length).toBeGreaterThan(1);
  });

  it('pelo formulário: avisa o que ficou sem desenho', async () => {
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    const base = pedidoInicial('rotina');
    if (base.tipo !== 'rotina') throw new Error('tipo');
    expect(fazerFolhas(base).avisos).toEqual([]);
    const r = fazerFolhas({ ...base, passos: 'Natação\nAcordar' });
    expect(r.avisos.join(' ')).toContain('Natação');
    expect(fazerFolhas({ ...base, passos: '' }).avisos[0]).toContain('Escreva os passos');
  });
});

describe('sequência didática de um livro', () => {
  // monta o caderno inteiro dos 28 livros: com a máquina ocupada passa de 5 s
  it('serve para todos os livros de história da estante, e cada folha cabe no A4', { timeout: 30000 }, async () => {
    const { LIVROS_DA_SEQUENCIA, fazerFolhas, pedidoInicial } = await import('./pedido');
    expect(LIVROS_DA_SEQUENCIA.length).toBeGreaterThan(20);
    // em ordem alfabética e sem alfabetos nem números
    const titulos = LIVROS_DA_SEQUENCIA.map((l) => l.titulo);
    expect(titulos).toEqual([...titulos].sort((a, b) => a.localeCompare(b, 'pt-BR')));
    expect(LIVROS_DA_SEQUENCIA.some((l) => /alfabeto|números/i.test(l.titulo))).toBe(false);
    const base = pedidoInicial('sequencia');
    if (base.tipo !== 'sequencia') throw new Error('tipo');
    for (const l of LIVROS_DA_SEQUENCIA) {
      const r = fazerFolhas({ ...base, livro: l.id });
      expect(r.folhas.length, l.id).toBeGreaterThanOrEqual(6);
      for (const f of r.folhas) if (f.titulo !== 'Para pintar') folhaSa(f.svg);
    }
  });

  it('o caderno do Leão e o Ratinho: texto, perguntas do quiz, palavras, ordem e respostas', async () => {
    const { obterLivro } = await import('../conteudo/catalogo');
    const s = await import('./sequencia');
    const livro = obterLivro('o-leao-e-o-ratinho')!;
    const palavras = s.sugerirPalavras(livro);
    expect(palavras).toHaveLength(8);
    expect(palavras).toContain('LEÃO');
    expect(palavras).toContain('RATINHO');
    expect(palavras.some((p) => ['ELE', 'PARA', 'QUANDO', 'DISSE'].includes(p))).toBe(false);
    const historia = s.svgHistoriaA4(livro);
    expect(historia[0].svg).toContain('aria-label="O Leão e o Ratinho"');
    expect(historia.map((f) => f.svg).join('')).toContain('Esopo');
    const perguntas = s.svgPerguntasA4(livro)[0].svg;
    expect(perguntas).toContain('Por que o leão soltou o ratinho?');
    const momentos = s.momentosDaHistoria(livro);
    expect(momentos).toHaveLength(4);
    expect(momentos[0].startsWith('Num fim de tarde quente')).toBe(true);
    for (const m of momentos) expect(m.startsWith('—')).toBe(false);
    // a folha mostra as tiras fora de ordem, e a resposta diz a ordem certa
    const ordem = s.svgOrdemA4(livro)!.svg;
    expect(ordem.indexOf('Num fim de tarde')).toBeGreaterThan(ordem.indexOf(momentos[2].slice(0, 12)));
    const respostas = s.svgRespostasA4(livro).map((f) => f.svg).join('');
    expect(respostas).toContain(`as tiras são: ${s.EMBARALHO.map((i) => i + 1).join(', ')}.`);
    expect(respostas).toContain('Porque achou graça de um bichinho tão pequeno prometer ajuda');
    // sem sorte: o mesmo livro dá o mesmo caderno
    const um = s.montarSequencia(livro, { partes: {} });
    const dois = s.montarSequencia(livro, { partes: {} });
    expect(um).toEqual(dois);
  });

  it('respeita as partes escolhidas e as palavras de quem ensina', async () => {
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    const base = pedidoInicial('sequencia');
    if (base.tipo !== 'sequencia') throw new Error('tipo');
    const nada = Object.fromEntries(['texto', 'perguntas', 'caca', 'ordem', 'final', 'colorir', 'respostas'].map((k) => [k, false]));
    expect(fazerFolhas({ ...base, partes: nada }).folhas).toEqual([]);
    const caca = fazerFolhas({ ...base, partes: { ...nada, caca: true }, palavras: 'juba\nrede, corda' });
    expect(caca.folhas).toHaveLength(1);
    expect(caca.folhas[0].svg).toContain('aria-label="JUBA"');
    expect(caca.folhas[0].svg).toContain('aria-label="CORDA"');
    // o desenho de pintar vem do próprio livro, dentro da folha A4
    const pintar = fazerFolhas({ ...base, partes: { ...nada, colorir: true } });
    expect(pintar.folhas[0].svg.match(/<svg/g)?.length).toBe(2);
    expect(pintar.folhas[0].svg).toContain('x="48" y="186" width="704" height="870"');
    expect(fazerFolhas({ ...base, livro: 'nao-existe' }).avisos[0]).toContain('Escolha um livro');
  });
});

describe('contas da professora', () => {
  it('lê as quatro operações escritas de vários jeitos, e diz o que ficou de fora', async () => {
    const { lerContas } = await import('./contas');
    const { contas, fora } = lerContas('345 + 278\n502 - 167\n36 x 4\n12*3\n7 × 8\n84 ÷ 4\n90/9\n56 : 7\n5 - 9\n85 ÷ 4\n7 ÷ 0\nbanana\n\n2 + 2 =');
    expect(contas.map((c) => `${c.a}${c.op}${c.b}=${c.resultado}`)).toEqual([
      '345+278=623', '502-167=335', '36x4=144', '12x3=36', '7x8=56', '84/4=21', '90/9=10', '56/7=8', '2+2=4',
    ]);
    expect(fora.map((f) => f.linha)).toEqual(['5 - 9', '85 ÷ 4', '7 ÷ 0', 'banana']);
    expect(fora[1].motivo).toContain('sobra 1');
  });

  it('a folha usa as contas escritas, misturadas, e cabe no A4', async () => {
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    const base = pedidoInicial('contas');
    if (base.tipo !== 'contas') throw new Error('tipo');
    const r = fazerFolhas({ ...base, proprias: '345 + 278\n84 ÷ 4\n123456 - 1\n9 x 9' });
    expect(r.folhas).toHaveLength(2); // a folha e as respostas
    expect(r.folhas[0].titulo).toBe('Contas');
    // a resposta vai algarismo por algarismo, uma caixa cada: a folha de respostas tem
    // os 3 + 2 + 6 + 2 algarismos dos resultados (623, 21, 123455, 81) a mais
    const algarismos = (svg: string) => (svg.match(/aria-label="\d"/g) ?? []).length;
    expect(algarismos(r.folhas[1].svg) - algarismos(r.folhas[0].svg)).toBe(13);
    for (const f of r.folhas) folhaSa(f.svg);
    expect(fazerFolhas({ ...base, proprias: '   ' }).folhas[0].titulo).toBe('Adição');
  });
});

describe('versão do aluno e do professor', () => {
  it('toda folha de respostas é reconhecida, e só elas', async () => {
    const { TIPOS, ehDoProfessor, fazerFolhas, folhasPara, pedidoInicial } = await import('./pedido');
    let doProfessor = 0;
    for (const t of TIPOS) {
      const r = fazerFolhas(pedidoInicial(t.tipo, new Date(2026, 10, 18)));
      for (const f of r.folhas) {
        // uma folha de respostas nunca tem a linha de "Nome:" do aluno
        const temNome = f.svg.includes('aria-label="Nome:"');
        if (ehDoProfessor(f)) {
          doProfessor++;
          expect(temNome, f.titulo).toBe(false);
        }
      }
      const aluno = folhasPara(r.folhas, 'aluno');
      const professor = folhasPara(r.folhas, 'professor');
      if (r.folhas.some(ehDoProfessor)) expect(aluno.length + professor.length, t.tipo).toBe(r.folhas.length);
      else expect(professor, t.tipo).toEqual(r.folhas); // sem respostas: igual nas duas
      expect(aluno.some(ehDoProfessor)).toBe(false);
    }
    expect(doProfessor).toBeGreaterThanOrEqual(5);
  });
});

describe('capas e ornamentos', () => {
  it('as três capas, com cada ornamento, cabem na folha e não levam selo nem coleção', async () => {
    const { svgCapaA4 } = await import('./capas');
    const { ORNAMENTOS } = await import('./ornamentos');
    const dados = {
      alto: 'Escola Exemplo\n3º ano B',
      titulo: 'Meu caderno de histórias com um título bem comprido para quebrar',
      subtitulo: 'Subtítulo',
      nome: 'Theo',
      rodape: 'Porto Alegre\n2026',
      itens: 'Autora Um — Primeiro texto\nAutor Dois — Segundo texto',
    };
    for (const modelo of ['moldura', 'abnt', 'leituras'] as const) {
      for (const ornamento of Object.keys(ORNAMENTOS) as Array<keyof typeof ORNAMENTOS>) {
        const svg = svgCapaA4(modelo, { ...dados, ornamento });
        folhaSa(svg);
        expect(svg).not.toMatch(/Pedra Angular|Διαφορεύς|PEDRA ANGULAR/);
      }
    }
    // sem nome, a capa de moldura traz a linha para escrever
    expect(svgCapaA4('moldura', { titulo: 'X' })).toContain('aria-label="Nome:"');
    // a ABNT não tem moldura, mesmo se pedirem
    expect(svgCapaA4('abnt', { titulo: 'X', ornamento: 'meandro' })).not.toContain('M0,15H');
  });

  it('letra espaçada: as palavras continuam separadas', async () => {
    const { escrever, largura } = await import('./comum');
    expect(largura('AB', 100, 0.5)).toBeCloseTo(largura('AB', 100) + 50, 5);
    expect(escrever('Escola Exemplo', 0, 0, 20, 'start', Infinity, 0.3)).toContain('aria-label="Escola Exemplo"');
  });

  it('pelo formulário', async () => {
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    const base = pedidoInicial('capa');
    if (base.tipo !== 'capa') throw new Error('tipo');
    expect(fazerFolhas(base).folhas).toHaveLength(1);
    expect(fazerFolhas({ ...base, modelo: 'abnt' }).avisos[0]).toContain('instituição');
    expect(fazerFolhas({ ...base, ornamento: 'inexistente' as never }).folhas[0].svg).toContain('<path d="M0,15H');
  });
});

describe('meandro e estilos (2026-11-18)', () => {
  it('a grega é a do Pedra Angular: a mesma célula, e as voltas ligadas pela base', async () => {
    const { GREGA_D_DEITADA, gregaTracado, gregaTracadoEmPe, molduraDeGrega, FAIXA } = await import('./ornamentos');
    // a fórmula de app-leitura/src/components/GregaMeandro.tsx (e do Gerador)
    expect(GREGA_D_DEITADA).toBe('M0,15H14M3,15V1H13V11H7V5H9');
    expect(gregaTracado(1)).toBe(GREGA_D_DEITADA);
    expect(gregaTracadoEmPe(1)).toBe('M15,0V14M15,3H1V13H11V7H5V9');
    // uma base corrida só, para todas as voltas
    expect(gregaTracado(5).match(/M0,15H70/g)).toHaveLength(1);
    // o quadro nasce da grade: a moldura tem um número inteiro de células nos dois sentidos
    const cel = (FAIXA * 14) / 16;
    const { dentro } = molduraDeGrega(40, 40, 720, 1051);
    expect(((dentro.w + 2 * FAIXA) / cel) % 1).toBeCloseTo(0, 6);
    expect((dentro.h / cel) % 1).toBeCloseTo(0, 6);
  });

  it('negrito e itálico de verdade, nas três letras, e voltam ao normal', async () => {
    const { comEstilo, comLetra, escrever, largura } = await import('./comum');
    for (const letra of ['atkinson', 'cardo', 'opendyslexic'] as const) {
      comLetra(letra, () => {
        const normal = escrever('Ação', 0, 0, 100);
        const negrito = comEstilo('negrito', () => escrever('Ação', 0, 0, 100));
        const italico = comEstilo('italico', () => escrever('Ação', 0, 0, 100));
        expect(negrito, letra).not.toBe(normal);
        expect(italico, letra).not.toBe(normal);
        expect(negrito).not.toContain('stroke-width'); // não é traço engrossado
        expect(escrever('Ação', 0, 0, 100)).toBe(normal);
        // o negrito é mais largo: a medida acompanha o estilo
        expect(comEstilo('negrito', () => largura('Ação', 100))).toBeGreaterThan(largura('Ação', 100));
      });
    }
  });

  it('as capas seguem o padrão da Oficina e aceitam trocar o estilo de cada parte', async () => {
    const { svgCapaA4 } = await import('./capas');
    const { comEstilo, escrever } = await import('./comum');
    const sub = 'Subtítulo de prova';
    const capa = svgCapaA4('moldura', { titulo: 'X', subtitulo: sub });
    // por padrão, o subtítulo vai em itálico
    const italico = comEstilo('italico', () => escrever(sub, 0, 0, 10));
    const primeiraLetra = (svg: string) => svg.match(/<path d="([^"]+)"/)?.[1];
    expect(capa).toContain(primeiraLetra(italico)!);
    const normal = svgCapaA4('moldura', { titulo: 'X', subtitulo: sub, estilos: { subtitulo: 'normal' } });
    expect(normal).not.toContain(primeiraLetra(italico)!);
  });
});

describe('código da folha', () => {
  it('todo tipo de folha vai e volta pelo código, sem mudar nada', async () => {
    const { TIPOS, fazerFolhas, pedidoInicial } = await import('./pedido');
    const { codificar, decodificar, CAMPOS_NO_CODIGO, TIPOS_NO_CODIGO } = await import('./codigo');
    expect([...TIPOS_NO_CODIGO].sort()).toEqual(TIPOS.map((t) => t.tipo).sort());
    for (const t of TIPOS) {
      const p = pedidoInicial(t.tipo, new Date(2027, 4, 9)); // outra data: o mês e o ano entram no código
      for (const k of Object.keys(p)) if (k !== 'tipo') expect(CAMPOS_NO_CODIGO, `${t.tipo}.${k}`).toContain(k);
      for (const letra of ['atkinson', 'cardo'] as const) {
        const r = codificar(p, letra);
        if ('erro' in r) throw new Error(`${t.tipo}: ${r.erro}`);
        expect(r.codigo).toMatch(/^H1(-[0-9A-HJKMNP-TV-Z]{1,4})+$/);
        const d = decodificar(r.codigo);
        if ('erro' in d) throw new Error(`${t.tipo}: ${d.erro}`);
        expect(d.pedido, t.tipo).toEqual(p);
        expect(d.letra).toBe(letra);
        expect(fazerFolhas(d.pedido, d.letra).folhas).toEqual(fazerFolhas(p, letra).folhas);
      }
    }
  });

  it('lê como se digita, e pega erro de digitação', async () => {
    const { codificar, decodificar } = await import('./codigo');
    const { pedidoInicial } = await import('./pedido');
    const p = { ...pedidoInicial('contas', new Date(2026, 0, 1)), semente: 3 };
    const r = codificar(p);
    if ('erro' in r) throw new Error(r.erro);
    // minúscula, sem traço, com espaço, e O/I/L no lugar de 0/1
    const solto = r.codigo.toLowerCase().replace(/-/g, ' ').replace(/0/g, 'o').replace(/1/g, 'l');
    expect(decodificar(solto)).toMatchObject({ pedido: p });
    // um caractere trocado não passa
    const k = r.codigo.length - 4;
    const trocado = r.codigo.slice(0, k) + (r.codigo[k] === 'A' ? 'B' : 'A') + r.codigo.slice(k + 1);
    expect(decodificar(trocado)).toMatchObject({ erro: expect.stringContaining('não confere') });
    expect(decodificar('')).toMatchObject({ erro: expect.stringContaining('Digite') });
    expect(decodificar('banana')).toMatchObject({ erro: expect.stringContaining('H1') });
    expect(decodificar('H2-AAAA')).toMatchObject({ erro: expect.stringContaining('outra versão') });
  });

  it('não há código com nome de aluno, nem com a figura do calendário dentro', async () => {
    const { codificar, decodificar } = await import('./codigo');
    const { pedidoInicial } = await import('./pedido');
    const cartoes = pedidoInicial('cartoes');
    if (cartoes.tipo !== 'cartoes') throw new Error('tipo');
    expect(codificar({ ...cartoes, modelo: 'crachas', nomes: 'Theo\nDavi' })).toMatchObject({ erro: expect.stringContaining('nomes') });
    expect(codificar({ ...cartoes, modelo: 'crachas', nomes: '' })).toHaveProperty('codigo');
    const cal = pedidoInicial('calendario', new Date(2026, 0, 1));
    if (cal.tipo !== 'calendario') throw new Error('tipo');
    const r = codificar({ ...cal, imagem: 'data:image/png;base64,AAAA', aspecto: 1.5 });
    if ('erro' in r) throw new Error(r.erro);
    const d = decodificar(r.codigo);
    if ('erro' in d) throw new Error(d.erro);
    expect(d.pedido).not.toHaveProperty('imagem');
  });

  it('o código vai na folha do professor; na do aluno, não', async () => {
    const { fazerFolhas, pedidoInicial, ehDoProfessor } = await import('./pedido');
    const { folhasComCodigo } = await import('./codigo');
    const r = fazerFolhas(pedidoInicial('contas'));
    const com = folhasComCodigo(r.folhas, 'H1-TEST-E');
    for (const f of com) expect(f.svg.includes('Código desta folha: H1-TEST-E'), f.titulo).toBe(ehDoProfessor(f));
    // folha sem respostas (pauta): leva em todas
    const pauta = folhasComCodigo(fazerFolhas(pedidoInicial('pauta')).folhas, 'H1-TEST-E');
    expect(pauta.every((f) => f.svg.includes('H1-TEST-E'))).toBe(true);
    for (const f of [...com, ...pauta]) folhaSa(f.svg);
  });

  // FOLHAS DE REFERÊNCIA: códigos de verdade, de 2026-11-18, e a impressão
  // digital das folhas que eles montam. Se um destes reprovar, um código já
  // impresso passaria a montar OUTRA folha. Ou se conserta o gerador, ou se
  // sobe a versão do código (H2) — nunca se troca o número aqui por conveniência.
  it('códigos antigos montam exatamente as mesmas folhas', async () => {
    const { decodificar } = await import('./codigo');
    const { fazerFolhas } = await import('./pedido');
    const { semear } = await import('./comum');
    const referencia: Array<[string, string, number]> = [
      ['contas, semente 3', 'H1-64RQ-WC3Y-6CYK-6V', 3069774258],
      ['contas da professora', 'H1-64RQ-WCBY-6GV3-T9SK-6GTJ-0AS0-68VK-G2HR-6GGC-7DS0-6GY', 4258368771],
      ['caça-palavras de partida', 'H1-61Z3-0Q', 3530621921],
      [
        'caça difícil',
        'H1-61Z3-4ZHH-7MKM-RHE3-GD7G-MMJ1-AH4M-WJ2F-1994-AH25-1934-RKTJ-8N9N-8GBY-68YJ-ES39-CSMP-6TBC-FRSK-TCG9',
        3320072605,
      ],
      ['labirinto grande', 'H1-64R7-WC3Y-68YJ-ES39-CSMP-6TBC-FRSK-TD85', 2720904972],
      ['sudoku 6', 'H1-64R7-WC3Y-6MYJ-EWVN-CHQP-PX9P-FRSK-TC8P', 547246054],
      ['parábola', 'H1-6XZ3-0ZHJ-74YN-8ZHM-7NA0-3', 1988075199],
      ['sequência do Leão', 'H1-64V7-WC8V', 142976344],
    ];
    for (const [nome, codigo, impressao] of referencia) {
      const d = decodificar(codigo);
      if ('erro' in d) throw new Error(`${nome}: ${d.erro}`);
      const folhas = fazerFolhas(d.pedido, d.letra).folhas;
      expect(semear(folhas.map((f) => f.svg).join('|')), nome).toBe(impressao);
    }
  });
});

describe('fazer no app: a folha pronta para pintar', () => {
  it('caixas e formas fechadas viram regiões; letras e desenhos ficam como estão', async () => {
    const { folhaParaPintar } = await import('./pintar');
    const svg =
      '<svg><rect x="0" y="0" width="800" height="1131" fill="#ffffff"/>' +
      '<rect x="10" y="10" width="40" height="40" rx="5" fill="none" stroke="#000"/>' +
      '<circle cx="5" cy="5" r="3" fill="none" stroke="#000"/>' +
      '<path d="M0 0L10 0L10 10Z" fill="#ffffff" stroke="#000"/>' +
      '<path d="M0 0H50" fill="none" stroke="#000"/>' +
      '<g fill="#000"><path d="M1 1L2 2Z"/></g>' +
      '<circle cx="1" cy="1" r="1" fill="#000000"/>' +
      '<rect id="regiao-fundo" class="colorir-alvo" fill="#ffffff"/></svg>';
    const r = folhaParaPintar(svg);
    expect(r.regioes).toBe(4);
    expect((r.svg.match(/class="colorir-alvo"/g) ?? []).length).toBe(5);
    expect(r.svg).toContain('<path d="M0 0H50" fill="none" stroke="#000"/>');
    expect(r.svg).toContain('<g fill="#000"><path d="M1 1L2 2Z"/></g>');
    expect(r.svg).toContain('<circle cx="1" cy="1" r="1" fill="#000000"/>');
    // ids únicos
    const ids = [...r.svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda folha de todo tipo abre para pintar, e quase todas têm onde usar o balde', async () => {
    const { TIPOS, fazerFolhas, pedidoInicial } = await import('./pedido');
    const { folhaParaPintar } = await import('./pintar');
    let semRegiao = 0;
    for (const t of TIPOS) {
      for (const f of fazerFolhas(pedidoInicial(t.tipo, new Date(2026, 10, 18))).folhas) {
        const r = folhaParaPintar(f.svg);
        if (r.regioes === 0 && !r.svg.includes('colorir-alvo')) semRegiao++;
        const ids = [...r.svg.matchAll(/\sid="(regiao-[^"]+)"/g)].map((m) => m[1]);
        expect(new Set(ids).size, `${t.tipo} ${f.titulo}`).toBe(ids.length);
      }
    }
    expect(semRegiao).toBe(0);
  });
});

describe('casas para pintar (etapa 2)', () => {
  it('com as casas ligadas, as grades ganham casas; na folha impressa, nada muda', async () => {
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    const { comCasas } = await import('./comum');
    const { folhaParaPintar } = await import('./pintar');
    const casas = (svg: string) => (svg.match(/data-casa="1"/g) ?? []).length;
    // os pedidos vão por `never`: cada um é de um tipo de folha diferente
    const casos: Array<[string, () => never, number]> = [
      ['calendário de novembro de 2026 (5 semanas)', () => ({ ...pedidoInicial('calendario', new Date(2026, 10, 1)), modelo: 'figura' }) as never, 35],
      ['sudoku 4 × 4', () => ({ ...pedidoInicial('logica'), modelo: 'sudoku4' }) as never, 16],
      ['caça-palavras', () => pedidoInicial('caca') as never, 1],
      ['quadriculado de 1 cm', () => pedidoInicial('grade') as never, 1],
      ['labirinto pequeno', () => pedidoInicial('logica') as never, 48],
      ['tábua (as 100 casas de dentro; as 20 da cabeça começam cinza)', () => ({ ...pedidoInicial('contas'), modelo: 'tabua' }) as never, 100],
    ];
    for (const [nome, pedido, minimo] of casos) {
      const impressa = fazerFolhas(pedido()).folhas[0].svg;
      const pintar = comCasas(() => fazerFolhas(pedido())).folhas[0].svg;
      expect(casas(impressa), nome).toBe(0);
      expect(casas(pintar), nome).toBeGreaterThanOrEqual(minimo);
      // na tela de pintura, cada casa é região transparente (o que está embaixo aparece)
      const pronta = folhaParaPintar(pintar).svg;
      expect((pronta.match(/data-casa="1"[^>]*class="colorir-alvo" fill="transparent"|class="colorir-alvo" fill="transparent"/g) ?? []).length, nome).toBeGreaterThanOrEqual(minimo);
      folhaSa(pintar);
    }
    const tabua = comCasas(() => fazerFolhas({ ...pedidoInicial('contas'), modelo: 'tabua' } as never)).folhas[0].svg;
    expect(casas(tabua)).toBe(120);
    expect((folhaParaPintar(tabua).svg.match(/class="colorir-alvo" fill="#d9d9d9"/g) ?? []).length).toBe(20);
    // o tabuleiro: 64 casas, as escuras começam cinza
    const tab = comCasas(() => fazerFolhas({ ...pedidoInicial('jogo'), jogo: 'xadrez' } as never)).folhas[0].svg;
    expect(casas(tab)).toBe(64);
    expect((folhaParaPintar(tab).svg.match(/class="colorir-alvo" fill="#bdbdbd"/g) ?? []).length).toBe(32);
    // frações: 1 + 2 + 3 + 4 + 5 + 6 + 8 + 10 + 12 partes; e as fatias dos círculos
    const barras = comCasas(() => fazerFolhas({ ...pedidoInicial('recortar'), modelo: 'barras' } as never)).folhas[0].svg;
    expect(casas(barras)).toBe(51);
    const circulos = comCasas(() => fazerFolhas({ ...pedidoInicial('recortar'), modelo: 'circulos' } as never)).folhas[0].svg;
    expect(casas(circulos)).toBe(2 + 3 + 4 + 5 + 6 + 8);
  });

  it('a casa não ganha contorno no desenho de cima nem na impressão do que foi pintado', async () => {
    const { contornoPreto } = await import('../impressao/folhaPintada');
    const svg = '<svg><rect id="regiao-f1" class="colorir-alvo" fill="transparent" data-casa="1" stroke="none"/><rect id="regiao-f2" class="colorir-alvo" fill="#ffffff"/></svg>';
    const c = contornoPreto(svg);
    expect(c).toMatch(/id="regiao-f1"[^>]*stroke="none"/);
    expect(c).toMatch(/id="regiao-f2"[^>]*stroke="#000000"/);
  });
});

describe('casas por cima da moldura', () => {
  it('no sudoku e no tabuleiro, toda casa vem depois da última região que não é casa', async () => {
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    const { comCasas } = await import('./comum');
    const { folhaParaPintar } = await import('./pintar');
    for (const p of [{ ...pedidoInicial('logica'), modelo: 'sudoku4' }, { ...pedidoInicial('jogo'), jogo: 'xadrez' }]) {
      const svg = folhaParaPintar(comCasas(() => fazerFolhas(p as never)).folhas[0].svg).svg;
      const ultimaMoldura = Math.max(...[...svg.matchAll(/<[a-z]+ [^>]*class="colorir-alvo"[^>]*>/g)].filter((m) => !m[0].includes('data-casa')).map((m) => m.index!));
      const primeiraCasa = svg.indexOf('data-casa="1"');
      expect(primeiraCasa).toBeGreaterThan(ultimaMoldura);
      expect(svg.trim().endsWith('</svg>')).toBe(true);
    }
  });
});

describe('partes dos desenhos (a carinha separada do fundo)', () => {
  it('as formas fechadas do desenho viram partes, por cima das casas, sem mudar a folha impressa', async () => {
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    const { comCasas } = await import('./comum');
    const { folhaParaPintar } = await import('./pintar');
    const p = { ...pedidoInicial('jogo'), jogo: 'memoria' } as never;
    expect(fazerFolhas(p).folhas[0].svg).not.toContain('<!--desenho-->');
    const svg = folhaParaPintar(comCasas(() => fazerFolhas(p)).folhas[0].svg).svg;
    const partes = svg.match(/data-parte="1"/g) ?? [];
    expect(partes.length).toBeGreaterThanOrEqual(12); // os rostos, as bocas, o ônibus…
    // todas as partes vêm depois de todas as casas (o toque no rosto pinta o rosto)
    expect(svg.indexOf('data-parte="1"')).toBeGreaterThan(svg.lastIndexOf('data-casa="1"'));
    // o olho cheio (detalhe preto) não vira parte
    expect(svg).not.toMatch(/fill="currentColor"[^>]*data-parte/);
    // o marcador não sobra na folha pronta
    expect(svg).not.toContain('<!--desenho-->');
  });

  it('no contorno, a parte do desenho fica com o traço dele', async () => {
    const { contornoPreto } = await import('../impressao/folhaPintada');
    const c = contornoPreto('<svg><g stroke="#000" stroke-width="5"><circle id="regiao-f1" class="colorir-alvo" fill="transparent" data-parte="1" r="40"/></g></svg>');
    expect(c).toMatch(/id="regiao-f1"[^>]*fill="none"/);
    expect(c).not.toMatch(/id="regiao-f1"[^>]*stroke=/);
  });
});

describe('jogos na tela: as regras', () => {
  it('caça-palavras: a linha do dedo, nos dois sentidos, acha a palavra; um L não é linha', async () => {
    const { gerarCacaPalavras } = await import('./cacaPalavras');
    const { casasDoAchado, linhaEntre, palavraNaLinha } = await import('./jogo');
    expect(linhaEntre([0, 0], [0, 3])).toEqual([[0, 0], [0, 1], [0, 2], [0, 3]]);
    expect(linhaEntre([3, 3], [0, 0])).toHaveLength(4);
    expect(linhaEntre([0, 0], [1, 2])).toEqual([]);
    const jogo = gerarCacaPalavras({ palavras: ['ÔNIBUS', 'PARADA', 'LINHA', 'CENTRO'], nivel: 'dificil' });
    for (const a of jogo.achados) {
      const casas = casasDoAchado(a);
      const ida = linhaEntre(casas[0], casas[casas.length - 1]);
      expect(palavraNaLinha(jogo, ida)?.palavra).toBe(a.palavra);
      expect(palavraNaLinha(jogo, [...ida].reverse())?.palavra).toBe(a.palavra);
      // uma letra a menos não é a palavra
      expect(palavraNaLinha(jogo, ida.slice(1))).toBeUndefined();
    }
  });

  it('cruzadinha: casas, cruzamentos, palavra completa e o cursor que anda', async () => {
    const { gerarCruzadinha } = await import('./cruzadinha');
    const { casasDaEntrada, entradaCompleta, entradasDaCasa, letraLimpa, proximaCasa } = await import('./jogo');
    const jogo = gerarCruzadinha([
      { palavra: 'CASA', dica: 'onde se mora' },
      { palavra: 'SAPO', dica: 'pula na lagoa' },
      { palavra: 'ASA', dica: 'do passarinho' },
    ]);
    expect(letraLimpa('ã')).toBe('A');
    expect(letraLimpa('ç')).toBe('C');
    const e = jogo.entradas[0];
    const casas = casasDaEntrada(e);
    const letras: Record<string, string> = {};
    casas.forEach(([l, c], k) => (letras[`${l},${c}`] = e.letras[k]));
    expect(entradaCompleta(e, letras)).toBe(true);
    letras[`${casas[0][0]},${casas[0][1]}`] = 'X';
    expect(entradaCompleta(e, letras)).toBe(false);
    expect(proximaCasa(e, casas[0])).toEqual(casas[1]);
    expect(proximaCasa(e, casas[casas.length - 1])).toBeUndefined();
    // há pelo menos um cruzamento: uma casa com duas palavras
    const cruzamentos = jogo.entradas.flatMap(casasDaEntrada).filter((c) => entradasDaCasa(jogo, c).length === 2);
    expect(cruzamentos.length).toBeGreaterThan(0);
  });
});

describe('cruzadinhas prontas', () => {
  it('cada tema encaixa todas as palavras, com dica, e a ordem dá a volta', async () => {
    const { CRUZADINHAS_PRONTAS, proximaPronta, textoDaPronta } = await import('./cruzadinhasProntas');
    const { gerarCruzadinha } = await import('./cruzadinha');
    const { lerItens } = await import('./pedido');
    expect(CRUZADINHAS_PRONTAS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(CRUZADINHAS_PRONTAS.map((p) => p.id)).size).toBe(CRUZADINHAS_PRONTAS.length);
    for (const p of CRUZADINHAS_PRONTAS) {
      const jogo = gerarCruzadinha(p.itens);
      expect(jogo.fora, p.id).toEqual([]);
      expect(p.itens.every((x) => x.dica.length > 5), p.id).toBe(true);
      // o texto do formulário volta às mesmas palavras e dicas
      expect(lerItens(textoDaPronta(p))).toEqual(p.itens);
    }
    expect(proximaPronta(CRUZADINHAS_PRONTAS[0].id).id).toBe(CRUZADINHAS_PRONTAS[1].id);
    expect(proximaPronta(CRUZADINHAS_PRONTAS[CRUZADINHAS_PRONTAS.length - 1].id).id).toBe(CRUZADINHAS_PRONTAS[0].id);
    expect(proximaPronta(undefined).id).toBe(CRUZADINHAS_PRONTAS[0].id);
  });

  it('a pronta vai e volta pelo código', async () => {
    const { CRUZADINHAS_PRONTAS, textoDaPronta } = await import('./cruzadinhasProntas');
    const { codificar, decodificar } = await import('./codigo');
    const { pedidoInicial } = await import('./pedido');
    const base = pedidoInicial('cruzadinha');
    const pronta = CRUZADINHAS_PRONTAS[3];
    const p = { ...base, pronta: pronta.id, titulo: pronta.tema, itens: textoDaPronta(pronta) } as never;
    const r = codificar(p);
    if ('erro' in r) throw new Error(r.erro);
    const d = decodificar(r.codigo);
    if ('erro' in d) throw new Error(d.erro);
    expect(d.pedido).toEqual(p);
  });
});

// O PEDIDO DE PARTIDA NÃO PODE MUDAR: o código guarda só o que difere dele, e
// um código já impresso passaria a montar outra folha. Mudou de propósito?
// Então é versão nova do código (H2). Nunca trocar este número por conveniência.
describe('pedido de partida congelado', () => {
  it('os pedidos de partida de todos os tipos são os de 2026-11-18', async () => {
    const { pedidoInicial } = await import('./pedido');
    const { TIPOS_NO_CODIGO, DATA_DE_REFERENCIA } = await import('./codigo');
    const { semear } = await import('./comum');
    expect(semear(JSON.stringify(TIPOS_NO_CODIGO.map((t) => pedidoInicial(t, DATA_DE_REFERENCIA))))).toBe(1418603485);
  });
});

describe('a oficina em seções e os Jogos da criança (2026-11-19)', () => {
  it('cada tipo mora numa seção, e nenhuma seção fica vazia', async () => {
    const { TIPOS, SECOES, TIPOS_DE_FOLHA_TODOS, tiposDaSecao } = await import('./pedido').then((m) => ({
      ...m,
      TIPOS_DE_FOLHA_TODOS: m.TIPOS.map((t) => t.tipo),
    }));
    expect(new Set(TIPOS_DE_FOLHA_TODOS).size).toBe(TIPOS.length);
    for (const t of TIPOS) expect(SECOES.map((s) => s.id)).toContain(t.secao);
    for (const s of SECOES) expect(tiposDaSecao(s.id).length).toBeGreaterThan(0);
    // as sílabas (bingo e dominó) aparecem também nos jogos
    expect(tiposDaSecao('jogos').map((t) => t.tipo)).toContain('silabas');
    expect(tiposDaSecao('atividades').map((t) => t.tipo)).toContain('silabas');
  });

  it('todo tema pronto vira caça-palavras com as 8 palavras, nos dois níveis', async () => {
    const { CRUZADINHAS_PRONTAS } = await import('./cruzadinhasProntas');
    const { jogoDoTema } = await import('./jogosDaCrianca');
    for (const pronta of CRUZADINHAS_PRONTAS) {
      expect(pronta.emoji).toBeTruthy();
      for (const nivel of ['facil', 'medio'] as const) {
        const alvo = jogoDoTema('caca', pronta, nivel);
        expect(alvo.tipo).toBe('caca');
        if (alvo.tipo !== 'caca') continue;
        expect(alvo.jogo.fora, `${pronta.id} ${nivel}`).toEqual([]);
        expect(alvo.jogo.achados).toHaveLength(8);
        // a mesma grade, sempre
        expect(JSON.stringify(jogoDoTema('caca', pronta, nivel))).toBe(JSON.stringify(alvo));
      }
      const cruz = jogoDoTema('cruzadinha', pronta);
      expect(cruz.tipo === 'cruzadinha' && cruz.jogo.entradas.length).toBe(8);
    }
  });

  it('o progresso é de cada criança, e o ✓ só vem com o tema inteiro', async () => {
    const { CRUZADINHAS_PRONTAS } = await import('./cruzadinhasProntas');
    const { chaveDoJogo, jogoDoTema, terminado } = await import('./jogosDaCrianca');
    expect(chaveDoJogo('theo', 'cruzadinha', 'bichos', 'facil')).not.toBe(chaveDoJogo('davi', 'cruzadinha', 'bichos', 'facil'));
    expect(chaveDoJogo('theo', 'caca', 'bichos', 'facil')).not.toBe(chaveDoJogo('theo', 'caca', 'bichos', 'medio'));
    const caca = jogoDoTema('caca', CRUZADINHAS_PRONTAS[0], 'facil');
    if (caca.tipo !== 'caca') throw new Error('caça');
    const todas = caca.jogo.achados.map((a) => a.letras);
    expect(terminado(caca, { achadas: todas.slice(1) })).toBe(false);
    expect(terminado(caca, { achadas: todas })).toBe(true);
    expect(terminado(caca, undefined)).toBe(false);
    const cruz = jogoDoTema('cruzadinha', CRUZADINHAS_PRONTAS[0]);
    if (cruz.tipo !== 'cruzadinha') throw new Error('cruz');
    const letras: Record<string, string> = {};
    for (const e of cruz.jogo.entradas)
      [...e.letras].forEach((l, k) => (letras[e.direcao === 'horizontal' ? `${e.linha},${e.coluna + k}` : `${e.linha + k},${e.coluna}`] = l));
    expect(terminado(cruz, { letras })).toBe(true);
    expect(terminado(cruz, { letras: {} })).toBe(false);
  });
});

describe('sudoku na tela (2026-11-19)', () => {
  it('a tela joga o MESMO sudoku da folha', async () => {
    const { jogoDoPedido, pedidoInicial } = await import('./pedido');
    const { gerarSudoku } = await import('./logica');
    const base = pedidoInicial('logica');
    expect(jogoDoPedido(base)?.tipo).toBe('labirinto'); // desde 2026-11-19 o labirinto também se joga
    for (const modelo of ['sudoku4', 'sudoku6', 'sudokuFiguras'] as const) {
      const alvo = jogoDoPedido({ tipo: 'logica', modelo, nivel: 'facil', semente: 3, respostas: false });
      expect(alvo?.tipo).toBe('sudoku');
      if (alvo?.tipo !== 'sudoku') continue;
      expect(alvo.jogo).toEqual(gerarSudoku(modelo === 'sudoku6' ? 6 : 4, 3));
      expect(alvo.figuras).toBe(modelo === 'sudokuFiguras');
    }
  });

  it('festeja só o que fecha certo; a ajuda vai sempre à mesma casa', async () => {
    const { gerarSudoku } = await import('./logica');
    const { casaDaAjuda, gruposCertos, proximaVazia, sudokuCompleto, valorDaCasa } = await import('./jogo');
    const s = gerarSudoku(4, 0);
    const valores: Record<string, number> = {};
    expect(sudokuCompleto(s, valores)).toBe(false);
    const primeira = casaDaAjuda(s, valores)!;
    expect(s.pistas[primeira[0]][primeira[1]]).toBe(0);
    expect(casaDaAjuda(s, valores)).toEqual(primeira);
    // um valor errado: nada fecha, e a ajuda (sem vazias) iria até ele
    for (let l = 0; l < 4; l++) for (let c = 0; c < 4; c++) if (!s.pistas[l][c]) valores[`${l},${c}`] = s.solucao[l][c];
    expect(sudokuCompleto(s, valores)).toBe(true);
    expect(casaDaAjuda(s, valores)).toBeUndefined();
    const [l, c] = primeira;
    valores[`${l},${c}`] = (s.solucao[l][c] % 4) + 1;
    expect(gruposCertos(s, valores, l, c)).toEqual([]);
    expect(casaDaAjuda(s, valores)).toEqual(primeira);
    valores[`${l},${c}`] = s.solucao[l][c];
    expect(gruposCertos(s, valores, l, c)).toEqual(['linha', 'coluna', 'bloco']);
    expect(valorDaCasa(s, valores, l, c)).toBe(s.solucao[l][c]);
    expect(proximaVazia(s, valores, [0, 0])).toBeUndefined();
  });

  it('os sudokus da criança: 12 por modelo, todos diferentes, ✓ só no completo', async () => {
    const { SUDOKUS_NA_TELA, sudokuDaCrianca, terminado, chaveDoJogo } = await import('./jogosDaCrianca');
    for (const modelo of ['sudokuFiguras', 'sudoku4', 'sudoku6'] as const) {
      const vistos = new Set<string>();
      for (let n = 1; n <= SUDOKUS_NA_TELA; n++) {
        const alvo = sudokuDaCrianca(modelo, n);
        if (alvo.tipo !== 'sudoku') throw new Error('sudoku');
        vistos.add(JSON.stringify(alvo.jogo.pistas));
        expect(alvo.titulo).toContain(String(n));
      }
      expect(vistos.size).toBe(SUDOKUS_NA_TELA);
    }
    const alvo = sudokuDaCrianca('sudoku4', 1);
    if (alvo.tipo !== 'sudoku') throw new Error('sudoku');
    const valores: Record<string, number> = {};
    expect(terminado(alvo, { valores })).toBe(false);
    alvo.jogo.solucao.forEach((linha, l) => linha.forEach((v, c) => (valores[`${l},${c}`] = v)));
    expect(terminado(alvo, { valores })).toBe(true);
    expect(chaveDoJogo(1, 'sudoku', 'sudoku4:1')).toBe('1:jogo:sudoku:sudoku4:1');
  });
});

describe('labirinto na tela (2026-11-19)', () => {
  it('é o MESMO labirinto da folha', async () => {
    const { jogoDoPedido } = await import('./pedido');
    const { gerarLabirinto } = await import('./logica');
    const alvo = jogoDoPedido({ tipo: 'logica', modelo: 'labirinto', nivel: 'medio', semente: 4, respostas: false });
    expect(alvo?.tipo).toBe('labirinto');
    if (alvo?.tipo === 'labirinto') expect(alvo.jogo).toEqual(gerarLabirinto('medio', 4));
  });

  it('anda só sem parede, volta pelo rastro, e a solução chega à saída', async () => {
    const { gerarLabirinto } = await import('./logica');
    const { andarAte, caminhoValido, chegou, pedacoDaSolucao, podePassar } = await import('./jogo');
    type C = [number, number];
    for (const nivel of ['facil', 'medio', 'dificil'] as const) {
      const lab = gerarLabirinto(nivel, 0);
      // a solução, andada casa a casa, chega
      let caminho: C[] = [[0, 0]];
      for (const casa of lab.solucao.slice(1)) caminho = andarAte(lab, caminho, casa as C);
      expect(chegou(lab, caminho)).toBe(true);
      expect(caminhoValido(lab, caminho)).toBe(true);
      // voltar a uma casa do rastro apaga o resto
      expect(andarAte(lab, caminho, [0, 0])).toEqual([[0, 0]]);
      // parede: não passa
      const fechada = ([[0, 1], [1, 0]] as C[]).find((v) => !podePassar(lab, [0, 0], v));
      if (fechada) expect(andarAte(lab, [[0, 0]], fechada)).toEqual([[0, 0]]);
      // diagonal: não passa
      expect(andarAte(lab, [[0, 0]], [1, 1])).toEqual([[0, 0]]);
      // a ajuda segue a solução, alguns passos além do que está certo
      expect(pedacoDaSolucao(lab, [[0, 0]], 5)).toEqual(lab.solucao.slice(0, 6));
    }
    const lab = gerarLabirinto('facil', 0);
    expect(caminhoValido(lab, [[0, 0], [1, 1]])).toBe(false);
    expect(caminhoValido(lab, 'lixo')).toBe(false);
  });

  it('o dedo rápido num corredor reto preenche as casas do meio', async () => {
    const { gerarLabirinto } = await import('./logica');
    const { andarAte, podePassar } = await import('./jogo');
    const lab = gerarLabirinto('dificil', 2);
    // acha um corredor reto de 3 casas na solução
    const s = lab.solucao as Array<[number, number]>;
    const i = s.findIndex((c, k) => k + 2 < s.length && ((s[k + 2][0] === c[0] && Math.abs(s[k + 2][1] - c[1]) === 2) || (s[k + 2][1] === c[1] && Math.abs(s[k + 2][0] - c[0]) === 2)));
    expect(i).toBeGreaterThanOrEqual(0);
    const antes = s.slice(0, i + 1);
    const depois = andarAte(lab, antes, s[i + 2]);
    expect(depois).toEqual(s.slice(0, i + 3));
    expect(podePassar(lab, s[i], s[i + 1])).toBe(true);
  });
});

describe('labirintos da criança (2026-11-19)', () => {
  it('12 por tamanho, iguais à folha com a semente N − 1, ✓ só quando chega', async () => {
    const { SUDOKUS_NA_TELA, labirintoDaCrianca, terminado } = await import('./jogosDaCrianca');
    const { gerarLabirinto } = await import('./logica');
    for (const tamanho of ['facil', 'medio', 'dificil'] as const) {
      for (const n of [1, SUDOKUS_NA_TELA]) {
        const alvo = labirintoDaCrianca(tamanho, n);
        if (alvo.tipo !== 'labirinto') throw new Error('labirinto');
        expect(alvo.jogo).toEqual(gerarLabirinto(tamanho, n - 1));
      }
    }
    const alvo = labirintoDaCrianca('facil', 1);
    if (alvo.tipo !== 'labirinto') throw new Error('labirinto');
    expect(terminado(alvo, { caminho: [[0, 0]] })).toBe(false);
    expect(terminado(alvo, { caminho: alvo.jogo.solucao })).toBe(true);
    // um "caminho" guardado que atravessa parede não vale
    expect(terminado(alvo, { caminho: [[0, 0], [alvo.jogo.linhas - 1, alvo.jogo.colunas - 1]] })).toBe(false);
  });
});

describe('contas na tela (2026-11-19)', () => {
  it('as caixas: armada como no caderno, deitada do tamanho da resposta', async () => {
    const { caixasDaConta, respostaEmCaixas, valorDasCaixas, contaCerta, ordemDasCaixas, umAlgarismo, contaDeitada } = await import('./jogo');
    const soma = { a: 345, b: 278, op: '+' as const, resultado: 623 };
    expect(caixasDaConta(soma, false)).toBe(4);
    expect(respostaEmCaixas(soma, 4)).toEqual(['', '6', '2', '3']);
    expect(ordemDasCaixas(4, false)).toEqual([3, 2, 1, 0]);
    expect(valorDasCaixas(['', '6', '2', '3'])).toBe(623);
    expect(valorDasCaixas(['', '6', '', '3'])).toBeUndefined(); // buraco no meio: ainda não
    expect(contaCerta(soma, ['', '6', '2', '3'])).toBe(true);
    expect(contaCerta(soma, ['0', '6', '2', '3'])).toBe(true); // zero na frente não muda o número
    expect(contaCerta(soma, ['', '6', '2', '4'])).toBe(false);
    // a ajuda vai da unidade para a esquerda, sempre na mesma ordem
    let caixas = ['', '', '', ''];
    caixas = umAlgarismo(soma, caixas, false);
    expect(caixas).toEqual(['', '', '', '3']);
    caixas = umAlgarismo(soma, ['', '', '9', '3'], false);
    expect(caixas).toEqual(['', '', '2', '3']);
    const div = { a: 84, b: 4, op: '/' as const, resultado: 21 };
    expect(contaDeitada(div)).toBe(true);
    expect(caixasDaConta(div, true)).toBe(2);
    expect(ordemDasCaixas(2, true)).toEqual([0, 1]);
    expect(umAlgarismo(div, ['', ''], true)).toEqual(['2', '']);
    expect(caixasDaConta({ a: 12, b: 3, op: 'x', resultado: 36 }, false)).toBe(3);
    expect(caixasDaConta({ a: 50, b: 7, op: '-', resultado: 43 }, false)).toBe(2);
  });

  it('a tela joga as MESMAS contas da folha (as do app, as da professora, a tabuada)', async () => {
    const { jogoDoPedido, pedidoInicial } = await import('./pedido');
    const { gerarContas } = await import('./contas');
    const base = pedidoInicial('contas');
    if (base.tipo !== 'contas') throw new Error('contas');
    const alvo = jogoDoPedido(base);
    expect(alvo?.tipo).toBe('contas');
    if (alvo?.tipo === 'contas') expect(alvo.jogo).toEqual(gerarContas({ operacao: '+', algarismos: 2, reagrupar: false, quantas: 12, semente: 0 }));
    const prof = jogoDoPedido({ ...base, proprias: '345 + 278\n84 ÷ 4' });
    expect(prof?.tipo === 'contas' && prof.jogo.map((c) => c.resultado)).toEqual([623, 21]);
    const tab = jogoDoPedido({ ...base, modelo: 'tabuada', numero: 7 });
    expect(tab?.tipo === 'contas' && tab.tabuada && tab.jogo.map((c) => c.resultado)).toEqual([7, 14, 21, 28, 35, 42, 49, 56, 63, 70]);
    expect(jogoDoPedido({ ...base, modelo: 'tabua' })).toBeUndefined();
  });

  it('as listas da criança: 10 contas cada, em todas as escolhas; ✓ só com todas certas', async () => {
    const { contasDaCrianca, terminado, SUDOKUS_NA_TELA } = await import('./jogosDaCrianca');
    const { respostaEmCaixas, caixasDaConta, contaDeitada } = await import('./jogo');
    for (const op of ['+', '-', 'x', '/', 'tabuada'] as const) {
      for (const tam of ['pequenas', 'medias', 'grandes'] as const) {
        for (const n of [1, SUDOKUS_NA_TELA]) {
          const alvo = contasDaCrianca(op, tam, n);
          if (alvo.tipo !== 'contas') throw new Error('contas');
          expect(alvo.jogo.length, `${op} ${tam} ${n}`).toBe(10);
        }
      }
    }
    const alvo = contasDaCrianca('+', 'medias', 1);
    if (alvo.tipo !== 'contas') throw new Error('contas');
    const caixas: Record<string, string[]> = {};
    alvo.jogo.forEach((c, i) => (caixas[String(i)] = respostaEmCaixas(c, caixasDaConta(c, contaDeitada(c, alvo.tabuada)))));
    expect(terminado(alvo, { caixas })).toBe(true);
    delete caixas['9'];
    expect(terminado(alvo, { caixas })).toBe(false);
  });
});

describe('memória na tela (2026-11-19)', () => {
  it('a mesa é sempre a mesma para a mesma semente; cada par tem duas cartas', async () => {
    const { cartasDaMemoria, lerPecas } = await import('./jogosDeMesa');
    const pecas = lerPecas('CASA\nESCOLA\nÔNIBUS\nSUCO');
    const a = cartasDaMemoria(pecas, false, 0);
    expect(cartasDaMemoria(pecas, false, 0)).toEqual(a);
    expect(cartasDaMemoria(pecas, false, 1)).not.toEqual(a);
    expect(a).toHaveLength(8);
    for (let par = 0; par < 4; par++) expect(a.filter((c) => c.par === par)).toHaveLength(2);
    // na de leitura, uma carta do par é a figura e a outra a palavra
    const l = cartasDaMemoria(pecas, true, 0);
    for (let par = 0; par < 4; par++) expect(l.filter((c) => c.par === par).map((c) => c.mostrar).sort()).toEqual(['figura', 'palavra']);
  });

  it('virar: par fica aberto; não par fica até o próximo toque', async () => {
    const { cartasDaMemoria, lerPecas } = await import('./jogosDeMesa');
    const { virarCarta, memoriaCompleta } = await import('./jogo');
    const cartas = cartasDaMemoria(lerPecas('CASA\nESCOLA'), false, 0);
    const i0 = cartas.findIndex((c) => c.par === 0);
    const j0 = cartas.findIndex((c, k) => c.par === 0 && k !== i0);
    const i1 = cartas.findIndex((c) => c.par === 1);
    const j1 = cartas.findIndex((c, k) => c.par === 1 && k !== i1);
    let e = { abertas: [] as number[], achados: [] as number[] };
    e = virarCarta(cartas, e, i0).estado;
    e = virarCarta(cartas, e, i1).estado;
    expect(e.abertas).toEqual([i0, i1]);
    // tocar de novo numa aberta não faz nada
    expect(virarCarta(cartas, e, i1).estado).toBe(e);
    // o próximo toque fecha as duas e vira a nova
    e = virarCarta(cartas, e, j0).estado;
    expect(e.abertas).toEqual([j0]);
    const r = virarCarta(cartas, e, i0);
    expect(r.achou).toBe(0);
    e = r.estado;
    expect(e).toEqual({ abertas: [], achados: [0] });
    e = virarCarta(cartas, e, i1).estado;
    e = virarCarta(cartas, e, j1).estado;
    expect(memoriaCompleta(cartas, e.achados)).toBe(true);
  });

  it('as memórias da criança têm figura em todas as cartas, e o ✓ só no fim', async () => {
    const { memoriaDaCrianca, terminado, SUDOKUS_NA_TELA } = await import('./jogosDaCrianca');
    const { jogoDoPedido, pedidoInicial } = await import('./pedido');
    for (const modo of ['iguais', 'leitura'] as const) {
      for (const tam of ['6', '10'] as const) {
        for (let n = 1; n <= SUDOKUS_NA_TELA; n++) {
          const alvo = memoriaDaCrianca(modo, tam, n);
          if (alvo.tipo !== 'memoria') throw new Error('memoria');
          expect(alvo.jogo).toHaveLength(Number(tam) * 2);
          expect(alvo.jogo.every((c) => c.peca.figura)).toBe(true);
          expect(new Set(alvo.jogo.map((c) => c.peca.texto)).size).toBe(Number(tam));
        }
      }
    }
    const alvo = memoriaDaCrianca('iguais', '6', 1);
    if (alvo.tipo !== 'memoria') throw new Error('memoria');
    expect(terminado(alvo, { achados: [0, 1, 2, 3, 4] })).toBe(false);
    expect(terminado(alvo, { achados: [0, 1, 2, 3, 4, 5] })).toBe(true);
    // a folha da memória também se joga (a de partida tem 12 palavras = 12 pares)
    const daFolha = jogoDoPedido(pedidoInicial('jogo'));
    expect(daFolha?.tipo === 'memoria' && daFolha.jogo.length).toBe(24);
  });
});

describe('folha ampliada (2026-11-20)', () => {
  it('desligada não muda nada; ligada engrossa traço, letra e cinza', async () => {
    const { ampliarFolha } = await import('./comum');
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    const base = pedidoInicial('pauta');
    expect(fazerFolhas({ ...base, ampliada: undefined }).folhas.map((f) => f.svg)).toEqual(fazerFolhas(base).folhas.map((f) => f.svg));
    const svg = '<g fill="#000000" stroke="none" pointer-events="none"><path/></g><line stroke="#9a9a9a" stroke-width="2"/><rect fill="#ffffff" stroke="#000000"/>';
    const a = ampliarFolha(svg);
    expect(a).toContain('stroke-width="3.2"'); // 2 × 1,6
    expect(a).toContain('stroke="#4d4d4d"'); // o cinza claro escurece
    expect(a).toContain('fill="#ffffff"'); // o branco fica
    expect(a).toContain('fill="#000000" stroke="#000000" stroke-width="40"'); // a letra engrossa
  });

  it('entra no código só quando ligada, e o código a devolve', async () => {
    const { codificar, decodificar } = await import('./codigo');
    const { pedidoInicial } = await import('./pedido');
    const base = pedidoInicial('caca');
    const comum = codificar(base);
    const grande = codificar({ ...base, ampliada: true });
    if (!('codigo' in comum) || !('codigo' in grande)) throw new Error('código');
    expect(grande.codigo).not.toBe(comum.codigo);
    const d = decodificar(grande.codigo);
    expect('pedido' in d && d.pedido.ampliada).toBe(true);
    const d2 = decodificar(comum.codigo);
    expect('pedido' in d2 && d2.pedido.ampliada).toBeFalsy();
  });

  it('caça-palavras de letra maior, contas 6 por folha, cruzadinha em duas folhas', async () => {
    const { fazerFolhas, pedidoInicial } = await import('./pedido');
    // o tamanho que MAIS aparece (as letras da grade), não o do título
    const tamanhoDaLetra = (svg: string) => {
      const conta = new Map<string, number>();
      for (const m of svg.matchAll(/scale\(([\d.]+)\)/g)) conta.set(m[1], (conta.get(m[1]) ?? 0) + 1);
      return Number([...conta].sort((x, y) => y[1] - x[1])[0][0]);
    };
    const caca = pedidoInicial('caca');
    expect(tamanhoDaLetra(fazerFolhas({ ...caca, ampliada: true }).folhas[0].svg)).toBeGreaterThan(tamanhoDaLetra(fazerFolhas(caca).folhas[0].svg));
    const contas = pedidoInicial('contas');
    expect(fazerFolhas(contas).folhas.filter((f) => !f.titulo.includes('respostas'))).toHaveLength(1);
    expect(fazerFolhas({ ...contas, ampliada: true }).folhas.filter((f) => !f.titulo.includes('respostas'))).toHaveLength(2); // 12 contas, 6 por folha
    const cruz = pedidoInicial('cruzadinha');
    const titulos = fazerFolhas({ ...cruz, ampliada: true }).folhas.map((f) => f.titulo);
    expect(titulos.some((t) => t.endsWith('— dicas'))).toBe(true);
    expect(titulos.length).toBe(fazerFolhas(cruz).folhas.length + 1);
    // todo tipo aceita a ampliada sem quebrar
    const { TIPOS } = await import('./pedido');
    for (const t of TIPOS) expect(() => fazerFolhas({ ...pedidoInicial(t.tipo), ampliada: true })).not.toThrow();
  });
});
