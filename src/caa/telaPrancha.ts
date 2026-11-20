// A PRANCHA NA TELA: tocar na casa e ouvir a palavra.
//
// Quem usa esta tela pode ser um adolescente ou um adulto: nada de bichinho,
// insígnia ou festa. Sem animação (a casa só escurece ao toque). Fora da
// estante das crianças e fora do tema do perfil: a prancha tem a própria
// paleta clara, de alto contraste, igual em todo aparelho — quem aprende a
// prancha num tablet a reconhece no outro.
//
// Ordem da tela, de cima para baixo:
//   barra (Sair · nome · montar) → frase (casas tocadas + Falar/Apagar/Limpar)
//   → caminho (Início, quando se está numa prancha-filha) → a grade.
// A grade tem colunas FIXAS: em tela pequena as casas encolhem, nunca pulam
// de linha (ver a regra 1 em modelo.ts).

import { el } from '../telas/comum';
import { armazenamento } from '../armazenamento/armazenamento';
import { falar, pararFala, suportaTTS } from '../tts';
import { CORES_CAA } from './cores';
import {
  acharPrancha,
  entraNaFrase,
  falaDaCasa,
  pranchaInicial,
  textoDaFrase,
  type CasaCaa,
  type ConjuntoCaa,
  type PranchaCaa,
} from './modelo';
import { svgDoPictograma } from './pictogramas';

export interface NavPrancha {
  sair: () => void;
  /** abre a área dos adultos (passa pela trava) */
  montar?: () => void;
  /** rótulo do botão de sair ("Sair", "Voltar a montar") */
  rotuloSair?: string;
}

/** O miolo de uma casa (figura + palavra) — o mesmo na prancha e no editor. */
export function desenharCasa(casa: CasaCaa, conjunto: ConjuntoCaa, comCor: boolean): HTMLElement {
  const vazia = !casa.rotulo.trim();
  const botao = el(vazia ? 'div' : 'button', 'casa-caa');
  if (vazia) {
    botao.classList.add('vazia');
    botao.setAttribute('aria-hidden', 'true');
    return botao;
  }
  if (comCor && !casa.abre) botao.style.setProperty('--cor-casa', CORES_CAA[casa.categoria]);
  const figura = el('span', 'casa-caa-figura');
  if (casa.imagem) {
    const img = el('img');
    img.src = casa.imagem;
    img.alt = '';
    figura.appendChild(img);
  } else if (casa.pictograma) {
    figura.innerHTML = svgDoPictograma(casa.pictograma); // desenho nosso, nunca texto de fora
  } else {
    figura.classList.add('sem-figura');
  }
  const rotulo = el('span', 'casa-caa-rotulo', casa.rotulo);
  // palavra comprida encolhe a letra (a casa não cresce); quebra de linha só
  // entre palavras ("POR / FAVOR"), nunca dentro de uma ("DESCANS / AR")
  const maior = Math.max(1, ...casa.rotulo.split(/\s+/).map((p) => [...p].length));
  rotulo.style.setProperty('--letras', String(maior));
  botao.append(figura, rotulo);
  if (casa.abre) {
    botao.classList.add('pasta');
    const destino = acharPrancha(conjunto, casa.abre)?.titulo ?? '';
    botao.setAttribute('aria-label', `${casa.rotulo}: abre a prancha ${destino}`);
  } else {
    botao.setAttribute('aria-label', casa.rotulo);
  }
  return botao;
}

/** Os degraus do zoom da prancha: 1 = cabe na tela. */
const ZOOMS = [1, 1.25, 1.5, 2, 2.5, 3];
const CHAVE_ZOOM = 'caa:zoom';

