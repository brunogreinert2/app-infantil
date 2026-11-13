// Títulos que abrem e recolhem o que vem embaixo, como no Pedra Angular: TODO
// nível (#, ##, ###…), um dentro do outro. Recolher um `#` esconde também os
// `##` e `###` que moram nele.
//
// Serve à leitura (um livro com quarenta folhas de números vira um sumário
// que se abre) e ao guia de quem ensina (que começa todo fechado: a lista de
// títulos É o sumário, e não é preciso rolar a página para voltar a ela).
//
// Trabalha sobre o que a tela já montou: num recipiente, acha os títulos do
// nível mais alto que há ali, junta em cada um tudo o que vem até o próximo
// título do mesmo nível (ou de nível maior), transforma o título num botão —
// e repete dentro de cada seção, para os níveis de baixo. No fim de cada
// seção aberta vai um botão de recolher: quem leu até o fim não precisa subir.
//
// Até 2026-11-12 só o `##` recolhia; o Bruno abriu o mesmo .md nos dois apps e
// no Pedra Angular todos os níveis recolhiam.
//
// Acessibilidade: é o padrão "disclosure" — um <button aria-expanded> dentro
// do próprio título; o conteúdo recolhido fica `hidden` (some também para o
// leitor de tela e para o Tab). Sem animação.

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

let contador = 0;

function secionar(recipiente: HTMLElement, opcoes: OpcoesDeSecao): number {
  const filhos = [...recipiente.children];
  const niveis = filhos.map((f) => Number(tituloDe(f)?.dataset.nivel ?? 0)).filter((n) => n > 0);
  if (!niveis.length) return 0;
  const nivel = Math.min(...niveis);
  let criadas = 0;

  for (let i = 0; i < filhos.length; i++) {
    const titulo = tituloDe(filhos[i]);
    if (!titulo || Number(titulo.dataset.nivel) !== nivel) continue;

    // tudo o que pertence a este título
    const dentro: Element[] = [];
    for (let j = i + 1; j < filhos.length; j++) {
      const outro = tituloDe(filhos[j]);
      if (outro && Number(outro.dataset.nivel) <= nivel) break;
      if (filhos[j].matches(FORA)) break;
      dentro.push(filhos[j]);
    }
    if (dentro.length === 0) continue;

    criadas++;
    const nome = titulo.textContent ?? '';
    const corpo = document.createElement('div');
    corpo.className = 'secao-corpo';
    corpo.dataset.nivel = String(nivel);
    corpo.id = `secao-${++contador}`;
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

    // primeiro as seções de dentro; o botão de recolher fica depois delas
    criadas += secionar(corpo, opcoes);

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

/**
 * Torna recolhíveis todos os títulos de `artigo`, em todos os níveis.
 * Devolve quantas seções criou.
 */
export function tornarRecolhivel(artigo: HTMLElement, opcoes: OpcoesDeSecao): number {
  return secionar(artigo, opcoes);
}

/**
 * Abre as seções (e as de fora delas) que contêm `alvo` — para o "você parou
 * aqui" e a voz não caírem numa seção fechada.
 */
export function abrirSecaoDe(alvo: Element): void {
  for (let corpo = alvo.closest<HTMLElement>('.secao-corpo'); corpo; corpo = corpo.parentElement?.closest<HTMLElement>('.secao-corpo') ?? null) {
    if (!corpo.hidden) continue;
    corpo.previousElementSibling?.querySelector<HTMLElement>('.botao-secao')?.click();
  }
}
