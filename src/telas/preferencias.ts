// Preferências por perfil: tema (prontos com foco em ACESSIBILIDADE, no
// espírito do Pedra Angular, ou personalizado montado pela criança),
// fonte (padrão / Atkinson Hyperlegible / OpenDyslexic) e tamanho.
// Mesmo mecanismo de variáveis CSS trocadas por [data-theme].

import { armazenamento } from '../armazenamento/armazenamento';
import { PILHAS_DE_FONTE } from '../fontes';
import type { MetadadosLivro } from '../motor/tipos';
import {
  ENTRELINHAS,
  ENTRELINHA_PADRAO,
  ESPACAMENTOS,
  ESPACAMENTO_PADRAO,
  PESO_PADRAO,
  naGrade,
  tracoDoPeso,
} from './espacamento';

export { ENTRELINHAS, ESPACAMENTOS, PESOS } from './espacamento';
import { perfilAtivo } from '../perfis/perfis';

export const TEMAS = [
  { id: 'arco-iris', rotulo: '🌈 Claro' },
  { id: 'floresta', rotulo: '🌳 Floresta' },
  { id: 'espaco', rotulo: '🚀 Espaço' },
  { id: 'alto-contraste', rotulo: '⬛ Alto contraste' },
] as const;

export const FONTES = [
  { id: 'padrao', rotulo: 'Cardo' },
  { id: 'hyperlegible', rotulo: 'Atkinson Hyperlegible' },
  { id: 'dyslexic', rotulo: 'OpenDyslexic' },
] as const;

// paletas curadas para o "Monte o seu" — fundos com texto legível garantido
export const FUNDOS_PERSONALIZADOS = [
  '#fff6ec', '#ffe8f1', '#e8f4ff', '#eefadc', '#fdf3d8', '#efe8ff',
  '#1a1a2e', '#12251a', '#2b1a2e', '#0d1130', '#232323', '#3a2440',
];

export const DESTAQUES_PERSONALIZADOS = [
  '#d62839', '#c2571b', '#1c7a3d', '#166b8a', '#5064eb', '#8e44ad',
  '#ff7ab8', '#ffd400', '#7fd4ff', '#96e46b',
];

export interface TemaPersonalizado {
  fundo: string;
  destaque: string;
}

// Mesma régua do app-leitura: passo MULTIPLICATIVO, não somar 2. Somar dá
// passos que encolhem de importância conforme a letra cresce (de 16 para 18 é
// muito; de 170 para 172 é nada). Multiplicar mantém o degrau proporcional.
//
// O teto é 180 e não 256 como no leitor: verificado em 2026-08-14, a estante
// sai limpa até 180 px e vaza a partir daí — em 256 o avatar do perfil tem
// 3,5 cm e a barra do topo não fecha. Subir o teto exige antes fazer o avatar
// e os emojis pararem de crescer junto com o texto.
const TAMANHO_MIN = 12;
const TAMANHO_MAX = 180;
const TAMANHO_PADRAO = 20;
const PASSO = 1.125;
export const PASSO_FONTE = PASSO;

export interface Preferencias {
  tema: string; // id de TEMAS ou 'personalizado'
  fonte: string;
  tamanho: number;
  entrelinha: string; // id de ENTRELINHAS
  espacamento: string; // id de ESPACAMENTOS
  peso: string; // id de PESOS
  personalizado: TemaPersonalizado | null;
}

export async function obterPreferencias(): Promise<Preferencias> {
  const p = perfilAtivo();
  return {
    tema: (await armazenamento.obter<string>(`${p.id}:tema`)) ?? 'arco-iris',
    // OpenDyslexic como PADRÃO por decisão do Bruno (2026-07-19, revisando a
    // spec §5): profissional da óptica, adorou a cara infantil e legível.
    // Continua trocável a qualquer momento no 🎨 — padrão ≠ forçada.
    fonte: (await armazenamento.obter<string>(`${p.id}:fonte`)) ?? 'dyslexic',
    tamanho: (await armazenamento.obter<number>(`${p.id}:tamanhoFonte`)) ?? TAMANHO_PADRAO,
    entrelinha: (await armazenamento.obter<string>(`${p.id}:entrelinha`)) ?? ENTRELINHA_PADRAO,
    espacamento: (await armazenamento.obter<string>(`${p.id}:espacamento`)) ?? ESPACAMENTO_PADRAO,
    peso: (await armazenamento.obter<string>(`${p.id}:pesoTraco`)) ?? PESO_PADRAO,
    personalizado: await armazenamento.obter<TemaPersonalizado>(`${p.id}:temaPersonalizado`),
  };
}

