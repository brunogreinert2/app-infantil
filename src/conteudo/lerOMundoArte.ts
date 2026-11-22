// Folhas A4 de Ler o Mundo (letramento para jovens e adultos).
// Mesmas peças das folhas de alfabeto (alfabetoArte.ts): contorno preto,
// regiões brancas com id="regiao-*" e class="colorir-alvo", legendas em
// caminhos vetoriais. A mesma arte serve ao app, ao SVG avulso e à impressão.
//
// O que muda é a cara: outra marca no cabeçalho, verbos de adulto (destaque,
// circule, marque) e molduras de sinalização em vez de bichos.

import {
  base,
  largura,
  letras,
  linha,
  linhasTexto,
  quadro,
  regiao,
  texto,
  type Identidade,
} from './alfabetoArte';
import { textoComAlgarismos } from './numeroArte';
import glifos from './glifos.json';
import { parecidasDe, type Contexto, type GrupoDePalavras, type PalavraDoMundo } from './lerOMundo';

const TINTA = '#000000';
const GLIFO = glifos as Record<string, { d: string; adv: number; y1: number }>;

// NOME PROVISÓRIO. Sem endereço no rodapé de propósito: "historinhas.app.br"
// na folha de um adolescente desfaz o cuidado todo. Ver docs/LER_O_MUNDO.md.
export const IDENTIDADE_LER_O_MUNDO: Identidade = {
  marca: 'LER O MUNDO',
  descricao:
    'Folha A4 de Ler o Mundo. {categoria}. Destaque, circule, aponte, fale ou escreva, do seu jeito.',
  rodapeEsquerda: '',
  rodapeDireita: 'Seu jeito de participar também conta.',
};

const folha = (titulo: string, categoria: string, corpo: string, identificacao = true) =>
  base(titulo, categoria, corpo, identificacao, IDENTIDADE_LER_O_MUNDO);

/** traço que não é região de destacar (seta, maçaneta, haste) */
function risco(d: string, grossura = 4): string {
  return `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${grossura}" pointer-events="none"/>`;
}

/** texto cheio (Atkinson), no maior tamanho que couber em `max` */
function textoQueCabe(s: string, cx: number, y: number, max: number, teto: number): string {
  const tamanho = Math.min(teto, (max / largura(s, 100)) * 100);
  return texto(s, cx, y + tamanho * 0.36, Math.floor(tamanho), 'middle');
}

// ---------------------------------------------------------------------------
// Passo 1: a palavra como ela aparece no mundo. Área útil: x 48–752, y 216–478.
// ---------------------------------------------------------------------------

function seta(x: number, y: number, comprimento: number): string {
  const p = x + comprimento;
  return risco(`M${x} ${y} H${p} M${p - 26} ${y - 22} L${p} ${y} L${p - 26} ${y + 22}`, 9);
}

