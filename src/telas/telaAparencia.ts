// Tela de aparência — a criança escolhe SEM trava parental (é dela):
// temas prontos (os de mais contraste primeiro, como no Pedra Angular),
// fonte (padrão / Atkinson Hyperlegible / OpenDyslexic), tamanho da letra,
// e o "Monte o seu": fundo + cor favorita, com legibilidade derivada
// automaticamente (nunca combinação ilegível).

import { fundoLegivel } from '../canvas/cores';
import { PILHAS_DE_FONTE } from '../fontes';
import { falar } from '../tts';
import { criarSeletorDeCor } from './seletorDeCor';
import {
  ENTRELINHAS,
  ESPACAMENTOS,
  PESOS,
  FONTES,
  TEMAS,
  NOMES_DOS_GRUPOS_DE_TEMA,
  type GrupoDeTema,
  ajustarTamanho,
  PASSO_FONTE,
  definirPersonalizado,
  definirFalarCores,
  definirTemaSoberano,
  obterFalarCores,
  obterPreferencias,
  obterTemaSoberano,
  trocarEntrelinha,
  trocarEspacamento,
  trocarFonte,
  trocarPeso,
  trocarTema,
} from './preferencias';
import { barraTopo, el } from './comum';

export async function montarTelaAparencia(
  raiz: HTMLElement,
  nav: { voltar: () => void },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-aparencia';

  // a barra de sempre (com A− A+), sem o 🎨: já estamos nela
  raiz.appendChild(barraTopo({ titulo: '🎨 Aparência', aoVoltar: nav.voltar, aoTrocarPerfil: nav.voltar, aoAparencia: false }));

  const corpo = el('div', 'corpo-config');
  raiz.appendChild(corpo);

  const prefs = await obterPreferencias();

  // prévia ao vivo: QUALQUER escolha (fundo, cor favorita, fonte, tamanho)
  // muda algo visível aqui na hora — sem isso, a cor favorita parecia
  // não fazer nada (feedback do Bruno: ela só aparecia lá na leitura)
  const previa = el('div', 'cartao-previa');
  // parágrafo, não título: é uma AMOSTRA de título, e como <h3> vinha antes
  // de qualquer <h2>, quebrando a ordem dos títulos para o leitor de tela
  previa.appendChild(el('p', 'cabecalho previa-titulo', 'O título fica assim'));
  // DUAS linhas, sempre (a quebra é fixa): com uma só não se vê o espaço
  // entre as linhas mudar; com um parágrafo inteiro a amostra virava leitura
  // (Bruno, 2026-11-20: «mais enxuto»)
  const amostra = el('p', 'previa-texto');
  amostra.append('E o texto fica assim.', el('br'), 'Com duas linhas, dá para ver o espaço entre elas.');
  previa.appendChild(amostra);
  previa.appendChild(el('button', 'botao-grande', '🎨 E o botão fica assim'));
  corpo.appendChild(previa);
  // Sem a palavra "acessibilidade" em menu nenhum (Bruno, 2026-11-20): o rótulo
  // afasta quem mais precisa. O trabalho está feito antes; aqui é só escolher.
  corpo.appendChild(el('p', 'texto-sobre texto-convite', 'Deixe tudo do jeito que seus olhos preferem.'));

  // ---------- temas prontos ----------
  corpo.appendChild(el('h2', 'titulo-secao', 'Temas prontos'));
  const botoesTema = new Map<string, HTMLButtonElement>();
  // em grupos, na ordem: primeiro os de baixa visão (2026-11-20). Cada botão
  // já VESTE o seu tema (data-theme no próprio botão): a criança vê as cores
  // antes de escolher, sem precisar ler o nome
  for (const grupo of Object.keys(NOMES_DOS_GRUPOS_DE_TEMA) as GrupoDeTema[]) {
    corpo.appendChild(el('h3', 'titulo-grupo-tema', NOMES_DOS_GRUPOS_DE_TEMA[grupo]));
    const gradeTemas = el('div', 'grade-opcoes');
    for (const t of TEMAS.filter((x) => x.grupo === grupo)) {
      const botao = el('button', 'botao-opcao botao-tema', t.rotulo);
      botao.dataset.theme = t.id;
      botao.setAttribute('aria-pressed', 'false');
      botao.addEventListener('click', async () => {
        await trocarTema(t.id);
        marcarTema(t.id);
      });
      botoesTema.set(t.id, botao);
      gradeTemas.appendChild(botao);
    }
    corpo.appendChild(gradeTemas);
  }

  const marcarTema = (id: string) => {
    botoesTema.forEach((b, tid) => {
      b.classList.toggle('ativa', tid === id);
      b.setAttribute('aria-pressed', String(tid === id));
    });
  };
  marcarTema(prefs.tema);

  // ---------- soberania: quem manda no tema? ----------
  corpo.appendChild(el('h2', 'titulo-secao', 'Temas dos livros'));
  corpo.appendChild(
    el('p', 'texto-sobre', 'Algumas histórias têm cores próprias. Você escolhe.'),
  );
  const gradeSoberania = el('div', 'grade-opcoes');
  const opcoesSoberania: Array<[string, boolean]> = [
    ['✨ Usar o tema do livro', false],
    ['🛡️ Manter meu tema', true],
  ];
  const soberanoAtual = await obterTemaSoberano();
  const botoesSoberania: HTMLButtonElement[] = [];
  for (const [rotulo, valor] of opcoesSoberania) {
    const botao = el('button', 'botao-opcao', rotulo);
    if (valor === soberanoAtual) botao.classList.add('ativa');
    botao.addEventListener('click', async () => {
      await definirTemaSoberano(valor);
      botoesSoberania.forEach((b) => b.classList.remove('ativa'));
      botao.classList.add('ativa');
    });
    botoesSoberania.push(botao);
    gradeSoberania.appendChild(botao);
  }
  corpo.appendChild(gradeSoberania);
  corpo.appendChild(el('p', 'texto-sobre', 'Os temas de mais contraste têm sempre prioridade.'));

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
  const menor = el('button', 'botao-opcao', 'A− Menor');
  menor.addEventListener('click', () => ajustarTamanho(1 / PASSO_FONTE));
  const maior = el('button', 'botao-opcao', 'A+ Maior');
  maior.addEventListener('click', () => ajustarTamanho(PASSO_FONTE));
  linhaTamanho.append(menor, maior);
  corpo.appendChild(linhaTamanho);

  // ---------- espaço entre linhas e entre letras ----------
  // A explicação clínica (ceratocone, astigmatismo, dislexia) mora no guia da
  // professora; aqui a conversa é com a criança.
  // enxuto (2026-11-20): o nome da escolha e as opções; a prévia no alto
  // mostra o efeito na hora — a explicação longa ficou para o guia
  const grupoDeEscolha = (
    titulo: string,
    opcoes: ReadonlyArray<{ id: string; rotulo: string }>,
    atual: string,
    aoEscolher: (id: string) => Promise<void>,
  ) => {
    corpo.appendChild(el('h2', 'titulo-secao', titulo));
    const grade = el('div', 'grade-opcoes');
    grade.setAttribute('role', 'group');
    grade.setAttribute('aria-label', titulo);
    const botoes: HTMLButtonElement[] = [];
    for (const o of opcoes) {
      const botao = el('button', 'botao-opcao', o.rotulo);
      const marcar = (b: HTMLButtonElement, ativa: boolean) => {
        b.classList.toggle('ativa', ativa);
        b.setAttribute('aria-pressed', String(ativa));
      };
      marcar(botao, o.id === atual);
      botao.addEventListener('click', async () => {
        await aoEscolher(o.id);
        botoes.forEach((b) => marcar(b, b === botao));
      });
      botoes.push(botao);
      grade.appendChild(botao);
    }
    corpo.appendChild(grade);
  };

  grupoDeEscolha('Peso da letra', PESOS, prefs.peso, trocarPeso);
  grupoDeEscolha('Espaço entre as linhas', ENTRELINHAS, prefs.entrelinha, trocarEntrelinha);
  grupoDeEscolha('Espaço entre as letras', ESPACAMENTOS, prefs.espacamento, trocarEspacamento);

  // ---------- cores de pintar ----------
  corpo.appendChild(el('h2', 'titulo-secao', 'Cores de pintar'));
  const gradeVoz = el('div', 'grade-opcoes');
  const falando = await obterFalarCores();
  const botoesVoz: HTMLButtonElement[] = [];
  for (const [rotulo, valor] of [
    ['🔇 Mostrar o nome', false],
    ['🔊 Mostrar e falar o nome', true],
  ] as Array<[string, boolean]>) {
    const botao = el('button', 'botao-opcao', rotulo);
    botao.classList.toggle('ativa', valor === falando);
    botao.setAttribute('aria-pressed', String(valor === falando));
    botao.addEventListener('click', async () => {
      await definirFalarCores(valor);
      botoesVoz.forEach((b) => {
        b.classList.toggle('ativa', b === botao);
        b.setAttribute('aria-pressed', String(b === botao));
      });
    });
    botoesVoz.push(botao);
    gradeVoz.appendChild(botao);
  }
  corpo.appendChild(gradeVoz);

  // ---------- monte o seu ----------
  corpo.appendChild(el('h2', 'titulo-secao', 'Monte o seu tema'));
  corpo.appendChild(el('p', 'texto-sobre', 'Escolha suas cores. As letras se ajustam para continuar legíveis.'));

  // Fundo e cor favorita com as mesmas soluções da tela de pintar: nome
  // escrito, xadrez, tons. No FUNDO só entram os tons em que a letra se lê
  // bem (contraste ≥ 7:1) — por isso alguns tons do meio não aparecem lá.
  const falar_ = await obterFalarCores();
  const dizer = (nome: string) => {
    if (falar_) falar(nome);
  };
  corpo.appendChild(el('p', 'rotulo-cores', 'Fundo'));
  corpo.appendChild(
    criarSeletorDeCor({
      rotulo: 'Fundo',
      atual: prefs.personalizado?.fundo,
      serve: fundoLegivel,
      aoEscolher: async (cor, nome) => {
        await definirPersonalizado({ fundo: cor });
        marcarTema('personalizado');
        dizer(nome);
      },
    }),
  );
  corpo.appendChild(el('p', 'rotulo-cores', 'Cor dos títulos e botões'));
  corpo.appendChild(
    criarSeletorDeCor({
      rotulo: 'Cor dos títulos e botões',
      atual: prefs.personalizado?.destaque,
      aoEscolher: async (cor, nome) => {
        await definirPersonalizado({ destaque: cor });
        marcarTema('personalizado');
        dizer(nome);
      },
    }),
  );
}
