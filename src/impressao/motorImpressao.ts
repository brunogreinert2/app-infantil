// Motor de impressão. Regra da casa (feedback de teste real): SEMPRE
// projetado para A4 — nada de conteúdo quebrando em várias páginas.
//
// imprimirDocumento é o núcleo genérico, usado pelo desenho de colorir
// (A4 paisagem ou retrato) e pelas tabelas e cadernos (tabelas.ts).
//
// COMO IMPRIME (mudou em 2026-11-11). Antes: um iframe de 0×0 e
// `iframe.contentWindow.print()`. No iPhone o botão não fazia nada — o Safari
// do iOS e o app instalado ignoram o print() de um iframe escondido. Agora a
// folha é montada no PRÓPRIO documento, escondida na tela, e na impressão o
// resto do app é que se esconde; aí vale o `window.print()` comum, que abre a
// folha de impressão do iOS (dali: AirPrint ou "Salvar em PDF").
//
// A folha mora num shadow DOM por dois motivos: o CSS dela não vaza para o
// app (tem regra para `svg`, `h1`…), e os ids do desenho não colidem com os
// do desenho que está na tela (máscaras e regiões têm o mesmo id nos dois).
// Só `@page` e `@font-face` não funcionam lá dentro: esses sobem para o
// documento.

import { derivarContornoPB } from '../canvas/camadaBase';
import { desenharTracos, type Traco } from '../canvas/camadaPincel';
import fonteImpressao from '../fontes/opendyslexic-400.woff?url';
import fonteCardo from '../fontes/cardo-regular.woff2?url';
import { appInstaladoNoIos, oferecerFolhas } from './folhaParaCompartilhar';
import { caixaDeVisao, montarFolhaPintada } from './folhaPintada';

const FONTES_IMPRESSAO = `
  @font-face { font-family: 'Historinhas Impresso'; src: url('${fonteImpressao}') format('woff'); }
  @font-face { font-family: 'Cardo'; src: url('${fonteCardo}') format('woff2'); }
`;

// exact: sem isto o navegador "economiza tinta" e a pintura sai desbotada
const COR_FIEL = '-webkit-print-color-adjust: exact; print-color-adjust: exact;';

// O PAPEL DO IPHONE É MENOR DO QUE O CSS PEDE (teste do Bruno, 2026-11-11).
// O iOS ignora o `@page`: nem a margem de 10mm nem a orientação valem — ele
// usa as margens dele, maiores, e a orientação que a pessoa escolher na folha
// de impressão. A ficha de 190×269mm, que no computador ocupa a página
// certinha, no iPhone transbordava para uma segunda página; reduzindo para
// 87% na mão, coube. Então, no iOS, tudo o que tem medida fixa em mm sai a
// 86% (um ponto de folga). No computador nada muda.
export function fatorDoPapel(agente: string, pontosDeToque: number): number {
  const ios = /iPad|iPhone|iPod/.test(agente) || (/Macintosh/.test(agente) && pontosDeToque > 1);
  return ios ? 0.86 : 1;
}

function fatorAqui(): number {
  return typeof navigator === 'undefined'
    ? 1
    : fatorDoPapel(navigator.userAgent, navigator.maxTouchPoints ?? 0);
}

const mm = (medida: number, fator: number) => `${+(medida * fator).toFixed(2)}mm`;

export function cssCadernoA4(fator = fatorAqui()): string {
  return `
  @page { size: A4 portrait; margin: 10mm; }
  :root { --ui-impressao-tinta: #000000; --ui-impressao-papel: #ffffff; }
  html, body { margin: 0; padding: 0; color: var(--ui-impressao-tinta); background: var(--ui-impressao-papel); }
  .folha-a4 { width: ${mm(190, fator)}; height: ${mm(269, fator)}; margin: 0 auto; padding: 0; break-after: page; break-inside: avoid; line-height: 0; ${COR_FIEL} }
  .folha-a4:last-child { break-after: auto; }
  .folha-a4 > svg { display: block; width: ${mm(190, fator)}; height: ${mm(268.6125, fator)}; }
`;
}