function moldura(contexto: Contexto, palavra: string): string {
  switch (contexto) {
    case 'octogono': {
      const pontos = Array.from({ length: 8 }, (_, i) => {
        const a = ((22.5 + i * 45) * Math.PI) / 180;
        return `${(400 + 132 * Math.cos(a)).toFixed(1)} ${(347 + 132 * Math.sin(a)).toFixed(1)}`;
      });
      return (
        regiao('regiao-placa', `<path d="M${pontos.join(' L')} Z"/>`) +
        textoQueCabe(palavra, 400, 347, 196, 84)
      );
    }
    case 'alerta':
      return (
        regiao('regiao-sinal', '<path d="M170 232 L286 446 H54 Z"/>') +
        texto('!', 170, 420, 130, 'middle') +
        quadro('regiao-placa', 318, 284, 434, 126, 14) +
        textoQueCabe(palavra, 535, 347, 390, 62)
      );
    case 'proibido':
      return (
        regiao('regiao-sinal', '<circle cx="160" cy="347" r="104"/>') +
        risco('M88 275 L232 419', 16) +
        quadro('regiao-placa', 300, 284, 452, 126, 14) +
        textoQueCabe(palavra, 526, 347, 408, 62)
      );
    case 'seta':
      return (
        quadro('regiao-placa', 78, 262, 644, 170, 16) +
        textoQueCabe(palavra, 330, 347, 400, 82) +
        seta(570, 347, 112)
      );
    case 'porta':
      return (
        quadro('regiao-porta', 84, 226, 150, 252, 6) +
        `<circle cx="212" cy="356" r="8" fill="${TINTA}" pointer-events="none"/>` +
        quadro('regiao-placa', 286, 284, 466, 126, 14) +
        textoQueCabe(palavra, 519, 347, 422, 64)
      );
    case 'letreiro':
      return (
        quadro('regiao-onibus', 130, 222, 540, 258, 30) +
        quadro('regiao-placa', 172, 242, 456, 88, 8) +
        textoQueCabe(palavra, 400, 286, 420, 64) +
        quadro('regiao-para-brisa', 172, 346, 456, 72, 8) +
        risco('M400 346 V418', 3) +
        regiao('regiao-farol-1', '<circle cx="198" cy="450" r="14"/>') +
        regiao('regiao-farol-2', '<circle cx="602" cy="450" r="14"/>') +
        risco('M130 300 H102 V352 M670 300 H698 V352', 5)
      );
    case 'poste':
      return (
        risco('M400 380 V478', 12) +
        quadro('regiao-placa', 176, 232, 448, 150, 16) +
        textoQueCabe(palavra, 400, 307, 400, 76)
      );
    case 'etiqueta':
      return (
        regiao('regiao-placa', '<path d="M236 262 H700 Q716 262 716 278 V416 Q716 432 700 432 H236 L132 347 Z"/>') +
        `<circle cx="206" cy="347" r="13" fill="#ffffff" stroke="${TINTA}" stroke-width="3" pointer-events="none"/>` +
        risco('M132 347 H72', 3) +
        textoQueCabe(palavra, 478, 347, 400, 72)
      );
    case 'tela':
      return (
        quadro('regiao-celular', 254, 220, 292, 260, 28) +
        risco('M368 242 H432', 5) +
        quadro('regiao-placa', 282, 306, 236, 88, 44) +
        textoQueCabe(palavra, 400, 350, 200, 46) +
        `<circle cx="400" cy="448" r="11" fill="none" stroke="${TINTA}" stroke-width="3" pointer-events="none"/>`
      );
    case 'documento': {
      const tamanho = Math.min(54, (300 / largura(palavra, 100)) * 100);
      const fim = 96 + largura(`${palavra}:`, tamanho);
      return (
        quadro('regiao-placa', 60, 248, 680, 198, 8) +
        texto(`${palavra}:`, 96, 366, Math.floor(tamanho)) +
        linha(fim + 18, 370, 706, 370)
      );
    }
    case 'placa':
      return quadro('regiao-placa', 110, 270, 580, 154, 16) + textoQueCabe(palavra, 400, 347, 530, 84);
  }
}

/**
 * Só a placa do passo 1 (a palavra como aparece no mundo), para a TELA do
 * Ler o Mundo (2026-11-22). O mesmo desenho da folha, recortado.
 */
export function svgPlacaDaPalavra(p: PalavraDoMundo): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 210 720 280" role="img" aria-label="${p.palavra}">` +
    moldura(p.contexto, p.palavra) +
    '</svg>'
  );
}

// ---------------------------------------------------------------------------
// A ficha de uma palavra
// ---------------------------------------------------------------------------

/**
 * Caixas lado a lado, centralizadas, cada uma com um pedaço da palavra.
 * Todas as letras na MESMA escala (a palavra é uma só, cortada em partes) e
 * cada letra é uma região: dá para destacar a caixa inteira ou letra por letra.
 */
