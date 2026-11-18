// SEQUÊNCIA DIDÁTICA a partir de um livro da estante: um caderno inteiro,
// pronto para imprimir, com o que o próprio livro já tem.
//
//   1. a história para ler (o texto do livro, na letra escolhida)
//   2. perguntas de compreensão (o quiz do livro + duas perguntas abertas)
//   3. caça-palavras com o vocabulário da história
//   4. "o que aconteceu primeiro?": quatro momentos para numerar ou recortar
//   5. "invente outro final": desenho e escrita
//   6. o desenho do livro para pintar
//   e, separado, as respostas para quem ensina.
//
// Nada de sorte: o mesmo livro dá sempre o mesmo caderno. As palavras do
// caça-palavras são sugeridas pela frequência no texto, e quem ensina pode
// trocá-las.

import type { Livro } from '../motor/tipos';
import { TINTA, escrever, folha, quebrar, soLetras, textoSeguro } from './comum';
import { gerarCacaPalavras, svgCacaPalavrasA4 } from './cacaPalavras';
import type { Folha } from './jogosDeMesa';

export type ParteDaSequencia = 'texto' | 'perguntas' | 'caca' | 'ordem' | 'final' | 'colorir' | 'respostas';

export const NOMES_DAS_PARTES: Record<ParteDaSequencia, string> = {
  texto: 'A história para ler',
  perguntas: 'Perguntas de compreensão',
  caca: 'Caça-palavras da história',
  ordem: 'O que aconteceu primeiro? (numerar a ordem)',
  final: 'Invente outro final',
  colorir: 'Desenho para pintar',
  respostas: 'Respostas para quem ensina (separadas, no fim)',
};

/** Palavras que aparecem em qualquer texto e não ensinam nada sobre esta história. */
const COMUNS = new Set(
  (
    'aqui ali assim ainda antes agora aquela aquele aquilo cada coisa coisas como com contra deles delas depois desde ' +
    'disse dizer disso disto ela elas ele eles então entre essa esse esta este estava estavam estão está foram fosse ' +
    'grande havia isso isto lado logo mais mesmo menos muito muita muitos muitas nada nem nossa nosso nunca onde ' +
    'outra outro outras outros para pela pelas pelo pelos pode podia porque pois quando quanto quase quem sabe ' +
    'sobre sempre também tanto tava tem tinha tinham toda todas todo todos tudo uma umas vez vezes você vocês ' +
    'bem bom boa dia dias fazer feito ficou foi era eram será seu sua seus suas meu minha teu tua aos das dos nas nos ' +
    'num numa pra pro sem sim não mas por que qual quais então lhe lhes mim ti tão até após durante enquanto ' +
    'ser ter ver vai vou vão veio viu deu fez quer queria pode podia tinha estou estava sido sendo cada ainda'
  ).split(' '),
);

/** O texto corrido do livro: parágrafos, blocos e subtítulos (o título principal fica de fora). */
export function textoDoLivro(livro: Livro): Array<{ tipo: 'titulo' | 'paragrafo'; texto: string }> {
  const partes: Array<{ tipo: 'titulo' | 'paragrafo'; texto: string }> = [];
  let pulouTitulo = false;
  for (const no of livro.nos) {
    if (no.tipo === 'imagem') continue;
    const texto = textoSeguro(no.texto);
    if (!texto) continue;
    if (no.tipo === 'cabecalho') {
      if (!pulouTitulo && soLetras(texto) === soLetras(livro.metadados.titulo)) {
        pulouTitulo = true;
        continue;
      }
      partes.push({ tipo: 'titulo', texto });
    } else partes.push({ tipo: 'paragrafo', texto });
  }
  return partes;
}

/**
 * Oito palavras da história para o caça-palavras: as que mais se repetem
 * (personagens e coisas importantes), de 4 a 10 letras, sem as palavras de
 * ligação. Empate: a que aparece primeiro.
 */
