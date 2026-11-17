/**
 * Separador de sílabas do português — motor puro, sem tela.
 *
 * É uma SUGESTÃO para quem ensina conferir, não um veredito: a ficha de
 * palavra continua só aceitando sílabas que alguém confirmou (ver
 * `fichaDePalavraPropria`). O que as regras não garantem volta em `conferir`.
 *
 * Convenção, a mesma do catálogo de `lerOMundo.ts`:
 *  - encontro final átono depois da sílaba acentuada fica junto, como na fala
 *    corrente (FAR-MÁ-CIA, HO-RÁ-RIO, Á-GUA);
 *  - nos outros casos, i/u antes de vogal é hiato (EN-VI-AR, RU-A, DI-A);
 *  - rr, ss, sc, sç, xc se separam (BAIR-RO, PAS-SA-GEM); ch, lh, nh, qu e gu
 *    não se separam.
 *
 * As fatias saem da palavra como foi escrita (maiúsculas e acentos intactos),
 * então `silabas.join('') === palavra` sempre.
 */

export interface Separacao {
  silabas: string[];
  /** motivos para um humano olhar; vazio = as regras são firmes para esta palavra */
  conferir: string[];
}

const VOGAIS = 'aeiou';
/** grupos que começam sílaba juntos: PRA-TO, A-TLE-TA, PA-LA-VRA */
const ATAQUES = new Set(['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tl', 'tr', 'vr']);

/**
 * Hiatos que a escrita não mostra (sem acento) e a regra geral erraria.
 * `corte` = quantas letras do trecho ficam antes do hiato: pro|ibido.
 */
const HIATOS_SABIDOS: Array<{ trecho: string; corte: number }> = [
  { trecho: 'proib', corte: 3 },
  { trecho: 'coib', corte: 2 },
  { trecho: 'reun', corte: 2 },
  { trecho: 'traidor', corte: 3 },
  { trecho: 'juizad', corte: 2 },
  { trecho: 'luiza', corte: 2 },
  { trecho: 'luisa', corte: 2 },
];

interface Letra {
  /** letra sem acento, minúscula; y conta como i */
  base: string;
  /** agudo ou circunflexo: marca a sílaba forte */
  forte: boolean;
  til: boolean;
  vogal: boolean;
}

function lerLetras(palavra: string): Letra[] {
  const cs = [...palavra];
  const letras = cs.map((c): Letra => {
    const d = c.toLocaleLowerCase('pt-BR').normalize('NFD');
    const base = d[0] === 'y' ? 'i' : d[0];
    return {
      base,
      forte: /[́̂]/u.test(d),
      til: /̃/u.test(d),
      vogal: VOGAIS.includes(base),
    };
  });
  // Y no começo, antes de vogal, é consoante (YASMIN → YAS-MIN).
  if (cs[0]?.toLowerCase() === 'y' && letras[1]?.vogal) letras[0].vogal = false;
  // QU e GU antes de vogal: o U não faz sílaba (QUEI-JO, Á-GUA, GUER-RA).
  for (let i = 1; i < letras.length - 1; i++) {
    const antes = letras[i - 1].base;
    if (letras[i].base === 'u' && !letras[i].forte && (antes === 'q' || antes === 'g') && letras[i + 1].vogal) {
      letras[i].vogal = false;
    }
  }
  return letras;
}

/** a consoante em `k` fecha a sílaba (fim de palavra ou antes de outra consoante)? */
function fechaSilaba(l: Letra[], k: number): boolean {
  const c = l[k];
  if (!c || c.vogal || !'rlzmn'.includes(c.base)) return false;
  const prox = l[k + 1];
  if (!prox) return true;
  if (prox.vogal) return false;
  if (prox.base === 'h') return false; // nh, lh
  if (c.base === 'r' && prox.base === 'r') return false; // bair-ro: o ditongo fica
  return true;
}

function ehFinal(l: Letra[], j: number): boolean {
  return j === l.length - 1 || (j === l.length - 2 && l[j + 1].base === 's');
}

/**
 * As vogais em `i` e `i+1` ficam na mesma sílaba?
 * Devolve também se a decisão é das que pedem olho humano.
 */
