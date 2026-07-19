// Quebra-cabeça: fatia qualquer arte de colorir em N peças (grade) usando
// recorte por viewBox — cada peça é um <svg> mostrando só o seu pedaço da
// arte COMPLETA, com as cores que a criança já pintou. Interação por
// toque-para-trocar (tap-swap): mais robusto que arrastar em tablet de
// entrada, e o puzzle de troca é sempre solucionável.

import { armazenamento } from '../armazenamento/armazenamento';
import { derivarContornoPB } from '../canvas/camadaBase';
import { soltarConfetes } from '../efeitos/confete';
import { arquivosAssets } from '../conteudo/catalogo';
import type { Livro } from '../motor/tipos';
import { perfilAtivo } from '../perfis/perfis';
import { barraTopo, el } from './comum';

// tamanhos fixos e previsíveis: [rótulo, colunas, linhas] p/ arte paisagem
const TAMANHOS: Array<[string, number, number]> = [
  ['4 peças', 2, 2],
  ['6 peças', 3, 2],
  ['9 peças', 3, 3],
  ['12 peças', 4, 3],
  ['16 peças', 4, 4],
  ['20 peças', 5, 4],
];

export async function montarTelaQuebraCabeca(
  raiz: HTMLElement,
  livro: Livro,
  assetId: string,
  nav: { perfis: () => void; voltar: () => void },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-quebra';

  const asset = livro.metadados.assets?.find((a) => a.id === assetId);
  const svgFonte = asset?.arquivo_interativo ? arquivosAssets[asset.arquivo_interativo] : undefined;
  if (!svgFonte) {
    raiz.appendChild(el('p', 'aviso-asset', `⚠ asset "${assetId}" sem arquivo interativo`));
    return;
  }

  raiz.appendChild(
    barraTopo({
      titulo: '🧩 ' + livro.metadados.titulo,
      aoVoltar: nav.voltar,
      aoTrocarPerfil: nav.perfis,
      comAjustes: false,
    }),
  );

  // arte final = regiões com as cores salvas da criança + contorno por cima
  const chaveCores = `${perfilAtivo().id}:colorir:${livro.id}:${assetId}`;
  const estado = await armazenamento.obter<{ regioes: Record<string, string> }>(chaveCores);

  const molde = document.createElement('div');
  molde.innerHTML = svgFonte;
  const svgBase = molde.querySelector('svg')!;
  svgBase
    .querySelectorAll<SVGElement>('.colorir-alvo')
    .forEach((r) => r.setAttribute('fill', '#ffffff'));
  for (const [id, cor] of Object.entries(estado?.regioes ?? {})) {
    svgBase.querySelector(`#${CSS.escape(id)}`)?.setAttribute('fill', cor);
  }
  const contorno = document.createElement('div');
  contorno.innerHTML = derivarContornoPB(svgFonte);
  const conteudoArte = svgBase.innerHTML + contorno.querySelector('svg')!.innerHTML;

  const vb = svgBase.viewBox.baseVal;
  const retrato = vb.height > vb.width;

  const corpo = el('div', 'corpo-quebra');
  raiz.appendChild(corpo);

  const escolherTamanho = () => {
    corpo.innerHTML = '';
    corpo.appendChild(el('h2', 'titulo-quebra', 'Quantas peças?'));
    const grade = el('div', 'grade-tamanhos');
    for (const [rotulo, c, l] of TAMANHOS) {
      const botao = el('button', 'botao-grande', rotulo);
      // em arte retrato, gira a grade para as peças ficarem ~quadradas
      botao.addEventListener('click', () =>
        montarTabuleiro(retrato ? Math.min(c, l) : c, retrato ? Math.max(c, l) : l),
      );
      grade.appendChild(botao);
    }
    corpo.appendChild(grade);
  };

  const montarTabuleiro = (colunas: number, linhas: number) => {
    corpo.innerHTML = '';
    const total = colunas * linhas;
    const larguraPeca = vb.width / colunas;
    const alturaPeca = vb.height / linhas;

    // arranjo[i] = qual pedaço da arte está na casa i
    const arranjo = [...Array(total).keys()];
    for (let i = arranjo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arranjo[i], arranjo[j]] = [arranjo[j], arranjo[i]];
    }
    if (arranjo.every((v, i) => v === i)) [arranjo[0], arranjo[1]] = [arranjo[1], arranjo[0]];

    const tabuleiro = el('div', 'grade-quebra');
    tabuleiro.style.gridTemplateColumns = `repeat(${colunas}, 1fr)`;
    tabuleiro.style.aspectRatio = `${vb.width} / ${vb.height}`;
    if (retrato) tabuleiro.style.width = 'min(96vw, 540px)';
    corpo.appendChild(tabuleiro);

    const svgDoPedaco = (pedaco: number) => {
      const x = (pedaco % colunas) * larguraPeca;
      const y = Math.floor(pedaco / colunas) * alturaPeca;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x.toFixed(1)} ${y.toFixed(1)} ${larguraPeca.toFixed(1)} ${alturaPeca.toFixed(1)}" preserveAspectRatio="xMidYMid slice">${conteudoArte}</svg>`;
    };

    let selecionada: HTMLElement | null = null;
    let travado = false;

    const verificarVitoria = () => {
      const pecas = [...tabuleiro.querySelectorAll<HTMLElement>('.peca')];
      if (!pecas.every((p, i) => Number(p.dataset.pedaco) === i)) return;
      travado = true;
      pecas.forEach((p) => p.classList.add('encaixada'));
      soltarConfetes();
      const fim = el('div', 'rodape-livro');
      fim.appendChild(el('p', 'fim-livro', '🎉 Montou! Mandou muito bem!'));
      const denovo = el('button', 'botao-grande', '🧩 Jogar de novo');
      denovo.addEventListener('click', escolherTamanho);
      const voltar = el('button', 'botao-grande botao-terminei', '✓ Pronto!');
      voltar.addEventListener('click', nav.voltar);
      fim.append(denovo, voltar);
      corpo.appendChild(fim);
    };

    arranjo.forEach((pedaco) => {
      const peca = el('button', 'peca');
      peca.dataset.pedaco = String(pedaco);
      peca.innerHTML = svgDoPedaco(pedaco);
      peca.addEventListener('click', () => {
        if (travado) return;
        if (!selecionada) {
          selecionada = peca;
          peca.classList.add('selecionada');
          return;
        }
        if (selecionada === peca) {
          peca.classList.remove('selecionada');
          selecionada = null;
          return;
        }
        // troca os pedaços das duas casas
        const a = selecionada.dataset.pedaco!;
        selecionada.dataset.pedaco = peca.dataset.pedaco!;
        peca.dataset.pedaco = a;
        const html = selecionada.innerHTML;
        selecionada.innerHTML = peca.innerHTML;
        peca.innerHTML = html;
        selecionada.classList.remove('selecionada');
        selecionada = null;
        verificarVitoria();
      });
      tabuleiro.appendChild(peca);
    });

    const trocar = el('button', 'botao-extra', '↩ Escolher outro tamanho');
    trocar.addEventListener('click', escolherTamanho);
    corpo.appendChild(trocar);
  };

  escolherTamanho();
}
