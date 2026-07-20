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
}
