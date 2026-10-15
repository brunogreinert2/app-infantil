"""24 cenas originais de Entre Bosques e Castelos. Uso: python artes.py SAIDA."""
from formas import *

def outdoors(a):
 # Planos de terreno sustentam também casas e árvores mais distantes.
 a.p('M24 469 Q190 397 380 435 Q659 287 976 367 V652 Q976 676 952 676 H48 Q24 676 24 652 Z','colinas')
 cloud(a,108,99,1.15); cloud(a,610,76,.65); sun(a)
 for x,y in [(86,592),(889,604),(722,641)]: grass(a,x,y)
 flower(a,168,580,.7)

def notes(a,x,y,s=1):
 a.group(x,y,s)
 a.p('M0 0 V-45 L43 -54 V-12 H36 V-40 L7 -33 V0 Z'); a.e(-8,0,15,10); a.e(28,-12,15,10); a.end()

def cat(a,x,y,s=1):
 a.group(x,y,s); a.p('M32 31 Q95 10 91 -27 Q87 -49 72 -29 Q78 4 32 8 Z'); a.e(0,3,54,52); a.e(-30,41,26,12); a.e(29,41,26,12)
 a.p('M-46 -45 L-47 -94 L-15 -73 Q0 -78 19 -72 L49 -95 L47 -42 Q37 -6 0 -8 Q-41 -6 -46 -45 Z'); a.e(-18,-48,4,5); a.e(18,-48,4,5); a.p('M-7 -35 H7 L0 -27 Z'); a.line('M0 -27 Q-8 -17 -15 -25 M0 -27 Q8 -17 15 -25 M-23 -32 L-61 -39 M-23 -25 L-61 -18 M23 -32 L61 -39 M23 -25 L61 -18'); a.end()

def quad(a,x,y,s=1,kind='donkey',flip=1):
 a.group(x,y,s,flip)
 a.p('M-87 -20 Q-131 -32 -133 4 L-124 10 Q-121 -17 -83 -8 Z')
 for xx in [-73,-37,31,63]: a.r(xx,23,19,83,7); a.r(xx-3,94,26,17,4)
 a.e(-8,0,99,59)
 if kind=='donkey':
  a.p('M33 10 Q36 -67 64 -107 L116 -84 L98 21 Q66 51 33 10 Z'); a.p('M65 -99 Q35 -195 55 -204 Q81 -190 85 -111 Z'); a.p('M87 -111 Q88 -218 110 -211 Q128 -194 111 -104 Z'); a.line('M57 -179 L73 -130 M106 -185 L101 -134')
  a.p('M58 -95 Q63 -135 100 -130 Q137 -124 141 -88 L162 -72 Q178 -29 134 -26 L75 -41 Q50 -62 58 -95 Z'); a.e(134,-55,34,24); a.e(101,-98,4,6); a.c(147,-59,4); a.line('M136 -42 Q149 -37 157 -43'); a.p('M55 -92 L43 -98 L53 -113 L46 -122 L68 -133 L81 -130 Z')
 elif kind=='cow':
  a.p('M48 -58 L53 -101 Q28 -138 45 -151 L76 -117 L106 -117 Q140 -150 146 -129 L128 -92 L141 -45 Z'); a.e(92,-73,54,53); a.e(98,-38,47,25); a.e(73,-82,4,6); a.e(112,-82,4,6); a.c(80,-38,5); a.c(115,-38,5); a.p('M-74 -20 Q-59 -50 -36 -36 L-14 -6 Q-31 18 -53 7 Z')
 else:
  a.p('M45 -68 Q22 -105 41 -127 L69 -100 Q95 -116 119 -100 L146 -128 L145 -72 Q157 -53 139 -26 H78 Q43 -37 45 -68 Z')
  if kind=='dog': a.p('M49 -91 Q11 -111 17 -60 Q22 -27 46 -45 Z'); a.p('M122 -95 Q163 -109 162 -67 Q154 -33 136 -49 Z')
  a.e(114,-45,44,24); a.e(82,-79,4,6); a.e(120,-79,4,6); a.e(145,-51,9,7); a.line('M123 -29 Q139 -24 147 -34')
 a.end()

