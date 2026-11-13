// Anotações da criança — caderno livre, dentro do app.
//
// NASCEU DE UM PEDIDO CONCRETO: o Davi (9) aprendeu a escrever comandos no
// terminal do Minecraft e vinha guardando as linhas no editor do app-leitura,
// que é um app de adulto, para não esquecer. Perguntado se queria um aqui,
// quis.
//
// POR QUE NÃO PASSA PELO PARSER DO APP. O parser transforma linha começada em
// `#` em título e `{{img:id}}` em imagem. Comando de Minecraft e código são
// cheios de `#`, `{` e `}` — o texto dele sairia despedaçado. Anotação é texto
// CRU: guardada como foi escrita, mostrada como foi escrita.
//
// O QUE "AMIGÁVEL A CÓDIGO" QUER DIZER AQUI, e a primeira é a que mais importa:
//
//   1. Correção automática DESLIGADA. No celular o teclado maiúscula a primeira
//      letra e "conserta" palavra. No arquivo que o Davi escreveu no celular do
//      pai está `randomtickspeed` — no Minecraft é `randomTickSpeed`, e assim
//      o comando não roda. Não é incômodo: é o comando quebrado, sem aviso.
//   2. Espaço preservado, inclusive no fim da linha (o arquivo dele tem vários).
//   3. Tab escreve tabulação em vez de pular de campo. Isso cria uma armadilha
//      de teclado, proibida sem saída — então Esc sai, e a tela DIZ isso.
//   4. Linha comprida: quebrar na tela ou rolar para o lado, à escolha. Comando
//      de Minecraft passa fácil de duzentos caracteres.
//
// E um botão de copiar, que é o ponto todo: ele escreve aqui para colar lá.
//
// DESDE 2026-11-12, AS MESMAS AÇÕES DO PEDRA ANGULAR ("Meus arquivos"):
// pesquisar, Novo, Adicionar (.md e .txt, inclusive livros inteiros),
// Exportar e Importar — no MESMO .json do Pedra Angular, para os textos
// irem e voltarem entre os dois apps (ver ../conteudo/textosProprios.ts).
// Um .md trazido de fora abre como LIVRO (com voz, régua, espaço entre
// linhas…); anotação escrita aqui e .txt continuam abrindo no editor cru.

import { entregarArquivo } from '../armazenamento/copiaNoAparelho';
import { apagarTexto, guardarTexto, guardarVarios, listarTextos } from '../armazenamento/textos';
import {
  combina,
  deArquivo,
  idNovo,
  juntar,
  lerJsonDeTextos,
  nomeDoArquivoDeTextos,
  nomeParaMostrar,
  paraPedraAngular,
  type TextoProprio,
} from '../conteudo/textosProprios';
import { PILHAS_DE_FONTE } from '../fontes';
import { perfilAtivo } from '../perfis/perfis';
import { barraTopo, el } from './comum';

const FONTES_OFERECIDAS = [
  { id: 'codigo', rotulo: '⌨️ Atkinson' },
  { id: 'padrao', rotulo: '✏️ Cardo' },
  { id: 'hyperlegible', rotulo: '👓 Bem legível' },
  { id: 'dyslexic', rotulo: '🔤 OpenDyslexic' },
];

export interface NavAnotacoes {
  perfis: () => void;
  aparencia: () => void;
  estante: () => void;
  /** abre um texto .md como livro (com voz, régua, espaço entre linhas) */
  ler: (texto: TextoProprio) => void;
}

const perfil = () => perfilAtivo().id;

function agora(): string {
  return new Date().toLocaleDateString('pt-BR');
}

const EMOJI_DO_TIPO: Record<TextoProprio['tipo'], string> = { nota: '📝', md: '📖', txt: '📄' };

/** O que um toque no texto faz: livro abre para ler; o resto, no editor. */
export function abrirTexto(raiz: HTMLElement, nav: NavAnotacoes, texto: TextoProprio): void {
  if (texto.tipo === 'md') nav.ler(texto);
  else abrirEditor(raiz, nav, texto);
}

function novaAnotacao(): TextoProprio {
  const t = Date.now();
  return {
    id: idNovo(t, 'nota'),
    titulo: '',
    autor: '',
    tipo: 'nota',
    conteudo: '',
    fonte: 'codigo',
    quebrar: true,
    criadoEm: t,
    alteradoEm: t,
  };
}

