// Painel lateral — o "Φ" do Historinhas. Abre ao tocar no avatar da barra do
// topo, em QUALQUER tela (leitura, pintura, anotações…).
//
// É uma árvore de pastas de verdade, como a do Pedra Angular (pedido do
// Bruno, 2026-11-11): tocar numa pasta a ABRE ALI MESMO, para baixo, e a
// recolhe de novo; vai-se descendo até chegar no livro, e tocar no livro é
// que abre. Histórias → Primeiras Aventuras → O Corvo e o Jarro.
//
// Mora fora do #app (que é esvaziado a cada troca de tela), direto no <body>.
//
// Dois modos:
//   • gaveta (padrão, e sempre no celular): cobre a tela, com fundo escuro;
//     prende o foco, fecha no Esc, no ✕ ou tocando fora, e devolve o foco ao
//     avatar;
//   • fixo (📌, só em tela larga): fica aberto ao lado do conteúdo, como o
//     painel do Pedra Angular. Não prende foco nem cobre nada.
//
// Trocar de perfil continua SEM trava parental (princípio 5 do app).
//
// Desde 2026-11-12, como a Biblioteca do Pedra Angular: um campo de pesquisa
// no alto (livro, autor, pasta, texto próprio) e "Minhas anotações" como
// pasta que abre ali mesmo, com cada texto dentro.

import { armazenamento } from '../armazenamento/armazenamento';
import { livros } from '../conteudo/catalogo';
import { EMOJIS_CAPA } from '../conteudo/capas';
import { PASTAS, contarLivros, secoesDaPasta, type Pasta } from '../conteudo/pastas';
import { perfilAtivo, temPerfilAtivo } from '../perfis/perfis';
import { listarTextos } from '../armazenamento/textos';
import { combina, nomeParaMostrar, type TextoProprio } from '../conteudo/textosProprios';
import { el } from './comum';

export interface NavPainel {
  livro: (id: string) => void;
  anotacoes: () => void;
  /** abre um texto próprio pelo id */
  texto: (id: string) => void;
  /** abre uma pasta da estante (resultado da pesquisa) */
  pasta?: (id: string) => void;
  pinturas: () => void;
  perfis: () => void;
}

/** id do item "Minhas anotações" (não é pasta: é um lugar) */
export const LOCAL_ANOTACOES = 'anotacoes';
/** id do item "Minhas pinturas" */
export const LOCAL_PINTURAS = 'pinturas';
/** a PASTA "Minhas anotações" no menu (o item de dentro, LOCAL_ANOTACOES, abre a tela) */
const PASTA_ANOTACOES = 'pasta-anotacoes';
/** onde a criança está quando lê/edita um texto próprio */
export const localDoTexto = (id: string) => `texto:${id}`;

// igual ao @media de estilos.css: abaixo disto não cabe painel + desenho
const TELA_LARGA = '(min-width: 1200px)';

let nav: NavPainel | null = null;
let local: string | null = null;
let fixo = false;
let painel: HTMLElement | null = null;
let fundo: HTMLElement | null = null;
let origem: HTMLElement | null = null; // quem abriu: recebe o foco de volta
// pastas abertas no menu; vale enquanto o app estiver aberto
const abertas = new Set<string>();
// os textos do perfil, lidos do IndexedDB (que é assíncrono) quando o menu abre
let textos: TextoProprio[] = [];
// o que está escrito na pesquisa: sobrevive a redesenhar o menu
let consulta = '';

const telaLarga = () => window.matchMedia(TELA_LARGA).matches;
const fixadoAgora = () => fixo && telaLarga();
const idsDosLivros = () => livros.map((l) => l.id);

export function configurarPainel(n: NavPainel): void {
  nav = n;
}

export function painelConfigurado(): boolean {
  return nav !== null;
}

// as pastas que levam até um lugar (livro ou pasta), de fora para dentro
function caminhoAte(id: string): string[] {
  if (id.startsWith('texto:') || id === LOCAL_ANOTACOES) return [PASTA_ANOTACOES];
  const descer = (pastas: Pasta[], trilha: string[]): string[] | null => {
    for (const p of pastas) {
      const aqui = [...trilha, p.id];
      if (p.id === id) return trilha;
      if (p.livros.includes(id)) return aqui;
      const dentro = descer(p.filhas, aqui);
      if (dentro) return dentro;
    }
    return null;
  };
  return descer(PASTAS, []) ?? [];
}

