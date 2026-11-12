// Um seletor de cor com as mesmas soluções da tela de pintar: o NOME da cor
// sempre escrito, a grade em xadrez (cor quente só encosta em cor fria), os
// cinco tons de cada cor atrás do botão «Tons», a marca ✓ na escolhida.
//
// Nasceu para o "Monte o seu tema" (Aparência), onde fundo e cor favorita
// eram bolinhas sem nome, com cores parecidas lado a lado — o mesmo defeito
// que a pintura tinha.
//
// `serve` filtra o que pode ser escolhido. Para FUNDO, só entram os tons em
// que a letra ainda se lê bem (contraste ≥ 7:1): por isso, ao tocar numa cor,
// o seletor escolhe o tom dela mais perto do meio que passa no filtro.
//
// (A tela de pintar tem a sua própria montagem, mais antiga, em
// telaColorir.ts. As duas usam os mesmos dados de ../canvas/cores.ts.)

import { MATIZES, matizDe, nomeDaCor, tintaSobre, type Matiz } from '../canvas/cores';
import { el } from './comum';

export interface OpcoesDoSeletor {
  /** nome do grupo, para leitor de tela: "Fundo", "Cor favorita" */
  rotulo: string;
  /** cor escolhida agora (pode não ser da tabela: um tema antigo) */
  atual?: string;
  /** quais cores podem ser escolhidas (padrão: todas) */
  serve?: (hex: string) => boolean;
  aoEscolher: (hex: string, nome: string) => void;
}

let contador = 0;

/** Do tom do meio para fora: base, claro, escuro, muito claro, muito escuro. */
function tomPreferido(matiz: Matiz, serve: (hex: string) => boolean): string | undefined {
  const meio = Math.floor(matiz.tons.length / 2);
  const ordem = [meio, meio - 1, meio + 1, meio - 2, meio + 2].filter((i) => i >= 0 && i < matiz.tons.length);
  return ordem.map((i) => matiz.tons[i].cor).find(serve);
}

export function criarSeletorDeCor(op: OpcoesDoSeletor): HTMLElement {
  const serve = op.serve ?? (() => true);
  const id = `tons-do-seletor-${++contador}`;
  let cor = op.atual?.toLowerCase();
  let tonsAbertos = false;

  const raiz = el('div', 'seletor-de-cor');
  raiz.setAttribute('role', 'group');
  raiz.setAttribute('aria-label', op.rotulo);

  const linha = el('div', 'cor-atual');
  const amostra = el('span', 'amostra-cor');
  amostra.setAttribute('aria-hidden', 'true');
  const nome = el('strong', 'nome-cor');
  nome.setAttribute('role', 'status');
  const botaoTons = el('button', 'botao-tons');
  botaoTons.setAttribute('aria-controls', id);
  linha.append(amostra, nome, botaoTons);

  const fileira = el('div', 'fileira-tons');
  fileira.id = id;
  fileira.setAttribute('role', 'group');
  const rotuloTons = el('p', 'rotulo-tons');
  const pocosTons = el('div', 'paleta-tons');
  fileira.append(rotuloTons, pocosTons);

  const grade = el('div', 'paleta');
  grade.setAttribute('role', 'group');
  grade.setAttribute('aria-label', `${op.rotulo}: cores`);

  const poco = (hex: string, rotulo: string): HTMLButtonElement => {
    const b = el('button', 'poco-cor');
    b.style.background = hex;
    b.style.setProperty('--tinta', tintaSobre(hex));
    b.dataset.cor = hex;
    b.setAttribute('aria-label', rotulo);
    return b;
  };

  const escolher = (hex: string) => {
    cor = hex;
    atualizar();
    op.aoEscolher(hex, nomeDaCor(hex));
  };

  for (const matiz of MATIZES) {
    const tom = tomPreferido(matiz, serve);
    const b = poco(matiz.base, matiz.nome);
    b.dataset.matiz = matiz.nome;
    if (!tom) b.disabled = true; // nenhum tom desta cor serve aqui
    b.addEventListener('click', () => {
      // se a cor já é desta família e serve, tocar de novo não troca o tom
      const jaEscolhida = cor && matizDe(cor) === matiz && serve(cor);
      if (!jaEscolhida && tom) escolher(tom);
    });
    grade.appendChild(b);
  }

  botaoTons.addEventListener('click', () => {
    tonsAbertos = !tonsAbertos;
    atualizar();
    if (tonsAbertos) pocosTons.querySelector<HTMLButtonElement>('.ativa, button:not(:disabled)')?.focus();
  });
  fileira.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    tonsAbertos = false;
    atualizar();
    botaoTons.focus();
  });

  function atualizar(): void {
    const matiz = cor ? matizDe(cor) : undefined;
    amostra.style.background = cor ?? 'transparent';
    nome.textContent = cor ? nomeDaCor(cor) : 'Nenhuma ainda';

    const tons = (matiz?.tons ?? []).filter((t) => serve(t.cor));
    const temTons = tons.length > 1;
    if (!temTons) tonsAbertos = false;
    fileira.hidden = !tonsAbertos;
    botaoTons.disabled = !temTons;
    botaoTons.textContent = tonsAbertos ? 'Tons ▴' : 'Tons ▾';
    botaoTons.setAttribute('aria-expanded', String(tonsAbertos));
    botaoTons.setAttribute('aria-label', matiz && temTons ? `Tons de ${matiz.nome}` : 'Sem outros tons');

    if (matiz && rotuloTons.dataset.de !== matiz.nome) {
      rotuloTons.dataset.de = matiz.nome;
      rotuloTons.textContent = `Tons de ${matiz.nome}`;
      fileira.setAttribute('aria-label', `Tons de ${matiz.nome}`);
      pocosTons.innerHTML = '';
      for (const t of tons) {
        const b = poco(t.cor, t.nome);
        b.addEventListener('click', () => escolher(t.cor));
        pocosTons.appendChild(b);
      }
    }
    const marcar = (b: HTMLButtonElement, ativa: boolean) => {
      b.classList.toggle('ativa', ativa);
      b.setAttribute('aria-pressed', String(ativa));
    };
    grade.querySelectorAll<HTMLButtonElement>('.poco-cor').forEach((b) => marcar(b, b.dataset.matiz === matiz?.nome));
    pocosTons.querySelectorAll<HTMLButtonElement>('.poco-cor').forEach((b) => marcar(b, b.dataset.cor === cor));
  }

  raiz.append(linha, fileira, grade);
  atualizar();
  return raiz;
}
