// Tela de colorir: monta as três camadas (base + pincel + linhas),
// a barra de ferramentas e a persistência por perfil (spec 8.2/8.4).

import { armazenamento } from '../armazenamento/armazenamento';
import { CamadaBase, criarCamadaLinhas } from '../canvas/camadaBase';
import { soltarConfetes } from '../efeitos/confete';
import { CamadaPincel, type Traco } from '../canvas/camadaPincel';
import { RoteadorFerramenta, type Ferramenta } from '../canvas/roteadorFerramenta';
import { arquivosAssets } from '../conteudo/catalogo';
import { imprimirParaColorir } from '../impressao/motorImpressao';
import type { Livro } from '../motor/tipos';
import { perfilAtivo } from '../perfis/perfis';
import { barraTopo, el } from './comum';

interface EstadoColorir {
  regioes: Record<string, string>;
  tracos: Traco[];
}

type Acao = { tipo: 'balde'; regiaoId: string; corAnterior: string } | { tipo: 'traco' };

// Branco e preto incluídos de propósito (feedback de teste real):
// nuvem branca, contorno preto — a criança precisa poder ESCOLHER branco,
// não só "deixar sem pintar".
const PALETA = [
  '#e63946', '#f77f00', '#fcbf49', '#f9e547',
  '#80b918', '#2a9d8f', '#219ebc', '#5064eb',
  '#9b5de5', '#f06fb8', '#8d5a3a', '#495057',
  '#ffffff', '#1a1a1a',
];

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
      comAjustes: false,
    }),
  );

  // --- camadas (ordem no DOM = ordem de empilhamento) ---
  const tela = el('div', 'tela-colorir');
  raiz.appendChild(tela);

  const base = new CamadaBase(tela, svgFonte);
  let roteador: RoteadorFerramenta;
  const pincel = new CamadaPincel(tela, () => roteador.estiloPincel());
  roteador = new RoteadorFerramenta(pincel);
  criarCamadaLinhas(tela, svgFonte);

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

  const paleta = el('div', 'paleta');
  for (const cor of PALETA) {
    const b = el('button', 'poco-cor');
    b.style.background = cor;
    b.dataset.cor = cor;
    b.setAttribute('aria-label', `Cor ${cor}`);
    b.addEventListener('click', () => roteador.definirCor(cor));
    paleta.appendChild(b);
  }
  barra.appendChild(paleta);
  barra.appendChild(pronto);
  raiz.appendChild(barra);

  const atualizarSelecao = () => {
    grupoFerr.querySelectorAll<HTMLButtonElement>('[data-ferramenta]').forEach((b) => {
      b.classList.toggle('ativa', b.dataset.ferramenta === roteador.ferramenta);
    });
    paleta.querySelectorAll<HTMLButtonElement>('.poco-cor').forEach((b) => {
      b.classList.toggle('ativa', b.dataset.cor === roteador.cor);
    });
  };
  roteador.aoMudar(atualizarSelecao);
  atualizarSelecao();
}
