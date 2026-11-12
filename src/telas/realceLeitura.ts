// Realce do que a voz está lendo: enquanto o 🔊 fala, o trecho fica marcado
// na tela, para a criança ligar o som à palavra — e para quem só ouve saber
// onde a leitura está.
//
// A voz fala em pedaços (tts.ts fatia o texto em frases). A cada pedaço:
//   1. acha o bloco da leitura que contém aquele texto;
//   2. marca o bloco (uma barra à esquerda — forma, não só cor);
//   3. se der, marca as palavras exatas, com a API de realce do navegador
//      (CSS Custom Highlight), que pinta um trecho sem mexer no HTML;
//   4. se o bloco saiu da tela, traz de volta.
// Navegador sem essa API fica com a barra no bloco, que já resolve.
//
// Sem animação: o realce pula de um trecho para o outro.

import { ouvirPedacos } from '../tts';

const NOME = 'lendo';
const BLOCOS = '.paragrafo, .cabecalho, .quiz-pergunta, .quiz-explicacao';

type RegistroDeRealces = { set(nome: string, valor: unknown): void; delete(nome: string): void };
const realces = (): RegistroDeRealces | undefined =>
  (globalThis.CSS as unknown as { highlights?: RegistroDeRealces } | undefined)?.highlights;
const CriarRealce = (): (new (...r: Range[]) => unknown) | undefined =>
  (globalThis as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight;

// o texto de um bloco como a criança vê, sem o que está dentro de botões (🔊)
function nosDeTexto(bloco: Element): Text[] {
  const nos: Text[] = [];
  const andar = document.createTreeWalker(bloco, NodeFilter.SHOW_TEXT);
  for (let n = andar.nextNode(); n; n = andar.nextNode()) {
    if (!(n.parentElement?.closest('button'))) nos.push(n as Text);
  }
  return nos;
}

/** Onde `trecho` começa dentro do texto do bloco (-1 se não está). */
export function acharTrecho(textoDoBloco: string, trecho: string): number {
  return trecho ? textoDoBloco.indexOf(trecho) : -1;
}

/** A primeira frase de um pedaço: é o que sobra quando o pedaço atravessa dois blocos. */
export function primeiraFrase(pedaco: string): string {
  return pedaco.split(/(?<=[.!?…:])\s+/)[0] ?? pedaco;
}

function faixa(nos: Text[], inicio: number, tamanho: number): Range | null {
  const r = document.createRange();
  let andado = 0;
  let aberto = false;
  for (const no of nos) {
    const fim = andado + no.data.length;
    if (!aberto && inicio < fim) {
      r.setStart(no, inicio - andado);
      aberto = true;
    }
    if (aberto && inicio + tamanho <= fim) {
      r.setEnd(no, inicio + tamanho - andado);
      return r;
    }
    andado = fim;
  }
  return null;
}

/** Liga o realce numa leitura. Devolve a função que desliga. */
export function ligarRealce(artigo: HTMLElement): () => void {
  let cursor = 0; // a leitura anda para a frente: procurar a partir do último achado

  const limpar = () => {
    realces()?.delete(NOME);
    artigo.querySelectorAll('.lendo-agora').forEach((e) => e.classList.remove('lendo-agora'));
  };

  ouvirPedacos((pedaco) => {
    limpar();
    if (!pedaco || !artigo.isConnected) return;
    const blocos = [...artigo.querySelectorAll<HTMLElement>(BLOCOS)];
    const tentativas = [pedaco, primeiraFrase(pedaco)];
    for (const trecho of tentativas) {
      for (let k = 0; k < blocos.length; k++) {
        const i = (cursor + k) % blocos.length;
        const nos = nosDeTexto(blocos[i]);
        const onde = acharTrecho(nos.map((n) => n.data).join(''), trecho);
        if (onde < 0) continue;
        cursor = i;
        // o parágrafo tem a barra no bloco de fora (.paragrafo); o resto, em si mesmo
        blocos[i].classList.add('lendo-agora');
        const Realce = CriarRealce();
        const r = faixa(nos, onde, trecho.length);
        if (r && Realce && realces()) realces()!.set(NOME, new Realce(r));
        const caixa = blocos[i].getBoundingClientRect();
        if (caixa.top < 90 || caixa.bottom > window.innerHeight - 20) {
          blocos[i].scrollIntoView({ block: 'center', behavior: 'instant' });
        }
        return;
      }
    }
  });

  return () => {
    ouvirPedacos(null);
    limpar();
  };
}
