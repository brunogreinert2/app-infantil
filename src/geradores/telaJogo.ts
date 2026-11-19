// JOGAR NA TELA (folhas interativas, etapa 2 — 2026-11-18): o caça-palavras,
// a cruzadinha e (desde 2026-11-19) o sudoku e o labirinto da folha, de
// verdade, com o dedo.
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
  casaDaAjuda,
  gruposCertos,
  proximaVazia,
  sudokuCompleto,
  valorDaCasa,
  SAIDA,
  andarAte,
  caminhoValido,
  chegou,
  pedacoDaSolucao,
  caixasDaConta,
  contaCerta,
  contaDeitada,
  ordemDasCaixas,
  respostaEmCaixas,
  umAlgarismo,
  valorDasCaixas,
  memoriaCompleta,
  virarCarta,
  type EstadoDaMemoria,
  type Casa,
} from './jogo';
import type { Conta } from './contas';
import { FIGURAS_DO_SUDOKU, type Labirinto, type Sudoku } from './logica';
import { perfilAtivo, temPerfilAtivo } from '../perfis/perfis';
import { face, type CartaDaMemoria } from './jogosDeMesa';
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
  nav: { voltar: () => void; /** o próximo tema pronto (sem voltar ao formulário) */ outra?: () => void },
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
  else if (alvo.tipo === 'sudoku') await montarSudoku(corpo, aviso, alvo.jogo, alvo.figuras, chave);
  else if (alvo.tipo === 'labirinto') await montarLabirinto(corpo, aviso, alvo.jogo, chave);
  else if (alvo.tipo === 'contas') await montarContas(corpo, aviso, alvo.jogo, alvo.tabuada, chave);
  else if (alvo.tipo === 'memoria') await montarMemoria(corpo, aviso, alvo.jogo, alvo.leitura, chave);
  else await montarCruzadinha(corpo, aviso, alvo.jogo, chave);
  if (nav.outra) {
    const rotulo = {
      caca: '➡️ Outro caça-palavras',
      cruzadinha: '➡️ Outra cruzadinha',
      sudoku: '➡️ Outro sudoku',
      labirinto: '➡️ Outro labirinto',
      contas: '➡️ Outras contas',
      memoria: '➡️ Outra memória',
    }[alvo.tipo];
    const outra = botaoDoJogo(rotulo, nav.outra);
    outra.classList.add('jogo-outra');
    corpo.appendChild(outra);
  }
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

// ---------------------------------------------------------------------------
// Sudoku (2026-11-19)
// ---------------------------------------------------------------------------

const NOMES_DAS_FIGURAS: Record<string, string> = { fruta: 'fruta', casa: 'casa', onibus: 'ônibus', livro: 'livro' };

/** A figura do sudoku de figuras como desenho de tela (o mesmo pictograma da folha). */
function desenhoDaFigura(v: number): string {
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">${face({ texto: '', figura: FIGURAS_DO_SUDOKU[v - 1] }, 0, 0, 100, 100, 'figura')}</svg>`;
}
const nomeDoValor = (v: number, figuras: boolean) => (figuras ? (NOMES_DAS_FIGURAS[FIGURAS_DO_SUDOKU[v - 1]] ?? String(v)) : String(v));

