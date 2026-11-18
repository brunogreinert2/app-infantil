// FAZER UMA FOLHA — a tela de quem ensina para os geradores desta pasta.
//
// Escolhe o tipo, preenche, vê a prévia ao lado e imprime (no computador, a
// janela de impressão guarda em PDF). Tudo acontece no aparelho, sem rede.
//
// Desligada por enquanto: ver FOLHAS_LIGADAS em pedido.ts.

import { armazenamento } from '../armazenamento/armazenamento';
import { corpoCadernoA4, cssCadernoA4, imprimirDocumento } from '../impressao/motorImpressao';
import { el } from '../telas/comum';
import { silabasComHifens } from '../conteudo/silabas';
import { NOMES_COM_DESENHO } from './jogosDeMesa';
import {
  NOMES_DAS_CONTAS,
  NOMES_DAS_GRADES,
  NOMES_DAS_SILABAS,
  NOMES_DA_LOGICA,
  NOMES_DA_MOTORA,
  NOMES_DOS_CARTOES,
  NOMES_DO_RECORTAR,
  NOMES_DA_MATEMATICA,
  NOMES_DOS_JOGOS,
  NOMES_DAS_PAUTAS,
  TIPOS,
  fazerFolhas,
  lerPalavras,
  pedidoInicial,
  type Pedido,
  type Resultado,
  type TipoDeFolha,
} from './pedido';
import { NOMES_DAS_LETRAS, type Letra } from './comum';
import { MOLDURA_DA_FIGURA, encaixeDaFigura, zoomFiguraInteira } from './papeis';

// do aparelho, não do perfil (como as pranchas): é material de quem ensina
const CHAVE = 'folhas:pedidos';
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface Guardado {
  tipo: TipoDeFolha;
  letra?: Letra;
  pedidos: Partial<Record<TipoDeFolha, Pedido>>;
}

function rotulado(nome: string, controle: HTMLElement, dica?: string): HTMLElement {
  const linha = el('label', 'caa-campo');
  linha.appendChild(el('span', 'caa-campo-nome', nome));
  linha.appendChild(controle);
  if (dica) linha.appendChild(el('span', 'folhas-dica', dica));
  return linha;
}

function campoTexto(valor: string, aoMudar: (v: string) => void, max = 60): HTMLInputElement {
  const e = el('input');
  e.type = 'text';
  e.value = valor;
  e.maxLength = max;
  e.addEventListener('input', () => aoMudar(e.value));
  return e;
}

function campoNumero(valor: number, aoMudar: (v: number) => void, min: number, max: number, passo = 1): HTMLInputElement {
  const e = el('input');
  e.type = 'number';
  e.value = String(valor);
  e.min = String(min);
  e.max = String(max);
  e.step = String(passo);
  e.inputMode = 'decimal';
  e.addEventListener('input', () => aoMudar(e.value === '' ? NaN : Number(e.value)));
  return e;
}

function areaDeTexto(valor: string, linhas: number, aoMudar: (v: string) => void): HTMLTextAreaElement {
  const e = el('textarea', 'folhas-area');
  e.value = valor;
  e.rows = linhas;
  e.maxLength = 3000;
  e.spellcheck = false;
  e.autocapitalize = 'characters';
  e.addEventListener('input', () => aoMudar(e.value));
  return e;
}

function lista<T extends string | number>(opcoes: Array<{ valor: T; nome: string }>, atual: T, aoMudar: (v: T) => void): HTMLSelectElement {
  const sel = el('select');
  for (const o of opcoes) {
    const op = el('option', undefined, o.nome);
    op.value = String(o.valor);
    op.selected = o.valor === atual;
    sel.appendChild(op);
  }
  sel.addEventListener('change', () => {
    const o = opcoes.find((x) => String(x.valor) === sel.value);
    if (o) aoMudar(o.valor);
  });
  return sel;
}

function botao(texto: string, aoClicar: () => void): HTMLButtonElement {
  const b = el('button', 'botao-opcao', texto);
  b.type = 'button';
  b.addEventListener('click', aoClicar);
  return b;
}

