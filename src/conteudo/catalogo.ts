// Catálogo de livros e registro de assets — tudo empacotado no bundle
// via import ?raw (zero rede em runtime, princípio 2 da spec).
// Para adicionar um livro novo: criar o .md em livros/, os SVGs em assets/,
// e registrar os dois aqui. Livros de alfabeto são gerados por código
// (alfabetos.ts) e entram pelo mesmo pipeline.

import { carregarLivro } from '../motor/frontmatter';
import type { Livro } from '../motor/tipos';
import { gerarAlfabetos } from './alfabetos';

import lebreMd from './livros/lebre-e-tartaruga.md?raw';
import lebreColorirSvg from './assets/lebre_colorir.svg?raw';
import ninaMd from './livros/o-que-depende-de-mim.md?raw';
import ninaColorirSvg from './assets/nina_colorir.svg?raw';
import ninaChuvaVivaSvg from './assets/nina_chuva_viva.svg?raw';
import ninaAberturaSvg from './assets/nina_abertura.svg?raw';
import ppMd from './livros/o-pequeno-principe.md?raw';
import ppAberturaSvg from './assets/pp_abertura.svg?raw';
import ppJiboiaSvg from './assets/pp_jiboia_colorir.svg?raw';

const gerados = gerarAlfabetos();

export const livros: Livro[] = [
  carregarLivro('lebre-e-tartaruga', lebreMd),
  carregarLivro('o-pequeno-principe', ppMd),
  carregarLivro('o-que-depende-de-mim', ninaMd),
  ...gerados.map((g) => g.livro),
];

// arquivo declarado no front matter → conteúdo SVG
export const arquivosAssets: Record<string, string> = {
  'lebre_colorir.svg': lebreColorirSvg,
  'nina_colorir.svg': ninaColorirSvg,
  'nina_chuva_viva.svg': ninaChuvaVivaSvg,
  'nina_abertura.svg': ninaAberturaSvg,
  'pp_abertura.svg': ppAberturaSvg,
  'pp_jiboia_colorir.svg': ppJiboiaSvg,
  ...Object.assign({}, ...gerados.map((g) => g.arquivos)),
};

// Imagens raster (PNG/JPG/WebP) — para ilustrações que não são SVG.
// Adicionar depois do livro pronto é só: 1) colocar o arquivo em assets/,
// 2) importar aqui com ?url, 3) registrar abaixo, 4) declarar no front
// matter (tipo "ilustracao", arquivo: "nome.png") e ancorar {{img:id}}
// em qualquer ponto do texto — quantas quiser por capítulo.
// Ex.:  import foto01 from './assets/foto01.png?url';
export const arquivosImagens: Record<string, string> = {
  // 'foto01.png': foto01,
};

export function obterLivro(id: string): Livro | undefined {
  return livros.find((l) => l.id === id);
}
