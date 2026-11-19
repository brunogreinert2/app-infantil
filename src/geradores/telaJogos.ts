// JOGOS — a tela da CRIANÇA (barra lateral → 🎮 Jogos), pedido do Bruno em
// 2026-11-19. A oficina de quem ensina fica atrás da trava; aqui não há
// formulário nenhum: escolhe e joga.
//
// Caça-palavras e cruzadinha: os temas das cruzadinhas prontas
// (cruzadinhasProntas.ts) — a mesma lista serve os dois. Sudoku: numerados
// (1 a 12) em três modelos, cada um igual à folha impressa com a mesma
// semente. «Outro» passa para o seguinte, em ordem; o ✓ marca o já terminado
// (recompensa previsível, nunca sorteada). O progresso é de CADA CRIANÇA: a
// cruzadinha do Davi não aparece começada para o Theo.

import { armazenamento } from '../armazenamento/armazenamento';
import { perfilAtivo } from '../perfis/perfis';
import { barraTopo, el } from '../telas/comum';
import { CRUZADINHAS_PRONTAS, proximaPronta, type CruzadinhaPronta } from './cruzadinhasProntas';
import {
  JOGOS_DA_CRIANCA,
  NOMES_DO_NIVEL,
  NOMES_DO_SUDOKU,
  SUDOKUS_NA_TELA,
  chaveDoJogo,
  jogoDoTema,
  sudokuDaCrianca,
  terminado,
  type JogoDaCrianca,
  type JogoDeTema,
  type ModeloDoSudoku,
  type NivelDoCaca,
} from './jogosDaCrianca';
import type { JogoNaTela } from './pedido';
import { montarTelaJogo } from './telaJogo';

export type { JogoDaCrianca } from './jogosDaCrianca';

type Nav = { perfis: () => void; estante: () => void };

/** Uma fileira de escolhas que ficam lembradas (nível do caça, modelo do sudoku). */
function escolhas<T extends string>(nomes: Record<T, string>, atual: T, rotulo: string, aoEscolher: (v: T) => void): HTMLElement {
  const grupo = el('div', 'jogos-niveis');
  grupo.setAttribute('role', 'group');
  grupo.setAttribute('aria-label', rotulo);
  for (const v of Object.keys(nomes) as T[]) {
    const b = el('button', 'botao-opcao', nomes[v]);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(v === atual));
    b.classList.toggle('ativa', v === atual);
    b.addEventListener('click', () => aoEscolher(v));
    grupo.appendChild(b);
  }
  return grupo;
}

/** O botão de um tema ou de um sudoku, com o ✓ quando já foi terminado. */
async function botaoDeEscolha(emoji: string, nome: string, alvo: JogoNaTela, chave: string, abrir: () => void): Promise<HTMLLIElement> {
  const li = el('li');
  const b = el('button', 'jogos-tema');
  b.type = 'button';
  const marca = el('span', 'jogos-tema-emoji', emoji);
  marca.setAttribute('aria-hidden', 'true');
  b.append(marca, el('span', 'jogos-tema-nome', nome));
  if (terminado(alvo, await armazenamento.obter<unknown>(chave))) {
    const feito = el('span', 'jogos-tema-feito', '✓');
    feito.setAttribute('aria-label', 'já terminado');
    b.appendChild(feito);
  }
  b.addEventListener('click', abrir);
  li.appendChild(b);
  return li;
}

export async function montarTelaJogos(raiz: HTMLElement, tipo: JogoDaCrianca, nav: Nav): Promise<void> {
  const { nome, emoji } = JOGOS_DA_CRIANCA[tipo];
  raiz.innerHTML = '';
  raiz.className = 'tela tela-jogos';
  window.scrollTo(0, 0);
  raiz.appendChild(barraTopo({ titulo: `${emoji} ${nome}`, aoVoltar: nav.estante, aoTrocarPerfil: nav.perfis }));
  const corpo = el('main', 'jogos-corpo');
  raiz.appendChild(corpo);
  if (tipo === 'sudoku') await escolherSudoku(raiz, corpo, nav);
  else await escolherTema(raiz, corpo, tipo, nav);
}

