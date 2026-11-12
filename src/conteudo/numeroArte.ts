// Folhas A4 dos Números. Mesmas peças das folhas de alfabeto (alfabetoArte.ts):
// contorno preto, regiões brancas com id="regiao-*" e class="colorir-alvo",
// legendas em caminhos vetoriais — a mesma arte serve ao app, ao SVG avulso e
// à impressão.
//
// Só geometria (círculos, quadros, estrelas, reta): é o que o código desenha
// bem. Sem "nota", sem certo e errado na folha — a criança conta, pinta,
// aponta ou escreve do jeito dela.

import {
  base,
  letras,
  linha,
  linhasTexto,
  quadro,
  regiao,
  svgQuadrosA4,
  texto as textoDaLegenda,
} from './alfabetoArte';
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

// ---------- peças comuns ----------

const TINTA = '#000000';

/** Bolinhas pintáveis numa fileira; cada uma é uma região. */
function bolinhas(prefixo: string, n: number, x: number, cy: number, r = 20, passo = 48): string {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += regiao(`${prefixo}-${i + 1}`, `<circle cx="${x + r + i * passo}" cy="${cy}" r="${r}"/>`);
  }
  return s;
}

type Sinal = 'mais' | 'menos' | 'vezes' | 'dividir' | 'igual';

// Os sinais são desenhados, não escritos: traço grosso, sempre do mesmo
// tamanho, e sem depender de a fonte ter o sinal de menos ou de dividir.
function sinal(tipo: Sinal, cx: number, cy: number, t = 15): string {
  const d = {
    mais: `M${cx - t} ${cy}H${cx + t}M${cx} ${cy - t}V${cy + t}`,
    menos: `M${cx - t} ${cy}H${cx + t}`,
    vezes: `M${cx - t * 0.8} ${cy - t * 0.8}L${cx + t * 0.8} ${cy + t * 0.8}M${cx + t * 0.8} ${cy - t * 0.8}L${cx - t * 0.8} ${cy + t * 0.8}`,
    dividir: `M${cx - t} ${cy}H${cx + t}`,
    igual: `M${cx - t} ${cy - 7}H${cx + t}M${cx - t} ${cy + 7}H${cx + t}`,
  }[tipo];
  const pontos =
    tipo === 'dividir'
      ? `<circle cx="${cx}" cy="${cy - 12}" r="4.5" fill="${TINTA}" stroke="none"/><circle cx="${cx}" cy="${cy + 12}" r="4.5" fill="${TINTA}" stroke="none"/>`
      : '';
  const nome = { mais: 'mais', menos: 'menos', vezes: 'vezes', dividir: 'dividido por', igual: 'igual a' }[tipo];
  return `<g role="img" aria-label="${nome}" fill="none" stroke="${TINTA}" stroke-width="6" pointer-events="none"><path d="${d}"/>${pontos}</g>`;
}

/** A reta de 0 a 10, com uma casinha pintável em cada número. */
function reta(prefixo: string, y: number): string {
  const passo = 66;
  const x = 70;
  let s = linha(x, y, x + 10 * passo, y);
  for (let i = 0; i <= 10; i++) {
    s += regiao(`${prefixo}-${i}`, `<circle cx="${x + i * passo}" cy="${y}" r="23"/>`);
    s += texto(String(i), x + i * passo, y + 53, 21, 'middle');
  }
  return s;
}

/** A caixa vazia onde a criança escreve ou desenha a resposta. */
function caixaResposta(id: string, x: number, y: number): string {
  return quadro(id, x, y, 74, 74, 12);
}

// ---------- folha única: de zero a dez ----------

export function svgNumerosTabelaA4(): string {
  let corpo = texto('Observe, conte e pinte. Cada número tem um nome.', 48, 154, 21);
  const passo = 205;
  for (let n = 0; n <= 10; n++) {
    const x = 48 + (n % 4) * 180;
    const y = 179 + Math.floor(n / 4) * passo;
    corpo += quadro(`regiao-quadro-${n}`, x, y, 164, passo - 13);
    corpo += letras(`regiao-numero-${n}`, String(n), x + 16, y + 16, 132, passo - 78);
    corpo += texto(NOMES_DOS_NUMEROS[n], x + 82, y + passo - 30, 21, 'middle');
  }
  // o canto vazio da grade (onze números em quatro colunas)
  corpo += texto('Até onde você', 670, 179 + 2 * passo + 75, 19, 'middle');
  corpo += texto('sabe contar?', 670, 179 + 2 * passo + 103, 19, 'middle');
  corpo += texto('Conte em voz alta!', 670, 179 + 2 * passo + 145, 17, 'middle');
  corpo += reta('regiao-reta', 870);
  corpo += linhasTexto('Conte os dedos, os degraus, as estrelas. Depois pinte a casinha do número de que você mais gosta.', 48, 990, 704, 19, 27);
  return base('Os números de zero a dez', 'Números · todos em uma folha', corpo, false);
}

// ---------- de dez em dez ----------

