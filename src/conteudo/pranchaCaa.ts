// PRANCHA DE CAA (Comunicação Aumentativa e Alternativa) — piloto.
//
// Pedido da mesma professora de AEE (nov/2026): a escola não tem prancha.
// Uma prancha é uma grade de casas; cada casa tem um desenho e uma palavra.
// A pessoa aponta para dizer. No papel, quem conversa lê em voz alta; no app
// (a fazer), tocar na casa fala a palavra — o campo `fala` já está aqui.
//
// Os desenhos são NOSSOS, geométricos, de propósito simples. O padrão de fato
// nas escolas é o ARASAAC (CC BY-NC-SA): ver a decisão em aberto em
// docs/LER_O_MUNDO.md antes de trocar.
//
// Nada de cor obrigatória: a folha é preta e branca. Quem quiser marcar as
// categorias com cor destaca a casa inteira (cada casa é uma região).

import { base, linha, quadro, texto, largura, type Identidade } from './alfabetoArte';
import type { FichaAlfabeto } from './alfabetos';
import { IDENTIDADE_LER_O_MUNDO } from './lerOMundoArte';

export type CategoriaCaa = 'pessoa' | 'resposta' | 'acao' | 'necessidade' | 'estado' | 'pergunta';

export interface CasaCaa {
  id: string;
  /** o que está escrito na casa */
  rotulo: string;
  /** o que a voz diz ao tocar (app) */
  fala: string;
  categoria: CategoriaCaa;
  /** chave em PICTOGRAMAS; ausente = casa só com a palavra */
  pictograma?: string;
}

export interface Prancha {
  id: string;
  titulo: string;
  colunas: number;
  casas: CasaCaa[];
}

// Vocabulário essencial: poucas palavras que servem em quase toda situação e
// se combinam (EU + QUERO + MAIS; NÃO + QUERO; VOCÊ + AJUDA).
export const PRANCHA_ESSENCIAL: Prancha = {
  id: 'essencial',
  titulo: 'Prancha de comunicação',
  colunas: 4,
  casas: [
    { id: 'eu', rotulo: 'EU', fala: 'eu', categoria: 'pessoa', pictograma: 'eu' },
    { id: 'voce', rotulo: 'VOCÊ', fala: 'você', categoria: 'pessoa', pictograma: 'voce' },
    { id: 'sim', rotulo: 'SIM', fala: 'sim', categoria: 'resposta', pictograma: 'sim' },
    { id: 'nao', rotulo: 'NÃO', fala: 'não', categoria: 'resposta', pictograma: 'nao' },
    { id: 'quero', rotulo: 'QUERO', fala: 'quero', categoria: 'acao', pictograma: 'quero' },
    { id: 'gosto', rotulo: 'GOSTO', fala: 'gosto', categoria: 'acao', pictograma: 'gosto' },
    { id: 'mais', rotulo: 'MAIS', fala: 'mais', categoria: 'acao', pictograma: 'mais' },
    { id: 'acabou', rotulo: 'ACABOU', fala: 'acabou', categoria: 'acao', pictograma: 'acabou' },
    { id: 'ajuda', rotulo: 'AJUDA', fala: 'ajuda', categoria: 'acao', pictograma: 'ajuda' },
    { id: 'espera', rotulo: 'ESPERA', fala: 'espera', categoria: 'acao', pictograma: 'espera' },
    { id: 'parar', rotulo: 'PARAR', fala: 'parar', categoria: 'acao', pictograma: 'parar' },
    { id: 'ir', rotulo: 'IR', fala: 'ir', categoria: 'acao', pictograma: 'ir' },
    { id: 'banheiro', rotulo: 'BANHEIRO', fala: 'banheiro', categoria: 'necessidade', pictograma: 'banheiro' },
    { id: 'agua', rotulo: 'ÁGUA', fala: 'água', categoria: 'necessidade', pictograma: 'agua' },
    { id: 'comer', rotulo: 'COMER', fala: 'comer', categoria: 'necessidade', pictograma: 'comer' },
    { id: 'descansar', rotulo: 'DESCANSAR', fala: 'descansar', categoria: 'necessidade', pictograma: 'descansar' },
    { id: 'dor', rotulo: 'DOR', fala: 'estou com dor', categoria: 'estado', pictograma: 'dor' },
    { id: 'bem', rotulo: 'BEM', fala: 'estou bem', categoria: 'estado', pictograma: 'bem' },
    { id: 'mal', rotulo: 'MAL', fala: 'não estou bem', categoria: 'estado', pictograma: 'mal' },
    { id: 'o-que', rotulo: 'O QUÊ?', fala: 'o quê?', categoria: 'pergunta', pictograma: 'pergunta' },
  ],
};

