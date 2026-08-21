// Abertura cênica do livro (a "coruja que entrega o pergaminho"):
// se o front matter declara `abertura: <assetId>`, esta tela mostra o
// SVG animado em palco cheio antes da leitura. Um toque em qualquer
// lugar entra no livro. Genérica: qualquer livro ganha a sua só
// declarando o asset — nenhuma linha de código nova por livro.

import { arquivosAssets } from '../conteudo/catalogo';
import type { Livro } from '../motor/tipos';
import { el } from './comum';

export function montarTelaAbertura(
  raiz: HTMLElement,
  livro: Livro,
  aoEntrar: () => void,
  aoVoltar?: () => void,
): void {
  const asset = livro.metadados.assets?.find((a) => a.id === livro.metadados.abertura);
  const svg = asset?.arquivo ? arquivosAssets[asset.arquivo] : undefined;
  if (!svg) {
    aoEntrar();
    return;
  }

  raiz.innerHTML = '';
  raiz.className = 'tela tela-abertura';

  const palco = el('button', 'palco-abertura');
  palco.setAttribute('aria-label', `Abrir o livro ${livro.metadados.titulo}`);

  const arte = el('div', 'arte-abertura');
  arte.innerHTML = svg;
  palco.appendChild(arte);
  palco.appendChild(el('span', 'dica-abertura', '✨ Toque para abrir'));

  palco.addEventListener('click', aoEntrar, { once: true });
  raiz.appendChild(palco);

  /* SAÍDA SEM ENTRAR. A cena inteira era um botão só, e o único caminho para
     fora era atravessar o livro. Quem abriu por engano — ou só quis ver a
     coruja — ficava sem volta. Fica POR CIMA do palco e para o clique antes
     dele: sem o stopPropagation, o toque no ← contaria também como toque no
     palco e abriria o livro. */
  if (aoVoltar) {
    const voltar = el('button', 'voltar-abertura', '←');
    voltar.setAttribute('aria-label', 'Voltar para a estante');
    voltar.addEventListener('click', (e) => {
      e.stopPropagation();
      aoVoltar();
    });
    raiz.appendChild(voltar);
  }
}
