// A folha "do jeito que pintei": monta, a partir da MESMA arte-fonte, o
// desenho com as cores da criança para ir ao papel.
//
// É a mesma pilha de três camadas da tela (telaColorir.ts), agora num SVG só:
//   1. a arte com as regiões pintadas;
//   2. os traços de pincel e borracha, como imagem (opcional);
//   3. o contorno preto por cima de tudo.
// Como a pilha é a mesma, o papel sai igual à tela — inclusive as máscaras de
// oclusão das cenas, que a tela já usa com as regiões preenchidas.
//
// Tudo aqui é texto para texto, sem tocar na página: dá para testar sem
// navegador. (Os traços viram imagem em motorImpressao.ts, que precisa de
// canvas.)

const TAG_ALVO = /<([a-zA-Z][\w:-]*)\b([^<>]*\bclass="[^"]*\bcolorir-alvo\b[^"]*"[^<>]*?)(\/?)>/g;

function definirAtributo(atributos: string, nome: string, valor: string): string {
  const padrao = new RegExp(`(^|\\s)${nome}="[^"]*"`);
  return padrao.test(atributos)
    ? atributos.replace(padrao, `$1${nome}="${valor}"`)
    : `${atributos.replace(/\s+$/, '')} ${nome}="${valor}"`;
}

/**
 * Passa por toda região pintável (`class="colorir-alvo"`) e troca os
 * atributos que `mudar` devolver. O id da região nunca é alterado.
 */
export function mudarRegioes(
  svg: string,
  mudar: (id: string) => Record<string, string>,
): string {
  return svg.replace(TAG_ALVO, (_tudo, tag: string, atributos: string, fecha: string) => {
    const id = atributos.match(/(?:^|\s)id="([^"]*)"/)?.[1] ?? '';
    let novos = atributos;
    for (const [nome, valor] of Object.entries(mudar(id))) {
      novos = definirAtributo(novos, nome, valor);
    }
    return `<${tag}${novos}${fecha}>`;
  });
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/** A arte com as cores salvas (`{regioes:{id:'#hex'}}`); o resto fica branco. */
export function aplicarPintura(svg: string, regioes: Record<string, string>): string {
  return mudarRegioes(svg, (id): Record<string, string> => {
    const cor = regioes[id];
    // só hex entra: o valor vem do armazenamento e vai para dentro de um SVG
    return cor && HEX.test(cor) ? { fill: cor } : {};
  });
}

/** Só o contorno preto: nenhuma região preenchida. */
export function contornoPreto(svg: string): string {
  return mudarRegioes(svg, () => ({
    fill: 'none',
    stroke: '#000000',
    'stroke-width': '3',
    'stroke-linejoin': 'round',
  }));
}

export function caixaDeVisao(svg: string): { largura: number; altura: number } | null {
  const vb = svg.match(/<svg\b[^>]*\bviewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
  if (!vb) return null;
  const largura = Number(vb[1]);
  const altura = Number(vb[2]);
  return largura > 0 && altura > 0 ? { largura, altura } : null;
}

// a arte entra como camada: ocupa a folha inteira, sem tamanho próprio
function comoCamada(svg: string, largura: number, altura: number): string {
  const inicio = svg.indexOf('<svg');
  return svg.slice(inicio).replace(/<svg\b([^>]*)>/, (_t, atributos: string) => {
    let a = atributos.replace(/\s(?:width|height|x|y|class|style)="[^"]*"/g, '');
    a = definirAtributo(a, 'x', '0');
    a = definirAtributo(a, 'y', '0');
    a = definirAtributo(a, 'width', String(largura));
    a = definirAtributo(a, 'height', String(altura));
    return `<svg${a}>`;
  });
}

/**
 * O desenho pintado, pronto para o papel. `imagemDosTracos` é um data-URL
 * (PNG transparente) com pincel e borracha, ou nada se a criança só usou o
 * balde. Devolve `null` se a arte não tiver viewBox (aí não há como empilhar).
 */
export function montarFolhaPintada(
  svgFonte: string,
  regioes: Record<string, string>,
  imagemDosTracos?: string,
): string | null {
  const caixa = caixaDeVisao(svgFonte);
  if (!caixa) return null;
  const { largura, altura } = caixa;
  const tracos =
    imagemDosTracos && imagemDosTracos.startsWith('data:image/')
      ? `<image x="0" y="0" width="${largura}" height="${altura}" preserveAspectRatio="none" href="${imagemDosTracos}"/>`
      : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}">` +
    comoCamada(aplicarPintura(svgFonte, regioes), largura, altura) +
    tracos +
    comoCamada(contornoPreto(svgFonte), largura, altura) +
    '</svg>'
  );
}