async function escolherTema(raiz: HTMLElement, corpo: HTMLElement, tipo: JogoDeTema, nav: Nav): Promise<void> {
  const perfil = perfilAtivo();
  const chaveNivel = `${perfil.id}:jogos:nivelDoCaca`;
  // quem tem 9 ou mais começa no mais difícil; dá para trocar, e fica lembrado
  const nivel: NivelDoCaca =
    (await armazenamento.obter<NivelDoCaca>(chaveNivel)) ?? (/^(9|1\d)/.test(perfil.faixaEtaria) ? 'medio' : 'facil');
  const voltarAqui = () => void montarTelaJogos(raiz, tipo, nav);
  const abrir = (pronta: CruzadinhaPronta): void => {
    void montarTelaJogo(raiz, jogoDoTema(tipo, pronta, nivel), chaveDoJogo(perfil.id, tipo, pronta.id, nivel), {
      voltar: voltarAqui,
      outra: () => abrir(proximaPronta(pronta.id)),
    });
  };

  if (tipo === 'caca') {
    corpo.appendChild(
      escolhas(NOMES_DO_NIVEL, nivel, 'Tamanho do desafio', (n) => void armazenamento.definir(chaveNivel, n).then(voltarAqui)),
    );
  }
  corpo.appendChild(el('p', 'jogos-instrucao', 'Escolha um tema.'));
  const temas = el('ul', 'jogos-temas');
  for (const pronta of CRUZADINHAS_PRONTAS) {
    temas.appendChild(
      await botaoDeEscolha(pronta.emoji, pronta.tema, jogoDoTema(tipo, pronta, nivel), chaveDoJogo(perfil.id, tipo, pronta.id, nivel), () =>
        abrir(pronta),
      ),
    );
  }
  corpo.appendChild(temas);
}

async function escolherSudoku(raiz: HTMLElement, corpo: HTMLElement, nav: Nav): Promise<void> {
  const perfil = perfilAtivo();
  const chaveModelo = `${perfil.id}:jogos:modeloDoSudoku`;
  // até 8 anos começa nas figuras; 9 ou mais, nos números 4 × 4
  const guardado = await armazenamento.obter<ModeloDoSudoku>(chaveModelo);
  const modelo: ModeloDoSudoku =
    guardado && guardado in NOMES_DO_SUDOKU ? guardado : /^(9|1\d)/.test(perfil.faixaEtaria) ? 'sudoku4' : 'sudokuFiguras';
  const voltarAqui = () => void montarTelaJogos(raiz, 'sudoku', nav);
  const chave = (numero: number) => chaveDoJogo(perfil.id, 'sudoku', `${modelo}:${numero}`);
  const abrir = (numero: number): void => {
    void montarTelaJogo(raiz, sudokuDaCrianca(modelo, numero), chave(numero), {
      voltar: voltarAqui,
      outra: () => abrir((numero % SUDOKUS_NA_TELA) + 1),
    });
  };

  corpo.appendChild(escolhas(NOMES_DO_SUDOKU, modelo, 'Tipo de sudoku', (m) => void armazenamento.definir(chaveModelo, m).then(voltarAqui)));
  corpo.appendChild(el('p', 'jogos-instrucao', 'Escolha um sudoku.'));
  const lista = el('ul', 'jogos-temas jogos-numerados');
  for (let numero = 1; numero <= SUDOKUS_NA_TELA; numero++) {
    lista.appendChild(await botaoDeEscolha(String(numero), `Sudoku ${numero}`, sudokuDaCrianca(modelo, numero), chave(numero), () => abrir(numero)));
  }
  corpo.appendChild(lista);
}
