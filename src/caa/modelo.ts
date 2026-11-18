// O MOTOR DA PRANCHA DE CAA (Comunicação Aumentativa e Alternativa).
//
// Este arquivo é puro: não toca em tela, voz nem armazenamento, e por isso é
// todo testável no Node (modelo.test.ts). As telas e a impressão só leem isto.
//
// O QUE É UM CONJUNTO
//   Uma pessoa usa um CONJUNTO de pranchas: a inicial (núcleo de palavras que
//   servem em quase toda conversa) e pranchas-filhas que se abrem por uma
//   casa-pasta (SINTO, LUGARES, COMIDA…). A professora monta um conjunto por
//   aluno, a partir da essencial ou do zero.
//
// TRÊS REGRAS DE CAA QUE O MOTOR GUARDA DE PROPÓSITO
//   1. A casa não muda de lugar sozinha. Quem usa prancha aprende a POSIÇÃO
//      (planejamento motor), como quem digita sem olhar. Nada aqui reordena,
//      sorteia ou "aprende" a frequência; a grade tem colunas fixas e, em tela
//      pequena, as casas encolhem em vez de pular de linha.
//   2. Casa vazia ocupa o lugar. Assim a professora revela vocabulário aos
//      poucos sem mexer na posição do que já foi aprendido.
//   3. A frase é telegráfica e honesta: junta o que foi tocado, na ordem.
//      O motor não corrige concordância nem inventa palavra. A única ajuda é
//      `naFrase` (abaixo), que a professora escreve.

export type CategoriaCaa =
  | 'pessoa'
  | 'acao'
  | 'estado'
  | 'coisa'
  | 'lugar'
  | 'social'
  | 'pergunta'
  // do piloto em papel; continuam valendo (cor de 'coisa' e de 'social')
  | 'necessidade'
  | 'resposta';

/** Nome de cada categoria para a professora (a cor é só apoio — nunca a única pista). */
export const CATEGORIAS: { id: CategoriaCaa; nome: string }[] = [
  { id: 'pessoa', nome: 'Pessoas' },
  { id: 'acao', nome: 'Ações' },
  { id: 'estado', nome: 'Como está, como é' },
  { id: 'coisa', nome: 'Coisas e necessidades' },
  { id: 'lugar', nome: 'Lugares' },
  { id: 'social', nome: 'Respostas e cumprimentos' },
  { id: 'pergunta', nome: 'Perguntas' },
];

export interface CasaCaa {
  id: string;
  /** o que está escrito na casa; vazio = casa vazia (guarda o lugar) */
  rotulo: string;
  /** o que a voz diz ao tocar; vazio = o próprio rótulo */
  fala?: string;
  /**
   * Como a casa entra numa frase de duas ou mais casas. Ex.: DOR sozinha diz
   * "estou com dor"; em EU + ESTOU + DOR diz "com dor". Vazio = a fala.
   */
  naFrase?: string;
  categoria: CategoriaCaa;
  /** chave em PICTOGRAMAS */
  pictograma?: string;
  /** foto ou figura da professora, já reduzida (data:image/jpeg;base64,…) */
  imagem?: string;
  /** id da prancha que esta casa abre (casa-pasta); não entra na frase */
  abre?: string;
}

export interface PranchaCaa {
  id: string;
  titulo: string;
  colunas: number;
  casas: CasaCaa[];
}

export interface AjustesCaa {
  /** fundo das casas pela cor da categoria (chave de Fitzgerald adaptada) */
  cores: boolean;
  /** a voz diz a palavra a cada toque */
  falarAoTocar: boolean;
  /** as casas tocadas se juntam numa frase no alto */
  montarFrase: boolean;
  /** depois de escolher numa prancha-filha, volta para a inicial */
  voltarAoInicio: boolean;
  /** milissegundos em que um segundo toque na MESMA casa é ignorado */
  esperaEntreToques: number;
  /** varredura: 0 = desligada; senão, milissegundos em cada casa */
  varredura: number;
}

export interface ConjuntoCaa {
  id: string;
  nome: string;
  inicial: string;
  pranchas: PranchaCaa[];
  ajustes: AjustesCaa;
}

export const AJUSTES_PADRAO: AjustesCaa = {
  cores: true,
  falarAoTocar: true,
  montarFrase: true,
  voltarAoInicio: true,
  esperaEntreToques: 400,
  varredura: 0,
};

export const LIMITES = {
  colunas: [2, 8] as const,
  casasPorPrancha: 64,
  pranchas: 30,
  rotulo: 40,
  fala: 200,
  nome: 60,
  /** bytes do data: URL de uma figura (a redução no aparelho dá ~20–40 KB) */
  imagem: 400_000,
};