/** Vinte casas vazias: a professora desenha, cola figura ou escreve. */
export const PRANCHA_EM_BRANCO: Prancha = {
  id: 'em-branco',
  titulo: 'Prancha para montar',
  colunas: 4,
  casas: Array.from({ length: 20 }, (_, i) => ({
    id: `casa-${i + 1}`,
    rotulo: '',
    fala: '',
    categoria: 'acao' as CategoriaCaa,
  })),
};

// Pictogramas numa caixa de 100 x 100. Traço preto, fundo vazado.
const busto = (cx: number) =>
  `<circle cx="${cx}" cy="30" r="16"/><path d="M${cx - 32} 90 Q${cx - 32} 56 ${cx} 56 Q${cx + 32} 56 ${cx + 32} 90 Z"/>`;
const rosto = (boca: string) =>
  `<circle cx="50" cy="50" r="40"/><circle cx="36" cy="40" r="4" fill="#000000"/><circle cx="64" cy="40" r="4" fill="#000000"/><path d="${boca}"/>`;
const grosso = (d: string, n = 10) => `<path d="${d}" stroke-width="${n}"/>`;

export const PICTOGRAMAS: Record<string, string> = {
  eu: busto(42) + grosso('M98 74 H72 M82 64 L72 74 L82 84', 6),
  voce: busto(66) + grosso('M2 60 H28 M18 50 L28 60 L18 70', 6),
  sim: grosso('M16 54 L40 78 L86 22', 12),
  nao: grosso('M22 22 L78 78 M78 22 L22 78', 12),
  quero: '<circle cx="50" cy="30" r="15"/>' + grosso('M12 58 Q50 104 88 58', 8) + grosso('M50 50 V66 M43 60 L50 67 L57 60', 4),
  gosto: '<path d="M50 86 C8 56 12 18 35 18 C46 18 50 28 50 34 C50 28 54 18 65 18 C88 18 92 56 50 86 Z"/>',
  mais: grosso('M50 16 V84 M16 50 H84', 13),
  acabou:
    grosso('M24 10 V92', 6) +
    '<path d="M24 14 H82 V54 H24 Z"/><path d="M24 14 H53 V34 H24 Z M53 34 H82 V54 H53 Z" fill="#000000"/>',
  ajuda:
    '<circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="17"/>' +
    '<path d="M22 22 L38 38 M78 22 L62 38 M22 78 L38 62 M78 78 L62 62"/>',
  espera: '<circle cx="50" cy="50" r="40"/>' + grosso('M50 50 V24 M50 50 L68 62', 6),
  parar: `<path d="M${Array.from({ length: 8 }, (_, i) => {
    const a = ((22.5 + i * 45) * Math.PI) / 180;
    return `${(50 + 43 * Math.cos(a)).toFixed(1)} ${(50 + 43 * Math.sin(a)).toFixed(1)}`;
  }).join(' L')} Z"/>` + grosso('M28 50 H72', 10),
  ir: grosso('M12 50 H86 M62 26 L86 50 L62 74', 11),
  banheiro: '<path d="M20 12 H44 V54 H20 Z"/><path d="M44 46 H88 Q88 76 60 78 H44 Z"/><path d="M50 78 V92 H74 V77"/>',
  agua: '<path d="M26 14 H74 L66 90 H34 Z"/><path d="M29 42 H71"/>',
  comer:
    '<circle cx="60" cy="54" r="30"/><circle cx="60" cy="54" r="17"/>' +
    grosso('M16 14 V90 M8 14 V32 Q8 42 16 42 Q24 42 24 32 V14', 5),
  descansar: grosso('M8 34 V88 M8 68 H92 V88', 7) + '<path d="M40 68 V52 H78 Q92 52 92 68"/><circle cx="25" cy="55" r="10"/>',
  dor:
    '<g transform="rotate(-35 50 50)"><rect x="6" y="34" width="88" height="32" rx="16"/><rect x="36" y="34" width="28" height="32"/>' +
    '<circle cx="20" cy="50" r="2.5" fill="#000000"/><circle cx="80" cy="50" r="2.5" fill="#000000"/></g>',
  bem: rosto('M30 58 Q50 80 70 58'),
  mal: rosto('M30 72 Q50 54 70 72'),
};

