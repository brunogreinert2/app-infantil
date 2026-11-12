// O emoji de capa de cada livro, até existir arte de capa. Usado pela estante
// e pelo menu lateral.

import { capasBosquesCastelos } from './colecaoBosquesCastelos';
import { capasPrimeirasAventuras } from './colecaoPrimeirasAventuras';

export const EMOJIS_CAPA: Record<string, string> = {
  ...capasPrimeirasAventuras,
  ...capasBosquesCastelos,
  'lebre-e-tartaruga': '🐢🐇',
  'o-que-depende-de-mim': '☔',
  'o-pequeno-principe': '🌹',
  'socrates-e-as-duas-cestas': '🏛️',
  'o-sonho-do-menino-rene': '🌙',
  'o-leao-e-o-ratinho': '🦁🐭',
  'a-raposa-e-as-uvas': '🦊🍇',
  'o-vento-e-o-sol': '🌬️☀️',
  'alfabeto-grego': 'Ωα',
  'alfabeto': '🔤',
  'numeros': '🔢',
};
