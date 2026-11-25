// A CALCULADORA NA TELA (ideia da Luiza, 2026-11-25). Teclas e números
// grandes, que crescem com o A+ e vestem o tema; a conta inteira à vista; e a
// voz do app lendo a conta no «=» («12 mais 7 vezes 2 é igual a 26»).
// Mora no menu lateral, com item próprio (não é jogo).
// Etapa 1: sem microfone. O comando de voz fica para depois, e só onde a voz
// for reconhecida no próprio aparelho (nada da criança sai dele).

import { armazenamento } from '../armazenamento/armazenamento';
import { abasDaEstante, type AbasDaEstante } from '../telas/abasDaEstante';
import { barraTopo, el } from '../telas/comum';
import { dono } from '../telas/preferencias';
import { falar, pararFala } from '../tts';
import {
  CONTA_VAZIA,
  escreverConta,
  falarConta,
  falarTecla,
  teclaDoTeclado,
  teclar,
  type Conta,
  type Tecla,
} from './calculadora';

export interface NavCalculadora {
  perfis: () => void;
  /** volta para a estante */
  voltar: () => void;
  abas?: AbasDaEstante;
}

// as teclas, na ordem da grade (4 colunas); o «=» ocupa duas linhas e o 0 duas colunas
const TECLAS: Array<{ t: Tecla; rotulo: string; nome: string; classe?: string }> = [
  { t: 'limpar', rotulo: 'C', nome: 'Limpar tudo', classe: 'calc-acao' },
  { t: 'apagar', rotulo: '⌫', nome: 'Apagar um', classe: 'calc-acao' },
  { t: '÷', rotulo: '÷', nome: 'Dividido por', classe: 'calc-op' },
  { t: '×', rotulo: '×', nome: 'Vezes', classe: 'calc-op' },
  { t: '7', rotulo: '7', nome: '7' },
  { t: '8', rotulo: '8', nome: '8' },
  { t: '9', rotulo: '9', nome: '9' },
  { t: '−', rotulo: '−', nome: 'Menos', classe: 'calc-op' },
  { t: '4', rotulo: '4', nome: '4' },
  { t: '5', rotulo: '5', nome: '5' },
  { t: '6', rotulo: '6', nome: '6' },
  { t: '+', rotulo: '+', nome: 'Mais', classe: 'calc-op' },
  { t: '1', rotulo: '1', nome: '1' },
  { t: '2', rotulo: '2', nome: '2' },
  { t: '3', rotulo: '3', nome: '3' },
  { t: '=', rotulo: '=', nome: 'Igual', classe: 'calc-igual' },
  { t: '0', rotulo: '0', nome: '0', classe: 'calc-zero' },
  { t: ',', rotulo: ',', nome: 'Vírgula' },
];

const chaveLerTeclas = () => `${dono()}:calculadora:lerTeclas`;

// o ouvinte do teclado do computador (um só de cada vez)
let teclaAtual: (e: KeyboardEvent) => void = () => undefined;

