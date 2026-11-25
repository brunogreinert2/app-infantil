// A CALCULADORA (ideia da Luiza, 2026-11-25): números grandes e a conta lida
// em voz alta. Aqui ficam só as regras, puras (sem DOM), para a tela e os testes.
//
// Escolhas de quem ensina matemática:
// - a conta inteira fica à vista («12 + 7 × 2 = 26»), não só o resultado;
// - vezes e dividir antes de mais e menos, como na escola (não da esquerda para
//   a direita, como as calculadoras baratas);
// - divisão que não dá exata mostra «≈» e no máximo seis casas, com vírgula;
// - dividir por zero não «dá erro»: diz que não dá, e por quê.

export type Operacao = '+' | '−' | '×' | '÷';
export type Tecla = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | ',' | Operacao | '=' | 'apagar' | 'limpar';

export type Pedaco = { tipo: 'num'; texto: string } | { tipo: 'op'; op: Operacao };

export interface Conta {
  pedacos: Pedaco[];
  /** depois do «=»: o resultado já escrito (com vírgula), ou o motivo de não ter */
  resultado?: string;
  aproximado?: boolean;
  erro?: string;
}

export const CONTA_VAZIA: Conta = { pedacos: [] };

/** Algarismos de um número (sem vírgula nem sinal): até 12, para caber grande. */
const MAX_ALGARISMOS = 12;
const CASAS = 6;

const algarismos = (s: string) => s.replace(/[^0-9]/g, '').length;

/** O que a tecla faz com a conta. Nunca muda a conta recebida. */
export function teclar(conta: Conta, tecla: Tecla): Conta {
  const terminada = conta.resultado !== undefined || conta.erro !== undefined;
  const pedacos = conta.pedacos.map((p) => ({ ...p }));
  const fim = pedacos[pedacos.length - 1];

  if (tecla === 'limpar') return CONTA_VAZIA;

  if (tecla === 'apagar') {
    if (terminada) return { pedacos };
    if (!fim) return CONTA_VAZIA;
    if (fim.tipo === 'op' || fim.texto.replace('−', '').length <= 1) pedacos.pop();
    else fim.texto = fim.texto.slice(0, -1);
    return { pedacos };
  }

  if (/^[0-9]$/.test(tecla)) {
    if (terminada) return { pedacos: [{ tipo: 'num', texto: tecla }] };
    if (fim?.tipo === 'num') {
      if (algarismos(fim.texto) >= MAX_ALGARISMOS) return conta;
      fim.texto = fim.texto === '0' ? tecla : fim.texto + tecla;
      return { pedacos };
    }
    return { pedacos: [...pedacos, { tipo: 'num', texto: tecla }] };
  }

  if (tecla === ',') {
    if (terminada) return { pedacos: [{ tipo: 'num', texto: '0,' }] };
    if (fim?.tipo === 'num') {
      if (!fim.texto.includes(',')) fim.texto += ',';
      return { pedacos };
    }
    return { pedacos: [...pedacos, { tipo: 'num', texto: '0,' }] };
  }

  if (tecla === '=') {
    if (terminada || !fim) return conta;
    if (fim.tipo === 'op') pedacos.pop();
    const limpos = pedacos.map((p) => (p.tipo === 'num' ? { ...p, texto: p.texto.replace(/,$/, '') } : p));
    return { pedacos: limpos, ...resolver(limpos) };
  }

  // uma operação
  const op = tecla as Operacao;
  if (terminada) {
    // continua a partir do resultado (ou recomeça, se não houve resultado)
    if (conta.resultado === undefined) return conta;
    return { pedacos: [{ tipo: 'num', texto: conta.resultado }, { tipo: 'op', op }] };
  }
  if (!fim) return conta; // conta não começa por sinal
  if (fim.tipo === 'op') {
    fim.op = op; // trocou de ideia: a nova operação fica no lugar
    return { pedacos };
  }
  fim.texto = fim.texto.replace(/,$/, '');
  return { pedacos: [...pedacos, { tipo: 'op', op }] };
}

