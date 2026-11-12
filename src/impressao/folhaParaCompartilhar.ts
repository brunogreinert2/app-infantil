// Imprimir quando o `window.print()` não existe.
//
// No iPhone, com o Historinhas INSTALADO na tela inicial, tocar em imprimir
// não fazia nada (teste do Bruno, 2026-11-12): no Safari a folha de impressão
// abre, mas num app instalado o iOS simplesmente ignora o print(). Não há
// erro para apanhar nem jeito de perguntar "funcionou?".
//
// O caminho que o iOS oferece a um app instalado é a folha de COMPARTILHAR,
// e nela existe "Imprimir" (e "Salvar imagem", AirDrop…) para imagens. Então
// aqui cada folha vira uma imagem PNG e é entregue ao compartilhar.
//
// São dois toques de propósito: primeiro a imagem é preparada (leva um
// instante), depois aparece um botão — e é o toque NELE que abre o
// compartilhar. O iOS só deixa abrir essa folha dentro de um toque; chamar
// depois de preparar a imagem, longe do toque, seria recusado.

const LADO_MAIOR = 2339; // A4 a 200 pontos por polegada
const MAXIMO_DE_FOLHAS = 12;

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

/** Um <svg> vira PNG de folha inteira, com fundo branco. */
export async function svgParaPng(svg: SVGSVGElement): Promise<Blob> {
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
    return await new Promise<Blob>((ok, falhou) =>
      tela.toBlob((b) => (b ? ok(b) : falhou(new Error('a imagem não saiu'))), 'image/png'),
    );
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
  caixa.setAttribute('aria-label', 'Imprimir ou salvar a folha');
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
      'Abra historinhas.app.br no Safari e imprima de lá — ou imprima uma folha de cada vez.';
    return;
  }

  let arquivos: File[];
  try {
    const base = nomeDeArquivo(titulo);
    arquivos = [];
    for (let i = 0; i < desenhos.length; i++) {
      const png = await svgParaPng(desenhos[i]);
      const nome = desenhos.length > 1 ? `${base}-${i + 1}.png` : `${base}.png`;
      arquivos.push(new File([png], nome, { type: 'image/png' }));
    }
    if (!arquivos.length) throw new Error('nenhum desenho');
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
      arquivos.length > 1 ? `As ${arquivos.length} folhas estão prontas!` : 'A folha está pronta!';
    const dica = document.createElement('p');
    dica.textContent = 'Na telinha que abrir, escolha “Imprimir” ou “Salvar imagem”.';
    const entregar = botao('botao-grande', '📤 Imprimir ou salvar');
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
  aviso.textContent = 'A folha está pronta! Abra a imagem e use Compartilhar → Imprimir.';
  arquivos.forEach((arquivo, i) => {
    const link = document.createElement('a');
    link.className = 'botao-opcao';
    link.href = URL.createObjectURL(arquivo);
    link.target = '_blank';
    link.rel = 'noopener';
    link.download = arquivo.name;
    link.textContent = arquivos.length > 1 ? `🖼️ Abrir a folha ${i + 1}` : '🖼️ Abrir a imagem';
    caixa.insertBefore(link, fechar);
  });
}