async function montarSudoku(corpo: HTMLElement, aviso: HTMLElement, s: Sudoku, figuras: boolean, chave: string): Promise<void> {
  const valores: Record<string, number> = (await armazenamento.obter<{ valores: Record<string, number> }>(chave))?.valores ?? {};
  const salvar = () => void armazenamento.definir(chave, { valores });

  corpo.appendChild(
    el(
      'p',
      'jogo-instrucao',
      figuras
        ? 'Toque numa casa vazia e depois na figura. Cada figura aparece uma vez em cada linha, coluna e quadrado grosso.'
        : `Toque numa casa vazia e depois no número. De 1 a ${s.lado}, uma vez em cada linha, coluna e bloco grosso.`,
    ),
  );
  const grade = el('div', 'jogo-grade jogo-grade-sudoku');
  grade.style.setProperty('--colunas', String(s.lado));
  grade.setAttribute('role', 'grid');
  grade.setAttribute('aria-label', 'Sudoku');
  const casas = new Map<string, HTMLButtonElement>();
  let escolhida: Casa | undefined;

  const desenharCasa = (l: number, c: number) => {
    const b = casas.get(`${l},${c}`)!;
    const v = valorDaCasa(s, valores, l, c);
    if (figuras && v) b.innerHTML = desenhoDaFigura(v);
    else b.textContent = v ? String(v) : '';
    const onde = `linha ${l + 1}, coluna ${c + 1}`;
    b.setAttribute('aria-label', v ? `${nomeDoValor(v, figuras)}, ${onde}${s.pistas[l][c] ? ' (já vem na folha)' : ''}` : `vazia, ${onde}`);
  };
  const marcar = () => {
    for (const [k, b] of casas) b.classList.toggle('escolhida', !!escolhida && k === chaveCasa(escolhida));
  };
  const escolher = (casa: Casa | undefined, focar = true) => {
    escolhida = casa;
    marcar();
    if (casa && focar) casas.get(chaveCasa(casa))?.focus();
  };

  for (let l = 0; l < s.lado; l++) {
    for (let c = 0; c < s.lado; c++) {
      const b = el('button', 'jogo-casa jogo-casa-sudoku');
      b.type = 'button';
      b.setAttribute('role', 'gridcell');
      if (s.pistas[l][c]) b.classList.add('pista');
      // os blocos grossos, como na folha
      if ((c + 1) % s.bloco[1] === 0 && c < s.lado - 1) b.classList.add('fim-bloco-direita');
      if ((l + 1) % s.bloco[0] === 0 && l < s.lado - 1) b.classList.add('fim-bloco-baixo');
      b.addEventListener('click', () => {
        if (s.pistas[l][c]) {
          aviso.textContent = 'Essa já vem pronta. Escolha uma casa vazia.';
          return;
        }
        escolher([l, c]);
      });
      casas.set(`${l},${c}`, b);
      grade.appendChild(b);
    }
  }
  for (let l = 0; l < s.lado; l++) for (let c = 0; c < s.lado; c++) desenharCasa(l, c);
  corpo.appendChild(grade);
  corpo.appendChild(aviso);

  let completoAntes = sudokuCompleto(s, valores);
  const por = (casa: Casa, v: number) => {
    const [l, c] = casa;
    if (s.pistas[l][c]) return;
    if (v) valores[chaveCasa(casa)] = v;
    else delete valores[chaveCasa(casa)];
    desenharCasa(l, c);
    salvar();
    const completo = sudokuCompleto(s, valores);
    if (completo && !completoAntes) {
      // a festa é uma vez, na hora em que a última casa fecha
      aviso.textContent = 'Sudoku completo!';
      soltarConfetes();
    } else if (v) {
      const certos = gruposCertos(s, valores, l, c);
      const nomes = { linha: 'a linha', coluna: 'a coluna', bloco: figuras ? 'o quadrado' : 'o bloco' } as const;
      aviso.textContent = certos.length ? `Fechou ${certos.map((g) => nomes[g]).join(' e ')}!` : '';
    } else aviso.textContent = '';
    completoAntes = completo;
    if (v && !completo) escolher(proximaVazia(s, valores, casa) ?? casa);
  };

  // a fileira de escolha: os números (ou as figuras) e apagar
  const paleta = el('div', 'jogo-paleta');
  paleta.setAttribute('role', 'group');
  paleta.setAttribute('aria-label', figuras ? 'Figuras' : 'Números');
  for (let v = 1; v <= s.lado; v++) {
    const b = el('button', 'botao-opcao jogo-escolha');
    b.type = 'button';
    if (figuras) b.innerHTML = desenhoDaFigura(v);
    else b.textContent = String(v);
    b.setAttribute('aria-label', nomeDoValor(v, figuras));
    b.addEventListener('click', () => {
      if (!escolhida) {
        aviso.textContent = 'Primeiro toque numa casa vazia.';
        return;
      }
      if (figuras) falar(nomeDoValor(v, figuras));
      por(escolhida, v);
    });
    paleta.appendChild(b);
  }
  const apagar = botaoDoJogo('⌫ Apagar', () => {
    if (escolhida) por(escolhida, 0);
  });
  apagar.classList.add('jogo-escolha');
  apagar.setAttribute('aria-label', 'Apagar a casa');
  paleta.appendChild(apagar);
  corpo.appendChild(paleta);

  // no teclado: números, apagar e as setas
  grade.addEventListener('keydown', (ev) => {
    if (!escolhida) return;
    const v = Number(ev.key);
    if (Number.isInteger(v) && v >= 1 && v <= s.lado) {
      ev.preventDefault();
      por(escolhida, v);
      return;
    }
    if (ev.key === 'Backspace' || ev.key === 'Delete') {
      ev.preventDefault();
      por(escolhida, 0);
      return;
    }
    const setas: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const passo = setas[ev.key];
    if (passo) {
      ev.preventDefault();
      const l = Math.min(s.lado - 1, Math.max(0, escolhida[0] + passo[0]));
      const c = Math.min(s.lado - 1, Math.max(0, escolhida[1] + passo[1]));
      escolher([l, c]);
    }
  });

  const ajudas = el('div', 'folhas-botoes jogo-ajudas');
  ajudas.append(
    botaoDoJogo('💡 Uma casa', () => {
      const casa = casaDaAjuda(s, valores);
      if (!casa) return;
      escolher(casa, false);
      por(casa, s.solucao[casa[0]][casa[1]]);
      if (!sudokuCompleto(s, valores)) aviso.textContent = `Uma casa na linha ${casa[0] + 1}, coluna ${casa[1] + 1}.`;
    }),
    botaoDoJogo('Mostrar respostas', () => {
      for (let l = 0; l < s.lado; l++) for (let c = 0; c < s.lado; c++) if (!s.pistas[l][c]) valores[`${l},${c}`] = s.solucao[l][c];
      for (let l = 0; l < s.lado; l++) for (let c = 0; c < s.lado; c++) desenharCasa(l, c);
      salvar();
      completoAntes = true; // a resposta mostrada não ganha festa
      escolher(undefined);
      aviso.textContent = 'Aqui estão as respostas.';
    }),
    botaoDoJogo('Recomeçar', () => {
      for (const k of Object.keys(valores)) delete valores[k];
      for (let l = 0; l < s.lado; l++) for (let c = 0; c < s.lado; c++) desenharCasa(l, c);
      salvar();
      completoAntes = false;
      aviso.textContent = '';
      escolher(proximaVazia(s, valores, [s.lado - 1, s.lado - 1]), false);
    }),
  );
  corpo.appendChild(ajudas);
  // começa na primeira casa vazia, sem roubar o foco da página
  escolher(proximaVazia(s, valores, [s.lado - 1, s.lado - 1]), false);
}

