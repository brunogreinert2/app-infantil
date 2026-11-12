// Imprimir quando o `window.print()` não existe.
//
// No iPhone, com o Historinhas INSTALADO na tela inicial, tocar em imprimir
// não fazia nada (teste do Bruno, 2026-11-12): no Safari a folha de impressão
// abre, mas num app instalado o iOS simplesmente ignora o print(). Não há
// erro para apanhar nem jeito de perguntar "funcionou?".
//
// O caminho que o iOS oferece a um app instalado é a folha de COMPARTILHAR.
// Então aqui as folhas viram um PDF de verdade (pdf.ts), montado no próprio
// aparelho, e o PDF é entregue ao compartilhar — de onde vai para o Drive,
// para Arquivos, para o e-mail ou para a impressora. Primeiro foi uma imagem
// PNG por folha; o Bruno lembrou que é pelo PDF que as folhas chegam ao
// computador, que é onde as pessoas imprimem.
//
// São dois toques de propósito: primeiro a imagem é preparada (leva um
// instante), depois aparece um botão — e é o toque NELE que abre o
// compartilhar. O iOS só deixa abrir essa folha dentro de um toque; chamar
// depois de preparar a imagem, longe do toque, seria recusado.

import { montarPdf } from './pdf';

const LADO_MAIOR = 2339; // A4 a 200 pontos por polegada
// 46 folhas do alfabeto cabem; acima disto a memória do celular é quem manda
const MAXIMO_DE_FOLHAS = 60;

export function appInstaladoNoIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && (navigator.maxTouchPoints ?? 0) > 1);
  if (!ios) return false;
  const instalado =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  return instalado;
}

/** Os desenhos de um corpo de impressão: os <svg> de fora (não os aninhados). */
export function desenhosDoCorpo(corpoHtml: string): SVGSVGElement[] {
  const molde = document.createElement('template');
  molde.innerHTML = corpoHtml;
  return [...molde.content.querySelectorAll('svg')].filter(
    (s) => !s.parentElement?.closest('svg'),
  ) as SVGSVGElement[];
}

