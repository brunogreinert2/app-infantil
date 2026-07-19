// Leitura em voz alta. Web Speech API no navegador;
// no empacotamento nativo trocar por @capacitor-community/text-to-speech
// (mais estável offline) mantendo esta mesma assinatura.

export function suportaTTS(): boolean {
  return 'speechSynthesis' in window;
}

export function falar(texto: string): void {
  if (!suportaTTS()) return;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = 0.95;
  window.speechSynthesis.speak(fala);
}

export function pararFala(): void {
  if (suportaTTS()) window.speechSynthesis.cancel();
}