const paraNumero = (s: string) => Number(s.replace(',', '.').replace('−', '-'));

/** Vírgula, sem separador de milhar (a voz lê «1000» como «mil»). */
export function escreverNumero(x: number): string {
  const s = String(Number(x.toFixed(CASAS)));
  return s.replace('.', ',').replace(/^-/, '−');
}

/** Resolve a conta: × e ÷ primeiro, depois + e −. */
export function resolver(pedacos: Pedaco[]): Pick<Conta, 'resultado' | 'aproximado' | 'erro'> {
  const nums: number[] = [];
  const ops: Operacao[] = [];
  for (const p of pedacos) {
    if (p.tipo === 'num') nums.push(paraNumero(p.texto));
    else ops.push(p.op);
  }
  if (!nums.length) return {};
  // primeiro vezes e dividir
  const n2 = [nums[0]];
  const o2: Operacao[] = [];
  for (let i = 0; i < ops.length; i++) {
    const b = nums[i + 1];
    if (ops[i] === '×') n2[n2.length - 1] *= b;
    else if (ops[i] === '÷') {
      if (b === 0) return { erro: 'Não dá para dividir por zero: não existe jeito de repartir em zero partes.' };
      n2[n2.length - 1] /= b;
    } else {
      o2.push(ops[i]);
      n2.push(b);
    }
  }
  let x = n2[0];
  for (let i = 0; i < o2.length; i++) x = o2[i] === '+' ? x + n2[i + 1] : x - n2[i + 1];
  if (!Number.isFinite(x) || Math.abs(x) >= 1e15) return { erro: 'Esse número é grande demais para caber aqui.' };
  const arredondado = Number(x.toFixed(CASAS));
  const aproximado = Math.abs(arredondado - x) > 1e-9;
  return { resultado: escreverNumero(arredondado), ...(aproximado ? { aproximado: true } : {}) };
}

/** A conta como se escreve: «12 + 7 × 2». */
export function escreverConta(c: Conta): string {
  return c.pedacos.map((p) => (p.tipo === 'num' ? p.texto : p.op)).join(' ');
}

const PALAVRAS: Record<Operacao, string> = { '+': 'mais', '−': 'menos', '×': 'vezes', '÷': 'dividido por' };

/** A conta como se fala: «12 mais 7 vezes 2 é igual a 26». */
export function falarConta(c: Conta): string {
  const conta = c.pedacos.map((p) => (p.tipo === 'num' ? p.texto.replace(/^−/, 'menos ') : PALAVRAS[p.op])).join(' ');
  if (c.erro) return `${conta}. ${c.erro}`;
  if (c.resultado === undefined) return conta;
  const resultado = c.resultado.replace(/^−/, 'menos ');
  return `${conta} ${c.aproximado ? 'é mais ou menos' : 'é igual a'} ${resultado}`;
}

/** O que a voz diz ao tocar numa tecla (quando «ler cada tecla» está ligado). */
export function falarTecla(t: Tecla): string {
  if (t === 'apagar') return 'apagar';
  if (t === 'limpar') return 'limpar tudo';
  if (t === '=') return 'igual';
  if (t === ',') return 'vírgula';
  if (t in PALAVRAS) return PALAVRAS[t as Operacao];
  return t;
}

/** Tecla do teclado do computador → tecla da calculadora. */
export function teclaDoTeclado(k: string): Tecla | undefined {
  if (/^[0-9]$/.test(k)) return k as Tecla;
  const mapa: Record<string, Tecla> = {
    '+': '+', '-': '−', '*': '×', x: '×', X: '×', '/': '÷', ':': '÷',
    ',': ',', '.': ',', '=': '=', Enter: '=', Backspace: 'apagar', Escape: 'limpar', Delete: 'limpar',
  };
  return mapa[k];
}
