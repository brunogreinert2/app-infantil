// Artes autorais em coordenadas vetoriais. A folha inteira tem a proporção A4.
// Uma fonte de verdade para o app, SVG avulso e impressão.
import glifos from './glifos.json';
import legendas from './glifos-legendas.json';
import type { DadoLetra } from './alfabetos';
import type { Complemento } from './alfabetoComplementos';

const G = glifos as Record<string, { d: string; adv: number; x1: number; y1: number; x2: number; y2: number }>;
const L = legendas as Record<string, { d: string; adv: number }>;
const TINTA = '#000000', PAPEL = '#ffffff';
export const FOLHA = { largura: 800, altura: 1131, margem: 48 };
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const idioma = (s: string) => /[\u0370-\u03ff\u1f00-\u1fff]/u.test(s) ? 'grc' : 'pt-BR';

function regiao(id: string, corpo: string): string {
  return `<g id="${id}" class="colorir-alvo" fill="${PAPEL}" stroke="${TINTA}" stroke-width="3">${corpo}</g>`;
}
function quadro(id: string, x: number, y: number, w: number, h: number, r = 12): string {
  return regiao(id, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`);
}
function linha(x1: number, y1: number, x2: number, y2: number): string {
  return `<path d="M${x1} ${y1} H${x2}" transform="translate(0 ${y2-y1})" stroke="${TINTA}" stroke-width="1.5" fill="none" pointer-events="none"/>`;
}
function largura(s: string, size: number): number {
  return [...s].reduce((n,c) => n + (L[c]?.adv ?? 0) * size / 1000, 0);
}
export function texto(s: string, x: number, y: number, size = 22, anchor: 'start'|'middle'|'end' = 'start'): string {
  let atual = x - (anchor === 'middle' ? largura(s,size)/2 : anchor === 'end' ? largura(s,size) : 0);
  const paths = [...s].map(c => {
    const g = L[c];
    if (!g) throw new Error(`Falta glifo de legenda: ${c}`);
    const p = g.d ? `<path d="${g.d}" transform="translate(${atual.toFixed(2)} ${y}) scale(${size/1000})"/>` : '';
    atual += g.adv * size / 1000;
    return p;
  }).join('');
  return `<g role="img" aria-label="${esc(s)}" lang="${idioma(s)}" fill="${TINTA}" stroke="none" pointer-events="none">${paths}</g>`;
}
function linhasTexto(s: string, x: number, y: number, max = 704, size = 21, entrelinha = 31): string {
  const linhas: string[] = []; let atual = '';
  for (const palavra of s.split(' ')) {
    const teste = atual ? `${atual} ${palavra}` : palavra;
    if (largura(teste,size)>max && atual) { linhas.push(atual); atual=palavra; } else atual=teste;
  }
  if(atual)linhas.push(atual);
  return linhas.map((l,i)=>texto(l,x,y+i*entrelinha,size)).join('');
}
function formas(s: string, x: number, y: number, w: number, h: number): string {
  const gs=[...s].map(c=>{ if(!G[c])throw new Error(`Falta letra vetorial: ${c}`); return G[c]; });
  const total=gs.reduce((v,g)=>v+g.adv,0), top=Math.min(...gs.map(g=>g.y1)), bottom=Math.max(...gs.map(g=>g.y2));
  const scale=Math.min(w/total,h/(bottom-top));
  let dx=x+(w-total*scale)/2;
  return gs.map(g=>{
    // Compensa a escala do glifo, mas permite que o contorno diminua com
    // a folha no celular. non-scaling-stroke engrossava as letras pequenas.
    const p=`<path d="${g.d}" transform="translate(${dx.toFixed(2)} ${(y+(h-(bottom-top)*scale)/2-top*scale).toFixed(2)}) scale(${scale.toFixed(5)})" stroke-width="${(3/scale).toFixed(4)}"/>`;
    dx+=g.adv*scale;return p;
  }).join('');
}
function letras(id: string, s: string, x: number, y: number, w: number, h: number): string {
  return regiao(id,`<g lang="${idioma(s)}" aria-label="${esc(s)}">${formas(s,x,y,w,h)}</g>`);
}
function base(titulo: string, categoria: string, corpo: string, identificacao = true): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1131" data-folha-a4="true" role="img" aria-label="${esc(titulo)}" stroke-linecap="round" stroke-linejoin="round">
  <!-- Gerado por src/conteudo/alfabetoArte.ts a partir dos dados de alfabetos.ts e alfabetoComplementos.ts. -->
  <title>${esc(titulo)}</title><desc>Folha A4 de Historinhas. ${esc(categoria)}. Pinte, aponte, fale ou escreva com a mediação da professora.</desc>
  ${quadro('regiao-fundo',0,0,800,1131,0)}
  ${texto('HISTORINHAS',48,43,17)}${texto(categoria,752,43,15,'end')}
  ${linha(48,58,752,58)}${texto(titulo,48,108,largura(titulo,38)>704?29:38)}
  ${identificacao ? texto('Nome:',48,147,18)+linha(112,148,515,148)+texto('Data:',540,147,18)+linha(594,148,752,148) : ''}
  ${corpo}
  ${linha(48,1065,752,1065)}${texto('historinhas.app.br',48,1096,16)}${texto('Seu jeito de participar também conta.',752,1096,16,'end')}
  </svg>`;
}

// Pequenas ilustrações originais. O desenho da palavra não substitui a letra.
const ICONES: Record<string,string> = {
 A:'<path d="M42 44 C-4 3 1 -18 24 -8 Q48 1 52 35 M63 42 C101 -3 92 -26 73 -12 Q53 -2 53 35" fill="none"/><ellipse cx="54" cy="63" rx="43" ry="28"/><path d="M41 38 Q29 62 41 88 M61 36 Q50 65 64 90 M82 45 Q69 66 78 82 M91 55 l11 -9 M89 61 l12 7" fill="none"/><circle cx="22" cy="58" r="3"/>',
 B:'<circle cx="52" cy="48" r="47"/><path d="M17 17 Q52 50 91 24 M6 58 Q48 21 79 9 M28 88 Q38 47 92 56" fill="none"/>',
 C:'<path d="M6 43 L52 2 L99 43 H90 V97 H16 V43 Z"/><path d="M40 97 V59 H63 V97 M24 45 H38 V60 H24 Z M71 45 H83 V60 H71 Z" fill="none"/>',
 D:'<rect x="6" y="5" width="90" height="90" rx="16"/><circle cx="29" cy="28" r="6"/><circle cx="73" cy="28" r="6"/><circle cx="51" cy="50" r="6"/><circle cx="29" cy="72" r="6"/><circle cx="73" cy="72" r="6"/>',
 E:'<path d="M12 52 C-6 18 50 4 74 26 Q102 14 99 51 L100 83 Q99 103 80 93 L76 56 L68 73 V95 H52 V78 H29 V95 H12 Z"/><path d="M69 31 C31 7 32 67 61 58 Z"/><circle cx="85" cy="36" r="3"/>',
 F:'<path d="M9 74 Q24 54 51 61 C35 21 74 2 88 25 Q107 44 88 61 Q78 92 37 95 L12 87 L0 96 L3 81 Z"/><path d="M40 70 Q60 70 60 90 M80 48 l17 2 M81 53 l17 8" fill="none"/><circle cx="79" cy="31" r="3"/>',
 G:'<path d="M18 22 L14 0 L38 13 Q52 7 69 13 L92 0 L87 25 Q112 59 83 81 Q51 99 19 80 Q-7 57 18 22 Z"/><path d="M48 58 l8 0 l-4 6 Z M29 62 H4 M31 70 L5 79 M73 62 h27 M72 71 l26 8 M40 71 Q52 82 64 71" fill="none"/><circle cx="32" cy="46" r="4"/><circle cx="72" cy="46" r="4"/>',
 H:'<path d="M21 30 C-5 2 27 -12 36 14 Q54 8 70 17 C90 -7 109 18 87 37 Q107 89 72 94 H27 Q-8 90 6 51 Z"/><ellipse cx="51" cy="67" rx="39" ry="26"/><circle cx="29" cy="42" r="3"/><circle cx="72" cy="42" r="3"/><circle cx="33" cy="64" r="4"/><circle cx="71" cy="64" r="4"/>',
 I:'<path d="M0 92 Q22 58 51 70 Q86 56 102 92 Z M45 76 Q52 33 43 15 L53 15 Q62 42 57 77 Z"/><path d="M48 19 Q15 -12 4 23 Q27 12 48 19 Z M49 19 Q81 -8 101 23 Q69 13 49 19 Z M48 19 Q17 18 17 46 Q37 33 48 19 Z"/>',
 J:'<path d="M6 63 L26 41 Q54 32 71 50 L96 51 V76 L71 78 L61 95 H48 L46 79 L28 82 L19 98 H8 L11 78 L0 71 Z"/><path d="M28 41 l8 -14 l11 11 l10 -14 l11 18 M70 63 H94 M78 64 v9 M86 64 v9" fill="none"/><circle cx="76" cy="47" r="9"/><circle cx="77" cy="46" r="3"/>',
 K:'<ellipse cx="51" cy="48" rx="46" ry="43"/><ellipse cx="51" cy="48" rx="34" ry="32"/><ellipse cx="51" cy="48" rx="10" ry="12"/><path d="M50 22 v9 M50 65 v9 M24 48 h9 M69 48 h9 M31 28 l7 8 M67 31 l-6 7 M32 68 l6 -7 M65 68 l-5 -7" fill="none"/>',
 L:'<path d="M49 0 L61 10 L78 6 L81 23 L98 29 L92 46 L100 61 L85 71 L82 91 L62 87 L49 100 L36 87 L18 91 L16 72 L0 61 L9 46 L3 29 L21 23 L24 6 L40 10 Z"/><circle cx="50" cy="49" r="31"/><circle cx="39" cy="42" r="3"/><circle cx="61" cy="42" r="3"/><path d="M43 53 H57 L50 60 Z M39 66 Q50 77 62 66" fill="none"/>',
 M:'<circle cx="14" cy="47" r="14"/><circle cx="86" cy="47" r="14"/><ellipse cx="50" cy="49" rx="39" ry="44"/><path d="M50 33 C18 9 7 63 30 77 Q50 94 71 77 C98 59 79 10 50 33 Z"/><circle cx="35" cy="47" r="3"/><circle cx="65" cy="47" r="3"/><path d="M36 65 Q50 78 65 65" fill="none"/>',
 N:'<path d="M3 66 H99 L80 96 H25 Z M53 66 V1 L12 57 H53 Z M60 9 L94 56 H60 Z"/><path d="M22 80 H81 M12 103 Q30 96 47 103 Q65 110 89 101" fill="none"/>',
 O:'<path d="M51 1 C12 4 -8 72 15 92 Q51 113 87 92 C113 70 88 4 51 1 Z"/>',
 P:'<path d="M14 63 Q45 82 54 54 C34 36 51 0 74 8 Q99 11 87 40 L103 46 L85 55 Q90 91 53 98 Q18 99 8 82 L0 62 Z"/><path d="M29 71 Q46 88 66 69" fill="none"/><circle cx="74" cy="26" r="3"/>',
 Q:'<path d="M7 36 L67 1 L98 26 V92 H7 Z M7 36 H98"/><circle cx="28" cy="57" r="7"/><circle cx="74" cy="70" r="11"/><circle cx="48" cy="86" r="5"/>',
 R:'<path d="M18 57 Q27 4 62 37 Q81 40 101 68 Q58 112 22 86 C-17 81 -2 111 14 103"/><circle cx="48" cy="28" r="21"/><circle cx="48" cy="28" r="12"/><circle cx="75" cy="60" r="3"/><path d="M87 76 l16 7 M90 70 h14" fill="none"/>',
 S:'<path d="M20 33 C-1 -5 38 -15 46 17 Q55 13 63 18 C77 -16 114 2 88 36 Q112 85 82 93 L17 94 Q-13 83 20 33 Z"/><circle cx="28" cy="21" r="9"/><circle cx="79" cy="22" r="9"/><path d="M25 63 Q52 91 80 63 M14 94 L6 102 M83 94 l11 8" fill="none"/>',
 T:'<path d="M9 70 C9 7 80 3 86 64 L103 77 L84 91 L64 86 L62 103 H48 V88 H28 L23 102 H11 V87 L0 82 Z"/><path d="M31 25 Q19 59 33 84 M48 18 Q36 61 51 86 M65 24 Q55 52 66 85" fill="none"/><circle cx="88" cy="75" r="3"/>',
 U:'<path d="M49 10 Q50 -8 72 -10 M51 6 Q25 -12 13 5 Q28 22 51 6 Z" fill="none"/><circle cx="31" cy="29" r="16"/><circle cx="67" cy="29" r="16"/><circle cx="49" cy="53" r="16"/><circle cx="19" cy="58" r="15"/><circle cx="79" cy="58" r="15"/><circle cx="33" cy="81" r="15"/><circle cx="65" cy="81" r="15"/><circle cx="49" cy="102" r="13"/>',
 V:'<path d="M24 22 L12 3 L34 10 Q52 1 70 10 L91 1 L78 25 Q100 63 76 90 Q48 107 21 87 Q2 61 24 22 Z"/><ellipse cx="50" cy="76" rx="31" ry="21"/><path d="M22 27 Q45 18 36 49 Q15 60 22 27 Z"/><circle cx="67" cy="38" r="4"/><circle cx="37" cy="76" r="4"/><circle cx="63" cy="76" r="4"/>',
 W:'<rect x="7" y="5" width="88" height="88" rx="15"/><path d="M28 9 V90 M51 8 V90 M74 9 V90 M10 27 H92 M10 50 H92 M10 73 H92" fill="none"/>',
 X:'<path d="M12 29 H81 V71 Q79 94 48 94 Q13 92 12 71 Z M83 38 Q114 34 103 62 L83 73"/><path d="M5 102 H94 M30 17 Q20 9 31 0 M51 17 Q41 9 52 0 M70 17 Q60 9 71 0" fill="none"/>',
 Y:'<circle cx="50" cy="12" r="13"/><path d="M36 34 H64 L70 66 L92 89 Q63 107 50 85 Q32 107 7 88 L31 65 Z M35 40 L12 61 L1 52 M65 40 L88 61 L99 52 M31 65 L49 84 L70 66" fill="none"/>',
 Z:'<path d="M18 2 L37 21 Q63 15 81 41 L99 60 Q105 84 81 94 L43 81 L26 103 H5 V48 L3 13 Z"/><path d="M9 46 L39 38 M8 60 L31 52 M8 73 L26 66 M35 24 L52 37 M48 22 L65 41 M61 29 L78 48" fill="none"/><circle cx="66" cy="53" r="4"/><path d="M81 77 Q90 84 97 75" fill="none"/>',
};
function icone(letra: string): string {
  const corpo=ICONES[letra];
  if(!corpo) return '';
  // Oculta linhas encobertas mesmo quando o motor retira o preenchimento
  // da camada superior e da impressão. As máscaras usam coordenadas do ícone.
  const partes=corpo.match(/<(?:path|circle|ellipse|rect)\b[^>]*\/>/g) ?? [];
  const desenho=partes.map((parte,i)=>{
    const frente=partes.slice(i+1).filter(p=>!p.includes('fill="none"'));
    if(!frente.length)return parte;
    const id=`recorte-${letra}-${i}`;
    const recortes=frente.map(p=>p.replace('/>',' fill="#000000" stroke="none"/>')).join('');
    return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-30" y="-30" width="180" height="180"><rect x="-30" y="-30" width="180" height="180" fill="#ffffff" stroke="none"/>${recortes}</mask></defs><g mask="url(#${id})">${parte}</g>`;
  }).join('');
  return regiao('regiao-ilustracao',`<g transform="translate(79 834) scale(1.05)">${desenho}</g>`);
}

export function svgLetraA4(l: DadoLetra, indice: number, todas: DadoLetra[], grego: boolean): string {
  const [mai,min,nome,dica]=l;
  const titulo=grego?`${nome} · ${mai} ${min}`:`${mai} ${dica}`;
  const candidates=[mai,todas[(indice+1)%todas.length][0],min,todas[(indice+3)%todas.length][1],mai,todas[(indice+2)%todas.length][0]];
  const procura=candidates.map((c,j)=>quadro(`regiao-busca-quadro-${j}`,48+j*120,606,104,93,15)+letras(`regiao-busca-letra-${j}`,c,63+j*120,625,74,52)).join('');
  let corpo=texto('1. Observe e pinte as duas formas.',48,197,24);
  corpo+=regiao('regiao-moldura','<path fill-rule="evenodd" d="M38 216 H762 V533 H38 Z M44 222 V527 H756 V222 Z"/>');
  corpo+=quadro('regiao-quadro-maiuscula',58,236,326,273)+quadro('regiao-quadro-minuscula',416,236,326,273);
  corpo+=texto('MAIÚSCULA',221,271,18,'middle')+texto('minúscula',579,271,18,'middle');
  corpo+=letras('regiao-maiuscula',mai,83,300,276,183)+letras('regiao-minuscula',min,443,300,274,183);
  corpo+=texto('2. Encontre as mesmas letras. Pinte ou aponte.',48,575,23)+procura;
  corpo+=texto('3. Faça do seu jeito.',48,753,24);
  corpo+=texto(grego?'Contorne o modelo ou tente escrever nas linhas.':'Pinte o desenho. Escreva a letra ou desenhe uma ideia.',48,790,20);
  if(grego){corpo+=letras('regiao-modelo',mai+min,58,825,172,120);corpo+=texto(nome,144,986,20,'middle');}
  else {corpo+=icone(mai);corpo+=texto(dica.replace(/^de /,''),134,989,19,'middle');}
  corpo+=linha(263,883,740,883)+linha(263,965,740,965);
  if(grego&&mai==='Σ')corpo+=texto('No fim da palavra, sigma também aparece como ς.',48,1033,20);
  else if(grego)corpo+=linhasTexto(dica,48,1033,704,17,22);
  return base(titulo,grego?'Grego antigo · letra por letra':'Português · letra por letra',corpo);
}

export function svgTabelaA4(titulo: string, letrasDados: DadoLetra[], grego: boolean): string {
  const linhas=Math.ceil(letrasDados.length/4), passo=grego?142:123;
  let corpo=texto('Observe, aponte e pinte. Cada letra tem duas formas.',48,154,21);
  letrasDados.forEach((l,i)=>{
    const x=48+(i%4)*180,y=179+Math.floor(i/4)*passo;
    corpo+=quadro(`regiao-quadro-${i+1}`,x,y,164,passo-11);
    const sinais=l[0]==='Σ'?'Σσς':l[0]+l[1];
    corpo+=letras(`regiao-letra-${i+1}`,sinais,x+16,y+15,132,passo-61);
    corpo+=texto(l[2],x+82,y+passo-24,19,'middle');
  });
  if(linhas===7)corpo+=texto('Quais aparecem no seu nome?',411,997,16);
  if(grego)corpo+=texto('24 letras. Sigma: σ no início/meio; ς no final.',48,1050,18);
  return base(titulo,grego?'Grego antigo · alfabeto completo':'Português · alfabeto completo',corpo,false);
}

export interface ItemQuadro { simbolos: string; rotulo: string; id?: number; }
export interface GrupoQuadro { titulo: string; itens: ItemQuadro[]; }
export function svgQuadrosA4(titulo: string, categoria: string, grupos: GrupoQuadro[], nota: string): string {
  let corpo='',y=180,n=0;
  // O conjunto mais denso tem quatro fileiras; títulos reservam espaço próprio.
  const totalLinhas=grupos.reduce((v,g)=>v+Math.ceil(g.itens.length/4),0);
  const altura=Math.min(175,(785-grupos.length*48)/totalLinhas);
  for(const grupo of grupos){
    corpo+=texto(grupo.titulo,48,y,24);y+=22;
    grupo.itens.forEach((it,i)=>{
      const x=48+(i%4)*180,ty=y+Math.floor(i/4)*altura,id=it.id??++n;
      corpo+=quadro(`regiao-quadro-${id}`,x,ty,164,altura-13);
      corpo+=letras(`regiao-letra-${id}`,it.simbolos,x+15,ty+18,134,altura-69);
      corpo+=texto(it.rotulo,x+82,ty+altura-30,17,'middle');
    });
    y+=Math.ceil(grupo.itens.length/4)*altura+36;
  }
  corpo+=linhasTexto(nota,48,1017,704,18,25);
  return base(titulo,categoria,corpo);
}

export function svgComplementoA4(c: Complemento): string {
  const chars=[...c.simbolos], len=chars.length;
  let corpo=linhasTexto(c.explicacao,48,194,704,22,31);
  corpo+=quadro('regiao-quadro-combinacao',48,258,704,293);
  corpo+=texto('OBSERVE E PINTE',400,293,18,'middle');
  chars.forEach((ch,i)=>{corpo+=letras(`regiao-simbolo-${i+1}`,ch,91+i*618/len,325,618/len,182)});
  corpo+=texto('Vamos descobrir',48,598,26)+linhasTexto(c.exemplo,48,637,704,24,33);
  corpo+=linhasTexto(c.atividade,48,741,704,21,31);
  corpo+=letras('regiao-modelo',c.simbolos,62,837,174,110);
  corpo+=linha(268,881,743,881)+linha(268,968,743,968);
  corpo+=texto('Você pode falar, apontar, contornar, escrever ou desenhar.',48,1034,18);
  return base(c.titulo,c.categoria,corpo);
}