export function svgDezenasA4(): string {
  const nomes = ['dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa', 'cem'];
  return svgQuadrosA4(
    'De dez em dez até cem',
    'Números · consulta',
    [{ titulo: 'Dez dedos de cada vez', itens: nomes.map((rotulo, i) => ({ simbolos: String((i + 1) * 10), rotulo })) }],
    'Mostre as duas mãos abertas: são dez dedos. Abra de novo: vinte! Quantas vezes você abre as mãos até chegar no cem?',
  );
}

// ---------- números romanos ----------

export const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export function svgRomanosA4(): string {
  const letrasQueValem: Array<[string, string]> = [
    ['I', 'um'], ['V', 'cinco'], ['X', 'dez'], ['L', 'cinquenta'], ['C', 'cem'], ['D', 'quinhentos'], ['M', 'mil'],
  ];
  return svgQuadrosA4(
    'Números romanos',
    'Números · consulta',
    [
      { titulo: 'De um a dez, do jeito dos romanos', itens: ROMANOS.slice(0, 10).map((simbolos, i) => ({ simbolos, rotulo: NOMES_DOS_NUMEROS[i + 1] })) },
      { titulo: 'Sete letras que valem números', itens: letrasQueValem.map(([simbolos, rotulo]) => ({ simbolos, rotulo })) },
    ],
    'Letra menor DEPOIS da maior: junta. VI é cinco mais um. Letra menor ANTES da maior: tira. IV é cinco menos um; IX é dez menos um.',
  );
}

export function svgRelogioRomanoA4(): string {
  const cx = 400;
  const cy = 570;
  let corpo = texto('Os relógios antigos usam números romanos. Pinte cada hora!', 48, 197, 22);
  corpo += regiao('regiao-aro', `<circle cx="${cx}" cy="${cy}" r="322"/>`);
  corpo += regiao('regiao-mostrador', `<circle cx="${cx}" cy="${cy}" r="296"/>`);
  let riscos = '';
  for (let h = 0; h < 12; h++) {
    const a = (h * Math.PI) / 6 - Math.PI / 2;
    // h = 0 fica no alto: é o XII
    const rotulo = ROMANOS[(h + 11) % 12];
    const largura = Math.max(46, rotulo.length * 24);
    const x = cx + 228 * Math.cos(a);
    const y = cy + 228 * Math.sin(a);
    corpo += letras(`regiao-hora-${h === 0 ? 12 : h}`, rotulo, x - largura / 2, y - 26, largura, 52);
    riscos += `M${(cx + 281 * Math.cos(a)).toFixed(1)} ${(cy + 281 * Math.sin(a)).toFixed(1)}L${(cx + 294 * Math.cos(a)).toFixed(1)} ${(cy + 294 * Math.sin(a)).toFixed(1)}`;
  }
  corpo += `<path d="${riscos}" fill="none" stroke="${TINTA}" stroke-width="5" pointer-events="none"/>`;
  corpo += regiao('regiao-centro', `<circle cx="${cx}" cy="${cy}" r="13"/>`);
  corpo += texto('Que horas você acorda? Desenhe os dois ponteiros.', 400, 945, 22, 'middle');
  corpo += texto('O ponteiro pequeno mostra a hora. O grande mostra os minutos.', 400, 985, 18, 'middle');
  corpo += texto('Você pode desenhar, apontar ou contar para alguém.', 400, 1034, 18, 'middle');
  return base('O relógio romano', 'Números · romanos', corpo);
}

// ---------- as quatro operações ----------
// Cada folha: três contas para VER (bolinhas), a reta para conferir pulando
// e um convite para inventar a própria. A caixa da resposta fica vazia: a
// folha não diz se está certo — quem confere é a criança, contando.

const Y_CONTAS = [232, 422, 612];
const ALTURA_CONTA = 168;

function fimDaFolha(convite: string): string {
  return (
    texto('Confira pulando na reta.', 48, 838, 22) +
    reta('regiao-reta', 884) +
    texto(convite, 48, 1010, 22) +
    linha(48, 1048, 752, 1048)
  );
}

export function svgJuntarA4(): string {
  let corpo = texto('Junte as bolinhas. Quantas ficam ao todo?', 48, 197, 24);
  ([[2, 3], [4, 1], [3, 3]] as Array<[number, number]>).forEach(([a, b], k) => {
    const y = Y_CONTAS[k];
    const cy = y + 62;
    corpo += quadro(`regiao-conta-${k + 1}`, 48, y, 704, ALTURA_CONTA);
    corpo += bolinhas(`regiao-conta-${k + 1}-a`, a, 78, cy) + sinal('mais', 348, cy);
    corpo += bolinhas(`regiao-conta-${k + 1}-b`, b, 388, cy) + sinal('igual', 640, cy);
    corpo += caixaResposta(`regiao-resposta-${k + 1}`, 668, cy - 37);
    corpo += texto(String(a), 78 + (a * 48 - 8) / 2, y + 138, 34, 'middle');
    corpo += texto(String(b), 388 + (b * 48 - 8) / 2, y + 138, 34, 'middle');
  });
  corpo += fimDaFolha('Invente uma conta de juntar:');
  return base('Juntar: a conta de mais', 'Números · operações', corpo);
}