function juntas(l: Letra[], i: number, semAcento: string): { junta: boolean; duvida?: string } {
  const a = l[i];
  const b = l[i + 1];
  const par = (a.base + b.base).toUpperCase();

  if (a.til) return { junta: (a.base === 'a' && 'eio'.includes(b.base)) || (a.base === 'o' && b.base === 'e') };
  if (b.til || b.forte) return { junta: false }; // le-ão, sa-í-da, po-é-ti-co
  if (a.forte) return { junta: !'iu'.includes(a.base) && 'iu'.includes(b.base) }; // céu, he-rói; pe-rí-o-do

  for (const h of HIATOS_SABIDOS) {
    let de = semAcento.indexOf(h.trecho);
    while (de !== -1) {
      if (de + h.corte - 1 === i) return { junta: false };
      de = semAcento.indexOf(h.trecho, de + 1);
    }
  }

  const fraca = (x: Letra) => 'iu'.includes(x.base);

  // Ditongo decrescente: ai, ei, oi, au, eu, ou — e ui.
  if ((!fraca(a) && fraca(b)) || (a.base === 'u' && b.base === 'i')) {
    if (l[i + 2]?.base === 'n' && l[i + 3]?.base === 'h') return { junta: false }; // ra-i-nha
    if (fechaSilaba(l, i + 2)) return { junta: false }; // sa-ir, ra-iz, ru-im, a-in-da
    return { junta: true };
  }
  if (a.base === 'i' && b.base === 'u') return { junta: ehFinal(l, i + 1) }; // viu; di-ur-no

  // Encontro final átono depois da forte: far-má-cia, á-rea, má-goa.
  const forteAntes = l.slice(0, i).some((x) => x.forte);
  if (a.base !== b.base && 'aeo'.includes(b.base) && ehFinal(l, i + 1) && forteAntes) {
    return { junta: true, duvida: `${par} final junto, como na fala; há quem separe` };
  }
  if (fraca(a)) return { junta: false, duvida: `${par} separado; confira pela fala` };
  return { junta: false }; // po-e-ta, te-a-tro, vo-o
}

/**
 * Sugere a separação de UMA palavra. Nunca lança: o que não é palavra (espaço,
 * número, hífen) volta inteiro, com o motivo em `conferir`.
 */
export function separarSilabas(entrada: string): Separacao {
  const palavra = entrada.trim().normalize('NFC');
  const cs = [...palavra];
  if (cs.length === 0) return { silabas: [], conferir: [] };
  if (!/^\p{L}+$/u.test(palavra)) {
    return { silabas: [palavra], conferir: ['não é uma palavra só de letras'] };
  }
  const l = lerLetras(palavra);
  if (!l.some((x) => x.vogal)) return { silabas: [palavra], conferir: ['sem vogal'] };

  const conferir: string[] = [];
  const semAcento = l.map((x) => x.base).join('');
  if (/[kwy]/i.test(palavra)) conferir.push('tem K, W ou Y: nome ou palavra de outra língua');
  if (/^(sub|ab|ob|ad)[lr]/.test(semAcento)) conferir.push('prefixo antes de L ou R pode separar (sub-li-nhar)');

  // 1. Núcleos: cada sílaba tem uma vogal, ou duas quando há ditongo.
  const nucleos: Array<{ ini: number; fim: number }> = [];
  for (let i = 0; i < l.length; i++) {
    if (!l[i].vogal) continue;
    const ant = nucleos[nucleos.length - 1];
    if (ant && ant.fim === i - 1 && ant.fim === ant.ini) {
      const d = juntas(l, i - 1, semAcento);
      if (d.duvida) conferir.push(d.duvida);
      if (d.junta) {
        ant.fim = i;
        continue;
      }
    }
    nucleos.push({ ini: i, fim: i });
  }

  // 2. Consoantes entre dois núcleos: a última vai para a frente (com a
  //    companheira, se formarem ataque ou dígrafo); o resto fica atrás.
  const cortes: number[] = [];
  for (let n = 0; n + 1 < nucleos.length; n++) {
    const de = nucleos[n].fim + 1;
    const ate = nucleos[n + 1].ini; // exclusivo
    // unidades: ch, lh, nh, qu, gu contam como uma consoante só
    const unidades: number[] = []; // índice onde cada unidade começa
    for (let k = de; k < ate; k++) {
      const dupla = l[k].base + (l[k + 1]?.base ?? '');
      unidades.push(k);
      if (k + 1 < ate && ['ch', 'lh', 'nh', 'qu', 'gu'].includes(dupla)) k++;
    }
    if (unidades.length === 0) {
      cortes.push(ate);
    } else if (unidades.length === 1) {
      cortes.push(unidades[0]);
    } else {
      const u = unidades[unidades.length - 1];
      const p = unidades[unidades.length - 2];
      const ataque = u === p + 1 && u === ate - 1 && ATAQUES.has(l[p].base + l[u].base);
      cortes.push(ataque ? p : u);
    }
  }

  const silabas: string[] = [];
  let ini = 0;
  for (const c of cortes) {
    silabas.push(cs.slice(ini, c).join(''));
    ini = c;
  }
  silabas.push(cs.slice(ini).join(''));
  return { silabas, conferir: [...new Set(conferir)] };
}

/** MOTORISTA → "MO-TO-RIS-TA": pronto para o campo que a professora confere. */
export function silabasComHifens(palavra: string): string {
  return separarSilabas(palavra).silabas.join('-');
}