export async function montarTelaAnotacoes(
  raiz: HTMLElement,
  nav: NavAnotacoes,
  aviso = '',
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-anotacoes';
  raiz.appendChild(
    barraTopo({
      titulo: '📝 Minhas anotações',
      aoVoltar: nav.estante,
      aoTrocarPerfil: nav.perfis,
      aoAparencia: nav.aparencia,
    }),
  );

  const corpo = el('div', 'corpo-anotacoes');
  raiz.appendChild(corpo);
  const recarregar = (msg = '') => montarTelaAnotacoes(raiz, nav, msg);
  const lista = await listarTextos(perfil());

  // ---- pesquisar ----
  const busca = el('input', 'campo-busca') as HTMLInputElement;
  busca.type = 'search';
  busca.placeholder = 'Pesquisar texto, autor…';
  busca.setAttribute('aria-label', 'Pesquisar nas anotações');

  // ---- as quatro ações, como no Pedra Angular ----
  const acoes = el('div', 'acoes-anotacoes');
  const novo = el('button', 'botao-opcao', '✨ Novo');
  novo.setAttribute('aria-label', 'Novo: escrever uma anotação nova');
  novo.addEventListener('click', () => abrirEditor(raiz, nav, novaAnotacao()));

  const campoArquivos = el('input') as HTMLInputElement;
  campoArquivos.type = 'file';
  campoArquivos.accept = '.md,.markdown,.txt,text/markdown,text/plain';
  campoArquivos.multiple = true;
  campoArquivos.hidden = true;
  const adicionar = el('button', 'botao-opcao', '➕ Adicionar');
  adicionar.setAttribute('aria-label', 'Adicionar: arquivos .md ou .txt, até livros inteiros');
  adicionar.addEventListener('click', () => campoArquivos.click());
  campoArquivos.addEventListener('change', async () => {
    // a lista de arquivos é "viva": copiar ANTES de limpar o campo
    const arquivos = Array.from(campoArquivos.files ?? []);
    campoArquivos.value = '';
    const chegando: TextoProprio[] = [];
    let recusados = 0;
    for (const arquivo of arquivos) {
      const t = deArquivo(arquivo.name, await arquivo.text(), Date.now());
      if (t) chegando.push(t);
      else recusados++;
    }
    const { novos } = juntar(lista, chegando, Date.now());
    await guardarVarios(perfil(), novos);
    const partes = [`${novos.length} ${novos.length === 1 ? 'texto entrou' : 'textos entraram'}.`];
    if (recusados) partes.push(`${recusados} não ${recusados === 1 ? 'é' : 'são'} .md nem .txt e ficou de fora.`);
    await recarregar(partes.join(' '));
  });

  const exportar = el('button', 'botao-opcao', '⇩ Exportar');
  exportar.setAttribute('aria-label', 'Exportar: as anotações num .json que o Pedra Angular também lê');
  exportar.disabled = lista.length === 0;
  exportar.addEventListener('click', async () => {
    const quando = new Date();
    const json = JSON.stringify(paraPedraAngular(lista, quando), null, 2);
    await entregarArquivo(new File([json], nomeDoArquivoDeTextos(quando), { type: 'application/json' }));
    mostrarAviso(`${lista.length} ${lista.length === 1 ? 'texto foi' : 'textos foram'} para o arquivo. O Pedra Angular abre este arquivo em Importar.`);
  });

  const campoJson = el('input') as HTMLInputElement;
  campoJson.type = 'file';
  campoJson.accept = '.json,application/json';
  campoJson.hidden = true;
  const importar = el('button', 'botao-opcao', '⇧ Importar');
  importar.setAttribute('aria-label', 'Importar: textos de um .json do Pedra Angular ou do Historinhas');
  importar.addEventListener('click', () => campoJson.click());
  campoJson.addEventListener('change', async () => {
    const arquivo = campoJson.files?.[0];
    campoJson.value = '';
    if (!arquivo) return;
    const lida = lerJsonDeTextos(await arquivo.text(), Date.now());
    if (!lida.ok) {
      mostrarAviso(`⚠ ${lida.motivo}`);
      return;
    }
    const { novos, iguais } = juntar(lista, lida.textos, Date.now());
    await guardarVarios(perfil(), novos);
    const partes = [`${novos.length} ${novos.length === 1 ? 'texto entrou' : 'textos entraram'}.`];
    if (iguais) partes.push(`${iguais} já ${iguais === 1 ? 'estava' : 'estavam'} aqui.`);
    if (lida.doPedraAngular) partes.push('Do Pedra Angular vêm só os textos: tema e letra de lá não mudam nada aqui.');
    await recarregar(partes.join(' '));
  });

  acoes.append(novo, adicionar, exportar, importar, campoArquivos, campoJson);
  corpo.append(busca, acoes);

  const caixaAviso = el('p', 'aviso-anotacoes');
  caixaAviso.setAttribute('role', 'status');
  corpo.appendChild(caixaAviso);
  function mostrarAviso(texto: string): void {
    caixaAviso.textContent = texto;
  }
  if (aviso) mostrarAviso(aviso);

  if (lista.length === 0) {
    corpo.appendChild(
      el(
        'p',
        'texto-vazio',
        'Aqui você guarda o que quiser: comandos, ideias, listas, histórias — e até livros inteiros, ' +
          'trazidos em .md ou .txt. Fica só neste aparelho, e é seu.',
      ),
    );
    return;
  }

  const listaEl = el('div', 'lista-anotacoes');
  const nada = el('p', 'texto-vazio', 'Nenhum texto com essas palavras.');
  nada.hidden = true;
  const cartoes: Array<[HTMLElement, TextoProprio]> = [];
  for (const texto of lista) {
    const cartao = el('button', 'cartao-anotacao');
    const emoji = el('span', 'emoji-anotacao', EMOJI_DO_TIPO[texto.tipo]);
    emoji.setAttribute('aria-hidden', 'true');
    cartao.appendChild(emoji);
    const textos = el('span', 'textos-anotacao');
    textos.appendChild(el('span', 'nome-anotacao', nomeParaMostrar(texto)));
    const linhas = texto.conteudo.split('\n').filter((l) => l.trim()).length;
    const meta = [
      texto.autor,
      texto.tipo === 'md' ? 'livro para ler' : `${linhas} linha${linhas === 1 ? '' : 's'}`,
    ].filter(Boolean);
    textos.appendChild(el('span', 'meta-anotacao', meta.join(' · ')));
    cartao.appendChild(textos);
    cartao.addEventListener('click', () => abrirTexto(raiz, nav, texto));
    listaEl.appendChild(cartao);
    cartoes.push([cartao, texto]);
  }
  corpo.append(listaEl, nada);

  busca.addEventListener('input', () => {
    let visiveis = 0;
    for (const [cartao, t] of cartoes) {
      const sim = combina(busca.value, nomeParaMostrar(t), t.autor, t.origem);
      cartao.hidden = !sim;
      if (sim) visiveis++;
    }
    nada.hidden = visiveis > 0;
  });

  const apagar = el('button', 'botao-extra', '🗑️ Apagar uma anotação');
  apagar.addEventListener('click', () => {
    apagar.replaceWith(montarApagar(lista, () => void recarregar()));
  });
  corpo.appendChild(apagar);
}

