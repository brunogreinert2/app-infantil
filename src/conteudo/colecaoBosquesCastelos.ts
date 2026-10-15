// Entre Bosques e Castelos: adaptações próprias e SVGs locais.
import { carregarLivro } from '../motor/frontmatter';
import arte0_1 from './assets/colecao02-bremen-1.svg?raw';
import arte0_2 from './assets/colecao02-bremen-2.svg?raw';
import arte0_3 from './assets/colecao02-bremen-3.svg?raw';
import livro0 from './livros/os-musicos-de-bremen.md?raw';
import arte1_1 from './assets/colecao02-abelhas-1.svg?raw';
import arte1_2 from './assets/colecao02-abelhas-2.svg?raw';
import arte1_3 from './assets/colecao02-abelhas-3.svg?raw';
import livro1 from './livros/a-rainha-das-abelhas.md?raw';
import arte2_1 from './assets/colecao02-ganso-1.svg?raw';
import arte2_2 from './assets/colecao02-ganso-2.svg?raw';
import arte2_3 from './assets/colecao02-ganso-3.svg?raw';
import livro2 from './livros/o-ganso-de-ouro.md?raw';
import arte3_1 from './assets/colecao02-rouxinol-1.svg?raw';
import arte3_2 from './assets/colecao02-rouxinol-2.svg?raw';
import arte3_3 from './assets/colecao02-rouxinol-3.svg?raw';
import livro3 from './livros/o-rouxinol-e-o-imperador.md?raw';
import arte4_1 from './assets/colecao02-ervilha-1.svg?raw';
import arte4_2 from './assets/colecao02-ervilha-2.svg?raw';
import arte4_3 from './assets/colecao02-ervilha-3.svg?raw';
import livro4 from './livros/a-princesa-e-a-ervilha.md?raw';
import arte5_1 from './assets/colecao02-porquinhos-1.svg?raw';
import arte5_2 from './assets/colecao02-porquinhos-2.svg?raw';
import arte5_3 from './assets/colecao02-porquinhos-3.svg?raw';
import livro5 from './livros/os-tres-porquinhos.md?raw';
import arte6_1 from './assets/colecao02-ursos-1.svg?raw';
import arte6_2 from './assets/colecao02-ursos-2.svg?raw';
import arte6_3 from './assets/colecao02-ursos-3.svg?raw';
import livro6 from './livros/cachinhos-e-os-tres-ursos.md?raw';
import arte7_1 from './assets/colecao02-feijao-1.svg?raw';
import arte7_2 from './assets/colecao02-feijao-2.svg?raw';
import arte7_3 from './assets/colecao02-feijao-3.svg?raw';
import livro7 from './livros/joao-e-o-pe-de-feijao.md?raw';

export const livrosBosquesCastelos = [
  carregarLivro('os-musicos-de-bremen', livro0),
  carregarLivro('a-rainha-das-abelhas', livro1),
  carregarLivro('o-ganso-de-ouro', livro2),
  carregarLivro('o-rouxinol-e-o-imperador', livro3),
  carregarLivro('a-princesa-e-a-ervilha', livro4),
  carregarLivro('os-tres-porquinhos', livro5),
  carregarLivro('cachinhos-e-os-tres-ursos', livro6),
  carregarLivro('joao-e-o-pe-de-feijao', livro7),
];

export const capasBosquesCastelos: Record<string, string> = {
  'os-musicos-de-bremen': '🎵🐴',
  'a-rainha-das-abelhas': '🐝🏰',
  'o-ganso-de-ouro': '🪿✨',
  'o-rouxinol-e-o-imperador': '🐦🎶',
  'a-princesa-e-a-ervilha': '🫛🛏️',
  'os-tres-porquinhos': '🐷🏠',
  'cachinhos-e-os-tres-ursos': '🐻🥣',
  'joao-e-o-pe-de-feijao': '🌱☁️',
};

export const assetsBosquesCastelos: Record<string, string> = {
  'colecao02-bremen-1.svg': arte0_1,
  'colecao02-bremen-2.svg': arte0_2,
  'colecao02-bremen-3.svg': arte0_3,
  'colecao02-abelhas-1.svg': arte1_1,
  'colecao02-abelhas-2.svg': arte1_2,
  'colecao02-abelhas-3.svg': arte1_3,
  'colecao02-ganso-1.svg': arte2_1,
  'colecao02-ganso-2.svg': arte2_2,
  'colecao02-ganso-3.svg': arte2_3,
  'colecao02-rouxinol-1.svg': arte3_1,
  'colecao02-rouxinol-2.svg': arte3_2,
  'colecao02-rouxinol-3.svg': arte3_3,
  'colecao02-ervilha-1.svg': arte4_1,
  'colecao02-ervilha-2.svg': arte4_2,
  'colecao02-ervilha-3.svg': arte4_3,
  'colecao02-porquinhos-1.svg': arte5_1,
  'colecao02-porquinhos-2.svg': arte5_2,
  'colecao02-porquinhos-3.svg': arte5_3,
  'colecao02-ursos-1.svg': arte6_1,
  'colecao02-ursos-2.svg': arte6_2,
  'colecao02-ursos-3.svg': arte6_3,
  'colecao02-feijao-1.svg': arte7_1,
  'colecao02-feijao-2.svg': arte7_2,
  'colecao02-feijao-3.svg': arte7_3,
};
