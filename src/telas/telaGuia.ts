// O guia de quem ensina, dentro do app (atrás da trava dos adultos).
// Usa as mesmas classes da leitura: tamanho, espaço e peso da letra valem aqui.

import { GUIA, TITULO_DO_GUIA } from '../conteudo/guia';
import { imprimirDocumento } from '../impressao/motorImpressao';
import { el } from './comum';
import { tornarRecolhivel } from './secoesRecolhiveis';

const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function montarTelaGuia(raiz: HTMLElement, nav: { voltar: () => void }): void {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-guia';
  window.scrollTo(0, 0);

  const barra = el('header', 'barra-topo');
  const voltar = el('button', 'botao-icone', '←');
  voltar.setAttribute('aria-label', 'Voltar');
  voltar.addEventListener('click', nav.voltar);
  barra.appendChild(voltar);
  barra.appendChild(el('h1', 'titulo-barra', `📖 ${TITULO_DO_GUIA}`));
  raiz.appendChild(barra);

  const extras = el('div', 'barra-extras');
  const imprimir = el('button', 'botao-extra', '🖨️ Imprimir o guia');
  imprimir.addEventListener('click', () => {
    const corpo =
      `<h1>Historinhas — ${escapar(TITULO_DO_GUIA)}</h1>` +
      GUIA.map(
        (s) => `<h2>${escapar(s.titulo)}</h2>` + s.paragrafos.map((p) => `<p>${escapar(p)}</p>`).join(''),
      ).join('') +
      '<p class="rodape">historinhas.app.br</p>';
    imprimirDocumento(
      `Historinhas - ${TITULO_DO_GUIA}`,
      corpo,
      `@page { size: A4 portrait; margin: 18mm; }
       html, body { margin: 0; padding: 0; color: #000000; background: #ffffff; }
       body { font-family: 'Atkinson Hyperlegible', sans-serif; font-size: 12pt; line-height: 1.6; }
       h1 { font-size: 20pt; margin: 0 0 6mm; }
       h2 { font-size: 14pt; margin: 7mm 0 2mm; break-after: avoid; page-break-after: avoid; }
       p { margin: 0 0 3mm; orphans: 2; widows: 2; }
       .rodape { margin-top: 8mm; font-size: 10pt; }`,
    );
  });
  extras.appendChild(imprimir);
  raiz.appendChild(extras);

  const artigo = el('article', 'leitura');
  // O guia abre todo recolhido: a lista de títulos É o sumário. Tocar abre o
  // assunto ali mesmo, e no fim dele há um botão de recolher — sem rolar a
  // página de volta para achar o índice.
  GUIA.forEach((secao, i) => {
    const titulo = el('h2', 'cabecalho', secao.titulo);
    titulo.id = `guia-${i + 1}`;
    titulo.dataset.nivel = '2';
    artigo.appendChild(titulo);
    for (const texto of secao.paragrafos) {
      const bloco = el('div', 'paragrafo paragrafo-guia');
      bloco.appendChild(el('p', undefined, texto));
      artigo.appendChild(bloco);
    }
  });
  raiz.appendChild(artigo);
  tornarRecolhivel(artigo, { fechadas: true });
}
