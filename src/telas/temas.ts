// Os temas prontos do app. Módulo PURO (sem DOM): o teste de contraste
// (temas.test.ts) o lê sem navegador.

// A ORDEM é a informação (a mesma regra do Pedra Angular, 2026-11-20): primeiro
// os pares de BAIXA VISÃO (Perkins), depois os de conforto de leitura, por
// último os de brincar. Todos passam em 7:1 (src/telas/temas.test.ts). Os ids
// antigos (arco-iris, floresta, espaco, alto-contraste) não mudam: estão
// guardados nos perfis.
export type GrupoDeTema = 'enxergar' | 'conforto' | 'brincar';
export const TEMAS = [
  { id: 'claro', rotulo: 'Preto no branco', grupo: 'enxergar' },
  { id: 'alto-contraste', rotulo: 'Branco no preto', grupo: 'enxergar' },
  { id: 'amarelo', rotulo: 'Amarelo no preto', grupo: 'enxergar' },
  { id: 'verde', rotulo: 'Verde no preto', grupo: 'enxergar' },
  { id: 'amarelo-azul', rotulo: 'Amarelo no azul', grupo: 'enxergar' },
  { id: 'sepia', rotulo: 'Sépia', grupo: 'conforto' },
  { id: 'azul-noite', rotulo: 'Azul-noite', grupo: 'conforto' },
  { id: 'azul-petroleo', rotulo: 'Azul-petróleo', grupo: 'conforto' },
  { id: 'arco-iris', rotulo: '🌈 Arco-íris', grupo: 'brincar' },
  { id: 'floresta', rotulo: '🌳 Floresta', grupo: 'brincar' },
  { id: 'espaco', rotulo: '🚀 Espaço', grupo: 'brincar' },
] as const satisfies ReadonlyArray<{ id: string; rotulo: string; grupo: GrupoDeTema }>;

export const NOMES_DOS_GRUPOS_DE_TEMA: Record<GrupoDeTema, string> = {
  enxergar: 'Mais contraste',
  conforto: 'Para ler por mais tempo',
  brincar: 'Para brincar',
};

/** Tema de baixa visão: necessidade, não enfeite — o tema do livro não o troca. */
export const ehTemaDeEnxergar = (id: string): boolean => TEMAS.some((t) => t.id === id && t.grupo === 'enxergar');
