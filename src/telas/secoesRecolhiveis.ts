// Títulos `##` que abrem e recolhem o que vem embaixo, como no Pedra Angular.
//
// Serve à leitura (um livro com quarenta folhas de números vira um sumário
// que se abre) e ao guia de quem ensina (que começa todo fechado: a lista de
// títulos É o sumário, e não é preciso rolar a página para voltar a ela).
//
// Trabalha sobre o que a tela já montou: acha cada título de nível 2, junta
// num bloco tudo o que vem até o próximo título do mesmo nível (ou de nível
// maior), e transforma o título num botão. No fim do bloco aberto vai outro
// botão de recolher — quem leu a seção até o fim não precisa subir de volta.
//
// Acessibilidade: é o padrão "disclosure" — um <button aria-expanded> dentro
// do próprio título; o conteúdo recolhido fica `hidden` (some também para o
// leitor de tela e para o Tab). Sem animação.

const NIVEL = 2;

// o título pode estar solto ou dentro de um bloco (título + 🔊 do capítulo)
function tituloDe(e: Element): HTMLElement | null {
  if (e instanceof HTMLElement && e.dataset.nivel) return e;
  return e.querySelector<HTMLElement>(':scope > [data-nivel]');
}

/** O que nunca entra numa seção: o fecho do livro (perguntas finais, rodapé). */
const FORA = '.titulo-fim, .rodape-livro';

export interface OpcoesDeSecao {
  /** as seções começam fechadas? (o guia, sim; os livros, não) */
  fechadas: boolean;
}

/**
 * Torna recolhíveis os títulos de nível 2 que são filhos diretos de `artigo`.
 * Devolve quantas seções criou.
 */
export function tornarRecolhivel(artigo: HTMLElement, opcoes: OpcoesDeSecao): number {
  const filhos = [...artigo.children];
  let criadas = 0;

  for (let i = 0; i < filhos.length; i++) {
    const titulo = tituloDe(filhos[i]);
    if (!titulo || Number(titulo.dataset.nivel) !== NIVEL) continue;

    // tudo o que pertence a este título
    const dentro: Element[] = [];
    for (let j = i + 1; j < filhos.length; j++) {
      const outro = tituloDe(filhos[j]);
      if (outro && Number(outro.dataset.nivel) <= NIVEL) break;
      if (filhos[j].matches(FORA)) break;
      dentro.push(filhos[j]);
    }
    if (dentro.length === 0) continue;

    criadas++;
    const nome = titulo.textContent ?? '';
    const corpo = document.createElement('div');
    corpo.className = 'secao-corpo';
    corpo.id = `secao-${criadas}-${titulo.id || 'sem-id'}`;
    filhos[i].after(corpo);
    corpo.append(...dentro);

    // o título vira botão (o texto continua sendo o do título)
    const botao = document.createElement('button');
    botao.className = 'botao-secao';
    botao.setAttribute('aria-controls', corpo.id);
    const seta = document.createElement('span');
    seta.className = 'seta-secao';
    seta.setAttribute('aria-hidden', 'true');
    const rotulo = document.createElement('span');
    rotulo.textContent = nome;
    botao.append(seta, rotulo);
    titulo.textContent = '';
    titulo.appendChild(botao);

    const recolher = document.createElement('button');
    recolher.className = 'botao-recolher';
    recolher.textContent = '▴ Recolher';
    recolher.setAttribute('aria-label', `Recolher: ${nome}`);
    corpo.appendChild(recolher);

    const definir = (aberta: boolean) => {
      corpo.hidden = !aberta;
      botao.setAttribute('aria-expanded', String(aberta));
      // ▸ fechada, ▾ aberta: a seta diz o estado sem depender de cor
      seta.textContent = aberta ? '▾' : '▸';
    };
    botao.addEventListener('click', () => definir(corpo.hidden));
    recolher.addEventListener('click', () => {
      definir(false);
      // o título volta à vista e fica com o foco: é dali que se segue
      const topo = filhos[i].getBoundingClientRect().top;
      if (topo < 90) window.scrollBy({ top: topo - 100, behavior: 'instant' });
      botao.focus();
    });
    definir(!opcoes.fechadas);
  }
  return criadas;
}

/** Abre a seção que contém `alvo` (para o "você parou aqui" não cair numa seção fechada). */
export function abrirSecaoDe(alvo: Element): void {
  const corpo = alvo.closest<HTMLElement>('.secao-corpo');
  if (!corpo || !corpo.hidden) return;
  const botao = corpo.previousElementSibling?.querySelector<HTMLElement>('.botao-secao');
  botao?.click();
}