export async function montarTelaCalculadora(raiz: HTMLElement, nav: NavCalculadora): Promise<void> {
  pararFala();
  window.scrollTo(0, 0);
  window.removeEventListener('keydown', teclaAtual);
  raiz.innerHTML = '';
  raiz.className = 'tela tela-calculadora';
  // lugar próprio, fora dos Jogos: as abas da estante à vista, nenhuma marcada
  raiz.appendChild(barraTopo({ titulo: '🧮 Calculadora', aoVoltar: nav.abas ? undefined : nav.voltar, aoTrocarPerfil: nav.perfis }));
  if (nav.abas) raiz.appendChild(abasDaEstante('calculadora', nav.abas));

  const corpo = el('main', 'calc-corpo');
  raiz.appendChild(corpo);

  let conta: Conta = CONTA_VAZIA;
  let lerTeclas = (await armazenamento.obter<boolean>(chaveLerTeclas())) ?? false;
  const antes: string[] = [];

  // --- o visor: a conta em cima, o resultado embaixo, grande ---
  const visor = el('div', 'calc-visor');
  const linhaConta = el('p', 'calc-conta');
  const linhaResultado = el('p', 'calc-resultado');
  linhaResultado.setAttribute('role', 'status');
  linhaResultado.setAttribute('aria-live', 'polite');
  visor.append(linhaConta, linhaResultado);
  corpo.appendChild(visor);

  const desenhar = () => {
    const escrita = escreverConta(conta);
    if (conta.erro) {
      linhaConta.textContent = escrita;
      linhaResultado.textContent = conta.erro;
      linhaResultado.classList.add('calc-aviso');
    } else if (conta.resultado !== undefined) {
      linhaConta.textContent = escrita;
      linhaResultado.textContent = `= ${conta.resultado}${conta.continua ? '…' : ''}`;
      linhaResultado.classList.remove('calc-aviso');
    } else {
      // enquanto digita, o número que está sendo escrito fica grande embaixo
      const fim = conta.pedacos[conta.pedacos.length - 1];
      linhaConta.textContent = escrita || ' ';
      linhaResultado.textContent = fim?.tipo === 'num' ? fim.texto : fim ? fim.op : '0';
      linhaResultado.classList.remove('calc-aviso');
    }
    desenharAntes();
  };

  const apertar = (t: Tecla) => {
    const nova = teclar(conta, t);
    const resolveu = t === '=' && nova !== conta && (nova.resultado !== undefined || nova.erro !== undefined);
    conta = nova;
    if (resolveu) {
      // o «=» sempre fala a conta inteira
      falar(falarConta(conta));
      antes.unshift(`${escreverConta(conta)} ${conta.erro ? '— não dá' : `= ${conta.resultado}${conta.continua ? '…' : ''}`}`);
      antes.splice(5);
    } else if (lerTeclas) {
      falar(falarTecla(t));
    }
    desenhar();
  };

  // --- as teclas ---
  const grade = el('div', 'calc-teclas');
  grade.setAttribute('role', 'group');
  grade.setAttribute('aria-label', 'Teclas da calculadora');
  for (const k of TECLAS) {
    const b = el('button', `calc-tecla ${k.classe ?? ''}`.trim(), k.rotulo);
    b.type = 'button';
    b.setAttribute('aria-label', k.nome);
    b.addEventListener('click', () => apertar(k.t));
    grade.appendChild(b);
  }
  corpo.appendChild(grade);

  // --- ouvir e o liga/desliga da voz em cada tecla ---
  const opcoes = el('div', 'calc-opcoes');
  const ouvir = el('button', 'botao-opcao', '🔊 Ouvir a conta');
  ouvir.type = 'button';
  ouvir.addEventListener('click', () => falar(falarConta(conta) || 'zero'));
  const marcar = el('label', 'calc-marcar');
  const caixa = el('input');
  caixa.type = 'checkbox';
  caixa.checked = lerTeclas;
  caixa.addEventListener('change', () => {
    lerTeclas = caixa.checked;
    void armazenamento.definir(chaveLerTeclas(), lerTeclas);
  });
  marcar.append(caixa, el('span', undefined, 'Ler cada tecla em voz alta'));
  opcoes.append(ouvir, marcar);
  corpo.appendChild(opcoes);

  // --- as contas de antes (só desta vez, não ficam guardadas) ---
  const caixaAntes = el('section', 'calc-antes');
  const tituloAntes = el('h2', 'calc-antes-titulo', 'Contas de antes');
  const listaAntes = el('ol', 'calc-antes-lista');
  caixaAntes.append(tituloAntes, listaAntes);
  corpo.appendChild(caixaAntes);
  function desenharAntes(): void {
    caixaAntes.hidden = antes.length === 0;
    listaAntes.innerHTML = '';
    for (const a of antes) listaAntes.appendChild(el('li', undefined, a));
  }

  // --- o teclado do computador também serve ---
  teclaAtual = (e: KeyboardEvent) => {
    if (!corpo.isConnected) return window.removeEventListener('keydown', teclaAtual);
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target instanceof HTMLInputElement && e.target.type !== 'checkbox') return;
    // Enter num botão focado já «clica» nele: não aperta o «=» de novo
    if (e.key === 'Enter' && e.target instanceof HTMLButtonElement) return;
    const t = teclaDoTeclado(e.key);
    if (!t) return;
    e.preventDefault();
    apertar(t);
  };
  window.addEventListener('keydown', teclaAtual);

  desenhar();
}