function montarApagar(lista: TextoProprio[], recarregar: () => void): HTMLElement {
  const caixa = el('div', 'caixa-apagar');
  caixa.appendChild(el('p', 'aviso-apagar', 'Toque na que você quer apagar:'));
  for (const nota of lista) {
    // Dois toques, sem diálogo que trava a tela: o primeiro arma, o segundo
    // apaga, e sozinho ele desarma em 4 segundos. Mesmo padrão dos perfis.
    const b = el('button', 'botao-extra botao-perigo', `🗑️ ${nomeParaMostrar(nota)}`);
    let armado = false;
    b.addEventListener('click', async () => {
      if (!armado) {
        armado = true;
        b.textContent = 'Apagar mesmo?';
        setTimeout(() => {
          armado = false;
          b.textContent = `🗑️ ${nomeParaMostrar(nota)}`;
        }, 4000);
        return;
      }
      await apagarTexto(perfil(), nota.id);
      recarregar();
    });
    caixa.appendChild(b);
  }
  return caixa;
}

export function abrirEditor(raiz: HTMLElement, nav: NavAnotacoes, nota: TextoProprio): void {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-anotacoes';

  const voltar = () => void montarTelaAnotacoes(raiz, nav);
  raiz.appendChild(
    barraTopo({
      titulo: '📝 Escrevendo',
      aoVoltar: voltar,
      aoTrocarPerfil: nav.perfis,
      aoAparencia: nav.aparencia,
    }),
  );

  const corpo = el('div', 'corpo-anotacoes');
  raiz.appendChild(corpo);

  const nome = el('input', 'campo-nome-anotacao') as HTMLInputElement;
  nome.placeholder = 'Nome (opcional)';
  nome.maxLength = 60;
  nome.value = nota.titulo;
  nome.setAttribute('aria-label', 'Nome da anotação');
  corpo.appendChild(nome);

  const area = el('textarea', 'area-anotacao') as HTMLTextAreaElement;
  area.value = nota.conteudo;
  area.setAttribute('aria-label', 'Texto');
  area.rows = 14;
  area.placeholder = 'Escreva aqui…';
  /* O bloco que faz o texto sobreviver ao teclado do celular. Sem estes
     quatro, o aparelho maiúscula, corrige e completa — e um comando corrigido
     é um comando quebrado. */
  area.spellcheck = false;
  area.setAttribute('autocorrect', 'off');
  area.setAttribute('autocapitalize', 'off');
  area.setAttribute('autocomplete', 'off');
  corpo.appendChild(area);

  const aplicarAparencia = () => {
    area.style.fontFamily = PILHAS_DE_FONTE[nota.fonte] ?? PILHAS_DE_FONTE.codigo;
    // `off` = uma linha comprida rola para o lado, sem quebrar
    area.wrap = nota.quebrar ? 'soft' : 'off';
    area.style.whiteSpace = nota.quebrar ? 'pre-wrap' : 'pre';
  };
  aplicarAparencia();

  /* Tab escreve tabulação — sem isso, indentar é impossível e o foco escapa
     do campo no meio da escrita. Cria uma armadilha de teclado, então Esc sai,
     e a dica abaixo do campo diz isso em voz alta. */
  area.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const i = area.selectionStart;
      const f = area.selectionEnd;
      area.value = area.value.slice(0, i) + '\t' + area.value.slice(f);
      area.selectionStart = area.selectionEnd = i + 1;
    } else if (e.key === 'Escape') {
      area.blur();
    }
  });

  corpo.appendChild(
    el('p', 'dica-anotacao', 'Tab escreve espaço de código. Esc sai do campo.'),
  );

  // ---- aparência da anotação, escolha da criança ----
  const linhaFonte = el('div', 'linha-opcoes');
  for (const f of FONTES_OFERECIDAS) {
    const b = el('button', 'botao-opcao', f.rotulo);
    if (nota.fonte === f.id) b.classList.add('ativa');
    b.addEventListener('click', () => {
      nota.fonte = f.id;
      linhaFonte.querySelectorAll('.botao-opcao').forEach((x) => x.classList.remove('ativa'));
      b.classList.add('ativa');
      aplicarAparencia();
    });
    linhaFonte.appendChild(b);
  }
  corpo.appendChild(linhaFonte);

  const quebra = el('button', 'botao-extra', '');
  const rotularQuebra = () => {
    quebra.textContent = nota.quebrar ? '↩️ Linha comprida: quebrando' : '➡️ Linha comprida: rolando';
  };
  rotularQuebra();
  quebra.addEventListener('click', () => {
    nota.quebrar = !nota.quebrar;
    rotularQuebra();
    aplicarAparencia();
  });
  corpo.appendChild(quebra);

  // ---- ações ----
  const acoes = el('div', 'botoes-imagem');

  const copiar = el('button', 'botao-grande', '📋 Copiar tudo');
  copiar.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(area.value);
      copiar.textContent = '✅ Copiado!';
    } catch {
      // Sem permissão de área de transferência: seleciona, para copiar à mão
      area.select();
      copiar.textContent = '👆 Selecionado — copie';
    }
    setTimeout(() => (copiar.textContent = '📋 Copiar tudo'), 2000);
  });

  const salvar = el('button', 'botao-grande', '💾 Guardar');
  salvar.addEventListener('click', async () => {
    const atualizada: TextoProprio = {
      ...nota,
      titulo: nome.value.trim(),
      conteudo: area.value,
      alteradoEm: Date.now(),
    };
    await guardarTexto(perfil(), atualizada);
    salvar.textContent = `✅ Guardado ${agora()}`;
    // livro volta para a leitura; anotação volta para a lista
    setTimeout(() => (atualizada.tipo === 'md' ? nav.ler(atualizada) : voltar()), 700);
  });

  acoes.append(copiar, salvar);
  corpo.appendChild(acoes);
  area.focus();
}
