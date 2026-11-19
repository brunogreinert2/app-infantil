// As regras puras da tela Jogos (telaJogos.ts): que jogo sai de cada tema,
// onde fica o progresso de cada criança, quando o tema está terminado.
// Separadas da tela para o teste não precisar de navegador.

import { textoDaPronta, type CruzadinhaPronta } from './cruzadinhasProntas';
import { entradaCompleta } from './jogo';
import { jogoDoPedido, type JogoNaTela } from './pedido';

export type JogoDaCrianca = 'caca' | 'cruzadinha';
export type NivelDoCaca = 'facil' | 'medio';

export const JOGOS_DA_CRIANCA: Record<JogoDaCrianca, { nome: string; emoji: string }> = {
  caca: { nome: 'Caça-palavras', emoji: '🔎' },
  cruzadinha: { nome: 'Cruzadinha', emoji: '✏️' },
};

export const NOMES_DO_NIVEL: Record<NivelDoCaca, string> = {
  facil: 'Mais fácil',
  medio: 'Mais difícil',
};

/** O jogo de um tema: a mesma grade, sempre (nada sorteado). */
export function jogoDoTema(tipo: JogoDaCrianca, pronta: CruzadinhaPronta, nivel: NivelDoCaca = 'facil'): JogoNaTela {
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

/** Onde fica o progresso: por perfil, por jogo, por tema (e por nível, no caça). */
export const chaveDoJogo = (perfil: string | number, tipo: JogoDaCrianca, tema: string, nivel: NivelDoCaca): string =>
  `${perfil}:jogo:${tipo}:${tema}${tipo === 'caca' ? `:${nivel}` : ''}`;

/** O tema já foi terminado? (Lê o que a tela do jogo guardou.) */
export function terminado(alvo: JogoNaTela, guardado: unknown): boolean {
  if (!guardado || typeof guardado !== 'object') return false;
  if (alvo.tipo === 'caca') {
    const achadas = new Set((guardado as { achadas?: string[] }).achadas ?? []);
    return alvo.jogo.achados.length > 0 && alvo.jogo.achados.every((a) => achadas.has(a.letras));
  }
  const letras = (guardado as { letras?: Record<string, string> }).letras ?? {};
  return alvo.jogo.entradas.length > 0 && alvo.jogo.entradas.every((e) => entradaCompleta(e, letras));
}
