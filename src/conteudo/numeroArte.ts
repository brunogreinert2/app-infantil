// Folhas A4 dos Números. Mesmas peças das folhas de alfabeto (alfabetoArte.ts):
// contorno preto, regiões brancas com id="regiao-*" e class="colorir-alvo",
// legendas em caminhos vetoriais — a mesma arte serve ao app, ao SVG avulso e
// à impressão.
//
// Só geometria (círculos, quadros, estrelas, reta): é o que o código desenha
// bem. Sem "nota", sem certo e errado na folha — a criança conta, pinta,
// aponta ou escreve do jeito dela.

import { base, letras, linha, quadro, regiao, texto as textoDaLegenda } from './alfabetoArte';
import glifos from './glifos.json';
import legendas from './glifos-legendas.json';

const G = glifos as Record<string, { d: string; adv: number }>;
const L = legendas as Record<string, { d: string; adv: number }>;

// O ZERO CORTADO. A fonte das legendas (Atkinson Hyperlegible) desenha o zero
// com um risco no meio, para não confundir com a letra O. Ótimo num código;
// péssimo numa folha que ensina o zero a quem tem 7 anos — ninguém escreve
// zero assim no caderno. Então, nas folhas de Números, todo algarismo de
// legenda vem da Cardo (a mesma do número grande), e o resto continua igual.
function texto(
  s: string,
  x: number,
  y: number,
  size = 22,
  anchor: 'start' | 'middle' | 'end' = 'start',
): string {
  if (!/\d/.test(s)) return textoDaLegenda(s, x, y, size, anchor);
  const sinais = [...s].map((c) => {
    const g = /\d/.test(c) ? G[c] : L[c];
    if (!g) throw new Error(`Falta glifo: ${c}`);
    return g;
  });
  const total = sinais.reduce((n, g) => n + (g.adv * size) / 1000, 0);
  let atual = x - (anchor === 'middle' ? total / 2 : anchor === 'end' ? total : 0);
  const caminhos = sinais
    .map((g) => {
      const p = g.d
        ? `<path d="${g.d}" transform="translate(${atual.toFixed(2)} ${y}) scale(${size / 1000})"/>`
        : '';
      atual += (g.adv * size) / 1000;
      return p;
    })
    .join('');
  return `<g role="img" aria-label="${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')}" lang="pt-BR" fill="#000000" stroke="none" pointer-events="none">${caminhos}</g>`;
}

export const NOMES_DOS_NUMEROS = [
  'zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
];

// estrela de cinco pontas, centro (cx, cy), raio de fora r
function estrela(cx: number, cy: number, r: number): string {
  const pontos: string[] = [];
  for (let i = 0; i < 10; i++) {
    const raio = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pontos.push(`${(cx + raio * Math.cos(a)).toFixed(1)} ${(cy + raio * Math.sin(a)).toFixed(1)}`);
  }
  return `<path d="M${pontos.join(' L')} Z"/>`;
}

const plural = (n: number, um: string, varios: string) => (n === 1 ? um : varios);

/**
 * A folha de um número de 0 a 10: o algarismo grande para pintar, a
 * quantidade num quadro de dez, estrelas para contar, o número escondido
 * entre outros, a casinha dele na reta e um lugar para escrever.
 */
export function svgNumeroA4(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 10) throw new Error(`Número fora da folha: ${n}`);
  const algarismo = String(n);
  const nome = NOMES_DOS_NUMEROS[n];

  // --- 1. o número e a quantidade ---
  let corpo = texto('1. Observe e pinte o número e as bolinhas.', 48, 197, 24);
  corpo += quadro('regiao-quadro-numero', 48, 216, 336, 254) + quadro('regiao-quadro-quantidade', 416, 216, 336, 254);
  corpo += texto('NÚMERO', 216, 249, 18, 'middle') + texto('QUANTIDADE', 584, 249, 18, 'middle');
  corpo += letras('regiao-numero', algarismo, 78, 268, 276, 182);

  // quadro de dez: duas fileiras de cinco casas; as primeiras n têm bolinha
  const lado = 56;
  const x0 = 584 - (5 * lado) / 2;
  const y0 = 272;
  for (let i = 0; i < 10; i++) {
    const x = x0 + (i % 5) * lado;
    const y = y0 + Math.floor(i / 5) * lado;
    corpo += quadro(`regiao-casa-${i + 1}`, x, y, lado, lado, 6);
  }
  for (let i = 0; i < n; i++) {
    const cx = x0 + (i % 5) * lado + lado / 2;
    const cy = y0 + Math.floor(i / 5) * lado + lado / 2;
    corpo += regiao(`regiao-bolinha-${i + 1}`, `<circle cx="${cx}" cy="${cy}" r="19"/>`);
  }
  corpo += texto(nome, 584, 438, 34, 'middle');

  // --- 2. contar ---
  corpo += texto(
    n === 0
      ? '2. Zero é nenhuma. Deixe todas as estrelas sem pintar!'
      : `2. Conte e pinte ${algarismo} ${plural(n, 'estrela', 'estrelas')}.`,
    48, 520, 24,
  );
  for (let i = 0; i < 10; i++) {
    corpo += regiao(`regiao-estrela-${i + 1}`, estrela(83 + i * 70.4, 577, 31));
  }

  // --- 3. achar o número entre outros ---
  corpo += texto(`3. Encontre o ${algarismo}. Pinte ou aponte.`, 48, 667, 24);
  const escondidos = [n, (n + 1) % 10, (n + 4) % 10, n, (n + 7) % 10, (n + 2) % 10].map((v) =>
    // o 10 tem dois algarismos: na busca entra como ele mesmo, os outros de 0 a 9
    v === n ? algarismo : String(v),
  );
  escondidos.forEach((s, j) => {
    corpo += quadro(`regiao-busca-quadro-${j}`, 48 + j * 120, 686, 104, 93, 15);
    corpo += letras(`regiao-busca-numero-${j}`, s, 63 + j * 120, 703, 74, 58);
  });

  // --- 4. a reta numérica ---
  corpo += texto(`4. Onde o ${algarismo} mora? Pinte a casinha dele.`, 48, 834, 24);
  const passo = 66;
  const xr = 70;
  const yr = 884;
  corpo += linha(xr, yr, xr + 10 * passo, yr);
  for (let i = 0; i <= 10; i++) {
    corpo += regiao(`regiao-reta-${i}`, `<circle cx="${xr + i * passo}" cy="${yr}" r="23"/>`);
    corpo += texto(String(i), xr + i * passo, 937, 21, 'middle');
  }

  // --- 5. escrever ---
  corpo += texto('5. Escreva do seu jeito.', 48, 989, 24);
  corpo += letras('regiao-modelo', algarismo, 48, 1000, 70, 52);
  corpo += linha(140, 1048, 752, 1048);

  // título por extenso: o título passa pela legenda comum (zero cortado)
  return base(`O número ${nome}`, 'Números · um por um', corpo);
}
