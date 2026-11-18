// Do formulário à folha: a parte pura da tela "Fazer uma folha".
// A tela (telaFolhas.ts) só desenha campos e chama `fazerFolhas`.

import { gerarCacaPalavras, svgCacaPalavrasA4, type Nivel } from './cacaPalavras';
import { gerarCruzadinha, svgCruzadinhaA4, type ItemCruzadinha } from './cruzadinha';
import {
  PAUTAS,
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
import {
  lerPecas,
  svgBingoA4,
  svgDominoA4,
  svgMemoriaA4,
  svgPecasDamasA4,
  svgPecasXadrezA4,
  svgTabuleiroA4,
} from './jogosDeMesa';
import { emSilabas, lerFamilias, pecasDeSilabas, svgFamiliasA4, svgSilabasMoveisA4 } from './silabario';
import { folhasDeLogica, type NivelLabirinto } from './logica';
import { gerarContas, svgContasA4, svgTabuaA4, svgTabuadaA4, type Operacao } from './contas';
import { folhasDeRecortar, type ModeloRecortar } from './recortar';
import { lerNomes, svgCrachasA4, svgEtiquetasA4, svgHqA4, svgMarcadoresA4, svgTesouraA4, svgTracarA4 } from './cartoes';
import { textoSeguro } from './comum';
import { lerHoras, svgRelogioDeMontarA4, svgRelogiosA4, svgRetasA4 } from './matematica';

export { FOLHAS_LIGADAS } from './ligado';

export type ModeloPauta = keyof typeof PAUTAS | 'caligrafia';
export type ModeloGrade = 'q5' | 'q10' | 'q20' | 'milimetrado' | 'pontilhado';

export type JogoDeMesa = 'memoria' | 'memoria-leitura' | 'domino' | 'bingo' | 'damas' | 'xadrez';

export const NOMES_DOS_JOGOS: Record<JogoDeMesa, string> = {
  memoria: 'Memória: pares iguais',
  'memoria-leitura': 'Memória de leitura: figura com palavra',
  domino: 'Dominó',
  bingo: 'Bingo',
  damas: 'Damas: tabuleiro e peças',
  xadrez: 'Xadrez: tabuleiro e peças',
};

export type ModeloMatematica = 'ler' | 'marcar' | 'montar' | 'reta';

export const NOMES_DA_MATEMATICA: Record<ModeloMatematica, string> = {
  ler: 'Relógios: que horas são?',
  marcar: 'Relógios: marque a hora',
  montar: 'Relógio grande de montar',
  reta: 'Reta numérica',
};

export type ModeloSilabas = 'familias' | 'moveis' | 'bingo' | 'domino';
export type ModeloLogica = 'labirinto' | 'sudoku4' | 'sudoku6' | 'sudokuFiguras';
export type ModeloContas = 'armadas' | 'tabuada' | 'tabua';
export type ModeloMotora = 'tesoura' | 'tracar';
export type ModeloCartoes = 'hq' | 'crachas' | 'marcadores' | 'etiquetas';

export const NOMES_DAS_SILABAS: Record<ModeloSilabas, string> = {
  familias: 'Famílias silábicas (BA BE BI BO BU)',
  moveis: 'Sílabas móveis: monte a palavra',
  bingo: 'Bingo de sílabas',
  domino: 'Dominó de sílabas',
};
export const NOMES_DA_LOGICA: Record<ModeloLogica, string> = {
  labirinto: 'Labirinto',
  sudoku4: 'Sudoku 4 × 4',
  sudoku6: 'Sudoku 6 × 6',
  sudokuFiguras: 'Sudoku de figuras (4 × 4)',
};
export const NOMES_DAS_CONTAS: Record<ModeloContas, string> = {
  armadas: 'Contas armadas',
  tabuada: 'Tabuada de um número',
  tabua: 'Tábua da multiplicação (10 × 10)',
};
export const NOMES_DO_RECORTAR: Record<ModeloRecortar, string> = {
  dourado: 'Material dourado',
  barras: 'Frações em barras',
  circulos: 'Frações em círculos',
  posicional: 'Quadro de valor posicional',
  tangram: 'Tangram',
};
export const NOMES_DA_MOTORA: Record<ModeloMotora, string> = {
  tesoura: 'Treino de tesoura',
  tracar: 'Siga o caminho (lápis)',
};
export const NOMES_DOS_CARTOES: Record<ModeloCartoes, string> = {
  hq: 'História em quadrinhos em branco',
  crachas: 'Crachás',
  marcadores: 'Marcadores de página',
  etiquetas: 'Etiquetas de caderno',
};

export type Pedido =
  | { tipo: 'caca'; titulo: string; palavras: string; nivel: Nivel; semente: number; respostas: boolean }
  | { tipo: 'cruzadinha'; titulo: string; itens: string; respostas: boolean }
  | { tipo: 'jogo'; jogo: JogoDeMesa; pecas: string; cartelas: number; lado: 3 | 4; verso: boolean; semente: number }
  | { tipo: 'matematica'; modelo: ModeloMatematica; horas: string; respostas: boolean; de: number; ate: number; completar: boolean }
  | { tipo: 'silabas'; modelo: ModeloSilabas; familias: string; palavras: string; completar: boolean; cartelas: number; semente: number }
  | { tipo: 'logica'; modelo: ModeloLogica; nivel: NivelLabirinto; semente: number; respostas: boolean }
  | {
      tipo: 'contas';
      modelo: ModeloContas;
      operacao: Operacao;
      algarismos: number;
      reagrupar: boolean;
      quantas: number;
      numero: number;
      completar: boolean;
      semente: number;
      respostas: boolean;
    }
  | { tipo: 'recortar'; modelo: ModeloRecortar; ordens: 3 | 4 | 6 }
  | { tipo: 'motora'; modelo: ModeloMotora }
  | { tipo: 'cartoes'; modelo: ModeloCartoes; quadros: 3 | 4 | 6; linhas: boolean; nomes: string; linha2: string }
  | { tipo: 'pauta'; modelo: ModeloPauta; margem: boolean }
  | { tipo: 'grade'; modelo: ModeloGrade }
  | { tipo: 'reguas' }
  | { tipo: 'plano'; alcance: number; curva: boolean; a: number; b: number; c: number; respostas: boolean }
  | { tipo: 'calendario'; modelo: 'figura' | 'anotar' | 'ano'; ano: number; mes: number; imagem?: string; feriados: boolean };

export type TipoDeFolha = Pedido['tipo'];

export const TIPOS: Array<{ tipo: TipoDeFolha; nome: string }> = [
  { tipo: 'caca', nome: 'Caça-palavras' },
  { tipo: 'cruzadinha', nome: 'Cruzadinha' },
  { tipo: 'jogo', nome: 'Jogos de mesa: memória, dominó, bingo, damas, xadrez' },
  { tipo: 'matematica', nome: 'Relógio e reta numérica' },
  { tipo: 'silabas', nome: 'Sílabas: famílias, monte a palavra, bingo, dominó' },
  { tipo: 'logica', nome: 'Labirinto e sudoku' },
  { tipo: 'contas', nome: 'Contas armadas e tabuada' },
  { tipo: 'recortar', nome: 'Matemática de recortar: material dourado, frações, tangram' },
  { tipo: 'motora', nome: 'Coordenação: tesoura e caminhos' },
  { tipo: 'cartoes', nome: 'Quadrinhos, crachás, marcadores, etiquetas' },
  { tipo: 'pauta', nome: 'Folha pautada' },
  { tipo: 'grade', nome: 'Quadriculado, milimetrado, pontilhado' },
  { tipo: 'reguas', nome: 'Réguas de recortar' },
  { tipo: 'plano', nome: 'Plano cartesiano e parábola' },
  { tipo: 'calendario', nome: 'Calendário' },
];

export const NOMES_DAS_PAUTAS: Record<ModeloPauta, string> = {
  comum: 'Comum (8 mm)',
  larga: 'Larga (10 mm)',
  ampliada: 'Ampliada (14 mm, traço grosso)',
  muitoAmpliada: 'Muito ampliada (20 mm, traço grosso)',
  caligrafia: 'Caligrafia (três linhas)',
};

export const NOMES_DAS_GRADES: Record<ModeloGrade, string> = {
  q5: 'Quadriculado de 5 mm',
  q10: 'Quadriculado de 1 cm',
  q20: 'Quadriculado ampliado (2 cm, traço grosso)',
  milimetrado: 'Milimetrado',
  pontilhado: 'Pontilhado de 5 mm',
};

/** Um pedido de partida para cada tipo; `hoje` só serve ao calendário. */
export function pedidoInicial(tipo: TipoDeFolha, hoje: Date = new Date()): Pedido {
  switch (tipo) {
    case 'caca':
      return {
        tipo,
        titulo: 'Ônibus e transporte',
        palavras: 'ÔNIBUS\nPARADA\nLINHA\nCENTRO\nBAIRRO\nTERMINAL\nPASSAGEM\nMOTORISTA',
        nivel: 'facil',
        semente: 0,
        respostas: true,
      };
    case 'cruzadinha':
      return {
        tipo,
        titulo: 'Coisas da escola',
        itens:
          'CADERNO: Onde a gente escreve na aula.\nLÁPIS: Escreve e pode ser apagado.\nRECREIO: Hora de brincar e lanchar.\nMERENDA: A comida da escola.\nBORRACHA: Apaga o que o lápis escreveu.\nMOCHILA: Leva o material nas costas.',
        respostas: true,
      };
    case 'jogo':
      return {
        tipo,
        jogo: 'memoria',
        pecas: 'FELIZ\nTRISTE\nBRAVO\nCASA\nÔNIBUS\nÁGUA\nSUCO\nPÃO\nFRUTA\nLIVRO\nLÁPIS\nMÚSICA',
        cartelas: 6,
        lado: 3,
        verso: false,
        semente: 0,
      };
    case 'matematica':
      return { tipo, modelo: 'ler', horas: '7:00\n7:15\n12:30\n3:45\n9:10\n6:50', respostas: true, de: 0, ate: 20, completar: true };
    case 'silabas':
      return {
        tipo,
        modelo: 'familias',
        familias: 'B C D F G L M N P R S T V',
        palavras: 'CASA\nBOLA\nPATO\nSAPO\nCAVALO\nMACACO\nJANELA\nTOMATE',
        completar: false,
        cartelas: 6,
        semente: 0,
      };
    case 'logica':
      return { tipo, modelo: 'labirinto', nivel: 'facil', semente: 0, respostas: true };
    case 'contas':
      return { tipo, modelo: 'armadas', operacao: '+', algarismos: 2, reagrupar: false, quantas: 12, numero: 7, completar: true, semente: 0, respostas: true };
    case 'recortar':
      return { tipo, modelo: 'dourado', ordens: 4 };
    case 'motora':
      return { tipo, modelo: 'tesoura' };
    case 'cartoes':
      return { tipo, modelo: 'hq', quadros: 4, linhas: true, nomes: '', linha2: '' };
    case 'pauta':
      return { tipo, modelo: 'ampliada', margem: true };
    case 'grade':
      return { tipo, modelo: 'q10' };
    case 'reguas':
      return { tipo };
    case 'plano':
      return { tipo, alcance: 10, curva: false, a: 1, b: -2, c: -3, respostas: false };
    case 'calendario':
      return { tipo, modelo: 'figura', ano: hoje.getFullYear(), mes: hoje.getMonth() + 1, feriados: true };
  }
}

/** Uma palavra por linha; vírgula e ponto e vírgula também separam. */
export function lerPalavras(texto: string): string[] {
  return texto
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Uma por linha: `PALAVRA: dica` (também aceita `=` ou tabulação no lugar dos dois-pontos). */
export function lerItens(texto: string): ItemCruzadinha[] {
  return texto
    .split('\n')
    .map((linha) => {
      const corte = linha.search(/[:=\t]/);
      return corte < 0
        ? { palavra: linha.trim(), dica: '' }
        : { palavra: linha.slice(0, corte).trim(), dica: linha.slice(corte + 1).trim() };
    })
    .filter((i) => i.palavra);
}

export interface Resultado {
  /** nome do trabalho de impressão (e do PDF) */
  titulo: string;
  folhas: Array<{ titulo: string; svg: string }>;
  /** o que quem ensina precisa saber: palavra que ficou de fora, conta que não fecha */
  avisos: string[];
}

const numeroOu = (v: number, padrao: number): number => (Number.isFinite(v) ? v : padrao);

export function fazerFolhas(p: Pedido): Resultado {
  const avisos: string[] = [];
  switch (p.tipo) {
    case 'caca': {
      const palavras = lerPalavras(p.palavras);
      if (!palavras.length) avisos.push('Escreva as palavras, uma por linha.');
      const jogo = gerarCacaPalavras({ palavras, nivel: p.nivel, semente: numeroOu(p.semente, 0) });
      for (const f of jogo.fora) avisos.push(`${f.palavra} ficou de fora: ${f.motivo}.`);
      if (!jogo.conferido) avisos.push('Não consegui garantir que cada palavra aparece uma vez só. Tente "Embaralhar de outro jeito".');
      const titulo = p.titulo.trim() || 'Caça-palavras';
      const folhas = [{ titulo, svg: svgCacaPalavrasA4(jogo, { titulo }) }];
      if (p.respostas) folhas.push({ titulo: `${titulo} — respostas`, svg: svgCacaPalavrasA4(jogo, { titulo, gabarito: true }) });
      return { titulo: `Caça-palavras - ${titulo}`, folhas, avisos };
    }
    case 'cruzadinha': {
      const itens = lerItens(p.itens);
      if (itens.length < 2) avisos.push('Escreva pelo menos duas palavras, uma por linha: PALAVRA: dica.');
      const jogo = gerarCruzadinha(itens);
      for (const f of jogo.fora) avisos.push(`${f.palavra} ficou de fora: ${f.motivo}.`);
      for (const e of jogo.entradas) if (!e.dica) avisos.push(`${e.palavra} está sem dica.`);
      const titulo = p.titulo.trim() || 'Cruzadinha';
      const folhas = [{ titulo, svg: svgCruzadinhaA4(jogo, { titulo }) }];
      if (p.respostas) folhas.push({ titulo: `${titulo} — respostas`, svg: svgCruzadinhaA4(jogo, { titulo, gabarito: true }) });
      return { titulo: `Cruzadinha - ${titulo}`, folhas, avisos };
    }
    case 'jogo': {
      if (p.jogo === 'damas' || p.jogo === 'xadrez') {
        const xadrez = p.jogo === 'xadrez';
        avisos.push('Casas de 22 mm e peças de 19 mm: imprima em tamanho real (escala 100%). Colar em papelão ajuda.');
        return {
          titulo: xadrez ? 'Xadrez' : 'Damas',
          folhas: [
            { titulo: 'Tabuleiro', svg: svgTabuleiroA4({ titulo: xadrez ? 'Xadrez' : 'Damas', coordenadas: xadrez }) },
            { titulo: 'Peças', svg: xadrez ? svgPecasXadrezA4() : svgPecasDamasA4() },
          ],
          avisos,
        };
      }
      const pecas = lerPecas(p.pecas);
      const semDesenho = pecas.filter((x) => !x.figura).map((x) => x.texto);
      if (semDesenho.length) avisos.push(`Sem desenho no app (vai só a palavra): ${semDesenho.join(', ')}.`);
      if (p.jogo === 'domino') {
        if (pecas.length < 3) avisos.push('O dominó precisa de pelo menos 3 palavras.');
        if (pecas.length > 7) avisos.push('O dominó usa as 7 primeiras palavras (28 pedras).');
        return { titulo: 'Dominó', folhas: pecas.length < 3 ? [] : svgDominoA4(pecas), avisos };
      }
      if (p.jogo === 'bingo') {
        const lado = p.lado === 4 ? 4 : 3;
        const minimo = lado * lado + 3;
        if (pecas.length < minimo) {
          avisos.push(`Para cartelas de ${lado * lado} casas, escreva pelo menos ${minimo} palavras (há ${pecas.length}).`);
          return { titulo: 'Bingo', folhas: [], avisos };
        }
        const pedidas = Math.min(40, Math.max(1, Math.round(numeroOu(p.cartelas, 6))));
        const folhas = svgBingoA4(pecas, { cartelas: pedidas, lado, semente: numeroOu(p.semente, 0) });
        return { titulo: 'Bingo', folhas, avisos };
      }
      if (pecas.length < 2) avisos.push('A memória precisa de pelo menos 2 palavras.');
      if (pecas.length > 24) avisos.push('A memória usa as 24 primeiras palavras.');
      const folhas = pecas.length < 2 ? [] : svgMemoriaA4(pecas, { par: p.jogo === 'memoria-leitura' ? 'leitura' : 'igual', verso: p.verso });
      return { titulo: 'Jogo da memória', folhas, avisos };
    }
    case 'matematica': {
      if (p.modelo === 'montar') {
        return { titulo: 'Relógio de montar', folhas: [{ titulo: 'Relógio de montar', svg: svgRelogioDeMontarA4() }], avisos };
      }
      if (p.modelo === 'reta') {
        const de = numeroOu(p.de, 0);
        const ate = numeroOu(p.ate, 10);
        if (Math.abs(ate - de) > 30) avisos.push('A reta mostra no máximo 31 números: cortei no trigésimo.');
        const svg = svgRetasA4({ de, ate, semNumeroDesde: p.completar ? 3 : 0 });
        return { titulo: 'Reta numérica', folhas: [{ titulo: 'Reta numérica', svg }], avisos };
      }
      const horas = lerHoras(p.horas);
      if (!horas.length) avisos.push('Escreva as horas, uma por linha, assim: 7:15');
      if (horas.length > 12) avisos.push('Cabem 12 relógios: usei as 12 primeiras horas.');
      const folhas = svgRelogiosA4(horas, { modo: p.modelo === 'marcar' ? 'marcar' : 'ler', respostas: p.respostas });
      return { titulo: 'Relógios', folhas, avisos };
    }
    case 'silabas': {
      if (p.modelo === 'familias') {
        const familias = lerFamilias(p.familias);
        if (!familias.length) avisos.push('Escreva o começo de cada família: B C D, ou QU, LH, CH.');
        return { titulo: 'Famílias silábicas', folhas: svgFamiliasA4(familias, { completar: p.completar }), avisos };
      }
      if (p.modelo === 'moveis') {
        const palavras = emSilabas(lerPecas(p.palavras));
        if (!palavras.length) avisos.push('Escreva as palavras, uma por linha.');
        const duvida = palavras.filter((x) => x.conferir).map((x) => x.silabas.join('-'));
        avisos.push(`Separação sugerida pelo app${duvida.length ? `; confira com atenção: ${duvida.join(', ')}` : ''}.`);
        const longas = palavras.filter((x) => x.silabas.length > 6).map((x) => x.peca.texto);
        if (longas.length) avisos.push(`Com mais de 6 sílabas, ficaram de fora: ${longas.join(', ')}.`);
        const sem = palavras.filter((x) => !x.peca.figura).map((x) => x.peca.texto);
        if (sem.length) avisos.push(`Sem desenho no app (vai um ponto de interrogação): ${sem.join(', ')}.`);
        return { titulo: 'Monte a palavra', folhas: svgSilabasMoveisA4(palavras), avisos };
      }
      const { pecas, separadas } = pecasDeSilabas(p.palavras);
      if (separadas.length) avisos.push(`Separei estas palavras (confira): ${separadas.join(', ')}.`);
      if (p.modelo === 'domino') {
        if (pecas.length < 3) {
          avisos.push('O dominó precisa de pelo menos 3 sílabas.');
          return { titulo: 'Dominó de sílabas', folhas: [], avisos };
        }
        if (pecas.length > 7) avisos.push('O dominó usa as 7 primeiras sílabas (28 pedras).');
        return { titulo: 'Dominó de sílabas', folhas: svgDominoA4(pecas), avisos };
      }
      if (pecas.length < 12) {
        avisos.push(`Para o bingo, escreva palavras ou sílabas que deem pelo menos 12 sílabas diferentes (há ${pecas.length}).`);
        return { titulo: 'Bingo de sílabas', folhas: [], avisos };
      }
      const cartelas = Math.min(40, Math.max(1, Math.round(numeroOu(p.cartelas, 6))));
      return { titulo: 'Bingo de sílabas', folhas: svgBingoA4(pecas, { cartelas, semente: numeroOu(p.semente, 0) }), avisos };
    }
    case 'logica': {
      const titulo = NOMES_DA_LOGICA[p.modelo] ?? 'Labirinto';
      return { titulo, folhas: folhasDeLogica(p.modelo, { nivel: p.nivel, semente: numeroOu(p.semente, 0), respostas: p.respostas }), avisos };
    }
    case 'contas': {
      if (p.modelo === 'tabua') {
        return { titulo: 'Tábua da multiplicação', folhas: [{ titulo: 'Tábua da multiplicação', svg: svgTabuaA4({ completar: p.completar }) }], avisos };
      }
      if (p.modelo === 'tabuada') {
        const t = Math.min(20, Math.max(1, Math.round(numeroOu(p.numero, 7))));
        return { titulo: `Tabuada do ${t}`, folhas: [{ titulo: `Tabuada do ${t}`, svg: svgTabuadaA4(t, { completar: p.completar }) }], avisos };
      }
      const algarismos = Math.min(4, Math.max(1, Math.round(numeroOu(p.algarismos, 2))));
      const quantas = Math.min(40, Math.max(1, Math.round(numeroOu(p.quantas, 12))));
      const contas = gerarContas({ operacao: p.operacao, algarismos, reagrupar: p.reagrupar, quantas, semente: numeroOu(p.semente, 0) });
      if (contas.length < quantas) avisos.push(`Só existem ${contas.length} contas diferentes com essas escolhas.`);
      if (algarismos === 1 && (p.operacao === '+' || p.operacao === '-')) avisos.push('Com um algarismo não há "vai um" para escolher.');
      return { titulo: 'Contas armadas', folhas: svgContasA4(contas, { respostas: p.respostas }), avisos };
    }
    case 'recortar': {
      avisos.push('Imprima em tamanho real (escala 100%): as peças têm medida de verdade.');
      if (p.modelo === 'tangram') avisos.push('As figuras para montar (silhuetas) ainda não estão no app.');
      return { titulo: NOMES_DO_RECORTAR[p.modelo] ?? 'Recortar', folhas: folhasDeRecortar(p.modelo, p.ordens), avisos };
    }
    case 'motora':
      return p.modelo === 'tracar'
        ? { titulo: 'Siga o caminho', folhas: [{ titulo: 'Siga o caminho', svg: svgTracarA4() }], avisos }
        : { titulo: 'Treino de tesoura', folhas: [{ titulo: 'Treino de tesoura', svg: svgTesouraA4() }], avisos };
    case 'cartoes': {
      const nomes = lerNomes(p.nomes);
      switch (p.modelo) {
        case 'hq':
          return { titulo: 'Quadrinhos', folhas: [{ titulo: 'Quadrinhos', svg: svgHqA4(p.quadros, { linhas: p.linhas }) }], avisos };
        case 'crachas':
          if (!nomes.length) avisos.push('Sem nomes, saem crachás em branco para escrever à mão.');
          return { titulo: 'Crachás', folhas: svgCrachasA4(nomes, textoSeguro(p.linha2)), avisos };
        case 'marcadores':
          return { titulo: 'Marcadores de página', folhas: svgMarcadoresA4(nomes), avisos };
        case 'etiquetas':
          return { titulo: 'Etiquetas de caderno', folhas: svgEtiquetasA4(nomes, textoSeguro(p.linha2)), avisos };
      }
      return { titulo: 'Cartões', folhas: [], avisos };
    }
    case 'pauta': {
      const nome = NOMES_DAS_PAUTAS[p.modelo] ?? NOMES_DAS_PAUTAS.comum;
      const svg = p.modelo === 'caligrafia' ? svgCaligrafiaA4() : svgPautaA4({ ...(PAUTAS[p.modelo] ?? PAUTAS.comum), margem: p.margem });
      return { titulo: `Pauta - ${nome}`, folhas: [{ titulo: nome, svg }], avisos };
    }
    case 'grade': {
      const nome = NOMES_DAS_GRADES[p.modelo] ?? NOMES_DAS_GRADES.q10;
      const svg =
        p.modelo === 'milimetrado'
          ? svgMilimetradoA4()
          : p.modelo === 'pontilhado'
            ? svgPontilhadoA4()
            : p.modelo === 'q5'
              ? svgQuadriculadoA4({ lado: 5, grossura: 0.2 })
              : p.modelo === 'q20'
                ? svgQuadriculadoA4({ lado: 20, grossura: 0.8 })
                : svgQuadriculadoA4();
      avisos.push('As medidas só saem certas com a impressão em tamanho real (escala 100%).');
      return { titulo: nome, folhas: [{ titulo: nome, svg }], avisos };
    }
    case 'reguas':
      avisos.push('As réguas só medem certo com a impressão em tamanho real (escala 100%).');
      return { titulo: 'Réguas de recortar', folhas: [{ titulo: 'Réguas de recortar', svg: svgReguasA4() }], avisos };
    case 'plano': {
      const alcance = numeroOu(p.alcance, 10);
      const q = { a: numeroOu(p.a, 0), b: numeroOu(p.b, 0), c: numeroOu(p.c, 0) };
      if (p.curva && !q.a) {
        avisos.push('Com a = 0 não é função do 2º grau: saiu o plano em branco.');
      }
      const comCurva = p.curva && q.a !== 0;
      const folhas = [
        {
          titulo: comCurva ? 'Parábola' : 'Plano cartesiano',
          svg: svgPlanoCartesianoA4({ alcance, curva: comCurva ? q : undefined }),
        },
      ];
      if (comCurva && p.respostas) {
        folhas.push({ titulo: 'Parábola — respostas', svg: svgPlanoCartesianoA4({ alcance, curva: q, respostas: true }) });
      }
      return { titulo: folhas[0].titulo, folhas, avisos };
    }
    case 'calendario': {
      const ano = Math.min(2200, Math.max(1900, Math.round(numeroOu(p.ano, new Date().getFullYear()))));
      if (p.modelo === 'ano') {
        return { titulo: `Calendário ${ano}`, folhas: [{ titulo: `Calendário ${ano}`, svg: svgCalendarioAnoA4(ano) }], avisos };
      }
      const mes = Math.min(12, Math.max(1, Math.round(numeroOu(p.mes, 1))));
      const svg = svgCalendarioA4({ ano, mes, modelo: p.modelo, imagem: p.imagem, feriados: p.feriados });
      if (p.feriados) avisos.push('Só os feriados nacionais aparecem; os do estado e da cidade, não.');
      const titulo = `Calendário ${String(mes).padStart(2, '0')}-${ano}`;
      return { titulo, folhas: [{ titulo, svg }], avisos };
    }
  }
}
