// Tela de seleção de perfil — SEMPRE a primeira tela (spec 8.6).
// Puramente visual: avatar grande + nome, um toque só, sem trava parental.

import { listarConquistas } from '../conquistas/insignias';
import { listarPerfis, definirPerfilAtivo, type Perfil } from '../perfis/perfis';
import { el } from './comum';

export async function montarTelaPerfis(
  raiz: HTMLElement,
  aoEscolher: (p: Perfil) => void,
  aoAjustes: () => void,
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

    // insígnias conquistadas — orgulho visível já na porta de entrada
    const conquistas = await listarConquistas(p.id);
    if (conquistas.length > 0) {
      const linha = el('span', 'insignias-linha');
      linha.textContent = conquistas.map((c) => c.emoji).join(' ');
      linha.title = conquistas.map((c) => c.titulo).join(' · ');
      botao.appendChild(linha);
    }
    botao.addEventListener('click', () => {
      definirPerfilAtivo(p);
      aoEscolher(p);
    });
    grade.appendChild(botao);
  }
  raiz.appendChild(grade);

  // ajustes: discreto, no rodapé — e sempre atrás da trava parental
  const ajustes = el('button', 'botao-ajustes', '⚙️ Ajustes');
  ajustes.addEventListener('click', aoAjustes);
  raiz.appendChild(ajustes);
}