def pig(a,x,y,s=1,tool=False):
 a.group(x,y,s); a.p('M56 40 C105 11 114 53 90 63 C73 66 73 43 86 47',None)
 a.r(-43,71,28,50,8); a.r(14,71,28,50,8); a.r(-51,109,38,18,7); a.r(13,109,38,18,7)
 a.e(0,28,67,66); a.p('M-49 -55 L-55 -107 L-16 -80 Z'); a.p('M21 -82 L57 -107 L52 -47 Z'); a.e(0,-38,64,57); a.e(0,-22,31,22); a.e(-11,-22,5,8); a.e(11,-22,5,8); a.e(-27,-53,4,6); a.e(27,-53,4,6); a.line('M-13 10 Q0 22 15 9'); a.p('M-53 12 Q-85 5 -86 43 Q-82 65 -58 53 Z'); a.p('M53 12 Q85 5 86 43 Q82 65 58 53 Z'); a.r(-29,37,58,36,9)
 if tool: a.r(62,-5,10,67,3); a.r(49,-18,43,20,4)
 a.end()

def bear(a,x,y,s=1):
 a.group(x,y,s); a.e(0,28,65,82); a.e(-42,95,31,20); a.e(42,95,31,20); a.e(-64,27,20,43); a.e(64,27,20,43); a.e(0,35,40,51); a.c(-44,-89,25); a.c(44,-89,25); a.c(-44,-89,13); a.c(44,-89,13); a.e(0,-42,66,63); a.e(0,-22,34,25); a.e(-25,-52,4,6); a.e(25,-52,4,6); a.p('M-12 -30 Q0 -41 12 -30 L0 -19 Z'); a.line('M0 -19 V-7 M0 -7 Q-11 4 -20 -7 M0 -7 Q11 4 20 -7'); a.end()

def human(a,x,y,s=1,kind='boy',pose='down',crown=False):
 a.group(x,y,s)
 a.r(-32,95,24,61,8); a.r(9,95,24,61,8); a.r(-47,145,39,20,7); a.r(9,145,40,20,7)
 a.p('M-37 -6 Q-63 15 -57 73 L-42 79 L-26 14 Z'); a.e(-49,78,12,15)
 if pose=='point': a.p('M31 -5 L53 -8 L86 -43 L99 -32 L67 17 Q50 30 30 21 Z'); a.e(96,-45,13,15)
 elif pose=='carry': a.p('M31 -5 Q64 9 62 48 L6 49 L7 32 L41 31 L26 9 Z'); a.e(9,41,13,10)
 else: a.p('M37 -6 Q63 15 57 73 L42 79 L26 14 Z'); a.e(49,78,12,15)
 a.p('M-34 -14 Q0 -29 34 -14 L48 103 Q0 115 -48 103 Z'); a.line('M-37 84 Q0 94 38 84')
 if kind in ('girl','princess','mother','queen'): a.p('M-40 -86 Q-85 -80 -66 -4 L-33 8 L35 8 L68 -4 Q86 -85 39 -88 Z')
 a.e(-41,-53,10,14); a.e(41,-53,10,14); a.e(0,-60,43,51)
 if kind=='curly':
  for xx,yy in [(-41,-79),(-35,-100),(-14,-114),(12,-115),(34,-102),(42,-79)]: a.c(xx,yy,15)
 elif kind in ('old','father'): a.p('M-43 -65 Q-50 -112 -10 -113 L-20 -95 L-37 -80 Z'); a.p('M24 -106 Q50 -99 43 -67 L33 -83 Z')
 else: a.p('M-42 -64 Q-56 -108 -21 -112 Q5 -132 35 -108 Q55 -87 43 -62 L25 -88 Q-1 -72 -14 -91 L-37 -77 Z')
 eyes(a,0,-57,16); a.line('M0 -50 Q-8 -37 2 -38')
 if kind=='old': a.p('M-25 -28 Q0 12 26 -28 Q26 17 0 37 Q-25 17 -25 -28 Z'); a.line('M-65 61 V164',5)
 if kind in ('princess','queen') or crown:
  a.p('M-37 -105 L-41 -138 L-20 -124 L0 -147 L20 -124 L41 -138 L37 -105 Z'); a.c(0,-122,6)
 if kind=='emperor': a.r(-45,-115,90,23,7); a.r(-23,-140,46,28,9); a.c(0,-144,6); a.p('M-20 18 L0 0 L20 18 L0 38 Z')
 if kind=='boy': a.r(-17,37,34,29,6)
 a.end()