export function svgPranchaA4(prancha: Prancha, identidade: Identidade = IDENTIDADE_LER_O_MUNDO): string {
  const { colunas, casas } = prancha;
  const fileiras = Math.ceil(casas.length / colunas);
  const folga = 10;
  const w = (704 - (colunas - 1) * folga) / colunas;
  const h = Math.min(w + 12, (866 - (fileiras - 1) * folga) / fileiras);
  const vazia = casas.every((c) => !c.rotulo);
  let corpo = texto(
    vazia
      ? 'Desenhe, cole uma figura ou escreva uma palavra em cada casa.'
      : 'Aponte para dizer. Quem conversa com você lê a palavra em voz alta.',
    48, 154, 20,
  );
  casas.forEach((casa, i) => {
    const x = 48 + (i % colunas) * (w + folga);
    const y = 176 + Math.floor(i / colunas) * (h + folga);
    corpo += quadro(`regiao-casa-${casa.id}`, x, y, w, h, 12);
    const cx = x + w / 2;
    if (!casa.rotulo) {
      corpo += linha(x + 18, y + h - 26, x + w - 18, y + h - 26);
      return;
    }
    const tamanho = Math.floor(Math.min(24, ((w - 20) / largura(casa.rotulo, 100)) * 100));
    const lado = Math.min(w - 44, h - 62);
    if (casa.pictograma === 'pergunta') {
      corpo += texto('?', cx, y + 14 + lado * 0.9, Math.floor(lado * 1.05), 'middle');
    } else if (casa.pictograma) {
      const desenho = PICTOGRAMAS[casa.pictograma];
      if (!desenho) throw new Error(`Falta pictograma: ${casa.pictograma}`);
      corpo += `<g transform="translate(${(cx - lado / 2).toFixed(1)} ${(y + 14).toFixed(1)}) scale(${(lado / 100).toFixed(4)})" fill="none" stroke="#000000" stroke-width="4" pointer-events="none">${desenho}</g>`;
    }
    corpo += texto(casa.rotulo, cx, y + h - 16, tamanho, 'middle');
  });
  return base(prancha.titulo, 'Comunicação alternativa', corpo, false, identidade);
}

export const ID_CADERNO_COMUNICACAO = 'comunicacao';

export function gerarCadernoComunicacao(): FichaAlfabeto[] {
  return [PRANCHA_ESSENCIAL, PRANCHA_EM_BRANCO].map((prancha) => ({
    id: `prancha-${prancha.id}`,
    arquivo: `${ID_CADERNO_COMUNICACAO}_prancha-${prancha.id}.svg`,
    titulo: prancha.titulo,
    svg: svgPranchaA4(prancha),
    grupo: 'Pranchas',
  }));
}
