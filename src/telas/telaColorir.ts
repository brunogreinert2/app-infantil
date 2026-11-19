// Tela de colorir: monta as três camadas (base + pincel + linhas),
// a barra de ferramentas e a persistência por perfil (spec 8.2/8.4).

import { armazenamento } from '../armazenamento/armazenamento';
import { CamadaBase, criarCamadaLinhas } from '../canvas/camadaBase';
import { CamadaEscrita, escritasValidas, type Escrita } from '../canvas/camadaEscrita';
import { soltarConfetes } from '../efeitos/confete';
import { CamadaPincel, type Traco } from '../canvas/camadaPincel';
import { MATIZES, matizDe, nomeDaCor, tintaSobre, type Matiz } from '../canvas/cores';
import { nomeDaParte } from '../canvas/partes';
import { RoteadorFerramenta, type Ferramenta } from '../canvas/roteadorFerramenta';
import { ZOOM_MAXIMO, instalarZoomPinca } from '../canvas/zoomPinca';
import { arquivosAssets } from '../conteudo/catalogo';
import { imprimirParaColorir } from '../impressao/motorImpressao';
import type { Livro } from '../motor/tipos';
import { perfilAtivo } from '../perfis/perfis';
import { falar } from '../tts';
import { barraTopo, el } from './comum';
import { definirFalarCores, obterFalarCores } from './preferencias';

interface EstadoColorir {
  regioes: Record<string, string>;
  tracos: Traco[];
  /** o que a criança escreveu no desenho (campo novo, 2026-11-15: opcional) */
  escritas?: Escrita[];
}

type Acao =
  | { tipo: 'balde'; regiaoId: string; corAnterior: string }
  | { tipo: 'traco' }
  | { tipo: 'escrita'; antes: Escrita[] };

// As cores (nomes, tons, ordem) moram em ../canvas/cores.ts.
// Toque longo num poço abre os tons — e o botão «Tons» faz o mesmo com um
// toque só, porque toque longo pede coordenação fina e ninguém o descobre.
const TOQUE_LONGO_MS = 450;

/**
 * Um desenho que não vem de um livro da estante: uma folha gerada na tela
 * "Fazer uma folha" (2026-11-18). `chave` é onde a pintura fica guardada.
 */
export interface FontePintura {
  svg: string;
  titulo: string;
  chave: string;
}

/** O desenho, o título e onde guardar — venha de um livro ou de uma folha. */
export function resolverFonte(alvo: Livro | FontePintura, assetId: string): FontePintura | undefined {
  if ('svg' in alvo) return alvo;
  const asset = alvo.metadados.assets?.find((a) => a.id === assetId);
  const svg = asset?.arquivo_interativo ? arquivosAssets[asset.arquivo_interativo] : undefined;
  return svg ? { svg, titulo: alvo.metadados.titulo, chave: `${perfilAtivo().id}:colorir:${alvo.id}:${assetId}` } : undefined;
}


