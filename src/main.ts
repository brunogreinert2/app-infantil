// Orquestrador: máquina de estados simples entre as quatro telas.
// O app SEMPRE abre na seleção de perfil (spec 8.6) — nunca pula direto.

import './estilos.css';
import type { Livro } from './motor/tipos';
import { montarTelaPerfis } from './telas/telaPerfis';
import { montarTelaEstante } from './telas/telaEstante';
import { montarTelaLeitura } from './telas/telaLeitura';
import { montarTelaColorir } from './telas/telaColorir';
import { montarTelaQuebraCabeca } from './telas/telaQuebraCabeca';
import { montarTelaConfiguracoes, montarTravaParental } from './telas/telaConfiguracoes';
import { carregarPreferencias } from './telas/preferencias';
import { pararFala } from './tts';

const raiz = document.getElementById('app')!;
let livroAtual: Livro | null = null;

function irPerfis(): void {
  pararFala();
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
  montarTelaEstante(raiz, {
    perfis: irPerfis,
    leitura: (livro) => {
      livroAtual = livro;
      irLeitura();
    },
  });
}

function irLeitura(): void {
  if (!livroAtual) return irEstante();
  window.scrollTo(0, 0);
  montarTelaLeitura(raiz, livroAtual, {
    perfis: irPerfis,
    estante: irEstante,
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
