// Preferências por perfil: tema (prontos com foco em ACESSIBILIDADE, no
// espírito do Pedra Angular, ou personalizado montado pela criança),
// fonte (padrão / Atkinson Hyperlegible / OpenDyslexic) e tamanho.
// Mesmo mecanismo de variáveis CSS trocadas por [data-theme].

import { armazenamento } from '../armazenamento/armazenamento';
import { PILHAS_DE_FONTE } from '../fontes';
import type { MetadadosLivro } from '../motor/tipos';
import { perfilAtivo } from '../perfis/perfis';

export const TEMAS = [
  { id: 'arco-iris', rotulo: '🌈 Claro' },
  { id: 'floresta', rotulo: '🌳 Floresta' },
  { id: 'espaco', rotulo: '🚀 Espaço' },
  { id: 'alto-contraste', rotulo: '⬛ Alto contraste' },
] as const;

export const FONTES = [
  { id: 'padrao', rotulo: 'Padrão' },
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

const TAMANHO_MIN = 16;
const TAMANHO_MAX = 30;
const TAMANHO_PADRAO = 20;

export interface Preferencias {
  tema: string; // id de TEMAS ou 'personalizado'
  fonte: string;
  tamanho: number;
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
    personalizado: await armazenamento.obter<TemaPersonalizado>(`${p.id}:temaPersonalizado`),
  };
}

export async function carregarPreferencias(): Promise<void> {
  const prefs = await obterPreferencias();
  aplicarTema(prefs.tema, prefs.personalizado);
  aplicarFonte(prefs.fonte);
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

export function aplicarTamanho(px: number): void {
  document.documentElement.style.setProperty('--tamanho-base', `${px}px`);
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

export async function trocarTema(tema: string): Promise<void> {
  const prefs = await obterPreferencias();
  aplicarTema(tema, prefs.personalizado);
  await armazenamento.definir(`${perfilAtivo().id}:tema`, tema);
}

export async function trocarFonte(fonte: string): Promise<void> {
  aplicarFonte(fonte);
  await armazenamento.definir(`${perfilAtivo().id}:fonte`, fonte);
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

export async function ajustarTamanho(delta: number): Promise<void> {
  const atual =
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tamanho-base'), 10) ||
    TAMANHO_PADRAO;
  const novo = Math.min(TAMANHO_MAX, Math.max(TAMANHO_MIN, atual + delta));
  aplicarTamanho(novo);
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
