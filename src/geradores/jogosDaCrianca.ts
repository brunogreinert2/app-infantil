// As regras puras da tela Jogos (telaJogos.ts): que jogo sai de cada tema,
// onde fica o progresso de cada criança, quando o tema está terminado.
// Separadas da tela para o teste não precisar de navegador.

import { textoDaPronta, type CruzadinhaPronta } from './cruzadinhasProntas';
import { caminhoValido, chegou, entradaCompleta, sudokuCompleto } from './jogo';
import { jogoDoPedido, type JogoNaTela } from './pedido';

export type JogoDaCrianca = 'caca' | 'cruzadinha' | 'sudoku' | 'labirinto';
/** os jogos que se escolhem por TEMA (os 12 das cruzadinhas prontas) */
export type JogoDeTema = 'caca' | 'cruzadinha';
export type NivelDoCaca = 'facil' | 'medio';
export type ModeloDoSudoku = 'sudokuFiguras' | 'sudoku4' | 'sudoku6';
export type TamanhoDoLabirinto = 'facil' | 'medio' | 'dificil';

export const JOGOS_DA_CRIANCA: Record<JogoDaCrianca, { nome: string; emoji: string }> = {
  caca: { nome: 'Caça-palavras', emoji: '🔎' },
  cruzadinha: { nome: 'Cruzadinha', emoji: '✏️' },
  sudoku: { nome: 'Sudoku', emoji: '🔢' },
  labirinto: { nome: 'Labirinto', emoji: '🌀' },
};

export const NOMES_DO_NIVEL: Record<NivelDoCaca, string> = {
  facil: 'Mais fácil',
  medio: 'Mais difícil',
};

export const NOMES_DO_SUDOKU: Record<ModeloDoSudoku, string> = {
  sudokuFiguras: 'Figuras',
  sudoku4: 'Números 4 × 4',
  sudoku6: 'Números 6 × 6',
};

export const NOMES_DO_LABIRINTO: Record<TamanhoDoLabirinto, string> = {
  facil: 'Pequeno',
  medio: 'Médio',
  dificil: 'Grande',
};

/** Quantos sudokus (e labirintos) numerados cada modelo oferece na tela (1, 2, 3…). */
export const SUDOKUS_NA_TELA = 12;

/** O jogo de um tema: a mesma grade, sempre (nada sorteado). */
export function jogoDoTema(tipo: JogoDeTema, pronta: CruzadinhaPronta, nivel: NivelDoCaca = 'facil'): JogoNaTela {
  const alvo =
    tipo === 'cruzadinha'
      ? jogoDoPedido({ tipo: 'cruzadinha', titulo: pronta.tema, itens: textoDaPronta(pronta), respostas: false, pronta: pronta.id })
      : jogoDoPedido({
          tipo: 'caca',
          titulo: pronta.tema,
          palavras: pronta.itens.map((i) => i.palavra).join('\n'),
          nivel,
          semente: 0,
          respostas: false,
        });
  return alvo!;
}

/**
 * O sudoku número `numero` (1, 2, 3…) de um modelo. É o MESMO da folha
 * impressa com a semente `numero - 1`: quem ensina imprime, a criança joga.
 */
export function sudokuDaCrianca(modelo: ModeloDoSudoku, numero: number): JogoNaTela {
  const alvo = jogoDoPedido({ tipo: 'logica', modelo, nivel: 'facil', semente: numero - 1, respostas: false })!;
  return { ...alvo, titulo: `${alvo.titulo} · ${numero}` };
}

/** O labirinto número `numero` de um tamanho: o mesmo da folha com a semente `numero - 1`. */
export function labirintoDaCrianca(tamanho: TamanhoDoLabirinto, numero: number): JogoNaTela {
  const alvo = jogoDoPedido({ tipo: 'logica', modelo: 'labirinto', nivel: tamanho, semente: numero - 1, respostas: false })!;
  return { ...alvo, titulo: `Labirinto ${NOMES_DO_LABIRINTO[tamanho].toLowerCase()} · ${numero}` };
}

/** Onde fica o progresso: por perfil, por jogo, por tema (e por nível, no caça). */
export const chaveDoJogo = (perfil: string | number, tipo: JogoDaCrianca, tema: string, nivel: NivelDoCaca = 'facil'): string =>
  `${perfil}:jogo:${tipo}:${tema}${tipo === 'caca' ? `:${nivel}` : ''}`;

/** O tema já foi terminado? (Lê o que a tela do jogo guardou.) */
export function terminado(alvo: JogoNaTela, guardado: unknown): boolean {
  if (!guardado || typeof guardado !== 'object') return false;
  if (alvo.tipo === 'caca') {
    const achadas = new Set((guardado as { achadas?: string[] }).achadas ?? []);
    return alvo.jogo.achados.length > 0 && alvo.jogo.achados.every((a) => achadas.has(a.letras));
  }
  if (alvo.tipo === 'sudoku') return sudokuCompleto(alvo.jogo, (guardado as { valores?: Record<string, number> }).valores ?? {});
  if (alvo.tipo === 'labirinto') {
    const caminho = (guardado as { caminho?: unknown }).caminho;
    return caminhoValido(alvo.jogo, caminho) && chegou(alvo.jogo, caminho);
  }
  const letras = (guardado as { letras?: Record<string, string> }).letras ?? {};
  return alvo.jogo.entradas.length > 0 && alvo.jogo.entradas.every((e) => entradaCompleta(e, letras));
}
