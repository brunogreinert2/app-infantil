// Estante de livros. Mostra status de leitura por perfil
// (continuar de onde parou — posicao_atual, spec 8.4/8.6).

import { armazenamento } from '../armazenamento/armazenamento';
import { livros } from '../conteudo/catalogo';
import type { Livro } from '../motor/tipos';
import { perfilAtivo } from '../perfis/perfis';
import { barraTopo, el } from './comum';

const EMOJIS_CAPA: Record<string, string> = {
  'lebre-e-tartaruga': '🐢🐇',
  'o-que-depende-de-mim': '☔',
  'o-pequeno-principe': '🌹',
  'socrates-e-as-duas-cestas': '🏛️',
  'o-sonho-do-menino-rene': '🌙',
  'o-leao-e-o-ratinho': '🦁🐭',
  'a-raposa-e-as-uvas': '🦊🍇',
  'o-vento-e-o-sol': '🌬️☀️',
  'alfabeto-grego': 'Ωα',
  'alfabeto': '🔤',
};

export async function montarTelaEstante(
  raiz: HTMLElement,
  nav: {
    perfis: () => void;
    aparencia: () => void;
    leitura: (livro: Livro) => void;
    anotacoes: () => void;
  },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-estante';

  raiz.appendChild(
    barraTopo({ titulo: 'Estante', aoTrocarPerfil: nav.perfis, aoAparencia: nav.aparencia }),
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

  /* O caderno entra na estante como mais um cartão, no fim da grade: é um
     lugar para onde se vai, igual a um livro. Não leva selo de progresso —
     anotação não se "conclui" —, e a classe própria dá a ele uma borda que o
     separa dos livros sem tirá-lo do meio deles. */
  const caderno = el('button', 'cartao-livro cartao-caderno');
  caderno.appendChild(el('span', 'capa-emoji', '📝'));
  caderno.appendChild(el('span', 'titulo-livro', 'Minhas anotações'));
  caderno.appendChild(el('span', 'autor-livro', 'escreva o que quiser'));
  caderno.addEventListener('click', nav.anotacoes);
  grade.appendChild(caderno);

  raiz.appendChild(grade);
}
