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
import {
  NOMES_DAS_GRADES,
  NOMES_DAS_PAUTAS,
  TIPOS,
  fazerFolhas,
  lerPalavras,
  pedidoInicial,
  type Pedido,
  type Resultado,
  type TipoDeFolha,
} from './pedido';

// do aparelho, não do perfil (como as pranchas): é material de quem ensina
const CHAVE = 'folhas:pedidos';
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface Guardado {
  tipo: TipoDeFolha;
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
async function reduzirParaCalendario(arquivo: File): Promise<string | undefined> {
  if (!/^image\/(png|jpeg|webp)$/.test(arquivo.type)) return undefined;
  const url = URL.createObjectURL(arquivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const escala = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * escala));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * escala));
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
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
          resultado = fazerFolhas(pedido());
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
          figura.append(papel, el('figcaption', undefined, f.titulo));
          previa.appendChild(figura);
        }
        imprimir.disabled = !resultado.folhas.length;
        // a figura do calendário pode ser grande demais para guardar: sem ela
        const paraGuardar: Guardado = { tipo, pedidos: { ...pedidos } };
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
            p.imagem = f ? await reduzirParaCalendario(f) : undefined;
            desenharCampos();
            atualizar(true);
          });
          campos.appendChild(rotulado('Figura do alto', arquivo, 'Uma foto ou desenho do aparelho. Sem figura, fica a moldura para desenhar ou colar.'));
          if (p.imagem) {
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
  raiz.appendChild(corpo);
  desenharCampos();
  atualizar(true);
}