def goose(a,x,y,s=1,flip=1):
 a.group(x,y,s,flip); a.p('M-20 45 L-28 83 L-51 97 L-7 94 L-3 49 Z'); a.p('M27 46 L37 86 L18 98 L59 93 L45 43 Z')
 a.p('M-84 -2 L-110 -26 L-105 9 C-135 80 18 101 60 43 C80 15 54 -11 51 -38 C49 -61 81 -67 82 -96 C83 -132 35 -139 20 -110 C5 -85 32 -55 7 -34 C-16 -62 -72 -50 -84 -2 Z'); a.p('M77 -105 L113 -91 L79 -78 Z'); a.c(60,-102,4); a.p('M-76 1 Q-34 -27 16 16 Q-8 65 -54 38 Q-69 25 -76 1 Z'); a.line('M-60 9 Q-29 31 -9 28'); a.end()

def bee(a,x,y,s=1):
 a.group(x,y,s); a.e(-13,-19,20,30); a.e(16,-19,20,30); a.e(0,5,37,25); a.line('M-13 -16 Q-21 6 -13 27 M3 -19 Q-5 6 4 29 M19 -12 Q13 6 20 24',4); a.c(34,-4,18); a.c(40,-8,3); a.line('M29 -20 L20 -33 M40 -21 L49 -33'); a.end()

def castle(a,x,y,s=1,asian=False):
 a.group(x,y,s)
 if asian:
  a.r(-120,-130,240,180,5); a.p('M-162 -128 Q-65 -145 0 -206 Q64 -145 162 -128 Q65 -110 -162 -128 Z'); a.r(-64,-64,128,114,4); a.line('M0 -64 V50 M-105 -110 V33 M105 -110 V33')
 else:
  a.r(-110,-133,220,180,4)
  for xx in [-140,85]: a.r(xx,-204,57,251,5); a.p(f'M{xx-12} -204 L{xx+28} -268 L{xx+69} -204 Z'); a.r(xx+18,-167,22,45,11)
  a.p('M-39 47 V-38 Q0 -94 39 -38 V47 Z'); a.line('M0 -57 V47'); a.r(-61,-113,23,31,10); a.r(38,-113,23,31,10)
 a.end()

def cottage(a,x,y,s=1,material='wood'):
 a.group(x,y,s); a.r(-115,-155,230,210,6)
 if material=='brick':
  for yy in range(-125,55,35): a.line(f'M-115 {yy} H115');
  for xx in [-80,-10,60]:
   for yy in [-155,-85,-15]: a.line(f'M{xx} {yy} v30')
 elif material=='straw':
  for xx in range(-99,115,24): a.line(f'M{xx} -146 l-4 184 M{xx+7} -127 l-3 126')
 else:
  for yy in range(-130,55,30): a.line(f'M-115 {yy} H115')
 a.r(67,-231,27,70,2); a.p('M-146 -155 L0 -280 L146 -155 Z'); a.p('M-126 -156 L0 -263 L126 -156 Z'); a.r(-23,-46,54,101,18); a.c(17,14,4); a.r(-91,-116,50,48,5); a.r(40,-116,50,48,5); a.line('M-66 -115 V-68 M65 -115 V-68'); a.end()

def chair(a,x,y,s=1,broken=False):
 a.group(x,y,s); a.r(-48,-115,15,182,4); a.r(33,-115,15,182,4); a.r(-48,-113,96,45,7)
 if broken: a.p('M-38 18 L-50 48 L-37 55 L-25 24 Z'); a.p('M-14 42 L45 55 L42 67 L-17 54 Z')
 else: a.r(-52,-8,104,22,7)
 a.end()

