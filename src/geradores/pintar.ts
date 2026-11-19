// FAZER NO APP (folhas interativas, etapa 1 — 2026-11-18): qualquer folha
// gerada abre na tela de pintura que os livros já usam — balde, pincel,
// escrever no desenho, zoom — e no quebra-cabeça.
//
// O balde só pinta o que é REGIÃO (`class="colorir-alvo"` com id). As folhas
// geradas foram feitas para o papel e não marcam região nenhuma. Esta função
// as marca: toda forma FECHADA desenhada com contorno e sem tinta — caixa de
// resposta, casa da cruzadinha, cartão, peça do tangram, círculo — vira
// região branca, e o fundo da folha também. As letras (desenhadas em caminhos
// cheios, sem cor própria) e os desenhos dos pictogramas ficam como estão.
//
// Por que isso importa para a camada de linhas: ela é a MESMA folha por cima
// da pintura, e lá as regiões perdem o branco (`fill: none`). Uma forma branca
// que não fosse região taparia o que a criança pintou embaixo.

/** Formas que viram região: retângulo, círculo, elipse e caminho fechado. */
const FORMA = /<(rect|circle|ellipse|path)\b([^>]*?)(\/?)>/g;

const atributo = (atributos: string, nome: string): string | undefined =>
  atributos.match(new RegExp(`\\s${nome}="([^"]*)"`))?.[1];

/** A forma tem tinta própria que não é branca? Então é desenho, não região. */
function podeVirarRegiao(tag: string, atributos: string): boolean {
  if (/\bclass="[^"]*colorir-alvo/.test(atributos)) return false; // já é
  const fill = atributo(atributos, 'fill');
  if (fill === undefined) return false; // herda: letras e desenhos dos pictogramas
  if (!/^(none|#fff|#ffffff|white)$/i.test(fill)) return false;
  if (tag === 'path') {
    const d = atributo(atributos, 'd') ?? '';
    if (!/[zZ]\s*$/.test(d)) return false; // linha aberta não se enche
  }
  // forma com transformação de traço fino (meandro, setas) não é casa de pintar
  if (atributo(atributos, 'stroke') === '#ffffff') return false;
  return true;
}

/**
 * A folha pronta para a tela de pintura. Devolve também quantas regiões ela
 * ganhou: zero quer dizer que só dá para desenhar e escrever, não usar o balde.
 */
export function folhaParaPintar(svg: string): { svg: string; regioes: number } {
  let n = 0;
  const pronto = svg.replace(FORMA, (inteiro, tag: string, atributos: string, fecha: string) => {
    if (!podeVirarRegiao(tag, atributos)) return inteiro;
    n++;
    const semFill = atributos.replace(/\sfill="[^"]*"/, '');
    const comId = /\sid="/.test(semFill) ? semFill : ` id="regiao-f${n}"${semFill}`;
    return `<${tag}${comId} class="colorir-alvo" fill="#ffffff"${fecha}>`;
  });
  // Região repetida (a folha "Para pintar" da sequência leva o desenho do
  // livro, que tem a sua própria `regiao-fundo`, dentro da folha que tem
  // outra): a segunda ganha outro nome — só aqui, para pintar; a folha
  // impressa não muda, e o código dela continua montando a mesma folha.
  const vistos = new Map<string, number>();
  const semRepetir = pronto.replace(/\sid="(regiao-[^"]+)"/g, (inteiro, id: string) => {
    const vezes = (vistos.get(id) ?? 0) + 1;
    vistos.set(id, vezes);
    return vezes === 1 ? inteiro : ` id="${id}-${vezes}"`;
  });
  return { svg: semRepetir, regioes: n };
}

/** Onde guardar a pintura de uma folha: pelo código (mesma folha, mesma pintura). */
export function chaveDaPintura(codigo: string, indice: number, impressao: number): string {
  // sem código (folha com nomes de alunos), a impressão digital do desenho
  return `folhas:pintura:${codigo || `sem-codigo-${impressao}`}:${indice}`;
}