export function sugerirPalavras(livro: Livro, quantas = 8): string[] {
  const contagem = new Map<string, { vezes: number; primeira: number; escrita: string }>();
  let posicao = 0;
  for (const parte of textoDoLivro(livro)) {
    for (const bruta of parte.texto.match(/\p{L}+/gu) ?? []) {
      const palavra = bruta.toLocaleLowerCase('pt-BR');
      posicao++;
      if (palavra.length < 4 || palavra.length > 10 || COMUNS.has(palavra)) continue;
      const atual = contagem.get(palavra);
      if (atual) atual.vezes++;
      else contagem.set(palavra, { vezes: 1, primeira: posicao, escrita: palavra.toLocaleUpperCase('pt-BR') });
    }
  }
  return [...contagem.values()]
    .sort((a, b) => b.vezes - a.vezes || a.primeira - b.primeira)
    .slice(0, quantas)
    .map((p) => p.escrita);
}

/**
 * Quatro momentos da história, em ordem: a primeira frase de parágrafos
 * espalhados do começo ao fim (falas de personagem ficam de fora).
 */
export function momentosDaHistoria(livro: Livro): string[] {
  const narrados = textoDoLivro(livro)
    // narração de verdade: sem falas de personagem e sem notas sobre o livro ("uma adaptação do…")
    .filter((p) => p.tipo === 'paragrafo' && !/^[—–"“«-]/u.test(p.texto) && p.texto.length >= 50)
    .filter((p) => !/(adapta[çc][ãa]o|Historinhas|tradu[çc][ãa]o)/iu.test(p.texto))
    .map((p) => p.texto);
  if (narrados.length < 4) return [];
  const indices = [0, 1, 2, 3].map((i) => Math.round((i * (narrados.length - 1)) / 3));
  return indices.map((i) => {
    const frase = narrados[i].split(/(?<=[.!?])\s+/u)[0];
    if (frase.length <= 140) return frase;
    const corte = frase.slice(0, 140);
    return `${corte.slice(0, corte.lastIndexOf(' '))}…`;
  });
}

/** Ordem em que os momentos aparecem na folha (nunca a certa): a tira k é o momento EMBARALHO[k]. */
export const EMBARALHO = [2, 0, 3, 1];

// ---------------------------------------------------------------------------
// As folhas
// ---------------------------------------------------------------------------

const TOPO_COM_NOME = 196;
const TOPO_SEM_NOME = 150;
const FUNDO = 1070;

/** Junta blocos de altura conhecida em folhas, sem cortar um bloco no meio. */
type Bloco = {
  altura: number;
  desenhar: (y: number, altura: number) => string;
  /** bloco elástico: ocupa o que sobra da folha, desde que sobre pelo menos isto */
  minimo?: number;
};

function emFolhas(
  blocos: Bloco[],
  fazerFolha: (corpo: string, pagina: number) => string,
  topo = TOPO_COM_NOME,
): string[] {
  const paginas: string[] = [];
  let corpo = '';
  let y = topo;
  for (const b of blocos) {
    const topoDaFolha = paginas.length ? TOPO_SEM_NOME : topo;
    const precisa = b.minimo ?? b.altura;
    if (y + precisa > FUNDO && y > topoDaFolha) {
      paginas.push(fazerFolha(corpo, paginas.length));
      corpo = '';
      y = TOPO_SEM_NOME;
    }
    const altura = b.minimo ? Math.min(b.altura, FUNDO - y) : b.altura;
    corpo += b.desenhar(y, altura);
    y += altura;
  }
  if (corpo) paginas.push(fazerFolha(corpo, paginas.length));
  return paginas;
}

export function svgHistoriaA4(livro: Livro): Folha[] {
  const titulo = livro.metadados.titulo;
  const tam = 25;
  const entre = 40;
  const blocos = textoDoLivro(livro).map((p) => {
    if (p.tipo === 'titulo') {
      return { altura: 64, desenhar: (y: number) => escrever(p.texto, 48, y + 34, 30, 'start', 704) };
    }
    const linhas = quebrar(p.texto, 704, tam);
    return {
      altura: linhas.length * entre + 18,
      desenhar: (y: number) => linhas.map((l, i) => escrever(l, 48, y + tam + i * entre, tam)).join(''),
    };
  });
  const m = livro.metadados;
  const credito = [m.autor_original, m.tradutor].filter(Boolean).join(' — ');
  if (credito) {
    const linhas = quebrar(credito, 704, 16);
    blocos.push({ altura: linhas.length * 24 + 20, desenhar: (y) => linhas.map((l, i) => escrever(l, 48, y + 30 + i * 24, 16)).join('') });
  }
  const svgs = emFolhas(blocos, (corpo, i) =>
    folha(i ? `${titulo} (continuação)` : titulo, 'Leitura', corpo, { nome: i === 0 }),
  );
  return svgs.map((svg, i) => ({ titulo: i ? `História (${i + 1})` : 'A história', svg }));
}

function linhasDeEscrever(y: number, quantas: number, passo = 52): string {
  let d = '';
  for (let i = 1; i <= quantas; i++) d += `M48 ${y + i * passo}H752`;
  return `<path d="${d}" stroke="${TINTA}" stroke-width="1.4"/>`;
}

export function svgPerguntasA4(livro: Livro): Folha[] {
  const titulo = `Perguntas: ${livro.metadados.titulo}`;
  const tam = 22;
  const blocos: Bloco[] = [];
  const letras = 'abcdefgh';
  (livro.metadados.quiz ?? []).forEach((q, k) => {
    const pergunta = quebrar(`${k + 1}. ${q.pergunta}`, 704, tam);
    const alternativas = q.alternativas.map((a) => quebrar(a, 620, 20));
    const altura = pergunta.length * 32 + alternativas.reduce((s, l) => s + l.length * 28 + 12, 0) + 30;
    blocos.push({
      altura,
      desenhar: (y) => {
        let s = pergunta.map((l, i) => escrever(l, 48, y + tam + i * 32, tam)).join('');
        let ya = y + pergunta.length * 32 + 18;
        alternativas.forEach((linhas, j) => {
          s += `<circle cx="84" cy="${ya + 12}" r="13" fill="none" stroke="${TINTA}" stroke-width="2.4"/>`;
          s += escrever(letras[j], 84, ya + 19, 18, 'middle');
          s += linhas.map((l, i) => escrever(l, 112, ya + 20 + i * 28, 20)).join('');
          ya += linhas.length * 28 + 12;
        });
        return s;
      },
    });
  });
  // uma pergunta aberta e a caixa de desenho: assim a folha cabe numa página nas fábulas curtas
  const abertas = ['Quem aparece na história?'];
  abertas.forEach((p, k) => {
    const numero = (livro.metadados.quiz?.length ?? 0) + k + 1;
    blocos.push({ altura: 40 + 3 * 52 + 20, desenhar: (y) => escrever(`${numero}. ${p}`, 48, y + tam, tam, 'start', 704) + linhasDeEscrever(y + 20, 3) });
  });
  // a caixa de desenho ocupa o que sobrar da folha (no mínimo 220, no máximo 460)
  blocos.push({
    altura: 460,
    minimo: 220,
    desenhar: (y, altura) =>
      escrever('Do que você mais gostou? Desenhe ou escreva.', 48, y + tam, tam, 'start', 704) +
      `<rect x="48" y="${y + 40}" width="704" height="${altura - 50}" rx="16" fill="none" stroke="${TINTA}" stroke-width="2.4"/>`,
  });
  const svgs = emFolhas(blocos, (corpo, i) => folha(i ? `${titulo} (continuação)` : titulo, 'Compreensão', corpo, { nome: i === 0 }));
  return svgs.map((svg, i) => ({ titulo: i ? `Perguntas (${i + 1})` : 'Perguntas', svg }));
}

export function svgOrdemA4(livro: Livro): Folha | undefined {
  const momentos = momentosDaHistoria(livro);
  if (!momentos.length) return undefined;
  let corpo = escrever('Leia e numere de 1 a 4, na ordem em que aconteceu.', 48, 196, 22);
  corpo += escrever('Se quiser, recorte as tiras e cole na ordem certa.', 48, 226, 18);
  const alt = 190;
  EMBARALHO.forEach((indice, k) => {
    const y = 262 + k * alt;
    corpo += `<rect x="40" y="${y}" width="720" height="${alt - 14}" fill="none" stroke="${TINTA}" stroke-width="1.6" stroke-dasharray="9 7"/>`;
    corpo += `<rect x="62" y="${y + (alt - 14) / 2 - 40}" width="80" height="80" rx="12" fill="none" stroke="${TINTA}" stroke-width="3.4"/>`;
    const linhas = quebrar(momentos[indice], 580, 22);
    const yTexto = y + (alt - 14) / 2 - ((linhas.length - 1) * 32) / 2 + 8;
    corpo += linhas.map((l, i) => escrever(l, 166, yTexto + i * 32, 22)).join('');
  });
  return { titulo: 'O que aconteceu primeiro?', svg: folha(`O que aconteceu primeiro? ${livro.metadados.titulo}`, 'Sequência', corpo) };
}

export function svgFinalA4(livro: Livro): Folha {
  let corpo = escrever('Invente outro jeito de a história terminar.', 48, 196, 22);
  corpo += escrever('Desenhe aqui:', 48, 236, 18);
  corpo += `<rect x="48" y="252" width="704" height="420" rx="16" fill="none" stroke="${TINTA}" stroke-width="2.4"/>`;
  corpo += escrever('Agora escreva:', 48, 716, 18);
  corpo += linhasDeEscrever(712, 6, 56);
  return { titulo: 'Outro final', svg: folha(`Outro final para ${livro.metadados.titulo}`, 'Escrita', corpo) };
}

/** O desenho de pintar do livro dentro de uma folha A4 com título e nome. */
export function svgColorirDoLivroA4(livro: Livro, arte: string): Folha {
  const limpa = arte.replace(/<\?xml[^>]*>/, '').trim();
  const aninhada = limpa.replace(/^<svg\b([^>]*)>/, (_, atributos: string) => {
    const sem = atributos.replace(/\s(?:x|y|width|height|preserveAspectRatio)="[^"]*"/g, '');
    return `<svg x="48" y="186" width="704" height="870" preserveAspectRatio="xMidYMid meet"${sem}>`;
  });
  const corpo = `<rect x="48" y="186" width="704" height="870" rx="16" fill="none" stroke="${TINTA}" stroke-width="2"/>${aninhada}`;
  return { titulo: 'Para pintar', svg: folha(`Pinte: ${livro.metadados.titulo}`, 'Desenho', corpo) };
}

export function svgRespostasA4(livro: Livro): Folha[] {
  const titulo = `Respostas: ${livro.metadados.titulo}`;
  const blocos: Bloco[] = [];
  const letras = 'abcdefgh';
  blocos.push({ altura: 44, desenhar: (y) => escrever('Perguntas', 48, y + 26, 26) });
  (livro.metadados.quiz ?? []).forEach((q, k) => {
    const resposta = quebrar(`${k + 1}. (${letras[q.correta]}) ${q.alternativas[q.correta] ?? ''}`, 704, 21);
    const explicacao = q.explicacao ? quebrar(q.explicacao, 680, 18) : [];
    blocos.push({
      altura: resposta.length * 30 + explicacao.length * 26 + 22,
      desenhar: (y) =>
        resposta.map((l, i) => escrever(l, 48, y + 22 + i * 30, 21)).join('') +
        explicacao.map((l, i) => escrever(l, 72, y + 22 + resposta.length * 30 + i * 26, 18)).join(''),
    });
  });
  blocos.push({
    altura: 60,
    desenhar: (y) => escrever('As perguntas abertas não têm resposta certa: valem as ideias da criança.', 48, y + 30, 18, 'start', 704),
  });
  const momentos = momentosDaHistoria(livro);
  if (momentos.length) {
    blocos.push({ altura: 56, desenhar: (y) => escrever('O que aconteceu primeiro?', 48, y + 34, 26) });
    // na folha, de cima para baixo, a tira k é o momento EMBARALHO[k]
    const numeros = EMBARALHO.map((indice) => indice + 1).join(', ');
    blocos.push({ altura: 40, desenhar: (y) => escrever(`De cima para baixo, as tiras são: ${numeros}.`, 48, y + 26, 21) });
    momentos.forEach((m, i) => {
      const linhas = quebrar(`${i + 1}. ${m}`, 704, 18);
      blocos.push({ altura: linhas.length * 26 + 8, desenhar: (y) => linhas.map((l, j) => escrever(l, 48, y + 20 + j * 26, 18)).join('') });
    });
  }
  const svgs = emFolhas(blocos, (corpo, i) => folha(i ? `${titulo} (continuação)` : titulo, 'Para quem ensina', corpo, { nome: false }), TOPO_SEM_NOME);
  return svgs.map((svg, i) => ({ titulo: i ? `Respostas (${i + 1})` : 'Respostas', svg }));
}

/** A lista de palavras que quem ensina digitou: uma por linha (vírgula também separa). */
export function lerPalavrasDaSequencia(texto: string): string[] {
  return texto
    .split(/[\n,;]+/)
    .map((s) => textoSeguro(s).toLocaleUpperCase('pt-BR'))
    .filter(Boolean);
}

export interface OpcoesSequencia {
  partes: Partial<Record<ParteDaSequencia, boolean>>;
  /** vazio: as sugeridas pelo texto */
  palavras?: string[];
  /** o SVG do desenho de pintar do livro, se houver */
  arteColorir?: string;
}

export function montarSequencia(livro: Livro, op: OpcoesSequencia): { folhas: Folha[]; avisos: string[] } {
  const quer = (p: ParteDaSequencia) => op.partes[p] ?? true;
  const folhas: Folha[] = [];
  const avisos: string[] = [];
  const respostas: Folha[] = [];
  if (quer('texto')) folhas.push(...svgHistoriaA4(livro));
  if (quer('perguntas')) {
    if (!livro.metadados.quiz?.length) avisos.push('Este livro não tem perguntas no app: vão só as perguntas abertas.');
    folhas.push(...svgPerguntasA4(livro));
  }
  if (quer('caca')) {
    const palavras = op.palavras?.length ? op.palavras : sugerirPalavras(livro);
    const jogo = gerarCacaPalavras({ palavras, nivel: 'facil' });
    for (const f of jogo.fora) avisos.push(`Caça-palavras: ${f.palavra} ficou de fora (${f.motivo}).`);
    folhas.push({ titulo: 'Caça-palavras', svg: svgCacaPalavrasA4(jogo, { titulo: `Palavras de ${livro.metadados.titulo}` }) });
    respostas.push({ titulo: 'Caça-palavras — respostas', svg: svgCacaPalavrasA4(jogo, { titulo: `Palavras de ${livro.metadados.titulo}`, gabarito: true }) });
  }
  if (quer('ordem')) {
    const ordem = svgOrdemA4(livro);
    if (ordem) folhas.push(ordem);
    else avisos.push('A história é curta demais para a folha de ordem (precisa de quatro parágrafos narrados).');
  }
  if (quer('final')) folhas.push(svgFinalA4(livro));
  if (quer('colorir')) {
    if (op.arteColorir) folhas.push(svgColorirDoLivroA4(livro, op.arteColorir));
    else avisos.push('Este livro não tem desenho de pintar.');
  }
  if (quer('respostas')) folhas.push(...svgRespostasA4(livro), ...respostas);
  return { folhas, avisos };
}

/** O arquivo do primeiro desenho de pintar declarado no livro. */
export function arquivoDeColorir(livro: Livro): string | undefined {
  const a = livro.metadados.assets?.find((x) => x.tipo === 'colorir');
  return a?.arquivo_impressao ?? a?.arquivo_interativo;
}