function opcoes<T extends string>(nomes: Record<T, string>): Array<{ valor: T; nome: string }> {
  return (Object.keys(nomes) as T[]).map((valor) => ({ valor, nome: nomes[valor] }));
}

function marcar(nome: string, marcado: boolean, aoMudar: (v: boolean) => void): HTMLElement {
  const linha = el('label', 'caa-marcar');
  const caixa = el('input');
  caixa.type = 'checkbox';
  caixa.checked = marcado;
  caixa.addEventListener('change', () => aoMudar(caixa.checked));
  linha.append(caixa, el('span', undefined, nome));
  return linha;
}

/** Reduz a foto no aparelho (até 1400 px, JPEG) para caber no calendário e no que se guarda. */
async function reduzirParaCalendario(arquivo: File): Promise<{ url: string; aspecto: number } | undefined> {
  if (!/^image\/(png|jpeg|webp)$/.test(arquivo.type)) return undefined;
  const url = URL.createObjectURL(arquivo);
  try {
    const img = new Image();
    // onload, e não decode(): decode() pode ficar parado com a aba em segundo plano
    await new Promise<void>((ok, falha) => {
      img.onload = () => ok();
      img.onerror = () => falha(new Error('imagem ilegível'));
      img.src = url;
    });
    const escala = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * escala));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * escala));
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { url: canvas.toDataURL('image/jpeg', 0.85), aspecto: canvas.width / canvas.height };
  } catch {
    return undefined;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function montarTelaFolhas(raiz: HTMLElement, nav: { voltar: () => void }): Promise<void> {
  const guardado = (await armazenamento.obter<Guardado>(CHAVE)) ?? { tipo: 'caca', pedidos: {} };
  let tipo: TipoDeFolha = TIPOS.some((t) => t.tipo === guardado.tipo) ? guardado.tipo : 'caca';
  const pedidos: Partial<Record<TipoDeFolha, Pedido>> = guardado.pedidos ?? {};
  let letra: Letra = guardado.letra && guardado.letra in NOMES_DAS_LETRAS ? guardado.letra : 'atkinson';
  let resultado: Resultado | undefined;

  raiz.innerHTML = '';
  raiz.className = 'tela tela-folhas';
  const barra = el('header', 'barra-topo');
  const voltar = el('button', 'botao-icone', '←');
  voltar.setAttribute('aria-label', 'Voltar');
  voltar.addEventListener('click', nav.voltar);
  barra.append(voltar, el('h1', 'titulo-barra', 'Fazer uma folha'));
  raiz.appendChild(barra);

  const corpo = el('main', 'folhas-corpo');
  const formulario = el('section', 'folhas-formulario');
  formulario.setAttribute('aria-label', 'O que vai na folha');
  const campos = el('div', 'folhas-campos');
  const avisos = el('ul', 'folhas-avisos');
  avisos.setAttribute('aria-live', 'polite');
  const previa = el('section', 'folhas-previa');
  previa.setAttribute('aria-label', 'Prévia');

  const pedido = (): Pedido => {
    // o que foi guardado por uma versão antiga pode não servir: cai no inicial
    const p = pedidos[tipo];
    if (!p || p.tipo !== tipo) pedidos[tipo] = pedidoInicial(tipo);
    return pedidos[tipo]!;
  };

  let espera: number | undefined;
  const atualizar = (jaJa = false): void => {
    window.clearTimeout(espera);
    espera = window.setTimeout(
      () => {
        try {
          resultado = fazerFolhas(pedido(), letra);
        } catch (erro) {
          resultado = { titulo: 'Folha', folhas: [], avisos: [`Não deu para fazer esta folha: ${String((erro as Error).message ?? erro)}`] };
        }
        avisos.innerHTML = '';
        for (const a of resultado.avisos) avisos.appendChild(el('li', undefined, a));
        previa.innerHTML = '';
        for (const f of resultado.folhas) {
          const figura = el('figure', 'folhas-folha');
          const papel = el('div', 'folhas-papel');
          // O SVG é nosso: texto de quem digita entra como caminho de letra ou
          // escapado; a figura do calendário só passa se for data: de imagem.
          papel.innerHTML = f.svg;
          if (figuraArrastavel() && previa.childElementCount === 0) papel.classList.add('folhas-papel-arrastar');
          figura.append(papel, el('figcaption', undefined, f.titulo));
          previa.appendChild(figura);
        }
        imprimir.disabled = !resultado.folhas.length;
        // a figura do calendário pode ser grande demais para guardar: sem ela
        const paraGuardar: Guardado = { tipo, letra, pedidos: { ...pedidos } };
        const cal = paraGuardar.pedidos.calendario;
        if (cal?.tipo === 'calendario' && cal.imagem) paraGuardar.pedidos.calendario = { ...cal, imagem: undefined };
        void armazenamento.definir(CHAVE, paraGuardar);
      },
      jaJa ? 0 : 180,
    );
  };

  const desenharCampos = (): void => {
    campos.innerHTML = '';
    const p = pedido();
    switch (p.tipo) {
      case 'caca': {
        campos.appendChild(rotulado('Título', campoTexto(p.titulo, (v) => ((p.titulo = v), atualizar()))));
        campos.appendChild(
          rotulado('Palavras', areaDeTexto(p.palavras, 9, (v) => ((p.palavras = v), atualizar())), 'Uma por linha. Acento e espaço não entram na grade.'),
        );
        campos.appendChild(
          rotulado(
            'Dificuldade',
            lista(
              [
                { valor: 'facil' as const, nome: 'Fácil: deitadas e em pé' },
                { valor: 'medio' as const, nome: 'Média: também na diagonal' },
                { valor: 'dificil' as const, nome: 'Difícil: todas as direções, até de trás para frente' },
              ],
              p.nivel,
              (v) => ((p.nivel = v), atualizar(true)),
            ),
          ),
        );
        const outra = el('button', 'botao-opcao', '🔀 Embaralhar de outro jeito');
        outra.type = 'button';
        outra.addEventListener('click', () => ((p.semente = (p.semente || 0) + 1), atualizar(true)));
        campos.appendChild(outra);
        campos.appendChild(marcar('Folha de respostas junto', p.respostas, (v) => ((p.respostas = v), atualizar(true))));
        // as mesmas palavras, separadas em sílabas: sugestão para conferir
        const silabas = el('details', 'folhas-silabas');
        silabas.appendChild(el('summary', undefined, 'Ver estas palavras em sílabas'));
        const texto = el('p', 'texto-sobre');
        silabas.appendChild(texto);
        silabas.appendChild(el('p', 'folhas-dica', 'É uma sugestão do app. Confira antes de ensinar.'));
        silabas.addEventListener('toggle', () => {
          texto.textContent = lerPalavras(p.palavras).map(silabasComHifens).join(' · ');
        });
        campos.appendChild(silabas);
        break;
      }
      case 'cruzadinha':
        campos.appendChild(rotulado('Título', campoTexto(p.titulo, (v) => ((p.titulo = v), atualizar()))));
        campos.appendChild(
          rotulado('Palavras e dicas', areaDeTexto(p.itens, 10, (v) => ((p.itens = v), atualizar())), 'Uma por linha, assim: PALAVRA: dica'),
        );
        campos.appendChild(marcar('Folha de respostas junto', p.respostas, (v) => ((p.respostas = v), atualizar(true))));
        break;
      case 'jogo': {
        campos.appendChild(
          rotulado(
            'Qual jogo?',
            lista(
              (Object.keys(NOMES_DOS_JOGOS) as Array<keyof typeof NOMES_DOS_JOGOS>).map((valor) => ({ valor, nome: NOMES_DOS_JOGOS[valor] })),
              p.jogo,
              (v) => ((p.jogo = v), desenharCampos(), atualizar(true)),
            ),
          ),
        );
        if (p.jogo === 'damas' || p.jogo === 'xadrez') {
          campos.appendChild(el('p', 'texto-sobre', 'Sai o tabuleiro numa folha e as peças de recortar em outra.'));
          break;
        }
        campos.appendChild(
          rotulado('Palavras das peças', areaDeTexto(p.pecas, 9, (v) => ((p.pecas = v), atualizar())), 'Uma por linha. Se o app tiver o desenho da palavra, ele entra na peça.'),
        );
        const desenhos = el('details', 'folhas-silabas');
        desenhos.appendChild(el('summary', undefined, 'Palavras que têm desenho'));
        desenhos.appendChild(el('p', 'texto-sobre', NOMES_COM_DESENHO.join(' · ')));
        campos.appendChild(desenhos);
        if (p.jogo === 'memoria' || p.jogo === 'memoria-leitura') {
          campos.appendChild(marcar('Folha de verso (para imprimir atrás)', p.verso, (v) => ((p.verso = v), atualizar(true))));
        }
        if (p.jogo === 'bingo') {
          campos.appendChild(
            rotulado(
              'Tamanho da cartela',
              lista(
                [
                  { valor: 3 as const, nome: '9 casas (3 por 3)' },
                  { valor: 4 as const, nome: '16 casas (4 por 4)' },
                ],
                p.lado,
                (v) => ((p.lado = v), atualizar(true)),
              ),
            ),
          );
          campos.appendChild(rotulado('Quantas cartelas', campoNumero(p.cartelas, (v) => ((p.cartelas = v), atualizar()), 1, 40)));
          const outras = el('button', 'botao-opcao', '🔀 Outras cartelas');
          outras.type = 'button';
          outras.addEventListener('click', () => ((p.semente = (p.semente || 0) + 1), atualizar(true)));
          campos.appendChild(outras);
        }
        break;
      }
      case 'matematica': {
        campos.appendChild(
          rotulado(
            'Qual folha?',
            lista(
              (Object.keys(NOMES_DA_MATEMATICA) as Array<keyof typeof NOMES_DA_MATEMATICA>).map((valor) => ({ valor, nome: NOMES_DA_MATEMATICA[valor] })),
              p.modelo,
              (v) => ((p.modelo = v), desenharCampos(), atualizar(true)),
            ),
          ),
        );
        if (p.modelo === 'ler' || p.modelo === 'marcar') {
          campos.appendChild(
            rotulado('Horas', areaDeTexto(p.horas, 7, (v) => ((p.horas = v), atualizar())), 'Uma por linha, assim: 7:15. Seis relógios por folha.'),
          );
          campos.appendChild(marcar('Folha de respostas junto', p.respostas, (v) => ((p.respostas = v), atualizar(true))));
        }
        if (p.modelo === 'reta') {
          const faixa = el('div', 'folhas-abc');
          faixa.appendChild(rotulado('De', campoNumero(p.de, (v) => ((p.de = v), atualizar()), -100, 1000)));
          faixa.appendChild(rotulado('Até', campoNumero(p.ate, (v) => ((p.ate = v), atualizar()), -100, 1000)));
          campos.appendChild(faixa);
          campos.appendChild(marcar('Deixar retas sem número, para completar', p.completar, (v) => ((p.completar = v), atualizar(true))));
        }
        break;
      }
      case 'silabas': {
        campos.appendChild(rotulado('Qual folha?', lista(opcoes(NOMES_DAS_SILABAS), p.modelo, (v) => ((p.modelo = v), desenharCampos(), atualizar(true)))));
        if (p.modelo === 'familias') {
          campos.appendChild(rotulado('Famílias', campoTexto(p.familias, (v) => ((p.familias = v), atualizar()), 80), 'O começo de cada família, separado por espaço: B C D, ou CH LH NH QU.'));
          campos.appendChild(marcar('Só a primeira sílaba escrita (para completar)', p.completar, (v) => ((p.completar = v), atualizar(true))));
        } else {
          const dica =
            p.modelo === 'moveis'
              ? 'Uma palavra por linha. O desenho entra se o app tiver.'
              : 'Palavras (o app separa) ou sílabas soltas: BA BE BI BO BU.';
          campos.appendChild(rotulado(p.modelo === 'moveis' ? 'Palavras' : 'Palavras ou sílabas', areaDeTexto(p.palavras, 8, (v) => ((p.palavras = v), atualizar())), dica));
        }
        if (p.modelo === 'bingo') {
          campos.appendChild(rotulado('Quantas cartelas', campoNumero(p.cartelas, (v) => ((p.cartelas = v), atualizar()), 1, 40)));
          campos.appendChild(botao('🔀 Outras cartelas', () => ((p.semente = (p.semente || 0) + 1), atualizar(true))));
        }
        break;
      }
      case 'logica': {
        campos.appendChild(rotulado('Qual folha?', lista(opcoes(NOMES_DA_LOGICA), p.modelo, (v) => ((p.modelo = v), desenharCampos(), atualizar(true)))));
        if (p.modelo === 'labirinto') {
          campos.appendChild(
            rotulado(
              'Tamanho',
              lista(
                [
                  { valor: 'facil' as const, nome: 'Pequeno (6 × 8)' },
                  { valor: 'medio' as const, nome: 'Médio (12 × 15)' },
                  { valor: 'dificil' as const, nome: 'Grande (20 × 26)' },
                ],
                p.nivel,
                (v) => ((p.nivel = v), atualizar(true)),
              ),
            ),
          );
        }
        campos.appendChild(botao(p.modelo === 'labirinto' ? '🔀 Outro labirinto' : '🔀 Outro sudoku', () => ((p.semente = (p.semente || 0) + 1), atualizar(true))));
        campos.appendChild(marcar('Folha de respostas junto', p.respostas, (v) => ((p.respostas = v), atualizar(true))));
        break;
      }
      case 'contas': {
        campos.appendChild(rotulado('Qual folha?', lista(opcoes(NOMES_DAS_CONTAS), p.modelo, (v) => ((p.modelo = v), desenharCampos(), atualizar(true)))));
        if (p.modelo === 'armadas') {
          campos.appendChild(
            rotulado(
              'Operação',
              lista(
                [
                  { valor: '+' as const, nome: 'Adição (+)' },
                  { valor: '-' as const, nome: 'Subtração (–)' },
                  { valor: 'x' as const, nome: 'Multiplicação (×) por um algarismo' },
                  { valor: '/' as const, nome: 'Divisão (÷) exata, por um algarismo' },
                ],
                p.operacao,
                (v) => ((p.operacao = v), desenharCampos(), atualizar(true)),
              ),
            ),
          );
          campos.appendChild(
            rotulado('Algarismos do primeiro número', lista([1, 2, 3, 4].map((v) => ({ valor: v, nome: String(v) })), p.algarismos, (v) => ((p.algarismos = v), atualizar(true)))),
          );
          if (p.operacao === '+' || p.operacao === '-') {
            campos.appendChild(marcar(p.operacao === '+' ? 'Com "vai um"' : 'Com "empresta"', p.reagrupar, (v) => ((p.reagrupar = v), atualizar(true))));
          }
          campos.appendChild(rotulado('Quantas contas', campoNumero(p.quantas, (v) => ((p.quantas = v), atualizar()), 1, 40), p.operacao === '/' ? 'Dez por folha.' : 'Doze por folha.'));
          campos.appendChild(botao('🔀 Outras contas', () => ((p.semente = (p.semente || 0) + 1), atualizar(true))));
          campos.appendChild(marcar('Folha de respostas junto', p.respostas, (v) => ((p.respostas = v), atualizar(true))));
        } else {
          if (p.modelo === 'tabuada') campos.appendChild(rotulado('Tabuada do', campoNumero(p.numero, (v) => ((p.numero = v), atualizar()), 1, 20)));
          campos.appendChild(marcar('Para completar', p.completar, (v) => ((p.completar = v), atualizar(true))));
        }
        break;
      }
      case 'recortar': {
        campos.appendChild(rotulado('Qual folha?', lista(opcoes(NOMES_DO_RECORTAR), p.modelo, (v) => ((p.modelo = v), desenharCampos(), atualizar(true)))));
        if (p.modelo === 'posicional') {
          campos.appendChild(
            rotulado(
              'Até qual ordem',
              lista(
                [
                  { valor: 3 as const, nome: 'Centena (C D U)' },
                  { valor: 4 as const, nome: 'Unidade de milhar (UM C D U)' },
                  { valor: 6 as const, nome: 'Centena de milhar (CM DM UM C D U)' },
                ],
                p.ordens,
                (v) => ((p.ordens = v), atualizar(true)),
              ),
            ),
          );
        }
        break;
      }
      case 'motora':
        campos.appendChild(rotulado('Qual folha?', lista(opcoes(NOMES_DA_MOTORA), p.modelo, (v) => ((p.modelo = v), atualizar(true)))));
        break;
      case 'cartoes': {
        campos.appendChild(rotulado('Qual folha?', lista(opcoes(NOMES_DOS_CARTOES), p.modelo, (v) => ((p.modelo = v), desenharCampos(), atualizar(true)))));
        if (p.modelo === 'hq') {
          campos.appendChild(
            rotulado(
              'Quadros',
              lista([3, 4, 6].map((v) => ({ valor: v as 3 | 4 | 6, nome: `${v} quadros` })), p.quadros, (v) => ((p.quadros = v), atualizar(true))),
            ),
          );
          campos.appendChild(marcar('Linhas para escrever embaixo de cada quadro', p.linhas, (v) => ((p.linhas = v), atualizar(true))));
          break;
        }
        const nomes = areaDeTexto(p.nomes, 8, (v) => ((p.nomes = v), atualizar()));
        nomes.autocapitalize = 'words';
        campos.appendChild(rotulado('Nomes', nomes, 'Um por linha. Sem nomes, sai em branco para escrever à mão.'));
        if (p.modelo !== 'marcadores') {
          campos.appendChild(rotulado(p.modelo === 'crachas' ? 'Segunda linha (turma, escola)' : 'Turma', campoTexto(p.linha2 ?? '', (v) => ((p.linha2 = v), atualizar()), 40)));
          if (p.modelo === 'etiquetas') {
            campos.appendChild(rotulado('Matéria', campoTexto(p.materia ?? '', (v) => ((p.materia = v), atualizar()), 40), 'Vazia, fica a linha para escrever.'));
          }
        }
        break;
      }
      case 'pauta':
        campos.appendChild(
          rotulado(
            'Tipo de pauta',
            lista(
              (Object.keys(NOMES_DAS_PAUTAS) as Array<keyof typeof NOMES_DAS_PAUTAS>).map((valor) => ({ valor, nome: NOMES_DAS_PAUTAS[valor] })),
              p.modelo,
              (v) => ((p.modelo = v), atualizar(true)),
            ),
          ),
        );
        campos.appendChild(marcar('Linha de margem à esquerda', p.margem, (v) => ((p.margem = v), atualizar(true))));
        break;
      case 'grade':
        campos.appendChild(
          rotulado(
            'Tipo de papel',
            lista(
              (Object.keys(NOMES_DAS_GRADES) as Array<keyof typeof NOMES_DAS_GRADES>).map((valor) => ({ valor, nome: NOMES_DAS_GRADES[valor] })),
              p.modelo,
              (v) => ((p.modelo = v), atualizar(true)),
            ),
          ),
        );
        break;
      case 'reguas':
        campos.appendChild(el('p', 'texto-sobre', 'Duas réguas comuns de 18 cm e uma ampliada, para recortar no tracejado.'));
        break;
      case 'plano': {
        campos.appendChild(
          rotulado(
            'Tamanho dos eixos',
            lista(
              [5, 10, 15, 20].map((v) => ({ valor: v, nome: `de –${v} a ${v}` })),
              p.alcance,
              (v) => ((p.alcance = v), atualizar(true)),
            ),
          ),
        );
        campos.appendChild(marcar('Traçar uma parábola: y = ax² + bx + c', p.curva, (v) => ((p.curva = v), desenharCampos(), atualizar(true))));
        if (p.curva) {
          const abc = el('div', 'folhas-abc');
          abc.appendChild(rotulado('a', campoNumero(p.a, (v) => ((p.a = v), atualizar()), -50, 50, 0.5)));
          abc.appendChild(rotulado('b', campoNumero(p.b, (v) => ((p.b = v), atualizar()), -50, 50, 0.5)));
          abc.appendChild(rotulado('c', campoNumero(p.c, (v) => ((p.c = v), atualizar()), -50, 50, 0.5)));
          campos.appendChild(abc);
          campos.appendChild(marcar('Folha de respostas com a conta de Bhaskara', p.respostas, (v) => ((p.respostas = v), atualizar(true))));
        }
        break;
      }
      case 'calendario': {
        campos.appendChild(
          rotulado(
            'Modelo',
            lista(
              [
                { valor: 'figura' as const, nome: 'Mês com figura no alto e números grandes' },
                { valor: 'anotar' as const, nome: 'Mês com lugar para anotar' },
                { valor: 'ano' as const, nome: 'O ano inteiro numa folha' },
              ],
              p.modelo,
              (v) => ((p.modelo = v), desenharCampos(), atualizar(true)),
            ),
          ),
        );
        if (p.modelo !== 'ano') {
          campos.appendChild(
            rotulado('Mês', lista(MESES.map((nome, i) => ({ valor: i + 1, nome })), p.mes, (v) => ((p.mes = v), atualizar(true)))),
          );
        }
        campos.appendChild(rotulado('Ano', campoNumero(p.ano, (v) => ((p.ano = v), atualizar()), 1900, 2200)));
        if (p.modelo !== 'ano') {
          campos.appendChild(marcar('Marcar os feriados nacionais', p.feriados, (v) => ((p.feriados = v), atualizar(true))));
        }
        if (p.modelo === 'figura') {
          const arquivo = el('input');
          arquivo.type = 'file';
          arquivo.accept = 'image/png,image/jpeg,image/webp';
          arquivo.addEventListener('change', async () => {
            const f = arquivo.files?.[0];
            const reduzida = f ? await reduzirParaCalendario(f) : undefined;
            p.imagem = reduzida?.url;
            p.aspecto = reduzida?.aspecto;
            p.zoom = 1;
            p.posX = 50;
            p.posY = 50;
            desenharCampos();
            atualizar(true);
          });
          campos.appendChild(rotulado('Figura do alto', arquivo, 'Uma foto ou desenho do aparelho. Sem figura, fica a moldura para desenhar ou colar.'));
          if (p.imagem) {
            if (p.aspecto) {
              const aspecto = p.aspecto;
              const tamanho = el('input');
              tamanho.type = 'range';
              tamanho.min = String(Math.round(zoomFiguraInteira(aspecto) * 100));
              tamanho.max = '300';
              tamanho.value = String(Math.round((p.zoom ?? 1) * 100));
              tamanho.addEventListener('input', () => ((p.zoom = Number(tamanho.value) / 100), atualizar(true)));
              campos.appendChild(rotulado('Tamanho da figura', tamanho, 'Para mudar o que aparece, arraste a figura na prévia ao lado.'));
              const botoes = el('div', 'folhas-botoes');
              botoes.appendChild(
                botao('Figura inteira', () => {
                  p.zoom = zoomFiguraInteira(aspecto);
                  p.posX = 50;
                  p.posY = 50;
                  tamanho.value = String(Math.round(p.zoom * 100));
                  atualizar(true);
                }),
              );
              botoes.appendChild(
                botao('Preencher a moldura', () => {
                  p.zoom = 1;
                  p.posX = 50;
                  p.posY = 50;
                  tamanho.value = '100';
                  atualizar(true);
                }),
              );
              campos.appendChild(botoes);
            }
            const tirar = el('button', 'botao-opcao', 'Tirar a figura');
            tirar.type = 'button';
            tirar.addEventListener('click', () => ((p.imagem = undefined), desenharCampos(), atualizar(true)));
            campos.appendChild(tirar);
          }
        }
        break;
      }
    }
  };

  formulario.appendChild(
    rotulado(
      'O que você quer fazer?',
      lista(TIPOS.map((t) => ({ valor: t.tipo, nome: t.nome })), tipo, (v) => {
        tipo = v;
        desenharCampos();
        atualizar(true);
      }),
    ),
  );
  formulario.appendChild(campos);
  formulario.appendChild(
    rotulado('Letra das folhas', lista(opcoes(NOMES_DAS_LETRAS), letra, (v) => ((letra = v), atualizar(true)))),
  );
  formulario.appendChild(avisos);

  const imprimir = el('button', 'botao-grande', '🖨️ Imprimir ou guardar em PDF');
  imprimir.type = 'button';
  imprimir.addEventListener('click', () => {
    if (!resultado?.folhas.length) return;
    imprimirDocumento(resultado.titulo, corpoCadernoA4(resultado.folhas), cssCadernoA4());
  });
  formulario.appendChild(imprimir);
  formulario.appendChild(
    el('p', 'folhas-dica', 'No computador, a janela de impressão tem "Salvar como PDF". Deixe a escala em 100% para as medidas saírem certas.'),
  );

  corpo.append(formulario, previa);

  // Arrastar a figura do calendário na prévia: muda a posição (posX/posY).
  const figuraArrastavel = (): (Pedido & { tipo: 'calendario' }) | undefined => {
    const p = pedido();
    return p.tipo === 'calendario' && p.modelo === 'figura' && p.imagem && p.aspecto ? p : undefined;
  };
  let arrasto: { x: number; y: number; posX: number; posY: number; unidade: number } | undefined;
  previa.addEventListener('pointerdown', (ev) => {
    const p = figuraArrastavel();
    const svg = previa.querySelector('svg');
    if (!p || !svg) return;
    const caixa = svg.getBoundingClientRect();
    const unidade = 800 / caixa.width; // unidades da folha por pixel da tela
    const fx = (ev.clientX - caixa.left) * unidade;
    const fy = (ev.clientY - caixa.top) * unidade;
    const m = MOLDURA_DA_FIGURA;
    if (fx < m.x || fx > m.x + m.w || fy < m.y || fy > m.y + m.h) return;
    arrasto = { x: ev.clientX, y: ev.clientY, posX: p.posX ?? 50, posY: p.posY ?? 50, unidade };
    previa.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });
  previa.addEventListener('pointermove', (ev) => {
    const p = figuraArrastavel();
    if (!arrasto || !p) return;
    const e = encaixeDaFigura(p.aspecto!, p.zoom);
    const m = MOLDURA_DA_FIGURA;
    // posição 0..100 ↔ a figura percorre a sobra (moldura − figura)
    const sobraX = m.w - e.w;
    const sobraY = m.h - e.h;
    const dx = (ev.clientX - arrasto.x) * arrasto.unidade;
    const dy = (ev.clientY - arrasto.y) * arrasto.unidade;
    if (Math.abs(sobraX) > 0.5) p.posX = Math.min(100, Math.max(0, arrasto.posX + (dx / sobraX) * 100));
    if (Math.abs(sobraY) > 0.5) p.posY = Math.min(100, Math.max(0, arrasto.posY + (dy / sobraY) * 100));
    atualizar(true);
  });
  const soltar = (): void => {
    arrasto = undefined;
  };
  previa.addEventListener('pointerup', soltar);
  previa.addEventListener('pointercancel', soltar);
  raiz.appendChild(corpo);
  desenharCampos();
  atualizar(true);
}
