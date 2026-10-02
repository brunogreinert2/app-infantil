// Tipos centrais do motor de conteúdo.
// Espelham a seção 3 da ESPECIFICACAO.md (front matter YAML estendido).

import type { Element } from 'hast';

/**
 * Os blocos da leitura. O texto é lido pelo motor do ecossistema
 * (src/motor/ecossistema, fonte em C:\Claude\parser) e montado aqui em blocos
 * com NOME (p1, c1, img1): o quiz se ancora por ele (`ancora: "p3"`) e o
 * "você parou aqui" o guarda no perfil — por isso a numeração é a mesma do
 * parser de três regras de antes (parser.ts conta como ele contava).
 *
 * `texto` é o texto puro (o 🔊 lê este); `hast` é o desenho, com negrito,
 * grego com lang, fórmula… quando houver.
 */
export type No =
  | { tipo: 'cabecalho'; nivel: number; texto: string; id: string }
  | { tipo: 'paragrafo'; texto: string; id: string; hast?: Element }
  | { tipo: 'imagem'; assetId: string; id: string }
  // citação, lista, tabela, caixa de nota, fórmula em bloco, código, notas…
  | { tipo: 'bloco'; texto: string; id: string; hast: Element };

export type TipoAsset = 'capa' | 'ilustracao' | 'colorir' | 'audio' | 'video';

export interface AssetDeclarado {
  id: string;
  tipo: TipoAsset;
  arquivo?: string;             // capa / ilustracao
  arquivo_interativo?: string;  // colorir — versão com regiões preenchíveis
  arquivo_impressao?: string;   // colorir — versão P&B só contorno
}

export interface PerguntaQuiz {
  pergunta: string;
  alternativas: string[];
  correta: number;              // índice em alternativas
  nivel: 'paragrafo' | 'capitulo';
  ancora?: string;              // id do nó (ex: "p3") quando nivel = paragrafo
  explicacao?: string;          // explicação curta revelada após qualquer resposta
}

export interface MetadadosLivro {
  titulo: string;
  autor_original?: string;
  fonte_idioma?: string;
  faixa_etaria?: string;
  nivel_leitura?: string;
  licenca?: string;
  tradutor?: string;
  tema_padrao?: string; // id de tema pronto que o livro veste ao abrir
  tema_livro?: { fundo: string; destaque: string }; // tema exclusivo do livro
  abertura?: string; // id de asset (SVG animado) da cena de entrada do livro
  narracao?: string; // id de asset de áudio: gravação humana que substitui
                     // o TTS no botão "Ouvir a história"
  assets?: AssetDeclarado[];
  quiz?: PerguntaQuiz[];
}

export interface Livro {
  id: string;
  metadados: MetadadosLivro;
  nos: No[];
}