def bed(a,x,y,s=1,sleep=False):
 a.group(x,y,s); a.r(-110,-36,220,78,9); a.r(-123,-80,19,145,7); a.r(103,-48,19,113,7); a.r(-105,-40,204,56,12); a.r(-90,-57,65,39,14)
 if sleep: a.e(-55,-63,24,24); a.p('M-79 -62 Q-86 -102 -55 -99 Q-25 -102 -31 -62 L-42 -80 Q-58 -65 -67 -81 Z'); a.line('M-66 -65 q5 7 10 0 M-49 -65 q5 7 10 0'); a.p('M-24 -44 Q49 -70 98 -30 V14 H-25 Z')
 a.line('M-11 -31 V6 M26 -34 V6 M63 -32 V6'); a.end()

def feather(a,x,y,s=1):
 a.group(x,y,s); a.p('M0 34 C-64 -4 -17 -74 42 -83 C51 -30 38 13 0 34 Z'); a.line('M-10 56 L32 -64 M5 14 L-17 -10 M14 -12 L34 -26 M22 -37 L7 -49',3); a.end()

def harp(a,x,y,s=1):
 a.group(x,y,s); a.p('M-72 85 L-94 -126 Q-41 -106 12 -155 Q42 -174 69 -148 L82 83 Z'); a.p('M-50 58 L-66 -93 Q-6 -85 48 -119 L54 58 Z')
 for xx in [-43,-21,1,23,45]: a.line(f'M{xx} -94 V56')
 a.r(-86,73,174,25,10); a.c(61,-145,17); a.end()

def scene(key,n,title,desc,inside=False): return Art(f'colecao02-{key}-{n}',title,desc,inside)

# Bremen: cada integrante tem corpo próprio e participa das três cenas.
a=scene('bremen',1,'Uma banda encontra seu caminho','Burro, cachorro, gata e galo caminham juntos por uma estrada entre árvores.'); outdoors(a); tree(a,143,438,.72); a.p('M384 676 Q354 536 595 451 L690 459 Q486 548 632 676 Z'); quad(a,308,420,.92); quad(a,634,484,.75,'dog'); cat(a,827,528,.72); bird(a,587,391,.55,'rooster'); notes(a,570,280,.7); a.save()
a=scene('bremen',2,'O concerto da janela','Os quatro músicos fazem uma torre perto da janela da casa dos ladrões.'); a.r(624,76,352,524,8); a.p('M586 91 L783 30 L976 91 Z'); window(a,701,168,True); a.r(751,421,125,179,34); a.c(849,522,8); quad(a,436,476,.98); quad(a,435,356,.70,'dog'); cat(a,439,269,.65); bird(a,443,180,.48,'rooster'); notes(a,220,231,1); notes(a,581,143,.65); grass(a,136,584); a.save()
a=scene('bremen',3,'Um concerto no novo lar','Os quatro amigos cantam no jardim de sua casa, com flores e notas musicais.'); outdoors(a); cottage(a,775,370,.86); quad(a,278,464,.93); quad(a,588,498,.73,'dog'); cat(a,793,551,.85); bird(a,537,335,.66,'rooster'); a.r(445,395,120,25,5); a.r(457,420,18,124,4); a.r(533,420,18,124,4); notes(a,160,265,.8); notes(a,607,254,.65); flower(a,95,551,.8); a.save()

# Abelhas: anatomia arredondada também nos patos menores.
a=scene('abelhas',1,'Pequenas casas no bosque','Tomé observa formigas. Há patos no lago e abelhas junto a uma árvore.'); outdoors(a); tree(a,778,443,1); a.e(775,280,42,62); bee(a,669,272,.65); a.e(607,530,166,53); goose(a,602,492,.50); human(a,344,428,1,'boy','point'); a.p('M63 580 Q139 473 249 580 Z'); a.e(152,563,21,13); ant(a,220,604,.45); ant(a,290,596,.38); a.save()
a=scene('abelhas',2,'Pérolas e uma chave','Formigas carregam pérolas até Tomé; um pato traz a chave na margem do lago.'); outdoors(a); castle(a,801,335,.62); a.e(682,546,236,67); human(a,356,419,1.12,'boy','point'); goose(a,661,487,.76,-1); a.c(574,431,12); a.r(570,442,8,40,2); a.r(570,472,24,8,2); a.r(585,458,8,22,2); a.e(219,561,85,31)
for x,y in [(186,554),(210,551),(237,554),(201,573),(228,573)]: a.c(x,y,10)
for x,y in [(76,598),(143,620),(283,614)]: ant(a,x,y,.42); a.c(x-12,y-17,9)
a.save()
a=scene('abelhas',3,'Uma pista com asas','Três princesas dormem em camas iguais. A abelha reconhece o cheiro de mel. Tomé observa.',True); window(a,735,70); bed(a,207,439,.94,True); bed(a,495,439,.94,True); bed(a,783,439,.94,True); bee(a,733,316,.65); a.r(124,536,751,70,18); a.line('M160 572 H837'); human(a,884,527,.64,'boy','point'); a.save()

