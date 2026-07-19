// Tela de aparência — a criança escolhe SEM trava parental (é dela):
// temas prontos com foco em acessibilidade (espírito Pedra Angular),
// fonte (padrão / Atkinson Hyperlegible / OpenDyslexic), tamanho da letra,
// e o "Monte o seu": fundo + cor favorita, com legibilidade derivada
// automaticamente (nunca combinação ilegível).

import { PILHAS_DE_FONTE } from '../fontes';
import {
  DESTAQUES_PERSONALIZADOS,
  FONTES,
  FUNDOS_PERSONALIZADOS,
  TEMAS,
  ajustarTamanho,
  definirPersonalizado,
  obterPreferencias,
  trocarFonte,
  trocarTema,
} from './preferencias';
import { el } from './comum';

export async function montarTelaAparencia(
  raiz: HTMLElement,
  nav: { voltar: () => void },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-aparencia';

  const barra = el('header', 'barra-topo');
  const voltar = el('button', 'botao-icone', '←');
  voltar.setAttribute('aria-label', 'Voltar');
  voltar.addEventListener('click', nav.voltar);
  barra.appendChild(voltar);
  barra.appendChild(el('h1', 'titulo-barra', '🎨 Aparência'));
  raiz.appendChild(barra);

  const corpo = el('div', 'corpo-config');
  raiz.appendChild(corpo);

  const prefs = await obterPreferencias();

  // ---------- temas prontos ----------
  corpo.appendChild(el('h2', 'titulo-secao', 'Temas prontos'));
  const gradeTemas = el('div', 'grade-opcoes');
  const botoesTema = new Map<string, HTMLButtonElement>();
  for (const t of TEMAS) {
    const botao = el('button', 'botao-opcao', t.rotulo);
    botao.addEventListener('click', async () => {
      await trocarTema(t.id);
      marcarTema(t.id);
    });
    botoesTema.set(t.id, botao);
    gradeTemas.appendChild(botao);
  }
  corpo.appendChild(gradeTemas);

  const marcarTema = (id: string) => {
    botoesTema.forEach((b, tid) => b.classList.toggle('ativa', tid === id));
  };
  marcarTema(prefs.tema);

  // ---------- letra ----------
  corpo.appendChild(el('h2', 'titulo-secao', 'Letra'));
  const gradeFontes = el('div', 'grade-opcoes');
  const botoesFonte = new Map<string, HTMLButtonElement>();
  for (const f of FONTES) {
    const botao = el('button', 'botao-opcao', f.rotulo);
    botao.style.fontFamily = PILHAS_DE_FONTE[f.id]; // amostra na própria fonte
    botao.addEventListener('click', async () => {
      await trocarFonte(f.id);
      botoesFonte.forEach((b, fid) => b.classList.toggle('ativa', fid === f.id));
    });
    if (f.id === prefs.fonte) botao.classList.add('ativa');
    botoesFonte.set(f.id, botao);
    gradeFontes.appendChild(botao);
  }
  corpo.appendChild(gradeFontes);

  const linhaTamanho = el('div', 'grade-opcoes');
  const menor = el('button', 'botao-opcao', 'A− menor');
  menor.addEventListener('click', () => ajustarTamanho(-2));
  const maior = el('button', 'botao-opcao', 'A+ maior');
  maior.addEventListener('click', () => ajustarTamanho(2));
  linhaTamanho.append(menor, maior);
  corpo.appendChild(linhaTamanho);

  // ---------- monte o seu ----------
  corpo.appendChild(el('h2', 'titulo-secao', 'Monte o seu tema'));
  corpo.appendChild(el('p', 'texto-sobre', 'Escolha um fundo e uma cor favorita — a cor favorita pinta os títulos e os botões, e a letra se ajusta sozinha para dar pra ler.'));

  const gradeFundos = el('div', 'grade-cores');
  for (const cor of FUNDOS_PERSONALIZADOS) {
    const poco = el('button', 'poco-cor');
    poco.style.background = cor;
    poco.setAttribute('aria-label', `Fundo ${cor}`);
    poco.addEventListener('click', async () => {
      await definirPersonalizado({ fundo: cor });
      marcarTema('personalizado');
    });
    gradeFundos.appendChild(poco);
  }
  corpo.appendChild(el('p', 'rotulo-cores', 'Fundo:'));
  corpo.appendChild(gradeFundos);

  const gradeDestaques = el('div', 'grade-cores');
  for (const cor of DESTAQUES_PERSONALIZADOS) {
    const poco = el('button', 'poco-cor');
    poco.style.background = cor;
    poco.setAttribute('aria-label', `Cor favorita ${cor}`);
    poco.addEventListener('click', async () => {
      await definirPersonalizado({ destaque: cor });
      marcarTema('personalizado');
    });
    gradeDestaques.appendChild(poco);
  }
  corpo.appendChild(el('p', 'rotulo-cores', 'Cor favorita:'));
  corpo.appendChild(gradeDestaques);
}
