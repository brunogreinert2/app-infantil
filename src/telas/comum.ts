// Peças de UI compartilhadas entre telas.

import { perfilAtivo, temPerfilAtivo } from '../perfis/perfis';
import { alternarPainel, painelAberto, painelConfigurado } from './painelLateral';
import { ajustarTamanho, carregarTamanhoDoAparelho, PASSO_FONTE } from './preferencias';

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
  /**
   * 🎨 abre a tela de aparência. Sem isto, ela abre POR CIMA da tela atual
   * (e fecha voltando a ela); `false` tira o 🎨 (a própria tela de aparência).
   */
  aoAparencia?: (() => void) | false;
}

/** A aparência por cima da tela atual: as mudanças valem na hora, por baixo. */
function abrirAparenciaPorCima(): void {
  const camada = el('div');
  document.body.appendChild(camada);
  const fechar = () => {
    camada.remove();
    document.removeEventListener('keydown', aoTeclar, true);
  };
  const aoTeclar = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      fechar();
    }
  };
  document.addEventListener('keydown', aoTeclar, true);
  void import('./telaAparencia').then(async (m) => {
    const montando = m.montarTelaAparencia(camada, { voltar: fechar });
    camada.classList.add('sobreposicao-tela');
    camada.setAttribute('role', 'dialog');
    camada.setAttribute('aria-modal', 'true');
    camada.setAttribute('aria-label', 'Aparência');
    await montando;
    camada.querySelector<HTMLElement>('button')?.focus();
  });
}

// A MESMA BARRA EM TODA TELA (pedido do Bruno, 2026-11-20, com capturas):
// ← · menu (o avatar, quando há perfil) · título · A− A+ · 🎨. Antes cada tela
// montava a sua, e a oficina, os ajustes, a trava e a pintura ficavam só com
// ← e o título. Fixa no alto e do mesmo tamanho sempre (não engrossa com A+).
export function barraTopo(op: OpcoesBarra): HTMLElement {
  const barra = el('header', 'barra-topo');

  if (op.aoVoltar) {
    const voltar = el('button', 'botao-icone', '←');
    voltar.setAttribute('aria-label', 'Voltar');
    voltar.addEventListener('click', op.aoVoltar);
    barra.appendChild(voltar);
  }

  if (temPerfilAtivo()) barra.appendChild(chipDoPerfil(op));
  else void carregarTamanhoDoAparelho(); // área dos adultos: a letra do aparelho
  barra.appendChild(el('h1', 'titulo-barra', op.titulo));

  const ajustes = el('div', 'ajustes');
  const menor = el('button', 'botao-icone', 'A−');
  menor.setAttribute('aria-label', 'A−: diminuir a letra');
  menor.addEventListener('click', () => ajustarTamanho(1 / PASSO_FONTE));
  const maior = el('button', 'botao-icone', 'A+');
  maior.setAttribute('aria-label', 'A+: aumentar a letra');
  maior.addEventListener('click', () => ajustarTamanho(PASSO_FONTE));
  ajustes.append(menor, maior);
  // o 🎨: a tela de aparência é do perfil (temas e letra de cada criança)
  const abrir = op.aoAparencia === false ? undefined : (op.aoAparencia ?? (temPerfilAtivo() ? abrirAparenciaPorCima : undefined));
  if (abrir) {
    const aparencia = el('button', 'botao-icone', '🎨');
    aparencia.setAttribute('aria-label', 'Mudar aparência');
    aparencia.addEventListener('click', abrir);
    ajustes.appendChild(aparencia);
  }
  barra.appendChild(ajustes);
  return barra;
}

function chipDoPerfil(op: OpcoesBarra): HTMLElement {
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
  return chip;
}
