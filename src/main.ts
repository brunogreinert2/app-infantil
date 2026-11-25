// Orquestrador: máquina de estados simples entre as quatro telas.
// O app SEMPRE abre na seleção de perfil (spec 8.6) — nunca pula direto.

import './estilos.css';
import './fontes';
import { montarTelaAparencia } from './telas/telaAparencia';
import type { Livro } from './motor/tipos';
import { montarTelaPerfis } from './telas/telaPerfis';
import { montarTelaEstante } from './telas/telaEstante';
import { abrirEditor, abrirTexto, montarTelaAnotacoes, type NavAnotacoes } from './telas/telaAnotacoes';
import { obterTexto } from './armazenamento/textos';
import { nomeParaMostrar, separarFrontMatter, type TextoProprio } from './conteudo/textosProprios';
import { carregarLivro } from './motor/frontmatter';
import { montarTelaLeitura } from './telas/telaLeitura';
import { montarTelaColorir } from './telas/telaColorir';
import { montarTelaQuebraCabeca } from './telas/telaQuebraCabeca';
import { montarTelaAbertura } from './telas/telaAbertura';
import { montarTelaConfiguracoes, montarTravaParental } from './telas/telaConfiguracoes';
import { montarTelaGuia } from './telas/telaGuia';
import { montarTelaPinturas } from './telas/telaPinturas';
import { aplicarTemaDeLivro, carregarPreferencias } from './telas/preferencias';
import { perfilAtivo, sairDoPerfil } from './perfis/perfis';
import { armazenamento } from './armazenamento/armazenamento';
import { obterLivro } from './conteudo/catalogo';
import { PASTA_PADRAO, acharPasta } from './conteudo/pastas';
import {
  LOCAL_ANOTACOES,
  atualizarTextosDoPainel,
  localDoTexto,
  LOCAL_PINTURAS,
  LOCAL_CALCULADORA,
  localDoJogo,
  configurarPainel,
  marcarLocal,
  prepararPainel,
  removerPainel,
} from './telas/painelLateral';
import { pararFala } from './tts';
import { montarTelaPrancha } from './caa/telaPrancha';
import { montarTelaPranchasAdultos } from './caa/telaMontar';
import { FOLHAS_LIGADAS } from './geradores/ligado';
import type { AbasDaEstante } from './telas/abasDaEstante';
import { conjuntoAtivo } from './caa/guardar';
import type { ConjuntoCaa } from './caa/modelo';

const raiz = document.getElementById('app')!;
let livroAtual: Livro | null = null;

function irPerfis(): void {
  pararFala();
  removerPainel(); // sem perfil escolhido não há menu
  // a porta de entrada é de ninguém: veste a aparência do APARELHO (2026-11-20)
  sairDoPerfil();
  void carregarPreferencias();
  montarTelaPerfis(
    raiz,
    async () => {
      await carregarPreferencias();
      await prepararPainel();
      irEstante();
    },
    irAjustes,
    () => void irPrancha(),
    () => void irLerOMundo(),
  );
}

// ---------- Ler o Mundo (jovens e adultos, 2026-11-22) ----------
// Porta própria na tela inicial, fora da estante das crianças; abre também
// pelo endereço historinhas.app.br/#ler-o-mundo (para deixar salvo no tablet).
async function irLerOMundo(): Promise<void> {
  pararFala();
  removerPainel();
  const { montarTelaLerOMundo } = await import('./telas/telaLerOMundo');
  await montarTelaLerOMundo(raiz, { voltar: irPerfis });
}

// ---------- prancha de comunicação (CAA) ----------
// Fora da estante e dos perfis: quem usa pode ser adolescente ou adulto.
// Também abre direto pelo endereço historinhas.app.br/#prancha (para deixar
// salvo no tablet do aluno); é a única porta que não passa pela escolha de
// perfil, e de propósito: a prancha é a voz de alguém, e não um cantinho de
// leitura.
async function irPrancha(conjunto?: ConjuntoCaa, voltar: () => void = irPerfis): Promise<void> {
  pararFala();
  removerPainel();
  const c = conjunto ?? (await conjuntoAtivo());
  montarTelaPrancha(raiz, c, {
    sair: voltar,
    rotuloSair: voltar === irPerfis ? 'Sair' : 'Voltar a montar',
    montar: conjunto ? undefined : () => montarTravaParental(raiz, irPranchasAdultos, () => void irPrancha()),
  });
}

function irPranchasAdultos(): void {
  removerPainel();
  void montarTelaPranchasAdultos(raiz, {
    voltar: abrirAjustes,
    experimentar: (c, voltar) => void irPrancha(c, voltar),
  });
}

// ---------- fazer uma folha (geradores) ----------
// Desligada: ver src/geradores/ligado.ts. O código só é buscado quando abre.
async function irFolhas(voltar: () => void = abrirAjustes): Promise<void> {
  removerPainel();
  window.scrollTo(0, 0);
  const { montarTelaFolhas } = await import('./geradores/telaFolhas');
  await montarTelaFolhas(raiz, { voltar });
}

