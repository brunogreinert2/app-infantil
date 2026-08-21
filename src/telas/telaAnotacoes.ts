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

import { armazenamento } from '../armazenamento/armazenamento';
import { PILHAS_DE_FONTE } from '../fontes';
import { perfilAtivo } from '../perfis/perfis';
import { barraTopo, el } from './comum';

export interface Anotacao {
  id: number;
  titulo: string;
  texto: string;
  /** Chave de PILHAS_DE_FONTE — escolha da criança, por anotação. */
  fonte: string;
  /** Linha comprida quebra na tela (true) ou rola para o lado (false). */
  quebrar: boolean;
  alteradoEm: number;
}

const FONTES_OFERECIDAS = [
  { id: 'codigo', rotulo: '⌨️ Código' },
  { id: 'padrao', rotulo: '✏️ Normal' },
  { id: 'hyperlegible', rotulo: '👓 Bem legível' },
  { id: 'dyslexic', rotulo: '🔤 OpenDyslexic' },
];

const chaveDoPerfil = () => `${perfilAtivo().id}:notas`;

async function listar(): Promise<Anotacao[]> {
  return (await armazenamento.obter<Anotacao[]>(chaveDoPerfil())) ?? [];
}

async function guardar(lista: Anotacao[]): Promise<void> {
  await armazenamento.definir(chaveDoPerfil(), lista);
}

function agora(): string {
  return new Date().toLocaleDateString('pt-BR');
}

/** Primeira linha com conteúdo vira o nome, se a criança não deu um. */
function tituloAutomatico(texto: string): string {
  const linha = texto.split('\n').find((l) => l.trim());
  return linha ? linha.trim().slice(0, 40) : 'Sem nome';
}

export async function montarTelaAnotacoes(
  raiz: HTMLElement,
  nav: { perfis: () => void; aparencia: () => void; estante: () => void },
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

  const recarregar = () => montarTelaAnotacoes(raiz, nav);

  const nova = el('button', 'botao-grande', '✨ Escrever uma nova');
  nova.addEventListener('click', () =>
    abrirEditor(raiz, nav, {
      id: Date.now(),
      titulo: '',
      texto: '',
      fonte: 'codigo',
      quebrar: true,
      alteradoEm: Date.now(),
    }),
  );
  corpo.appendChild(nova);

  const lista = await listar();
  if (lista.length === 0) {
    corpo.appendChild(
      el(
        'p',
        'texto-vazio',
        'Aqui você guarda o que quiser: comandos, ideias, listas, histórias. ' +
          'Fica só neste aparelho, e é seu.',
      ),
    );
    return;
  }

  for (const nota of [...lista].sort((a, b) => b.alteradoEm - a.alteradoEm)) {
    const cartao = el('button', 'cartao-anotacao');
    cartao.appendChild(el('span', 'nome-anotacao', nota.titulo || tituloAutomatico(nota.texto)));
    const linhas = nota.texto.split('\n').filter((l) => l.trim()).length;
    cartao.appendChild(
      el('span', 'meta-anotacao', `${linhas} linha${linhas === 1 ? '' : 's'}`),
    );
    cartao.addEventListener('click', () => abrirEditor(raiz, nav, nota));
    corpo.appendChild(cartao);
  }

  const apagar = el('button', 'botao-extra', '🗑️ Apagar uma anotação');
  apagar.addEventListener('click', () => {
    apagar.replaceWith(montarApagar(lista, recarregar));
  });
  corpo.appendChild(apagar);
}

function montarApagar(lista: Anotacao[], recarregar: () => void): HTMLElement {
  const caixa = el('div', 'caixa-apagar');
  caixa.appendChild(el('p', 'aviso-apagar', 'Toque na que você quer apagar:'));
  for (const nota of lista) {
    // Dois toques, sem diálogo que trava a tela: o primeiro arma, o segundo
    // apaga, e sozinho ele desarma em 4 segundos. Mesmo padrão dos perfis.
    const b = el('button', 'botao-extra botao-perigo', `🗑️ ${nota.titulo || tituloAutomatico(nota.texto)}`);
    let armado = false;
    b.addEventListener('click', async () => {
      if (!armado) {
        armado = true;
        b.textContent = 'Apagar mesmo?';
        setTimeout(() => {
          armado = false;
          b.textContent = `🗑️ ${nota.titulo || tituloAutomatico(nota.texto)}`;
        }, 4000);
        return;
      }
      await guardar((await listar()).filter((n) => n.id !== nota.id));
      recarregar();
    });
    caixa.appendChild(b);
  }
  return caixa;
}

function abrirEditor(
  raiz: HTMLElement,
  nav: { perfis: () => void; aparencia: () => void; estante: () => void },
  nota: Anotacao,
): void {
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
  corpo.appendChild(nome);

  const area = el('textarea', 'area-anotacao') as HTMLTextAreaElement;
  area.value = nota.texto;
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
    const lista = await listar();
    const atualizada: Anotacao = {
      ...nota,
      titulo: nome.value.trim(),
      texto: area.value,
      alteradoEm: Date.now(),
    };
    const i = lista.findIndex((n) => n.id === nota.id);
    if (i >= 0) lista[i] = atualizada;
    else lista.push(atualizada);
    await guardar(lista);
    salvar.textContent = `✅ Guardado ${agora()}`;
    setTimeout(voltar, 700);
  });

  acoes.append(copiar, salvar);
  corpo.appendChild(acoes);
  area.focus();
}