/** Um <svg> vira imagem de folha inteira, com fundo branco (JPEG: é o que o PDF aceita cru). */
export async function svgParaImagem(
  svg: SVGSVGElement,
): Promise<{ jpeg: Uint8Array; largura: number; altura: number }> {
  const copia = svg.cloneNode(true) as SVGSVGElement;
  const caixa = (copia.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);
  const [lv, av] = caixa.length === 4 && caixa[2] > 0 && caixa[3] > 0 ? [caixa[2], caixa[3]] : [4, 3];
  const largura = Math.round(lv >= av ? LADO_MAIOR : (LADO_MAIOR * lv) / av);
  const altura = Math.round((largura * av) / lv);
  // como imagem, o SVG precisa de tamanho próprio (o Safari desenha vazio sem ele)
  copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copia.setAttribute('width', String(largura));
  copia.setAttribute('height', String(altura));
  copia.removeAttribute('class');
  copia.removeAttribute('style');

  const fonte = new XMLSerializer().serializeToString(copia);
  const url = URL.createObjectURL(new Blob([fonte], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const imagem = new Image();
    imagem.decoding = 'sync';
    await new Promise<void>((ok, falhou) => {
      imagem.onload = () => ok();
      imagem.onerror = () => falhou(new Error('o desenho não virou imagem'));
      imagem.src = url;
    });
    const tela = document.createElement('canvas');
    tela.width = largura;
    tela.height = altura;
    const ctx = tela.getContext('2d');
    if (!ctx) throw new Error('sem canvas');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, largura, altura);
    ctx.drawImage(imagem, 0, 0, largura, altura);
    const blob = await new Promise<Blob>((ok, falhou) =>
      tela.toBlob((b) => (b ? ok(b) : falhou(new Error('a imagem não saiu'))), 'image/jpeg', 0.9),
    );
    // solta a memória do canvas antes da próxima folha (um caderno tem dezenas)
    tela.width = 0;
    tela.height = 0;
    return { jpeg: new Uint8Array(await blob.arrayBuffer()), largura, altura };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const nomeDeArquivo = (titulo: string) =>
  titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'historinhas';

function botao(classe: string, rotulo: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = classe;
  b.textContent = rotulo;
  return b;
}

/**
 * Prepara as folhas como imagens e mostra o botão que as entrega ao
 * compartilhar do aparelho (de onde se imprime ou se salva).
 */
export async function oferecerFolhas(titulo: string, corpoHtml: string): Promise<void> {
  document.querySelector('.dialogo-folha-fundo')?.remove();
  const quemAbriu = document.activeElement as HTMLElement | null;

  const fundo = document.createElement('div');
  fundo.className = 'dialogo-folha-fundo';
  const caixa = document.createElement('div');
  caixa.className = 'dialogo-folha';
  caixa.setAttribute('role', 'dialog');
  caixa.setAttribute('aria-modal', 'true');
  caixa.setAttribute('aria-label', 'Salvar ou imprimir o PDF');
  const aviso = document.createElement('p');
  aviso.setAttribute('role', 'status');
  aviso.textContent = '⏳ Preparando a folha…';
  const fechar = botao('botao-opcao', 'Fechar');
  caixa.append(aviso, fechar);
  fundo.appendChild(caixa);
  document.body.appendChild(fundo);

  const sair = () => {
    fundo.remove();
    if (quemAbriu?.isConnected) quemAbriu.focus();
  };
  fechar.addEventListener('click', sair);
  fundo.addEventListener('click', (ev) => {
    if (ev.target === fundo) sair();
  });
  caixa.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') sair();
    if (ev.key !== 'Tab') return;
    // dois botões no máximo: o foco fica aqui dentro
    const focaveis = [...caixa.querySelectorAll<HTMLElement>('button, a')];
    const i = focaveis.indexOf(document.activeElement as HTMLElement);
    ev.preventDefault();
    focaveis[(i + (ev.shiftKey ? -1 : 1) + focaveis.length) % focaveis.length]?.focus();
  });
  fechar.focus();

  const desenhos = desenhosDoCorpo(corpoHtml);
  if (desenhos.length > MAXIMO_DE_FOLHAS) {
    aviso.textContent =
      `Este caderno tem ${desenhos.length} folhas: é grande demais para sair daqui. ` +
      'Abra historinhas.app.br no Safari e imprima de lá — ou faça uma folha de cada vez.';
    return;
  }

  let arquivos: File[];
  try {
    const paginas = [];
    for (let i = 0; i < desenhos.length; i++) {
      if (desenhos.length > 1) aviso.textContent = `⏳ Preparando a folha ${i + 1} de ${desenhos.length}…`;
      paginas.push(await svgParaImagem(desenhos[i]));
      if (!fundo.isConnected) return; // fechou enquanto preparava
    }
    if (!paginas.length) throw new Error('nenhum desenho');
    const pdf = montarPdf(paginas, titulo);
    arquivos = [
      new File([pdf.buffer as ArrayBuffer], `${nomeDeArquivo(titulo)}.pdf`, { type: 'application/pdf' }),
    ];
  } catch {
    aviso.textContent = 'Não consegui preparar a folha. Abra historinhas.app.br no Safari e imprima de lá.';
    return;
  }
  if (!fundo.isConnected) return; // fechou enquanto preparava

  const podeCompartilhar =
    typeof navigator.share === 'function' &&
    (typeof navigator.canShare !== 'function' || navigator.canShare({ files: arquivos }));

  if (podeCompartilhar) {
    aviso.textContent =
      desenhos.length > 1 ? `O PDF está pronto, com ${desenhos.length} folhas!` : 'O PDF está pronto!';
    const dica = document.createElement('p');
    dica.textContent = 'Na telinha que abrir, escolha para onde ele vai: Arquivos, Drive, e-mail ou Imprimir.';
    const entregar = botao('botao-grande', '📤 Salvar ou imprimir o PDF');
    entregar.addEventListener('click', () => {
      // direto no toque, sem esperar nada antes: é a exigência do iOS
      navigator.share({ files: arquivos, title: titulo }).then(sair, () => {
        /* a pessoa desistiu na telinha: o botão continua aqui */
      });
    });
    caixa.insertBefore(dica, fechar);
    caixa.insertBefore(entregar, fechar);
    entregar.focus();
    return;
  }

  // sem compartilhar: a imagem abre numa aba, e imprime-se de lá
  aviso.textContent = 'O PDF está pronto! Abra e use Compartilhar para guardar ou imprimir.';
  arquivos.forEach((arquivo, i) => {
    const link = document.createElement('a');
    link.className = 'botao-opcao';
    link.href = URL.createObjectURL(arquivo);
    link.target = '_blank';
    link.rel = 'noopener';
    link.download = arquivo.name;
    link.textContent = arquivos.length > 1 ? `📄 Abrir o PDF ${i + 1}` : '📄 Abrir o PDF';
    caixa.insertBefore(link, fechar);
  });
}
