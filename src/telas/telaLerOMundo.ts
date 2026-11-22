// LER O MUNDO NA TELA (pedido do Bruno, 2026-11-22). Letramento para jovens e
// adultos: as palavras que se veem na rua (PARE, SAÍDA, ÔNIBUS…), nos mesmos
// cinco passos da ficha impressa, só que tocando e ouvindo.
//
// Onde mora: uma porta própria na tela inicial, ao lado da prancha — FORA da
// estante das crianças (docs/LER_O_MUNDO.md, decisão 3). Por isso não pede
// perfil: o que se marca como feito fica no aparelho (o tablet do aluno).
//
// Sem cara de coisa de criança: nenhum bicho, nenhuma estrela. Quiz zero-gate,
// como no resto do app: qualquer toque mostra a resposta certa, nada trava.

import { armazenamento } from '../armazenamento/armazenamento';
import { fichaDePalavraPropria, type Contexto, type PalavraDoMundo } from '../conteudo/lerOMundo';
import { svgPlacaDaPalavra } from '../conteudo/lerOMundoArte';
import {
  gruposDaTela,
  idNaTela,
  letrasParaMontar,
  mesmaLetra,
  mesmaLetraNoTeclado,
  opcoesDaBusca,
  paraFalar,
  pedacosDe,
} from '../conteudo/lerOMundoNaTela';
import { separarSilabas } from '../conteudo/silabas';
import { NOMES_DOS_CONTEXTOS } from '../geradores/cadernos';
import { falar, pararFala } from '../tts';
import { barraTopo, el } from './comum';
import { dono } from './preferencias';

export interface NavLerOMundo {
  /** volta para a tela inicial */
  voltar: () => void;
}

const chaveFeitas = () => `${dono()}:lerOMundo:feitas`;
const chaveProprias = () => `${dono()}:lerOMundo:proprias`;

async function feitas(): Promise<Set<string>> {
  return new Set((await armazenamento.obter<string[]>(chaveFeitas())) ?? []);
}

async function marcarFeita(id: string): Promise<void> {
  const s = await feitas();
  s.add(id);
  await armazenamento.definir(chaveFeitas(), [...s]);
}

async function proprias(): Promise<PalavraDoMundo[]> {
  return (await armazenamento.obter<PalavraDoMundo[]>(chaveProprias())) ?? [];
}

function botao(rotulo: string, classe: string, aoTocar: () => void): HTMLButtonElement {
  const b = el('button', classe, rotulo);
  b.type = 'button';
  b.addEventListener('click', aoTocar);
  return b;
}

function botaoOuvir(texto: string, rotulo = '🔊 Ouvir'): HTMLButtonElement {
  return botao(rotulo, 'botao-opcao lom-ouvir', () => falar(paraFalar(texto)));
}

// ---------------------------------------------------------------------------
// A lista: as palavras por grupo
// ---------------------------------------------------------------------------

export async function montarTelaLerOMundo(raiz: HTMLElement, nav: NavLerOMundo): Promise<void> {
  pararFala();
  window.scrollTo(0, 0);
  raiz.innerHTML = '';
  raiz.className = 'tela tela-ler-o-mundo';
  raiz.appendChild(barraTopo({ titulo: '🌎 Ler o Mundo', aoVoltar: nav.voltar, aoTrocarPerfil: nav.voltar }));

  const corpo = el('main', 'lom-corpo');
  raiz.appendChild(corpo);
  corpo.appendChild(el('p', 'lom-instrucao', 'Palavras que a gente vê na rua, no ônibus, no celular. Escolha uma.'));

  const [jaFeitas, minhas] = await Promise.all([feitas(), proprias()]);
  const grupos = gruposDaTela(minhas);
  // a ordem de leitura (para o «Próxima palavra»)
  const ordem = grupos.flatMap((g) => g.palavras.map((p) => ({ p, propria: g.id === 'proprias' })));

  for (const g of grupos) {
    const secao = el('section', 'lom-grupo');
    secao.appendChild(el('h2', 'lom-grupo-titulo', g.titulo));
    const lista = el('ul', 'lom-palavras');
    for (const p of g.palavras) {
      const propria = g.id === 'proprias';
      const id = idNaTela(p, propria);
      const li = el('li');
      const b = botao('', 'lom-palavra', () => void abrirPalavra(raiz, nav, ordem, ordem.findIndex((x) => x.p === p)));
      b.appendChild(el('span', 'lom-palavra-texto', p.palavra));
      if (jaFeitas.has(id)) {
        const feito = el('span', 'lom-feito', '✓');
        feito.setAttribute('aria-label', 'já feita');
        b.appendChild(feito);
      }
      li.appendChild(b);
      if (propria) {
        const tirar = botao('✕', 'botao-icone lom-tirar', async () => {
          if (!confirm(`Tirar a palavra ${p.palavra} da lista?`)) return;
          await armazenamento.definir(chaveProprias(), minhas.filter((x) => x !== p));
          void montarTelaLerOMundo(raiz, nav);
        });
        tirar.setAttribute('aria-label', `Tirar ${p.palavra} da lista`);
        li.appendChild(tirar);
      }
      lista.appendChild(li);
    }
    secao.appendChild(lista);
    corpo.appendChild(secao);
  }

  corpo.appendChild(formularioDaPalavra(raiz, nav, minhas));
}