/** Onde a criança está: id de livro, id de pasta, LOCAL_ANOTACOES ou null. */
export function marcarLocal(id: string | null): void {
  local = id;
  // o caminho até onde ela está fica aberto: o menu sempre mostra "você está aqui"
  if (id) for (const pasta of caminhoAte(id)) abertas.add(pasta);
  if (painel) desenhar(painel.classList.contains('aberto'));
}

/** Lê de novo os textos do perfil e, se o menu está à vista, redesenha. */
export async function atualizarTextosDoPainel(): Promise<void> {
  if (!temPerfilAtivo()) return;
  textos = await listarTextos(perfilAtivo().id).catch(() => textos);
  if (painel) desenhar(painel.classList.contains('aberto'));
}

/** Ao entrar num perfil: lê se ESTE perfil deixou o painel fixo. */
export async function prepararPainel(): Promise<void> {
  textos = [];
  consulta = '';
  abertas.clear();
  fixo = (await armazenamento.obter<boolean>(`${perfilAtivo().id}:painelFixo`)) ?? false;
  void atualizarTextosDoPainel();
  if (fixo) desenhar(false);
  else removerPainel();
}

/** Tela de perfis e ajustes: sem perfil escolhido, não há painel. */
export function removerPainel(): void {
  painel?.remove();
  fundo?.remove();
  painel = null;
  fundo = null;
  document.body.classList.remove('painel-fixo');
}

export function painelAberto(): boolean {
  return !!painel && (painel.classList.contains('aberto') || fixadoAgora());
}

/** O toque no avatar: abre a gaveta, fecha se já estava aberta. */
export function alternarPainel(chip: HTMLElement): void {
  origem = chip;
  if (fixadoAgora()) {
    // já está à vista: o toque só leva o foco até ele
    primeiroItem()?.focus();
    return;
  }
  if (painel?.classList.contains('aberto')) fecharGaveta();
  else {
    desenhar(true);
    (painel?.querySelector<HTMLElement>('[aria-current="page"]') ?? primeiroItem())?.focus();
    void atualizarTextosDoPainel();
  }
}

function primeiroItem(): HTMLElement | null {
  return painel?.querySelector<HTMLElement>('[role="treeitem"]') ?? null;
}

function fecharGaveta(devolverFoco = true): void {
  if (!painel) return;
  if (fixo) {
    // fixo em tela larga continua lá; em tela estreita volta a se esconder
    painel.classList.remove('aberto');
    fundo?.remove();
    fundo = null;
    sincronizarAvatar();
  } else {
    removerPainel();
    sincronizarAvatar();
  }
  if (devolverFoco && origem?.isConnected) origem.focus();
}

function sincronizarAvatar(): void {
  const aberto = painelAberto();
  document.querySelectorAll('.chip-perfil').forEach((c) => {
    c.setAttribute('aria-expanded', String(aberto));
  });
}

function ir(acao: () => void): void {
  // a tela vai ser trocada: não adianta devolver o foco a um avatar que some
  fecharGaveta(false);
  acao();
}

function item(
  rotulo: string,
  emoji: string,
  id: string,
  nivel: number,
  aoTocar: () => void,
): { li: HTMLLIElement; botao: HTMLButtonElement } {
  const li = el('li');
  li.setAttribute('role', 'none');
  const botao = el('button', 'item-painel');
  botao.dataset.foco = id;
  botao.setAttribute('role', 'treeitem');
  botao.setAttribute('aria-level', String(nivel));
  if (id === local) botao.setAttribute('aria-current', 'page');
  const marca = el('span', 'emoji-painel', emoji);
  marca.setAttribute('aria-hidden', 'true');
  botao.append(marca, el('span', 'rotulo-painel', rotulo));
  botao.addEventListener('click', aoTocar);
  li.appendChild(botao);
  return { li, botao };
}

function alternarPasta(id: string, abrir?: boolean): void {
  const vaiAbrir = abrir ?? !abertas.has(id);
  if (vaiAbrir) abertas.add(id);
  else abertas.delete(id);
  if (!painel) return;
  desenhar(painel.classList.contains('aberto'));
  // o foco fica na pasta tocada. Explícito, porque no Safari tocar num botão
  // não o foca — e sem isto o leitor de tela perderia o lugar a cada abertura
  painel.querySelector<HTMLElement>(`[data-pasta="${id}"]`)?.focus();
}

