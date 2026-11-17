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

export { FOLHAS_LIGADAS } from './ligado';

export type ModeloPauta = keyof typeof PAUTAS | 'caligrafia';
export type ModeloGrade = 'q5' | 'q10' | 'q20' | 'milimetrado' | 'pontilhado';

export type Pedido =
  | { tipo: 'caca'; titulo: string; palavras: string; nivel: Nivel; semente: number; respostas: boolean }
  | { tipo: 'cruzadinha'; titulo: string; itens: string; respostas: boolean }
  | { tipo: 'pauta'; modelo: ModeloPauta; margem: boolean }
  | { tipo: 'grade'; modelo: ModeloGrade }
  | { tipo: 'reguas' }
  | { tipo: 'plano'; alcance: number; curva: boolean; a: number; b: number; c: number; respostas: boolean }
  | { tipo: 'calendario'; modelo: 'figura' | 'anotar' | 'ano'; ano: number; mes: number; imagem?: string; feriados: boolean };

export type TipoDeFolha = Pedido['tipo'];

export const TIPOS: Array<{ tipo: TipoDeFolha; nome: string }> = [
  { tipo: 'caca', nome: 'Caça-palavras' },
  { tipo: 'cruzadinha', nome: 'Cruzadinha' },
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
