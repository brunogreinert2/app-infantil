// Régua de leitura: escurece a tela e deixa clara só uma faixa, da altura de
// umas duas linhas. A criança rola o texto e lê o que passa pela faixa — o
// mesmo princípio da régua de papel com uma janela recortada, para quem pula
// de linha ou se perde no meio do parágrafo.
//
// A faixa fica PARADA na tela (a um terço da altura) e é o texto que anda:
// no celular o dedo que rola taparia uma faixa que o seguisse. Com mouse ela
// acompanha o ponteiro. Não recebe toque: tudo o que está por baixo continua
// funcionando.

import { armazenamento } from '../armazenamento/armazenamento';
import { perfilAtivo } from '../perfis/perfis';

const chave = () => `${perfilAtivo().id}:reguaLeitura`;

export async function reguaLigada(): Promise<boolean> {
  return (await armazenamento.obter<boolean>(chave())) ?? false;
}

export async function definirRegua(ligada: boolean): Promise<void> {
  await armazenamento.definir(chave(), ligada);
}

/** Altura da faixa: duas linhas e meia do texto, do tamanho que a criança escolheu. */
function alturaDaFaixa(): number {
  const estilo = getComputedStyle(document.documentElement);
  const linha = parseFloat(estilo.getPropertyValue('--reading-entrelinha-px'));
  return Math.round((linha > 0 ? linha : 34) * 2.5);
}

/**
 * Põe (ou tira) a régua dentro de `raiz`. Como mora dentro da tela de
 * leitura, some sozinha quando a criança sai do livro.
 */
export function mostrarRegua(raiz: HTMLElement, ligada: boolean): void {
  raiz.querySelector('.regua-leitura')?.remove();
  if (!ligada) return;

  const regua = document.createElement('div');
  regua.className = 'regua-leitura';
  regua.setAttribute('aria-hidden', 'true'); // é só visual; o leitor de tela não precisa dela
  const cima = document.createElement('div');
  cima.className = 'regua-sombra';
  const baixo = document.createElement('div');
  baixo.className = 'regua-sombra';
  regua.append(cima, baixo);
  raiz.appendChild(regua);

  let centro = window.innerHeight * 0.36;
  const arrumar = () => {
    if (!regua.isConnected) {
      window.removeEventListener('resize', arrumar);
      window.removeEventListener('pointermove', seguirMouse);
      return;
    }
    const meia = alturaDaFaixa() / 2;
    // nunca por baixo da barra do alto nem fora da tela
    const c = Math.min(window.innerHeight - meia - 8, Math.max(90 + meia, centro));
    cima.style.height = `${Math.round(c - meia)}px`;
    baixo.style.top = `${Math.round(c + meia)}px`;
  };
  const seguirMouse = (ev: PointerEvent) => {
    if (ev.pointerType !== 'mouse') return;
    centro = ev.clientY;
    arrumar();
  };
  window.addEventListener('resize', arrumar);
  window.addEventListener('pointermove', seguirMouse);
  arrumar();
}