// uma pasta: toca, abre ali mesmo; toca de novo, recolhe
function ramo(pasta: Pasta, nivel: number): HTMLLIElement {
  const aberta = abertas.has(pasta.id);
  const { li, botao } = item(pasta.rotulo, pasta.emoji, pasta.id, nivel, () =>
    alternarPasta(pasta.id),
  );
  botao.classList.add('item-pasta');
  botao.dataset.pasta = pasta.id;
  botao.setAttribute('aria-expanded', String(aberta));

  const quantos = contarLivros(pasta, idsDosLivros());
  const conta = el('span', 'conta-painel', String(quantos));
  conta.setAttribute('aria-label', quantos === 1 ? '1 livro' : `${quantos} livros`);
  // ▸ fechada, ▾ aberta: a seta diz o estado sem depender de cor
  const seta = el('span', 'seta-painel', aberta ? '▾' : '▸');
  seta.setAttribute('aria-hidden', 'true');
  botao.append(conta, seta);

  if (aberta) {
    const ul = el('ul');
    ul.setAttribute('role', 'group');
    for (const f of pasta.filhas) ul.appendChild(ramo(f, nivel + 1));
    // os livros que moram nesta pasta (não os das pastas de dentro)
    const daqui = secoesDaPasta(pasta, idsDosLivros()).find((s) => s.pasta === pasta);
    for (const id of daqui?.livros ?? []) {
      const livro = livros.find((l) => l.id === id)!;
      ul.appendChild(
        item(livro.metadados.titulo, EMOJIS_CAPA[id] ?? '📖', id, nivel + 1, () =>
          ir(() => nav?.livro(id)),
        ).li,
      );
    }
    li.appendChild(ul);
  }
  return li;
}

// "Minhas anotações" é pasta: abre ali mesmo, com cada texto dentro
function ramoDasAnotacoes(): HTMLLIElement {
  const aberta = abertas.has(PASTA_ANOTACOES);
  const { li, botao } = item('Minhas anotações', '📝', PASTA_ANOTACOES, 1, () => alternarPasta(PASTA_ANOTACOES));
  botao.classList.add('item-pasta');
  botao.dataset.pasta = PASTA_ANOTACOES;
  botao.setAttribute('aria-expanded', String(aberta));
  const conta = el('span', 'conta-painel', String(textos.length));
  conta.setAttribute('aria-label', textos.length === 1 ? '1 texto' : `${textos.length} textos`);
  const seta = el('span', 'seta-painel', aberta ? '▾' : '▸');
  seta.setAttribute('aria-hidden', 'true');
  botao.append(conta, seta);
  if (aberta) {
    const ul = el('ul');
    ul.setAttribute('role', 'group');
    // o primeiro item leva à tela inteira: é lá que estão Novo, Adicionar,
    // Exportar e Importar
    ul.appendChild(
      item('Todas · novo, adicionar, exportar', '🗂️', LOCAL_ANOTACOES, 2, () => ir(() => nav?.anotacoes())).li,
    );
    for (const t of textos) {
      ul.appendChild(
        item(nomeParaMostrar(t), t.tipo === 'md' ? '📖' : t.tipo === 'txt' ? '📄' : '📝', localDoTexto(t.id), 2, () =>
          ir(() => nav?.texto(t.id)),
        ).li,
      );
    }
    li.appendChild(ul);
  }
  return li;
}

interface Achado {
  emoji: string;
  rotulo: string;
  onde?: string;
  abrir: () => void;
}

/** Livros (título, autor), pastas e textos próprios que combinam com a pesquisa. */
function pesquisar(q: string): Achado[] {
  const saida: Achado[] = [];
  const todas = (ps: Pasta[]): Pasta[] => ps.flatMap((p) => [p, ...todas(p.filhas)]);
  for (const pasta of todas(PASTAS)) {
    if (combina(q, pasta.rotulo)) {
      saida.push({ emoji: pasta.emoji, rotulo: pasta.rotulo, onde: 'pasta', abrir: () => ir(() => nav?.pasta?.(pasta.id)) });
    }
  }
  for (const livro of livros) {
    const pasta = todas(PASTAS).find((p) => p.livros.includes(livro.id));
    if (combina(q, livro.metadados.titulo, livro.metadados.autor_original, pasta?.rotulo)) {
      saida.push({
        emoji: EMOJIS_CAPA[livro.id] ?? '📖',
        rotulo: livro.metadados.titulo,
        onde: [livro.metadados.autor_original, pasta?.rotulo].filter(Boolean).join(', '),
        abrir: () => ir(() => nav?.livro(livro.id)),
      });
    }
  }
  for (const t of textos) {
    if (combina(q, nomeParaMostrar(t), t.autor, 'anotações')) {
      saida.push({
        emoji: t.tipo === 'md' ? '📖' : '📝',
        rotulo: nomeParaMostrar(t),
        onde: [t.autor, 'Minhas anotações'].filter(Boolean).join(', '),
        abrir: () => ir(() => nav?.texto(t.id)),
      });
    }
  }
  return saida;
}

