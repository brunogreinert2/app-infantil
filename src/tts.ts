// Leitura em voz alta. Web Speech API no navegador;
// no empacotamento nativo trocar por @capacitor-community/text-to-speech
// (mais estável offline) mantendo estas mesmas assinaturas.
//
// O Chrome/Windows tem TRÊS bugs conhecidos aqui, todos contornados:
//   1. speak() imediatamente após cancel() trava a fila de voz
//      → atraso de 120ms entre cancel e o primeiro speak.
//   2. O utterance é coletado pelo garbage collector no meio da fala se
//      ninguém guardar referência → a voz "morre" sem erro. Guardamos a
//      referência viva em `falaViva` até o fim.
//   3. Falas longas pausam sozinhas após ~15s → fatiamos o texto em
//      pedaços de frase (≤ 180 caracteres) encadeados por onend, e ainda
//      rodamos resume() periódico por garantia.

let textoAtual: string | null = null;
let fila: string[] = [];
let indice = 0;
let falaViva: SpeechSynthesisUtterance | null = null;
let aoTerminarAtual: (() => void) | undefined;
let tiqueResume: number | undefined;
let atrasoPendente: number | undefined;
let vozPt: SpeechSynthesisVoice | null = null;

export function suportaTTS(): boolean {
  // guarda de typeof: este módulo também roda nos testes (Node, sem window)
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// vozes carregam de forma assíncrona no Chrome — escolher quando chegarem
function escolherVoz(): void {
  const vozes = window.speechSynthesis.getVoices();
  vozPt =
    vozes.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith('pt-br')) ??
    vozes.find((v) => v.lang.toLowerCase().startsWith('pt')) ??
    null;
}
if (suportaTTS()) {
  escolherVoz();
  window.speechSynthesis.addEventListener?.('voiceschanged', escolherVoz);
}

// fatia por fim de frase e junta pedaços curtos até ~180 caracteres
// (exportada para a prova de fogo em tts.test.ts)
export function fatiar(texto: string): string[] {
  const frases = texto.split(/(?<=[.!?…:])\s+/);
  const pedacos: string[] = [];
  let atual = '';
  for (const frase of frases) {
    if (atual && (atual + ' ' + frase).length > 180) {
      pedacos.push(atual);
      atual = frase;
    } else {
      atual = atual ? `${atual} ${frase}` : frase;
    }
  }
  if (atual) pedacos.push(atual);
  // frase única gigante (sem pontuação): quebra por vírgula como plano B
  return pedacos.flatMap((p) =>
    p.length <= 240 ? [p] : p.split(/(?<=,)\s+/),
  );
}

export function textoFalando(): string | null {
  if (!suportaTTS()) return null;
  return window.speechSynthesis.speaking || atrasoPendente !== undefined ? textoAtual : null;
}

export function falar(texto: string, aoTerminar?: () => void): void {
  if (!suportaTTS()) return;
  const sintese = window.speechSynthesis;

  limparEstado();
  sintese.cancel();
  textoAtual = texto;
  fila = fatiar(texto);
  indice = 0;
  aoTerminarAtual = aoTerminar;

  atrasoPendente = window.setTimeout(() => {
    atrasoPendente = undefined;
    proximoPedaco();
    clearInterval(tiqueResume);
    tiqueResume = window.setInterval(() => {
      if (sintese.speaking) sintese.resume();
    }, 5_000);
  }, 120);
}

function proximoPedaco(): void {
  const sintese = window.speechSynthesis;
  if (indice >= fila.length) {
    encerrar();
    return;
  }
  const fala = new SpeechSynthesisUtterance(fila[indice]);
  fala.lang = 'pt-BR';
  if (vozPt) fala.voice = vozPt;
  fala.rate = 0.95;
  fala.onend = () => {
    indice++;
    // só continua se ninguém cancelou no meio
    if (falaViva === fala) proximoPedaco();
  };
  fala.onerror = () => {
    if (falaViva === fala) encerrar();
  };
  falaViva = fala; // referência viva: sem ela o Chrome mata a fala no GC
  sintese.speak(fala);
}

function encerrar(): void {
  const cb = aoTerminarAtual;
  limparEstado();
  cb?.();
}

export function pararFala(): void {
  limparEstado();
  if (suportaTTS()) window.speechSynthesis.cancel();
}

function limparEstado(): void {
  textoAtual = null;
  fila = [];
  indice = 0;
  falaViva = null;
  aoTerminarAtual = undefined;
  clearInterval(tiqueResume);
  clearTimeout(atrasoPendente);
  atrasoPendente = undefined;
}