// ------------------------------------------------------------------ frase ---

const minusculas = (s: string) => s.toLocaleLowerCase('pt-BR');

/** O que a voz diz ao tocar a casa sozinha. */
export function falaDaCasa(casa: CasaCaa): string {
  return (casa.fala ?? '').trim() || minusculas(casa.rotulo.trim());
}

/** A frase que a voz diz: uma casa → a fala dela; várias → cada uma `naFrase`. */
export function textoDaFrase(casas: CasaCaa[]): string {
  if (casas.length === 0) return '';
  if (casas.length === 1) return falaDaCasa(casas[0]);
  return casas
    .map((c) => (c.naFrase ?? '').trim() || falaDaCasa(c))
    .filter(Boolean)
    .join(' ');
}

/** Casa que entra na frase: tem palavra e não é pasta. */
export function entraNaFrase(casa: CasaCaa): boolean {
  return Boolean(casa.rotulo.trim()) && !casa.abre;
}

// ---------------------------------------------------------------- consulta ---

export function acharPrancha(conjunto: ConjuntoCaa, id: string): PranchaCaa | undefined {
  return conjunto.pranchas.find((p) => p.id === id);
}

export function pranchaInicial(conjunto: ConjuntoCaa): PranchaCaa {
  return acharPrancha(conjunto, conjunto.inicial) ?? conjunto.pranchas[0];
}

/** Cria um id que ainda não existe na lista ("lugares", "lugares-2"…). */
export function idLivre(base: string, usados: Iterable<string>): string {
  const ja = new Set(usados);
  const raiz =
    base
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30) || 'casa';
  if (!ja.has(raiz)) return raiz;
  let n = 2;
  while (ja.has(`${raiz}-${n}`)) n++;
  return `${raiz}-${n}`;
}

/** Cópia funda (o conjunto é só dados: JSON basta). */
export function copiar<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

// --------------------------------------------------------------- validação ---
// Tudo o que vem de arquivo (ou de um armazenamento antigo) passa por aqui.
// O que não se reconhece é DESCARTADO, nunca executado: a imagem só entra se
// for data: de PNG, JPEG ou WebP; texto é só texto (a tela usa textContent).

export type Validacao = { ok: true; conjunto: ConjuntoCaa; avisos: string[] } | { ok: false; motivo: string };

const IMAGEM_SEGURA = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;
const ID_SEGURO = /^[a-z0-9][a-z0-9-]{0,40}$/;
const CATEGORIAS_VALIDAS = new Set<string>([...CATEGORIAS.map((c) => c.id), 'necessidade', 'resposta']);

const texto = (x: unknown, max: number) => (typeof x === 'string' ? x.slice(0, max) : '');
const objeto = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

