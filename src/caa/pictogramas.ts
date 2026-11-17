// PICTOGRAMAS DA PRANCHA DE CAA — desenhos NOSSOS, geométricos e provisórios.
//
// Cada um vive numa caixa de 100 × 100, em traço (o desenho recebe
// fill="none" e stroke da cor do texto de quem o usa). Partes cheias usam
// fill="currentColor", para seguirem a mesma cor do traço na tela e no papel.
//
// A arte é para trocar depois (decisão 4 de docs/LER_O_MUNDO.md): o motor só
// conhece a CHAVE. Trocar o desenho de "quero" não mexe em nenhuma prancha
// guardada. Chave publicada não se renomeia — prancha de alguém aponta para ela.

const busto = (cx: number) =>
  `<circle cx="${cx}" cy="30" r="16"/><path d="M${cx - 32} 90 Q${cx - 32} 56 ${cx} 56 Q${cx + 32} 56 ${cx + 32} 90 Z"/>`;
const olhos = '<circle cx="36" cy="40" r="4" fill="currentColor"/><circle cx="64" cy="40" r="4" fill="currentColor"/>';
const rosto = (boca: string, extra = '', comOlhos = true) =>
  `<circle cx="50" cy="50" r="40"/>${comOlhos ? olhos : ''}<path d="${boca}"/>${extra}`;