export async function carregarPreferencias(): Promise<void> {
  const prefs = await obterPreferencias();
  aplicarTema(prefs.tema, prefs.personalizado);
  aplicarFonte(prefs.fonte);
  aplicarEntrelinha(prefs.entrelinha);
  aplicarEspacamento(prefs.espacamento);
  aplicarPeso(prefs.peso);
  aplicarTamanho(prefs.tamanho);
}

// ---------- aplicação ----------

const VARS_PERSONALIZADAS = ['--fundo', '--cartao', '--texto', '--texto-suave', '--destaque', '--titulo', '--borda', '--sombra'];

export function aplicarTema(tema: string, personalizado?: TemaPersonalizado | null): void {
  const raiz = document.documentElement;
  for (const v of VARS_PERSONALIZADAS) raiz.style.removeProperty(v);

  if (tema === 'personalizado' && personalizado) {
    raiz.dataset.theme = 'personalizado';
    for (const [v, valor] of Object.entries(derivarPaleta(personalizado))) {
      raiz.style.setProperty(v, valor);
    }
  } else {
    raiz.dataset.theme = tema;
  }
}

export function aplicarFonte(fonte: string): void {
  document.documentElement.style.setProperty(
    '--fonte-corpo',
    PILHAS_DE_FONTE[fonte] ?? PILHAS_DE_FONTE.padrao,
  );
}

// O tamanho PEDIDO e a entrelinha PEDIDA ficam aqui; o que vai para a tela é
// o valor encaixado na grade de pixels (abaixo). Guardar o encaixado faria o
// A+ emperrar, arredondando sempre para o mesmo número.
let tamanhoAtual = TAMANHO_PADRAO;
let multEntrelinha = 1.7;
let pesoAtual: string = PESO_PADRAO;

/**
 * Encaixa o corpo da letra e a entrelinha na grade de pixels do aparelho.
 *
 * `line-height: 1.7` num corpo de 18px dá 30,6px. A primeira linha cai num
 * ponto da grade, a segunda 0,6px adiante, a terceira 0,2px… cada linha é
 * desenhada num ponto DIFERENTE da grade, e traço fino desenhado em pontos
 * diferentes sai ora mais grosso, ora mais fino, em faixas. Com a entrelinha
 * inteira em pixels do aparelho, todas as linhas caem no mesmo ponto. E com o
 * corpo também inteiro, a margem `1em` dos parágrafos sai inteira de graça —
 * senão cada parágrafo começaria numa fase diferente da grade.
 * (A explicação longa está no app-leitura, FontControls.tsx.)
 *
 * A entrelinha em px vai numa variável SEPARADA, usada só nos blocos de prosa
 * que têm o mesmo corpo do texto: px herda como valor fixo, e num elemento de
 * outro tamanho ficaria errada — esses usam o multiplicador.
 */
function encaixarNaGradeDePixels(): void {
  const dpr = window.devicePixelRatio || 1;
  const raiz = document.documentElement.style;
  raiz.setProperty('--tamanho-base', `${naGrade(tamanhoAtual, dpr)}px`);
  raiz.setProperty('--reading-line-height', String(multEntrelinha));
  raiz.setProperty('--reading-entrelinha-px', `${naGrade(tamanhoAtual * multEntrelinha, dpr)}px`);
  // o peso é em pixels do aparelho: muda de valor quando a densidade muda
  raiz.setProperty('--reading-stroke', tracoDoPeso(pesoAtual, dpr));
}

// a grade muda quando a janela vai para um monitor de outra densidade ou o
// navegador troca de zoom
if (typeof window !== 'undefined') {
  window.addEventListener('resize', encaixarNaGradeDePixels);
}

export function aplicarTamanho(px: number): void {
  tamanhoAtual = px;
  encaixarNaGradeDePixels();
}

