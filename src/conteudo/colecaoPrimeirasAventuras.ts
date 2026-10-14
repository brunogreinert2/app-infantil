// Coleção Primeiras Aventuras: adaptações e desenhos próprios, sem rede em runtime.
import { carregarLivro } from '../motor/frontmatter';
import livro0 from './livros/o-corvo-e-o-jarro.md?raw';
import arte0_1 from './assets/colecao01-corvo-1.svg?raw';
import arte0_2 from './assets/colecao01-corvo-2.svg?raw';
import livro1 from './livros/a-raposa-e-a-cegonha.md?raw';
import arte1_1 from './assets/colecao01-cegonha-1.svg?raw';
import arte1_2 from './assets/colecao01-cegonha-2.svg?raw';
import livro2 from './livros/o-rato-do-campo-e-o-rato-da-cidade.md?raw';
import arte2_1 from './assets/colecao01-ratinhos-1.svg?raw';
import arte2_2 from './assets/colecao01-ratinhos-2.svg?raw';
import livro3 from './livros/a-formiga-e-a-pomba.md?raw';
import arte3_1 from './assets/colecao01-formiga-1.svg?raw';
import arte3_2 from './assets/colecao01-formiga-2.svg?raw';
import livro4 from './livros/o-cachorro-e-o-reflexo.md?raw';
import arte4_1 from './assets/colecao01-reflexo-1.svg?raw';
import arte4_2 from './assets/colecao01-reflexo-2.svg?raw';
import livro5 from './livros/o-galo-e-a-perola.md?raw';
import arte5_1 from './assets/colecao01-perola-1.svg?raw';
import arte5_2 from './assets/colecao01-perola-2.svg?raw';
import livro6 from './livros/o-carvalho-e-os-juncos.md?raw';
import arte6_1 from './assets/colecao01-juncos-1.svg?raw';
import arte6_2 from './assets/colecao01-juncos-2.svg?raw';
import livro7 from './livros/os-ratinhos-e-o-sino.md?raw';
import arte7_1 from './assets/colecao01-sino-1.svg?raw';
import arte7_2 from './assets/colecao01-sino-2.svg?raw';
import livro8 from './livros/a-panela-de-mingau.md?raw';
import arte8_1 from './assets/colecao01-mingau-1.svg?raw';
import arte8_2 from './assets/colecao01-mingau-2.svg?raw';
import livro9 from './livros/os-duendes-e-o-sapateiro.md?raw';
import arte9_1 from './assets/colecao01-duendes-1.svg?raw';
import arte9_2 from './assets/colecao01-duendes-2.svg?raw';
import livro10 from './livros/a-roupa-nova-do-imperador.md?raw';
import arte10_1 from './assets/colecao01-imperador-1.svg?raw';
import arte10_2 from './assets/colecao01-imperador-2.svg?raw';
import livro11 from './livros/o-patinho-e-seu-lugar.md?raw';
import arte11_1 from './assets/colecao01-patinho-1.svg?raw';
import arte11_2 from './assets/colecao01-patinho-2.svg?raw';

export const livrosPrimeirasAventuras = [
  carregarLivro('o-corvo-e-o-jarro', livro0),
  carregarLivro('a-raposa-e-a-cegonha', livro1),
  carregarLivro('o-rato-do-campo-e-o-rato-da-cidade', livro2),
  carregarLivro('a-formiga-e-a-pomba', livro3),
  carregarLivro('o-cachorro-e-o-reflexo', livro4),
  carregarLivro('o-galo-e-a-perola', livro5),
  carregarLivro('o-carvalho-e-os-juncos', livro6),
  carregarLivro('os-ratinhos-e-o-sino', livro7),
  carregarLivro('a-panela-de-mingau', livro8),
  carregarLivro('os-duendes-e-o-sapateiro', livro9),
  carregarLivro('a-roupa-nova-do-imperador', livro10),
  carregarLivro('o-patinho-e-seu-lugar', livro11),
];

export const capasPrimeirasAventuras: Record<string, string> = {
  'o-corvo-e-o-jarro': '🐦🫙',
  'a-raposa-e-a-cegonha': '🦊🥣',
  'o-rato-do-campo-e-o-rato-da-cidade': '🐭🏡',
  'a-formiga-e-a-pomba': '🐜🕊️',
  'o-cachorro-e-o-reflexo': '🐶💧',
  'o-galo-e-a-perola': '🐓✨',
  'o-carvalho-e-os-juncos': '🌳🌾',
  'os-ratinhos-e-o-sino': '🐭🔔',
  'a-panela-de-mingau': '🥣🪄',
  'os-duendes-e-o-sapateiro': '👞🌙',
  'a-roupa-nova-do-imperador': '👑🧵',
  'o-patinho-e-seu-lugar': '🦆🦢',
};

export const assetsPrimeirasAventuras: Record<string, string> = {
  'colecao01-corvo-1.svg': arte0_1,
  'colecao01-corvo-2.svg': arte0_2,
  'colecao01-cegonha-1.svg': arte1_1,
  'colecao01-cegonha-2.svg': arte1_2,
  'colecao01-ratinhos-1.svg': arte2_1,
  'colecao01-ratinhos-2.svg': arte2_2,
  'colecao01-formiga-1.svg': arte3_1,
  'colecao01-formiga-2.svg': arte3_2,
  'colecao01-reflexo-1.svg': arte4_1,
  'colecao01-reflexo-2.svg': arte4_2,
  'colecao01-perola-1.svg': arte5_1,
  'colecao01-perola-2.svg': arte5_2,
  'colecao01-juncos-1.svg': arte6_1,
  'colecao01-juncos-2.svg': arte6_2,
  'colecao01-sino-1.svg': arte7_1,
  'colecao01-sino-2.svg': arte7_2,
  'colecao01-mingau-1.svg': arte8_1,
  'colecao01-mingau-2.svg': arte8_2,
  'colecao01-duendes-1.svg': arte9_1,
  'colecao01-duendes-2.svg': arte9_2,
  'colecao01-imperador-1.svg': arte10_1,
  'colecao01-imperador-2.svg': arte10_2,
  'colecao01-patinho-1.svg': arte11_1,
  'colecao01-patinho-2.svg': arte11_2,
};
