// Peças de UI compartilhadas entre telas.

import { perfilAtivo } from '../perfis/perfis';
import { TEMAS, trocarTema, ajustarTamanho } from './preferencias';

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  classe?: string,
  texto?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

export interface OpcoesBarra {
  titulo: string;
  aoVoltar?: () => void;
  aoTrocarPerfil: () => void; // avatar fixo → volta à seleção (spec 8.6)
  comAjustes?: boolean;
}

export function barraTopo(op: OpcoesBarra): HTMLElement {
  const barra = el('header', 'barra-topo');

  if (op.aoVoltar) {
    const voltar = el('button', 'botao-icone', '←');
    voltar.setAttribute('aria-label', 'Voltar');
    voltar.addEventListener('click', op.aoVoltar);
    barra.appendChild(voltar);
  }

  const p = perfilAtivo();
  const chip = el('button', 'chip-perfil', p.avatar);
  chip.setAttribute('aria-label', `Trocar de perfil (agora: ${p.nome})`);
  chip.title = `${p.nome} — tocar para trocar de perfil`;
  chip.addEventListener('click', op.aoTrocarPerfil);
  barra.appendChild(chip);

  barra.appendChild(el('h1', 'titulo-barra', op.titulo));

  if (op.comAjustes !== false) {
    const ajustes = el('div', 'ajustes');
    const menor = el('button', 'botao-icone', 'A−');
    menor.setAttribute('aria-label', 'Diminuir letra');
    menor.addEventListener('click', () => ajustarTamanho(-2));
    const maior = el('button', 'botao-icone', 'A+');
    maior.setAttribute('aria-label', 'Aumentar letra');
    maior.addEventListener('click', () => ajustarTamanho(2));
    ajustes.append(menor, maior);
    for (const t of TEMAS) {
      const b = el('button', 'botao-icone', t.rotulo);
      b.setAttribute('aria-label', `Tema ${t.id}`);
      b.addEventListener('click', () => trocarTema(t.id));
      ajustes.appendChild(b);
    }
    barra.appendChild(ajustes);
  }

  return barra;
}
