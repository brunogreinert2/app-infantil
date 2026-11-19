// JOGAR NA TELA (folhas interativas, etapa 2 — 2026-11-18): o caça-palavras e
// a cruzadinha da folha, de verdade, com o dedo.
//
//   caça-palavras  arrastar o dedo sobre a palavra — ou tocar a primeira letra
//                  e depois a última (para quem não consegue arrastar)
//   cruzadinha     tocar a casa e digitar; o cursor anda sozinho; tocar de
//                  novo na mesma casa troca deitada ↔ em pé
//
// Princípio 4 do app: nada trava, nada vira nota. Errar não tem cor nem som de
// erro; acertar ganha cor e a palavra falada; a ajuda e a resposta aparecem
// quando a criança pede. O progresso fica guardado pelo código da folha.

import { armazenamento } from '../armazenamento/armazenamento';
import { soltarConfetes } from '../efeitos/confete';
import { barraTopo, el } from '../telas/comum';
import { falar } from '../tts';
import {
  casasDaEntrada,
  casasDoAchado,
  entradaCompleta,
  entradasDaCasa,
  letraLimpa,
  linhaEntre,
  palavraNaLinha,
  proximaCasa,
  type Casa,
} from './jogo';
import type { JogoNaTela } from './pedido';
import type { CacaPalavras } from './cacaPalavras';
import type { Cruzadinha, Entrada } from './cruzadinha';

/** Cores das palavras achadas: fixas e em ordem (recompensa previsível, nunca sorteada). */
const CORES_ACHADAS = ['#ffd166', '#8ecae6', '#b5e48c', '#f4a261', '#cdb4db', '#a0c4ff', '#ffe5a0', '#99d98c'];

function botaoDoJogo(texto: string, aoClicar: () => void): HTMLButtonElement {
  const b = el('button', 'botao-opcao', texto);
  b.type = 'button';
  b.addEventListener('click', aoClicar);
  return b;
}

const chaveCasa = (c: Casa) => `${c[0]},${c[1]}`;

export async function montarTelaJogo(
  raiz: HTMLElement,
  alvo: JogoNaTela,
  chave: string,
  nav: { voltar: () => void },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-jogo';
  window.scrollTo(0, 0);
  raiz.appendChild(barraTopo({ titulo: `🎮 ${alvo.titulo}`, aoVoltar: nav.voltar, aoTrocarPerfil: nav.voltar }));
  const corpo = el('main', 'jogo-corpo');
  raiz.appendChild(corpo);
  const aviso = el('p', 'jogo-aviso');
  aviso.setAttribute('role', 'status');
  aviso.setAttribute('aria-live', 'polite');
  if (alvo.tipo === 'caca') await montarCaca(corpo, aviso, alvo.jogo, chave);
  else await montarCruzadinha(corpo, aviso, alvo.jogo, chave);
}

// ---------------------------------------------------------------------------
// Caça-palavras
// ---------------------------------------------------------------------------

