// CRUZADINHAS PRONTAS (pedido do Bruno, 2026-11-18): quem escreve a palavra e
// a dica é quem monta; a criança sozinha ou monta uma nova, ou joga a do
// exemplo — com a resposta escrita ali do lado ("cola na prova"). Com o
// banco, ela joga sem ver as palavras, e «Outra cruzadinha» passa para a
// próxima, NA ORDEM (nada sorteado: a mesma lista, a mesma sequência).
//
// Vocabulário do dia a dia de 6 a 9 anos, dicas curtas e concretas. Conteúdo
// nosso. Cada tema foi conferido por teste: todas as palavras cabem na grade.

import type { ItemCruzadinha } from './cruzadinha';

export interface CruzadinhaPronta {
  id: string;
  tema: string;
  itens: ItemCruzadinha[];
}

const i = (palavra: string, dica: string): ItemCruzadinha => ({ palavra, dica });

/** SÓ ACRESCENTAR NO FIM: o id de cada uma pode estar guardado num aparelho. */
export const CRUZADINHAS_PRONTAS: CruzadinhaPronta[] = [
  {
    id: 'bichos',
    tema: 'Bichos',
    itens: [
      i('GATO', 'Mia e gosta de leite.'),
      i('CACHORRO', 'Late e abana o rabo.'),
      i('PATO', 'Nada na lagoa e faz quá-quá.'),
      i('VACA', 'Dá leite e faz muuu.'),
      i('LEÃO', 'Tem juba e é chamado de rei.'),
      i('COELHO', 'Tem orelhas compridas e pula.'),
      i('PEIXE', 'Vive na água e tem escamas.'),
      i('CAVALO', 'Corre rápido e tem crina.'),
    ],
  },
  {
    id: 'frutas',
    tema: 'Frutas',
    itens: [
      i('BANANA', 'Amarela, o macaco adora.'),
      i('MAÇÃ', 'Vermelha e redonda, boa de morder.'),
      i('UVA', 'Pequena, vem em cacho.'),
      i('LARANJA', 'Dá suco e tem gomos.'),
      i('MELANCIA', 'Verde por fora e vermelha por dentro.'),
      i('MORANGO', 'Vermelho, cheio de pontinhos.'),
      i('ABACAXI', 'Tem coroa e casca que espeta.'),
      i('LIMÃO', 'Verde e bem azedinho.'),
    ],
  },
  {
    id: 'corpo',
    tema: 'O corpo',
    itens: [
      i('MÃO', 'Tem cinco dedos.'),
      i('OLHO', 'Com ele a gente vê.'),
      i('NARIZ', 'Com ele a gente sente o cheiro.'),
      i('BOCA', 'Com ela a gente come e fala.'),
      i('ORELHA', 'Com ela a gente ouve.'),
      i('JOELHO', 'Dobra no meio da perna.'),
      i('CABEÇA', 'Fica em cima do pescoço.'),
      i('BARRIGA', 'Ronca quando dá fome.'),
    ],
  },
  {
    id: 'casa',
    tema: 'A casa',
    itens: [
      i('CAMA', 'Onde a gente dorme.'),
      i('MESA', 'Onde a gente come.'),
      i('CADEIRA', 'Onde a gente senta.'),
      i('PORTA', 'Abre para a gente entrar.'),
      i('JANELA', 'Deixa a luz e o vento entrarem.'),
      i('SOFÁ', 'Banco macio da sala.'),
      i('TELHADO', 'Cobre a casa lá em cima.'),
      i('COZINHA', 'Onde se faz a comida.'),
    ],
  },
  {
    id: 'escola',
    tema: 'A escola',
    itens: [
      i('CADERNO', 'Onde a gente escreve na aula.'),
      i('LÁPIS', 'Escreve e pode ser apagado.'),
      i('RECREIO', 'Hora de brincar e lanchar.'),
      i('MERENDA', 'A comida da escola.'),
      i('PROFESSORA', 'Quem ensina a turma.'),
      i('BORRACHA', 'Apaga o que o lápis escreveu.'),
      i('MOCHILA', 'Leva o material nas costas.'),
      i('LIVRO', 'Tem páginas e histórias.'),
    ],
  },
  {
    id: 'transporte',
    tema: 'Transporte',
    itens: [
      i('ÔNIBUS', 'Leva muita gente pela cidade.'),
      i('CARRO', 'Tem quatro rodas e volante.'),
      i('BICICLETA', 'Tem duas rodas e pedal.'),
      i('AVIÃO', 'Voa lá no céu.'),
      i('BARCO', 'Anda na água.'),
      i('TREM', 'Anda nos trilhos.'),
      i('MOTO', 'Tem duas rodas e motor.'),
      i('CAMINHÃO', 'Leva carga pesada na estrada.'),
    ],
  },
  {
    id: 'natureza',
    tema: 'Natureza',
    itens: [
      i('SOL', 'Brilha e esquenta de dia.'),
      i('LUA', 'Aparece no céu à noite.'),
      i('CHUVA', 'Água que cai das nuvens.'),
      i('ÁRVORE', 'Tem tronco, galhos e folhas.'),
      i('FLOR', 'Tem pétalas e perfume.'),
      i('RIO', 'Água que corre até o mar.'),
      i('NUVEM', 'Branca, flutua no céu.'),
      i('ESTRELA', 'Pisca no céu à noite.'),
    ],
  },
  {
    id: 'cores',
    tema: 'Cores',
    itens: [
      i('AZUL', 'A cor do céu sem nuvens.'),
      i('VERDE', 'A cor da grama.'),
      i('AMARELO', 'A cor do sol nos desenhos.'),
      i('VERMELHO', 'A cor do morango.'),
      i('BRANCO', 'A cor da nuvem.'),
      i('PRETO', 'A cor da noite sem lua.'),
      i('ROSA', 'A cor do algodão-doce.'),
      i('MARROM', 'A cor do chocolate.'),
    ],
  },
  {
    id: 'profissoes',
    tema: 'Profissões',
    itens: [
      i('MÉDICO', 'Cuida de quem está doente.'),
      i('BOMBEIRO', 'Apaga o fogo.'),
      i('PADEIRO', 'Faz o pão.'),
      i('MOTORISTA', 'Dirige o ônibus.'),
      i('DENTISTA', 'Cuida dos dentes.'),
      i('CARTEIRO', 'Entrega as cartas.'),
      i('COZINHEIRO', 'Faz a comida do restaurante.'),
      i('AGRICULTOR', 'Planta e colhe na roça.'),
    ],
  },
  {
    id: 'comidas',
    tema: 'Comidas',
    itens: [
      i('ARROZ', 'Branquinho, vai com o feijão.'),
      i('FEIJÃO', 'Preto ou marrom, vai com o arroz.'),
      i('PÃO', 'Sai quentinho da padaria.'),
      i('LEITE', 'Branco, vem da vaca.'),
      i('OVO', 'A galinha bota.'),
      i('SOPA', 'Comida quente de tomar de colher.'),
      i('BOLO', 'Ganha velas no aniversário.'),
      i('QUEIJO', 'Amarelo, o rato adora.'),
    ],
  },
  {
    id: 'brinquedos',
    tema: 'Brinquedos',
    itens: [
      i('BOLA', 'Redonda, a gente chuta.'),
      i('PIPA', 'Voa no vento, presa na linha.'),
      i('BONECA', 'Tem roupa, cabelo e nome.'),
      i('CARRINHO', 'Pequeno, a gente empurra no chão.'),
      i('PETECA', 'Tem penas e se bate com a mão.'),
      i('IOIÔ', 'Sobe e desce no barbante.'),
      i('PIÃO', 'Gira, gira no chão.'),
      i('BALANÇO', 'Vai e vem no parquinho.'),
    ],
  },
  {
    id: 'sentimentos',
    tema: 'Sentimentos',
    itens: [
      i('FELIZ', 'Com um sorriso no rosto.'),
      i('TRISTE', 'Com vontade de chorar.'),
      i('BRAVO', 'Com raiva de alguma coisa.'),
      i('MEDO', 'O que se sente no escuro.'),
      i('CALMO', 'Tranquilo, sem pressa.'),
      i('CANSADO', 'Precisando descansar.'),
      i('SURPRESO', 'Quando acontece o que não se esperava.'),
      i('SAUDADE', 'Quando falta alguém de quem se gosta.'),
    ],
  },
];

/** O texto do formulário (uma por linha: PALAVRA: dica). */
export const textoDaPronta = (p: CruzadinhaPronta): string => p.itens.map((x) => `${x.palavra}: ${x.dica}`).join('\n');

/** A pronta seguinte, em ordem (depois da última, volta à primeira). */
export function proximaPronta(id?: string): CruzadinhaPronta {
  const i = CRUZADINHAS_PRONTAS.findIndex((p) => p.id === id);
  return CRUZADINHAS_PRONTAS[(i + 1) % CRUZADINHAS_PRONTAS.length];
}
