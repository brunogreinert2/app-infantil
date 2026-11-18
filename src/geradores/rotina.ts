// Rotina visual: a agenda do dia com hora, desenho e palavra; o passo a passo
// (lavar as mãos, escovar os dentes) para a parede; cartões para recortar e
// prender com velcro; e o quadro "primeiro → depois".
//
// Recurso muito usado no AEE (autismo, deficiência intelectual) e na educação
// infantil. A rotina é montada PARA a pessoa, por quem a conhece: os modelos
// são ponto de partida, não prescrição (ver docs/MEMORIA_PEDAGOGICA.md).

import { NOMES_DOS_PICTOGRAMAS, PICTOGRAMAS } from '../caa/pictogramas';
import { TINTA, escrever, folha, folhaNua, mm, n, negrito, soLetras, textoSeguro } from './comum';
import { cabecalho, face, paginar, recorte, type Folha } from './jogosDeMesa';

export interface Passo {
  /** "7:00", como foi escrita (sem hora: vazio) */
  hora: string;
  texto: string;
  figura?: string;
}

// Jeitos comuns de dizer o mesmo passo → a chave do desenho.
const SINONIMOS: Record<string, string> = {
  CAFE: 'cafe',
  CAFEDAMANHA: 'cafe',
  TOMARCAFE: 'cafe',
  ALMOCO: 'comer',
  ALMOCAR: 'comer',
  JANTAR: 'comer',
  JANTA: 'comer',
  BRINCAR: 'recreio',
  BANHO: 'banho',
  ESCOVAROSDENTES: 'escovar-dentes',
  ESCOVARDENTES: 'escovar-dentes',
  DENTES: 'escovar-dentes',
  ESCOVAR: 'escovar-dentes',
  VESTIR: 'vestir',
  ROUPA: 'vestir',
  TROCARDEROUPA: 'vestir',
  LAVARASMAOS: 'esfregar',
  LAVARMAOS: 'esfregar',
  MAOS: 'esfregar',
  TAREFA: 'caderno',
  TEMA: 'caderno',
  LICAODECASA: 'caderno',
  LER: 'livro',
  LEITURA: 'livro',
  HISTORIA: 'livro',
  SECAR: 'toalha',
  CUSPIR: 'pia',
  TORNEIRA: 'torneira',
  ABRIR: 'torneira',
  FECHAR: 'fechar-torneira',
  ESFREGAR: 'esfregar',
  ENXAGUAR: 'enxaguar',
  SABAO: 'sabonete',
  PASTA: 'pasta',
  NANAR: 'dormir',
  DESCANSO: 'descansar',
  XIXI: 'banheiro',
};

const POR_NOME = new Map<string, string>();
for (const chave of Object.keys(PICTOGRAMAS)) {
  POR_NOME.set(soLetras(chave), chave);
  const nome = NOMES_DOS_PICTOGRAMAS[chave];
  if (nome) POR_NOME.set(soLetras(nome), chave);
}
for (const [palavra, chave] of Object.entries(SINONIMOS)) if (PICTOGRAMAS[chave]) POR_NOME.set(palavra, chave);

/**
 * O desenho de um passo: a frase inteira ("escovar os dentes") ou, se não
 * houver, a palavra MAIS LONGA que tenha desenho ("pegar o ônibus" → ônibus;
 * "ir para a escola" → escola, e não "ir").
 */
export function figuraDoPasso(texto: string): string | undefined {
  const inteira = POR_NOME.get(soLetras(texto));
  if (inteira) return inteira;
  const palavras = texto
    .split(/\s+/)
    .map((p) => soLetras(p))
    .filter((p) => p.length >= 2)
    .sort((a, b) => b.length - a.length);
  for (const p of palavras) {
    const chave = POR_NOME.get(p);
    if (chave) return chave;
  }
  return undefined;
}

