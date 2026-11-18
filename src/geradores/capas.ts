// Capas para imprimir, no estilo das capas da Oficina (C:\Projetos\OFICINA\CAPAS):
//
//   moldura   capa de caderno, apostila ou trabalho, com ornamento em volta
//   abnt      capa de trabalho escolar na ordem da NBR 14724 (instituição,
//             autor, título, subtítulo, local, ano), sem ornamento
//   leituras  capa de tópico: título e a lista de textos (autor e título)
//
// Decisões do Bruno (2026-11-18): sem colofão e sem "Pedra Angular" no
// Historinhas; o ornamento é uma OPÇÃO (ver ornamentos.ts).

import { TINTA, escrever, folhaNua, n, negrito, quebrar, textoSeguro } from './comum';
import { moldura, recuo, type Ornamento } from './ornamentos';

export type ModeloCapa = 'moldura' | 'abnt' | 'leituras';

export interface DadosCapa {
  /** linhas do alto: escola, curso, turma… (uma por linha) */
  alto?: string;
  titulo: string;
  subtitulo?: string;
  /** quem fez: aluno, autor, turma */
  nome?: string;
  /** a última linha: cidade e ano */
  rodape?: string;
  /** só na capa de leituras: "Autor — Título", uma por linha */
  itens?: string;
  ornamento?: Ornamento;
}

const linhas = (s?: string) =>
  (s ?? '')
    .split('\n')
    .map((l) => textoSeguro(l))
    .filter(Boolean);

/** O pequeno separador das capas da Oficina: traço, losango, traço. */
function separador(cx: number, y: number, largura = 120): string {
  const l = largura / 2;
  return (
    `<path d="M${n(cx - l)} ${y}H${n(cx - 12)} M${n(cx + 12)} ${y}H${n(cx + l)}" stroke="${TINTA}" stroke-width="1.6"/>` +
    `<path d="M${cx} ${y - 6}L${cx + 6} ${y}L${cx} ${y + 6}L${cx - 6} ${y}Z" fill="none" stroke="${TINTA}" stroke-width="1.6"/>`
  );
}

/** Texto centrado, quebrado em linhas que cabem; devolve o desenho e onde parou. */
function centrado(texto: string, cx: number, y: number, tamanho: number, largura: number, entrelinha = 1.3, maiusculas = false, espaco = 0) {
  const t = maiusculas ? texto.toLocaleUpperCase('pt-BR') : texto;
  const ls = quebrar(t, largura / (1 + espaco * 1.6), tamanho);
  const desenho = ls.map((l, i) => escrever(l, cx, y + i * tamanho * entrelinha, tamanho, 'middle', largura, espaco)).join('');
  return { desenho, fim: y + (ls.length - 1) * tamanho * entrelinha };
}

export function svgCapaMolduraA4(d: DadosCapa): string {
  const orn = d.ornamento ?? 'meandro';
  const x = 40;
  const y = 40;
  const w = 720;
  const h = 1051;
  const r = recuo(orn);
  const largura = w - 2 * r - 20;
  let corpo = moldura(orn, x, y, w, h);
  const cx = 400;
  // alto: escola, turma (letra pequena, espaçada)
  let yy = y + r + 70;
  for (const l of linhas(d.alto)) {
    corpo += escrever(l.toLocaleUpperCase('pt-BR'), cx, yy, 15, 'middle', largura, 0.35);
    yy += 26;
  }
  // título no meio, grande
  const titulo = centrado(textoSeguro(d.titulo) || 'Título', cx, 430, 60, largura, 1.2, true, 0.06);
  corpo += titulo.desenho;
  let fim = titulo.fim;
  corpo += separador(cx, fim + 60);
  fim += 60;
  if (d.subtitulo) {
    const sub = centrado(textoSeguro(d.subtitulo), cx, fim + 64, 26, largura);
    corpo += sub.desenho;
  }
  // nome e rodapé, embaixo
  const base = y + h - r - 40;
  if (d.nome) corpo += escrever(textoSeguro(d.nome).toLocaleUpperCase('pt-BR'), cx, base - 130, 24, 'middle', largura, 0.18);
  else corpo += escrever('Nome:', cx - 240, base - 130, 20) + `<path d="M${cx - 170} ${base - 128}H${cx + 240}" stroke="${TINTA}" stroke-width="1.4"/>`;
  if (d.rodape) corpo += escrever(textoSeguro(d.rodape), cx, base, 17, 'middle', largura, 0.12);
  return folhaNua(textoSeguro(d.titulo) || 'Capa', corpo);
}