export function svgTirarA4(): string {
  let corpo = texto('Pinte as bolinhas. Risque as que vão embora. Quantas sobram?', 48, 197, 22);
  ([[5, 2], [4, 1], [6, 3]] as Array<[number, number]>).forEach(([tudo, tira], k) => {
    const y = Y_CONTAS[k];
    const cy = y + 62;
    corpo += quadro(`regiao-conta-${k + 1}`, 48, y, 704, ALTURA_CONTA);
    corpo += bolinhas(`regiao-conta-${k + 1}-a`, tudo, 78, cy) + sinal('menos', 410, cy);
    corpo += letras(`regiao-conta-${k + 1}-tira`, String(tira), 452, cy - 38, 90, 76);
    corpo += sinal('igual', 600, cy) + caixaResposta(`regiao-resposta-${k + 1}`, 668, cy - 37);
    corpo += texto(String(tudo), 78 + (tudo * 48 - 8) / 2, y + 138, 34, 'middle');
    corpo += texto(`vão embora ${tira}`, 497, y + 138, 20, 'middle');
  });
  corpo += fimDaFolha('Invente uma conta de tirar:');
  return base('Tirar: a conta de menos', 'Números · operações', corpo);
}

export function svgVezesA4(): string {
  let corpo = texto('Grupos iguais! Quantas bolinhas há ao todo?', 48, 197, 24);
  ([[2, 3], [3, 2], [4, 2]] as Array<[number, number]>).forEach(([grupos, cada], k) => {
    const y = Y_CONTAS[k];
    const cy = y + 62;
    const larguraGrupo = cada * 42 + 14;
    corpo += quadro(`regiao-conta-${k + 1}`, 48, y, 704, ALTURA_CONTA);
    for (let g = 0; g < grupos; g++) {
      const x = 74 + g * (larguraGrupo + 14);
      corpo += quadro(`regiao-conta-${k + 1}-grupo-${g + 1}`, x, cy - 30, larguraGrupo, 60, 14);
      corpo += bolinhas(`regiao-conta-${k + 1}-grupo-${g + 1}-bola`, cada, x + 9, cy, 17, 42);
    }
    corpo += sinal('igual', 640, cy) + caixaResposta(`regiao-resposta-${k + 1}`, 668, cy - 37);
    corpo += texto(`${grupos} grupos de ${cada}`, 74, y + 138, 26);
  });
  corpo += fimDaFolha('Desenhe os seus grupos iguais:');
  return base('Grupos iguais: a conta de vezes', 'Números · operações', corpo);
}

export function svgRepartirA4(): string {
  let corpo = texto('Reparta igual: uma bolinha para cada prato, até acabar.', 48, 197, 22);
  ([[6, 2], [8, 4], [9, 3]] as Array<[number, number]>).forEach(([total, pratos], k) => {
    const y = Y_CONTAS[k];
    corpo += quadro(`regiao-conta-${k + 1}`, 48, y, 704, ALTURA_CONTA);
    corpo += bolinhas(`regiao-conta-${k + 1}-bola`, total, 74, y + 36, 16, 40);
    for (let p = 0; p < pratos; p++) {
      corpo += quadro(`regiao-conta-${k + 1}-prato-${p + 1}`, 74 + p * 128, y + 68, 112, 62, 31);
    }
    corpo += texto(`${total} bolinhas em ${pratos} pratos`, 74, y + 156, 19);
    corpo += sinal('igual', 640, y + 99) + caixaResposta(`regiao-resposta-${k + 1}`, 668, y + 62);
    corpo += texto('em cada', 705, y + 156, 17, 'middle');
  });
  corpo += fimDaFolha('Reparta alguma coisa sua:');
  return base('Repartir igual: a conta de dividir', 'Números · operações', corpo);
}

// ---------- tabuada para pintar ----------

export function svgTabuadaA4(): string {
  const lado = 62;
  const x0 = 110;
  const y0 = 282;
  let corpo = texto('Escolha um número. Pinte a fileira dele de uma cor só.', 48, 190, 22);
  corpo += texto('Achou números que se repetem? Pinte da mesma cor!', 48, 222, 20);
  corpo += sinal('vezes', x0 - 31, y0 - 31, 13);
  for (let i = 1; i <= 10; i++) {
    corpo += texto(String(i), x0 + (i - 1) * lado + lado / 2, y0 - 20, 26, 'middle');
    corpo += texto(String(i), x0 - 31, y0 + (i - 1) * lado + lado / 2 + 9, 26, 'middle');
    for (let j = 1; j <= 10; j++) {
      const x = x0 + (j - 1) * lado;
      const y = y0 + (i - 1) * lado;
      corpo += quadro(`regiao-vezes-${i}-${j}`, x, y, lado, lado, 5);
      corpo += texto(String(i * j), x + lado / 2, y + lado / 2 + 7, 20, 'middle');
    }
  }
  corpo += linhasTexto('Segredo: três vezes quatro e quatro vezes três dão o mesmo número. Procure os pares!', 48, 955, 704, 19, 27);
  corpo += texto('Não precisa decorar. Precisa passear.', 48, 1034, 18);
  return base('Tabuada para pintar', 'Números · operações', corpo);
}

