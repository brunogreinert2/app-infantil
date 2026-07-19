// Tela de seleção de perfil — SEMPRE a primeira tela (spec 8.6).
// Puramente visual: avatar grande + nome, um toque só, sem trava parental.

import { listarPerfis, definirPerfilAtivo, type Perfil } from '../perfis/perfis';
import { el } from './comum';

export async function montarTelaPerfis(
  raiz: HTMLElement,
  aoEscolher: (p: Perfil) => void,
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-perfis';

  raiz.appendChild(el('h1', 'pergunta-perfil', 'Quem vai ler hoje?'));

  const grade = el('div', 'grade-perfis');
  for (const p of await listarPerfis()) {
    const botao = el('button', 'cartao-perfil');
    const avatar = el('span', 'avatar-grande', p.avatar);
    const nome = el('span', 'nome-perfil', p.nome);
    botao.append(avatar, nome);
    botao.addEventListener('click', () => {
      definirPerfilAtivo(p);
      aoEscolher(p);
    });
    grade.appendChild(botao);
  }
  raiz.appendChild(grade);
}
