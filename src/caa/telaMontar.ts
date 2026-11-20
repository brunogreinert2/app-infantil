// MONTAR PRANCHAS — a área da professora (sempre atrás da trava dos adultos).
//
// Duas vistas:
//   lista  → os conjuntos do aparelho: usar, montar, imprimir, guardar
//            arquivo, duplicar, excluir; criar (da essencial ou em branco) e
//            trazer de um arquivo.
//   montar → um conjunto: nome, ajustes, pranchas e, casa por casa, palavra,
//            fala, categoria, figura (desenho nosso ou foto do aparelho) e se
//            ela abre outra prancha.
// Cada mudança se guarda sozinha (sem botão "salvar" para esquecer).

import { entregarArquivo } from '../armazenamento/copiaNoAparelho';
import { cssCadernoA4, fatorDoPapel, imprimirDocumento } from '../impressao/motorImpressao';
import { barraTopo, el } from '../telas/comum';
import { falar } from '../tts';
import { reduzirFigura } from './figura';
import {
  PICTOGRAMAS_CONHECIDOS,
  definirAtivo,
  duplicarConjunto,
  excluirConjunto,
  guardarImportado,
  idDoAtivo,
  listarConjuntos,
  novoConjunto,
  salvarConjunto,
} from './guardar';
import { htmlDoConjunto } from './impressaoCaa';
import {
  CATEGORIAS,
  LIMITES,
  deArquivo,
  falaDaCasa,
  idLivre,
  nomeDoArquivo,
  paraArquivo,
  pranchaInicial,
  type CasaCaa,
  type ConjuntoCaa,
  type PranchaCaa,
} from './modelo';
import { NOMES_DOS_PICTOGRAMAS, PICTOGRAMAS, svgDoPictograma } from './pictogramas';
import { desenharCasa } from './telaPrancha';

export interface NavMontar {
  voltar: () => void;
  /** abre a prancha do conjunto; `voltar` traz de volta a esta tela */
  experimentar: (conjunto: ConjuntoCaa, voltar: () => void) => void;
}

// a mesma barra das outras telas (2026-11-20)
const barra = (titulo: string, aoVoltar: () => void): HTMLElement => barraTopo({ titulo, aoVoltar, aoTrocarPerfil: aoVoltar });

// ----------------------------------------------------------------- imprimir --

export function imprimirConjunto(conjunto: ConjuntoCaa, cores: boolean, recortar: boolean): void {
  const fator = fatorDoPapel(navigator.userAgent, navigator.maxTouchPoints ?? 0);
  const { corpo, css } = htmlDoConjunto(conjunto, { cores, recortar, fator });
  // cssCadernoA4 traz o @page e a cor fiel; o resto é da prancha
  imprimirDocumento(`Prancha - ${conjunto.nome}`, corpo, cssCadernoA4(fator) + css);
}

function opcoesDeImpressao(conjunto: ConjuntoCaa): HTMLElement {
  const caixa = el('div', 'caa-imprimir');
  const cores = caixa.appendChild(caixaDeMarcar('Com as cores das categorias', conjunto.ajustes.cores));
  const recortar = caixa.appendChild(caixaDeMarcar('Casas tracejadas, para recortar (velcro, chaveiro)', false));
  const ir = el('button', 'botao-grande', '🖨️ Imprimir');
  ir.addEventListener('click', () =>
    imprimirConjunto(conjunto, cores.querySelector('input')!.checked, recortar.querySelector('input')!.checked),
  );
  caixa.appendChild(ir);
  caixa.appendChild(
    el('p', 'texto-sobre', `Sai uma folha A4 por prancha (${conjunto.pranchas.length}). Na impressora, escolha "ajustar à página" se cortar.`),
  );
  return caixa;
}

