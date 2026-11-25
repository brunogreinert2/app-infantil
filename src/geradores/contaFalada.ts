// A CONTA FALADA (calculadora, etapa 2, 2026-11-25): o que o reconhecedor de
// voz escreveu («quanto é sete vezes oito?», «12 + 7», «dez dividido por três»)
// vira a conta da calculadora. Puro, sem DOM: a tela e os testes usam o mesmo.
//
// O reconhecedor ora escreve algarismos («7 x 8»), ora palavras («sete vezes
// oito»), ora mistura. Aceitamos os dois, em português do Brasil.

import type { Operacao, Pedaco } from './calculadora';

const UNIDADES: Record<string, number> = {
  zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9,
  dez: 10, onze: 11, doze: 12, treze: 13, catorze: 14, quatorze: 14, quinze: 15, dezesseis: 16, dezessete: 17,
  dezoito: 18, dezenove: 19, vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70,
  oitenta: 80, noventa: 90, cem: 100, cento: 100, duzentos: 200, duzentas: 200, trezentos: 300, trezentas: 300,
  quatrocentos: 400, quatrocentas: 400, quinhentos: 500, quinhentas: 500, seiscentos: 600, seiscentas: 600,
  setecentos: 700, setecentas: 700, oitocentos: 800, oitocentas: 800, novecentos: 900, novecentas: 900,
};

/** sem acento, minúsculo, com os sinais separados por espaço */
function limpar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/(\d)\s*[x×*]\s*(?=\d)/g, '$1 × ') // 7x8, 7 x 8
    .replace(/[+×*÷/=?!:]/g, (c) => ` ${c} `)
    .replace(/(\d)\s*-\s*(?=\d)/g, '$1 − ') // 9-3 (hífen entre números é menos)
    .replace(/[−–]/g, ' − ')
    .replace(/\s+/g, ' ')
    .trim();
}

// frases inteiras primeiro (a ordem importa: «multiplicado por» antes de «por»)
const SINAIS: Array<[RegExp, Operacao]> = [
  [/\b(multiplicad[oa]s? por|vezes|x|×|\*)\b|×|\*/g, '×'],
  [/\b(dividid[oa]s? por|dividid[oa]s?|divide por)\b|÷|\//g, '÷'],
  [/\bmais\b|\+/g, '+'],
  [/\bmenos\b|−/g, '−'],
];

/** Lê «trezentos e quarenta e dois mil e cinco» → 342005. */
function lerNumeroPorExtenso(palavras: string[]): number | undefined {
  let total = 0;
  let atual = 0;
  let viu = false;
  for (const p of palavras) {
    if (p === 'e') continue;
    if (p === 'mil') {
      total += (atual || 1) * 1000;
      atual = 0;
      viu = true;
    } else if (p in UNIDADES) {
      atual += UNIDADES[p];
      viu = true;
    } else if (/^\d+(,\d+)?$/.test(p)) {
      atual += Number(p.replace(',', '.'));
      viu = true;
    } else return undefined;
  }
  return viu ? total + atual : undefined;
}

/** Um número dito: «doze», «12», «dois vírgula cinco», «2,5», «meio». */
function lerNumero(trecho: string): string | undefined {
  const t = trecho.trim();
  if (!t) return undefined;
  if (/^\d+([.,]\d+)?$/.test(t)) return t.replace('.', ',');
  if (t === 'meio' || t === 'meia') return '0,5';
  const [antes, depois] = t.split(/\bvirgula\b/);
  const inteiro = lerNumeroPorExtenso(antes.trim().split(' ').filter(Boolean));
  if (inteiro === undefined) return undefined;
  if (depois === undefined) return String(inteiro);
  // depois da vírgula, algarismo por algarismo («dois vírgula zero cinco»)
  const casas = depois.trim().split(' ').filter(Boolean).map((p) => (p in UNIDADES && UNIDADES[p] < 10 ? String(UNIDADES[p]) : /^\d+$/.test(p) ? p : undefined));
  if (!casas.length || casas.some((c) => c === undefined)) return undefined;
  return `${inteiro},${casas.join('')}`;
}

/**
 * A conta que a pessoa disse, pronta para a calculadora resolver; ou
 * `undefined` se não deu para entender (aí a tela pede para tentar de novo).
 */
export function contaFalada(texto: string): Pedaco[] | undefined {
  let s = ` ${limpar(texto)} `;
  // o que não é conta: «quanto é», «quanto que dá», «calcula», o «igual» do fim
  s = s.replace(/\b(quanto (que )?(e|da|fica)|qual (e )?o resultado de|calcul[ae]r?|me diz|por favor|e igual a?|igual a?|da quanto|resultado)\b/g, ' ');
  s = s.replace(/[?!=:]/g, ' ');
  // «sem» soa igual a «cem», e numa conta só pode ser o número (o reconhecedor
  // escreveu «sem» no teste de 2026-11-25)
  s = s.replace(/\bsem\b/g, 'cem');
  for (const [re, op] of SINAIS) s = s.replace(re, ` §${op}§ `);
  const partes = s.split(/§/).map((p) => p.trim()).filter(Boolean);
  const pedacos: Pedaco[] = [];
  for (const parte of partes) {
    if (parte === '+' || parte === '−' || parte === '×' || parte === '÷') {
      if (!pedacos.length || pedacos[pedacos.length - 1].tipo === 'op') return undefined;
      pedacos.push({ tipo: 'op', op: parte });
    } else {
      const n = lerNumero(parte.replace(/^(o|a|os|as)\s+/, ''));
      if (n === undefined || pedacos[pedacos.length - 1]?.tipo === 'num') return undefined;
      pedacos.push({ tipo: 'num', texto: n });
    }
  }
  // tem de ter número, sinal, número… e terminar em número
  if (pedacos.length < 3 || pedacos[pedacos.length - 1].tipo !== 'num') return undefined;
  return pedacos;
}
