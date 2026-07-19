// Estante de livros. Mostra status de leitura por perfil
// (continuar de onde parou — posicao_atual, spec 8.4/8.6).

import { armazenamento } from '../armazenamento/armazenamento';
import { livros } from '../conteudo/catalogo';
import type { Livro } from '../motor/tipos';
import { perfilAtivo } from '../perfis/perfis';
import { barraTopo, el } from './comum';

const EMOJIS_CAPA: Record<string, string> = {
  'lebre-e-tartaruga': '🐢🐇',
};

export async function montarTelaEstante(
  raiz: HTMLElement,
  nav: { perfis: () => void; leitura: (livro: Livro) => void },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-estante';

  raiz.appendChild(
    barraTopo({ titulo: 'Estante', aoTrocarPerfil: nav.perfis }),
  );

  const p = perfilAtivo();
  const grade = el('div', 'grade-livros');

  for (const livro of livros) {
    const progresso = await armazenamento.obter<{ posicaoAtual?: string; status?: string }>(
      `${p.id}:progresso:${livro.id}`,
    );

    const cartao = el('button', 'cartao-livro');
    cartao.appendChild(el('span', 'capa-emoji', EMOJIS_CAPA[livro.id] ?? '📖'));
    cartao.appendChild(el('span', 'titulo-livro', livro.metadados.titulo));
    if (livro.metadados.autor_original) {
      cartao.appendChild(el('span', 'autor-livro', livro.metadados.autor_original));
    }
    const rotulo =
      progresso?.status === 'concluido' ? '⭐ Lido' : progresso ? '▶ Continuar' : '✨ Novo';
    cartao.appendChild(el('span', 'selo-status', rotulo));
    cartao.addEventListener('click', () => nav.leitura(livro));
    grade.appendChild(cartao);
  }

  raiz.appendChild(grade);
}