function partes(pedacos: string[], y: number): string {
  const n = pedacos.length;
  const folga = n > 8 ? 6 : 12; // entre caixas
  const margem = 13; // dentro da caixa, de cada lado
  const respiro = 110; // entre letras, em unidades da fonte (evita contornos encostados)
  const avanco = (s: string) =>
    [...s].reduce((t, c) => {
      if (!GLIFO[c]) throw new Error(`Falta letra vetorial: ${c}`);
      return t + GLIFO[c].adv;
    }, 0) + ([...s].length - 1) * respiro;
  const total = pedacos.reduce((t, s) => t + avanco(s), 0);
  const altura = -GLIFO.E.y1; // altura das maiúsculas
  const f = Math.min(70 / altura, (704 - n * 2 * margem - (n - 1) * folga) / total);
  const larguraTotal = total * f + n * 2 * margem + (n - 1) * folga;
  let x = 400 - larguraTotal / 2;
  const base = y + 94;
  return pedacos
    .map((s, i) => {
      const w = avanco(s) * f + 2 * margem;
      let lx = x + margem;
      const desenhadas = [...s]
        .map((c, j) => {
          const g = GLIFO[c];
          const d = `<g role="img" lang="pt-BR" aria-label="${c}"><path d="${g.d}" transform="translate(${lx.toFixed(2)} ${base}) scale(${f.toFixed(5)})" stroke-width="${(3 / f).toFixed(3)}"/></g>`;
          lx += (g.adv + respiro) * f;
          return regiao(`regiao-parte-${i + 1}-letra-${j + 1}`, d);
        })
        .join('');
      const caixa = quadro(`regiao-parte-quadro-${i + 1}`, x, y, w, 118, 12) + desenhadas;
      x += w + folga;
      return caixa;
    })
    .join('');
}

export function svgPalavraA4(p: PalavraDoMundo): string {
  const { palavra } = p;
  const emSilabas = Boolean(p.silabas?.length);
  const pedacos = emSilabas ? p.silabas! : [...palavra];

  let corpo = texto('1. Leia a palavra inteira. É assim que ela aparece.', 48, 197, 24);
  corpo += moldura(p.contexto, palavra);

  corpo += texto(
    emSilabas
      ? `2. A palavra em ${pedacos.length} ${pedacos.length === 1 ? 'parte' : 'partes'}. Fale ou bata na mesa a cada parte.`
      : '2. A palavra letra por letra. Diga o nome ou o som de cada uma.',
    48, 527, 22,
  );
  corpo += partes(pedacos, 548);

  // alvo duas vezes entre quatro parecidas, em lugares fixos (nada de sorte)
  const outras = parecidasDe(p);
  const seis = [outras[0], palavra, outras[1], outras[2], outras[3], palavra];
  corpo += texto(`3. Encontre ${palavra}. Circule ou destaque.`, 48, 718, 22);
  seis.forEach((s, i) => {
    const x = 48 + (i % 3) * 240;
    const y = 738 + Math.floor(i / 3) * 76;
    corpo += quadro(`regiao-busca-${i + 1}`, x, y, 224, 62, 10);
    corpo += textoQueCabe(s, x + 112, y + 31, 196, 30);
  });

  corpo += texto('4. Escreva a palavra.', 48, 928, 22);
  // modelo em traço cheio, na mesma letra das placas: contorno vazado miúdo
  // embola as letras e atrapalha a cópia
  const modelo = Math.floor(Math.min(46, (236 / largura(palavra, 100)) * 100));
  corpo += texto(palavra, 48, 994, modelo);
  corpo += linha(306, 968, 752, 968) + linha(306, 1014, 752, 1014);

  const onde = p.onde ? `5. Onde você vê essa palavra? ${p.onde}` : '5. Onde você vê essa palavra?';
  corpo += texto(onde, 48, 1052, largura(onde, 19) > 704 ? 16 : 19);

  return folha(palavra, 'Palavras do dia a dia', corpo);
}

// ---------------------------------------------------------------------------
// Folha de consulta: as palavras de um grupo, juntas
// ---------------------------------------------------------------------------

export function svgCatalogoA4(grupo: GrupoDePalavras): string {
  const n = grupo.palavras.length;
  const linhasDaGrade = Math.ceil(n / 2);
  const passo = Math.min(205, 830 / linhasDaGrade);
  let corpo = texto('Leia, aponte ou destaque as que você já reconhece.', 48, 154, 21);
  grupo.palavras.forEach((p, i) => {
    const x = 48 + (i % 2) * 360;
    const y = 182 + Math.floor(i / 2) * passo;
    corpo += quadro(`regiao-quadro-${i + 1}`, x, y, 344, passo - 16, 12);
    corpo += textoQueCabe(p.palavra, x + 172, y + (passo - 16) / 2, 300, Math.min(58, passo * 0.4));
  });
  corpo += texto('Qual delas você viu hoje?', 48, 1042, 19);
  return folha(grupo.titulo, 'Palavras do dia a dia · consulta', corpo, false);
}

