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
import { contaFalada } from './contaFalada';
import {
  CONTA_VAZIA,
  resolver,
  type Pedaco,
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

  // a conta acabou de ser resolvida (pelo «=» ou pela voz): fala e guarda
  const resolvida = () => {
    falar(falarConta(conta));
    antes.unshift(`${escreverConta(conta)} ${conta.erro ? '— não dá' : `= ${conta.resultado}${conta.continua ? '…' : ''}`}`);
    antes.splice(5);
  };

  const apertar = (t: Tecla) => {
    const nova = teclar(conta, t);
    const resolveu = t === '=' && nova !== conta && (nova.resultado !== undefined || nova.erro !== undefined);
    conta = nova;
    if (resolveu) resolvida();
    else if (lerTeclas) {
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

  // --- 🎤 falar a conta (etapa 2): só onde a voz é entendida NO APARELHO ---
  void montarMicrofone(opcoes, corpo, (pedacos) => {
    conta = { pedacos, ...resolver(pedacos) };
    resolvida();
    desenhar();
  });

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

// ---------------------------------------------------------------------------
// 🎤 A VOZ (calculadora, etapa 2, 2026-11-25). Regra da casa: nada da criança
// sai do aparelho. Por isso só usamos o reconhecimento de voz LOCAL
// (`SpeechRecognition.available/install` com `processLocally`, Chrome e Edge
// 139+). Onde ele não existe (Safari, Firefox, navegador antigo), o botão não
// aparece — nunca caímos no reconhecimento pela internet.
// ---------------------------------------------------------------------------

type EstadoDaVoz = 'pronta' | 'baixar' | 'baixando' | 'nao';
type Reconhecedor = {
  lang: string;
  processLocally: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type ClasseDoReconhecedor = {
  new (): Reconhecedor;
  available?: (o: { langs: string[]; processLocally: boolean }) => Promise<string>;
  install?: (o: { langs: string[] }) => Promise<boolean>;
};

const IDIOMA = 'pt-BR';

function classeDoReconhecedor(): ClasseDoReconhecedor | undefined {
  // só o nome padrão: o webkitSpeechRecognition antigo não sabe ficar no aparelho
  return (window as unknown as { SpeechRecognition?: ClasseDoReconhecedor }).SpeechRecognition;
}

async function estadoDaVoz(): Promise<EstadoDaVoz> {
  const SR = classeDoReconhecedor();
  if (!SR || typeof SR.available !== 'function') return 'nao';
  try {
    const s = await SR.available({ langs: [IDIOMA], processLocally: true });
    return s === 'available' ? 'pronta' : s === 'downloadable' ? 'baixar' : s === 'downloading' ? 'baixando' : 'nao';
  } catch {
    return 'nao';
  }
}

const MOTIVOS: Record<string, string> = {
  'not-allowed': 'O microfone não foi liberado. Dá para liberar nas configurações do navegador.',
  'service-not-allowed': 'O microfone não foi liberado. Dá para liberar nas configurações do navegador.',
  'no-speech': 'Não ouvi nada. Toque no microfone e fale de novo.',
  'audio-capture': 'Não achei um microfone neste aparelho.',
  aborted: '',
};

async function montarMicrofone(lugar: HTMLElement, corpo: HTMLElement, aoEntender: (p: Pedaco[]) => void): Promise<void> {
  const estado = await estadoDaVoz();
  if (!corpo.isConnected) return;
  const ouvi = el('p', 'calc-ouvi');
  ouvi.setAttribute('role', 'status');

  if (estado === 'nao') {
    // diz por que não tem, sem prometer nada
    lugar.after(
      el('p', 'calc-nota', '🎤 Falar a conta: este navegador ainda não entende a voz aqui mesmo, no aparelho. Por cuidado, a voz não vai para a internet.'),
    );
    return;
  }

  const botao = el('button', 'botao-opcao calc-microfone');
  botao.type = 'button';
  lugar.appendChild(botao);
  lugar.after(ouvi);

  let ouvindo: Reconhecedor | undefined;
  const pronto = (s: EstadoDaVoz) => {
    botao.disabled = s === 'baixando';
    botao.textContent =
      s === 'pronta' ? '🎤 Falar a conta' : s === 'baixar' ? '🎤 Ligar a voz (baixa o português uma vez)' : '🎤 Baixando o português…';
    botao.dataset.estado = s;
  };
  pronto(estado);

  botao.addEventListener('click', async () => {
    const SR = classeDoReconhecedor();
    if (!SR) return;
    if (botao.dataset.estado === 'baixar') {
      pronto('baixando');
      ouvi.textContent = 'Baixando o português para entender a voz aqui no aparelho. Só desta vez.';
      try {
        await SR.install?.({ langs: [IDIOMA] });
      } catch {
        /* segue para conferir de novo */
      }
      const agora = await estadoDaVoz();
      pronto(agora === 'nao' ? 'baixar' : agora);
      ouvi.textContent = agora === 'pronta' ? 'Pronto! Toque no microfone e diga a conta.' : 'Ainda não deu. Tente de novo daqui a pouco.';
      return;
    }
    if (ouvindo) {
      ouvindo.stop();
      return;
    }
    pararFala(); // a voz do app não pode ser ouvida pelo microfone
    const r = new SR();
    r.lang = IDIOMA;
    r.processLocally = true; // NUNCA pela internet
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.onresult = (e) => {
      const alternativas = Array.from(e.results[0] ?? [], (a) => a.transcript);
      for (const frase of alternativas) {
        const pedacos = contaFalada(frase);
        if (pedacos) {
          ouvi.textContent = `Ouvi: «${frase.trim()}»`;
          aoEntender(pedacos);
          return;
        }
      }
      ouvi.textContent = `Ouvi: «${(alternativas[0] ?? '').trim()}». Não entendi a conta. Tente assim: «quanto é sete vezes oito?»`;
      falar('Não entendi a conta. Tente de novo.');
    };
    r.onerror = (e) => {
      const motivo = MOTIVOS[e.error] ?? 'A voz não funcionou desta vez. Tente de novo.';
      if (motivo) ouvi.textContent = motivo;
    };
    r.onend = () => {
      ouvindo = undefined;
      botao.textContent = '🎤 Falar a conta';
      botao.classList.remove('ouvindo');
    };
    ouvindo = r;
    botao.textContent = '🎤 Ouvindo… (toque para parar)';
    botao.classList.add('ouvindo');
    ouvi.textContent = 'Pode falar a conta.';
    try {
      r.start();
    } catch {
      r.onend?.();
    }
  });
}