async function montarCaca(corpo: HTMLElement, aviso: HTMLElement, jogo: CacaPalavras, chave: string): Promise<void> {
  const guardado = (await armazenamento.obter<{ achadas: string[] }>(chave)) ?? { achadas: [] };
  const achadas = new Set(guardado.achadas.filter((p) => jogo.achados.some((a) => a.letras === p)));
  const salvar = () => void armazenamento.definir(chave, { achadas: [...achadas] });

  corpo.appendChild(el('p', 'jogo-instrucao', 'Arraste o dedo sobre a palavra. Ou toque na primeira letra e depois na última.'));
  const grade = el('div', 'jogo-grade jogo-grade-caca');
  grade.style.setProperty('--colunas', String(jogo.colunas));
  grade.setAttribute('role', 'grid');
  grade.setAttribute('aria-label', 'Grade de letras');
  const casas: HTMLElement[][] = [];
  for (let l = 0; l < jogo.linhas; l++) {
    casas.push([]);
    for (let c = 0; c < jogo.colunas; c++) {
      const casa = el('div', 'jogo-casa', jogo.grade[l][c]);
      casa.dataset.l = String(l);
      casa.dataset.c = String(c);
      casa.setAttribute('role', 'gridcell');
      grade.appendChild(casa);
      casas[l].push(casa);
    }
  }
  corpo.appendChild(grade);
  corpo.appendChild(aviso);

  const lista = el('ul', 'jogo-lista');
  const itens = new Map<string, HTMLLIElement>();
  jogo.achados.forEach((a) => {
    const li = el('li', undefined, a.palavra);
    li.addEventListener('click', () => falar(a.palavra));
    lista.appendChild(li);
    itens.set(a.letras, li);
  });
  corpo.appendChild(lista);

  // pinta as palavras achadas (cor fixa pela ordem da lista)
  const desenharAchadas = () => {
    for (const linha of casas) for (const casa of linha) casa.style.background = '';
    jogo.achados.forEach((a, i) => {
      const achou = achadas.has(a.letras);
      itens.get(a.letras)!.classList.toggle('achada', achou);
      if (!achou) return;
      for (const [l, c] of casasDoAchado(a)) casas[l][c].style.background = CORES_ACHADAS[i % CORES_ACHADAS.length];
    });
  };
  desenharAchadas();

  const marcar = (linha: Casa[]) => {
    for (const l of casas) for (const c of l) c.classList.remove('marcando');
    for (const [l, c] of linha) casas[l]?.[c]?.classList.add('marcando');
  };

  const conferir = (linha: Casa[]) => {
    marcar([]);
    const a = palavraNaLinha(jogo, linha);
    if (!a) {
      if (linha.length > 1) aviso.textContent = 'Essa não é uma palavra da lista. Tente outra linha.';
      return;
    }
    if (achadas.has(a.letras)) {
      aviso.textContent = `${a.palavra}: essa você já achou!`;
      return;
    }
    achadas.add(a.letras);
    salvar();
    desenharAchadas();
    falar(a.palavra);
    if (achadas.size === jogo.achados.length) {
      aviso.textContent = 'Você achou todas as palavras!';
      soltarConfetes();
    } else aviso.textContent = `Achou ${a.palavra}! Faltam ${jogo.achados.length - achadas.size}.`;
  };

  // o dedo: arrastar, ou tocar o começo e depois o fim
  const casaNoPonto = (x: number, y: number): Casa | undefined => {
    const alvo = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!alvo?.dataset.l) return undefined;
    return [Number(alvo.dataset.l), Number(alvo.dataset.c)];
  };
  let inicio: Casa | undefined;
  let atual: Casa | undefined;
  let tocado: Casa | undefined; // o "começo" de quem toca em vez de arrastar
  grade.addEventListener('pointerdown', (ev) => {
    const c = casaNoPonto(ev.clientX, ev.clientY);
    if (!c) return;
    ev.preventDefault();
    try {
      grade.setPointerCapture(ev.pointerId); // seguir o dedo mesmo se ele sair da grade
    } catch {
      /* ponteiro que o navegador não reconhece: segue sem captura */
    }
    inicio = c;
    atual = c;
    marcar([c]);
  });
  grade.addEventListener('pointermove', (ev) => {
    if (!inicio) return;
    const c = casaNoPonto(ev.clientX, ev.clientY);
    if (!c || (atual && c[0] === atual[0] && c[1] === atual[1])) return;
    atual = c;
    const linha = linhaEntre(inicio, c);
    if (linha.length) marcar(linha);
  });
  const soltar = () => {
    if (!inicio || !atual) return;
    const arrastou = inicio[0] !== atual[0] || inicio[1] !== atual[1];
    if (arrastou) {
      conferir(linhaEntre(inicio, atual));
      tocado = undefined;
    } else if (!tocado) {
      tocado = inicio;
      marcar([inicio]);
      casas[inicio[0]][inicio[1]].classList.add('marcando');
      aviso.textContent = 'Agora toque na última letra da palavra.';
    } else {
      const linha = linhaEntre(tocado, inicio);
      tocado = undefined;
      if (!linha.length) {
        marcar([]);
        aviso.textContent = 'As letras têm de estar em linha reta. Tente de novo.';
      } else conferir(linha);
    }
    inicio = undefined;
    atual = undefined;
  };
  grade.addEventListener('pointerup', soltar);
  grade.addEventListener('pointercancel', () => {
    inicio = undefined;
    marcar([]);
  });

  const ajudas = el('div', 'folhas-botoes jogo-ajudas');
  ajudas.append(
    botaoDoJogo('💡 Uma dica', () => {
      const falta = jogo.achados.find((a) => !achadas.has(a.letras));
      if (!falta) return;
      const [l, c] = casasDoAchado(falta)[0];
      casas[l][c].classList.add('dica');
      window.setTimeout(() => casas[l][c].classList.remove('dica'), 2500);
      aviso.textContent = `${falta.palavra} começa na letra que está piscando.`;
      falar(falta.palavra);
    }),
    botaoDoJogo('Mostrar todas', () => {
      for (const a of jogo.achados) achadas.add(a.letras);
      salvar();
      desenharAchadas();
      aviso.textContent = 'Aqui estão todas as palavras.';
    }),
    botaoDoJogo('Recomeçar', () => {
      achadas.clear();
      salvar();
      desenharAchadas();
      aviso.textContent = '';
    }),
  );
  corpo.appendChild(ajudas);
}