// ---------------------------------------------------------------------------
// Labirinto (2026-11-19)
// ---------------------------------------------------------------------------
//
// O bichinho do perfil anda pelo labirinto: arrastar o dedo pelos corredores
// (ou tocar casa a casa, ou as setas do teclado). Voltar pelo rastro apaga o
// pedaço; a parede só não deixa passar.

const LADO = 10; // cada casa, em unidades do desenho
const NS = 'http://www.w3.org/2000/svg';

function noSvg<K extends keyof SVGElementTagNameMap>(tag: K, atributos: Record<string, string | number>): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(atributos)) e.setAttribute(k, String(v));
  return e;
}

/** As paredes do labirinto como um caminho só (o mesmo traço da folha). */
function paredesDoLabirinto(lab: Labirinto): string {
  let d = '';
  for (let l = 0; l < lab.linhas; l++) {
    for (let c = 0; c < lab.colunas; c++) {
      const x = c * LADO;
      const y = l * LADO;
      const [cima, direita, baixo, esquerda] = lab.paredes[l][c];
      if (cima) d += `M${x} ${y}H${x + LADO}`;
      if (esquerda) d += `M${x} ${y}V${y + LADO}`;
      if (direita) d += `M${x + LADO} ${y}V${y + LADO}`;
      if (baixo && l === lab.linhas - 1) d += `M${x} ${y + LADO}H${x + LADO}`;
    }
  }
  return d;
}