function caixaDeMarcar(rotulo: string, marcado: boolean, aoMudar?: (v: boolean) => void): HTMLElement {
  const linha = el('label', 'caa-marcar');
  const caixa = el('input');
  caixa.type = 'checkbox';
  caixa.checked = marcado;
  if (aoMudar) caixa.addEventListener('change', () => aoMudar(caixa.checked));
  linha.append(caixa, el('span', undefined, rotulo));
  return linha;
}

function escolha<T extends string | number>(
  rotulo: string,
  opcoes: { valor: T; nome: string }[],
  atual: T,
  aoMudar: (v: T) => void,
): HTMLElement {
  const linha = el('label', 'caa-campo');
  linha.appendChild(el('span', 'caa-campo-nome', rotulo));
  const sel = el('select');
  for (const o of opcoes) {
    const op = el('option', undefined, o.nome);
    op.value = String(o.valor);
    if (o.valor === atual) op.selected = true;
    sel.appendChild(op);
  }
  sel.addEventListener('change', () => {
    const o = opcoes.find((x) => String(x.valor) === sel.value);
    if (o) aoMudar(o.valor);
  });
  linha.appendChild(sel);
  return linha;
}

function campo(rotulo: string, valor: string, max: number, aoMudar: (v: string) => void, dica?: string): HTMLElement {
  const linha = el('label', 'caa-campo');
  linha.appendChild(el('span', 'caa-campo-nome', rotulo));
  const entrada = el('input');
  entrada.type = 'text';
  entrada.value = valor;
  entrada.maxLength = max;
  if (dica) entrada.placeholder = dica;
  entrada.addEventListener('input', () => aoMudar(entrada.value));
  linha.appendChild(entrada);
  return linha;
}

// -------------------------------------------------------------------- lista --

