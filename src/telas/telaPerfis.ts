// Tela de seleção de perfil — SEMPRE a primeira tela (spec 8.6).
// Puramente visual: avatar grande + nome, um toque só, sem trava parental.

import { listarConquistas } from '../conquistas/insignias';
import { criarPerfil, listarPerfis, definirPerfilAtivo, type Perfil } from '../perfis/perfis';
import { barraTopo, el } from './comum';
import { formularioPerfil } from './formularioPerfil';

export async function montarTelaPerfis(
  raiz: HTMLElement,
  aoEscolher: (p: Perfil) => void,
  aoAjustes: () => void,
  aoPrancha?: () => void,
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-perfis';
  // A BARRA DE SEMPRE JÁ NA PORTA DE ENTRADA (pedido do Bruno, 2026-11-20):
  // A− / A+ e 🎨 antes de escolher o perfil — aqui, a aparência do aparelho
  raiz.appendChild(barraTopo({ titulo: '🌈 Historinhas', aoTrocarPerfil: () => undefined }));

  const perfis = await listarPerfis();

  // Primeira visita: não há a quem perguntar "quem vai ler hoje?".
  if (perfis.length === 0) {
    montarBoasVindas(raiz, () => montarTelaPerfis(raiz, aoEscolher, aoAjustes, aoPrancha));
    if (aoPrancha) raiz.appendChild(botaoPrancha(aoPrancha));
    return;
  }

  // <h2>: o <h1> da tela agora é o da barra
  raiz.appendChild(el('h2', 'pergunta-perfil', 'Quem vai ler hoje?'));

  const grade = el('div', 'grade-perfis');
  for (const p of perfis) {
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

  // a prancha de comunicação: fora dos perfis e sem trava — é a voz de
  // alguém, não um brinquedo; tem de estar a um toque
  if (aoPrancha) raiz.appendChild(botaoPrancha(aoPrancha));

  // ajustes: discreto, no rodapé — e sempre atrás da trava parental
  const ajustes = el('button', 'botao-ajustes', '⚙️ Ajustes');
  ajustes.addEventListener('click', aoAjustes);
  raiz.appendChild(ajustes);
}

/**
 * Porta de entrada de quem nunca abriu o app.
 *
 * SEM trava parental, de propósito: aqui não há ainda nada para proteger, e a
 * trava — uma conta de multiplicação — trancaria a única porta de entrada. A
 * proteção existe para configurações e exclusão de dados (spec 8.5), não para
 * o primeiro passo.
 */
function montarBoasVindas(raiz: HTMLElement, aoCriar: () => void): void {
  raiz.appendChild(el('h2', 'pergunta-perfil', 'Olá! Vamos começar?'));
  raiz.appendChild(
    el(
      'p',
      'texto-boas-vindas',
      'Escolha um nome e um bichinho para o seu cantinho de leitura. ' +
        'Suas histórias, pinturas e insígnias ficam guardadas nele.',
    ),
  );

  const area = el('div', 'area-primeiro-perfil');
  raiz.appendChild(area);

  const abrir = () => {
    area.innerHTML = '';
    area.appendChild(
      formularioPerfil(
        null,
        async (nome, avatar, faixa) => {
          await criarPerfil(nome, avatar, faixa);
          aoCriar();
        },
        () => {
          area.innerHTML = '';
          area.appendChild(botao());
        },
      ),
    );
  };

  const botao = () => {
    const b = el('button', 'botao-grande', '✨ Criar meu cantinho');
    b.addEventListener('click', abrir);
    return b;
  };
  area.appendChild(botao());

  /* O nome é digitado por uma criança num site aberto. Dizer onde ele fica é
     uma frase curta que responde à pergunta antes de ela ser feita — e é
     verdade literal: o app não tem rede em runtime (princípio 3). */
  raiz.appendChild(
    el(
      'p',
      'nota-privacidade',
      'O que você escrever fica só neste aparelho. O app não envia nada para a internet.',
    ),
  );
}

function botaoPrancha(aoPrancha: () => void): HTMLElement {
  const b = el('button', 'botao-prancha-caa', '💬 Prancha de comunicação');
  b.addEventListener('click', aoPrancha);
  return b;
}
