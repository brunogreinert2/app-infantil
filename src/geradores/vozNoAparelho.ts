// A VOZ ENTENDIDA DENTRO DO APP (calculadora, etapa 2b, 2026-11-25).
//
// O reconhecimento do próprio navegador no aparelho não ligou em nenhum dos
// três navegadores do Bruno (o Edge e o Safari não têm o português, e o Chrome
// recusa baixar). Então o app traz o seu reconhecedor: o Vosk (Apache 2.0),
// em WebAssembly, rodando num Worker DENTRO da página.
// - A voz da criança nunca sai do aparelho: o som vai do microfone para o
//   Worker, e só o texto volta.
// - O modelo português pequeno (vosk-model-small-pt-0.3, ~31 MB, Apache 2.0,
//   de alphacephei.com) mora no NOSSO site (public/voz/) e só é baixado quando
//   alguém toca em «Ligar a voz». O próprio Vosk o guarda no aparelho
//   (IndexedDB): da segunda vez em diante, nada vem da rede.
// - Ele fica de fora do precache do PWA (vite.config.ts), para não pesar em
//   quem nunca usa a calculadora.
// - Só ouve o vocabulário da calculadora (gramática fechada): números, mais,
//   menos, vezes, dividido, vírgula… Assim erra menos e fica leve.

import type { Model } from 'vosk-browser';

/** O endereço do modelo, no próprio site (o Worker resolve a partir da página). */
export const URL_DO_MODELO = `${import.meta.env.BASE_URL}voz/vosk-model-small-pt-0.3.tar.gz`;

/** Guardado no aparelho (não no perfil): o modelo já foi baixado aqui uma vez. */
const CHAVE_BAIXADO = 'aparelho:voz:modeloBaixado';

/** As palavras que a calculadora entende; o resto vira «[unk]». */
export const VOCABULARIO = [
  'zero', 'um', 'uma', 'dois', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
  'dez', 'onze', 'doze', 'treze', 'catorze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove',
  'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa',
  'cem', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos',
  'mil', 'e', 'mais', 'menos', 'vezes', 'multiplicado', 'dividido', 'por', 'vírgula', 'meio',
  'quanto', 'é', 'dá', 'igual', 'a', '[unk]',
];

export function vozCabeAqui(): boolean {
  return (
    typeof WebAssembly === 'object' &&
    typeof Worker === 'function' &&
    typeof indexedDB === 'object' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof AudioContext === 'function'
  );
}

export function modeloJaBaixado(): boolean {
  try {
    return localStorage.getItem(CHAVE_BAIXADO) === '1';
  } catch {
    return false;
  }
}

let carregando: Promise<Model> | undefined;

/** Carrega (e, na primeira vez, baixa) o modelo. Uma vez só por sessão. */
export function carregarModelo(): Promise<Model> {
  carregando ??= import('vosk-browser')
    .then(({ createModel }) => createModel(URL_DO_MODELO, -1))
    .then((m) => {
      try {
        localStorage.setItem(CHAVE_BAIXADO, '1');
      } catch {
        /* sem armazenamento: baixa de novo da próxima vez */
      }
      return m;
    })
    .catch((e) => {
      carregando = undefined; // deixa tentar de novo
      throw e;
    });
  return carregando;
}

export interface Escuta {
  /** para de ouvir e entrega o que já foi dito */
  parar: () => void;
}

/**
 * Abre o microfone e ouve UMA conta, com DOIS ouvidos ao mesmo tempo, porque
 * cada um erra num lugar (medido com a voz Maria do Windows, 2026-11-25):
 * - o LIVRE (vocabulário inteiro do modelo) acertou 5 de 6 frases, mas ouviu
 *   «menos cem» como «meninos sem»;
 * - o da GRAMÁTICA (só as palavras da calculadora) nunca inventa palavra fora
 *   da conta, mas trocou «oito» por «dezoito» e «três» por «treze».
 * `aoOuvir` recebe os dois textos, o livre primeiro: a tela fica com o
 * primeiro que formar uma conta. Entrega quando a pessoa faz uma pausa (ou
 * quando `parar()` é chamado), e então fecha tudo.
 */
export async function ouvirUmaConta(
  modelo: Model,
  aoParcial: (texto: string) => void,
  aoOuvir: (textos: string[]) => void,
): Promise<Escuta> {
  const microfone = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
  });
  const audio = new AudioContext();
  const livre = new modelo.KaldiRecognizer(audio.sampleRate);
  const fechado = new modelo.KaldiRecognizer(audio.sampleRate, JSON.stringify(VOCABULARIO));
  const ouvidos = [livre, fechado];
  const textos = ['', ''];
  const fonte = audio.createMediaStreamSource(microfone);
  // ScriptProcessor é antigo, mas é o que o Vosk aceita sem montar um Worklet
  const no = audio.createScriptProcessor(4096, 1, 1);
  let acabou = false;
  const fechar = () => {
    if (acabou) return;
    acabou = true;
    no.onaudioprocess = null;
    no.disconnect();
    fonte.disconnect();
    microfone.getTracks().forEach((t) => t.stop());
    void audio.close();
    // dá tempo do último resultado chegar antes de soltar os ouvidos
    setTimeout(() => ouvidos.forEach((o) => o.remove()), 1500);
  };
  let entregue = false;
  const entregar = () => {
    if (entregue) return;
    entregue = true;
    fechar();
    aoOuvir(textos.filter(Boolean));
  };
  let espera: ReturnType<typeof setTimeout> | undefined;
  ouvidos.forEach((ouvido, i) => {
    ouvido.on('partialresult', (m) => {
      const p = limparUnk(('result' in m ? (m.result as { partial?: string }).partial : '') ?? '');
      if (p && i === 0) aoParcial(p);
    });
    ouvido.on('result', (m) => {
      const t = limparUnk(('result' in m ? (m.result as { text?: string }).text : '') ?? '');
      if (!t || entregue) return;
      textos[i] = t;
      // frase terminada (pausa): espera o outro ouvido um instante
      if (textos.every(Boolean)) entregar();
      else espera ??= setTimeout(entregar, 700);
    });
  });
  no.onaudioprocess = (e) => {
    if (acabou) return;
    for (const o of ouvidos) {
      try {
        o.acceptWaveform(e.inputBuffer);
      } catch {
        /* um pedaço perdido não estraga a conta */
      }
    }
  };
  fonte.connect(no);
  no.connect(audio.destination);
  return {
    parar: () => {
      if (acabou || entregue) return;
      // pede o que já foi dito; se nada vier, entrega o que tiver
      no.onaudioprocess = null;
      ouvidos.forEach((o) => o.retrieveFinalResult());
      setTimeout(entregar, 1200);
    },
  };
}

const limparUnk = (s: string) => s.replace(/\[unk\]/g, ' ').replace(/\s+/g, ' ').trim();