// ---------------------------------------------------------------------------
// Preencher uma ficha (nome, data, assinatura)
// ---------------------------------------------------------------------------

export function svgFormularioA4(): string {
  let corpo = linhasTexto(
    'Toda ficha pede quase as mesmas coisas. Encontre cada palavra e preencha com os seus dados. Vale copiar de um documento seu.',
    48, 190, 704, 20, 29,
  );
  corpo += quadro('regiao-ficha', 48, 262, 704, 590, 8);
  corpo += texto('FICHA DE CADASTRO', 400, 312, 24, 'middle') + linha(84, 330, 716, 330);
  const campos: [string, number][] = [
    ['NOME:', 400],
    ['DATA DE NASCIMENTO:', 478],
    ['ENDEREÇO:', 556],
    ['TELEFONE:', 634],
  ];
  for (const [rotulo, y] of campos) {
    corpo += textoComAlgarismos(rotulo, 84, y, 21) + linha(84 + largura(rotulo, 21) + 14, y + 3, 716, y + 3);
  }
  corpo += linha(84, 598, 716, 598);
  corpo += textoComAlgarismos('DATA:', 84, 726, 21) + linha(158, 729, 360, 729);
  corpo += linha(400, 790, 716, 790) + texto('ASSINATURA', 558, 818, 17, 'middle');
  corpo += texto('Assinatura é o seu nome escrito do seu jeito. Treine a sua:', 48, 908, 20);
  corpo += linha(48, 962, 752, 962) + linha(48, 1020, 752, 1020);
  return folha('Preencher uma ficha', 'Documentos', corpo, false);
}

// ---------------------------------------------------------------------------
// Dinheiro
// ---------------------------------------------------------------------------

function nota(id: string, valor: number, x: number, y: number, w = 160, h = 76): string {
  return (
    quadro(`regiao-${id}`, x, y, w, h, 6) +
    risco(`M${x + 10} ${y + 10} H${x + w - 10} V${y + h - 10} H${x + 10} Z`, 1.5) +
    textoComAlgarismos(String(valor), x + w / 2, y + h / 2 + 16, 44, 'middle') +
    texto('R$', x + 18, y + 30, 14)
  );
}
function moeda(id: string, rotulo: string, cx: number, cy: number, r = 36): string {
  return (
    regiao(`regiao-${id}`, `<circle cx="${cx}" cy="${cy}" r="${r}"/>`) +
    textoComAlgarismos(rotulo, cx, cy + 11, 30, 'middle')
  );
}

export function svgDinheiroA4(): string {
  let corpo = texto('1. As notas. Destaque as que você já usou.', 48, 197, 23);
  [2, 5, 10, 20].forEach((v, i) => (corpo += nota(`nota-${v}`, v, 48 + i * 181, 216)));
  [50, 100, 200].forEach((v, i) => (corpo += nota(`nota-${v}`, v, 138 + i * 181, 306)));

  corpo += texto('2. As moedas. Abaixo de 1 real, são centavos.', 48, 438, 23);
  const moedas: [string, string, string][] = [
    ['moeda-5', '5', '5 centavos'],
    ['moeda-10', '10', '10 centavos'],
    ['moeda-25', '25', '25 centavos'],
    ['moeda-50', '50', '50 centavos'],
    ['moeda-1', '1', '1 real'],
  ];
  moedas.forEach(([id, rotulo, nome], i) => {
    const cx = 108 + i * 146;
    corpo += moeda(id, rotulo, cx, 498) + textoComAlgarismos(nome, cx, 560, 15, 'middle');
  });

  corpo += texto('3. Quanto tem aqui? Some e escreva.', 48, 622, 23);
  corpo += nota('soma1-nota-10', 10, 48, 644, 132, 66) + nota('soma1-nota-5', 5, 196, 644, 132, 66);
  corpo += moeda('soma1-moeda-1', '1', 380, 677, 31);
  corpo += texto('R$', 470, 690, 26) + quadro('regiao-resposta-1', 516, 644, 236, 66, 10);
  corpo += nota('soma2-nota-20', 20, 48, 730, 132, 66) + nota('soma2-nota-2', 2, 196, 730, 132, 66);
  corpo += nota('soma2-nota-2-outra', 2, 344, 730, 132, 66);
  corpo += texto('R$', 492, 776, 26) + quadro('regiao-resposta-2', 538, 730, 214, 66, 10);

  corpo += texto('4. A passagem de ônibus.', 48, 858, 23);
  corpo += texto('Hoje a passagem custa R$', 48, 908, 21) + linha(300, 911, 440, 911);
  corpo += texto('Quais notas e moedas você usaria? Desenhe, escreva ou mostre.', 48, 952, 19);
  corpo += quadro('regiao-passagem', 48, 972, 704, 76, 10);
  return folha('Dinheiro: notas e moedas', 'Números do dia a dia', corpo);
}

