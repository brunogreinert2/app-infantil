// JOGOS — a tela da CRIANÇA (barra lateral → 🎮 Jogos), pedido do Bruno em
// 2026-11-19. A oficina de quem ensina fica atrás da trava; aqui não há
// formulário nenhum: escolhe o tema e joga.
//
// Os temas são os das cruzadinhas prontas (cruzadinhasProntas.ts) — a mesma
// lista serve a cruzadinha e o caça-palavras. «Outro» passa para o tema
// seguinte, em ordem; o ✓ marca o tema já terminado (recompensa previsível,
// nunca sorteada). O progresso é de CADA CRIANÇA: a cruzadinha do Davi não
// aparece começada para o Theo.

import { armazenamento } from '../armazenamento/armazenamento';
import { perfilAtivo } from '../perfis/perfis';
import { barraTopo, el } from '../telas/comum';
import { CRUZADINHAS_PRONTAS, proximaPronta, type CruzadinhaPronta } from './cruzadinhasProntas';
import {
  JOGOS_DA_CRIANCA,
  NOMES_DO_NIVEL,
  chaveDoJogo,
  jogoDoTema,
  terminado,
  type JogoDaCrianca,
  type NivelDoCaca,
} from './jogosDaCrianca';
import { montarTelaJogo } from './telaJogo';

export type { JogoDaCrianca } from './jogosDaCrianca';

export async function montarTelaJogos(
  raiz: HTMLElement,
  tipo: JogoDaCrianca,
  nav: { perfis: () => void; estante: () => void },
): Promise<void> {
  const perfil = perfilAtivo();
  const chaveNivel = `${perfil.id}:jogos:nivelDoCaca`;
  // quem tem 9 ou mais começa no mais difícil; dá para trocar, e fica lembrado
  let nivel: NivelDoCaca =
    (await armazenamento.obter<NivelDoCaca>(chaveNivel)) ?? (/^(9|1\d)/.test(perfil.faixaEtaria) ? 'medio' : 'facil');
  const { nome, emoji } = JOGOS_DA_CRIANCA[tipo];

  const voltarAqui = () => void montarTelaJogos(raiz, tipo, nav);
  const abrir = (pronta: CruzadinhaPronta): void => {
    const alvo = jogoDoTema(tipo, pronta, nivel);
    void montarTelaJogo(raiz, alvo, chaveDoJogo(perfil.id, tipo, pronta.id, nivel), {
      voltar: voltarAqui,
      outra: () => abrir(proximaPronta(pronta.id)),
    });
  };

  raiz.innerHTML = '';
  raiz.className = 'tela tela-jogos';
  window.scrollTo(0, 0);
  raiz.appendChild(barraTopo({ titulo: `${emoji} ${nome}`, aoVoltar: nav.estante, aoTrocarPerfil: nav.perfis }));
  const corpo = el('main', 'jogos-corpo');
  raiz.appendChild(corpo);

  if (tipo === 'caca') {
    const niveis = el('div', 'jogos-niveis');
    niveis.setAttribute('role', 'group');
    niveis.setAttribute('aria-label', 'Tamanho do desafio');
    for (const n of Object.keys(NOMES_DO_NIVEL) as NivelDoCaca[]) {
      const b = el('button', 'botao-opcao', NOMES_DO_NIVEL[n]);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(n === nivel));
      b.classList.toggle('ativa', n === nivel);
      b.addEventListener('click', () => {
        nivel = n;
        void armazenamento.definir(chaveNivel, n).then(voltarAqui);
      });
      niveis.appendChild(b);
    }
    corpo.appendChild(niveis);
  }

  corpo.appendChild(el('p', 'jogos-instrucao', 'Escolha um tema.'));
  const temas = el('ul', 'jogos-temas');
  for (const pronta of CRUZADINHAS_PRONTAS) {
    const li = el('li');
    const b = el('button', 'jogos-tema');
    b.type = 'button';
    const marca = el('span', 'jogos-tema-emoji', pronta.emoji);
    marca.setAttribute('aria-hidden', 'true');
    b.append(marca, el('span', 'jogos-tema-nome', pronta.tema));
    const guardado = await armazenamento.obter<unknown>(chaveDoJogo(perfil.id, tipo, pronta.id, nivel));
    if (terminado(jogoDoTema(tipo, pronta, nivel), guardado)) {
      const feito = el('span', 'jogos-tema-feito', '✓');
      feito.setAttribute('aria-label', 'já terminado');
      b.appendChild(feito);
    }
    b.addEventListener('click', () => abrir(pronta));
    li.appendChild(b);
    temas.appendChild(li);
  }
  corpo.appendChild(temas);
}