a=scene('ganso',1,'O presente entre as raízes','Nico encontra um ganso de corpo arredondado entre as raízes de uma árvore.'); outdoors(a); tree(a,735,486,1.12); a.p('M613 514 Q675 443 708 506 L795 521 Q755 550 700 529 Z'); human(a,360,416,1.10,'boy','point'); goose(a,609,497,1.07); a.r(150,520,93,66,11); a.p('M168 520 Q191 474 226 520 L218 520 Q194 493 177 520 Z'); a.line('M168 534 V572 M190 534 V579 M214 534 V572'); a.save()
a=scene('ganso',2,'Uma fila muito atrapalhada','O ganso conduz Nico e uma fila de pessoas grudadas, enquanto a princesa olha do palácio.'); outdoors(a); castle(a,780,325,.65); human(a,780,213,.40,'princess'); a.r(750,271,60,9,2); a.line('M750 258 H810 M756 258 V271 M772 258 V271 M788 258 V271 M804 258 V271');
for x,y,k in [(302,458,'girl'),(459,458,'girl'),(616,458,'father'),(773,458,'mother')]: human(a,x,y,.93,k)
# Braços que unem a corrente, desenhados sobre as mangas.
for x in [302,459,616]: a.p(f'M{x+43} 522 Q{x+78} 532 {x+114} 522 L{x+114} 537 Q{x+77} 549 {x+43} 537 Z')
goose(a,154,523,.8,-1); human(a,97,368,.65,'boy','point'); a.p('M245 521 Q223 511 199 510 L194 525 Q217 529 245 537 Z'); a.save()
a=scene('ganso',3,'Uma pena oferecida de presente','Nico e a princesa fazem piquenique no jardim; o ganso oferece uma pena.'); outdoors(a); castle(a,816,323,.58); a.e(464,560,260,66); human(a,290,393,.92,'boy','carry'); human(a,655,393,.92,'princess','carry'); goose(a,493,497,.88,-1); feather(a,386,410,.66); bowl(a,384,570,.55); bowl(a,569,577,.55); flower(a,837,540,.85); a.save()

a=scene('rouxinol',1,'Lina encontra o cantor','Lina e o imperador escutam o rouxinol numa árvore do jardim.'); outdoors(a); castle(a,776,323,.68,True); tree(a,245,506,1.10); a.p('M245 360 L333 343 L333 329 L245 340 Z'); bird(a,314,287,.60,'crow'); human(a,493,424,.95,'girl','point'); human(a,741,421,1.1,'emperor'); notes(a,427,225,.70); a.save()
a=scene('rouxinol',2,'Um pássaro de dar corda','O imperador observa o pássaro mecânico. O rouxinol vivo parte pela janela aberta.',True); window(a,734,79); human(a,247,406,1.1,'emperor','point'); table(a,419,434,365); bird(a,603,349,.84,'crow'); a.c(596,359,22); a.c(596,359,9); a.r(495,354,50,8,3); a.e(492,343,15,12); a.e(492,373,15,12); a.p('M642 307 l12 -16 l12 16 l-12 15 Z'); bird(a,828,158,.44,'crow',air=True); notes(a,675,278,.55); a.save()
a=scene('rouxinol',3,'Música com a janela aberta','O imperador e Lina escutam o rouxinol livre no jardim, junto de um banco e flores.'); outdoors(a); castle(a,787,335,.72,True); tree(a,198,513,1.03); a.p('M198 364 L303 343 L303 331 L198 345 Z'); bird(a,281,292,.56,'crow'); a.r(395,417,330,40,10); a.r(413,457,22,118,5); a.r(685,457,22,118,5); human(a,485,391,.95,'emperor'); human(a,666,426,.78,'girl'); notes(a,373,226,.75); flower(a,839,540,1); flower(a,886,573,.65); a.save()