// ---------------------------------------------------------------------------
// Hora e horário de ônibus
// ---------------------------------------------------------------------------

/** mostrador digital: quatro algarismos para destacar e os dois pontos */
function mostrador(id: string, hora: string, x: number, y: number, w = 212, h = 92): string {
  const [hh, mm] = hora.split(':');
  const meio = x + w / 2;
  return (
    quadro(`regiao-${id}-fundo`, x, y, w, h, 12) +
    letras(`regiao-${id}-hora`, hh, x + 16, y + 20, w / 2 - 34, h - 40) +
    letras(`regiao-${id}-minuto`, mm, meio + 18, y + 20, w / 2 - 34, h - 40) +
    `<circle cx="${meio}" cy="${y + h / 2 - 13}" r="5" fill="${TINTA}" pointer-events="none"/>` +
    `<circle cx="${meio}" cy="${y + h / 2 + 13}" r="5" fill="${TINTA}" pointer-events="none"/>`
  );
}

export const HORARIOS_DE_EXEMPLO = ['06:40', '07:10', '07:40', '08:10', '08:40', '09:10', '09:40', '10:10'];

export function svgHoraA4(): string {
  let corpo = texto('1. A hora no celular e no relógio digital. Leia cada uma.', 48, 197, 22);
  const horas: [string, string][] = [
    ['07:00', 'sete horas da manhã'],
    ['12:30', 'meio-dia e meia'],
    ['19:15', 'sete e quinze da noite'],
  ];
  horas.forEach(([h, nome], i) => {
    const x = 48 + i * 246;
    corpo += mostrador(`relogio-${i + 1}`, h, x, 218) + texto(nome, x + 106, 340, 17, 'middle');
  });
  corpo += texto('Antes dos dois pontos: a hora. Depois: os minutos.', 48, 384, 19);

  corpo += texto('2. A tabela de horários. Cada quadro é um ônibus saindo.', 48, 446, 22);
  corpo += quadro('regiao-tabela-titulo', 48, 466, 704, 58, 8);
  corpo += textoComAlgarismos('LINHA 10', 72, 504, 24) + texto('CENTRO', 728, 504, 24, 'end');
  HORARIOS_DE_EXEMPLO.forEach((h, i) => {
    const x = 48 + (i % 4) * 176;
    const y = 536 + Math.floor(i / 4) * 78;
    corpo += quadro(`regiao-horario-${i + 1}`, x, y, 176, 78, 0);
    corpo += textoComAlgarismos(h, x + 88, y + 51, 34, 'middle');
  });
  corpo += textoComAlgarismos('Destaque o primeiro ônibus depois das 07:00.', 48, 730, 20);
  corpo += textoComAlgarismos('Você chegou na parada às 08:20. Qual é o próximo? Circule.', 48, 764, 20);

  corpo += texto('3. Os seus horários. Escreva ou peça para alguém anotar.', 48, 834, 22);
  const rotina = ['Eu acordo às', 'A aula começa às', 'O meu ônibus passa às'];
  rotina.forEach((frase, i) => {
    const y = 892 + i * 58;
    corpo += texto(frase, 48, y, 21);
    corpo += quadro(`regiao-rotina-${i + 1}`, 330, y - 34, 150, 46, 8);
    corpo += `<circle cx="405" cy="${y - 18}" r="3.5" fill="${TINTA}" pointer-events="none"/><circle cx="405" cy="${y - 4}" r="3.5" fill="${TINTA}" pointer-events="none"/>`;
  });
  return folha('Hora e horário de ônibus', 'Números do dia a dia', corpo);
}