// A cena deitada (paisagem) precisa caber TAMBÉM numa folha em pé, porque no
// iPhone a folha vem em pé e só a pessoa pode deitar. Por isso a largura é a
// da página e a altura acompanha (com teto): em pé o desenho sai menor, numa
// página só; deitado, do tamanho de sempre. O pôster em pé tem altura fixa.
export function cssDesenhoA4(retrato: boolean, fator = fatorAqui()): string {
  const desenho = retrato
    ? `height: ${mm(250, fator)}; width: auto; max-width: 100%;`
    : `width: 100%; height: auto; max-height: ${mm(150, fator)};`;
  return `
     @page { size: A4 ${retrato ? 'portrait' : 'landscape'}; margin: 10mm; }
     html, body { margin: 0; padding: 0; }
     body { font-family: 'Historinhas Impresso', 'Cardo'; }
     h1 { font-size: 12pt; text-align: center; margin: 0 0 5mm; color: #000000; }
     .desenho { break-inside: avoid; page-break-inside: avoid; }
     .desenho > svg { display: block; margin: 0 auto; ${desenho} }`;
}

const escaparHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** O que a criança pintou: o mesmo que fica salvo (`<perfil>:colorir:…`). */
export interface Pintura {
  regioes: Record<string, string>;
  tracos: Traco[];
}

export function corpoCadernoA4(
  folhas: Array<{ titulo: string; svg: string }>,
  pintura?: Pintura,
): string {
  return folhas
    .map(
      (f) =>
        `<section class="folha-a4" aria-label="${escaparHtml(f.titulo)}">${desenhoParaPapel(f.svg, pintura)}</section>`,
    )
    .join('');
}

// Traços de pincel e borracha em alta resolução. NÃO é o canvas da tela (que
// tem a resolução do aparelho): os traços estão guardados em 0..1 e são
// redesenhados aqui com a mesma função da tela. 2480px = largura do A4 a 300dpi.
const LARGURA_TRACOS = 2480;

function imagemDosTracos(tracos: Traco[], largura: number, altura: number): string | undefined {
  if (!tracos.length) return undefined;
  const canvas = document.createElement('canvas');
  canvas.width = LARGURA_TRACOS;
  canvas.height = Math.round((LARGURA_TRACOS * altura) / largura);
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  desenharTracos(ctx, canvas.width, canvas.height, tracos);
  return canvas.toDataURL('image/png');
}

// contorno P&B (para pintar no papel) ou, com `pintura`, do jeito que pintou
function desenhoParaPapel(svgFonte: string, pintura?: Pintura): string {
  if (pintura) {
    const caixa = caixaDeVisao(svgFonte);
    const folha =
      caixa &&
      montarFolhaPintada(
        svgFonte,
        pintura.regioes,
        imagemDosTracos(pintura.tracos, caixa.largura, caixa.altura),
      );
    if (folha) return folha;
  }
  return derivarContornoPB(svgFonte);
}

const ID_AREA = 'area-impressao';
const ID_ESTILO = 'estilo-impressao';

// `@page` e `@font-face` saem do CSS da folha e vão para o documento; no que
// fica, `html`, `body` e `:root` viram `:host` (a folha é o shadow DOM).
function separarCss(css: string): { doDocumento: string; daFolha: string } {
  const globais: string[] = [];
  const resto = css.replace(/@(?:page|font-face)\b[^{}]*\{[^{}]*\}/g, (regra) => {
    globais.push(regra);
    return '';
  });
  return {
    doDocumento: globais.join('\n'),
    daFolha: resto.replace(/(^|[\s,}])(?:html|body|:root)(?=\s*[,{])/g, '$1:host'),
  };
}

let limpezaAgendada: number | undefined;
let tituloDoApp: string | undefined;

function limparImpressao(): void {
  document.getElementById(ID_AREA)?.remove();
  document.getElementById(ID_ESTILO)?.remove();
}

