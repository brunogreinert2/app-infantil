// Orquestrador: máquina de estados simples entre as quatro telas.
// O app SEMPRE abre na seleção de perfil (spec 8.6) — nunca pula direto.

import './estilos.css';
import './fontes';
import { montarTelaAparencia } from './telas/telaAparencia';
import type { Livro } from './motor/tipos';
import { montarTelaPerfis } from './telas/telaPerfis';
import { montarTelaEstante } from './telas/telaEstante';
import { montarTelaAnotacoes } from './telas/telaAnotacoes';
import { montarTelaLeitura } from './telas/telaLeitura';
import { montarTelaColorir } from './telas/telaColorir';
import { montarTelaQuebraCabeca } from './telas/telaQuebraCabeca';
import { montarTelaAbertura } from './telas/telaAbertura';
import { montarTelaConfiguracoes, montarTravaParental } from './telas/telaConfiguracoes';
import { montarTelaGuia } from './telas/telaGuia';
import { montarTelaPinturas } from './telas/telaPinturas';
import { aplicarTemaDeLivro, carregarPreferencias } from './telas/preferencias';
import { perfilAtivo, temPerfilAtivo } from './perfis/perfis';
import { armazenamento } from './armazenamento/armazenamento';
import { obterLivro } from './conteudo/catalogo';
import { PASTA_PADRAO, acharPasta } from './conteudo/pastas';
import {
  LOCAL_ANOTACOES,
  LOCAL_PINTURAS,
  configurarPainel,
  marcarLocal,
  prepararPainel,
  removerPainel,
} from './telas/painelLateral';
import { pararFala } from './tts';

const raiz = document.getElementById('app')!;
let livroAtual: Livro | null = null;

function irPerfis(): void {
  pararFala();
  removerPainel(); // sem perfil escolhido não há menu
  // saindo de um livro tematizado: devolve o tema da criança
  if (temPerfilAtivo()) carregarPreferencias();
  montarTelaPerfis(
    raiz,
    async () => {
      await carregarPreferencias();
      await prepararPainel();
      irEstante();
    },
    irAjustes,
  );
}

// já dentro da área dos adultos (a trava ficou para trás): ajustes ⇄ guia
function abrirAjustes(): void {
  window.scrollTo(0, 0);
  void montarTelaConfiguracoes(raiz, {
    perfis: irPerfis,
    guia: () => montarTelaGuia(raiz, { voltar: abrirAjustes }),
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
  });
}

function irAnotacoes(): void {
  pararFala();
  window.scrollTo(0, 0);
  carregarPreferencias(); // pode ter vindo de um livro tematizado, pelo menu
  marcarLocal(LOCAL_ANOTACOES);
  void montarTelaAnotacoes(raiz, {
    perfis: irPerfis,
    aparencia: () => irAparencia(irAnotacoes),
    estante: irEstante,
  });
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
  pinturas: irPinturas,
  perfis: irPerfis,
});

irPerfis();