// ---------------------------------------------------------------------------
// Banheiro: masculino e feminino
// ---------------------------------------------------------------------------
// Motivo: o texto "O meu irmão" (Lewis, 1997, trad. APAE Bauru) — o rapaz
// diz o nome das letras num cartão, mas não distingue a placa de banheiro de
// homem e de mulher no McDonald's. A folha ensina a PISTA (o desenho do corpo)
// e as variações reais da placa, sem depender de cor.

// Silhuetas numa caixa de 100 x 200 (cabeça à parte). Polígonos simples,
// escalados aqui mesmo para o traço não engrossar.
const CORPO_MASCULINO: [number, number][] = [
  [22, 44], [78, 44], [86, 52], [86, 112], [76, 112], [76, 68], [72, 68], [72, 196],
  [54, 196], [54, 128], [46, 128], [46, 196], [28, 196], [28, 68], [24, 68], [24, 112],
  [14, 112], [14, 52],
];
const CORPO_FEMININO: [number, number][] = [
  [30, 44], [70, 44], [79, 52], [88, 110], [78, 110], [71, 76], [90, 142], [64, 142],
  [64, 196], [54, 196], [54, 142], [46, 142], [46, 196], [36, 196], [36, 142], [10, 142],
  [29, 76], [22, 110], [12, 110], [21, 52],
];

export type Corpo = 'masculino' | 'feminino';

/** figura de placa: cabeça e corpo são regiões separadas. Traço mais fino
 *  nas figuras pequenas, senão o vão entre as pernas some. */
export function figura(id: string, corpo: Corpo, cx: number, topo: number, altura: number): string {
  const f = altura / 200;
  const x0 = cx - 50 * f;
  const traco = altura < 90 ? 1.4 : 3;
  const pontos = (corpo === 'masculino' ? CORPO_MASCULINO : CORPO_FEMININO)
    .map(([x, y]) => `${(x0 + x * f).toFixed(1)} ${(topo + y * f).toFixed(1)}`)
    .join(' L');
  return (
    regiao(`${id}-cabeca`, `<circle cx="${cx}" cy="${(topo + 20 * f).toFixed(1)}" r="${(16 * f).toFixed(1)}" stroke-width="${traco}"/>`) +
    regiao(`${id}-corpo`, `<path d="M${pontos} Z" stroke-linejoin="round" stroke-width="${traco}"/>`)
  );
}

/** ♂ e ♀ desenhados (não há glifo deles na letra das legendas) */
function simboloSexo(id: string, corpo: Corpo, cx: number, cy: number, r: number): string {
  if (corpo === 'masculino') {
    const ox = cx - r * 0.25;
    const oy = cy + r * 0.25;
    const a = r * 0.72; // até a borda, na diagonal
    const ponta = r * 1.55;
    return (
      regiao(id, `<circle cx="${ox}" cy="${oy}" r="${r * 0.72}"/>`) +
      risco(
        `M${ox + a * 0.7} ${oy - a * 0.7} L${ox + ponta} ${oy - ponta} M${ox + ponta - r * 0.62} ${oy - ponta} H${ox + ponta} V${oy - ponta + r * 0.62}`,
        5,
      )
    );
  }
  const oy = cy - r * 0.35;
  return (
    regiao(id, `<circle cx="${cx}" cy="${oy}" r="${r * 0.72}"/>`) +
    risco(`M${cx} ${oy + r * 0.72} V${oy + r * 1.75} M${cx - r * 0.45} ${oy + r * 1.28} H${cx + r * 0.45}`, 5)
  );
}

type Variante = { id: string; corpo: Corpo; palavra?: string; simbolo?: boolean };

const VARIANTES_MASCULINO: Variante[] = [
  { id: 'homens', corpo: 'masculino', palavra: 'HOMENS' },
  { id: 'senhores', corpo: 'masculino', palavra: 'SENHORES' },
  { id: 'letra-h', corpo: 'masculino', palavra: 'H' },
  { id: 'simbolo', corpo: 'masculino', simbolo: true },
];
const VARIANTES_FEMININO: Variante[] = [
  { id: 'mulheres', corpo: 'feminino', palavra: 'MULHERES' },
  { id: 'senhoras', corpo: 'feminino', palavra: 'SENHORAS' },
  { id: 'letra-f', corpo: 'feminino', palavra: 'F' },
  { id: 'simbolo', corpo: 'feminino', simbolo: true },
];