export async function montarTelaColorir(
  raiz: HTMLElement,
  alvo: Livro | FontePintura,
  assetId: string,
  nav: { perfis: () => void; voltar: () => void },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-pintura';

  const fonte = resolverFonte(alvo, assetId);
  if (!fonte) {
    raiz.appendChild(el('p', 'aviso-asset', `⚠ asset "${assetId}" sem arquivo interativo`));
    return;
  }
  const svgFonte = fonte.svg;

  raiz.appendChild(
    barraTopo({
      titulo: '🎨 ' + fonte.titulo,
      aoVoltar: nav.voltar,
      aoTrocarPerfil: nav.perfis,
    }),
  );

  // --- camadas (ordem no DOM = ordem de empilhamento), dentro da lente
  // de zoom: pinça com dois dedos amplia até 4x, um dedo pinta ---
  const tela = el('div', 'tela-colorir');
  raiz.appendChild(tela);
  const lente = el('div', 'lente-zoom');
  tela.appendChild(lente);

  const base = new CamadaBase(lente, svgFonte);

  // proporção da tela segue o viewBox da arte (pôsteres são retrato,
  // cenas são paisagem) — o CSS fixo 4:3 vale só como fallback
  const vb = base.svg.viewBox.baseVal;
  if (vb && vb.width > 0 && vb.height > 0) {
    tela.style.aspectRatio = `${vb.width} / ${vb.height}`;
    if (vb.height > vb.width) tela.style.width = 'min(96vw, 600px)';
  }
  let roteador: RoteadorFerramenta;
  const pincel = new CamadaPincel(lente, () => roteador.estiloPincel());
  roteador = new RoteadorFerramenta(pincel);
  const camadaLinhas = criarCamadaLinhas(lente, svgFonte);
  // a de cima de todas: o que a criança escreve no desenho
  const caixa = base.svg.viewBox.baseVal;
  const escrita = new CamadaEscrita(
    lente,
    caixa && caixa.width > 0 ? caixa.width : 800,
    caixa && caixa.height > 0 ? caixa.height : 600,
    () => roteador.cor,
    (texto) => avisar(texto),
  );
  const zoom = instalarZoomPinca(tela, lente, () => pincel.cancelarTracoAtivo());

  // --- estado + persistência ---
  const chave = fonte.chave;
  const estado: EstadoColorir = (await armazenamento.obter<EstadoColorir>(chave)) ?? {
    regioes: {},
    tracos: [],
  };
  base.aplicarEstado(estado.regioes);
  pincel.carregar(estado.tracos);
  escrita.carregar(escritasValidas(estado.escritas));

  const acoes: Acao[] = [];
  let salvarAgendado: number | undefined;
  const salvar = () => {
    clearTimeout(salvarAgendado);
    salvarAgendado = window.setTimeout(() => {
      estado.tracos = pincel.obterTracos();
      estado.escritas = escrita.obter();
      armazenamento.definir(chave, estado);
    }, 300);
  };

  // pintar uma região: o mesmo caminho para o toque no desenho e para o
  // botão "Pintar esta parte"
  const pintarRegiao = (regiaoId: string) => {
    acoes.push({ tipo: 'balde', regiaoId, corAnterior: base.corDe(regiaoId) });
    base.pintar(regiaoId, roteador.cor);
    estado.regioes[regiaoId] = roteador.cor;
    salvar();
    avisar(`Pintou de ${nomeDaCor(roteador.cor)}`);
    atualizarPartes();
  };
  base.aoTocarRegiao((regiaoId) => {
    if (roteador.ferramenta !== 'balde') return;
    pintarRegiao(regiaoId);
  });

  escrita.aoMudar((antes) => {
    acoes.push({ tipo: 'escrita', antes });
    salvar();
  });

  let desfazendo = false;
  pincel.aoMudar(() => {
    if (!desfazendo) acoes.push({ tipo: 'traco' });
    salvar();
  });

  const desfazer = () => {
    const acao = acoes.pop();
    if (!acao) return;
    if (acao.tipo === 'balde') {
      base.pintar(acao.regiaoId, acao.corAnterior);
      if (acao.corAnterior === '#ffffff') delete estado.regioes[acao.regiaoId];
      else estado.regioes[acao.regiaoId] = acao.corAnterior;
    } else if (acao.tipo === 'escrita') {
      escrita.carregar(acao.antes);
    } else {
      desfazendo = true;
      pincel.desfazerUltimo();
      desfazendo = false;
    }
    salvar();
    atualizarPartes();
  };

  // --- barra de ferramentas ---
  const barra = el('div', 'barra-ferramentas');

  const ferramentas: { id: Ferramenta; rotulo: string; nome: string }[] = [
    { id: 'balde', rotulo: '🪣', nome: 'Balde de tinta' },
    { id: 'pincel', rotulo: '🖌️', nome: 'Pincel' },
    { id: 'borracha', rotulo: '🧽', nome: 'Borracha' },
    { id: 'texto', rotulo: '✏️', nome: 'Escrever no desenho: toque onde quer escrever' },
  ];
  const grupoFerr = el('div', 'grupo-ferramentas');
  for (const f of ferramentas) {
    const b = el('button', 'botao-ferramenta', f.rotulo);
    b.dataset.ferramenta = f.id;
    b.setAttribute('aria-label', f.nome);
    b.addEventListener('click', () => roteador.definirFerramenta(f.id));
    grupoFerr.appendChild(b);
  }
  const desf = el('button', 'botao-ferramenta', '↩️');
  desf.setAttribute('aria-label', 'Desfazer');
  desf.addEventListener('click', desfazer);
  grupoFerr.appendChild(desf);

  // --- pintar por partes: escolher a região numa lista, sem precisar tocar
  // no lugar exato do desenho ---
  const botaoPartes = el('button', 'botao-ferramenta', '📋');
  botaoPartes.setAttribute('aria-label', 'Pintar escolhendo a parte do desenho');
  botaoPartes.setAttribute('aria-controls', 'painel-partes');
  grupoFerr.appendChild(botaoPartes);

  // --- lupa: um toque amplia (1× → 2× → 3× → 4× → 1×), e o número fica escrito
  // no botão. Antes este botão só VOLTAVA a 1× — sem pinça antes, não fazia
  // nada, e no computador não havia zoom nenhum.
  const lupa = el('button', 'botao-ferramenta botao-lupa');
  lupa.addEventListener('click', () => {
    // o mesmo teto da pinça (ZOOM_MAXIMO): antes a lupa parava em 3× e a
    // pinça ia a 4×. Do máximo, o próximo toque volta ao desenho inteiro.
    const atual = Math.floor(zoom.escala() + 0.05);
    if (atual >= ZOOM_MAXIMO) zoom.reiniciar();
    else zoom.definir(atual + 1);
  });
  grupoFerr.appendChild(lupa);

  // --- imprimir: primeiro a pergunta (contorno ou pintado) ---
  const imprimir = el('button', 'botao-ferramenta', '🖨️');
  imprimir.setAttribute('aria-label', 'Imprimir');
  imprimir.setAttribute('aria-controls', 'escolha-impressao');
  grupoFerr.appendChild(imprimir);
  barra.appendChild(grupoFerr);

  // com zoom, andar pela arte sem precisar de dois dedos
  const setas = el('div', 'setas-zoom');
  setas.setAttribute('role', 'group');
  setas.setAttribute('aria-label', 'Andar pelo desenho ampliado');
  const PASSO_SETA = 0.25;
  // setas de traço (← ↑ ↓ →), as mesmas do botão de voltar: os triângulos
  // ◀ ▶ viravam emoji em alguns aparelhos e saíam de tamanho diferente
  for (const [rotulo, nome, dx, dy] of [
    ['←', 'Ver mais à esquerda', -PASSO_SETA, 0],
    ['↑', 'Ver mais acima', 0, -PASSO_SETA],
    ['↓', 'Ver mais abaixo', 0, PASSO_SETA],
    ['→', 'Ver mais à direita', PASSO_SETA, 0],
  ] as Array<[string, string, number, number]>) {
    const b = el('button', 'botao-ferramenta botao-seta', rotulo);
    b.setAttribute('aria-label', nome);
    b.addEventListener('click', () => zoom.mover(dx, dy));
    setas.appendChild(b);
  }
  // mão: arrastar anda pelo desenho em vez de pintar (mouse ou um dedo)
  const mao = el('button', 'botao-ferramenta botao-seta', '✋');
  mao.setAttribute('aria-label', 'Mover o desenho arrastando, em vez de pintar');
  mao.setAttribute('aria-pressed', 'false');
  mao.title = 'Arrastar para andar pelo desenho (ou segure a barra de espaço)';
  mao.addEventListener('click', () => {
    const ligado = zoom.modoMover(!zoom.modoMover());
    mao.setAttribute('aria-pressed', String(ligado));
    mao.classList.toggle('ativa', ligado);
  });
  setas.appendChild(mao);
  barra.appendChild(setas);

  const atualizarZoom = () => {
    const fator = zoom.escala();
    const texto = Number.isInteger(fator) ? String(fator) : fator.toFixed(1).replace('.', ',');
    lupa.textContent = `🔍 ${texto}×`;
    lupa.setAttribute('aria-label', `Lupa: aumento de ${texto} vezes. Tocar muda o aumento.`);
    setas.hidden = fator <= 1.01;
    // sem zoom não há para onde andar: a mão desliga junto
    if (fator <= 1.01) {
      zoom.modoMover(false);
      mao.setAttribute('aria-pressed', 'false');
      mao.classList.remove('ativa');
    }
  };
  zoom.aoMudar(atualizarZoom);
  atualizarZoom();

  // teclado: + e − mudam o aumento, 0 volta ao normal, setas andam
  const aoTeclar = (ev: KeyboardEvent) => {
    if (!tela.isConnected) {
      document.removeEventListener('keydown', aoTeclar);
      return;
    }
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const alvo = ev.target as HTMLElement | null;
    if (alvo && /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName)) return;
    const comZoom = zoom.escala() > 1.01;
    if (ev.key === '+' || ev.key === '=') zoom.definir(zoom.escala() + 1);
    else if (ev.key === '-' || ev.key === '_') zoom.definir(zoom.escala() - 1);
    else if (ev.key === '0') zoom.reiniciar();
    else if (comZoom && ev.key === 'ArrowLeft') zoom.mover(-PASSO_SETA, 0);
    else if (comZoom && ev.key === 'ArrowRight') zoom.mover(PASSO_SETA, 0);
    else if (comZoom && ev.key === 'ArrowUp') zoom.mover(0, -PASSO_SETA);
    else if (comZoom && ev.key === 'ArrowDown') zoom.mover(0, PASSO_SETA);
    else return;
    ev.preventDefault();
  };
  document.addEventListener('keydown', aoTeclar);

  const idsDasPartes = base.regioes();
  let parteAtual = 0;
  let partesAbertas = false;

  const painelPartes = el('div', 'painel-partes');
  painelPartes.id = 'painel-partes';
  painelPartes.setAttribute('role', 'group');
  painelPartes.setAttribute('aria-label', 'Pintar por partes');
  painelPartes.appendChild(el('p', 'rotulo-tons', 'Escolha uma parte e pinte'));
  const linhaPartes = el('div', 'linha-partes');
  const parteAntes = el('button', 'botao-ferramenta botao-seta', '←');
  parteAntes.setAttribute('aria-label', 'Parte anterior');
  const parteDepois = el('button', 'botao-ferramenta botao-seta', '→');
  parteDepois.setAttribute('aria-label', 'Próxima parte');
  const seletor = el('select', 'seletor-partes');
  seletor.setAttribute('aria-label', 'Parte do desenho');
  idsDasPartes.forEach((id, i) => {
    const opcao = el('option', undefined, `${i + 1} de ${idsDasPartes.length} · ${nomeDaParte(id)}`);
    opcao.value = String(i);
    seletor.appendChild(opcao);
  });
  linhaPartes.append(parteAntes, seletor, parteDepois);
  const corDaParte = el('p', 'cor-da-parte');
  const pintarParte = el('button', 'botao-grande botao-pintar-parte');
  // escrever no meio da parte escolhida: o caminho de quem não acerta o toque
  const escreverParte = el('button', 'botao-opcao', '✏️ Escrever nesta parte');
  painelPartes.append(linhaPartes, corDaParte, pintarParte, escreverParte);
  barra.appendChild(painelPartes);

  // o contorno da parte escolhida fica destacado NO DESENHO (camada de
  // linhas): é assim que a criança vê de que pedaço a lista está falando
  function atualizarPartes(): void {
    camadaLinhas.querySelectorAll('.parte-escolhida').forEach((e) => e.classList.remove('parte-escolhida'));
    painelPartes.hidden = !partesAbertas;
    botaoPartes.setAttribute('aria-expanded', String(partesAbertas));
    botaoPartes.classList.toggle('ativa', partesAbertas);
    const id = idsDasPartes[parteAtual];
    if (!partesAbertas || !id) return;
    camadaLinhas.querySelector(`#${CSS.escape(id)}`)?.classList.add('parte-escolhida');
    seletor.value = String(parteAtual);
    corDaParte.textContent = `Agora está: ${nomeDaCor(base.corDe(id))}`;
    pintarParte.textContent = `🪣 Pintar de ${nomeDaCor(roteador.cor)}`;
  }
  const irParaParte = (i: number) => {
    const n = idsDasPartes.length;
    if (!n) return;
    parteAtual = ((i % n) + n) % n;
    atualizarPartes();
    // no celular a lista fica abaixo do desenho: se o desenho saiu da tela,
    // ele volta — senão a criança escolhe a parte sem ver qual é
    const topo = tela.getBoundingClientRect().top;
    if (topo < 80) window.scrollBy({ top: topo - 86, behavior: 'instant' });
    const id = idsDasPartes[parteAtual];
    avisar(`${parteAtual + 1} de ${n}: ${nomeDaParte(id)}. Está ${nomeDaCor(base.corDe(id))}.`);
  };
  parteAntes.addEventListener('click', () => irParaParte(parteAtual - 1));
  parteDepois.addEventListener('click', () => irParaParte(parteAtual + 1));
  seletor.addEventListener('change', () => irParaParte(Number(seletor.value)));
  pintarParte.addEventListener('click', () => {
    const id = idsDasPartes[parteAtual];
    if (id) pintarRegiao(id);
  });
  escreverParte.addEventListener('click', () => {
    const id = idsDasPartes[parteAtual];
    const alvo = id ? base.svg.querySelector<SVGGraphicsElement>(`#${CSS.escape(id)}`) : null;
    if (!alvo) return;
    const b = alvo.getBBox();
    const w = caixa && caixa.width > 0 ? caixa.width : 800;
    const h = caixa && caixa.height > 0 ? caixa.height : 600;
    escrita.abrirCampo((b.x + b.width / 2) / w, (b.y + b.height / 2) / h);
  });
  botaoPartes.addEventListener('click', () => {
    partesAbertas = !partesAbertas;
    atualizarPartes();
    if (partesAbertas) seletor.focus();
  });
  painelPartes.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      partesAbertas = false;
      atualizarPartes();
      botaoPartes.focus();
    }
    // as setas aqui são do seletor, não do zoom
    if (ev.key.startsWith('Arrow')) ev.stopPropagation();
  });
  if (!idsDasPartes.length) botaoPartes.hidden = true;

  const escolhaImpressao = el('div', 'escolha-impressao');
  escolhaImpressao.id = 'escolha-impressao';
  escolhaImpressao.setAttribute('role', 'group');
  escolhaImpressao.setAttribute('aria-label', 'Como imprimir');
  escolhaImpressao.appendChild(el('p', 'rotulo-tons', 'Como você quer imprimir?'));
  const abrirImpressao = (aberto: boolean) => {
    escolhaImpressao.hidden = !aberto;
    imprimir.setAttribute('aria-expanded', String(aberto));
    imprimir.classList.toggle('ativa', aberto);
  };
  const opcaoImpressao = (rotulo: string, comPintura: boolean) => {
    const b = el('button', 'botao-opcao', rotulo);
    b.addEventListener('click', () => {
      abrirImpressao(false);
      imprimirParaColorir(
        svgFonte,
        fonte.titulo,
        comPintura ? { regioes: estado.regioes, tracos: pincel.obterTracos(), escritas: escrita.obter() } : undefined,
      );
    });
    escolhaImpressao.appendChild(b);
    return b;
  };
  const soContorno = opcaoImpressao('✏️ Só o contorno, para pintar no papel', false);
  opcaoImpressao('🎨 Do jeito que eu pintei', true);
  imprimir.addEventListener('click', () => {
    abrirImpressao(escolhaImpressao.hidden);
    if (!escolhaImpressao.hidden) soContorno.focus();
  });
  escolhaImpressao.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    abrirImpressao(false);
    imprimir.focus();
  });
  abrirImpressao(false);
  barra.appendChild(escolhaImpressao);

  // encerramento explícito do desenho: comemora e volta pra história
  const pronto = el('button', 'botao-grande botao-terminei', '✓ Pronto!');
  pronto.addEventListener('click', () => {
    const r = pronto.getBoundingClientRect();
    soltarConfetes({ x: r.x + r.width / 2, y: r.y });
    setTimeout(nav.voltar, 900);
  });

  // --- a cor de agora: o NOME sempre escrito, grande, sem depender de
  // passar o mouse (no celular não existe mouse) ---
  let falarCores = await obterFalarCores();
  let tonsAbertos = false;

  const linhaCor = el('div', 'cor-atual');
  const amostra = el('span', 'amostra-cor');
  amostra.setAttribute('aria-hidden', 'true');
  const nomeCor = el('strong', 'nome-cor');
  nomeCor.setAttribute('role', 'status'); // leitor de tela anuncia a troca
  const botaoTons = el('button', 'botao-tons');
  botaoTons.setAttribute('aria-controls', 'fileira-tons');
  const botaoVoz = el('button', 'botao-tons botao-voz-cor');
  linhaCor.append(amostra, nomeCor, botaoTons, botaoVoz);

  const fileiraTons = el('div', 'fileira-tons');
  fileiraTons.id = 'fileira-tons';
  fileiraTons.setAttribute('role', 'group');
  const rotuloTons = el('p', 'rotulo-tons');
  const pocosTons = el('div', 'paleta-tons');
  fileiraTons.append(rotuloTons, pocosTons);

  // só para leitor de tela: "Pintou de Azul-céu"
  const aviso = el('div', 'so-leitor');
  aviso.setAttribute('aria-live', 'polite');
  function avisar(texto: string): void {
    aviso.textContent = '';
    requestAnimationFrame(() => (aviso.textContent = texto));
  }

  const criarPoco = (cor: string, nome: string): HTMLButtonElement => {
    const b = el('button', 'poco-cor');
    b.style.background = cor;
    b.style.setProperty('--tinta', tintaSobre(cor));
    b.dataset.cor = cor;
    b.setAttribute('aria-label', nome);
    return b;
  };

  // escolha feita pela criança (toque, teclado): troca a cor e, se ela
  // pediu, fala o nome — o toque é o gesto que o iOS exige para ter voz
  const escolherCor = (cor: string) => {
    roteador.definirCor(cor);
    if (falarCores) falar(nomeDaCor(cor));
  };

  const mostrarTons = (matiz: Matiz) => {
    rotuloTons.textContent = `Tons de ${matiz.nome}`;
    fileiraTons.setAttribute('aria-label', `Tons de ${matiz.nome}`);
    pocosTons.innerHTML = '';
    for (const tom of matiz.tons) {
      const b = criarPoco(tom.cor, tom.nome);
      b.addEventListener('click', () => escolherCor(tom.cor));
      pocosTons.appendChild(b);
    }
  };

  const abrirTons = (aberto: boolean) => {
    tonsAbertos = aberto;
    atualizarSelecao();
  };

  botaoTons.addEventListener('click', () => {
    abrirTons(!tonsAbertos);
    if (tonsAbertos) pocosTons.querySelector<HTMLButtonElement>('.ativa')?.focus();
  });
  fileiraTons.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    abrirTons(false);
    botaoTons.focus();
  });

  botaoVoz.addEventListener('click', async () => {
    falarCores = !falarCores;
    await definirFalarCores(falarCores);
    atualizarSelecao();
    if (falarCores) falar(nomeDaCor(roteador.cor));
  });

  const paleta = el('div', 'paleta');
  paleta.setAttribute('role', 'group');
  paleta.setAttribute('aria-label', 'Cores');
  for (const matiz of MATIZES) {
    const b = criarPoco(matiz.base, matiz.nome);
    b.dataset.matiz = matiz.nome;

    // toque longo: escolhe a cor e já abre os tons dela
    let relogio: number | undefined;
    let foiLongo = false;
    const soltar = () => clearTimeout(relogio);
    b.addEventListener('pointerdown', () => {
      foiLongo = false;
      if (matiz.tons.length < 2) return;
      relogio = window.setTimeout(() => {
        foiLongo = true;
        escolherCor(matiz.base);
        abrirTons(true);
      }, TOQUE_LONGO_MS);
    });
    for (const fim of ['pointerup', 'pointerleave', 'pointercancel'] as const) {
      b.addEventListener(fim, soltar);
    }
    b.addEventListener('contextmenu', (e) => e.preventDefault()); // menu do toque longo
    b.addEventListener('click', () => {
      if (foiLongo) {
        foiLongo = false; // o toque longo já escolheu; não falar duas vezes
        return;
      }
      escolherCor(matiz.base);
    });
    paleta.appendChild(b);
  }
  barra.append(linhaCor, fileiraTons, paleta, aviso);
  barra.appendChild(pronto);
  raiz.appendChild(barra);

  function atualizarSelecao(): void {
    escrita.ativa(roteador.ferramenta === 'texto');
    grupoFerr.querySelectorAll<HTMLButtonElement>('[data-ferramenta]').forEach((b) => {
      const ativa = b.dataset.ferramenta === roteador.ferramenta;
      b.classList.toggle('ativa', ativa);
      b.setAttribute('aria-pressed', String(ativa));
    });

    const cor = roteador.cor;
    const matiz = matizDe(cor);
    const nome = nomeDaCor(cor);
    amostra.style.background = cor;
    if (nomeCor.textContent !== nome) nomeCor.textContent = nome;

    const temTons = !!matiz && matiz.tons.length > 1;
    if (!temTons) tonsAbertos = false;
    if (matiz && temTons && rotuloTons.textContent !== `Tons de ${matiz.nome}`) mostrarTons(matiz);
    fileiraTons.hidden = !tonsAbertos;
    botaoTons.disabled = !temTons;
    botaoTons.textContent = tonsAbertos ? 'Tons ▴' : 'Tons ▾';
    botaoTons.setAttribute('aria-expanded', String(tonsAbertos));
    botaoTons.setAttribute(
      'aria-label',
      temTons ? `Tons de ${matiz!.nome}: mais claro e mais escuro` : `${nome} não tem tons`,
    );

    botaoVoz.textContent = falarCores ? '🔊' : '🔇';
    botaoVoz.setAttribute('aria-pressed', String(falarCores));
    botaoVoz.setAttribute('aria-label', 'Falar o nome das cores');
    botaoVoz.title = falarCores ? 'Falando o nome das cores' : 'Sem falar o nome das cores';

    const marcar = (b: HTMLButtonElement, ativa: boolean) => {
      b.classList.toggle('ativa', ativa);
      b.setAttribute('aria-pressed', String(ativa));
    };
    paleta.querySelectorAll<HTMLButtonElement>('.poco-cor').forEach((b) => {
      marcar(b, b.dataset.matiz === matiz?.nome);
    });
    pocosTons.querySelectorAll<HTMLButtonElement>('.poco-cor').forEach((b) => {
      marcar(b, b.dataset.cor === cor);
    });
    atualizarPartes();
  }
  roteador.aoMudar(atualizarSelecao);
  atualizarSelecao();
}