export function aplicarEntrelinha(id: string): void {
  const def = ENTRELINHAS.find((e) => e.id === id) ?? ENTRELINHAS.find((e) => e.id === ENTRELINHA_PADRAO)!;
  multEntrelinha = def.mult;
  encaixarNaGradeDePixels();
}

export function aplicarPeso(id: string): void {
  pesoAtual = id;
  encaixarNaGradeDePixels();
}

export function aplicarEspacamento(id: string): void {
  const def = ESPACAMENTOS.find((e) => e.id === id) ?? ESPACAMENTOS[0];
  const raiz = document.documentElement.style;
  raiz.setProperty('--reading-letter-spacing', `${def.letra}em`);
  raiz.setProperty('--reading-word-spacing', `${def.palavra}em`);
}

/**
 * Mudar a letra refaz as linhas e empurraria o ponto de leitura para longe.
 * Ancora o bloco que está no alto da tela e o devolve ao mesmo lugar depois:
 * a criança continua exatamente onde estava.
 */
export function comAncoraDeLeitura(mudar: () => void): void {
  const y = Math.min(160, window.innerHeight / 3);
  let ancora: Element | null = null;
  for (const e of document.elementsFromPoint(window.innerWidth / 2, y)) {
    const bloco = e.closest('.leitura > *');
    if (bloco) {
      ancora = bloco;
      break;
    }
  }
  if (!ancora) {
    mudar();
    return;
  }
  const antes = ancora.getBoundingClientRect().top;
  mudar();
  window.scrollBy({ top: ancora.getBoundingClientRect().top - antes, behavior: 'instant' });
}

// ---------- persistência ----------

// Imersão temática: o app veste o tema do LIVRO enquanto ele está aberto
// (tema_livro com cores próprias, ou tema_padrao apontando para um pronto).
// Ao voltar à estante/perfis, carregarPreferencias() restaura o tema da
// criança — nada é persistido aqui.
//
// SOBERANIA DO USUÁRIO (decisão do Bruno, rodada 12): o tema do livro é
// convidado, nunca dono. Ele NÃO se aplica quando:
//   1. o perfil marcou "manter sempre o meu tema" (temaSoberano), OU
//   2. o tema do perfil é alto-contraste — necessidade de acessibilidade
//      vence decoração, sempre, sem depender de configuração.
// E ele só é aplicado ao ENTRAR no livro pela estante — se a pessoa trocar
// de tema no 🎨 no meio da leitura, a escolha dela fica valendo.
export async function aplicarTemaDeLivro(md: MetadadosLivro): Promise<void> {
  const p = perfilAtivo();
  const soberano = (await armazenamento.obter<boolean>(`${p.id}:temaSoberano`)) ?? false;
  const temaUsuario = (await armazenamento.obter<string>(`${p.id}:tema`)) ?? 'arco-iris';
  if (soberano || temaUsuario === 'alto-contraste') return;

  if (md.tema_livro?.fundo && md.tema_livro?.destaque) {
    aplicarTema('personalizado', md.tema_livro);
  } else if (md.tema_padrao && TEMAS.some((t) => t.id === md.tema_padrao)) {
    aplicarTema(md.tema_padrao);
  }
}

export async function obterTemaSoberano(): Promise<boolean> {
  return (await armazenamento.obter<boolean>(`${perfilAtivo().id}:temaSoberano`)) ?? false;
}

export async function definirTemaSoberano(valor: boolean): Promise<void> {
  await armazenamento.definir(`${perfilAtivo().id}:temaSoberano`, valor);
}

// Voz ao escolher uma cor de pintar. Desligada por padrão: quem usa leitor
// de tela já ouve o nome pelo leitor, e duas vozes juntas atrapalham.
export async function obterFalarCores(): Promise<boolean> {
  return (await armazenamento.obter<boolean>(`${perfilAtivo().id}:falarCores`)) ?? false;
}

export async function definirFalarCores(valor: boolean): Promise<void> {
  await armazenamento.definir(`${perfilAtivo().id}:falarCores`, valor);
}

export async function trocarTema(tema: string): Promise<void> {
  const prefs = await obterPreferencias();
  aplicarTema(tema, prefs.personalizado);
  await armazenamento.definir(`${perfilAtivo().id}:tema`, tema);
}

