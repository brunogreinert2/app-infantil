// O tema "Monte o seu": a criança escolhe FUNDO e COR FAVORITA; todo o resto
// (tinta do texto, cartão, borda, título, botão) é derivado aqui, de modo que
// nenhuma combinação fique ilegível. Só conta — testável sem navegador.
//
// Pisos (temaDerivado.test.ts confere TODAS as combinações que a tela oferece):
//   texto sobre fundo ≥ 7:1 · título sobre fundo ≥ 4,5:1 · letra do botão ≥ 4,5:1

import { TEXTO_ESCURO, contraste, textoParaFundo } from '../canvas/cores';

export interface CoresDoTema {
  fundo: string;
  destaque: string;
}

function canais(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function misturar(hexA: string, hexB: string, pesoB: number): string {
  const a = canais(hexA);
  const b = canais(hexB);
  const c = a.map((v, i) => Math.round(v * (1 - pesoB) + b[i] * pesoB));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Leva `cor` na direção de `alvo`, aos poucos, até ter contraste ≥ 4,5 com
 * `fundo`. Se nem assim chegar, fica com o próprio `alvo` — que é a tinta do
 * texto, e essa se lê por construção.
 */
export function garantirContraste(cor: string, fundo: string, alvo: string): string {
  let atual = cor;
  for (let passo = 0; passo < 12 && contraste(atual, fundo) < 4.5; passo++) {
    atual = misturar(atual, alvo, 0.2);
  }
  return contraste(atual, fundo) >= 4.5 ? atual : alvo;
}

// o texto "suave" (ajudas, autor do livro) é a tinta do texto um pouco
// misturada ao fundo — mas nunca a ponto de cair abaixo de 4,5:1
function textoSuave(texto: string, fundo: string): string {
  for (const peso of [0.3, 0.2, 0.1]) {
    const cor = misturar(texto, fundo, peso);
    if (contraste(cor, fundo) >= 4.5) return cor;
  }
  return texto;
}

export function derivarPaleta(t: CoresDoTema): Record<string, string> {
  // a tinta do texto é a que se lê melhor neste fundo (antes era um corte
  // fixo de claridade, que errava nos fundos de claridade média)
  const texto = textoParaFundo(t.fundo);
  const claro = texto === TEXTO_ESCURO;
  // cartão "eleva": mais claro que o fundo nos dois modos
  const cartao = misturar(t.fundo, '#ffffff', claro ? 0.55 : 0.12);
  return {
    '--fundo': t.fundo,
    '--cartao': cartao,
    '--texto': texto,
    '--texto-suave': textoSuave(texto, t.fundo),
    // A cor favorita é o fundo dos botões grandes, cuja letra é da cor do
    // cartão: qualquer cor pode ser escolhida, e aqui ela é escurecida ou
    // clareada só o que precisar para o botão se ler.
    '--destaque': garantirContraste(t.destaque, cartao, texto),
    // a cor favorita pinta os TÍTULOS — escurecida/clareada até ler bem
    '--titulo': garantirContraste(t.destaque, t.fundo, texto),
    '--borda': misturar(t.fundo, texto, 0.18),
    '--sombra': claro ? '0 4px 14px rgba(60, 40, 20, 0.14)' : '0 4px 14px rgba(0, 0, 0, 0.5)',
  };
}