export function validarConjunto(bruto: unknown, pictogramasConhecidos: ReadonlySet<string>): Validacao {
  if (!objeto(bruto)) return { ok: false, motivo: 'O arquivo não traz uma prancha.' };
  const avisos: string[] = [];
  if (!Array.isArray(bruto.pranchas) || bruto.pranchas.length === 0) {
    return { ok: false, motivo: 'O arquivo não traz nenhuma prancha.' };
  }
  if (bruto.pranchas.length > LIMITES.pranchas) {
    return { ok: false, motivo: `São mais de ${LIMITES.pranchas} pranchas num conjunto só.` };
  }

  const idsPrancha = new Set<string>();
  const pranchas: PranchaCaa[] = [];
  for (const p of bruto.pranchas) {
    if (!objeto(p)) continue;
    const id = typeof p.id === 'string' && ID_SEGURO.test(p.id) && !idsPrancha.has(p.id)
      ? p.id
      : idLivre(texto(p.titulo, 30) || 'prancha', idsPrancha);
    idsPrancha.add(id);
    const [min, max] = LIMITES.colunas;
    const colunas = Math.min(max, Math.max(min, Math.round(Number(p.colunas) || 4)));
    const casasBrutas = Array.isArray(p.casas) ? p.casas.slice(0, LIMITES.casasPorPrancha) : [];
    if (Array.isArray(p.casas) && p.casas.length > LIMITES.casasPorPrancha) {
      avisos.push(`A prancha "${texto(p.titulo, 40)}" tinha casas demais; ficaram as ${LIMITES.casasPorPrancha} primeiras.`);
    }
    const idsCasa = new Set<string>();
    const casas: CasaCaa[] = [];
    for (const c of casasBrutas) {
      if (!objeto(c)) continue;
      const rotulo = texto(c.rotulo, LIMITES.rotulo);
      const idCasa = typeof c.id === 'string' && ID_SEGURO.test(c.id) && !idsCasa.has(c.id)
        ? c.id
        : idLivre(rotulo || 'casa', idsCasa);
      idsCasa.add(idCasa);
      const casa: CasaCaa = {
        id: idCasa,
        rotulo,
        categoria: (CATEGORIAS_VALIDAS.has(String(c.categoria)) ? c.categoria : 'coisa') as CategoriaCaa,
      };
      const fala = texto(c.fala, LIMITES.fala).trim();
      if (fala) casa.fala = fala;
      const naFrase = texto(c.naFrase, LIMITES.fala).trim();
      if (naFrase) casa.naFrase = naFrase;
      if (typeof c.pictograma === 'string') {
        if (pictogramasConhecidos.has(c.pictograma)) casa.pictograma = c.pictograma;
        else avisos.push(`Desenho desconhecido "${c.pictograma.slice(0, 30)}" deixado de fora.`);
      }
      if (typeof c.imagem === 'string') {
        if (c.imagem.length <= LIMITES.imagem && IMAGEM_SEGURA.test(c.imagem)) casa.imagem = c.imagem;
        else avisos.push(`Uma figura de "${rotulo}" não foi aceita.`);
      }
      if (typeof c.abre === 'string') casa.abre = c.abre; // conferido abaixo
      casas.push(casa);
    }
    pranchas.push({ id, titulo: texto(p.titulo, LIMITES.rotulo) || 'Prancha', colunas, casas });
  }
  if (pranchas.length === 0) return { ok: false, motivo: 'O arquivo não traz nenhuma prancha.' };

  // casa-pasta só vale se a prancha que ela abre existe (e não é a própria)
  for (const p of pranchas) {
    for (const c of p.casas) {
      if (c.abre !== undefined && (!idsPrancha.has(c.abre) || c.abre === p.id)) {
        avisos.push(`A casa "${c.rotulo}" apontava para uma prancha que não existe.`);
        delete c.abre;
      }
    }
  }

  const ajustesBrutos = objeto(bruto.ajustes) ? bruto.ajustes : {};
  const bool = (k: keyof AjustesCaa) =>
    typeof ajustesBrutos[k] === 'boolean' ? (ajustesBrutos[k] as boolean) : (AJUSTES_PADRAO[k] as boolean);
  const num = (k: keyof AjustesCaa, max: number) => {
    const n = Number(ajustesBrutos[k]);
    return Number.isFinite(n) ? Math.min(max, Math.max(0, Math.round(n))) : (AJUSTES_PADRAO[k] as number);
  };
  const ajustes: AjustesCaa = {
    cores: bool('cores'),
    falarAoTocar: bool('falarAoTocar'),
    montarFrase: bool('montarFrase'),
    voltarAoInicio: bool('voltarAoInicio'),
    esperaEntreToques: num('esperaEntreToques', 5000),
    varredura: num('varredura', 10000),
  };
  // varredura rápida demais é impossível de acompanhar: 0 ou pelo menos 0,8 s
  if (ajustes.varredura > 0 && ajustes.varredura < 800) ajustes.varredura = 800;

  const inicial = typeof bruto.inicial === 'string' && idsPrancha.has(bruto.inicial) ? bruto.inicial : pranchas[0].id;
  const id = typeof bruto.id === 'string' && ID_SEGURO.test(bruto.id) ? bruto.id : 'conjunto';
  return {
    ok: true,
    conjunto: { id, nome: texto(bruto.nome, LIMITES.nome) || 'Prancha', inicial, pranchas, ajustes },
    avisos,
  };
}

// ------------------------------------------------------------------ arquivo ---
// O arquivo que viaja do computador da professora para o tablet do aluno
// (e para a família): um JSON só, com as figuras dentro.

export const FORMATO_ARQUIVO = 'historinhas-prancha-caa';

export function paraArquivo(conjunto: ConjuntoCaa): string {
  return JSON.stringify({ formato: FORMATO_ARQUIVO, versao: 1, conjunto });
}

export function deArquivo(texto: string, pictogramas: ReadonlySet<string>): Validacao {
  let dado: unknown;
  try {
    dado = JSON.parse(texto);
  } catch {
    return { ok: false, motivo: 'Este arquivo não é uma prancha do Historinhas.' };
  }
  if (!objeto(dado) || dado.formato !== FORMATO_ARQUIVO) {
    return { ok: false, motivo: 'Este arquivo não é uma prancha do Historinhas.' };
  }
  return validarConjunto(dado.conjunto, pictogramas);
}

export function nomeDoArquivo(conjunto: ConjuntoCaa): string {
  return `prancha-${idLivre(conjunto.nome, [])}.json`;
}