export async function trocarFonte(fonte: string): Promise<void> {
  aplicarFonte(fonte);
  await armazenamento.definir(`${perfilAtivo().id}:fonte`, fonte);
}

export async function trocarEntrelinha(id: string): Promise<void> {
  aplicarEntrelinha(id);
  await armazenamento.definir(`${perfilAtivo().id}:entrelinha`, id);
}

export async function trocarPeso(id: string): Promise<void> {
  aplicarPeso(id);
  await armazenamento.definir(`${perfilAtivo().id}:pesoTraco`, id);
}

export async function trocarEspacamento(id: string): Promise<void> {
  aplicarEspacamento(id);
  await armazenamento.definir(`${perfilAtivo().id}:espacamento`, id);
}

export async function definirPersonalizado(mudanca: Partial<TemaPersonalizado>): Promise<void> {
  const p = perfilAtivo();
  const atual = (await armazenamento.obter<TemaPersonalizado>(`${p.id}:temaPersonalizado`)) ?? {
    fundo: FUNDOS_PERSONALIZADOS[0],
    destaque: DESTAQUES_PERSONALIZADOS[0],
  };
  const novo = { ...atual, ...mudanca };
  await armazenamento.definir(`${p.id}:temaPersonalizado`, novo);
  await armazenamento.definir(`${p.id}:tema`, 'personalizado');
  aplicarTema('personalizado', novo);
}

/** `fator > 1` aumenta, `fator < 1` diminui. Ver PASSO. */
export async function ajustarTamanho(fator: number): Promise<void> {
  const novo = Math.min(TAMANHO_MAX, Math.max(TAMANHO_MIN, Math.round(tamanhoAtual * fator)));
  comAncoraDeLeitura(() => aplicarTamanho(novo));
  await armazenamento.definir(`${perfilAtivo().id}:tamanhoFonte`, novo);
}

// ---------- derivação de paleta do tema personalizado ----------
// A criança escolhe FUNDO e DESTAQUE; texto/cartão/borda são derivados
// garantindo legibilidade (texto escuro em fundo claro e vice-versa).

function derivarPaleta(t: TemaPersonalizado): Record<string, string> {
  const claro = luminancia(t.fundo) > 0.45;
  const texto = claro ? '#241d18' : '#f4f2ee';
  return {
    '--fundo': t.fundo,
    // cartão "eleva": mais claro que o fundo nos dois modos
    '--cartao': misturar(t.fundo, '#ffffff', claro ? 0.55 : 0.12),
    '--texto': texto,
    '--texto-suave': misturar(texto, t.fundo, 0.3),
    '--destaque': t.destaque,
    // cor favorita pinta os TÍTULOS — escurecida/clareada até ler bem
    '--titulo': garantirContraste(t.destaque, t.fundo, texto),
    '--borda': misturar(t.fundo, texto, 0.18),
    '--sombra': claro ? '0 4px 14px rgba(60, 40, 20, 0.14)' : '0 4px 14px rgba(0, 0, 0, 0.5)',
  };
}

// razão de contraste WCAG entre duas cores
function contraste(hexA: string, hexB: string): number {
  const la = luminanciaRelativa(hexA);
  const lb = luminanciaRelativa(hexB);
  const [maior, menor] = la > lb ? [la, lb] : [lb, la];
  return (maior + 0.05) / (menor + 0.05);
}

function luminanciaRelativa(hex: string): number {
  const canais = hexParaRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

// aproxima a cor do texto-base até atingir contraste ≥ 4.5 com o fundo
// (títulos são grandes e em negrito; o corpo do texto segue na régua ≥ 7)
function garantirContraste(cor: string, fundo: string, alvoTexto: string): string {
  let atual = cor;
  for (let passo = 0; passo < 10 && contraste(atual, fundo) < 4.5; passo++) {
    atual = misturar(atual, alvoTexto, 0.2);
  }
  return atual;
}

function hexParaRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminancia(hex: string): number {
  const [r, g, b] = hexParaRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function misturar(hexA: string, hexB: string, pesoB: number): string {
  const a = hexParaRgb(hexA);
  const b = hexParaRgb(hexB);
  const c = a.map((v, i) => Math.round(v * (1 - pesoB) + b[i] * pesoB));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
