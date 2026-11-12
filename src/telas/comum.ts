// Peças de UI compartilhadas entre telas.

import { perfilAtivo } from '../perfis/perfis';
import { alternarPainel, painelAberto, painelConfigurado } from './painelLateral';
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
  // O avatar abre o painel lateral (pastas, anotações, trocar de perfil).
  // Antes ele ia direto para a troca de perfil; ela continua a dois toques,
  // sem trava. A barra não ganhou botão novo: não engrossa.
  chip.setAttribute('aria-label', `Abrir o menu de ${p.nome}`);
  chip.setAttribute('aria-haspopup', 'dialog');
  chip.setAttribute('aria-controls', 'painel-lateral');
  chip.setAttribute('aria-expanded', String(painelAberto()));
  chip.title = `${p.nome} — tocar para abrir o menu`;
  chip.addEventListener('click', () => {
    if (painelConfigurado()) alternarPainel(chip);
    else op.aoTrocarPerfil();
  });
  barra.appendChild(chip);

  barra.appendChild(el('h1', 'titulo-barra', op.titulo));

  if (op.aoAparencia) {
    const ajustes = el('div', 'ajustes');
    const menor = el('button', 'botao-icone', 'A−');
    menor.setAttribute('aria-label', 'A−: diminuir a letra');
    menor.addEventListener('click', () => ajustarTamanho(1 / PASSO_FONTE));
    const maior = el('button', 'botao-icone', 'A+');
    maior.setAttribute('aria-label', 'A+: aumentar a letra');
    maior.addEventListener('click', () => ajustarTamanho(PASSO_FONTE));
    const aparencia = el('button', 'botao-icone', '🎨');
    aparencia.setAttribute('aria-label', 'Mudar aparência');
    aparencia.addEventListener('click', op.aoAparencia);
    ajustes.append(menor, maior, aparencia);
    barra.appendChild(ajustes);
  }

  return barra;
}
