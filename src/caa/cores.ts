// Cor de fundo por categoria — chave de Fitzgerald adaptada, como as pranchas
// costumam usar (pessoas amarelo, ações verde, descrições azul, coisas laranja,
// social rosa). Tons CLAROS de propósito: o texto é sempre #111 por cima, e o
// contraste fica acima de 7:1 em todas (conferido em cores.test… no modelo.test).
// A cor NUNCA é a única pista: a palavra está sempre escrita na casa.

import type { CategoriaCaa } from './modelo';

export const CORES_CAA: Record<CategoriaCaa, string> = {
  pessoa: '#fff1a8',
  acao: '#cdeec0',
  estado: '#cfe2ff',
  coisa: '#ffdcbc',
  necessidade: '#ffdcbc',
  lugar: '#e6dccd',
  social: '#ffd3e3',
  resposta: '#ffd3e3',
  pergunta: '#e3d7fb',
};

export const TINTA_CAA = '#111111';
