// Tela de colorir: monta as três camadas (base + pincel + linhas),
// a barra de ferramentas e a persistência por perfil (spec 8.2/8.4).

import { armazenamento } from '../armazenamento/armazenamento';
import { CamadaBase, criarCamadaLinhas } from '../canvas/camadaBase';
import { soltarConfetes } from '../efeitos/confete';
import { CamadaPincel, type Traco } from '../canvas/camadaPincel';
import { MATIZES, matizDe, nomeDaCor, tintaSobre, type Matiz } from '../canvas/cores';
import { RoteadorFerramenta, type Ferramenta } from '../canvas/roteadorFerramenta';
import { instalarZoomPinca } from '../canvas/zoomPinca';
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
}

type Acao = { tipo: 'balde'; regiaoId: string; corAnterior: string } | { tipo: 'traco' };

// As cores (nomes, tons, ordem) moram em ../canvas/cores.ts.
// Toque longo num poço abre os tons — e o botão «Tons» faz o mesmo com um
// toque só, porque toque longo pede coordenação fina e ninguém o descobre.
const TOQUE_LONGO_MS = 450;

export async function montarTelaColorir(
  raiz: HTMLElement,
  livro: Livro,
  assetId: string,
  nav: { perfis: () => void; voltar: () => void },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-pintura';

  const asset = livro.metadados.assets?.find((a) => a.id === assetId);
  const svgFonte = asset?.arquivo_interativo ? arquivosAssets[asset.arquivo_interativo] : undefined;
  if (!svgFonte) {
    raiz.appendChild(el('p', 'aviso-asset', `⚠ asset "${assetId}" sem arquivo interativo`));
    return;
  }

  raiz.appendChild(
    barraTopo({
      titulo: '🎨 ' + livro.metadados.titulo,
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
  criarCamadaLinhas(lente, svgFonte);
  const zoom = instalarZoomPinca(tela, lente, () => pincel.cancelarTracoAtivo());

  // --- estado + persistência ---
  const chave = `${perfilAtivo().id}:colorir:${livro.id}:${assetId}`;
  const estado: EstadoColorir = (await armazenamento.obter<EstadoColorir>(chave)) ?? {
    regioes: {},
    tracos: [],
  };
  base.aplicarEstado(estado.regioes);
  pincel.carregar(estado.tracos);

  const acoes: Acao[] = [];
  let salvarAgendado: number | undefined;
  const salvar = () => {
    clearTimeout(salvarAgendado);
    salvarAgendado = window.setTimeout(() => {
      estado.tracos = pincel.obterTracos();
      armazenamento.definir(chave, estado);
    }, 300);
  };

  base.aoTocarRegiao((regiaoId) => {
    if (roteador.ferramenta !== 'balde') return;
    acoes.push({ tipo: 'balde', regiaoId, corAnterior: base.corDe(regiaoId) });
    base.pintar(regiaoId, roteador.cor);
    estado.regioes[regiaoId] = roteador.cor;
    salvar();
    avisar(`Pintou de ${nomeDaCor(roteador.cor)}`);
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
    } else {
      desfazendo = true;
      pincel.desfazerUltimo();
      desfazendo = false;
    }
    salvar();
  };

  // --- barra de ferramentas ---
  const barra = el('div', 'barra-ferramentas');

  const ferramentas: { id: Ferramenta; rotulo: string; nome: string }[] = [
    { id: 'balde', rotulo: '🪣', nome: 'Balde de tinta' },
    { id: 'pincel', rotulo: '🖌️', nome: 'Pincel' },
    { id: 'borracha', rotulo: '🧽', nome: 'Borracha' },
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

  const verTudo = el('button', 'botao-ferramenta', '🔍');
  verTudo.setAttribute('aria-label', 'Ver o desenho inteiro (tirar o zoom)');
  verTudo.title = 'Dois dedos dão zoom; este botão volta ao normal';
  verTudo.addEventListener('click', () => zoom.reiniciar());
  grupoFerr.appendChild(verTudo);

  const imprimir = el('button', 'botao-ferramenta', '🖨️');
  imprimir.setAttribute('aria-label', 'Imprimir para colorir no papel');
  imprimir.addEventListener('click', () =>
    imprimirParaColorir(svgFonte, livro.metadados.titulo),
  );
  grupoFerr.appendChild(imprimir);
  barra.appendChild(grupoFerr);

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
  }
  roteador.aoMudar(atualizarSelecao);
  atualizarSelecao();
}
