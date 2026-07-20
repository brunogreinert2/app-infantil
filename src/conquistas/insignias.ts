// Insígnias — recompensa FIXA e previsível (spec 8.5): terminar o livro X
// sempre dá a insígnia Y; marcos de quantidade são fixos e conhecidos.
// Nunca aleatório, nunca placar, nunca gate. É fonte de orgulho, não pressão.
// Catálogo estático aqui; o armazenamento guarda só o que cada perfil ganhou
// (mesma separação catálogo/estado da spec 8.4).

import { armazenamento } from '../armazenamento/armazenamento';

export interface Insignia {
  id: string;
  emoji: string;
  titulo: string;
  descricao: string;
}

export const INSIGNIAS: Insignia[] = [
  { id: 'trofeu-tartaruga', emoji: '🏆', titulo: 'Devagar e Sempre', descricao: 'Terminou "A Lebre e a Tartaruga"' },
  { id: 'pequeno-grego', emoji: 'Ω', titulo: 'Pequeno Grego', descricao: 'Terminou o Alfabeto Grego' },
  { id: 'mestre-abc', emoji: '🔤', titulo: 'Mestre do ABC', descricao: 'Terminou o Alfabeto' },
  { id: 'pequeno-filosofo', emoji: '🏺', titulo: 'Pequeno Filósofo', descricao: 'Terminou "O Que Depende de Mim"' },
  { id: 'amigo-principe', emoji: '🌹', titulo: 'Amigo do Principezinho', descricao: 'Leu O Pequeno Príncipe' },
  { id: 'coruja-leitora', emoji: '🦉', titulo: 'Coruja Leitora', descricao: 'Leu 3 livros inteiros' },
  { id: 'grandes-classicos', emoji: '🏛️', titulo: 'Leitor de Grandes Clássicos', descricao: 'Leu 5 livros inteiros' },
];

// livro concluído → insígnia garantida (sempre a mesma, sem sorte)
const POR_LIVRO: Record<string, string> = {
  'lebre-e-tartaruga': 'trofeu-tartaruga',
  'alfabeto-grego': 'pequeno-grego',
  'alfabeto': 'mestre-abc',
  'o-que-depende-de-mim': 'pequeno-filosofo',
  'o-pequeno-principe': 'amigo-principe',
};

// marcos fixos por total de livros lidos
const MARCOS: Array<[number, string]> = [
  [3, 'coruja-leitora'],
  [5, 'grandes-classicos'],
];

export function obterInsignia(id: string): Insignia | undefined {
  return INSIGNIAS.find((i) => i.id === id);
}

export async function listarConquistas(perfilId: number): Promise<Insignia[]> {
  const ids = (await armazenamento.obter<string[]>(`${perfilId}:conquistas`)) ?? [];
  return ids.map(obterInsignia).filter((i): i is Insignia => i !== undefined);
}

// Registra a conclusão de um livro e devolve as insígnias NOVAS ganhas agora.
export async function registrarLivroConcluido(
  perfilId: number,
  livroId: string,
): Promise<Insignia[]> {
  const lidos = (await armazenamento.obter<string[]>(`${perfilId}:livrosLidos`)) ?? [];
  if (!lidos.includes(livroId)) {
    lidos.push(livroId);
    await armazenamento.definir(`${perfilId}:livrosLidos`, lidos);
  }

  const conquistadas = (await armazenamento.obter<string[]>(`${perfilId}:conquistas`)) ?? [];
  const novas: Insignia[] = [];

  const conceder = (id: string | undefined) => {
    if (!id || conquistadas.includes(id)) return;
    const insignia = obterInsignia(id);
    if (!insignia) return;
    conquistadas.push(id);
    novas.push(insignia);
  };

  conceder(POR_LIVRO[livroId]);
  for (const [minimo, id] of MARCOS) if (lidos.length >= minimo) conceder(id);

  if (novas.length > 0) await armazenamento.definir(`${perfilId}:conquistas`, conquistadas);
  return novas;
}
