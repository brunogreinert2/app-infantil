// AS ABAS DO ALTO DA ESTANTE, iguais em todas as telas que elas abrem
// (pedido do Bruno, 2026-11-22): Histórias, Alfabetos e Números abriam ali
// mesmo, com as abas à vista; Jogos, Pinturas e Anotações trocavam de tela e
// as abas sumiam. Agora as seis telas mostram a mesma fileira, com a aba de
// onde se está marcada — tocar em qualquer uma é sempre o mesmo gesto.

import { PASTAS } from '../conteudo/pastas';
import { el } from './comum';

export interface AbasDaEstante {
  pasta: (id: string) => void;
  /** 🎮 Jogos (só com a oficina ligada) */
  jogos?: () => void;
  /** 🧮 Calculadora (pedido do Bruno, 2026-11-25: também aqui no alto, não só no menu) */
  calculadora?: () => void;
  pinturas: () => void;
  anotacoes: () => void;
}

/** Qual aba está aberta: o id de uma pasta de fora, ou uma das de depois. */
export type AbaAtual = string | 'jogos' | 'calculadora' | 'pinturas' | 'anotacoes';

export function abasDaEstante(atual: AbaAtual, nav: AbasDaEstante): HTMLElement {
  const abas = el('nav', 'pastas-estante');
  abas.setAttribute('aria-label', 'Pastas da estante');
  const aba = (rotulo: string, ativa: boolean, aoTocar: () => void) => {
    const b = el('button', 'botao-opcao aba-pasta', rotulo);
    b.type = 'button';
    if (ativa) {
      b.classList.add('ativa');
      b.setAttribute('aria-current', 'page');
    }
    b.addEventListener('click', aoTocar);
    abas.appendChild(b);
  };
  for (const f of PASTAS) aba(`${f.emoji} ${f.rotulo}`, f.id === atual, () => nav.pasta(f.id));
  // pedido do Bruno (2026-11-19): os Jogos também aqui no alto, não só no menu
  if (nav.jogos) aba('🎮 Jogos', atual === 'jogos', nav.jogos);
  if (nav.calculadora) aba('🧮 Calculadora', atual === 'calculadora', nav.calculadora);
  aba('🖼️ Pinturas', atual === 'pinturas', nav.pinturas);
  aba('📝 Anotações', atual === 'anotacoes', nav.anotacoes);
  return abas;
}
