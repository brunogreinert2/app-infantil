// Tipos centrais do motor de conteúdo.
// Espelham a seção 3 da ESPECIFICACAO.md (front matter YAML estendido).

export type No =
  | { tipo: 'cabecalho'; nivel: number; texto: string; id: string }
  | { tipo: 'paragrafo'; texto: string; id: string }
  | { tipo: 'imagem'; assetId: string; id: string };

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
  assets?: AssetDeclarado[];
  quiz?: PerguntaQuiz[];
}

export interface Livro {
  id: string;
  metadados: MetadadosLivro;
  nos: No[];
}
