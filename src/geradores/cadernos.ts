// OS CADERNOS PRONTOS NA OFICINA (pedido do Bruno, 2026-11-20): os alfabetos,
// Os Números e o Ler o Mundo (alfabetização para jovens e adultos, das placas
// e sinais: A de ATENÇÃO, PARE…) foram feitos para quem ensina imprimir. Antes
// só se chegava a eles pela estante (os infantis) ou por um script (o Ler o
// Mundo). Aqui, entram na oficina como qualquer folha: todas, um grupo ou uma
// só — e o Ler o Mundo faz a ficha da palavra que a professora escolher.
//
// As folhas são as MESMAS dos livros (src/conteudo): nada é redesenhado aqui.

import { gerarCadernoAlfabeto, type FichaAlfabeto } from '../conteudo/alfabetos';
import { gerarCadernoNumeros } from '../conteudo/numeros';
import { fichaDePalavraPropria, gerarCadernoLerOMundo, type Contexto } from '../conteudo/lerOMundo';
import { svgPalavraA4 } from '../conteudo/lerOMundoArte';
import { comLetraDaLegenda } from '../conteudo/alfabetoArte';
import { letraEmUso, tabelaDaLetra } from './comum';

export type Caderno = 'alfabeto' | 'alfabeto-grego' | 'numeros' | 'ler-o-mundo';

export const NOMES_DOS_CADERNOS: Record<Exclude<Caderno, 'numeros' | 'ler-o-mundo'>, string> = {
  alfabeto: 'O Alfabeto',
  'alfabeto-grego': 'O Alfabeto Grego (grego antigo)',
};

/** Onde a palavra própria aparece na ficha do Ler o Mundo (o desenho em volta dela). */
export const NOMES_DOS_CONTEXTOS: Record<Contexto, string> = {
  placa: 'Placa simples',
  octogono: 'Placa de PARE (octógono)',
  alerta: 'Placa de atenção (triângulo)',
  proibido: 'Placa de proibido',
  seta: 'Placa com seta',
  porta: 'Plaquinha de porta',
  letreiro: 'Letreiro do ônibus',
  poste: 'Placa no poste (parada)',
  etiqueta: 'Etiqueta de preço',
  tela: 'Botão numa tela de celular',
  documento: 'Campo de formulário',
};

/** A folha escolhida: '' todas · 'grupo:<nome>' um grupo · '<id>' uma só · 'propria' (Ler o Mundo). */
export const PALAVRA_PROPRIA = 'propria';

const cache = new Map<string, FichaAlfabeto[]>();

/**
 * O LER O MUNDO SAI NA LETRA ESCOLHIDA (pedido do Bruno, 2026-11-25): a
 * «Letra das folhas» da oficina não mudava nada nele. Agora a palavra da placa,
 * o «encontre», o modelo do «escreva» e as instruções saem na letra pedida.
 * O passo 2 (as partes vazadas, para destacar) continua na Cardo do livro.
 * Os alfabetos e Os Números ficam como no livro: lá a letra É o desenho.
 */
function naLetraEscolhida<T>(fazer: () => T): T {
  return comLetraDaLegenda(tabelaDaLetra(letraEmUso()), fazer);
}

/** As folhas de um caderno, na ordem do livro (geradas uma vez por sessão e por letra). */
export function fichasDoCaderno(caderno: Caderno): FichaAlfabeto[] {
  const chave = caderno === 'ler-o-mundo' ? `${caderno}:${letraEmUso()}` : caderno;
  let fichas = cache.get(chave);
  if (!fichas) {
    fichas =
      caderno === 'numeros'
        ? gerarCadernoNumeros()
        : caderno === 'ler-o-mundo'
          ? naLetraEscolhida(gerarCadernoLerOMundo)
          : gerarCadernoAlfabeto(caderno);
    cache.set(chave, fichas);
  }
  return fichas;
}

/** As opções do formulário: todas, cada grupo, cada folha (e a palavra própria). */
export function opcoesDeFolha(caderno: Caderno): Array<{ valor: string; nome: string }> {
  const fichas = fichasDoCaderno(caderno);
  const grupos = [...new Set(fichas.map((f) => f.grupo))];
  const plural = (n: number) => (n === 1 ? '1 folha' : `${n} folhas`);
  return [
    { valor: '', nome: `Todas (${plural(fichas.length)})` },
    ...grupos.map((g) => ({ valor: `grupo:${g}`, nome: `${g} (${plural(fichas.filter((f) => f.grupo === g).length)})` })),
    ...(caderno === 'ler-o-mundo' ? [{ valor: PALAVRA_PROPRIA, nome: '✏️ Uma palavra sua (a ficha da palavra que você escolher)' }] : []),
    ...fichas.map((f) => ({ valor: f.id, nome: `· ${f.titulo}` })),
  ];
}

/** As folhas escolhidas. Escolha que não existe mais (versão antiga) cai em todas. */
export function folhasDoCaderno(caderno: Caderno, folha: string): FichaAlfabeto[] {
  const fichas = fichasDoCaderno(caderno);
  if (folha.startsWith('grupo:')) {
    const grupo = fichas.filter((f) => f.grupo === folha.slice(6));
    if (grupo.length) return grupo;
  }
  const uma = fichas.find((f) => f.id === folha);
  return uma ? [uma] : fichas;
}

/**
 * A ficha do Ler o Mundo para a palavra de quem ensina. `silabas` vem como a
 * professora escreve: ÔNI-BUS, Ô-NI-BUS (traço, ponto ou espaço). Sem sílabas,
 * a ficha mostra letra por letra — o app não adivinha a separação.
 */
export function fichaDaPalavra(palavra: string, silabas: string, contexto: Contexto): { svg: string; titulo: string } {
  const partes = silabas.trim() ? silabas.trim().split(/[-·.\s]+/u).filter(Boolean) : undefined;
  const p = fichaDePalavraPropria({ palavra, silabas: partes, contexto });
  return { svg: naLetraEscolhida(() => svgPalavraA4(p)), titulo: p.palavra };
}