const centro = ([l, c]: Casa): [number, number] => [c * LADO + LADO / 2, l * LADO + LADO / 2];
const pontosDoCaminho = (casas: Casa[]): string =>
  [`${-LADO / 2},${LADO / 2}`, ...casas.map((k) => centro(k).join(','))].join(' ');

async function montarLabirinto(corpo: HTMLElement, aviso: HTMLElement, lab: Labirinto, chave: string): Promise<void> {
  const guardado = (await armazenamento.obter<{ caminho: Casa[] }>(chave))?.caminho;
  let caminho: Casa[] = caminhoValido(lab, guardado) ? guardado : [[0, 0]];
  const salvar = () => void armazenamento.definir(chave, { caminho });
  const avatar = temPerfilAtivo() ? perfilAtivo().avatar : '🙂';

  corpo.appendChild(
    el('p', 'jogo-instrucao', 'Arraste o dedo pelos corredores, da entrada até a estrela. Para voltar, passe por cima do caminho.'),
  );

  // uma casa de folga dos dois lados: a entrada e a estrela ficam fora
  const largura = (lab.colunas + 2) * LADO;
  const altura = lab.linhas * LADO;
  const svg = noSvg('svg', {
    viewBox: `${-LADO} 0 ${largura} ${altura}`,
    class: 'jogo-labirinto',
    role: 'application',
    tabindex: 0,
    'aria-label': 'Labirinto. Arraste o dedo, toque nas casas ou use as setas do teclado.',
  });
  svg.style.setProperty('--proporcao', `${largura} / ${altura}`);
  svg.appendChild(noSvg('rect', { x: 0, y: 0, width: lab.colunas * LADO, height: altura, fill: '#ffffff' }));
  const dica = noSvg('polyline', { fill: 'none', stroke: '#9b9b9b', 'stroke-width': 1.6, 'stroke-dasharray': '2 2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  dica.style.display = 'none';
  const rastro = noSvg('polyline', { fill: 'none', stroke: '#2a9d8f', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.85 });
  svg.append(
    dica,
    rastro,
    noSvg('path', { d: paredesDoLabirinto(lab), fill: 'none', stroke: '#000000', 'stroke-width': 1.3, 'stroke-linecap': 'square' }),
  );
  const [sx, sy] = centro(SAIDA(lab));
  const estrela = noSvg('text', { x: sx + LADO, y: sy, 'font-size': 8, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  estrela.textContent = '⭐';
  const bicho = noSvg('text', { 'font-size': 8, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  bicho.textContent = avatar;
  svg.append(estrela, bicho);

  const moldura = el('div', 'jogo-labirinto-moldura');
  moldura.appendChild(svg);
  corpo.appendChild(moldura);
  corpo.appendChild(aviso);

  let chegouAntes = chegou(lab, caminho);
  const desenhar = () => {
    rastro.setAttribute('points', pontosDoCaminho(caminho));
    const [x, y] = centro(caminho[caminho.length - 1]);
    bicho.setAttribute('x', String(x));
    bicho.setAttribute('y', String(y));
  };
  const mudar = (novo: Casa[]) => {
    if (novo === caminho) return;
    caminho = novo;
    desenhar();
    salvar();
    const agora = chegou(lab, caminho);
    if (agora && !chegouAntes) {
      // a festa é uma vez, na hora em que chega
      aviso.textContent = 'Chegou!';
      soltarConfetes();
    } else if (!agora) aviso.textContent = '';
    chegouAntes = agora;
  };
  desenhar();
  if (chegouAntes) aviso.textContent = 'Chegou!';

  // o dedo: arrastar pelos corredores (ou tocar casa a casa)
  const casaDoPonto = (ev: PointerEvent): Casa | undefined => {
    const r = svg.getBoundingClientRect();
    const escala = r.width / largura;
    const x = (ev.clientX - r.left) / escala - LADO;
    const y = (ev.clientY - r.top) / escala;
    const l = Math.floor(y / LADO);
    const c = Math.floor(x / LADO);
    return l >= 0 && c >= 0 && l < lab.linhas && c < lab.colunas ? [l, c] : undefined;
  };
  let arrastando = false;
  svg.addEventListener('pointerdown', (ev) => {
    arrastando = true;
    try {
      svg.setPointerCapture(ev.pointerId);
    } catch {
      // ponteiro sintético (teste) não tem captura: segue sem ela
    }
    const casa = casaDoPonto(ev);
    if (casa) mudar(andarAte(lab, caminho, casa));
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!arrastando) return;
    const casa = casaDoPonto(ev);
    if (casa) mudar(andarAte(lab, caminho, casa));
  });
  const soltar = () => (arrastando = false);
  svg.addEventListener('pointerup', soltar);
  svg.addEventListener('pointercancel', soltar);

  // o teclado: as setas andam uma casa
  svg.addEventListener('keydown', (ev) => {
    const setas: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const passo = setas[ev.key];
    if (!passo) return;
    ev.preventDefault();
    const ponta = caminho[caminho.length - 1];
    mudar(andarAte(lab, caminho, [ponta[0] + passo[0], ponta[1] + passo[1]]));
  });

  const ajudas = el('div', 'folhas-botoes jogo-ajudas');
  let mostrando = false;
  const mostrar = botaoDoJogo('Mostrar o caminho', () => {
    mostrando = !mostrando;
    dica.setAttribute('points', pontosDoCaminho(lab.solucao as Casa[]));
    dica.style.display = mostrando ? '' : 'none';
    mostrar.textContent = mostrando ? 'Esconder o caminho' : 'Mostrar o caminho';
  });
  ajudas.append(
    botaoDoJogo('💡 Um pedaço', () => {
      mudar(pedacoDaSolucao(lab, caminho, 5));
      if (!chegou(lab, caminho)) aviso.textContent = 'Mais um pedaço do caminho.';
    }),
    mostrar,
    botaoDoJogo('Recomeçar', () => {
      mudar([[0, 0]]);
      aviso.textContent = '';
    }),
  );
  corpo.appendChild(ajudas);
}

// ---------------------------------------------------------------------------
// Contas (2026-11-19)
// ---------------------------------------------------------------------------
//
// Uma conta por vez, armada como no caderno (ou deitada, na divisão e na
// tabuada). A resposta se escreve no teclado de números da tela (ou no do
// computador): na armada, da unidade para a esquerda. A conta certa ganha ✓
// e é falada; a errada só não ganha — sem cor nem som de erro.

const SINAIS: Record<string, string> = { '+': '+', '-': '−', x: '×', '/': '÷' };

async function montarContas(corpo: HTMLElement, aviso: HTMLElement, contas: Conta[], tabuada: boolean, chave: string): Promise<void> {
  type Guardado = { caixas: Record<string, string[]>; atual: number };
  const guardado = (await armazenamento.obter<Guardado>(chave)) ?? { caixas: {}, atual: 0 };
  const deitada = (c: Conta) => contaDeitada(c, tabuada);
  const n = (c: Conta) => caixasDaConta(c, deitada(c));
  // o que foi guardado só vale se couber na conta de agora
  const caixas: string[][] = contas.map((c, i) => {
    const g = guardado.caixas?.[String(i)];
    return Array.isArray(g) && g.length === n(c) ? g.map((d) => (/^[0-9]$/.test(d) ? d : '')) : Array<string>(n(c)).fill('');
  });
  let atual = Math.min(Math.max(0, Number(guardado.atual) || 0), contas.length - 1);
  let caixa = ordemDasCaixas(n(contas[atual]), deitada(contas[atual]))[0];
  const salvar = () =>
    void armazenamento.definir(chave, { caixas: Object.fromEntries(caixas.map((x, i) => [String(i), x])), atual });
  const todasCertas = () => contas.every((c, i) => contaCerta(c, caixas[i]));
  let todasAntes = todasCertas();

  const algumaArmada = contas.some((c) => !deitada(c));
  corpo.appendChild(
    el(
      'p',
      'jogo-instrucao',
      algumaArmada
        ? 'Toque nos números para escrever a resposta. Na conta armada, comece pela unidade, à direita.'
        : 'Toque nos números para escrever a resposta.',
    ),
  );

  // a fila das contas: tocar leva até ela; ✓ nas certas
  const fila = el('div', 'contas-fila');
  fila.setAttribute('role', 'group');
  fila.setAttribute('aria-label', 'As contas');
  const area = el('div', 'contas-area');
  corpo.append(fila, area, aviso);

  const textoDaConta = (c: Conta) => `${c.a} ${SINAIS[c.op]} ${c.b}`;
  const desenharFila = () => {
    fila.innerHTML = '';
    contas.forEach((c, i) => {
      const certa = contaCerta(c, caixas[i]);
      const b = el('button', 'contas-fila-item', certa ? '✓' : String(i + 1));
      b.type = 'button';
      b.classList.toggle('atual', i === atual);
      b.classList.toggle('certa', certa);
      b.setAttribute('aria-label', `Conta ${i + 1}${certa ? ', certa' : ''}`);
      if (i === atual) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', () => irPara(i));
      fila.appendChild(b);
    });
  };

  const caixaEl = (i: number, c: Conta): HTMLButtonElement => {
    const b = el('button', 'contas-caixa', caixas[atual][i]);
    b.type = 'button';
    b.classList.toggle('escolhida', i === caixa);
    b.setAttribute('aria-label', `Caixa ${i + 1} de ${n(c)}${caixas[atual][i] ? `: ${caixas[atual][i]}` : ', vazia'}`);
    b.addEventListener('click', () => {
      caixa = i;
      desenharConta();
    });
    return b;
  };

  const desenharConta = () => {
    const c = contas[atual];
    area.innerHTML = '';
    const certa = contaCerta(c, caixas[atual]);
    if (deitada(c)) {
      const linha = el('div', 'conta-deitada');
      linha.appendChild(el('span', 'conta-texto', `${textoDaConta(c)} =`));
      const respostas = el('span', 'conta-caixas');
      for (let i = 0; i < n(c); i++) respostas.appendChild(caixaEl(i, c));
      linha.appendChild(respostas);
      area.appendChild(linha);
    } else {
      // armada: uma coluna para o sinal e uma por algarismo, alinhadas pela direita
      const largura = Math.max(n(c), String(c.a).length, String(c.b).length);
      const grade = el('div', 'conta-armada');
      grade.style.setProperty('--colunas', String(largura + 1));
      grade.setAttribute('aria-label', `${textoDaConta(c)}, armada`);
      const linhaDe = (sinal: string, numero: string) => {
        grade.appendChild(el('span', 'conta-sinal', sinal));
        const s = numero.padStart(largura, ' ');
        for (const d of s) grade.appendChild(el('span', 'conta-algarismo', d.trim()));
      };
      linhaDe('', String(c.a));
      linhaDe(SINAIS[c.op], String(c.b));
      grade.appendChild(el('span', 'conta-traco'));
      grade.appendChild(el('span', 'conta-sinal', ''));
      for (let k = 0; k < largura - n(c); k++) grade.appendChild(el('span', 'conta-algarismo', ''));
      for (let i = 0; i < n(c); i++) grade.appendChild(caixaEl(i, c));
      area.appendChild(grade);
    }
    if (certa) area.appendChild(el('p', 'conta-certa', '✓ Certinho!'));
    desenharFila();
  };

  const irPara = (i: number) => {
    atual = (i + contas.length) % contas.length;
    caixa = ordemDasCaixas(n(contas[atual]), deitada(contas[atual]))[0];
    aviso.textContent = '';
    salvar();
    desenharConta();
  };

  const depoisDeMudar = (antesCerta: boolean) => {
    salvar();
    const c = contas[atual];
    const certa = contaCerta(c, caixas[atual]);
    const todas = todasCertas();
    if (todas && !todasAntes) {
      // a festa é uma vez, na hora em que a última conta fecha
      aviso.textContent = 'Todas as contas certas!';
      soltarConfetes();
    } else if (certa && !antesCerta) {
      aviso.textContent = `${textoDaConta(c)} = ${c.resultado}. Certinho!`;
      falar(`${c.resultado}`);
    } else if (!certa && valorDasCaixas(caixas[atual]) !== undefined && caixas[atual].filter(Boolean).length >= String(c.resultado).length) {
      // escreveu uma resposta inteira que não fecha: um convite, nunca uma marca
      aviso.textContent = 'Confira de novo, com calma. Se quiser, peça uma ajuda.';
    } else aviso.textContent = '';
    todasAntes = todas;
    desenharConta();
  };

  const escrever = (d: string) => {
    const c = contas[atual];
    const antes = contaCerta(c, caixas[atual]);
    caixas[atual][caixa] = d;
    // a próxima caixa, na ordem de escrever
    const ordem = ordemDasCaixas(n(c), deitada(c));
    const k = ordem.indexOf(caixa);
    if (k >= 0 && k + 1 < ordem.length) caixa = ordem[k + 1];
    depoisDeMudar(antes);
  };
  const apagar = () => {
    const c = contas[atual];
    const antes = contaCerta(c, caixas[atual]);
    if (!caixas[atual][caixa]) {
      // caixa vazia: volta uma e apaga lá
      const ordem = ordemDasCaixas(n(c), deitada(c));
      const k = ordem.indexOf(caixa);
      if (k > 0) caixa = ordem[k - 1];
    }
    caixas[atual][caixa] = '';
    depoisDeMudar(antes);
  };

  // o teclado de números da tela
  const teclado = el('div', 'contas-teclado');
  teclado.setAttribute('role', 'group');
  teclado.setAttribute('aria-label', 'Números');
  for (const d of ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0']) {
    const b = el('button', 'botao-opcao contas-tecla', d);
    b.type = 'button';
    b.addEventListener('click', () => escrever(d));
    teclado.appendChild(b);
  }
  const tApagar = el('button', 'botao-opcao contas-tecla contas-apagar', '⌫');
  tApagar.type = 'button';
  tApagar.setAttribute('aria-label', 'Apagar');
  tApagar.addEventListener('click', apagar);
  teclado.appendChild(tApagar);
  corpo.appendChild(teclado);

  // e o teclado do computador
  corpo.tabIndex = -1;
  corpo.addEventListener('keydown', (ev) => {
    if (/^[0-9]$/.test(ev.key)) {
      ev.preventDefault();
      escrever(ev.key);
    } else if (ev.key === 'Backspace' || ev.key === 'Delete') {
      ev.preventDefault();
      apagar();
    } else if (ev.key === 'ArrowRight' && ev.altKey) irPara(atual + 1);
    else if (ev.key === 'ArrowLeft' && ev.altKey) irPara(atual - 1);
  });

  const passar = el('div', 'folhas-botoes jogo-ajudas');
  passar.append(
    botaoDoJogo('◀ Anterior', () => irPara(atual - 1)),
    botaoDoJogo('Próxima ▶', () => irPara(atual + 1)),
  );
  corpo.appendChild(passar);
  const ajudas = el('div', 'folhas-botoes jogo-ajudas');
  ajudas.append(
    botaoDoJogo('💡 Um algarismo', () => {
      const c = contas[atual];
      const antes = contaCerta(c, caixas[atual]);
      caixas[atual] = umAlgarismo(c, caixas[atual], deitada(c));
      depoisDeMudar(antes);
    }),
    botaoDoJogo('Mostrar a resposta', () => {
      const c = contas[atual];
      const antes = contaCerta(c, caixas[atual]);
      caixas[atual] = respostaEmCaixas(c, n(c));
      depoisDeMudar(antes);
    }),
    botaoDoJogo('Recomeçar', () => {
      for (let i = 0; i < contas.length; i++) caixas[i] = Array<string>(n(contas[i])).fill('');
      todasAntes = false;
      irPara(0);
    }),
  );
  corpo.appendChild(ajudas);
  desenharConta();
  corpo.focus({ preventScroll: true });
}

// ---------------------------------------------------------------------------
// Memória (2026-11-19)
// ---------------------------------------------------------------------------
//
// Toca uma carta, toca outra. O par fica aberto e a palavra é falada; o que
// não é par fica aberto até o próximo toque. Nenhuma conta de tentativas.

async function montarMemoria(corpo: HTMLElement, aviso: HTMLElement, cartas: CartaDaMemoria[], leitura: boolean, chave: string): Promise<void> {
  const guardado = (await armazenamento.obter<{ achados: number[] }>(chave))?.achados ?? [];
  let estado: EstadoDaMemoria = { abertas: [], achados: guardado.filter((p) => cartas.some((c) => c.par === p)) };
  const salvar = () => void armazenamento.definir(chave, { achados: estado.achados });

  corpo.appendChild(
    el(
      'p',
      'jogo-instrucao',
      leitura ? 'Toque em duas cartas. O par é a figura com a sua palavra.' : 'Toque em duas cartas. Ache os pares iguais.',
    ),
  );
  const mesa = el('div', 'memoria-mesa');
  // 4 colunas a partir de 16 cartas; menos que isso, 3 (ou 4 se a conta fechar melhor)
  mesa.style.setProperty('--colunas', String(cartas.length >= 16 || cartas.length % 3 !== 0 ? 4 : 3));
  const botoes: HTMLButtonElement[] = [];
  const desenhoDaCarta = (c: CartaDaMemoria) =>
    `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">${face(c.peca, 0, 0, 100, 100, c.mostrar)}</svg>`;

  const desenhar = () => {
    cartas.forEach((c, i) => {
      const b = botoes[i];
      const achada = estado.achados.includes(c.par);
      const aberta = achada || estado.abertas.includes(i);
      b.classList.toggle('aberta', aberta);
      b.classList.toggle('achada', achada);
      if (aberta && !b.dataset.mostrando) {
        b.innerHTML = desenhoDaCarta(c);
        b.dataset.mostrando = '1';
      } else if (!aberta && b.dataset.mostrando) {
        b.innerHTML = '';
        delete b.dataset.mostrando;
      }
      b.setAttribute('aria-label', aberta ? `Carta ${i + 1}: ${c.peca.texto}${achada ? ', par achado' : ''}` : `Carta ${i + 1}, virada para baixo`);
    });
  };

  cartas.forEach((c, i) => {
    const b = el('button', 'memoria-carta');
    b.type = 'button';
    b.addEventListener('click', () => {
      const antes = estado;
      const r = virarCarta(cartas, estado, i);
      if (r.estado === antes) return;
      estado = r.estado;
      desenhar();
      if (r.achou !== undefined) {
        salvar();
        const palavra = c.peca.texto;
        falar(palavra.toLocaleLowerCase('pt-BR'));
        if (memoriaCompleta(cartas, estado.achados)) {
          // a festa é uma vez, na hora do último par
          aviso.textContent = 'Achou todos os pares!';
          soltarConfetes();
        } else aviso.textContent = `Achou: ${palavra}!`;
      } else if (estado.abertas.length === 1) {
        aviso.textContent = '';
        // na de leitura, ouvir a palavra ajuda a ler
        if (leitura && c.mostrar === 'figura') falar(c.peca.texto.toLocaleLowerCase('pt-BR'));
      }
    });
    botoes.push(b);
    mesa.appendChild(b);
  });
  desenhar();
  corpo.append(mesa, aviso);
  if (memoriaCompleta(cartas, estado.achados)) aviso.textContent = 'Achou todos os pares!';

  const ajudas = el('div', 'folhas-botoes jogo-ajudas');
  ajudas.append(
    botaoDoJogo('💡 Um par', () => {
      // o primeiro par que falta, na ordem da mesa: as duas cartas piscam
      const k = cartas.findIndex((c) => !estado.achados.includes(c.par));
      if (k < 0) return;
      const par = cartas[k].par;
      cartas.forEach((c, i) => {
        if (c.par !== par) return;
        botoes[i].classList.remove('dica');
        void botoes[i].offsetWidth; // reinicia a piscada
        botoes[i].classList.add('dica');
      });
      aviso.textContent = 'Olhe as duas cartas que piscam.';
    }),
    botaoDoJogo('Mostrar todas', () => {
      estado = { abertas: [], achados: [...new Set(cartas.map((c) => c.par))] };
      salvar();
      desenhar();
      aviso.textContent = 'Aqui estão todos os pares.';
    }),
    botaoDoJogo('Recomeçar', () => {
      estado = { abertas: [], achados: [] };
      salvar();
      desenhar();
      aviso.textContent = '';
    }),
  );
  corpo.appendChild(ajudas);
}