function desenhar(comoGaveta: boolean): void {
  if (!temPerfilAtivo()) return;
  const foco = painel?.contains(document.activeElement)
    ? (document.activeElement as HTMLElement).dataset.foco
    : undefined;
  painel?.remove();
  fundo?.remove();
  fundo = null;

  const p = perfilAtivo();
  // <div> com papel explícito: gaveta é diálogo, fixo é navegação (um <aside>
  // não pode virar diálogo)
  const novo = el('div', 'painel-lateral');
  painel = novo;
  novo.id = 'painel-lateral';
  novo.classList.toggle('fixo', fixo);
  novo.classList.toggle('aberto', comoGaveta);
  const gaveta = comoGaveta && !fixadoAgora();
  novo.setAttribute('aria-label', 'Menu');
  if (gaveta) {
    novo.setAttribute('role', 'dialog');
    novo.setAttribute('aria-modal', 'true');
  } else {
    novo.setAttribute('role', 'navigation');
  }

  // --- cabeçalho: de quem é, alfinete, fechar ---
  const topo = el('div', 'topo-painel');
  const avatar = el('span', 'avatar-painel', p.avatar);
  avatar.setAttribute('aria-hidden', 'true');
  topo.append(avatar, el('strong', 'nome-painel', p.nome));

  const alfinete = el('button', 'botao-icone botao-alfinete', '📌');
  alfinete.dataset.foco = 'alfinete';
  alfinete.setAttribute('aria-pressed', String(fixo));
  alfinete.setAttribute('aria-label', 'Deixar o menu sempre aberto');
  alfinete.title = fixo ? 'Menu sempre aberto — tocar para soltar' : 'Deixar o menu sempre aberto';
  alfinete.addEventListener('click', async () => {
    fixo = !fixo;
    await armazenamento.definir(`${perfilAtivo().id}:painelFixo`, fixo);
    if (fixo) desenhar(false);
    else desenhar(true); // soltou: vira gaveta aberta, não some debaixo do dedo
    painel?.querySelector<HTMLElement>('[data-foco="alfinete"]')?.focus();
  });

  const fechar = el('button', 'botao-icone botao-fechar-painel', '✕');
  fechar.setAttribute('aria-label', 'Fechar o menu');
  fechar.addEventListener('click', () => fecharGaveta());
  topo.append(alfinete, fechar);
  novo.appendChild(topo);

  // --- árvore ---
  const arvore = el('ul', 'arvore-painel');
  arvore.setAttribute('role', 'tree');
  arvore.setAttribute('aria-label', 'Estante');
  for (const pasta of PASTAS) arvore.appendChild(ramo(pasta, 1));
  arvore.appendChild(
    item('Minhas pinturas', '🖼️', LOCAL_PINTURAS, 1, () => ir(() => nav?.pinturas())).li,
  );
  arvore.appendChild(ramoDasAnotacoes());

  // --- pesquisa: com algo escrito, a árvore dá lugar à lista do que achou ---
  const busca = el('input', 'campo-busca busca-painel') as HTMLInputElement;
  busca.type = 'search';
  busca.dataset.foco = 'busca';
  busca.placeholder = 'Pesquisar livro, autor, pasta…';
  busca.setAttribute('aria-label', 'Pesquisar livro, autor, pasta ou anotação');
  busca.value = consulta;
  const achados = el('ul', 'achados-painel');
  achados.setAttribute('aria-label', 'Resultados da pesquisa');
  const filtrar = () => {
    consulta = busca.value;
    const tem = consulta.trim().length > 0;
    arvore.hidden = tem;
    achados.hidden = !tem;
    achados.innerHTML = '';
    if (!tem) return;
    const resultados = pesquisar(consulta);
    for (const r of resultados) {
      const li = el('li');
      const b = el('button', 'item-painel');
      const marca = el('span', 'emoji-painel', r.emoji);
      marca.setAttribute('aria-hidden', 'true');
      const rotulo = el('span', 'rotulo-painel', r.rotulo);
      if (r.onde) rotulo.appendChild(el('span', 'onde-painel', ` · ${r.onde}`));
      b.append(marca, rotulo);
      b.addEventListener('click', r.abrir);
      li.appendChild(b);
      achados.appendChild(li);
    }
    if (!resultados.length) achados.appendChild(el('li', 'nada-painel', 'Nada com essas palavras.'));
  };
  busca.addEventListener('input', filtrar);
  busca.addEventListener('keydown', (ev) => {
    // Esc na pesquisa limpa primeiro; só o segundo Esc fecha o menu
    if (ev.key === 'Escape' && busca.value) {
      ev.preventDefault();
      ev.stopPropagation();
      busca.value = '';
      filtrar();
    }
  });
  novo.append(busca, arvore, achados);
  filtrar();

  const trocar = el('button', 'item-painel item-trocar-perfil');
  const gente = el('span', 'emoji-painel', '👥');
  gente.setAttribute('aria-hidden', 'true');
  trocar.append(gente, el('span', 'rotulo-painel', 'Trocar de perfil'));
  trocar.addEventListener('click', () => ir(() => nav?.perfis()));
  novo.appendChild(trocar);

  novo.addEventListener('keydown', (ev) => {
    const itens = [...novo.querySelectorAll<HTMLElement>('[role="treeitem"]')];
    const i = itens.indexOf(document.activeElement as HTMLElement);
    if (ev.key === 'Escape' && novo.classList.contains('aberto') && !fixadoAgora()) {
      ev.preventDefault();
      fecharGaveta();
    } else if (i >= 0 && (ev.key === 'ArrowDown' || ev.key === 'ArrowUp')) {
      ev.preventDefault();
      ev.stopPropagation(); // na tela de pintar as setas também andam pelo desenho
      itens[(i + (ev.key === 'ArrowDown' ? 1 : -1) + itens.length) % itens.length].focus();
    } else if (i >= 0 && (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft')) {
      // → abre a pasta, ← recolhe (ou sobe para a pasta de fora)
      const atual = itens[i];
      const pasta = atual.dataset.pasta;
      const abrir = ev.key === 'ArrowRight';
      ev.preventDefault();
      ev.stopPropagation();
      if (pasta && abertas.has(pasta) !== abrir) alternarPasta(pasta, abrir);
      else if (!abrir) {
        const deFora = atual.closest('ul[role="group"]')?.parentElement;
        deFora?.querySelector<HTMLElement>(':scope > [role="treeitem"]')?.focus();
      }
    } else if (i >= 0 && (ev.key === 'Home' || ev.key === 'End')) {
      ev.preventDefault();
      itens[ev.key === 'Home' ? 0 : itens.length - 1].focus();
    } else if (ev.key === 'Tab' && novo.getAttribute('aria-modal') === 'true') {
      // gaveta: o foco não escapa para a tela que está coberta
      const focaveis = [...novo.querySelectorAll<HTMLElement>('button')].filter(
        (b) => b.offsetParent !== null,
      );
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (ev.shiftKey && document.activeElement === primeiro) {
        ev.preventDefault();
        ultimo.focus();
      } else if (!ev.shiftKey && document.activeElement === ultimo) {
        ev.preventDefault();
        primeiro.focus();
      }
    }
  });

  if (gaveta) {
    fundo = el('div', 'painel-fundo');
    fundo.addEventListener('click', () => fecharGaveta());
    document.body.appendChild(fundo);
  }
  document.body.appendChild(novo);
  document.body.classList.toggle('painel-fixo', fixo);
  sincronizarAvatar();
  if (foco) novo.querySelector<HTMLElement>(`[data-foco="${foco}"]`)?.focus();
}

// a janela cruzou o limite de "tela larga": o fundo escuro e o papel de
// diálogo deixam de valer (ou passam a valer)
if (typeof window !== 'undefined') {
  window.matchMedia(TELA_LARGA).addEventListener('change', () => {
    if (painel) desenhar(painel.classList.contains('aberto') && !fixadoAgora());
  });
}