a=scene('ervilha',1,'Uma visita na tempestade','A princesa chega molhada ao portão. O príncipe oferece uma toalha.',True); a.r(47,52,338,499,18); a.p('M78 546 V215 Q213 60 351 215 V546 Z');
for x,y in [(116,222),(201,170),(301,211),(137,292),(298,318),(229,265)]: a.line(f'M{x} {y} l-15 34',3)
human(a,246,392,1,'princess'); human(a,518,392,1,'boy','carry',True); a.r(508,422,99,106,8); a.line('M525 437 V505 M541 438 V511'); a.e(249,584,112,16); a.r(737,369,139,163,8); bowl(a,802,360,.70); a.save()
a=scene('ervilha',2,'A cama quase nas nuvens','Uma princesa está deitada sobre vinte colchões. Uma escadinha encosta na cama.',True); window(a,743,73,True); a.r(169,565,485,25,6); a.r(178,589,22,52,5); a.r(624,589,22,52,5); a.c(419,556,8)
for i in range(20):
 y=536-i*18; a.r(170,y,481,18,8); a.line(f'M192 {y+9} h18 M608 {y+9} h20')
a.r(190,167,132,30,13); a.e(257,151,30,27); a.p('M227 150 Q218 113 246 116 Q283 100 287 149 L276 131 Q257 143 247 129 Z'); a.line('M244 149 q5 6 10 0 M264 149 q5 6 10 0'); a.p('M304 176 Q433 132 643 176 V197 H304 Z'); a.p('M710 641 L641 205 H655 L724 641 Z'); a.p('M792 641 L723 205 H737 L806 641 Z')
for yy in range(245,630,49):
 xx=649+(yy-205)*69/436; a.p(f'M{xx} {yy} h81 v10 h-81 Z')
a.save()
a=scene('ervilha',3,'Uma descoberta pequenininha','Na mesa do café, a rainha mostra a ervilha à princesa e ao príncipe.',True); window(a,105,73); human(a,228,369,.88,'queen','point'); human(a,490,353,.94,'princess'); human(a,755,369,.88,'boy','carry',True); table(a,129,452,735); bowl(a,287,448,.57); bowl(a,691,448,.57); a.r(452,409,84,40,8); a.e(494,409,42,12); a.c(495,399,10); a.r(373,429,33,35,5); a.r(587,429,33,35,5); a.save()

a=scene('porquinhos',1,'Três casas na mesma estrada','Três porquinhos constroem casas de palha, madeira e tijolos.'); outdoors(a)
for x,mat in [(199,'straw'),(500,'wood'),(801,'brick')]: cottage(a,x,398,.85,mat)
pig(a,200,537,.70); pig(a,502,537,.70); pig(a,802,537,.70,True); a.save()
a=scene('porquinhos',2,'Depressa para a casa de tijolos','Dois porquinhos escapam da casa de madeira que o lobo soprou. A casa de tijolos está perto.'); outdoors(a); cottage(a,802,393,.85,'brick'); quad(a,234,440,.90,'wolf');
for x,y,ang in [(367,553,18),(454,512,-18),(369,594,-10),(489,599,11)]:
 a.parts.append(f'<g transform="translate({x} {y}) rotate({ang})">'); a.r(-65,-11,130,22,4); a.line('M-51 0 H48'); a.end()
pig(a,624,504,.70); pig(a,797,541,.66); a.line('M394 345 Q474 306 548 329 M400 374 Q488 351 552 364 M396 407 Q470 406 529 422',3); a.save()
a=scene('porquinhos',3,'Construindo juntos','Os três porquinhos refazem as casas com tijolos, ferramentas e materiais reaproveitados.'); outdoors(a); cottage(a,777,377,.81,'brick'); a.r(101,368,318,178,5)
for yy in [402,438,474,510]: a.line(f'M101 {yy} H419')
for xx in [148,225,302,379]: a.line(f'M{xx} 369 V401 M{xx} 439 V473 M{xx} 511 V546')
pig(a,269,510,.85,True); pig(a,526,498,.83,True); pig(a,768,527,.72); a.r(450,589,73,30,4); a.r(532,589,73,30,4); a.r(488,559,73,30,4); a.r(111,594,81,28,4); a.save()