export function imprimirDocumento(titulo: string, corpoHtml: string, css: string): void {
  // app instalado no iPhone: lá o print() não faz nada; a folha sai pelo
  // compartilhar do aparelho (ver folhaParaCompartilhar.ts)
  if (appInstaladoNoIos()) {
    void oferecerFolhas(titulo, corpoHtml);
    return;
  }
  limparImpressao();
  const { doDocumento, daFolha } = separarCss(css);

  const estilo = document.createElement('style');
  estilo.id = ID_ESTILO;
  estilo.textContent = `
    ${doDocumento}
    @media screen { #${ID_AREA} { display: none !important; } }
    @media print {
      html, body {
        height: auto !important; min-height: 0 !important; overflow: visible !important;
        margin: 0 !important; padding: 0 !important;
        background: #ffffff !important; color: #000000 !important;
      }
      body > *:not(#${ID_AREA}) { display: none !important; }
      #${ID_AREA} { display: block !important; }
    }`;
  document.head.appendChild(estilo);

  const area = document.createElement('div');
  area.id = ID_AREA;
  area.setAttribute('aria-hidden', 'true'); // na tela não existe; é só papel
  const folha = area.attachShadow({ mode: 'open' });
  folha.innerHTML = `<style>:host { ${COR_FIEL} } ${daFolha}</style>${corpoHtml}`;
  document.body.appendChild(area);

  // o cabeçalho que o navegador põe na página usa o título do documento
  // (guardado uma vez só: numa segunda impressão o título "atual" já é o da
  // folha anterior)
  tituloDoApp ??= document.title;
  document.title = titulo;
  // NÃO limpar no `afterprint`. No iPhone (teste do Bruno, 2026-11-11) o
  // print() volta na hora e o `afterprint` dispara ANTES de a folha de
  // impressão desenhar a prévia: a limpeza tirava a folha e as regras de
  // impressão, e o que saía no papel era a tela do app. A folha é invisível
  // na tela e não atrapalha ninguém: fica até a próxima impressão (o
  // limparImpressao() lá em cima) ou até esta espera longa vencer. A prévia
  // do iOS pode ser redesenhada enquanto a pessoa mexe nas opções, então a
  // espera é generosa e recomeça a cada impressão.
  clearTimeout(limpezaAgendada);
  limpezaAgendada = window.setTimeout(() => {
    if (document.getElementById(ID_AREA) !== area) return; // já veio outra
    if (tituloDoApp !== undefined) document.title = tituloDoApp;
    tituloDoApp = undefined;
    limparImpressao();
  }, 10 * 60_000);

  const imprimir = () => {
    if (!area.isConnected) return;
    window.print();
  };

  // As fontes da folha são outras (OpenDyslexic de impressão, Cardo). Já
  // carregadas: imprime JÁ, ainda dentro do toque — o iOS desconfia de
  // print() chamado muito depois do gesto. Primeira vez: espera carregar,
  // mas nunca mais de 1,5s (imprimir com a fonte errada é melhor que não
  // imprimir).
  const fontes = [`12pt 'Historinhas Impresso'`, `12pt 'Cardo'`].filter((f) =>
    css.includes(f.slice(6, -1)),
  );
  if (fontes.every((f) => document.fonts.check(f))) {
    imprimir();
    return;
  }
  const espera = new Promise<void>((ok) => setTimeout(ok, 1500));
  void Promise.race([Promise.all(fontes.map((f) => document.fonts.load(f))), espera])
    .catch(() => undefined)
    .then(imprimir);
}

/**
 * Imprime um desenho de colorir numa folha A4. Sem `pintura`: só o contorno,
 * para pintar no papel. Com `pintura`: do jeito que a criança pintou.
 */
export function imprimirParaColorir(svgFonte: string, titulo: string, pintura?: Pintura): void {
  if (svgFonte.includes('data-folha-a4="true"')) {
    imprimirDocumento(titulo, corpoCadernoA4([{ titulo, svg: svgFonte }], pintura), cssCadernoA4());
    return;
  }
  // orientação segue a proporção da arte: cena paisagem / pôster retrato
  const caixa = caixaDeVisao(svgFonte);
  const retrato = caixa ? caixa.altura > caixa.largura : false;
  imprimirDocumento(
    titulo,
    `<h1>${escaparHtml(titulo)}</h1><div class="desenho">${desenhoParaPapel(svgFonte, pintura)}</div>`,
    FONTES_IMPRESSAO + cssDesenhoA4(retrato),
  );
}
