// Painel lateral — o "Φ" do Historinhas. Abre ao tocar no avatar da barra do
// topo, em QUALQUER tela (leitura, pintura, anotações…), e leva em dois toques
// a qualquer pasta da estante, ao caderno de anotações ou à troca de perfil.
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

import { armazenamento } from '../armazenamento/armazenamento';
import { livros } from '../conteudo/catalogo';
import { PASTAS, contarLivros, type Pasta } from '../conteudo/pastas';
import { perfilAtivo, temPerfilAtivo } from '../perfis/perfis';
import { el } from './comum';

export interface NavPainel {
  pasta: (id: string) => void;
  anotacoes: () => void;
  perfis: () => void;
}

/** id do item "Minhas anotações" (não é pasta: é um lugar) */
export const LOCAL_ANOTACOES = 'anotacoes';

// igual ao @media de estilos.css: abaixo disto não cabe painel + desenho
const TELA_LARGA = '(min-width: 1200px)';

let nav: NavPainel | null = null;
let local: string | null = null;
let fixo = false;
let painel: HTMLElement | null = null;
let fundo: HTMLElement | null = null;
let origem: HTMLElement | null = null; // quem abriu: recebe o foco de volta

const telaLarga = () => window.matchMedia(TELA_LARGA).matches;
const fixadoAgora = () => fixo && telaLarga();
const idsDosLivros = () => livros.map((l) => l.id);

export function configurarPainel(n: NavPainel): void {
  nav = n;
}

export function painelConfigurado(): boolean {
  return nav !== null;
}

/** Onde a criança está (id de pasta, LOCAL_ANOTACOES, ou null num livro). */
export function marcarLocal(id: string | null): void {
  local = id;
  if (painel) desenhar(painel.classList.contains('aberto'));
}

/** Ao entrar num perfil: lê se ESTE perfil deixou o painel fixo. */
export async function prepararPainel(): Promise<void> {
  fixo = (await armazenamento.obter<boolean>(`${perfilAtivo().id}:painelFixo`)) ?? false;
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

function itemDaArvore(
  rotulo: string,
  emoji: string,
  id: string,
  nivel: number,
  aoTocar: () => void,
  quantos?: number,
): HTMLLIElement {
  const li = el('li');
  li.setAttribute('role', 'none');
  const b = el('button', 'item-painel');
  b.setAttribute('role', 'treeitem');
  b.setAttribute('aria-level', String(nivel));
  if (id === local) b.setAttribute('aria-current', 'page');
  const marca = el('span', 'emoji-painel', emoji);
  marca.setAttribute('aria-hidden', 'true');
  b.append(marca, el('span', 'rotulo-painel', rotulo));
  if (quantos !== undefined) {
    const n = el('span', 'conta-painel', String(quantos));
    n.setAttribute('aria-label', quantos === 1 ? '1 livro' : `${quantos} livros`);
    b.appendChild(n);
  }
  b.addEventListener('click', aoTocar);
  li.appendChild(b);
  return li;
}

function ramo(pasta: Pasta, nivel: number): HTMLLIElement {
  const li = itemDaArvore(
    pasta.rotulo,
    pasta.emoji,
    pasta.id,
    nivel,
    () => ir(() => nav?.pasta(pasta.id)),
    contarLivros(pasta, idsDosLivros()),
  );
  if (pasta.filhas.length) {
    const ul = el('ul');
    ul.setAttribute('role', 'group');
    for (const f of pasta.filhas) ul.appendChild(ramo(f, nivel + 1));
    li.appendChild(ul);
  }
  return li;
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
  const novo = el('aside', 'painel-lateral');
  painel = novo;
  novo.id = 'painel-lateral';
  novo.classList.toggle('fixo', fixo);
  novo.classList.toggle('aberto', comoGaveta);
  const gaveta = comoGaveta && !fixadoAgora();
  novo.setAttribute('aria-label', 'Menu');
  if (gaveta) {
    novo.setAttribute('role', 'dialog');
    novo.setAttribute('aria-modal', 'true');
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
    itemDaArvore('Minhas anotações', '📝', LOCAL_ANOTACOES, 1, () => ir(() => nav?.anotacoes())),
  );
  novo.appendChild(arvore);

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
