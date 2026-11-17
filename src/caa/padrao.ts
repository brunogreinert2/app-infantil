// O CONJUNTO ESSENCIAL: o formato padrão pronto, de onde a professora parte.
//
// A inicial tem 30 casas (5 × 6) de vocabulário NÚCLEO — palavras que servem
// em quase toda situação e se combinam: EU + QUERO + MAIS; NÃO + QUERO;
// VOCÊ + AJUDA; EU + ESTOU + CANSADO. Quatro casas-pasta abrem pranchas de
// vocabulário de assunto (SINTO, LUGARES, COMIDA, ESCOLA), com 8 casas cada.
//
// Escrito por IA (Fable/Claude, 16/11/2026) a partir do que pranchas de núcleo
// costumam trazer. É PONTO DE PARTIDA, não prescrição: prancha de verdade se
// monta para a pessoa, de preferência com a fonoaudióloga. Ver docs/CAA.md.
//
// Ids publicados não se renomeiam depois que forem ao ar: são o que liga a
// prancha guardada de alguém às casas deste padrão.

import { AJUSTES_PADRAO, copiar, type CasaCaa, type CategoriaCaa, type ConjuntoCaa } from './modelo';

function c(
  rotulo: string,
  categoria: CategoriaCaa,
  pictograma: string,
  extra: Partial<CasaCaa> = {},
): CasaCaa {
  const id = extra.id ?? pictograma;
  return { id, rotulo, categoria, pictograma, ...extra };
}

const pasta = (rotulo: string, pictograma: string, abre: string): CasaCaa =>
  c(rotulo, 'coisa', pictograma, { id: `pasta-${abre}`, abre });

const ESSENCIAL: ConjuntoCaa = {
  id: 'essencial',
  nome: 'Essencial',
  inicial: 'inicio',
  ajustes: { ...AJUSTES_PADRAO },
  pranchas: [
    {
      id: 'inicio',
      titulo: 'Início',
      colunas: 5,
      casas: [
        c('EU', 'pessoa', 'eu'),
        c('VOCÊ', 'pessoa', 'voce'),
        c('ESTOU', 'acao', 'estou'),
        c('QUERO', 'acao', 'quero'),
        c('NÃO', 'social', 'nao'),

        c('SIM', 'social', 'sim'),
        c('GOSTO', 'acao', 'gosto'),
        c('MAIS', 'estado', 'mais'),
        c('ACABOU', 'estado', 'acabou'),
        c('AJUDA', 'acao', 'ajuda'),

        c('ESPERA', 'acao', 'espera'),
        c('PARAR', 'acao', 'parar'),
        c('IR', 'acao', 'ir'),
        c('O QUÊ?', 'pergunta', 'pergunta', { id: 'o-que' }),
        c('ONDE?', 'pergunta', 'onde'),

        c('BANHEIRO', 'lugar', 'banheiro'),
        c('ÁGUA', 'coisa', 'agua'),
        c('COMER', 'acao', 'comer'),
        c('DESCANSAR', 'acao', 'descansar'),
        c('DOR', 'estado', 'dor', { fala: 'estou com dor', naFrase: 'com dor' }),

        c('BEM', 'estado', 'bem', { fala: 'estou bem', naFrase: 'bem' }),
        c('MAL', 'estado', 'mal', { fala: 'não estou bem', naFrase: 'mal' }),
        c('OI', 'social', 'oi'),
        c('TCHAU', 'social', 'tchau'),
        c('OBRIGADO', 'social', 'obrigado'),

        c('POR FAVOR', 'social', 'por-favor'),
        pasta('SINTO', 'sinto', 'sinto'),
        pasta('LUGARES', 'lugares', 'lugares'),
        pasta('COMIDA', 'comida', 'comida'),
        pasta('ESCOLA', 'escola', 'escola'),
      ],
    },
    {
      id: 'sinto',
      titulo: 'Sinto',
      colunas: 4,
      casas: [
        c('FELIZ', 'estado', 'feliz'),
        c('TRISTE', 'estado', 'triste'),
        c('BRAVO', 'estado', 'bravo'),
        c('CANSADO', 'estado', 'cansado'),
        c('COM MEDO', 'estado', 'medo'),
        c('NERVOSO', 'estado', 'nervoso'),
        c('CALOR', 'estado', 'calor', { fala: 'estou com calor', naFrase: 'com calor' }),
        c('FRIO', 'estado', 'frio', { fala: 'estou com frio', naFrase: 'com frio' }),
      ],
    },
    {
      id: 'lugares',
      titulo: 'Lugares',
      colunas: 4,
      casas: [
        c('CASA', 'lugar', 'casa'),
        c('ESCOLA', 'lugar', 'escola', { id: 'escola-lugar' }),
        c('SALA', 'lugar', 'sala'),
        c('PÁTIO', 'lugar', 'patio'),
        c('REFEITÓRIO', 'lugar', 'refeitorio'),
        c('ÔNIBUS', 'lugar', 'onibus'),
        c('RUA', 'lugar', 'rua'),
        c('MÉDICO', 'lugar', 'medico'),
      ],
    },
    {
      id: 'comida',
      titulo: 'Comida',
      colunas: 4,
      casas: [
        c('ÁGUA', 'coisa', 'agua', { id: 'agua-comida' }),
        c('SUCO', 'coisa', 'suco'),
        c('LEITE', 'coisa', 'leite'),
        c('LANCHE', 'coisa', 'lanche'),
        c('FRUTA', 'coisa', 'fruta'),
        c('PÃO', 'coisa', 'pao'),
        c('ALMOÇO', 'coisa', 'comer', { id: 'almoco' }),
        c('DOCE', 'coisa', 'doce'),
      ],
    },
    {
      id: 'escola',
      titulo: 'Escola',
      colunas: 4,
      casas: [
        c('PROFESSORA', 'pessoa', 'professora'),
        c('COLEGA', 'pessoa', 'colega'),
        c('LÁPIS', 'coisa', 'lapis'),
        c('CADERNO', 'coisa', 'caderno'),
        c('LIVRO', 'coisa', 'livro'),
        c('COMPUTADOR', 'coisa', 'computador'),
        c('RECREIO', 'coisa', 'recreio'),
        c('MÚSICA', 'coisa', 'musica'),
      ],
    },
  ],
};

/** Um conjunto novo, cópia da essencial, com o nome e o id dados. */
export function conjuntoEssencial(id = 'essencial', nome = 'Essencial'): ConjuntoCaa {
  return { ...copiar(ESSENCIAL), id, nome };
}

/** Um conjunto novo de uma prancha só, com `casas` casas vazias. */
export function conjuntoEmBranco(id: string, nome: string, colunas = 4, casas = 16): ConjuntoCaa {
  return {
    id,
    nome,
    inicial: 'inicio',
    ajustes: { ...AJUSTES_PADRAO },
    pranchas: [
      {
        id: 'inicio',
        titulo: 'Início',
        colunas,
        casas: Array.from({ length: casas }, (_, i) => ({ id: `casa-${i + 1}`, rotulo: '', categoria: 'coisa' as const })),
      },
    ],
  };
}
