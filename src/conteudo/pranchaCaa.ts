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
import { PICTOGRAMAS } from '../caa/pictogramas';

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

// Os desenhos moram em src/caa/pictogramas.ts (os mesmos da prancha da tela).
export { PICTOGRAMAS };

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
