// Preferências por perfil: tema decorativo e tamanho de fonte.
// Mesmo mecanismo do Pedra Angular: variáveis CSS trocadas por [data-theme].

import { armazenamento } from '../armazenamento/armazenamento';
import { perfilAtivo } from '../perfis/perfis';

export const TEMAS = [
  { id: 'arco-iris', rotulo: '🌈' },
  { id: 'espaco', rotulo: '🚀' },
  { id: 'floresta', rotulo: '🌳' },
] as const;

const TAMANHO_MIN = 16;
const TAMANHO_MAX = 30;
const TAMANHO_PADRAO = 20;

export async function carregarPreferencias(): Promise<void> {
  const p = perfilAtivo();
  const tema = (await armazenamento.obter<string>(`${p.id}:tema`)) ?? 'arco-iris';
  const tamanho = (await armazenamento.obter<number>(`${p.id}:tamanhoFonte`)) ?? TAMANHO_PADRAO;
  aplicarTema(tema);
  aplicarTamanho(tamanho);
}

export function aplicarTema(tema: string): void {
  document.documentElement.dataset.theme = tema;
}

export function aplicarTamanho(px: number): void {
  document.documentElement.style.setProperty('--tamanho-base', `${px}px`);
}

export async function trocarTema(tema: string): Promise<void> {
  aplicarTema(tema);
  await armazenamento.definir(`${perfilAtivo().id}:tema`, tema);
}

export async function ajustarTamanho(delta: number): Promise<void> {
  const atual = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--tamanho-base'),
    10,
  ) || TAMANHO_PADRAO;
  const novo = Math.min(TAMANHO_MAX, Math.max(TAMANHO_MIN, atual + delta));
  aplicarTamanho(novo);
  await armazenamento.definir(`${perfilAtivo().id}:tamanhoFonte`, novo);
}