// ---------------------------------------------------------------------------
// A palavra de quem ensina (o nome, a linha do ônibus, o time)
// ---------------------------------------------------------------------------

function formularioDaPalavra(raiz: HTMLElement, nav: NavLerOMundo, minhas: PalavraDoMundo[]): HTMLElement {
  const caixa = el('details', 'lom-nova');
  caixa.appendChild(el('summary', 'lom-nova-titulo', '✏️ Pôr uma palavra na lista'));
  caixa.appendChild(
    el('p', 'lom-dica', 'Para quem ensina: o nome da pessoa, a linha do ônibus, o time. Fica só neste aparelho.'),
  );

  const campo = (rotulo: string, entrada: HTMLElement, dica?: string) => {
    const r = el('label', 'lom-campo');
    r.appendChild(el('span', 'lom-campo-nome', rotulo));
    r.appendChild(entrada);
    if (dica) r.appendChild(el('span', 'lom-dica', dica));
    return r;
  };

  const palavra = el('input');
  palavra.maxLength = 14;
  palavra.autocapitalize = 'characters';
  const partes = el('input');
  partes.maxLength = 40;
  const sugestao = botao('', 'botao-opcao lom-sugestao', () => undefined);
  sugestao.hidden = true;
  const contexto = el('select');
  for (const [valor, nome] of Object.entries(NOMES_DOS_CONTEXTOS)) {
    const o = el('option', undefined, nome);
    o.value = valor;
    contexto.appendChild(o);
  }
  const onde = el('input');
  onde.maxLength = 80;
  const aviso = el('p', 'lom-aviso');
  aviso.setAttribute('role', 'status');

  // a sugestão do app, que quem ensina usa ou corrige — nunca entra sozinha
  const sugerir = () => {
    const p = palavra.value.trim().toLocaleUpperCase('pt-BR');
    if (!p) return void (sugestao.hidden = true);
    const proposta = separarSilabas(p).silabas.join('-');
    sugestao.hidden = proposta === partes.value.trim().toLocaleUpperCase('pt-BR');
    sugestao.textContent = `✨ Usar a sugestão: ${proposta}`;
    sugestao.onclick = () => {
      partes.value = proposta;
      sugestao.hidden = true;
    };
  };
  palavra.addEventListener('input', sugerir);
  partes.addEventListener('input', sugerir);

  const guardar = botao('Guardar a palavra', 'botao-grande', async () => {
    try {
      const nova = fichaDePalavraPropria({
        palavra: palavra.value,
        silabas: partes.value.trim() ? partes.value.trim().split(/[-·.\s]+/u).filter(Boolean) : undefined,
        contexto: contexto.value as Contexto,
        onde: onde.value.trim() || undefined,
      });
      if (minhas.some((x) => x.palavra === nova.palavra)) throw new Error(`${nova.palavra} já está na lista.`);
      await armazenamento.definir(chaveProprias(), [...minhas, nova]);
      void montarTelaLerOMundo(raiz, nav);
    } catch (e) {
      aviso.textContent = e instanceof Error ? e.message : String(e);
    }
  });

  caixa.append(
    campo('A palavra', palavra, 'Uma palavra só, até 14 letras. Ex.: ÔNIBUS'),
    campo('As partes (sílabas)', partes, 'Separadas por traço: Ô-NI-BUS. Em branco, vai letra por letra.'),
    sugestao,
    campo('Onde ela aparece', contexto),
    campo('Onde se vê (para o último passo)', onde, 'Ex.: Na frente do ônibus.'),
    guardar,
    aviso,
  );
  return caixa;
}