const grosso = (d: string, n = 10) => `<path d="${d}" stroke-width="${n}"/>`;
const octogono = (r: number) =>
  `M${Array.from({ length: 8 }, (_, i) => {
    const a = ((22.5 + i * 45) * Math.PI) / 180;
    return `${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
  }).join(' L')} Z`;
const maoAberta = (giro: number) =>
  `<g transform="rotate(${giro} 50 60)">` +
  '<rect x="30" y="18" width="10" height="40" rx="5"/><rect x="41" y="12" width="10" height="44" rx="5"/>' +
  '<rect x="52" y="14" width="10" height="42" rx="5"/><rect x="63" y="22" width="10" height="36" rx="5"/>' +
  '<path d="M30 50 V74 Q30 92 50 92 Q73 92 73 74 V50 Z"/><path d="M30 70 L16 56 Q12 50 18 47 L30 56" />' +
  '</g>';
const alfinete = '<path d="M50 92 C30 64 22 50 22 38 A28 28 0 0 1 78 38 C78 50 70 64 50 92 Z"/>';

export const PICTOGRAMAS: Record<string, string> = {
  // ---- essenciais (o piloto do Fable, 16/11/2026) ----
  eu: busto(42) + grosso('M98 74 H72 M82 64 L72 74 L82 84', 6),
  voce: busto(66) + grosso('M2 60 H28 M18 50 L28 60 L18 70', 6),
  sim: grosso('M16 54 L40 78 L86 22', 12),
  nao: grosso('M22 22 L78 78 M78 22 L22 78', 12),
  quero: '<circle cx="50" cy="30" r="15"/>' + grosso('M12 58 Q50 104 88 58', 8) + grosso('M50 50 V66 M43 60 L50 67 L57 60', 4),
  gosto: '<path d="M50 86 C8 56 12 18 35 18 C46 18 50 28 50 34 C50 28 54 18 65 18 C88 18 92 56 50 86 Z"/>',
  mais: grosso('M50 16 V84 M16 50 H84', 13),
  acabou:
    grosso('M24 10 V92', 6) +
    '<path d="M24 14 H82 V54 H24 Z"/><path d="M24 14 H53 V34 H24 Z M53 34 H82 V54 H53 Z" fill="currentColor"/>',
  ajuda:
    '<circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="17"/>' +
    '<path d="M22 22 L38 38 M78 22 L62 38 M22 78 L38 62 M78 78 L62 62"/>',
  espera: '<circle cx="50" cy="50" r="40"/>' + grosso('M50 50 V24 M50 50 L68 62', 6),
  parar: `<path d="${octogono(43)}"/>` + grosso('M28 50 H72', 10),
  ir: grosso('M12 50 H86 M62 26 L86 50 L62 74', 11),
  banheiro: '<path d="M20 12 H44 V54 H20 Z"/><path d="M44 46 H88 Q88 76 60 78 H44 Z"/><path d="M50 78 V92 H74 V77"/>',
  agua: '<path d="M26 14 H74 L66 90 H34 Z"/><path d="M29 42 H71"/>',
  comer:
    '<circle cx="60" cy="54" r="30"/><circle cx="60" cy="54" r="17"/>' +
    grosso('M16 14 V90 M8 14 V32 Q8 42 16 42 Q24 42 24 32 V14', 5),
  descansar: grosso('M8 34 V88 M8 68 H92 V88', 7) + '<path d="M40 68 V52 H78 Q92 52 92 68"/><circle cx="25" cy="55" r="10"/>',
  dor:
    '<g transform="rotate(-35 50 50)"><rect x="6" y="34" width="88" height="32" rx="16"/><rect x="36" y="34" width="28" height="32"/>' +
    '<circle cx="20" cy="50" r="2.5" fill="currentColor"/><circle cx="80" cy="50" r="2.5" fill="currentColor"/></g>',
  bem: rosto('M30 58 Q50 80 70 58'),
  mal: rosto('M30 72 Q50 54 70 72'),
  // "?" desenhado em traço (o piloto usava o glifo da letra; aqui não há fonte)
  pergunta: grosso('M32 34 Q32 14 50 14 Q68 14 68 32 Q68 44 50 50 V64', 11) + '<circle cx="50" cy="84" r="7" fill="currentColor"/>',

  // ---- núcleo ampliado (2026-11-16) ----
  estou: busto(40) + grosso('M74 44 H96 M74 60 H96', 6),
  onde: alfinete + grosso('M40 34 Q40 24 50 24 Q60 24 60 33 Q60 40 50 43 V50', 6) + '<circle cx="50" cy="60" r="4" fill="currentColor"/>',
  // mão ABERTA, quatro dedos quase da mesma altura e o polegar ao lado.
  // Nunca um dedo sobrando acima dos outros: lido como gesto obsceno.
  oi: maoAberta(0) + grosso('M8 30 Q2 44 8 58 M16 34 Q12 44 16 54', 4),
  tchau: maoAberta(-14) + grosso('M92 30 Q98 44 92 58 M84 34 Q88 44 84 54', 4),
  obrigado: '<path d="M50 88 C14 62 16 26 38 26 C46 26 50 34 50 38 C50 34 54 26 62 26 C84 26 86 62 50 88 Z"/>' +
    grosso('M50 4 V16 M28 8 L34 18 M72 8 L66 18', 4),
  'por-favor': '<path d="M20 90 L34 36 Q40 24 50 34 L50 90 Z"/><path d="M80 90 L66 36 Q60 24 50 34"/>' + grosso('M50 8 V18 M36 12 L41 20 M64 12 L59 20', 4),

  // ---- pastas (a casa que abre outra prancha) ----
  sinto: rosto('M32 64 H68') + '<path d="M70 16 C60 8 52 16 60 24 L70 32 L80 24 C88 16 80 8 70 16 Z" fill="currentColor"/>',
  lugares: alfinete + '<circle cx="50" cy="38" r="11"/>',
  comida: '<path d="M50 30 C26 18 12 40 18 62 C24 84 40 92 50 84 C60 92 76 84 82 62 C88 40 74 18 50 30 Z"/>' + grosso('M50 30 Q50 16 60 8', 5),
  escola: '<path d="M12 90 V44 L50 20 L88 44 V90 Z"/><path d="M40 90 V64 H60 V90"/>' + grosso('M50 20 V4', 4) + '<path d="M50 4 H68 V14 H50" fill="currentColor"/>',

  // ---- sentimentos ----
  feliz: rosto('M28 56 Q50 84 72 56 Z'),
  triste: rosto('M30 72 Q50 54 70 72') + '<path d="M66 50 Q62 58 66 62 Q70 58 66 50 Z" fill="currentColor"/>',
  bravo: rosto('M32 70 Q50 60 68 70', grosso('M26 28 L44 36 M74 28 L56 36', 6)),
  cansado: rosto('M38 66 Q50 72 62 66', grosso('M28 42 Q36 48 44 42 M56 42 Q64 48 72 42', 5), false),
  medo: rosto('', '<circle cx="36" cy="40" r="8"/><circle cx="64" cy="40" r="8"/><circle cx="36" cy="40" r="3" fill="currentColor"/><circle cx="64" cy="40" r="3" fill="currentColor"/><ellipse cx="50" cy="68" rx="9" ry="12"/>', false),
  nervoso: rosto('M28 66 L36 60 L44 68 L52 60 L60 68 L68 60 L72 64'),
  calor: '<circle cx="50" cy="50" r="18"/>' + grosso('M50 6 V20 M50 80 V94 M6 50 H20 M80 50 H94 M19 19 L29 29 M71 71 L81 81 M81 19 L71 29 M29 71 L19 81', 6),
  frio: grosso('M50 8 V92 M14 29 L86 71 M86 29 L14 71', 6) + grosso('M40 14 L50 24 L60 14 M40 86 L50 76 L60 86', 4),

  // ---- lugares ----
  casa: '<path d="M14 48 L50 16 L86 48"/><path d="M24 40 V88 H76 V40"/><path d="M42 88 V62 H58 V88"/>',
  sala: '<path d="M10 14 H90 V58 H10 Z"/>' + grosso('M22 30 H60 M22 44 H48', 5) + grosso('M30 58 L20 90 M70 58 L80 90', 5),
  patio: '<circle cx="50" cy="34" r="24"/>' + grosso('M50 58 V90 M24 90 H76', 7),
  refeitorio: '<path d="M8 50 H92"/>' + grosso('M20 50 V88 M80 50 V88', 6) + '<path d="M30 50 Q30 26 50 26 Q70 26 70 50"/>' + grosso('M50 26 V18', 5),
  onibus:
    '<rect x="6" y="20" width="88" height="56" rx="10"/><path d="M6 46 H94"/>' +
    '<path d="M16 28 H34 V46 H16 Z M40 28 H58 V46 H40 Z M64 28 H84 V46 H64 Z"/>' +
    '<circle cx="26" cy="80" r="9" fill="currentColor"/><circle cx="74" cy="80" r="9" fill="currentColor"/>',
  rua: '<path d="M30 8 L8 92 M70 8 L92 92"/>' + grosso('M50 12 V24 M50 38 V52 M50 66 V82', 6),
  medico: '<rect x="10" y="10" width="80" height="80" rx="14"/>' + grosso('M50 26 V74 M26 50 H74', 13),
  quarto: grosso('M10 30 V86 M90 58 V86', 7) + '<path d="M10 62 H90 V76 H10 Z"/><path d="M14 62 Q14 44 32 44 H44 V62"/>',

  // ---- comida ----
  suco: '<path d="M28 30 H72 L66 90 H34 Z"/>' + grosso('M56 30 L64 6 H76', 5) + '<path d="M31 48 H69"/>',
  lanche: '<path d="M12 40 Q12 18 50 18 Q88 18 88 40 Z"/><path d="M10 52 H90"/><path d="M12 64 H88 Q88 84 50 84 Q12 84 12 64 Z"/>',
  fruta: '<path d="M50 32 C28 20 12 40 18 62 C24 84 40 92 50 86 C60 92 76 84 82 62 C88 40 72 20 50 32 Z"/>' + '<path d="M50 30 Q56 10 74 12 Q70 28 50 30 Z" fill="currentColor"/>',
  pao: '<path d="M10 70 Q10 30 50 30 Q90 30 90 70 Z"/>' + grosso('M32 40 L40 56 M50 36 L56 54 M66 40 L70 56', 4),
  leite: '<path d="M32 30 L40 12 H60 L68 30 V90 H32 Z"/><path d="M32 30 H68"/>' + grosso('M42 52 H58 M42 64 H58', 4),
  doce: '<path d="M20 44 H80 L70 90 H30 Z"/><path d="M14 44 Q14 22 50 22 Q86 22 86 44 Z"/><circle cx="50" cy="14" r="6" fill="currentColor"/>',

  // ---- escola ----
  professora: busto(50) + '<path d="M70 4 H96 V24 H70 Z"/>',
  colega: '<circle cx="30" cy="30" r="13"/><circle cx="70" cy="30" r="13"/><path d="M4 90 Q4 52 30 52 Q56 52 56 90 Z"/><path d="M44 90 Q44 52 70 52 Q96 52 96 90"/>',
  lapis: '<g transform="rotate(-40 50 50)"><path d="M10 40 H74 L92 50 L74 60 H10 Z"/><path d="M74 40 V60"/><path d="M84 46 L92 50 L84 54 Z" fill="currentColor"/></g>',
  caderno: '<rect x="20" y="8" width="64" height="84" rx="6"/>' + grosso('M20 22 H12 M20 38 H12 M20 54 H12 M20 70 H12', 5) + grosso('M34 30 H72 M34 46 H72 M34 62 H64', 3),
  livro: '<path d="M50 24 Q30 12 8 18 V84 Q30 78 50 90 Q70 78 92 84 V18 Q70 12 50 24 Z"/><path d="M50 24 V90"/>',
  recreio: '<circle cx="50" cy="50" r="38"/><path d="M14 40 Q50 56 86 40 M14 60 Q50 44 86 60"/>',
  computador: '<rect x="10" y="12" width="80" height="54" rx="6"/>' + grosso('M50 66 V80 M28 86 H72', 6),
  musica: grosso('M38 76 V16 L80 8 V66', 6) + '<ellipse cx="28" cy="78" rx="12" ry="9" fill="currentColor"/><ellipse cx="70" cy="68" rx="12" ry="9" fill="currentColor"/>',
};

/** Nome que aparece no seletor do editor (a professora lê isto). */
export const NOMES_DOS_PICTOGRAMAS: Record<string, string> = {
  eu: 'eu', voce: 'você', sim: 'sim', nao: 'não', quero: 'quero', gosto: 'gosto', mais: 'mais',
  acabou: 'acabou', ajuda: 'ajuda', espera: 'espera', parar: 'parar', ir: 'ir', banheiro: 'banheiro',
  agua: 'água', comer: 'comer', descansar: 'descansar', dor: 'dor', bem: 'bem', mal: 'mal',
  pergunta: 'pergunta', estou: 'estou', onde: 'onde', oi: 'oi', tchau: 'tchau', obrigado: 'obrigado',
  'por-favor': 'por favor', sinto: 'sinto', lugares: 'lugares', comida: 'comida', escola: 'escola',
  feliz: 'feliz', triste: 'triste', bravo: 'bravo', cansado: 'cansado', medo: 'medo', nervoso: 'nervoso',
  calor: 'calor', frio: 'frio', casa: 'casa', sala: 'sala de aula', patio: 'pátio', refeitorio: 'refeitório',
  onibus: 'ônibus', rua: 'rua', medico: 'médico', quarto: 'quarto', suco: 'suco', lanche: 'lanche',
  fruta: 'fruta', pao: 'pão', leite: 'leite', doce: 'doce', professora: 'professora', colega: 'colega',
  lapis: 'lápis', caderno: 'caderno', livro: 'livro', recreio: 'recreio', computador: 'computador',
  musica: 'música',
};

/** O desenho como SVG pronto, em traço da cor do texto (`currentColor`). */
export function svgDoPictograma(chave: string, traco = 5): string {
  const desenho = PICTOGRAMAS[chave];
  if (!desenho) return '';
  return (
    `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" ` +
    `stroke-width="${traco}" stroke-linecap="round" stroke-linejoin="round">${desenho}</svg>`
  );
}