function placaVariante(id: string, v: Variante, x: number, y: number, w: number, h: number): string {
  let s = quadro(id, x, y, w, h, 10);
  if (v.simbolo) s += simboloSexo(`${id}-simbolo`, v.corpo, x + w / 2, y + h / 2, h * 0.3);
  else s += textoQueCabe(v.palavra!, x + w / 2, y + h / 2, w - 24, v.palavra!.length === 1 ? 44 : 28);
  return s;
}

export function svgBanheiroA4(): string {
  let corpo = texto('1. Os dois desenhos mais comuns. A diferença está no corpo.', 48, 197, 21);

  const paineis: [Corpo, string, string, number][] = [
    ['masculino', 'MASCULINO', 'calça: duas pernas separadas', 48],
    ['feminino', 'FEMININO', 'vestido: um triângulo', 416],
  ];
  for (const [c, palavra, pista, x] of paineis) {
    corpo += quadro(`regiao-placa-${c}`, x, 214, 336, 230, 16);
    corpo += figura(`regiao-figura-${c}`, c, x + 168, 226, 150);
    corpo += textoQueCabe(palavra, x + 168, 408, 290, 40);
    corpo += texto(pista, x + 168, 470, 17, 'middle');
  }

  corpo += texto('2. A mesma porta, escrita de outros jeitos.', 48, 518, 21);
  const linhaDeVariantes = (lista: Variante[], c: Corpo, y: number) => {
    let s = figura(`regiao-guia-${c}`, c, 80, y + 2, 60);
    lista.forEach((v, i) => (s += placaVariante(`regiao-variante-${c}-${v.id}`, v, 124 + i * 158, y, 146, 64)));
    return s;
  };
  corpo += linhaDeVariantes(VARIANTES_MASCULINO, 'masculino', 536);
  corpo += linhaDeVariantes(VARIANTES_FEMININO, 'feminino', 612);

  corpo += texto('Cuidado com a letra M: pode ser MASCULINO ou MULHERES. Na dúvida,', 48, 712, 18);
  corpo += texto('olhe o desenho ou pergunte. A cor muda de lugar para lugar: não decida só pela cor.', 48, 738, 18);

  corpo += texto('3. Qual é a porta? Marque o desenho certo embaixo de cada placa.', 48, 788, 21);
  const exercicio: Variante[] = [
    { id: 'mulheres', corpo: 'feminino', palavra: 'MULHERES' },
    { id: 'simbolo-m', corpo: 'masculino', simbolo: true },
    { id: 'homens', corpo: 'masculino', palavra: 'HOMENS' },
    { id: 'feminino', corpo: 'feminino', palavra: 'FEMININO' },
    { id: 'letra-h', corpo: 'masculino', palavra: 'H' },
    { id: 'simbolo-f', corpo: 'feminino', simbolo: true },
    { id: 'masculino', corpo: 'masculino', palavra: 'MASCULINO' },
    { id: 'senhoras', corpo: 'feminino', palavra: 'SENHORAS' },
  ];
  exercicio.forEach((v, i) => {
    const x = 48 + (i % 4) * 180;
    const y = 806 + Math.floor(i / 4) * 120;
    corpo += placaVariante(`regiao-exercicio-${i + 1}`, v, x, y, 164, 46);
    corpo += quadro(`regiao-exercicio-${i + 1}-opcao-masculino`, x + 10, y + 52, 68, 58, 8);
    corpo += figura(`regiao-exercicio-${i + 1}-mini-masculino`, 'masculino', x + 44, y + 57, 48);
    corpo += quadro(`regiao-exercicio-${i + 1}-opcao-feminino`, x + 86, y + 52, 68, 58, 8);
    corpo += figura(`regiao-exercicio-${i + 1}-mini-feminino`, 'feminino', x + 120, y + 57, 48);
  });
  return folha('Banheiro: masculino e feminino', 'Lugares', corpo);
}