a=scene('ursos',1,'Três tigelas de mingau','Cachinhos encontra três tigelas de tamanhos diferentes na cozinha dos ursos.',True); window(a,106,72); chair(a,755,418,1.1); human(a,513,361,1.05,'curly','carry'); table(a,153,468,630); bowl(a,281,434,1); bowl(a,491,443,.78); bowl(a,659,451,.55); a.r(818,181,103,167,7); a.line('M830 233 H911 M830 288 H911'); a.save()
a=scene('ursos',2,'A cadeira do ursinho','Três ursos encontram a cadeira pequena quebrada na sala.',True); window(a,724,73); chair(a,180,450,1.2); chair(a,403,470,1); chair(a,647,563,.70,True); bear(a,275,333,.97); bear(a,497,364,.82); bear(a,801,503,.67); a.r(102,607,386,28,12); a.save()
a=scene('ursos',3,'Toc, toc! Posso ajudar?','Cachinhos, seu pai e o ursinho consertam a cadeira na varanda. Uma caixa de ferramentas está aberta.'); outdoors(a); cottage(a,809,357,.75); human(a,252,412,1.12,'father','carry'); human(a,471,460,.82,'curly','carry'); bear(a,773,521,.77); chair(a,604,499,.85); a.r(111,582,106,55,7); a.r(132,567,62,15,5); a.r(192,544,12,59,3); a.r(176,534,44,19,4); a.r(581,577,49,54,5); a.r(595,564,21,13,3); a.line('M591 590 H620 M591 600 H620'); a.save()

a=scene('feijao',1,'Um caminho até as nuvens','João sobe no pé de feijão gigante, enquanto a mãe olha perto da casinha.'); outdoors(a); cottage(a,799,441,.87); a.p('M416 650 C458 509 391 423 431 314 C476 191 419 131 458 49 H490 C454 158 513 239 476 331 C433 439 506 530 457 650 Z')
for x,y,ss,ff in [(453,196,2.3,-1),(456,326,2.2,1),(446,452,2.2,-1),(463,579,2.3,1)]: leaf(a,x,y,ss,ff)
human(a,373,311,.71,'boy','point'); human(a,699,462,.93,'mother','point'); cloud(a,309,65,1.4); a.save()
a=scene('feijao',2,'Uma harpa e uma galinha','João encontra a harpa e a galinha junto à mesa do gigante adormecido.',True); window(a,749,74); giant_start=len(a.parts); human(a,386,288,1.47,'father'); giant_end=len(a.parts);
for k in range(giant_start,giant_end):
 if 'cx="-16" cy="-57"' in a.parts[k] or 'cx="16" cy="-57"' in a.parts[k]: a.parts[k]=a.parts[k].replace('ry="6"','ry="1"')
table(a,200,409,532); bowl(a,420,382,1.18); human(a,133,492,.73,'boy','point'); harp(a,821,493,.85); a.r(549,468,166,156,23); bird(a,626,564,.51,'duck'); a.p('M556 472 Q631 388 708 472 Z'); a.p('M546 473 L477 444 V593 L546 626 Z'); a.line('M499 462 V594 M520 470 V607'); a.e(659,612,18,12)
a.save()
a=scene('feijao',3,'A horta ganha novos amigos','João e a mãe cuidam da horta. A vaca voltou; a galinha e a harpa ficam perto da casa.'); outdoors(a); cottage(a,795,346,.69); quad(a,250,460,.86,'cow'); human(a,475,437,.88,'boy'); human(a,659,418,1,'mother'); harp(a,846,519,.58); bird(a,565,568,.58,'duck'); a.e(499,624,21,15); a.p('M89 610 Q208 582 341 612 L356 649 H79 Z');
for x in [127,201,275]: a.line(f'M{x} 629 V588',4); leaf(a,x,609,.55); leaf(a,x,599,.45,-1)
a.save()

(OUT/'indice.json').write_text(json.dumps(INDEX,ensure_ascii=False,indent=2),encoding='utf-8')