/** Um passo por linha; hora opcional no começo: "7:00 Acordar", "7h30 café". */
export function lerPassos(texto: string): Passo[] {
  const passos: Passo[] = [];
  for (const bruta of texto.split('\n')) {
    const linha = textoSeguro(bruta);
    if (!linha) continue;
    const m = linha.match(/^(\d{1,2})\s*(?:[:h.]\s*(\d{2}))?\s*(?:h\b)?\s*[-–—]?\s+(.+)$/i);
    let hora = '';
    let resto = linha;
    if (m && Number(m[1]) <= 23) {
      hora = `${Number(m[1])}:${m[2] ?? '00'}`;
      resto = m[3];
    }
    passos.push({ hora, texto: resto, figura: figuraDoPasso(resto) });
  }
  return passos.slice(0, 40);
}

export const MODELOS: Record<string, { nome: string; titulo: string; passos: string }> = {
  manha: {
    nome: 'Manhã de escola',
    titulo: 'Minha manhã',
    passos: '7:00 Acordar\n7:10 Ir ao banheiro\n7:15 Vestir a roupa\n7:30 Café da manhã\n7:45 Escovar os dentes\n7:50 Pegar a mochila\n8:00 Ônibus\n8:30 Escola',
  },
  tarde: {
    nome: 'Tarde em casa',
    titulo: 'Minha tarde',
    passos: '12:00 Almoço\n12:30 Escovar os dentes\n13:00 Descansar\n14:00 Tarefa\n15:00 Lanche\n15:30 Brincar\n17:00 Ler um livro',
  },
  noite: {
    nome: 'Noite',
    titulo: 'Minha noite',
    passos: '18:30 Tomar banho\n19:00 Jantar\n19:30 Brincar\n20:15 Escovar os dentes\n20:30 Ler uma história\n21:00 Dormir',
  },
  escola: {
    nome: 'Dia na escola',
    titulo: 'Meu dia na escola',
    passos: 'Chegar na escola\nSala de aula\nLanche\nRecreio\nSala de aula\nBanheiro\nÔnibus para casa',
  },
  maos: {
    nome: 'Como lavar as mãos',
    titulo: 'Como lavar as mãos',
    passos: 'Abrir a torneira\nPegar o sabonete\nEsfregar as mãos\nEnxaguar as mãos\nFechar a torneira\nSecar com a toalha',
  },
  dentes: {
    nome: 'Como escovar os dentes',
    titulo: 'Como escovar os dentes',
    passos: 'Pasta na escova\nEscovar os dentes\nCuspir na pia\nEnxaguar a boca com água\nFechar a torneira\nSecar com a toalha',
  },
};

const comoEscrever = (texto: string, maiusculas: boolean) => (maiusculas ? texto.toLocaleUpperCase('pt-BR') : texto);

/** Desenho do passo, ou a moldura vazia para desenhar/colar (sem ponto de interrogação). */
function desenhoOuEspaco(p: Passo, x: number, y: number, lado: number): string {
  if (p.figura) return face({ texto: '', figura: p.figura }, x, y, lado, lado, 'figura');
  return `<rect x="${n(x + lado * 0.1)}" y="${n(y + lado * 0.1)}" width="${n(lado * 0.8)}" height="${n(lado * 0.8)}" rx="10" fill="none" stroke="${TINTA}" stroke-width="1.6" stroke-dasharray="6 6"/>`;
}

export interface OpcoesRotina {
  titulo?: string;
  /** palavras em letra de forma maiúscula (padrão, como na prancha) */
  maiusculas?: boolean;
}

/**
 * A agenda do dia em lista: hora, desenho, palavra e uma caixa para marcar
 * "feito". Oito passos por folha.
 */
