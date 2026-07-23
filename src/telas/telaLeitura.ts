// Tela de leitura: renderiza os nós do parser, quiz zero-gate inline
// (spec 4 e 8.5), ouvir/parar por parágrafo, preview do desenho com as
// cores que a criança já pintou, e conclusão explícita do livro
// ("Terminei!") que concede insígnia fixa e previsível.

import { armazenamento } from '../armazenamento/armazenamento';
import { registrarLivroConcluido, listarConquistas } from '../conquistas/insignias';
import { arquivosAssets, arquivosImagens } from '../conteudo/catalogo';
import { derivarContornoPB } from '../canvas/camadaBase';
import { soltarConfetes } from '../efeitos/confete';
import type { Livro, PerguntaQuiz } from '../motor/tipos';
import { perfilAtivo } from '../perfis/perfis';
import { botoesTabelas } from '../impressao/tabelas';
import { falar, pararFala, suportaTTS, textoFalando } from '../tts';
import { barraTopo, el } from './comum';

interface Progresso {
  posicaoAtual?: string;
  status?: 'em_andamento' | 'concluido';
}

export async function montarTelaLeitura(
  raiz: HTMLElement,
  livro: Livro,
  nav: {
    perfis: () => void;
    estante: () => void;
    aparencia: () => void;
    colorir: (assetId: string) => void;
    quebraCabeca: (assetId: string) => void;
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
      aoAparencia: nav.aparencia,
    }),
  );

  // barra de extras: ouvir a história inteira + tabelas imprimíveis
  const barraExtras = el('div', 'barra-extras');
  const botaoHistoria = botaoOuvirHistoria(livro);
  if (botaoHistoria) barraExtras.appendChild(botaoHistoria);
  for (const b of botoesTabelas(livro.id)) {
    const botao = el('button', 'botao-extra', b.rotulo);
    botao.addEventListener('click', b.acao);
    barraExtras.appendChild(botao);
  }
  if (barraExtras.childElementCount > 0) raiz.appendChild(barraExtras);

  const p = perfilAtivo();
  const chaveProgresso = `${p.id}:progresso:${livro.id}`;
  const progresso: Progresso =
    (await armazenamento.obter<Progresso>(chaveProgresso)) ?? {};

  const artigo = el('article', 'leitura');
  const perguntas = livro.metadados.quiz ?? [];

  // texto de cada capítulo (do cabeçalho até o próximo) p/ o 🔊 do cabeçalho
  const textoDoCapitulo = new Map<string, string>();
  {
    let cabecalhoAberto: string | null = null;
    let acumulado: string[] = [];
    const fechar = () => {
      if (cabecalhoAberto && acumulado.length > 0) {
        textoDoCapitulo.set(cabecalhoAberto, acumulado.join(' '));
      }
      acumulado = [];
    };
    for (const no of livro.nos) {
      if (no.tipo === 'cabecalho') {
        fechar();
        cabecalhoAberto = no.id;
      } else if (no.tipo === 'paragrafo') {
        acumulado.push(no.texto);
      }
    }
    fechar();
  }

  for (const no of livro.nos) {
    if (no.tipo === 'cabecalho') {
      // profundidade arbitrária preservada: nível vira atributo,
      // o elemento HTML só limita a tag, nunca o dado
      const tag = `h${Math.min(no.nivel + 1, 6)}` as keyof HTMLElementTagNameMap;
      const cab = el(tag, 'cabecalho', no.texto);
      cab.dataset.nivel = String(no.nivel);
      cab.id = `no-${no.id}`;
      // 🔊 do capítulo: lê tudo até o próximo cabeçalho, sem clique por parágrafo
      const textoCap = textoDoCapitulo.get(no.id);
      if (textoCap && suportaTTS()) {
        const bloco = el('div', 'cabecalho-bloco');
        bloco.append(cab, botaoOuvir(`${no.texto}. ${textoCap}`));
        artigo.appendChild(bloco);
        continue;
      }
      artigo.appendChild(cab);
    } else if (no.tipo === 'paragrafo') {
      const bloco = el('div', 'paragrafo');
      bloco.id = `no-${no.id}`;
      bloco.appendChild(el('p', undefined, no.texto));
      if (suportaTTS()) bloco.appendChild(botaoOuvir(no.texto));
      artigo.appendChild(bloco);
    } else {
      artigo.appendChild(cartaoImagem(no.assetId, livro, nav));
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

  artigo.appendChild(await rodapeConclusao(livro, progresso, chaveProgresso));
  raiz.appendChild(artigo);

  // restaurar posição de leitura + "você parou aqui" visível
  if (progresso.posicaoAtual) {
    const alvo = document.getElementById(`no-${progresso.posicaoAtual}`);
    if (alvo) {
      alvo.scrollIntoView({ block: 'start' });
      alvo.classList.add('retomada');
      setTimeout(() => alvo.classList.remove('retomada'), 5000);
    }
  }

  // salvar posição conforme rola (debounce), preservando o status
  let temporizador: number | undefined;
  const aoRolar = () => {
    clearTimeout(temporizador);
    temporizador = window.setTimeout(() => {
      const blocos = artigo.querySelectorAll<HTMLElement>('.paragrafo');
      for (const b of blocos) {
        if (b.getBoundingClientRect().bottom > 90) {
          progresso.posicaoAtual = b.id.replace('no-', '');
          if (!progresso.status) progresso.status = 'em_andamento';
          armazenamento.definir(chaveProgresso, progresso);
          break;
        }
      }
    }, 400);
  };
  window.addEventListener('scroll', aoRolar, { passive: true });
}

// "Ouvir a história": narração GRAVADA (campo narracao no front matter)
// quando o livro tiver uma; senão, TTS do texto inteiro (até a seção dos
// adultos, que fica de fora da leitura corrida).
function botaoOuvirHistoria(livro: Livro): HTMLElement | null {
  const assetNarracao = livro.metadados.assets?.find((a) => a.id === livro.metadados.narracao);
  const urlNarracao = assetNarracao?.arquivo ? arquivosImagens[assetNarracao.arquivo] : undefined;

  if (urlNarracao) {
    const audio = new Audio(urlNarracao);
    const botao = el('button', 'botao-extra', '🎙️ Ouvir a história');
    botao.addEventListener('click', () => {
      if (audio.paused) {
        pararFala();
        audio.play();
        botao.textContent = '⏸ Pausar a história';
      } else {
        audio.pause();
        botao.textContent = '🎙️ Ouvir a história';
      }
    });
    audio.addEventListener('ended', () => (botao.textContent = '🎙️ Ouvir a história'));
    return botao;
  }

  if (!suportaTTS()) return null;
  const partes: string[] = [];
  for (const no of livro.nos) {
    if (no.tipo === 'cabecalho') {
      if (no.texto === 'Para os adultos que leem junto') break;
      partes.push(`${no.texto}.`);
    } else if (no.tipo === 'paragrafo') {
      partes.push(no.texto);
    }
  }
  if (partes.length === 0) return null;
  const textoTodo = partes.join(' ');

  const botao = el('button', 'botao-extra', '🔊 Ouvir a história');
  botao.addEventListener('click', () => {
    if (textoFalando() === textoTodo) {
      pararFala();
      botao.textContent = '🔊 Ouvir a história';
    } else {
      botao.textContent = '⏹ Parar a história';
      falar(textoTodo, () => (botao.textContent = '🔊 Ouvir a história'));
    }
  });
  return botao;
}

// 🔊 vira ⏹ enquanto fala — e volta sozinho quando a fala termina
function botaoOuvir(texto: string): HTMLElement {
  const botao = el('button', 'botao-ouvir', '🔊');
  botao.setAttribute('aria-label', 'Ouvir este parágrafo');
  botao.addEventListener('click', () => {
    if (textoFalando() === texto) {
      pararFala();
      botao.textContent = '🔊';
    } else {
      // reseta qualquer outro botão que estivesse em modo ⏹
      document
        .querySelectorAll<HTMLButtonElement>('.botao-ouvir')
        .forEach((b) => (b.textContent = '🔊'));
      botao.textContent = '⏹';
      falar(texto, () => (botao.textContent = '🔊'));
    }
  });
  return botao;
}

function cartaoImagem(
  assetId: string,
  livro: Livro,
  nav: { colorir: (assetId: string) => void; quebraCabeca: (assetId: string) => void },
): HTMLElement {
  const asset = livro.metadados.assets?.find((a) => a.id === assetId);
  const cartao = el('div', 'cartao-imagem');

  if (!asset) {
    cartao.appendChild(el('p', 'aviso-asset', `⚠ asset "${assetId}" não declarado no front matter`));
    return cartao;
  }

  const arquivo = asset.arquivo_interativo ?? asset.arquivo;
  const svg = arquivo ? arquivosAssets[arquivo] : undefined;
  const url = arquivo ? arquivosImagens[arquivo] : undefined;

  if (asset.tipo === 'colorir' && svg) {
    const moldura = el('div', 'previa-svg');
    // preview = contorno + cores já pintadas pela criança (se houver).
    // Regiões não pintadas ficam BRANCAS (não transparentes): sem isso,
    // a cor da região de trás vazava — nuvem branca aparecia azul-céu.
    moldura.innerHTML = derivarContornoPB(svg);
    moldura
      .querySelectorAll<SVGElement>('.colorir-alvo')
      .forEach((r) => r.setAttribute('fill', '#ffffff'));
    cartao.appendChild(moldura);
    aplicarCoresSalvas(moldura, livro.id, assetId);

    const botoes = el('div', 'botoes-imagem');
    const pintar = el('button', 'botao-grande', '🎨 Pintar');
    pintar.addEventListener('click', () => nav.colorir(assetId));
    const montar = el('button', 'botao-grande', '🧩 Quebra-cabeça');
    montar.addEventListener('click', () => nav.quebraCabeca(assetId));
    botoes.append(pintar, montar);
    cartao.appendChild(botoes);
  } else if (svg) {
    // ilustração/capa em SVG: mostra a arte como ela é, sem contorno
    const moldura = el('div', 'previa-svg');
    moldura.innerHTML = svg;
    cartao.appendChild(moldura);
  } else if (url && asset.tipo === 'audio') {
    // áudio empacotado (mp3/ogg) — mesmo pipeline de asset das imagens
    const audio = el('audio', 'midia-audio') as HTMLAudioElement;
    audio.src = url;
    audio.controls = true;
    audio.preload = 'metadata';
    cartao.appendChild(audio);
  } else if (url && asset.tipo === 'video') {
    // vídeo empacotado (mp4/webm) — controles nativos, sem autoplay
    const video = el('video', 'midia-video') as HTMLVideoElement;
    video.src = url;
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    cartao.appendChild(video);
  } else if (url) {
    // ilustração raster (PNG/JPG) registrada em arquivosImagens
    const img = el('img', 'imagem-ilustracao') as HTMLImageElement;
    img.src = url;
    img.alt = asset.id;
    cartao.appendChild(img);
  }
  return cartao;
}

async function aplicarCoresSalvas(
  moldura: HTMLElement,
  livroId: string,
  assetId: string,
): Promise<void> {
  const chave = `${perfilAtivo().id}:colorir:${livroId}:${assetId}`;
  const estado = await armazenamento.obter<{ regioes: Record<string, string> }>(chave);
  if (!estado) return;
  for (const [regiaoId, cor] of Object.entries(estado.regioes)) {
    moldura.querySelector(`#${CSS.escape(regiaoId)}`)?.setAttribute('fill', cor);
  }
}

// Encerramento explícito: a criança marca "Terminei!" — vira status
// concluido, solta confetes e concede a insígnia fixa daquele livro.
async function rodapeConclusao(
  livro: Livro,
  progresso: Progresso,
  chaveProgresso: string,
): Promise<HTMLElement> {
  const rodape = el('div', 'rodape-livro');

  if (progresso.status === 'concluido') {
    const conquistas = await listarConquistas(perfilAtivo().id);
    rodape.appendChild(el('p', 'fim-livro', '⭐ Você já leu este livro inteiro!'));
    if (conquistas.length > 0) {
      rodape.appendChild(
        el('p', 'insignias-linha', conquistas.map((c) => c.emoji).join(' ')),
      );
    }
    return rodape;
  }

  const botao = el('button', 'botao-grande botao-terminei', '✓ Terminei este livro!');
  botao.addEventListener('click', async () => {
    progresso.status = 'concluido';
    await armazenamento.definir(chaveProgresso, progresso);

    const r = botao.getBoundingClientRect();
    soltarConfetes({ x: r.x + r.width / 2, y: r.y });

    const novas = await registrarLivroConcluido(perfilAtivo().id, livro.id);
    botao.remove();
    rodape.appendChild(el('p', 'fim-livro', '🎉 Parabéns! Você leu o livro inteiro!'));
    for (const insignia of novas) {
      const cartao = el('div', 'cartao-insignia');
      cartao.appendChild(el('span', 'insignia-emoji', insignia.emoji));
      cartao.appendChild(el('span', 'insignia-titulo', `Você ganhou a insígnia "${insignia.titulo}"!`));
      rodape.appendChild(cartao);
    }
  });
  rodape.appendChild(botao);
  return rodape;
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

      // símbolo + cor, nunca cor sozinha (protanomalia/daltonismo — o
      // verde-certo e o vermelho-errado podem ser indistinguíveis)
      const botoes = lista.querySelectorAll<HTMLButtonElement>('button');
      botoes.forEach((b, j) => {
        b.disabled = true;
        if (j === q.correta) {
          b.classList.add('correta');
          b.textContent = `✓ ${q.alternativas[j]}`;
        } else if (j === i) {
          b.classList.add('errada');
          b.textContent = `✗ ${q.alternativas[j]}`;
        }
      });

      if (i === q.correta) {
        const r = botao.getBoundingClientRect();
        soltarConfetes({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
      }

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
