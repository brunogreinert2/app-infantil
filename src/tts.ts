// Leitura em voz alta. Web Speech API no navegador;
// no empacotamento nativo trocar por @capacitor-community/text-to-speech
// (mais estável offline) mantendo estas mesmas assinaturas.
//
// Dois bugs conhecidos do Chrome/Windows contornados aqui (observados em
// teste real, 2026-07-19):
//   1. speak() imediatamente após cancel() trava a fila de voz de vez
//      → atraso de 80ms entre cancel e speak.
//   2. Falas longas pausam sozinhas após ~15s
//      → tique de resume() a cada 10s enquanto estiver falando.

let textoAtual: string | null = null;
let tiqueResume: number | undefined;
let atrasoPendente: number | undefined;

export function suportaTTS(): boolean {
  return 'speechSynthesis' in window;
}

// Devolve o texto sendo falado agora, ou null — permite ao botão 🔊 virar ⏹.
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

  atrasoPendente = window.setTimeout(() => {
    atrasoPendente = undefined;
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    fala.rate = 0.95;
    const encerrar = () => {
      limparEstado();
      aoTerminar?.();
    };
    fala.onend = encerrar;
    fala.onerror = encerrar;
    sintese.speak(fala);

    tiqueResume = window.setInterval(() => {
      if (sintese.speaking) sintese.resume();
      else clearInterval(tiqueResume);
    }, 10_000);
  }, 80);
}

export function pararFala(): void {
  limparEstado();
  if (suportaTTS()) window.speechSynthesis.cancel();
}

function limparEstado(): void {
  textoAtual = null;
  clearInterval(tiqueResume);
  clearTimeout(atrasoPendente);
  atrasoPendente = undefined;
}