export async function montarTelaPranchasAdultos(raiz: HTMLElement, nav: NavMontar): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-config tela-caa-montar';
  window.scrollTo(0, 0);
  const recarregar = () => montarTelaPranchasAdultos(raiz, nav);
  raiz.appendChild(barra('💬 Pranchas de comunicação', nav.voltar));

  const corpo = el('div', 'corpo-config');
  raiz.appendChild(corpo);
  corpo.appendChild(
    el(
      'p',
      'texto-sobre',
      'Monte uma prancha para cada pessoa: comece pela essencial e troque, tire ou acrescente casas, com desenho ou com foto. ' +
        'Ela fica guardada neste aparelho. Para levar a outro (o tablet do aluno, o celular da família), use "Guardar arquivo" aqui e "Trazer de um arquivo" lá.',
    ),
  );
  corpo.appendChild(
    el(
      'p',
      'texto-sobre',
      'A essencial é ponto de partida, não receita: prancha de comunicação se monta para a pessoa, de preferência com quem a acompanha (família, fonoaudióloga).',
    ),
  );

  // ---- criar ----
  const criar = el('div', 'caa-criar');
  const nome = el('input');
  nome.type = 'text';
  nome.maxLength = LIMITES.nome;
  nome.placeholder = 'Nome da prancha (ex.: o nome do aluno)';
  nome.setAttribute('aria-label', 'Nome da nova prancha');
  const daEssencial = el('button', 'botao-grande', '+ Nova, a partir da essencial');
  const emBranco = el('button', 'botao-opcao', '+ Nova, em branco');
  const criarCom = async (como: 'essencial' | 'branco') => {
    const c = await novoConjunto(nome.value.trim() || 'Nova prancha', como);
    montarEditor(raiz, c, nav);
  };
  daEssencial.addEventListener('click', () => void criarCom('essencial'));
  emBranco.addEventListener('click', () => void criarCom('branco'));
  criar.append(nome, daEssencial, emBranco);
  corpo.appendChild(criar);

  // ---- trazer de arquivo ----
  const aviso = el('p', 'aviso-trava', '');
  aviso.setAttribute('role', 'status');
  const seletor = el('input');
  seletor.type = 'file';
  seletor.accept = '.json,application/json';
  seletor.hidden = true;
  seletor.addEventListener('change', async () => {
    const arquivo = seletor.files?.[0];
    seletor.value = '';
    if (!arquivo) return;
    if (arquivo.size > 20 * 1024 * 1024) {
      aviso.textContent = 'Arquivo grande demais para ser uma prancha.';
      return;
    }
    const v = deArquivo(await arquivo.text(), PICTOGRAMAS_CONHECIDOS);
    if (!v.ok) {
      aviso.textContent = v.motivo;
      return;
    }
    const guardado = await guardarImportado(v.conjunto);
    await recarregar();
    const msg = raiz.querySelector('.aviso-trava');
    if (msg) {
      msg.textContent =
        `Prancha "${guardado.nome}" trazida.` + (v.avisos.length ? ` Atenção: ${v.avisos.join(' ')}` : '');
    }
  });
  const trazer = el('button', 'botao-opcao', '📂 Trazer de um arquivo…');
  trazer.addEventListener('click', () => seletor.click());
  corpo.append(trazer, seletor, aviso);

  // ---- os conjuntos ----
  corpo.appendChild(el('h2', 'titulo-secao', 'Neste aparelho'));
  const lista = await listarConjuntos();
  const ativo = await idDoAtivo();
  for (const conjunto of lista) {
    const cartao = el('section', 'caa-cartao');
    const casas = conjunto.pranchas.reduce((n, p) => n + p.casas.filter((c) => c.rotulo).length, 0);
    const cab = el('h3', 'caa-cartao-nome', conjunto.nome);
    cartao.appendChild(cab);
    cartao.appendChild(
      el(
        'p',
        'texto-sobre',
        `${conjunto.pranchas.length} ${conjunto.pranchas.length === 1 ? 'prancha' : 'pranchas'}, ${casas} casas` +
          (conjunto.id === ativo ? ' · é a que abre no botão "Prancha de comunicação"' : ''),
      ),
    );
    const botoes = el('div', 'caa-cartao-botoes');
    const botao = (rotulo: string, classe: string, acao: () => void) => {
      const b = el('button', classe, rotulo);
      b.addEventListener('click', acao);
      botoes.appendChild(b);
      return b;
    };
    if (conjunto.id !== ativo) {
      botao('✓ Abrir esta no botão', 'botao-opcao', async () => {
        await definirAtivo(conjunto.id);
        await recarregar();
      });
    }
    botao('✏️ Montar', 'botao-opcao', () => montarEditor(raiz, conjunto, nav));
    botao('▶ Experimentar', 'botao-opcao', () => nav.experimentar(conjunto, recarregar));
    const imprimir = botao('🖨️ Imprimir…', 'botao-opcao', () => {
      imprimir.replaceWith(opcoesDeImpressao(conjunto));
    });
    botao('💾 Guardar arquivo', 'botao-opcao', () => {
      const arquivo = new File([paraArquivo(conjunto)], nomeDoArquivo(conjunto), { type: 'application/json' });
      void entregarArquivo(arquivo);
    });
    botao('⧉ Duplicar', 'botao-opcao', async () => {
      await duplicarConjunto(conjunto);
      await recarregar();
    });
    if (lista.length > 1) {
      const excluir = botao('🗑️ Excluir', 'botao-opcao botao-perigo', () => {
        const confirma = el('div', 'caa-confirma');
        confirma.appendChild(el('p', undefined, `Excluir "${conjunto.nome}" deste aparelho? Não dá para desfazer (a não ser que haja um arquivo guardado).`));
        const sim = el('button', 'botao-grande', 'Excluir');
        sim.addEventListener('click', async () => {
          await excluirConjunto(conjunto.id);
          await recarregar();
        });
        const nao = el('button', 'botao-opcao', 'Deixar');
        nao.addEventListener('click', () => confirma.replaceWith(excluir));
        confirma.append(sim, nao);
        excluir.replaceWith(confirma);
      });
    }
    cartao.appendChild(botoes);
    corpo.appendChild(cartao);
  }
}

