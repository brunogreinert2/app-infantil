// Parser do Historinhas — agora pelo motor do ecossistema (2026-10-02,
// C:\Claude\parser\proposta.md, passo 5).
//
// ANTES eram três regras de linha (cabeçalho, {{img:id}}, parágrafo), "burro
// de propósito". Funcionava para os livrinhos, mas tudo que não fosse isso
// saía cru: um `>` aparecia escrito, um **negrito** com os asteriscos, e o
// caderno do Davi teve de fugir do parser porque ele despedaçava `#` e `{}`.
// O formato do ecossistema é um só e generoso (NORMAS N7): o Historinhas
// passa a ler o mesmo que o Pedra Angular — citação, wikilink, grego com
// lang, fórmula, caixa de nota, tabela.
//
// O QUE NÃO MUDA, e é o que a criança vê:
//   - os blocos e os NOMES deles: c1.. cabeçalhos, p1.. parágrafos, img1..
//     imagens. O quiz (`ancora: "p3"`) e o "você parou aqui" dependem deles.
//     Bloco novo (citação, lista…) conta como parágrafo, como o parser antigo
//     contava a mesma linha;
//   - o texto puro de cada parágrafo, que o 🔊 lê (linhas juntadas por espaço);
//   - cabeçalho sem teto de profundidade (N10) e {{img:id}} sozinho na linha.
// Prova: os oito livrinhos dão os mesmos blocos, nomes e textos de antes.

import type { Element, ElementContent, Root } from 'hast';
import { VFile } from 'vfile';
import { criarProcessador, liftDeepHeadingMarkers } from './ecossistema/processador';
import type { MetadadosLivro, No } from './tipos';

const processador = criarProcessador();

/** Texto visível de um nó, como o leitor de tela e o 🔊 o ouviriam. */
function textoDe(no: ElementContent | Root): string {
  if (no.type === 'text') return no.value;
  if (no.type === 'element') {
    // a fonte TeX de uma fórmula vai como anotação: não é para ler em voz alta
    if (no.tagName === 'annotation') return '';
  }
  if ('children' in no) return (no.children as ElementContent[]).map(textoDe).join('');
  return '';
}

/** Linhas de um parágrafo juntadas por espaço, como o parser antigo fazia. */
const juntarLinhas = (s: string) => s.replace(/[ \t]*\n[ \t]*/g, ' ').trim();

const RE_CABECALHO = /^h([1-9]\d*)$/;

export function analisar(texto: string, metadados?: Partial<MetadadosLivro>): No[] {
  const arquivo = new VFile({ value: liftDeepHeadingMarkers(texto), data: { meta: metadados ?? {} } });
  const arvore = processador.runSync(processador.parse(arquivo), arquivo) as Root;

  const nos: No[] = [];
  let paragrafos = 0;
  let cabecalhos = 0;
  let imagens = 0;

  for (const filho of arvore.children) {
    if (filho.type !== 'element') continue; // quebras de linha entre blocos
    const el = filho as Element;

    const cab = RE_CABECALHO.exec(el.tagName);
    if (cab) {
      cabecalhos++;
      nos.push({ tipo: 'cabecalho', nivel: Number(cab[1]), texto: juntarLinhas(textoDe(el)), id: `c${cabecalhos}` });
      continue;
    }

    const assetId = el.properties?.dataImg;
    if (el.tagName === 'p' && typeof assetId === 'string') {
      imagens++;
      nos.push({ tipo: 'imagem', assetId, id: `img${imagens}` });
      continue;
    }

    paragrafos++;
    const id = `p${paragrafos}`;
    const textoPuro = juntarLinhas(textoDe(el));
    if (el.tagName === 'p') nos.push({ tipo: 'paragrafo', texto: textoPuro, id, hast: el });
    else nos.push({ tipo: 'bloco', texto: textoPuro, id, hast: el });
  }
  return nos;
}