export function svgRotinaListaA4(passos: Passo[], op: OpcoesRotina = {}): Folha[] {
  const maius = op.maiusculas ?? true;
  const comHora = passos.some((p) => p.hora);
  const titulo = textoSeguro(op.titulo ?? '') || 'Minha rotina';
  const paginas = paginar(passos, 8);
  return paginas.map((pagina, i): Folha => {
    let corpo = '';
    const alt = 108;
    const xDesenho = comHora ? 170 : 60;
    pagina.forEach((p, k) => {
      const y = 182 + k * alt;
      corpo += `<rect x="48" y="${y}" width="704" height="${alt - 12}" rx="14" fill="none" stroke="${TINTA}" stroke-width="2.4"/>`;
      if (comHora && p.hora) corpo += negrito(escrever(p.hora, 108, y + alt / 2 + 6, 34, 'middle', 110), 20);
      corpo += desenhoOuEspaco(p, xDesenho, y + 4, alt - 20);
      corpo += escrever(comoEscrever(p.texto, maius), xDesenho + alt + 4, y + alt / 2 + 6, 36, 'start', 600 - xDesenho - alt + 48);
      corpo += `<rect x="${686 - 4}" y="${y + 24}" width="48" height="48" rx="8" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
    });
    corpo += escrever('feito', 706, 176, 15, 'middle');
    const nome = paginas.length > 1 ? `${titulo} (${i + 1})` : titulo;
    return { titulo: nome, svg: folha(nome, 'Rotina', corpo) };
  });
}

/**
 * Passo a passo para a parede: cartões grandes numerados, na ordem de leitura.
 * Até 4 passos: 2 × 2; até 6: 2 × 3; mais que isso, 3 × 3 por folha.
 */
export function svgPassoAPassoA4(passos: Passo[], op: OpcoesRotina = {}): Folha[] {
  const maius = op.maiusculas ?? true;
  const titulo = textoSeguro(op.titulo ?? '') || 'Passo a passo';
  const porFolha = passos.length <= 4 ? 4 : passos.length <= 6 ? 6 : 9;
  const colunas = porFolha === 9 ? 3 : 2;
  const linhas = porFolha / colunas;
  const gap = 18;
  const topo = 140;
  const w = (704 - gap * (colunas - 1)) / colunas;
  const h = (1090 - topo - gap * (linhas - 1)) / linhas;
  const paginas = paginar(passos, porFolha);
  return paginas.map((pagina, i): Folha => {
    let corpo = negrito(escrever(titulo, 400, 96, 44, 'middle', 704), 20);
    pagina.forEach((p, k) => {
      const numero = i * porFolha + k + 1;
      const x = 48 + (k % colunas) * (w + gap);
      const y = topo + Math.floor(k / colunas) * (h + gap);
      corpo += `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="18" fill="none" stroke="${TINTA}" stroke-width="4"/>`;
      const r = Math.min(30, w * 0.1);
      corpo += `<circle cx="${n(x + r + 12)}" cy="${n(y + r + 12)}" r="${n(r)}" fill="${TINTA}"/>`;
      corpo += escrever(String(numero), x + r + 12, y + r + 12 + r * 0.42, r * 1.15, 'middle').replace(`fill="${TINTA}"`, 'fill="#ffffff"');
      const alturaTexto = Math.min(70, h * 0.24);
      const lado = Math.min(w - 40, h - alturaTexto - 30);
      corpo += desenhoOuEspaco(p, x + (w - lado) / 2, y + 14, lado);
      const tam = Math.min(34, alturaTexto * 0.5);
      corpo += escrever(comoEscrever(p.texto, maius), x + w / 2, y + h - alturaTexto / 2 + tam * 0.3, tam, 'middle', w - 28);
    });
    const nome = paginas.length > 1 ? `${titulo} (${i + 1})` : titulo;
    return { titulo: nome, svg: folhaNua(nome, corpo) };
  });
}

/** Cartões de 60 × 60 mm para recortar (e prender com velcro), nove por folha. */
export function svgCartoesRotinaA4(passos: Passo[], op: OpcoesRotina & { hora?: boolean } = {}): Folha[] {
  const maius = op.maiusculas ?? true;
  const lado = mm(60);
  const x0 = 400 - lado * 1.5;
  const y0 = 120;
  const paginas = paginar(passos, 9);
  return paginas.map((pagina, i): Folha => {
    let corpo = cabecalho('Cartões da rotina', 'Recorte no tracejado. Cole em papelão e use velcro atrás, se quiser.');
    pagina.forEach((p, k) => {
      const x = x0 + (k % 3) * lado;
      const y = y0 + Math.floor(k / 3) * lado;
      const temHora = op.hora && p.hora;
      corpo += desenhoOuEspaco(p, x + lado * 0.18, y + (temHora ? 36 : 16), lado * 0.64);
      if (temHora) corpo += negrito(escrever(p.hora, x + lado / 2, y + 30, 22, 'middle'), 16);
      corpo += escrever(comoEscrever(p.texto, maius), x + lado / 2, y + lado - 20, 22, 'middle', lado - 20);
    });
    corpo += recorte(x0, y0, lado, lado, 3, Math.ceil(pagina.length / 3));
    return { titulo: `Cartões${paginas.length > 1 ? ` ${i + 1}` : ''}`, svg: folhaNua('Cartões da rotina', corpo) };
  });
}

/**
 * Quadro "primeiro → depois": duas casas grandes para colar os cartões (ou
 * desenhar). Com dois passos na lista, já vem preenchido com eles.
 */
export function svgPrimeiroDepoisA4(passos: Passo[], op: OpcoesRotina = {}): string {
  const maius = op.maiusculas ?? true;
  let corpo = '';
  const w = 320;
  const h = 520;
  const y = 380; // o quadro fica no meio da folha
  (['PRIMEIRO', 'DEPOIS'] as const).forEach((rotulo, i) => {
    const x = 48 + i * (w + 64);
    corpo += `<rect x="${x}" y="${y - 110}" width="${w}" height="90" rx="16" fill="${TINTA}"/>`;
    corpo += escrever(rotulo, x + w / 2, y - 48, 46, 'middle').replace(`fill="${TINTA}"`, 'fill="#ffffff"');
    corpo += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="none" stroke="${TINTA}" stroke-width="5"/>`;
    const p = passos.length === 2 ? passos[i] : undefined;
    if (p) {
      corpo += desenhoOuEspaco(p, x + 30, y + 40, w - 60);
      corpo += escrever(comoEscrever(p.texto, maius), x + w / 2, y + h - 60, 40, 'middle', w - 30);
    } else {
      corpo += `<rect x="${x + 40}" y="${y + 60}" width="${w - 80}" height="${w - 80}" rx="14" fill="none" stroke="${TINTA}" stroke-width="2" stroke-dasharray="10 8"/>`;
      corpo += escrever('cole aqui', x + w / 2, y + 60 + (w - 80) / 2 + 8, 24, 'middle');
    }
  });
  // a seta entre as duas casas
  corpo += `<path d="M372 ${y + h / 2} H428 M412 ${y + h / 2 - 18} L430 ${y + h / 2} L412 ${y + h / 2 + 18}" fill="none" stroke="${TINTA}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
  return folhaNua('Primeiro, depois', corpo);
}

export type ModeloRotina = 'lista' | 'passos' | 'cartoes' | 'primeiroDepois';

export function folhasDaRotina(
  modelo: ModeloRotina,
  passos: Passo[],
  op: OpcoesRotina & { hora?: boolean } = {},
): Folha[] {
  switch (modelo) {
    case 'lista':
      return svgRotinaListaA4(passos, op);
    case 'passos':
      return svgPassoAPassoA4(passos, op);
    case 'cartoes':
      return svgCartoesRotinaA4(passos, op);
    case 'primeiroDepois': {
      const quadro: Folha = { titulo: 'Primeiro, depois', svg: svgPrimeiroDepoisA4(passos, op) };
      // com mais de dois passos, os cartões vêm junto para recortar e colar
      return passos.length === 2 || !passos.length ? [quadro] : [quadro, ...svgCartoesRotinaA4(passos, op)];
    }
  }
}
