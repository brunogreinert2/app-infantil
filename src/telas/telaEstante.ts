// Estante de livros. Mostra status de leitura por perfil
// (continuar de onde parou — posicao_atual, spec 8.4/8.6).

import { armazenamento } from '../armazenamento/armazenamento';
import { EMOJIS_CAPA } from '../conteudo/capas';
import { livros } from '../conteudo/catalogo';
import { PASTAS, PASTA_PADRAO, acharPasta, secoesDaPasta, todasAsPastas } from '../conteudo/pastas';
import type { Livro } from '../motor/tipos';
import { perfilAtivo } from '../perfis/perfis';
import { barraTopo, el } from './comum';


export async function montarTelaEstante(
  raiz: HTMLElement,
  idPasta: string,
  nav: {
    perfis: () => void;
    aparencia: () => void;
    leitura: (livro: Livro) => void;
    anotacoes: () => void;
    pasta: (id: string) => void;
  },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-estante';

  const pasta = acharPasta(idPasta) ?? acharPasta(PASTA_PADRAO)!;
  // a pasta de fora a que esta pertence (para marcar a aba certa)
  const deFora = PASTAS.find((f) => f === pasta || todasAsPastas(f.filhas).includes(pasta)) ?? pasta;

  raiz.appendChild(
    barraTopo({
      titulo: `${pasta.emoji} ${pasta.rotulo}`,
      aoTrocarPerfil: nav.perfis,
      aoAparencia: nav.aparencia,
    }),
  );

  // --- as pastas de fora, sempre no mesmo lugar, a um toque ---
  const abas = el('nav', 'pastas-estante');
  abas.setAttribute('aria-label', 'Pastas da estante');
  const aba = (rotulo: string, atual: boolean, aoTocar: () => void) => {
    const b = el('button', 'botao-opcao aba-pasta', rotulo);
    if (atual) {
      b.classList.add('ativa');
      b.setAttribute('aria-current', 'page');
    }
    b.addEventListener('click', aoTocar);
    abas.appendChild(b);
  };
  for (const f of PASTAS) aba(`${f.emoji} ${f.rotulo}`, f === deFora, () => nav.pasta(f.id));
  aba('📝 Anotações', false, nav.anotacoes);
  raiz.appendChild(abas);

  const p = perfilAtivo();
  const porId = new Map(livros.map((l) => [l.id, l]));
  const secoes = secoesDaPasta(pasta, livros.map((l) => l.id));

  for (const secao of secoes) {
    // uma pasta só não precisa repetir o nome que já está na barra
    if (secoes.length > 1 || secao.pasta !== pasta) {
      const titulo = el('h2', 'titulo-secao titulo-pasta', `${secao.pasta.emoji} ${secao.pasta.rotulo}`);
      raiz.appendChild(titulo);
    }
    const grade = el('div', 'grade-livros');
    for (const id of secao.livros) {
      const livro = porId.get(id)!;
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
}
