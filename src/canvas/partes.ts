// O nome de cada parte do desenho, para quem pinta SEM tocar no lugar exato:
// por teclado, por leitor de tela, por acionador, ou com a mão que não acerta
// uma região pequena. (O toque no desenho continua igual.)
//
// O nome sai do id da região — `regiao-tronco` vira "tronco". Só as cenas
// antigas têm ids com nome de coisa; as coleções novas usam `regiao-detalhe-012`
// e as folhas de alfabeto e de números têm dezenas de quadros. Para essas o
// nome é pobre ("detalhe 12"), e quem orienta é o contorno destacado no
// desenho e o "3 de 33". Dar nome de verdade a cada região é trabalho de
// quem revisa a ilustração.

const ACENTOS: Record<string, string> = {
  ceu: 'céu', chao: 'chão', arvore: 'árvore', cabeca: 'cabeça', poca: 'poça', petalas: 'pétalas',
  tunica: 'túnica', maiuscula: 'maiúscula', minuscula: 'minúscula', ilustracao: 'ilustração',
  numero: 'número', simbolo: 'símbolo', combinacao: 'combinação', jiboia: 'jiboia',
};

export function nomeDaParte(id: string): string {
  const palavras = id
    .replace(/^regiao-/, '')
    .split('-')
    .filter(Boolean)
    .map((p) => (/^\d+$/.test(p) ? String(Number(p)) : (ACENTOS[p] ?? p)));
  return palavras.join(' ') || 'parte';
}