// 🎮 Jogos da criança (barra lateral): escolhe o tema e joga. Vem com a oficina.
// sem tipo: a tela com todos os jogos (o botão 🎮 Jogos do alto da estante)
async function irJogos(tipo?: 'caca' | 'cruzadinha' | 'sudoku' | 'labirinto' | 'contas' | 'memoria'): Promise<void> {
  pararFala();
  window.scrollTo(0, 0);
  carregarPreferencias(); // pode ter vindo de um livro tematizado, pelo menu
  marcarLocal(localDoJogo(tipo ?? 'todos'));
  const { montarTelaJogos } = await import('./geradores/telaJogos');
  await montarTelaJogos(raiz, tipo, { perfis: irPerfis, estante: irEstante, abas: abasDaEstante });
}

// 🧮 a calculadora (ideia da Luiza, 2026-11-25): item próprio no menu lateral
async function irCalculadora(): Promise<void> {
  pararFala();
  carregarPreferencias();
  marcarLocal(LOCAL_CALCULADORA);
  const { montarTelaCalculadora } = await import('./geradores/telaCalculadora');
  await montarTelaCalculadora(raiz, { perfis: irPerfis, voltar: irEstante, abas: abasDaEstante });
}

// 🖨️ Para quem ensina (barra lateral): a trava sempre; desistir volta à estante
function irEnsinar(): void {
  pararFala();
  removerPainel();
  montarTravaParental(raiz, () => void irFolhas(irEstante), irEstante);
}

// já dentro da área dos adultos (a trava ficou para trás): ajustes ⇄ guia
function abrirAjustes(): void {
  window.scrollTo(0, 0);
  void montarTelaConfiguracoes(raiz, {
    perfis: irPerfis,
    guia: () => montarTelaGuia(raiz, { voltar: abrirAjustes }),
    pranchas: irPranchasAdultos,
    folhas: FOLHAS_LIGADAS ? () => void irFolhas() : undefined,
  });
}

function irAjustes(): void {
  // trava parental primeiro — sempre (spec 8.5)
  removerPainel();
  montarTravaParental(
    raiz,
    abrirAjustes,
    irPerfis,
  );
}

// A estante abre na última pasta que ESTE perfil visitou. `idPasta` só vale
// quando é texto: vários botões chamam irEstante direto como ouvinte de
// clique, e aí o primeiro argumento é o evento.
function irEstante(idPasta?: unknown): void {
  void abrirEstante(idPasta);
}

async function abrirEstante(idPasta?: unknown): Promise<void> {
  pararFala();
  window.scrollTo(0, 0);
  // saindo de um livro tematizado: devolve o tema da criança
  carregarPreferencias();

  const chave = `${perfilAtivo().id}:pastaEstante`;
  let id = typeof idPasta === 'string' ? idPasta : await armazenamento.obter<string>(chave);
  if (!id || !acharPasta(id)) id = PASTA_PADRAO;
  if (typeof idPasta === 'string') await armazenamento.definir(chave, id);
  marcarLocal(id);

  await montarTelaEstante(raiz, id, {
    perfis: irPerfis,
    aparencia: () => irAparencia(irEstante),
    leitura: (livro) => {
      livroAtual = livro;
      marcarLocal(livro.id); // no menu: o livro aberto, com o caminho até ele
      irLeitura(true); // vindo da estante → abertura cênica (se o livro tiver)
    },
    anotacoes: irAnotacoes,
    pinturas: irPinturas,
    pasta: irEstante,
    jogos: FOLHAS_LIGADAS ? () => void irJogos() : undefined,
    calculadora: FOLHAS_LIGADAS ? () => void irCalculadora() : undefined,
  });
}

// as abas do alto da estante, as mesmas nas sete telas que elas abrem
const abasDaEstante: AbasDaEstante = {
  pasta: (id) => irEstante(id),
  jogos: FOLHAS_LIGADAS ? () => void irJogos() : undefined,
  calculadora: FOLHAS_LIGADAS ? () => void irCalculadora() : undefined,
  pinturas: () => irPinturas(),
  anotacoes: () => irAnotacoes(),
};

function irAnotacoes(): void {
  pararFala();
  void atualizarTextosDoPainel();
  window.scrollTo(0, 0);
  carregarPreferencias(); // pode ter vindo de um livro tematizado, pelo menu
  marcarLocal(LOCAL_ANOTACOES);
  void montarTelaAnotacoes(raiz, navAnotacoes);
}

const navAnotacoes: NavAnotacoes = {
  perfis: irPerfis,
  aparencia: () => irAparencia(irAnotacoes),
  estante: irEstante,
  abas: abasDaEstante,
  ler: (texto) => lerTextoProprio(texto),
};