/**
 * Capa de trabalho escolar na ordem da ABNT (NBR 14724): instituição no alto,
 * autor, título (em destaque) e subtítulo no meio, local e ano embaixo.
 */
export function svgCapaAbntA4(d: DadosCapa): string {
  const cx = 400;
  const largura = 640;
  let corpo = '';
  let y = 150;
  for (const l of linhas(d.alto)) {
    const c = centrado(l, cx, y, 21, largura, 1.3, true);
    corpo += c.desenho;
    y = c.fim + 30;
  }
  if (d.nome) corpo += centrado(textoSeguro(d.nome), cx, 470, 21, largura).desenho;
  const titulo = centrado(textoSeguro(d.titulo) || 'Título do trabalho', cx, 640, 23, largura, 1.35, true);
  // título em negrito: cada linha engrossada (a letra só tem um peso)
  corpo += titulo.desenho.replace(/stroke="none"/g, `stroke="${TINTA}" stroke-width="26" stroke-linejoin="round"`);
  if (d.subtitulo) corpo += centrado(textoSeguro(d.subtitulo), cx, titulo.fim + 34, 21, largura, 1.3, true).desenho;
  const rodape = linhas(d.rodape);
  rodape.forEach((l, i) => (corpo += escrever(l, cx, 1010 + i * 30, 21, 'middle', largura)));
  return folhaNua(textoSeguro(d.titulo) || 'Capa', corpo);
}

/** Capa de tópico: disciplina no alto, título, e a lista de textos. */
export function svgCapaLeiturasA4(d: DadosCapa): string {
  const orn = d.ornamento ?? 'meandro';
  const x = 40;
  const y = 40;
  const w = 720;
  const h = 1051;
  const r = recuo(orn);
  const largura = w - 2 * r - 20;
  const cx = 400;
  let corpo = moldura(orn, x, y, w, h);
  let yy = y + r + 50;
  for (const l of linhas(d.alto)) {
    const c = centrado(l, cx, yy, 16, largura, 1.3, true);
    corpo += c.desenho;
    yy = c.fim + 24;
  }
  const titulo = centrado(textoSeguro(d.titulo) || 'Tópico', cx, yy + 80, 44, largura);
  corpo += negrito(titulo.desenho, 14);
  yy = titulo.fim;
  if (d.subtitulo) {
    const sub = centrado(textoSeguro(d.subtitulo), cx, yy + 50, 20, largura);
    corpo += sub.desenho;
    yy = sub.fim;
  }
  yy += 70;
  corpo += `<path d="M${cx - 150} ${yy}H${cx + 150}" stroke="${TINTA}" stroke-width="1.4"/>`;
  yy += 70;
  for (const item of linhas(d.itens).slice(0, 8)) {
    const [autor, ...resto] = item.split(/\s+[—–-]\s+/);
    const obra = resto.join(' — ');
    corpo += centrado(autor, cx, yy, 21, largura).desenho;
    if (obra) {
      const o = centrado(obra, cx, yy + 28, 16, largura);
      corpo += o.desenho;
      yy = o.fim;
    }
    yy += 64;
  }
  corpo += `<path d="M${cx - 150} ${yy}H${cx + 150}" stroke="${TINTA}" stroke-width="1.4"/>`;
  const base = y + h - r - 30;
  if (d.rodape) corpo += escrever(textoSeguro(d.rodape), cx, base, 16, 'middle', largura);
  if (d.nome) corpo += escrever(textoSeguro(d.nome), cx, base - 36, 18, 'middle', largura);
  return folhaNua(textoSeguro(d.titulo) || 'Capa', corpo);
}

export function svgCapaA4(modelo: ModeloCapa, d: DadosCapa): string {
  if (modelo === 'abnt') return svgCapaAbntA4(d);
  if (modelo === 'leituras') return svgCapaLeiturasA4(d);
  return svgCapaMolduraA4(d);
}