// ---------------------------------------------------------------------------
// Uma palavra, em cinco passos
// ---------------------------------------------------------------------------

type NaOrdem = { p: PalavraDoMundo; propria: boolean };

async function abrirPalavra(raiz: HTMLElement, nav: NavLerOMundo, ordem: NaOrdem[], indice: number, passo = 0): Promise<void> {
  pararFala();
  window.scrollTo(0, 0);
  const { p, propria } = ordem[indice];
  raiz.innerHTML = '';
  raiz.className = 'tela tela-ler-o-mundo';
  raiz.appendChild(barraTopo({ titulo: `🌎 ${p.palavra}`, aoVoltar: () => void montarTelaLerOMundo(raiz, nav), aoTrocarPerfil: nav.voltar }));
  // o teclado do passo 4 escuta a janela: some ao trocar de tela
  window.removeEventListener('keydown', teclaAtual);

  const corpo = el('main', 'lom-corpo lom-passo');
  raiz.appendChild(corpo);

  const TOTAL = 5;
  const trilha = el('ol', 'lom-trilha');
  trilha.setAttribute('aria-label', `Passo ${passo + 1} de ${TOTAL}`);
  for (let i = 0; i < TOTAL; i++) {
    const marca = el('li', i === passo ? 'atual' : i < passo ? 'feito' : '', String(i + 1));
    if (i === passo) marca.setAttribute('aria-current', 'step');
    trilha.appendChild(marca);
  }
  corpo.appendChild(trilha);

  const ir = (n: number) => void abrirPalavra(raiz, nav, ordem, indice, n);
  const pedacos = pedacosDe(p);

  if (passo === 0) {
    corpo.appendChild(el('p', 'lom-instrucao', 'Leia a palavra. É assim que ela aparece.'));
    const placa = el('div', 'lom-placa');
    placa.innerHTML = svgPlacaDaPalavra(p);
    corpo.appendChild(placa);
    corpo.appendChild(botaoOuvir(p.palavra));
  } else if (passo === 1) {
    const emSilabas = Boolean(p.silabas?.length);
    corpo.appendChild(
      el(
        'p',
        'lom-instrucao',
        emSilabas
          ? `A palavra em ${pedacos.length} ${pedacos.length === 1 ? 'parte' : 'partes'}. Toque em cada parte para ouvir.`
          : 'A palavra letra por letra. Toque em cada letra para ouvir.',
      ),
    );
    const linha = el('div', 'lom-partes');
    for (const pedaco of pedacos) linha.appendChild(botao(pedaco, 'lom-parte', () => falar(paraFalar(pedaco))));
    corpo.appendChild(linha);
    corpo.appendChild(botaoOuvir(p.palavra, '🔊 A palavra inteira'));
  } else if (passo === 2) {
    corpo.appendChild(el('p', 'lom-instrucao', `Encontre ${p.palavra}.`));
    corpo.appendChild(botaoOuvir(p.palavra));
    const grade = el('div', 'lom-opcoes');
    const resposta = el('p', 'lom-resposta');
    resposta.setAttribute('role', 'status');
    const botoes = opcoesDaBusca(p).map((s) =>
      botao(s, 'lom-opcao', () => {
        // zero-gate: qualquer toque mostra a certa; nada trava o avanço
        for (const b of botoes) {
          b.classList.toggle('certa', b.textContent === p.palavra);
          b.classList.toggle('tocada', b.textContent === s && s !== p.palavra);
        }
        resposta.textContent = s === p.palavra ? `✓ Isso: ${p.palavra}.` : `A palavra é ${p.palavra}. Ela está marcada.`;
        falar(paraFalar(p.palavra));
      }),
    );
    grade.append(...botoes);
    corpo.append(grade, resposta);
  } else if (passo === 3) {
    montarEscrever(corpo, p);
  } else {
    corpo.appendChild(el('p', 'lom-instrucao', 'Onde você vê essa palavra?'));
    if (p.onde) {
      corpo.appendChild(el('p', 'lom-onde', p.onde));
      corpo.appendChild(botaoOuvir(`Onde você vê essa palavra? ${p.onde}`));
    } else {
      corpo.appendChild(el('p', 'lom-onde', 'Pense num lugar e conte para alguém.'));
    }
  }

  // --- antes / depois ---
  const passos = el('nav', 'lom-navegar');
  passos.setAttribute('aria-label', 'Passos');
  if (passo > 0) passos.appendChild(botao('← Antes', 'botao-opcao', () => ir(passo - 1)));
  if (passo < TOTAL - 1) {
    passos.appendChild(botao('Próximo →', 'botao-grande lom-proximo', () => ir(passo + 1)));
  } else {
    const fim = async (seguir: boolean) => {
      await marcarFeita(idNaTela(p, propria));
      if (seguir && indice + 1 < ordem.length) void abrirPalavra(raiz, nav, ordem, indice + 1);
      else void montarTelaLerOMundo(raiz, nav);
    };
    if (indice + 1 < ordem.length) {
      passos.appendChild(botao(`✓ Pronto. Próxima: ${ordem[indice + 1].p.palavra}`, 'botao-grande lom-proximo', () => void fim(true)));
    }
    passos.appendChild(botao('✓ Pronto. Voltar à lista', 'botao-opcao', () => void fim(false)));
  }
  corpo.appendChild(passos);
}

