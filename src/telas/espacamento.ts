// Espaço entre linhas e entre letras: a tabela e a conta, sem tocar na tela
// (por isso mora fora de preferencias.ts — dá para testar sem navegador).

// MESMOS ids e MESMOS valores do app-leitura (ThemeDialog.tsx: ENTRELINHAS e
// ESPACAMENTOS) — é um ecossistema só; quem aprendeu num app acha no outro.
// Só o rótulo muda: aqui quem lê tem 7 anos.
//
// ENTRELINHA. Quem tem ceratocone vê a mesma letra duplicada, e o fantasma de
// uma linha cai sobre a linha de baixo: para essa vista o espaço entre linhas
// é o que separa uma linha da outra, não um conforto. Vale também para
// astigmatismo, baixa visão e dislexia. 1,7 é o padrão que o Bruno defende.
// O piso é 1,2 por causa do alfabeto grego: sinais acima e abaixo da letra
// encostam nos da linha vizinha se fechar mais.
export const ENTRELINHAS = [
  { id: 'minima', rotulo: 'Bem juntas', mult: 1.2 },
  { id: 'compacta', rotulo: 'Juntas', mult: 1.4 },
  { id: 'normal', rotulo: 'Normal', mult: 1.7 },
  { id: 'ampla', rotulo: 'Afastadas', mult: 2.2 },
] as const;

// ESPAÇO ENTRE LETRAS, em `em` (acompanha o tamanho da letra). A palavra
// anda junto e ~3x mais depressa: afastar só as letras desmancha a fronteira
// entre uma palavra e outra, e o texto vira uma fileira de letras soltas.
export const ESPACAMENTOS = [
  { id: 'normal', rotulo: 'Normal', letra: 0, palavra: 0 },
  { id: 'amplo', rotulo: 'Afastadas', letra: 0.06, palavra: 0.18 },
  { id: 'muito-amplo', rotulo: 'Bem afastadas', letra: 0.12, palavra: 0.36 },
] as const;

// PESO DA LETRA: um contorno na cor do próprio texto, que engrossa o traço
// sem trocar de fonte (a Cardo só tem 400 e 700, e 700 já é negrito).
// Medido em pixels DO APARELHO, não em `em`: 0, 1 ou 2 pixels inteiros dão o
// mesmo traço em toda linha; em `em` o valor caía em fração de pixel e o
// texto saía em faixas. "Fina" não é zero: é um fio invisível de 0,02 pixel,
// que obriga o iPhone a desenhar a letra pelo contorno, como nos outros dois
// pesos (a explicação longa está no app-leitura, ThemeDialog.tsx).
export const PESOS = [
  { id: 'fino', rotulo: 'Fina', dica: 'O traço da letra como ela foi desenhada.', pixels: 0.02 },
  { id: 'medio', rotulo: 'Média', dica: 'Um pouco mais de tinta.', pixels: 1 },
  { id: 'grosso', rotulo: 'Grossa', dica: 'Bem forte, para quem vê a letra fininha sumir.', pixels: 2 },
] as const;

export const PESO_PADRAO = 'fino';

/** O contorno em CSS para um peso, numa tela de certa densidade. */
export function tracoDoPeso(id: string, dpr: number): string {
  const def = PESOS.find((x) => x.id === id) ?? PESOS[0];
  return `${+(def.pixels / (dpr > 0 ? dpr : 1)).toFixed(4)}px`;
}

export const ENTRELINHA_PADRAO = 'normal';
export const ESPACAMENTO_PADRAO = 'normal';

/** Arredonda para um número inteiro de pixels DO APARELHO (1/dpr). */
export function naGrade(valor: number, dpr: number): number {
  const d = dpr > 0 ? dpr : 1;
  return Math.round(valor * d) / d;
}