export function montarTelaPrancha(raiz: HTMLElement, conjunto: ConjuntoCaa, nav: NavPrancha): void {
  pararFala();
  raiz.innerHTML = '';
  raiz.className = 'tela tela-caa';
  window.scrollTo(0, 0);
  const aj = conjunto.ajustes;

  let atual: PranchaCaa = pranchaInicial(conjunto);
  const frase: CasaCaa[] = [];
  let ultimo = { id: '', quando: 0 };

  // ---------------------------------------------------------------- barra --
  const barra = el('header', 'caa-topo');
  const sair = el('button', 'caa-botao', `← ${nav.rotuloSair ?? 'Sair'}`);
  sair.addEventListener('click', () => {
    encerrar();
    nav.sair();
  });
  const titulo = el('h1', 'caa-titulo');
  barra.append(sair, titulo);

  // ZOOM (pedido do Bruno, 2026-11-20: "o zoom que não tem na Prancha"). As
  // casas crescem a partir do tamanho que cabe na tela; a letra da barra e da
  // frase cresce junto. A ORDEM das casas nunca muda: quando não cabem, a
  // prancha rola. Do aparelho (a prancha não tem perfil), como a do Pedra.
  const zoom = el('div', 'caa-zoom');
  zoom.setAttribute('role', 'group');
  zoom.setAttribute('aria-label', 'Tamanho da prancha');
  const menor = el('button', 'caa-botao', 'A−');
  menor.setAttribute('aria-label', 'Diminuir a prancha');
  const maior = el('button', 'caa-botao', 'A+');
  maior.setAttribute('aria-label', 'Aumentar a prancha');
  zoom.append(menor, maior);
  barra.appendChild(zoom);
  let nivelZoom = 0;
  const aplicarZoom = (n: number, guardar = true) => {
    nivelZoom = Math.min(ZOOMS.length - 1, Math.max(0, n));
    raiz.style.setProperty('--caa-zoom', String(ZOOMS[nivelZoom]));
    menor.disabled = nivelZoom === 0;
    maior.disabled = nivelZoom === ZOOMS.length - 1;
    if (guardar) void armazenamento.definir(CHAVE_ZOOM, nivelZoom);
    ajustarLado();
  };
  menor.addEventListener('click', () => aplicarZoom(nivelZoom - 1));
  maior.addEventListener('click', () => aplicarZoom(nivelZoom + 1));
  if (nav.montar) {
    const montar = el('button', 'caa-botao caa-botao-discreto', '✏️');
    montar.setAttribute('aria-label', 'Montar pranchas (área dos adultos)');
    montar.title = 'Montar pranchas (área dos adultos)';
    montar.addEventListener('click', () => {
      encerrar();
      nav.montar!();
    });
    barra.appendChild(montar);
  }
  raiz.appendChild(barra);

  // ---------------------------------------------------------------- frase --
  const casasFrase = el('div', 'caa-frase-casas');
  casasFrase.setAttribute('role', 'log');
  casasFrase.setAttribute('aria-live', 'polite');
  casasFrase.setAttribute('aria-label', 'Frase');
  const botaoFalar = el('button', 'caa-botao caa-falar', '🔊 Falar');
  const botaoApagar = el('button', 'caa-botao', '⌫');
  botaoApagar.setAttribute('aria-label', 'Apagar a última palavra');
  const botaoLimpar = el('button', 'caa-botao', '✕');
  botaoLimpar.setAttribute('aria-label', 'Limpar a frase');
  if (aj.montarFrase) {
    const caixa = el('section', 'caa-frase');
    const acoes = el('div', 'caa-frase-acoes');
    acoes.append(botaoFalar, botaoApagar, botaoLimpar);
    caixa.append(casasFrase, acoes);
    raiz.appendChild(caixa);
  }
  botaoFalar.addEventListener('click', () => {
    const t = textoDaFrase(frase);
    if (t) falar(t);
  });
  botaoApagar.addEventListener('click', () => {
    frase.pop();
    desenharFrase();
  });
  botaoLimpar.addEventListener('click', () => {
    frase.length = 0;
    pararFala();
    desenharFrase();
  });

  function desenharFrase(): void {
    casasFrase.innerHTML = '';
    if (frase.length === 0) {
      casasFrase.appendChild(el('span', 'caa-frase-vazia', 'Toque nas casas para montar uma frase.'));
    }
    for (const c of frase) {
      const pedaco = el('span', 'caa-frase-pedaco');
      if (c.imagem) {
        const img = el('img');
        img.src = c.imagem;
        img.alt = '';
        pedaco.appendChild(img);
      } else if (c.pictograma) {
        const fig = el('span', 'caa-frase-figura');
        fig.innerHTML = svgDoPictograma(c.pictograma, 7);
        pedaco.appendChild(fig);
      }
      pedaco.appendChild(el('span', undefined, c.rotulo));
      casasFrase.appendChild(pedaco);
    }
    botaoFalar.disabled = frase.length === 0;
    botaoApagar.disabled = frase.length === 0;
    botaoLimpar.disabled = frase.length === 0;
  }

  // -------------------------------------------------------------- caminho --
  const caminho = el('nav', 'caa-caminho');
  caminho.setAttribute('aria-label', 'Pranchas');
  const inicio = el('button', 'caa-botao', '⌂ Início');
  inicio.addEventListener('click', () => irPara(pranchaInicial(conjunto)));
  raiz.appendChild(caminho);

  // ---------------------------------------------------------------- grade --
  const grade = el('div', 'caa-grade');
  const rolagem = el('div', 'caa-rolagem');
  rolagem.appendChild(grade);
  raiz.appendChild(rolagem);

  if (!suportaTTS()) {
    raiz.appendChild(
      el('p', 'caa-aviso', 'Este navegador não tem voz. A prancha funciona do mesmo jeito: aponte, e quem conversa lê.'),
    );
  }

  function irPara(p: PranchaCaa): void {
    atual = p;
    desenharGrade();
    reiniciarVarredura();
  }

  function tocar(casa: CasaCaa): void {
    const agora = performance.now();
    if (casa.id === ultimo.id && agora - ultimo.quando < aj.esperaEntreToques) return;
    ultimo = { id: casa.id, quando: agora };

    if (casa.abre) {
      const destino = acharPrancha(conjunto, casa.abre);
      if (aj.falarAoTocar) falar(falaDaCasa(casa));
      if (destino) irPara(destino);
      return;
    }
    if (aj.falarAoTocar) falar(falaDaCasa(casa));
    if (aj.montarFrase && entraNaFrase(casa)) {
      frase.push(casa);
      desenharFrase();
    }
    if (aj.voltarAoInicio && atual.id !== conjunto.inicial) irPara(pranchaInicial(conjunto));
  }

  function desenharGrade(): void {
    titulo.textContent = atual.id === conjunto.inicial ? conjunto.nome : `${conjunto.nome} · ${atual.titulo}`;
    caminho.innerHTML = '';
    if (atual.id !== conjunto.inicial) caminho.append(inicio, el('span', 'caa-caminho-aqui', atual.titulo));
    caminho.hidden = atual.id === conjunto.inicial;

    grade.innerHTML = '';
    grade.style.setProperty('--colunas', String(atual.colunas));
    grade.setAttribute('aria-label', `Prancha ${atual.titulo}`);
    for (const casa of atual.casas) {
      const no = desenharCasa(casa, conjunto, aj.cores);
      if (no instanceof HTMLButtonElement) no.addEventListener('click', () => tocar(casa));
      grade.appendChild(no);
    }
    ajustarLado();
  }

  // As casas ocupam a tela que sobra, sem rolar, enquanto couberem com pelo
  // menos 56 px; abaixo disso a página rola (casa minúscula ninguém acerta).
  function ajustarLado(): void {
    if (!grade.isConnected) return;
    const folga = 8;
    const fileiras = Math.max(1, Math.ceil(atual.casas.length / atual.colunas));
    const largura = rolagem.clientWidth;
    const topo = grade.getBoundingClientRect().top + window.scrollY;
    const altura = window.innerHeight - topo - 12;
    const porLargura = (largura - folga * (atual.colunas - 1)) / atual.colunas;
    const porAltura = (altura - folga * (fileiras - 1)) / fileiras;
    // no zoom 1, cabe na tela; acima disso, cresce a partir daí (e rola)
    const lado = Math.max(56, Math.min(porLargura, porAltura, 220) * ZOOMS[nivelZoom]);
    grade.style.setProperty('--lado', `${Math.floor(lado)}px`);
  }
  const aoRedimensionar = () => {
    if (viva()) ajustarLado();
  };
  window.addEventListener('resize', aoRedimensionar);

  // ------------------------------------------------------------ varredura --
  // Para quem não consegue apontar mas consegue UM gesto (um toque em
  // qualquer lugar da tela, a barra de espaço, um acionador que imita tecla):
  // o destaque passeia pelas casas, e o gesto escolhe a destacada.
  let tique: number | undefined;
  let posicao = -1;
  function alvos(): HTMLElement[] {
    const casas = [...grade.querySelectorAll<HTMLElement>('button.casa-caa')];
    const extras = [atual.id !== conjunto.inicial ? inicio : null, aj.montarFrase ? botaoFalar : null, sair];
    return [...casas, ...extras.filter((x): x is HTMLButtonElement => Boolean(x))];
  }
  function marcar(): void {
    raiz.querySelectorAll('.varrendo').forEach((x) => x.classList.remove('varrendo'));
    const lista = alvos();
    if (lista.length === 0) return;
    posicao = (posicao + 1) % lista.length;
    lista[posicao].classList.add('varrendo');
  }
  function reiniciarVarredura(): void {
    if (!aj.varredura) return;
    clearInterval(tique);
    posicao = -1;
    marcar();
    tique = window.setInterval(() => {
      if (!raiz.contains(grade)) return encerrar();
      marcar();
    }, aj.varredura);
  }
  // a prancha pode ter sido trocada por outra tela sem passar por "Sair":
  // aí os ouvintes se desligam no primeiro gesto, sem engolir nada
  const viva = () => {
    if (grade.isConnected) return true;
    encerrar();
    return false;
  };
  function escolher(ev: Event): void {
    if (!viva()) return;
    const alvo = raiz.querySelector<HTMLElement>('.varrendo');
    if (!alvo) return;
    ev.preventDefault();
    ev.stopPropagation();
    alvo.click();
    // escolheu: o destaque recomeça do início (se a tela ainda for esta)
    if (grade.isConnected) reiniciarVarredura();
  }
  const aoApontar = (ev: PointerEvent) => escolher(ev);
  const aoTeclar = (ev: KeyboardEvent) => {
    if (ev.key === ' ' || ev.key === 'Enter') escolher(ev);
  };
  // o clique que o próprio toque geraria também é engolido (senão, dois)
  const engolirClique = (ev: MouseEvent) => {
    if (ev.isTrusted && viva()) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  };
  if (aj.varredura) {
    raiz.classList.add('com-varredura');
    raiz.addEventListener('pointerdown', aoApontar, true);
    raiz.addEventListener('click', engolirClique, true);
    document.addEventListener('keydown', aoTeclar, true);
  }

  function encerrar(): void {
    clearInterval(tique);
    window.removeEventListener('resize', aoRedimensionar);
    raiz.removeEventListener('pointerdown', aoApontar, true);
    raiz.removeEventListener('click', engolirClique, true);
    document.removeEventListener('keydown', aoTeclar, true);
    // o #app é de todas as telas: o zoom da prancha não vaza para as outras
    raiz.style.removeProperty('--caa-zoom');
    pararFala();
  }

  desenharFrase();
  desenharGrade();
  reiniciarVarredura();
  requestAnimationFrame(ajustarLado);
  // o zoom que ficou guardado no aparelho
  menor.disabled = true;
  void armazenamento.obter<number>(CHAVE_ZOOM).then((n) => {
    if (viva() && typeof n === 'number' && n > 0) aplicarZoom(n, false);
  });
}
