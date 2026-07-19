// Tela de leitura: renderiza os nós do parser, quiz zero-gate inline
// (spec 4 e 8.5), botão de ouvir por parágrafo, e salva a posição
// de leitura por perfil para o "continuar de onde parou".

import { armazenamento } from '../armazenamento/armazenamento';
import { arquivosAssets } from '../conteudo/catalogo';
import type { Livro, PerguntaQuiz } from '../motor/tipos';
import { perfilAtivo } from '../perfis/perfis';
import { falar, pararFala, suportaTTS } from '../tts';
import { barraTopo, el } from './comum';

export async function montarTelaLeitura(
  raiz: HTMLElement,
  livro: Livro,
  nav: {
    perfis: () => void;
    estante: () => void;
    colorir: (assetId: string) => void;
  },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-leitura';
  pararFala();

  raiz.appendChild(
    barraTopo({
      titulo: livro.metadados.titulo,
      aoVoltar: nav.estante,
      aoTrocarPerfil: nav.perfis,
    }),
  );

  const artigo = el('article', 'leitura');
  const p = perfilAtivo();
  const perguntas = livro.metadados.quiz ?? [];

  for (const no of livro.nos) {
    if (no.tipo === 'cabecalho') {
      // profundidade arbitrária preservada: nível vira atributo,
      // o elemento HTML só limita a tag, nunca o dado
      const tag = `h${Math.min(no.nivel + 1, 6)}` as keyof HTMLElementTagNameMap;
      const cab = el(tag, 'cabecalho', no.texto);
      cab.dataset.nivel = String(no.nivel);
      cab.id = `no-${no.id}`;
      artigo.appendChild(cab);
    } else if (no.tipo === 'paragrafo') {
      const bloco = el('div', 'paragrafo');
      bloco.id = `no-${no.id}`;
      bloco.appendChild(el('p', undefined, no.texto));
      if (suportaTTS()) {
        const ouvir = el('button', 'botao-ouvir', '🔊');
        ouvir.setAttribute('aria-label', 'Ouvir este parágrafo');
        ouvir.addEventListener('click', () => falar(no.texto));
        bloco.appendChild(ouvir);
      }
      artigo.appendChild(bloco);
    } else {
      artigo.appendChild(cartaoImagem(no.assetId, livro, nav.colorir));
    }

    // quiz ancorado neste nó — inline, logo após (spec 4)
    perguntas
      .filter((q) => q.nivel === 'paragrafo' && q.ancora === no.id)
      .forEach((q) => artigo.appendChild(blocoQuiz(q, livro, perguntas.indexOf(q))));
  }

  // quiz de capítulo ao final
  const deCapitulo = perguntas.filter((q) => q.nivel === 'capitulo');
  if (deCapitulo.length > 0) {
    artigo.appendChild(el('h2', 'titulo-fim', 'Para pensar 💭'));
    deCapitulo.forEach((q) => artigo.appendChild(blocoQuiz(q, livro, perguntas.indexOf(q))));
  }
  artigo.appendChild(el('p', 'fim-livro', 'Fim! 🎉'));

  raiz.appendChild(artigo);

  // restaurar posição de leitura
  const chaveProgresso = `${p.id}:progresso:${livro.id}`;
  const progresso = await armazenamento.obter<{ posicaoAtual: string }>(chaveProgresso);
  if (progresso?.posicaoAtual) {
    document.getElementById(`no-${progresso.posicaoAtual}`)?.scrollIntoView({ block: 'start' });
  }

  // salvar posição conforme rola (debounce)
  let temporizador: number | undefined;
  const aoRolar = () => {
    clearTimeout(temporizador);
    temporizador = window.setTimeout(() => {
      const blocos = artigo.querySelectorAll<HTMLElement>('.paragrafo');
      for (const b of blocos) {
        if (b.getBoundingClientRect().bottom > 90) {
          armazenamento.definir(chaveProgresso, {
            posicaoAtual: b.id.replace('no-', ''),
          });
          break;
        }
      }
    }, 400);
  };
  window.addEventListener('scroll', aoRolar, { passive: true });
}

function cartaoImagem(
  assetId: string,
  livro: Livro,
  irColorir: (assetId: string) => void,
): HTMLElement {
  const asset = livro.metadados.assets?.find((a) => a.id === assetId);
  const cartao = el('div', 'cartao-imagem');

  if (!asset) {
    cartao.appendChild(el('p', 'aviso-asset', `⚠ asset "${assetId}" não declarado no front matter`));
    return cartao;
  }

  const arquivo = asset.arquivo_interativo ?? asset.arquivo;
  const svg = arquivo ? arquivosAssets[arquivo] : undefined;
  if (svg) {
    const moldura = el('div', 'previa-svg');
    moldura.innerHTML = svg;
    cartao.appendChild(moldura);
  }

  if (asset.tipo === 'colorir') {
    const pintar = el('button', 'botao-grande', '🎨 Pintar este desenho');
    pintar.addEventListener('click', () => irColorir(assetId));
    cartao.appendChild(pintar);
  }
  return cartao;
}

// Quiz zero-gate (spec 8.5, decisão final): qualquer alternativa pode ser
// tocada; o app sempre revela a correta com explicação e nada trava o
// avanço. Tentativas/acertos gravados em silêncio — nunca nota pra criança.
function blocoQuiz(q: PerguntaQuiz, livro: Livro, indice: number): HTMLElement {
  const caixa = el('div', 'quiz');
  caixa.appendChild(el('p', 'quiz-pergunta', `🤔 ${q.pergunta}`));

  const lista = el('div', 'quiz-alternativas');
  let respondido = false;

  q.alternativas.forEach((alt, i) => {
    const botao = el('button', 'quiz-alternativa', alt);
    botao.addEventListener('click', async () => {
      if (respondido) return;
      respondido = true;

      const botoes = lista.querySelectorAll<HTMLButtonElement>('button');
      botoes.forEach((b, j) => {
        b.disabled = true;
        if (j === q.correta) b.classList.add('correta');
        else if (j === i) b.classList.add('errada');
      });

      if (q.explicacao) {
        caixa.appendChild(el('p', 'quiz-explicacao', `💡 ${q.explicacao}`));
      }

      // registro silencioso (spec 8.5) — nunca vira placar
      const chave = `${perfilAtivo().id}:quiz:${livro.id}:q${indice}`;
      const anterior = await armazenamento.obter<{ tentativas: number; acertou: boolean }>(chave);
      await armazenamento.definir(chave, {
        tentativas: (anterior?.tentativas ?? 0) + 1,
        acertou: (anterior?.acertou ?? false) || i === q.correta,
      });
    });
    lista.appendChild(botao);
  });

  caixa.appendChild(lista);
  return caixa;
}