// o ouvinte do teclado no passo 4 (um só de cada vez)
let teclaAtual: (e: KeyboardEvent) => void = () => undefined;

function montarEscrever(corpo: HTMLElement, p: PalavraDoMundo): void {
  const palavra = [...p.palavra];
  corpo.appendChild(el('p', 'lom-instrucao', 'Escreva a palavra. Toque nas letras na ordem.'));
  corpo.appendChild(el('p', 'lom-modelo', p.palavra));

  const casas = el('div', 'lom-casas');
  casas.setAttribute('aria-label', 'O que já está escrito');
  const vazias = palavra.map(() => {
    const c = el('span', 'lom-casa', '');
    casas.appendChild(c);
    return c;
  });
  corpo.appendChild(casas);

  const pecas = el('div', 'lom-pecas');
  const aviso = el('p', 'lom-resposta');
  aviso.setAttribute('role', 'status');
  let escritas = 0;

  // cada peça sabe o próprio lugar: entre letras repetidas, some a tocada
  const botoesDasPecas: HTMLButtonElement[] = letrasParaMontar(p.palavra).map((letra, i) =>
    botao(letra, 'lom-peca', () => tocar(letra, i)),
  );

  const marcarProxima = () => {
    for (const x of botoesDasPecas) x.classList.remove('dica');
    if (escritas >= palavra.length) return;
    const certa = botoesDasPecas.find((x) => !x.disabled && mesmaLetra(palavra[escritas], x.textContent ?? ''));
    certa?.classList.add('dica');
  };

  function escrever(i: number): void {
    const peca = botoesDasPecas[i];
    vazias[escritas].textContent = palavra[escritas];
    vazias[escritas].classList.add('cheia');
    peca.disabled = true;
    escritas++;
    for (const x of botoesDasPecas) x.classList.remove('dica');
    if (escritas === palavra.length) {
      aviso.textContent = `✓ ${p.palavra}`;
      falar(paraFalar(p.palavra));
    } else {
      aviso.textContent = '';
    }
  }

  function tocar(letra: string, i: number): void {
    if (escritas >= palavra.length) return;
    if (mesmaLetra(palavra[escritas], letra)) return escrever(i);
    // zero-gate: a errada não entra, e a certa fica marcada
    aviso.textContent = `A próxima letra é ${palavra[escritas]}. Ela está marcada.`;
    marcarProxima();
  }

  teclaAtual = (e: KeyboardEvent) => {
    if (!corpo.isConnected) return window.removeEventListener('keydown', teclaAtual);
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey || escritas >= palavra.length) return;
    if (!/\p{L}/u.test(e.key)) return;
    const i = botoesDasPecas.findIndex((x) => !x.disabled && mesmaLetra(palavra[escritas], x.textContent ?? ''));
    if (i >= 0 && mesmaLetraNoTeclado(palavra[escritas], e.key)) escrever(i);
    else tocar(e.key, -1);
  };
  window.addEventListener('keydown', teclaAtual);

  pecas.append(...botoesDasPecas);
  corpo.appendChild(pecas);
  corpo.appendChild(aviso);
  corpo.appendChild(
    botao('Apagar e começar de novo', 'botao-opcao', () => {
      escritas = 0;
      aviso.textContent = '';
      for (const c of vazias) {
        c.textContent = '';
        c.classList.remove('cheia');
      }
      for (const x of botoesDasPecas) {
        x.disabled = false;
        x.classList.remove('dica');
      }
    }),
  );
}
