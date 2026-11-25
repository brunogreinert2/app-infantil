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
import { abasDaEstante, type AbasDaEstante } from '../telas/abasDaEstante';
import { barraTopo, el } from '../telas/comum';
import { CRUZADINHAS_PRONTAS, proximaPronta, type CruzadinhaPronta } from './cruzadinhasProntas';
import {
  JOGOS_DA_CRIANCA,
  NOMES_DO_NIVEL,
  NOMES_DO_SUDOKU,
  NOMES_DO_LABIRINTO,
  SUDOKUS_NA_TELA,
  labirintoDaCrianca,
  contasDaCrianca,
  memoriaDaCrianca,
  NOMES_DO_MODO_DA_MEMORIA,
  NOMES_DO_TAMANHO_DA_MEMORIA,
  type ModoDaMemoria,
  type TamanhoDaMemoria,
  NOMES_DAS_OPERACOES,
  NOMES_DAS_CONTAS_DA_CRIANCA,
  type OperacaoDaCrianca,
  type TamanhoDasContas,
  type TamanhoDoLabirinto,
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

type Nav = { perfis: () => void; estante: () => void; abas?: AbasDaEstante; calculadora?: () => void };

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

export async function montarTelaJogos(raiz: HTMLElement, tipo: JogoDaCrianca | undefined, nav: Nav): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-jogos';
  window.scrollTo(0, 0);
  if (!tipo) {
    // TODOS OS JOGOS (o 🎮 Jogos do alto da estante): um botão grande por jogo
    // com as abas da estante à vista, o ← não faz falta (como na estante)
    raiz.appendChild(barraTopo({ titulo: '🎮 Jogos', aoVoltar: nav.abas ? undefined : nav.estante, aoTrocarPerfil: nav.perfis }));
    if (nav.abas) raiz.appendChild(abasDaEstante('jogos', nav.abas));
    const corpo = el('main', 'jogos-corpo');
    raiz.appendChild(corpo);
    corpo.appendChild(el('p', 'jogos-instrucao', 'Do que vamos brincar?'));
    const lista = el('ul', 'jogos-temas jogos-todos');
    for (const t of Object.keys(JOGOS_DA_CRIANCA) as JogoDaCrianca[]) {
      const li = el('li');
      const b = el('button', 'jogos-tema');
      b.type = 'button';
      const marca = el('span', 'jogos-tema-emoji', JOGOS_DA_CRIANCA[t].emoji);
      marca.setAttribute('aria-hidden', 'true');
      b.append(marca, el('span', 'jogos-tema-nome', JOGOS_DA_CRIANCA[t].nome));
      b.addEventListener('click', () => void montarTelaJogos(raiz, t, nav));
      li.appendChild(b);
      lista.appendChild(li);
    }
    // a calculadora (ideia da Luiza, 2026-11-25): não é jogo, mas mora aqui
    if (nav.calculadora) {
      const li = el('li');
      const b = el('button', 'jogos-tema');
      b.type = 'button';
      const marca = el('span', 'jogos-tema-emoji', '🧮');
      marca.setAttribute('aria-hidden', 'true');
      b.append(marca, el('span', 'jogos-tema-nome', 'Calculadora'));
      b.addEventListener('click', nav.calculadora);
      li.appendChild(b);
      lista.appendChild(li);
    }
    corpo.appendChild(lista);
    return;
  }
  const { nome, emoji } = JOGOS_DA_CRIANCA[tipo];
  // voltar leva à tela de todos os jogos (e de lá, à estante)
  raiz.appendChild(barraTopo({ titulo: `${emoji} ${nome}`, aoVoltar: () => void montarTelaJogos(raiz, undefined, nav), aoTrocarPerfil: nav.perfis }));
  if (nav.abas) raiz.appendChild(abasDaEstante('jogos', nav.abas));
  const corpo = el('main', 'jogos-corpo');
  raiz.appendChild(corpo);
  if (tipo === 'sudoku') await escolherSudoku(raiz, corpo, nav);
  else if (tipo === 'labirinto') await escolherLabirinto(raiz, corpo, nav);
  else if (tipo === 'contas') await escolherContas(raiz, corpo, nav);
  else if (tipo === 'memoria') await escolherMemoria(raiz, corpo, nav);
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

async function escolherLabirinto(raiz: HTMLElement, corpo: HTMLElement, nav: Nav): Promise<void> {
  const perfil = perfilAtivo();
  const chaveTamanho = `${perfil.id}:jogos:tamanhoDoLabirinto`;
  // até 8 anos começa no pequeno; 9 ou mais, no médio
  const guardado = await armazenamento.obter<TamanhoDoLabirinto>(chaveTamanho);
  const tamanho: TamanhoDoLabirinto =
    guardado && guardado in NOMES_DO_LABIRINTO ? guardado : /^(9|1\d)/.test(perfil.faixaEtaria) ? 'medio' : 'facil';
  const voltarAqui = () => void montarTelaJogos(raiz, 'labirinto', nav);
  const chave = (numero: number) => chaveDoJogo(perfil.id, 'labirinto', `${tamanho}:${numero}`);
  const abrir = (numero: number): void => {
    void montarTelaJogo(raiz, labirintoDaCrianca(tamanho, numero), chave(numero), {
      voltar: voltarAqui,
      outra: () => abrir((numero % SUDOKUS_NA_TELA) + 1),
    });
  };

  corpo.appendChild(escolhas(NOMES_DO_LABIRINTO, tamanho, 'Tamanho do labirinto', (t) => void armazenamento.definir(chaveTamanho, t).then(voltarAqui)));
  corpo.appendChild(el('p', 'jogos-instrucao', 'Escolha um labirinto.'));
  const lista = el('ul', 'jogos-temas jogos-numerados');
  for (let numero = 1; numero <= SUDOKUS_NA_TELA; numero++) {
    lista.appendChild(await botaoDeEscolha(String(numero), `Labirinto ${numero}`, labirintoDaCrianca(tamanho, numero), chave(numero), () => abrir(numero)));
  }
  corpo.appendChild(lista);
}

async function escolherContas(raiz: HTMLElement, corpo: HTMLElement, nav: Nav): Promise<void> {
  const perfil = perfilAtivo();
  const chaveOp = `${perfil.id}:jogos:operacao`;
  const chaveTamanho = `${perfil.id}:jogos:tamanhoDasContas`;
  const opGuardada = await armazenamento.obter<OperacaoDaCrianca>(chaveOp);
  const operacao: OperacaoDaCrianca = opGuardada && opGuardada in NOMES_DAS_OPERACOES ? opGuardada : '+';
  // até 8 anos começa nas pequenas; 9 ou mais, nas médias
  const tamGuardado = await armazenamento.obter<TamanhoDasContas>(chaveTamanho);
  const tamanho: TamanhoDasContas =
    tamGuardado && tamGuardado in NOMES_DAS_CONTAS_DA_CRIANCA ? tamGuardado : /^(9|1\d)/.test(perfil.faixaEtaria) ? 'medias' : 'pequenas';
  const voltarAqui = () => void montarTelaJogos(raiz, 'contas', nav);
  const chave = (numero: number) =>
    chaveDoJogo(perfil.id, 'contas', operacao === 'tabuada' ? `tabuada:${numero}` : `${operacao}:${tamanho}:${numero}`);
  const abrir = (numero: number): void => {
    void montarTelaJogo(raiz, contasDaCrianca(operacao, tamanho, numero), chave(numero), {
      voltar: voltarAqui,
      outra: () => abrir((numero % SUDOKUS_NA_TELA) + 1),
    });
  };

  corpo.appendChild(escolhas(NOMES_DAS_OPERACOES, operacao, 'Que conta', (o) => void armazenamento.definir(chaveOp, o).then(voltarAqui)));
  if (operacao !== 'tabuada') {
    corpo.appendChild(
      escolhas(NOMES_DAS_CONTAS_DA_CRIANCA, tamanho, 'Tamanho das contas', (t) => void armazenamento.definir(chaveTamanho, t).then(voltarAqui)),
    );
  }
  corpo.appendChild(el('p', 'jogos-instrucao', operacao === 'tabuada' ? 'Escolha a tabuada.' : 'Escolha uma lista de 10 contas.'));
  const lista = el('ul', 'jogos-temas jogos-numerados');
  for (let numero = 1; numero <= SUDOKUS_NA_TELA; numero++) {
    const nome = operacao === 'tabuada' ? `Tabuada do ${numero}` : `Lista ${numero}`;
    lista.appendChild(await botaoDeEscolha(String(numero), nome, contasDaCrianca(operacao, tamanho, numero), chave(numero), () => abrir(numero)));
  }
  corpo.appendChild(lista);
}

async function escolherMemoria(raiz: HTMLElement, corpo: HTMLElement, nav: Nav): Promise<void> {
  const perfil = perfilAtivo();
  const chaveModo = `${perfil.id}:jogos:modoDaMemoria`;
  const chaveTamanho = `${perfil.id}:jogos:tamanhoDaMemoria`;
  const modoGuardado = await armazenamento.obter<ModoDaMemoria>(chaveModo);
  const modo: ModoDaMemoria = modoGuardado && modoGuardado in NOMES_DO_MODO_DA_MEMORIA ? modoGuardado : 'iguais';
  // até 8 anos começa com 6 pares; 9 ou mais, com 10
  const tamGuardado = await armazenamento.obter<TamanhoDaMemoria>(chaveTamanho);
  const tamanho: TamanhoDaMemoria =
    tamGuardado && tamGuardado in NOMES_DO_TAMANHO_DA_MEMORIA ? tamGuardado : /^(9|1\d)/.test(perfil.faixaEtaria) ? '10' : '6';
  const voltarAqui = () => void montarTelaJogos(raiz, 'memoria', nav);
  const chave = (numero: number) => chaveDoJogo(perfil.id, 'memoria', `${modo}:${tamanho}:${numero}`);
  const abrir = (numero: number): void => {
    void montarTelaJogo(raiz, memoriaDaCrianca(modo, tamanho, numero), chave(numero), {
      voltar: voltarAqui,
      outra: () => abrir((numero % SUDOKUS_NA_TELA) + 1),
    });
  };

  corpo.appendChild(escolhas(NOMES_DO_MODO_DA_MEMORIA, modo, 'Que memória', (m) => void armazenamento.definir(chaveModo, m).then(voltarAqui)));
  corpo.appendChild(
    escolhas(NOMES_DO_TAMANHO_DA_MEMORIA, tamanho, 'Quantos pares', (t) => void armazenamento.definir(chaveTamanho, t).then(voltarAqui)),
  );
  corpo.appendChild(el('p', 'jogos-instrucao', 'Escolha uma memória.'));
  const lista = el('ul', 'jogos-temas jogos-numerados');
  for (let numero = 1; numero <= SUDOKUS_NA_TELA; numero++) {
    lista.appendChild(await botaoDeEscolha(String(numero), `Memória ${numero}`, memoriaDaCrianca(modo, tamanho, numero), chave(numero), () => abrir(numero)));
  }
  corpo.appendChild(lista);
}