// Um texto .md de Minhas anotações, aberto como livro (pelo mesmo motor dos
// livros da estante). O id ganha prefixo para nunca colidir com um livro.
function lerTextoProprio(texto: TextoProprio): void {
  pararFala();
  window.scrollTo(0, 0);
  carregarPreferencias();
  marcarLocal(localDoTexto(texto.id));
  // o front matter vai para "Detalhes"; o leitor recebe só o texto
  const separado = separarFrontMatter(texto.conteudo);
  const livro = carregarLivro(`proprio-${texto.id}`, separado.corpo);
  livro.metadados.titulo = nomeParaMostrar(texto);
  if (texto.autor) livro.metadados.autor_original = texto.autor;
  void montarTelaLeitura(
    raiz,
    livro,
    {
      perfis: irPerfis,
      estante: irAnotacoes,
      aparencia: () => irAparencia(() => lerTextoProprio(texto)),
      colorir: () => undefined,
      quebraCabeca: () => undefined,
    },
    {
      editar: () => abrirEditor(raiz, navAnotacoes, texto),
      detalhes: separado.detalhes,
      detalhesBrutos: separado.bruto,
    },
  );
}

// o menu lateral abre um texto pelo id
async function abrirTextoPeloMenu(id: string): Promise<void> {
  const texto = await obterTexto(perfilAtivo().id, id);
  if (!texto) return irAnotacoes();
  window.scrollTo(0, 0);
  marcarLocal(localDoTexto(id));
  abrirTexto(raiz, navAnotacoes, texto);
}

function irPinturas(): void {
  pararFala();
  window.scrollTo(0, 0);
  carregarPreferencias(); // pode ter vindo de um livro tematizado, pelo menu
  marcarLocal(LOCAL_PINTURAS);
  void montarTelaPinturas(raiz, {
    perfis: irPerfis,
    aparencia: () => irAparencia(irPinturas),
    estante: irEstante,
    abas: abasDaEstante,
    pintar: (livro, assetId) => {
      livroAtual = livro;
      irColorir(assetId, irPinturas); // "voltar" devolve à galeria, não ao livro
    },
  });
}

function irAparencia(voltar: () => void): void {
  window.scrollTo(0, 0);
  montarTelaAparencia(raiz, { voltar });
}

function irLeitura(comAbertura = false): void {
  if (!livroAtual) return irEstante();
  window.scrollTo(0, 0);
  // imersão: o tema do livro entra SÓ na chegada pela estante (comAbertura);
  // trocas feitas pelo usuário no meio da leitura ficam soberanas
  if (comAbertura) void aplicarTemaDeLivro(livroAtual.metadados);
  if (comAbertura && livroAtual.metadados.abertura) {
    montarTelaAbertura(raiz, livroAtual, () => irLeitura(false), irEstante);
    return;
  }
  montarTelaLeitura(raiz, livroAtual, {
    perfis: irPerfis,
    estante: irEstante,
    aparencia: () => irAparencia(irLeitura),
    colorir: (assetId) => irColorir(assetId),
    quebraCabeca: (assetId) => irQuebraCabeca(assetId),
  });
}

function irQuebraCabeca(assetId: string): void {
  if (!livroAtual) return irEstante();
  pararFala();
  window.scrollTo(0, 0);
  montarTelaQuebraCabeca(raiz, livroAtual, assetId, {
    perfis: irPerfis,
    voltar: irLeitura,
  });
}

function irColorir(assetId: string, voltar: () => void = irLeitura): void {
  if (!livroAtual) return irEstante();
  pararFala();
  window.scrollTo(0, 0);
  montarTelaColorir(raiz, livroAtual, assetId, {
    perfis: irPerfis,
    voltar,
  });
}

// o menu lateral alcança estes três lugares de qualquer tela
configurarPainel({
  livro: (id) => {
    const livro = obterLivro(id);
    if (!livro) return;
    pararFala();
    livroAtual = livro;
    marcarLocal(id);
    irLeitura(true);
  },
  anotacoes: irAnotacoes,
  texto: (id) => void abrirTextoPeloMenu(id),
  pasta: irEstante,
  pinturas: irPinturas,
  perfis: irPerfis,
  jogos: FOLHAS_LIGADAS ? (tipo) => void irJogos(tipo) : undefined,
  calculadora: FOLHAS_LIGADAS ? () => void irCalculadora() : undefined,
  ensinar: FOLHAS_LIGADAS ? irEnsinar : undefined,
});

// a aparência do aparelho desde o primeiro instante (antes de qualquer perfil)
void carregarPreferencias();
if (location.hash === '#prancha') void irPrancha();
else if (location.hash === '#ler-o-mundo') void irLerOMundo();
else if (location.hash === '#folhas' && FOLHAS_LIGADAS) montarTravaParental(raiz, () => void irFolhas(), irPerfis);
else if (location.hash === '#folhas' && import.meta.env.DEV) void irFolhas(irPerfis);
else irPerfis();
