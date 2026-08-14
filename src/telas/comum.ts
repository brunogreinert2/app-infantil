// Peças de UI compartilhadas entre telas.

import { perfilAtivo } from '../perfis/perfis';
import { ajustarTamanho, PASSO_FONTE } from './preferencias';

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
  aoAparencia?: () => void; // 🎨 abre a tela de aparência (temas/fontes)
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

  if (op.aoAparencia) {
    const ajustes = el('div', 'ajustes');
    const menor = el('button', 'botao-icone', 'A−');
    menor.setAttribute('aria-label', 'Diminuir letra');
    menor.addEventListener('click', () => ajustarTamanho(1 / PASSO_FONTE));
    const maior = el('button', 'botao-icone', 'A+');
    maior.setAttribute('aria-label', 'Aumentar letra');
    maior.addEventListener('click', () => ajustarTamanho(PASSO_FONTE));
    const aparencia = el('button', 'botao-icone', '🎨');
    aparencia.setAttribute('aria-label', 'Mudar aparência');
    aparencia.addEventListener('click', op.aoAparencia);
    ajustes.append(menor, maior, aparencia);
    barra.appendChild(ajustes);
  }

  return barra;
}