// ---------------------------------------------------------------------------
// Cruzadinha
// ---------------------------------------------------------------------------

async function montarCruzadinha(corpo: HTMLElement, aviso: HTMLElement, jogo: Cruzadinha, chave: string): Promise<void> {
  const letras: Record<string, string> = (await armazenamento.obter<{ letras: Record<string, string> }>(chave))?.letras ?? {};
  const salvar = () => void armazenamento.definir(chave, { letras });

  const dicaAtual = el('p', 'jogo-dica-atual');
  dicaAtual.setAttribute('aria-live', 'polite');
  corpo.appendChild(dicaAtual);

  const grade = el('div', 'jogo-grade jogo-grade-cruz');
  grade.style.setProperty('--colunas', String(jogo.colunas));
  const numeros = new Map(jogo.entradas.map((e) => [`${e.linha},${e.coluna}`, e.numero]));
  const campos = new Map<string, HTMLInputElement>();
  for (let l = 0; l < jogo.linhas; l++) {
    for (let c = 0; c < jogo.colunas; c++) {
      if (!jogo.grade[l][c]) {
        grade.appendChild(el('div', 'jogo-vazia'));
        continue;
      }
      const casa = el('label', 'jogo-casa jogo-casa-cruz');
      const num = numeros.get(`${l},${c}`);
      if (num) casa.appendChild(el('span', 'jogo-numero', String(num)));
      const campo = el('input');
      campo.maxLength = 2;
      campo.autocapitalize = 'characters';
      campo.autocomplete = 'off';
      campo.spellcheck = false;
      campo.value = letras[`${l},${c}`] ?? '';
      campo.dataset.l = String(l);
      campo.dataset.c = String(c);
      campo.setAttribute('aria-label', `Casa da linha ${l + 1}, coluna ${c + 1}`);
      casa.appendChild(campo);
      grade.appendChild(casa);
      campos.set(`${l},${c}`, campo);
    }
  }
  corpo.appendChild(grade);
  corpo.appendChild(aviso);

  // a lista de dicas: tocar escolhe a palavra
  const listas = el('div', 'jogo-dicas');
  const itens = new Map<Entrada, HTMLLIElement>();
  for (const [direcao, nome] of [
    ['horizontal', 'Deitadas'],
    ['vertical', 'Em pé'],
  ] as const) {
    const bloco = el('div');
    bloco.appendChild(el('h2', 'caa-campo-nome', nome));
    const ul = el('ul', 'jogo-lista');
    for (const e of jogo.entradas.filter((x) => x.direcao === direcao)) {
      const li = el('li', undefined, `${e.numero}. ${e.dica || '(sem dica)'}`);
      li.addEventListener('click', () => escolher(e, casasDaEntrada(e)[0]));
      ul.appendChild(li);
      itens.set(e, li);
    }
    bloco.appendChild(ul);
    listas.appendChild(bloco);
  }
  corpo.appendChild(listas);

  let atual: Entrada | undefined;
  const pintarSelecao = () => {
    for (const campo of campos.values()) campo.parentElement!.classList.remove('na-palavra');
    if (!atual) return;
    for (const c of casasDaEntrada(atual)) campos.get(chaveCasa(c))?.parentElement!.classList.add('na-palavra');
    for (const [e, li] of itens) li.classList.toggle('atual', e === atual);
    dicaAtual.textContent = `${atual.numero} ${atual.direcao === 'horizontal' ? '→' : '↓'} ${atual.dica || '(sem dica)'}`;
  };
  const conferirTudo = () => {
    let completas = 0;
    for (const e of jogo.entradas) {
      const ok = entradaCompleta(e, letras);
      if (ok) completas++;
      itens.get(e)!.classList.toggle('achada', ok);
    }
    for (const [k, campo] of campos) {
      const [l, c] = k.split(',').map(Number) as Casa;
      const certa = entradasDaCasa(jogo, [l, c]).some((e) => entradaCompleta(e, letras));
      campo.parentElement!.classList.toggle('certa', certa);
    }
    return completas;
  };
  const escolher = (e: Entrada, casa: Casa) => {
    atual = e;
    pintarSelecao();
    campos.get(chaveCasa(casa))?.focus();
  };

  for (const [k, campo] of campos) {
    const casa = k.split(',').map(Number) as Casa;
    campo.addEventListener('pointerdown', () => {
      const daqui = entradasDaCasa(jogo, casa);
      // tocar de novo na casa já escolhida troca deitada ↔ em pé
      if (document.activeElement === campo && daqui.length === 2 && atual) {
        atual = daqui.find((e) => e !== atual) ?? atual;
      } else if (!atual || !daqui.includes(atual)) atual = daqui[0];
      pintarSelecao();
    });
    campo.addEventListener('focus', () => {
      if (!atual || !entradasDaCasa(jogo, casa).includes(atual)) atual = entradasDaCasa(jogo, casa)[0];
      pintarSelecao();
      campo.select();
    });
    campo.addEventListener('input', () => {
      const completasAntes = jogo.entradas.filter((e) => entradaCompleta(e, letras)).length;
      const letra = letraLimpa(campo.value);
      campo.value = letra;
      if (letra) letras[k] = letra;
      else delete letras[k];
      salvar();
      const completas = conferirTudo();
      if (atual && letra) {
        const prox = proximaCasa(atual, casa);
        if (prox) campos.get(chaveCasa(prox))?.focus();
      }
      if (atual && entradaCompleta(atual, letras)) falar(atual.palavra);
      // a festa é uma vez, na hora em que a última palavra fecha
      if (completas === jogo.entradas.length && completasAntes < completas) {
        aviso.textContent = 'Cruzadinha completa!';
        soltarConfetes();
      } else if (atual && entradaCompleta(atual, letras)) aviso.textContent = `${atual.palavra}: certinho!`;
      else aviso.textContent = '';
    });
    campo.addEventListener('keydown', (ev) => {
      // apagar numa casa vazia volta uma casa
      if (ev.key === 'Backspace' && !campo.value && atual) {
        const ant = proximaCasa(atual, casa, -1);
        if (ant) {
          ev.preventDefault();
          const outro = campos.get(chaveCasa(ant));
          if (outro) {
            outro.value = '';
            delete letras[chaveCasa(ant)];
            salvar();
            conferirTudo();
            outro.focus();
          }
        }
      }
    });
  }
  conferirTudo();

  const ajudas = el('div', 'folhas-botoes jogo-ajudas');
  ajudas.append(
    botaoDoJogo('💡 Uma letra', () => {
      // a palavra escolhida, se ainda falta; senão, a próxima que falta
      const e = atual && !entradaCompleta(atual, letras) ? atual : jogo.entradas.find((x) => !entradaCompleta(x, letras));
      if (!e) return;
      atual = e;
      const casas = casasDaEntrada(e);
      const k = casas.findIndex((c) => letras[chaveCasa(c)] !== e.letras[casas.indexOf(c)]);
      if (k < 0) return;
      const ch = chaveCasa(casas[k]);
      letras[ch] = e.letras[k];
      campos.get(ch)!.value = e.letras[k];
      salvar();
      conferirTudo();
      pintarSelecao();
      aviso.textContent = `Uma letra de ${e.numero} ${e.direcao === 'horizontal' ? 'deitada' : 'em pé'}.`;
    }),
    botaoDoJogo('Mostrar respostas', () => {
      for (const e of jogo.entradas) {
        casasDaEntrada(e).forEach((c, k) => {
          letras[chaveCasa(c)] = e.letras[k];
          campos.get(chaveCasa(c))!.value = e.letras[k];
        });
      }
      salvar();
      conferirTudo();
      aviso.textContent = 'Aqui estão as respostas.';
    }),
    botaoDoJogo('Recomeçar', () => {
      for (const k of Object.keys(letras)) delete letras[k];
      for (const campo of campos.values()) campo.value = '';
      salvar();
      conferirTudo();
      aviso.textContent = '';
    }),
  );
  corpo.appendChild(ajudas);
  if (jogo.entradas[0]) {
    atual = jogo.entradas[0];
    pintarSelecao();
  }
}
