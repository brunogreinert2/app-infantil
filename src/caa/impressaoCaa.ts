// A prancha no papel: uma folha A4 por prancha do conjunto, com as figuras
// da professora dentro. Montada em HTML (não em SVG de glifos, como as folhas
// do Ler o Mundo) porque a palavra é da professora — qualquer letra, qualquer
// acento — e a fonte do app desenha todas.
//
// Puro: devolve o HTML e o CSS; quem imprime é motorImpressao.imprimirDocumento.
// Por que o papel importa (Bendinelli, citado pelo Bruno): a prancha só serve
// se sair da sala de recursos — classe comum, recreio, casa, ônibus.

import { CORES_CAA } from './cores';
import { falaDaCasa, type ConjuntoCaa, type PranchaCaa } from './modelo';
import { svgDoPictograma } from './pictogramas';

export interface OpcoesImpressao {
  /** fundo de cada casa pela cor da categoria */
  cores: boolean;
  /** contorno tracejado: casas para recortar (prancha de velcro, chaveiro) */
  recortar: boolean;
  /** encolhe as medidas (o iPhone imprime em papel menor que o CSS pede) */
  fator?: number;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LARGURA = 190; // mm úteis do A4 com margem de 10 mm
const ALTURA_GRADE = 246; // sobra para o título e o rodapé
const FOLGA = 3;
const POR_LETRA = 0.72; // largura de uma maiúscula em negrito, em em (com folga: a fonte do papel varia)

/**
 * Letra e figura de uma casa no papel. A letra cabe na palavra MAIS LONGA
 * (quebra só entre palavras); se o rótulo inteiro não cabe numa linha, ele
 * ocupa duas e a figura encolhe para dar lugar — nada vaza da casa.
 */
export function medidasDaCasa(rotulo: string, lado: number, altura: number): { letra: number; figura: number; linhas: number } {
  const palavras = rotulo.trim().split(/\s+/).filter(Boolean);
  const maior = Math.max(3, ...palavras.map((p) => [...p].length));
  const util = lado * 0.88;
  const letra = Math.min(altura * 0.14, util / (maior * POR_LETRA));
  const linhas = [...rotulo.trim()].length * POR_LETRA * letra > util ? Math.min(palavras.length, 3) : 1;
  const figura = Math.max(0, Math.min(lado - 8, altura - 6 - linhas * letra * 1.12));
  return { letra, figura, linhas };
}

export function medidasDaGrade(prancha: PranchaCaa): { lado: number; altura: number; fileiras: number } {
  const fileiras = Math.max(1, Math.ceil(prancha.casas.length / prancha.colunas));
  const lado = (LARGURA - (prancha.colunas - 1) * FOLGA) / prancha.colunas;
  const altura = Math.min(lado * 1.12, (ALTURA_GRADE - (fileiras - 1) * FOLGA) / fileiras);
  return { lado, altura, fileiras };
}

function folha(conjunto: ConjuntoCaa, prancha: PranchaCaa, op: OpcoesImpressao): string {
  const f = op.fator ?? 1;
  const mm = (n: number) => `${+(n * f).toFixed(2)}mm`;
  const { lado, altura } = medidasDaGrade(prancha);
  const titulos = new Map(conjunto.pranchas.map((p) => [p.id, p.titulo]));

  const casas = prancha.casas
    .map((casa) => {
      const cor = op.cores && casa.rotulo ? CORES_CAA[casa.categoria] : '#ffffff';
      const classes = ['casa', casa.abre ? 'pasta' : '', casa.rotulo ? '' : 'vazia'].filter(Boolean).join(' ');
      let miolo = '';
      if (casa.imagem) miolo = `<img src="${esc(casa.imagem)}" alt="">`;
      else if (casa.pictograma) miolo = svgDoPictograma(casa.pictograma, 6);
      const { letra, figura, linhas } = medidasDaCasa(casa.rotulo, lado, casa.abre ? altura - 4.6 : altura);
      // a aba preta da pasta diz para onde ela leva (no papel não há toque)
      const destino = casa.abre ? `<span class="aba">→ ${esc(titulos.get(casa.abre) ?? '')}</span>` : '';
      return (
        `<div class="${classes}" style="background:${cor}" title="${esc(falaDaCasa(casa))}">${destino}` +
        `<div class="figura" style="width:${mm(figura)};height:${mm(figura)}">${miolo}</div>` +
        `<div class="rotulo" style="font-size:${mm(letra)}${linhas === 1 ? ';white-space:nowrap' : ''}">${esc(casa.rotulo)}</div></div>`
      );
    })
    .join('');

  return (
    `<section class="folha-caa">` +
    `<header><strong>${esc(prancha.titulo)}</strong><span>${esc(conjunto.nome)}</span></header>` +
    `<div class="grade" style="grid-template-columns:repeat(${prancha.colunas},${mm(lado)});grid-auto-rows:${mm(altura)};gap:${mm(FOLGA)}">${casas}</div>` +
    `<footer>Prancha de comunicação. Aponte para dizer; quem conversa lê a palavra em voz alta.</footer>` +
    `</section>`
  );
}

export function htmlDoConjunto(conjunto: ConjuntoCaa, op: OpcoesImpressao): { corpo: string; css: string } {
  const f = op.fator ?? 1;
  const mm = (n: number) => `${+(n * f).toFixed(2)}mm`;
  // a inicial primeiro, as filhas na ordem em que aparecem
  const ordem = [...conjunto.pranchas].sort((a, b) =>
    a.id === conjunto.inicial ? -1 : b.id === conjunto.inicial ? 1 : 0,
  );
  const corpo = ordem.map((p) => folha(conjunto, p, op)).join('');
  const borda = op.recortar ? `${mm(0.5)} dashed #000000` : `${mm(0.6)} solid #000000`;
  const css = `
    @page { size: A4 portrait; margin: 10mm; }
    html, body { margin: 0; padding: 0; background: #ffffff; color: #000000; }
    .folha-caa { width: ${mm(LARGURA)}; margin: 0 auto; break-after: page; page-break-after: always;
      break-inside: avoid; font-family: 'Atkinson Hyperlegible', 'OpenDyslexic', sans-serif; }
    .folha-caa:last-child { break-after: auto; page-break-after: auto; }
    .folha-caa header { display: flex; justify-content: space-between; align-items: baseline;
      height: ${mm(12)}; font-size: ${mm(6)}; border-bottom: ${mm(0.4)} solid #000000; margin-bottom: ${mm(4)}; }
    .folha-caa header span { font-size: ${mm(3.6)}; }
    .grade { display: grid; }
    .casa { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${mm(0.5)};
      border: ${borda}; border-radius: ${mm(3)}; overflow: hidden; break-inside: avoid; color: #000000; }
    .casa.pasta { border-width: ${mm(1)}; border-style: solid; padding-top: ${mm(4.6)}; }
    .aba { position: absolute; left: 0; right: 0; top: 0; height: ${mm(4.6)}; background: #000000; color: #ffffff;
      font-size: ${mm(2.8)}; font-weight: 700; line-height: ${mm(4.6)}; text-align: right; padding-right: ${mm(2)}; white-space: nowrap; overflow: hidden; }
    .casa.vazia { border-style: dashed; }
    .figura { display: flex; align-items: center; justify-content: center; }
    .figura svg, .figura img { width: 100%; height: 100%; object-fit: contain; }
    .rotulo { font-weight: 700; line-height: 1.05; text-align: center; padding: 0 ${mm(1)}; }
    .folha-caa footer { margin-top: ${mm(3)}; font-size: ${mm(3)}; }
  `;
  return { corpo, css };
}
