// Orquestrador: máquina de estados simples entre as quatro telas.
// O app SEMPRE abre na seleção de perfil (spec 8.6) — nunca pula direto.

import './estilos.css';
import './fontes';
import { montarTelaAparencia } from './telas/telaAparencia';
import type { Livro } from './motor/tipos';
import { montarTelaPerfis } from './telas/telaPerfis';
import { montarTelaEstante } from './telas/telaEstante';
import { montarTelaLeitura } from './telas/telaLeitura';
import { montarTelaColorir } from './telas/telaColorir';
import { montarTelaQuebraCabeca } from './telas/telaQuebraCabeca';
import { montarTelaAbertura } from './telas/telaAbertura';
import { montarTelaConfiguracoes, montarTravaParental } from './telas/telaConfiguracoes';
import { aplicarTemaDeLivro, carregarPreferencias } from './telas/preferencias';
import { temPerfilAtivo } from './perfis/perfis';
import { pararFala } from './tts';

const raiz = document.getElementById('app')!;
let livroAtual: Livro | null = null;

function irPerfis(): void {
  pararFala();
  // saindo de um livro tematizado: devolve o tema da criança
  if (temPerfilAtivo()) carregarPreferencias();
  montarTelaPerfis(
    raiz,
    async () => {
      await carregarPreferencias();
      irEstante();
    },
    irAjustes,
  );
}

function irAjustes(): void {
  // trava parental primeiro — sempre (spec 8.5)
  montarTravaParental(
    raiz,
    () => montarTelaConfiguracoes(raiz, { perfis: irPerfis }),
    irPerfis,
  );
}

function irEstante(): void {
  pararFala();
  window.scrollTo(0, 0);
  // saindo de um livro tematizado: devolve o tema da criança
  carregarPreferencias();
  montarTelaEstante(raiz, {
    perfis: irPerfis,
    aparencia: () => irAparencia(irEstante),
    leitura: (livro) => {
      livroAtual = livro;
      irLeitura(true); // vindo da estante → abertura cênica (se o livro tiver)
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
  // imersão: o app veste o tema do livro enquanto ele estiver aberto
  aplicarTemaDeLivro(livroAtual.metadados);
  if (comAbertura && livroAtual.metadados.abertura) {
    montarTelaAbertura(raiz, livroAtual, () => irLeitura(false));
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

function irColorir(assetId: string): void {
  if (!livroAtual) return irEstante();
  pararFala();
  window.scrollTo(0, 0);
  montarTelaColorir(raiz, livroAtual, assetId, {
    perfis: irPerfis,
    voltar: irLeitura,
  });
}

irPerfis();