// ------------------------------------------------------------------- montar --

function montarEditor(raiz: HTMLElement, conjunto: ConjuntoCaa, nav: NavMontar): void {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-config tela-caa-montar';
  window.scrollTo(0, 0);
  const voltarLista = () => void montarTelaPranchasAdultos(raiz, nav);

  let prancha: PranchaCaa = pranchaInicial(conjunto);
  let selecionada: CasaCaa | null = null;
  let espera: number | undefined;
  const guardar = () => {
    clearTimeout(espera);
    espera = window.setTimeout(() => void salvarConjunto(conjunto), 300);
  };
  const guardarJa = async () => {
    clearTimeout(espera);
    await salvarConjunto(conjunto);
  };

  raiz.appendChild(barra(`Montar: ${conjunto.nome}`, async () => {
    await guardarJa();
    voltarLista();
  }));
  const corpo = el('div', 'corpo-config caa-editor');
  raiz.appendChild(corpo);

  const experimentar = el('button', 'botao-grande', '▶ Experimentar');
  experimentar.addEventListener('click', async () => {
    await guardarJa();
    nav.experimentar(conjunto, () => montarEditor(raiz, conjunto, nav));
  });
  corpo.appendChild(experimentar);

  // ---- nome e ajustes ----
  corpo.appendChild(
    campo('Nome', conjunto.nome, LIMITES.nome, (v) => {
      conjunto.nome = v.trim() || 'Prancha';
      raiz.querySelector('.titulo-barra')!.textContent = `Montar: ${conjunto.nome}`;
      guardar();
    }),
  );
  const ajustes = el('details', 'caa-ajustes');
  ajustes.appendChild(el('summary', undefined, 'Como a prancha se comporta'));
  const aj = conjunto.ajustes;
  const marcar = (rotulo: string, chave: 'cores' | 'falarAoTocar' | 'montarFrase' | 'voltarAoInicio') =>
    ajustes.appendChild(
      caixaDeMarcar(rotulo, aj[chave], (v) => {
        aj[chave] = v;
        guardar();
        desenharGrade();
      }),
    );
  marcar('A voz diz a palavra a cada toque', 'falarAoTocar');
  marcar('As palavras tocadas se juntam numa frase no alto', 'montarFrase');
  marcar('Cor de fundo por categoria (a palavra continua escrita)', 'cores');
  marcar('Depois de escolher numa prancha de assunto, volta ao Início', 'voltarAoInicio');
  ajustes.appendChild(
    escolha(
      'Toque repetido na mesma casa',
      [
        { valor: 0, nome: 'vale sempre' },
        { valor: 400, nome: 'ignorado por meio segundo' },
        { valor: 1000, nome: 'ignorado por 1 segundo' },
        { valor: 2000, nome: 'ignorado por 2 segundos' },
      ],
      aj.esperaEntreToques,
      (v) => {
        aj.esperaEntreToques = v;
        guardar();
      },
    ),
  );
  ajustes.appendChild(
    escolha(
      'Varredura (para quem usa um só gesto)',
      [
        { valor: 0, nome: 'desligada' },
        { valor: 1500, nome: '1,5 segundo em cada casa' },
        { valor: 2500, nome: '2,5 segundos em cada casa' },
        { valor: 4000, nome: '4 segundos em cada casa' },
      ],
      aj.varredura,
      (v) => {
        aj.varredura = v;
        guardar();
      },
    ),
  );
  ajustes.appendChild(
    el(
      'p',
      'texto-sobre',
      'Na varredura, um destaque passeia pelas casas e qualquer toque na tela (ou a barra de espaço, ou um acionador que imite tecla) escolhe a casa destacada.',
    ),
  );
  corpo.appendChild(ajustes);

  // ---- qual prancha ----
  corpo.appendChild(el('h2', 'titulo-secao', 'Pranchas'));
  const linhaPranchas = el('div', 'caa-linha');
  corpo.appendChild(linhaPranchas);
  const dadosPrancha = el('div', 'caa-linha');
  corpo.appendChild(dadosPrancha);

  const grade = el('div', 'caa-grade caa-grade-editor');
  corpo.appendChild(grade);
  const maisCasa = el('button', 'botao-opcao', '+ Casa');
  maisCasa.addEventListener('click', () => {
    if (prancha.casas.length >= LIMITES.casasPorPrancha) return;
    const casa: CasaCaa = { id: idLivre('casa', prancha.casas.map((c) => c.id)), rotulo: '', categoria: 'coisa' };
    prancha.casas.push(casa);
    selecionada = casa;
    guardar();
    desenharTudo();
  });
  corpo.appendChild(maisCasa);
  const painel = el('section', 'caa-painel-casa');
  painel.setAttribute('aria-label', 'A casa escolhida');
  corpo.appendChild(painel);

  function desenharPranchas(): void {
    linhaPranchas.innerHTML = '';
    linhaPranchas.appendChild(
      escolha(
        'Prancha',
        conjunto.pranchas.map((p) => ({ valor: p.id, nome: p.id === conjunto.inicial ? `${p.titulo} (a primeira)` : p.titulo })),
        prancha.id,
        (id) => {
          prancha = conjunto.pranchas.find((p) => p.id === id)!;
          selecionada = null;
          desenharTudo();
        },
      ),
    );
    const nova = el('button', 'botao-opcao', '+ Prancha de assunto');
    nova.addEventListener('click', () => {
      if (conjunto.pranchas.length >= LIMITES.pranchas) return;
      const p: PranchaCaa = {
        id: idLivre('assunto', conjunto.pranchas.map((x) => x.id)),
        titulo: 'Novo assunto',
        colunas: 4,
        casas: Array.from({ length: 8 }, (_, i) => ({ id: `casa-${i + 1}`, rotulo: '', categoria: 'coisa' as const })),
      };
      conjunto.pranchas.push(p);
      prancha = p;
      selecionada = null;
      guardar();
      desenharTudo();
    });
    linhaPranchas.appendChild(nova);
    linhaPranchas.appendChild(
      el('p', 'texto-sobre', 'Para chegar a uma prancha de assunto, escolha uma casa e diga que ela "abre" essa prancha.'),
    );

    dadosPrancha.innerHTML = '';
    dadosPrancha.appendChild(
      campo('Título', prancha.titulo, LIMITES.rotulo, (v) => {
        prancha.titulo = v.trim() || 'Prancha';
        guardar();
      }),
    );
    const [min, max] = LIMITES.colunas;
    dadosPrancha.appendChild(
      escolha(
        'Casas por linha',
        Array.from({ length: max - min + 1 }, (_, i) => ({ valor: min + i, nome: String(min + i) })),
        prancha.colunas,
        (v) => {
          prancha.colunas = v;
          guardar();
          desenharGrade();
        },
      ),
    );
    if (prancha.id !== conjunto.inicial) {
      const tirar = el('button', 'botao-opcao botao-perigo', '🗑️ Tirar esta prancha');
      tirar.addEventListener('click', () => {
        conjunto.pranchas = conjunto.pranchas.filter((p) => p !== prancha);
        for (const p of conjunto.pranchas) for (const c of p.casas) if (c.abre === prancha.id) delete c.abre;
        prancha = pranchaInicial(conjunto);
        selecionada = null;
        guardar();
        desenharTudo();
      });
      dadosPrancha.appendChild(tirar);
    }
  }

  function desenharGrade(): void {
    grade.innerHTML = '';
    grade.style.setProperty('--colunas', String(prancha.colunas));
    grade.style.setProperty('--lado', `${Math.max(56, Math.min(120, (Math.min(window.innerWidth, 900) - 64) / prancha.colunas - 8))}px`);
    for (const casa of prancha.casas) {
      // no editor até a casa vazia é botão: é tocando nela que se preenche
      const vazia = !casa.rotulo.trim();
      const no = vazia ? el('button', 'casa-caa vazia', '+') : desenharCasa(casa, conjunto, conjunto.ajustes.cores);
      if (vazia) no.setAttribute('aria-label', 'Casa vazia: tocar para preencher');
      if (casa === selecionada) no.classList.add('escolhida');
      no.setAttribute('aria-pressed', String(casa === selecionada));
      no.addEventListener('click', () => {
        selecionada = casa;
        desenharGrade();
        desenharPainel();
        painel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
      grade.appendChild(no);
    }
  }

  function desenharPainel(): void {
    painel.innerHTML = '';
    const casa = selecionada;
    if (!casa) {
      painel.appendChild(el('p', 'texto-sobre', 'Toque numa casa acima para mudar a palavra, a figura ou a voz.'));
      return;
    }
    const mudou = () => {
      guardar();
      desenharGrade();
    };
    const nomeDaCasa = () => (casa.rotulo.trim() ? `Casa "${casa.rotulo}"` : 'Casa vazia');
    const cabecalho = painel.appendChild(el('h3', 'caa-cartao-nome', nomeDaCasa()));
    painel.appendChild(
      campo('Palavra escrita', casa.rotulo, LIMITES.rotulo, (v) => {
        casa.rotulo = v;
        cabecalho.textContent = nomeDaCasa();
        mudou();
      }, 'ex.: ÔNIBUS'),
    );
    painel.appendChild(
      campo('O que a voz diz (se for diferente)', casa.fala ?? '', LIMITES.fala, (v) => {
        if (v.trim()) casa.fala = v;
        else delete casa.fala;
        guardar();
      }, 'ex.: eu quero ir de ônibus'),
    );
    const frase = el('details', 'caa-ajustes');
    frase.appendChild(el('summary', undefined, 'Dentro de uma frase'));
    frase.appendChild(
      el('p', 'texto-sobre', 'Quando a casa entra numa frase de várias palavras, a voz pode dizer outra coisa. Ex.: DOR sozinha diz "estou com dor"; em EU + ESTOU + DOR diz só "com dor".'),
    );
    frase.appendChild(
      campo('Na frase, a voz diz', casa.naFrase ?? '', LIMITES.fala, (v) => {
        if (v.trim()) casa.naFrase = v;
        else delete casa.naFrase;
        guardar();
      }),
    );
    painel.appendChild(frase);

    const ouvir = el('button', 'botao-opcao', '🔊 Ouvir');
    ouvir.addEventListener('click', () => falar(falaDaCasa(casa)));
    painel.appendChild(ouvir);

    painel.appendChild(
      escolha('Categoria (dá a cor)', CATEGORIAS.map((c) => ({ valor: c.id, nome: c.nome })), casa.categoria, (v) => {
        casa.categoria = v;
        mudou();
      }),
    );

    painel.appendChild(
      escolha(
        'Ao tocar, abre outra prancha?',
        [
          { valor: '', nome: 'não: é uma palavra' },
          ...conjunto.pranchas.filter((p) => p.id !== prancha.id).map((p) => ({ valor: p.id, nome: `sim: abre "${p.titulo}"` })),
        ],
        casa.abre ?? '',
        (v) => {
          if (v) casa.abre = v;
          else delete casa.abre;
          mudou();
        },
      ),
    );

    // ---- figura ----
    painel.appendChild(el('h3', 'caa-campo-nome', 'Figura'));
    const linhaFigura = el('div', 'caa-linha');
    const foto = el('input');
    foto.type = 'file';
    foto.accept = 'image/*';
    foto.hidden = true;
    const avisoFoto = el('p', 'aviso-trava', '');
    foto.addEventListener('change', async () => {
      const arq = foto.files?.[0];
      foto.value = '';
      if (!arq) return;
      try {
        casa.imagem = await reduzirFigura(arq);
        delete casa.pictograma;
        mudou();
        desenharPainel();
      } catch (e) {
        avisoFoto.textContent = e instanceof Error ? e.message : 'Não deu para usar esta imagem.';
      }
    });
    const botaoFoto = el('button', 'botao-opcao', '📷 Foto ou figura do aparelho');
    botaoFoto.addEventListener('click', () => foto.click());
    const semFigura = el('button', 'botao-opcao', 'Sem figura');
    semFigura.addEventListener('click', () => {
      delete casa.imagem;
      delete casa.pictograma;
      mudou();
      desenharPainel();
    });
    linhaFigura.append(botaoFoto, semFigura, foto);
    painel.append(linhaFigura, avisoFoto);
    if (casa.imagem) painel.appendChild(el('p', 'texto-sobre', 'Esta casa usa uma foto ou figura do aparelho. Escolher um desenho abaixo troca por ele.'));

    const desenhos = el('div', 'caa-desenhos');
    desenhos.setAttribute('role', 'group');
    desenhos.setAttribute('aria-label', 'Desenhos');
    for (const chave of Object.keys(PICTOGRAMAS)) {
      const b = el('button', 'caa-desenho');
      b.innerHTML = svgDoPictograma(chave);
      b.appendChild(el('span', undefined, NOMES_DOS_PICTOGRAMAS[chave] ?? chave));
      b.setAttribute('aria-pressed', String(!casa.imagem && casa.pictograma === chave));
      b.addEventListener('click', () => {
        casa.pictograma = chave;
        delete casa.imagem;
        mudou();
        desenharPainel();
      });
      desenhos.appendChild(b);
    }
    painel.appendChild(desenhos);

    // ---- lugar e remoção ----
    const linhaFim = el('div', 'caa-linha');
    const i = prancha.casas.indexOf(casa);
    const mover = (rotulo: string, passo: number, nome: string) => {
      const b = el('button', 'botao-opcao', rotulo);
      b.setAttribute('aria-label', nome);
      b.disabled = i + passo < 0 || i + passo >= prancha.casas.length;
      b.addEventListener('click', () => {
        const [x] = prancha.casas.splice(i, 1);
        prancha.casas.splice(i + passo, 0, x);
        mudou();
        desenharPainel();
      });
      linhaFim.appendChild(b);
    };
    mover('◀', -1, 'Passar para a casa anterior');
    mover('▶', 1, 'Passar para a casa seguinte');
    const esvaziar = el('button', 'botao-opcao', 'Esvaziar (guarda o lugar)');
    esvaziar.addEventListener('click', () => {
      casa.rotulo = '';
      delete casa.fala;
      delete casa.naFrase;
      delete casa.imagem;
      delete casa.pictograma;
      delete casa.abre;
      mudou();
      desenharPainel();
    });
    const tirar = el('button', 'botao-opcao botao-perigo', 'Tirar a casa');
    tirar.addEventListener('click', () => {
      prancha.casas.splice(prancha.casas.indexOf(casa), 1);
      selecionada = null;
      mudou();
      desenharPainel();
    });
    linhaFim.append(esvaziar, tirar);
    painel.appendChild(linhaFim);
    painel.appendChild(
      el('p', 'texto-sobre', 'Mudar uma casa de lugar atrapalha quem já aprendeu onde ela fica. Prefira esvaziar e preencher a mover.'),
    );
  }

  function desenharTudo(): void {
    desenharPranchas();
    desenharGrade();
    desenharPainel();
  }
  desenharTudo();

  corpo.appendChild(el('h2', 'titulo-secao', 'Papel'));
  corpo.appendChild(opcoesDeImpressao(conjunto));
}
