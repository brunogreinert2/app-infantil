"""Desenhos originais da coleção Primeiras Aventuras. Python 3, sem dependências.

Gera SVGs de trabalho; o pós-processamento de oclusões está em mascaras.mjs.
IDs e ordem das formas são persistentes depois da publicação.
Uso: python artes.py DIRETORIO_DE_SAIDA
"""
from pathlib import Path
from html import escape
import sys, math, json

OUT=Path(sys.argv[1]); OUT.mkdir(parents=True,exist_ok=True)
INDEX=[]
class Art:
 def __init__(self,name,title,desc,inside=False):
  self.name=name; self.title=title; self.desc=desc; self.parts=[]; self.n=0
  self.r(24,24,952,652,24,'fundo')
  if inside:
   self.p('M24 505 H976 V652 Q976 676 952 676 H48 Q24 676 24 652 Z','chao')
   self.line('M24 519 H976 M240 519 L170 676 M760 519 L830 676')
  else:
   self.p('M24 510 Q210 451 390 496 Q610 445 976 506 V652 Q976 676 952 676 H48 Q24 676 24 652 Z','chao')
 def shape(self,tag,attrs,key=None):
  self.n+=1
  self.parts.append(f'<{tag} id="regiao-{key or f"detalhe-{self.n:03}"}" class="colorir-alvo" fill="#ffffff" stroke="#000000" stroke-width="3" {attrs}/>')
 def p(self,d,key=None): self.shape('path',f'd="{d}"',key)
 def r(self,x,y,w,h,rx=0,key=None): self.shape('rect',f'x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"',key)
 def e(self,x,y,rx,ry,key=None): self.shape('ellipse',f'cx="{x}" cy="{y}" rx="{rx}" ry="{ry}"',key)
 def c(self,x,y,r,key=None): self.shape('circle',f'cx="{x}" cy="{y}" r="{r}"',key)
 def line(self,d,w=2): self.parts.append(f'<path d="{d}" fill="none" stroke="#000000" stroke-width="{w}" pointer-events="none"/>')
 def group(self,x,y,s=1,flip=1): self.parts.append(f'<g transform="translate({x} {y}) scale({s*flip} {s})">')
 def end(self): self.parts.append('</g>')
 def save(self):
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" role="img" aria-labelledby="{self.name}-titulo" stroke-linecap="round" stroke-linejoin="round"><title id="{self.name}-titulo">{escape(self.title)}</title><desc>{escape(self.desc)}</desc>'+''.join(self.parts)+'</svg>'
  (OUT/(self.name+'.svg')).write_text(svg,encoding='utf-8'); INDEX.append({'arquivo':self.name+'.svg','titulo':self.title,'descricao':self.desc,'regioes':self.n})

def cloud(a,x,y,s=1):
 a.group(x,y,s); a.p('M0 35 C-8 12 12 1 30 8 C35 -20 76 -17 83 9 C109 -4 135 16 128 36 C150 44 140 63 120 63 H16 C-2 63 -10 46 0 35 Z'); a.end()
def sun(a,x=835,y=116):
 a.c(x,y,35)
 for i in range(12):
  t=i*math.pi/6; a.line(f'M{x+47*math.cos(t):.1f} {y+47*math.sin(t):.1f} L{x+60*math.cos(t):.1f} {y+60*math.sin(t):.1f}')
def leaf(a,x,y,s=1,flip=1):
 a.group(x,y,s,flip); a.p('M0 0 Q0 -40 43 -47 Q51 -9 0 0 Z'); a.line('M0 0 Q18 -22 35 -38'); a.end()
def flower(a,x,y,s=1):
 a.group(x,y,s); a.line('M0 0 V55',4); leaf(a,0,37,.6); a.p('M0 -15 C-25 -41 -43 -8 -22 0 C-41 22 -15 40 -6 20 C7 43 34 23 17 8 C46 6 30 -28 12 -15 C18 -43 -7 -41 0 -15 Z'); a.c(0,1,10); a.end()
def grass(a,x,y,s=1):
 a.group(x,y,s); a.line('M0 0 Q-3 -19 -14 -26 M0 0 Q3 -29 15 -34 M0 0 Q13 -16 27 -14'); a.end()
def outdoors(a):
 cloud(a,108,99,1.15); cloud(a,610,76,.65); sun(a)
 for x,y in [(86,592),(889,604),(722,641)]: grass(a,x,y)
 flower(a,168,580,.7)
def tree(a,x,y,s=1):
 a.group(x,y,s); a.p('M-27 0 L-18 -200 L-60 -257 L-43 -269 L-8 -231 L-3 -292 H16 L24 -215 L61 -256 L77 -242 L31 -180 L38 0 Q7 -10 -27 0 Z'); a.p('M-90 -206 C-163 -223 -138 -290 -99 -294 C-126 -359 -38 -385 -8 -343 C26 -398 102 -357 92 -314 C157 -308 148 -226 100 -224 C66 -183 25 -217 6 -209 C-22 -182 -69 -187 -90 -206 Z'); a.line('M-87 -275 Q-52 -293 -25 -267 M35 -320 Q64 -336 83 -309 M16 -151 Q-1 -91 13 -41'); a.end()
def eyes(a,x,y,space=21):
 a.e(x-space,y,4,6); a.e(x+space,y,4,6); a.line(f'M{x-10} {y+23} Q{x} {y+34} {x+12} {y+22}')
def bird(a,x,y,s=1,kind='crow',flip=1,air=False):
 a.group(x,y,s,flip)
 if kind in ('stork','swan'):
  if kind=='stork':
   a.p('M-28 35 L-33 134 L-65 142 L-64 149 L-20 144 L-14 40 Z'); a.p('M11 36 L22 139 L-3 151 L35 148 L27 34 Z')
  a.p('M-75 8 L-116 -25 Q-93 46 -41 56 C16 77 57 30 42 -5 C31 -34 4 -52 19 -91 C33 -126 76 -120 74 -87 C74 -63 50 -53 48 -24 C58 8 39 35 12 41 Q-24 61 -75 8 Z')
  a.p('M66 -110 L141 -84 L69 -83 Z' if kind=='stork' else 'M66 -109 L104 -92 L70 -82 Z'); a.c(56,-104,4)
  a.p('M-76 5 Q-37 -18 5 10 Q-15 53 -61 32 Z'); a.line('M-61 13 Q-29 15 -16 28 M-46 23 Q-33 24 -27 31')
 else:
  a.p('M-18 51 L-22 78 L-40 85 L-9 82 L-6 51 Z'); a.p('M17 50 L25 78 L8 87 L39 81 L28 49 Z')
  a.p('M-58 10 L-102 -19 L-82 29 L-111 27 Q-64 67 -42 41 Z')
  a.p('M-67 11 C-82 -47 -28 -61 4 -49 C0 -97 66 -109 82 -65 C109 -9 71 55 13 57 C-22 59 -54 40 -67 11 Z')
  a.p('M78 -65 L122 -43 L82 -31 Z' if kind=='crow' else 'M78 -61 Q126 -64 122 -44 L82 -33 Z')
  if air:
   a.p('M-56 -13 Q-106 -81 -79 -139 Q-58 -100 -42 -93 L-40 -122 Q-21 -76 -5 -66 L4 -93 Q28 -51 31 -1 Q10 43 -31 29 Z'); a.line('M-56 -75 Q-41 -40 -15 -17 M-33 -62 Q-20 -37 0 -22')
  else: a.p('M-56 -13 Q-5 -48 31 -1 Q10 43 -31 29 Z'); a.line('M-40 1 Q-15 8 7 8 M-30 13 Q-9 20 2 19')
  a.c(64,-63,5); a.line('M53 -77 Q64 -85 73 -77')
  if kind=='rooster':
   a.p('M24 -86 C4 -125 28 -136 37 -111 C37 -148 66 -145 65 -113 C89 -139 108 -113 80 -85 Z'); a.p('M85 -28 C108 -3 78 15 70 -14 Z')
   a.p('M-65 -6 C-139 -96 -180 -32 -136 -5 C-174 -14 -177 34 -139 33 C-169 57 -127 84 -106 50 Z')
 a.end()
def mouse(a,x,y,s=1,flip=1):
 a.group(x,y,s,flip); a.p('M-57 19 C-122 -13 -139 46 -106 53 C-85 60 -81 36 -99 37 C-105 39 -102 46 -97 43 C-109 72 -142 42 -124 19 C-108 -7 -76 0 -52 10 Z'); a.e(-24,5,63,43); a.c(27,-40,30); a.c(26,-40,18); a.p('M15 -25 Q55 -44 92 4 Q101 26 54 31 Q21 31 9 16 Z'); a.c(91,8,7); a.e(52,-4,4,6); a.p('M-57 34 Q-24 26 -22 43 Q-32 51 -62 46 Z'); a.p('M24 26 Q54 27 56 39 Q40 49 12 42 Z'); a.line('M63 12 L103 0 M65 18 L108 21 M62 23 L99 38 M55 18 Q56 26 68 24'); a.end()
def fox(a,x,y,s=1,flip=1,dog=False):
 a.group(x,y,s,flip)
 a.p('M-43 22 C-155 47 -194 -38 -138 -91 C-111 -44 -88 -35 -47 -44 Z'); a.p('M-138 -91 Q-176 -56 -160 -21 L-133 -32 L-128 -14 L-110 -34 Q-125 -53 -138 -91 Z')
 a.p('M-54 -62 C-101 -40 -86 31 -55 51 L-62 89 H-18 L-20 60 Q3 70 38 47 L45 86 H85 L69 26 Q90 -30 42 -68 Z'); a.p('M-35 -29 Q15 -46 46 -16 L28 39 Q4 65 -16 29 Z')
 if dog:
  a.p('M-31 -94 C-95 -143 -106 -59 -62 -33 L-37 -70 Z'); a.p('M62 -98 C116 -131 126 -36 88 -33 L64 -64 Z')
 else:
  a.p('M-49 -65 L-60 -155 L1 -113 Z'); a.p('M34 -111 L81 -152 L79 -65 Z'); a.p('M-43 -93 L-45 -132 L-15 -111 Z'); a.p('M47 -109 L69 -131 L67 -89 Z')
 a.p('M-49 -95 C-25 -129 62 -125 81 -91 Q97 -55 30 -19 Q-48 -40 -49 -95 Z'); a.p('M-47 -67 Q-6 -73 24 -42 Q48 -72 83 -66 Q65 -29 30 -19 Q-16 -32 -47 -67 Z'); a.e(-13,-80,4,6); a.e(48,-80,4,6); a.p('M15 -45 Q29 -55 41 -44 Q36 -29 28 -31 Z'); a.line('M28 -31 V-22 M-51 77 V86 M57 75 V85'); a.end()
def ant(a,x,y,s=1):
 a.group(x,y,s); a.e(-27,4,24,17); a.e(4,0,18,14); a.c(30,-8,20); a.e(35,-12,3,4); a.line('M22 -23 Q4 -47 4 -33 M35 -26 Q41 -50 48 -37 M-21 17 L-31 34 L-43 35 M-2 12 L-6 33 H5 M13 12 L26 29 L38 23 M-17 -7 L-29 -23 L-42 -21'); a.end()
def jar(a,x,y,s=1,full=False):
 a.group(x,y,s); a.p('M55 -121 C129 -154 128 -22 69 -32 L64 -51 C103 -48 104 -126 62 -103 Z'); a.p('M-50 -180 H50 L43 -129 C49 -102 78 -101 81 -36 Q92 39 0 48 Q-91 39 -81 -36 C-78 -101 -49 -102 -43 -129 Z'); a.e(0,-180,54,14); a.e(0,-177,40,6)
 if full:
  a.e(0,-177,33,5)
 else: a.line('M-38 -167 Q0 -157 38 -167')
 a.line('M-62 -73 Q-72 -29 -59 -8 M-50 15 Q0 37 51 14'); a.p('M-12 -111 L14 -111 L26 -90 L0 -70 L-26 -90 Z'); a.end()
def rock(a,x,y,s=1):
 a.group(x,y,s); a.p('M-21 8 Q-30 -9 -12 -15 Q1 -33 20 -13 Q41 1 25 13 Q0 20 -21 8 Z'); a.end()
def bowl(a,x,y,s=1,tall=False,flat=False):
 a.group(x,y,s)
 if tall: a.p('M-19 -104 H19 L15 -70 Q56 -33 38 7 Q0 33 -38 7 Q-56 -33 -15 -70 Z'); a.e(0,-104,22,7)
 else: a.p('M-65 -4 Q-53 15 0 14 Q53 15 65 -4 Z' if flat else 'M-65 -4 Q-53 54 0 51 Q53 54 65 -4 Z'); a.e(0,-4,65,13); a.e(0,-3,49,6)
 a.end()
def table(a,x,y,w=460):
 a.r(x+25,y+15,25,159,5); a.r(x+w-50,y+15,25,159,5); a.r(x,y,w,35,10); a.line(f'M{x+15} {y+25} H{x+w-15}')
def cheese(a,x,y,s=1):
 a.group(x,y,s); a.p('M-61 19 L16 -50 L79 11 L65 59 H-61 Z'); a.p('M-61 19 L16 -50 L79 11 Z'); a.c(-29,35,9); a.e(35,31,12,8); a.c(4,-7,8); a.end()
def window(a,x,y,night=False):
 a.r(x,y,208,206,60); a.r(x+13,y+13,182,180,48)
 if night: a.p(f'M{x+126} {y+31} C{x+59} {y+14} {x+60} {y+112} {x+120} {y+108} Q{x+155} {y+105} {x+159} {y+78} C{x+115} {y+99} {x+92} {y+61} {x+126} {y+31} Z')
 else: a.c(x+70,y+65,27)
 a.r(x+99,y+9,10,188,2); a.r(x+9,y+113,190,10,2); a.r(x-7,y+197,222,16,5)
def person(a,x,y,s=1,kind='girl',pose='open'):
 a.group(x,y,s)
 a.r(-36,95,25,68,8); a.r(10,95,25,68,8); a.p('M-39 148 H-10 V174 H-61 Q-66 158 -39 158 Z'); a.p('M10 148 H40 V158 Q67 155 63 174 H10 Z')
 a.p('M-39 -5 Q-68 -5 -89 22 L-120 5 L-128 21 Q-85 64 -59 36 L-38 20 Z'); a.e(-126,9,13,17); a.p('M39 -5 Q68 -5 89 22 L120 5 L128 21 Q85 64 59 36 L38 20 Z'); a.e(126,9,13,17)
 a.p('M-40 -12 Q0 -32 40 -12 L55 108 Q0 124 -55 108 Z'); a.line('M-40 91 Q0 103 40 91'); a.r(-28,40,24,25,7); a.r(13,40,24,25,7)
 if kind in ('girl','mother'): a.p('M-38 -91 C-89 -101 -79 -2 -51 6 Q-59 -44 -31 -48 Z'); a.p('M38 -91 C89 -101 79 -2 51 6 Q59 -44 31 -48 Z')
 a.e(-43,-55,10,14); a.e(43,-55,10,14); a.p('M-42 -75 C-43 -131 43 -131 42 -75 V-48 C40 -1 -40 -1 -42 -48 Z')
 a.p('M-43 -61 C-65 -113 -21 -128 -7 -117 C24 -146 69 -98 44 -61 L29 -84 Q10 -68 2 -91 Q-16 -67 -32 -82 Z'); eyes(a,0,-57,17); a.line('M0 -51 Q-8 -37 2 -38')
 if kind=='elf': a.p('M-50 -91 Q-39 -145 40 -177 Q18 -130 57 -94 Z'); a.c(40,-177,10); a.r(-51,-101,108,17,6)
 if kind=='king': a.p('M-44 -102 L-51 -148 L-22 -130 L0 -159 L22 -130 L51 -148 L44 -102 Z'); a.c(0,-127,7); a.line('M-38 -111 H38'); a.p('M-34 108 V138 H-8 V116 H8 V138 H34 V108 Z')
 if kind=='maker': a.p('M-34 -12 L-27 76 Q0 89 28 76 L34 -12 L19 -15 L16 0 H-16 L-19 -15 Z'); a.r(-12,26,25,24,4)
 a.end()
def pot(a,x,y,s=1,overflow=False):
 a.group(x,y,s); a.e(-64,-2,20,29); a.e(64,-2,20,29); a.p('M-58 -30 H58 L53 49 Q0 81 -53 49 Z'); a.e(0,-30,63,17); a.e(0,-29,49,9)
 if overflow: a.p('M-52 -34 C-63 -62 -34 -72 -20 -55 C-13 -88 28 -79 28 -57 C58 -66 75 -31 49 -20 Q32 -17 24 -29 Q20 -2 5 -4 Q-13 -4 -13 -28 Q-37 -5 -52 -34 Z')
 else: a.line('M-26 -60 C-47 -78 -13 -86 -31 -105 M9 -60 C-12 -78 22 -87 4 -111 M36 -66 C18 -83 49 -89 35 -109')
 a.c(0,19,16); a.end()
def house(a,x,y,s=1):
 a.group(x,y,s); a.r(-63,-105,126,150,7); a.p('M-82 -104 L0 -180 L82 -104 Z'); a.r(-18,-30,36,75,16); a.r(-46,-83,30,31,4); a.r(15,-83,30,31,4); a.line('M-31 -82 V-53 M30 -82 V-53 M-46 -68 H-16 M15 -68 H45'); a.end()
def shoe(a,x,y,s=1):
 a.group(x,y,s); a.p('M-62 -27 Q-44 -4 -22 -25 L3 -32 Q11 1 63 7 Q88 13 78 40 H-66 Q-75 21 -62 -27 Z'); a.p('M-68 30 Q3 37 81 30 L79 43 H-67 Z'); a.line('M-18 -11 L11 -6 M-9 0 L24 5 M1 11 L37 17'); a.end()
def reed(a,x,y,s=1,lean=0):
 a.group(x,y,s); a.line(f'M0 0 Q{lean} -80 {lean-8} -162',4); a.p(f'M{lean-18} -164 v-48 q10 -18 20 0 v48 q-10 17 -20 0 Z'); a.p(f'M0 -30 Q{lean+55} -150 {lean+77} -119 Q{lean+31} -73 0 -30 Z'); a.p(f'M0 -6 Q{lean-55} -102 {lean-72} -78 Q{lean-31} -32 0 -6 Z'); a.end()

# 01 — o nível da água aparece na abertura do jarro, sem transparência mágica.
for n in (1,2):
 a=Art(f'colecao01-corvo-{n}',('O corvo encontra o jarro' if n==1 else 'Plim! Uma pedra de cada vez'),'Um corvo curioso, um jarro de água e pedras arredondadas no jardim.'); outdoors(a)
 a.r(87,293,249,220,12); a.line('M87 351 H336 M87 414 H336 M87 476 H336 M170 293 V351 M261 351 V414 M170 414 V476')
 if n==1: jar(a,615,472,1.28); bird(a,402,399,1.4)
 else:
  jar(a,632,545,1.1,True); bird(a,459,291,1.3,air=True); rock(a,632,307,.4); a.line('M630 325 V339 M644 320 V336',3)
 for x,y,s in [(752,564,.8),(687,601,.65),(535,575,.5),(781,609,.5)]: rock(a,x,y,s)
 a.c(290,570,18); a.line('M290 553 V588 M281 564 l-3 3 M300 577 l-2 3'); a.save()

# 02 — vasilhas diferentes, amigas com lugar à mesa.
for n in (1,2):
 a=Art(f'colecao01-cegonha-{n}',('O jantar nos pratos rasos' if n==1 else 'Um jantar para as duas'),'Raposa e cegonha dividem a mesa do jardim, com recipientes de formatos diferentes.'); outdoors(a)
 fox(a,266,414,1.25); bird(a,772,338,1.2,'stork',-1); table(a,338,419,330)
 bowl(a,405,399,.7,n==2,n==1); bowl(a,593,399,.7,n==2,n==1)
 if n==2: bowl(a,493,428,.72)
 flower(a,493,321,.55); a.p('M479 350 H507 L514 400 H473 Z'); a.save()

# 03 — um banquete no campo e a correria debaixo da mesa.
a=Art('colecao01-ratinhos-1','O piquenique no campo','Dois ratinhos fazem um piquenique junto à casa sob as raízes.'); outdoors(a); tree(a,253,512,1.13); a.p('M199 512 V449 Q244 399 289 449 V512 Z'); a.e(568,538,203,71); mouse(a,447,472,1.25); mouse(a,744,471,1.2,-1); cheese(a,586,537,.65); rock(a,505,560,.5); a.r(781,530,79,68,9); a.r(804,515,31,18,6); a.line('M800 536 V593 M840 536 V593'); a.save()
a=Art('colecao01-ratinhos-2','Correria na casa da cidade','Os ratinhos correm perto de um sapato, enquanto um gato espia debaixo da mesa.',True); window(a,704,73); table(a,113,300,742); cheese(a,370,269,.9); bowl(a,642,269,.75); a.r(83,405,109,240,12); shoe(a,302,562,1.1); mouse(a,518,574,1.05,-1); mouse(a,735,584,.9,-1)
a.group(613,425); a.p('M20 62 Q94 23 117 63 Q134 91 172 61 L180 71 Q131 114 101 72 Q87 51 38 81 Z'); a.e(0,78,67,55); a.e(-39,113,31,15); a.e(38,113,31,15); a.p('M-67 -22 L-62 -93 L-18 -60 Q0 -69 25 -57 L62 -91 L69 -20 Q62 49 0 51 Q-65 44 -67 -22 Z'); eyes(a,0,-12,26); a.p('M-8 7 H8 L0 18 Z'); a.line('M-24 15 L-83 2 M-22 24 L-86 32 M25 15 L84 2 M23 24 L87 32'); a.end(); a.save()

# 04 — uma folha vira barco, e uma pequena amiga retribui.
for n in (1,2):
 a=Art(f'colecao01-formiga-{n}',('Uma folha para a formiga' if n==1 else 'A pequena amiga avisa'),'Uma pomba e uma formiga junto ao riacho, com folhas e pedras.'); outdoors(a); tree(a,814,495,.82)
 a.p('M24 548 Q255 434 464 522 Q710 585 976 506 V646 Q688 673 455 600 Q234 540 24 653 Z'); a.line('M73 591 Q171 549 250 559 M568 614 Q712 645 830 614 M751 568 Q830 590 935 558')
 if n==1:
  a.p('M246 552 Q370 435 501 519 Q413 625 246 552 Z'); a.line('M266 547 Q370 518 470 521'); ant(a,374,511,1.05); bird(a,648,344,1.05,'dove',-1,True); leaf(a,522,390,.85,-1)
 else:
  bird(a,625,292,1.1,'dove',air=True); person(a,281,318,1.1,'maker'); ant(a,389,504,.72); a.line('M467 361 l21 -13 M475 385 h25 M466 409 l23 15',3)
 a.save()

# 05 — sem risco de mergulho: o cachorro fica na ponte.
for n in (1,2):
 a=Art(f'colecao01-reflexo-{n}',('O lanche e o reflexo' if n==1 else 'Olá, cachorro da água!'),'Um cachorro observa o próprio reflexo de cima de uma ponte de madeira.'); outdoors(a)
 a.p('M24 501 Q242 449 501 514 Q736 466 976 501 V652 Q976 676 952 676 H48 Q24 676 24 652 Z'); a.line('M93 581 Q197 557 285 581 M731 582 Q807 561 902 580')
 a.r(186,363,32,221,7); a.r(783,363,32,221,7); a.r(164,383,675,24,6); a.r(153,468,698,31,6)
 for x in range(221,782,83): a.line(f'M{x} 471 V496')
 fox(a,504,344,1.25,dog=True)
 if n==1: a.p('M488 304 Q508 283 538 304 L545 324 Q515 339 483 323 Z'); a.line('M499 305 l9 17 M518 302 l10 21')
 else: a.p('M630 579 Q650 563 678 578 L682 596 Q651 606 625 595 Z'); a.line('M610 601 Q654 621 700 599')
 a.group(511,604,.48); a.p('M-49 -26 C-101 -76 -104 30 -61 22 L-29 -4 Z'); a.p('M40 -26 C99 -76 108 34 67 24 L37 -4 Z'); a.p('M-48 -26 C-28 -68 52 -63 64 -22 Q61 20 9 40 Q-50 18 -48 -26 Z'); eyes(a,7,-17); a.p('M-1 7 H16 L7 17 Z'); a.end(); a.line('M436 644 Q508 654 579 643'); a.save()

# 06 — a pérola perdida e os grãos que fazem croc.
for n in (1,2):
 a=Art(f'colecao01-perola-{n}',('Um brilho no terreiro' if n==1 else 'Cada um encontra seu tesouro'),'Galo, pintinhos e uma pérola no quintal de uma casa.'); outdoors(a); house(a,211,335,.9); bird(a,430,445,1.5,'rooster'); bird(a,229,522,.45,'duck'); bird(a,313,591,.4,'duck'); rock(a,692,550,1.6); a.c(695,510,15)
 for x,y in [(375,589),(429,607),(481,567),(534,588)]: a.e(x,y,10,5)
 if n==2: person(a,811,371,1.08); a.line('M790 370 Q811 392 833 370'); a.c(812,385,7)
 else: flower(a,801,439,1.1)
 a.save()

# 07 — o mesmo lugar antes e depois do vento.
for n in (1,2):
 a=Art(f'colecao01-juncos-{n}',('O carvalho e os juncos' if n==1 else 'Quando o vento passa'),'Um carvalho ao lado dos juncos na margem do lago.'); tree(a,274,548,1.32)
 a.p('M469 539 Q682 475 976 542 V652 Q976 676 952 676 H435 Q559 610 469 539 Z'); a.line('M576 584 Q691 560 791 585 M737 627 Q848 611 918 628')
 for x,y,s in [(641,546,1),(749,544,1.25),(863,559,.83)]: reed(a,x,y,s,55 if n==2 else 0)
 if n==1: sun(a); cloud(a,559,95,1.1); bird(a,226,265,.43,'dove')
 else:
  cloud(a,553,90,1.9); a.line('M505 258 Q649 214 793 248 Q867 273 903 244 M562 301 Q704 276 883 303 M482 193 Q647 162 734 180',3)
  a.p('M313 546 L436 582 L449 570 L402 552 L419 534 L409 526 L388 548 L321 533 Z'); leaf(a,529,377,.8); leaf(a,860,367,.6)
 grass(a,80,591); flower(a,390,592,.65); a.save()

# 08 — planejar pode ser uma brincadeira coletiva.
for n in (1,2):
 a=Art(f'colecao01-sino-{n}',('A reunião dos ratinhos' if n==1 else 'Quem vai levar o sino?'),'Ratinhos reunidos ao redor de um sino, perto de uma toca.',True)
 a.p('M127 506 V296 Q234 182 341 296 V506 Z'); a.p('M151 506 V310 Q234 221 317 310 V506 Z'); a.r(580,131,248,173,14)
 a.group(706,228,.7); a.p('M-51 33 Q-31 13 -33 -25 C-32 -83 34 -83 33 -25 Q31 13 51 33 Z'); a.e(0,33,51,12); a.c(0,47,13); a.end()
 mouse(a,301,553,1.1); mouse(a,721,547,1.15,-1); mouse(a,493,395,.95); a.e(509,544,86,37)
 a.p('M473 533 Q486 519 483 499 C483 465 531 465 531 499 Q528 519 544 533 Z'); a.e(509,533,36,9); a.c(509,543,8); a.p('M499 471 Q478 433 463 457 Q456 478 499 471 Z'); a.p('M518 471 Q542 438 552 459 Q559 479 518 471 Z')
 if n==2: a.line('M665 459 Q673 430 696 444 Q715 457 692 473 V483',4); a.c(692,497,3)
 a.save()

# 09 — duas cenas de magia doméstica, sem fogo exposto.
a=Art('colecao01-mingau-1','Blup, blup, panelinha!','Mãe e filha preparam tigelas para a panela mágica.',True); window(a,717,74); person(a,226,378,1.22,'mother'); person(a,744,429,.88); table(a,336,426,337); pot(a,503,350,1.1); bowl(a,401,426,.5); bowl(a,612,426,.5); a.save()
a=Art('colecao01-mingau-2','O almoço saiu passeando','A panela transborda; a menina volta e encontra mingau pela rua.'); cloud(a,143,75); house(a,220,358,1.4); house(a,807,364,1.25); a.p('M351 411 C417 381 472 440 448 476 C512 484 551 499 562 534 C688 488 772 554 729 582 C862 613 775 661 697 631 C612 666 534 636 496 625 C370 657 244 616 329 577 C238 557 300 514 357 498 Z'); table(a,340,397,209); pot(a,443,350,.9,True); person(a,739,410,.99); a.line('M566 396 Q597 380 613 394 M578 421 Q602 412 621 424',3); a.save()

# 10 — oficina com ferramentas grandes e presentes pequenos.
a=Art('colecao01-duendes-1','Sapatos prontos de manhã','O sapateiro encontra os sapatos prontos em sua oficina.',True); window(a,675,77); person(a,230,370,1.25,'maker'); table(a,403,426,440); shoe(a,529,377,.92); shoe(a,729,377,.92); a.r(502,519,91,79,9); a.line('M520 532 L565 582 M570 532 L525 582'); a.e(722,558,37,17); a.r(693,519,59,39,5); a.e(722,519,37,12); a.save()
a=Art('colecao01-duendes-2','Uma dança de sapatinhos','Dois duendes dançam na bancada com suas roupas novas.',True); window(a,706,64,True); table(a,137,496,731); person(a,355,331,.77,'elf'); person(a,650,318,.81,'elf'); shoe(a,209,456,.45); shoe(a,796,454,.45); a.r(449,447,93,46,7); a.r(442,434,107,17,5); a.line('M492 434 V492'); a.p('M490 432 Q458 388 448 413 Q442 438 490 432 Z'); a.p('M495 432 Q530 393 536 417 Q537 439 495 432 Z'); a.line('M267 197 l-21 -20 M413 192 l22 -20 M570 172 l-21 -20 M731 173 l23 -19',3); a.save()

# 11 — o tear realmente vazio e um imperador vestido com roupa comum.
a=Art('colecao01-imperador-1','Um tear sem nenhum fio','O imperador observa um tear vazio, com novelos ao lado.',True); person(a,235,375,1.2,'king'); a.r(455,150,29,414,6); a.r(822,150,29,414,6); a.r(430,167,449,29,6); a.r(430,466,449,29,6); a.r(436,552,88,20,4); a.r(782,552,88,20,4); a.line('M477 526 L827 526'); a.c(584,598,38); a.line('M557 574 Q588 590 603 626 M550 589 Q579 602 590 633 M574 563 Q608 590 619 613'); a.r(704,556,53,61,7); a.e(731,555,36,10); a.e(731,618,36,10); a.save()
a=Art('colecao01-imperador-2','Cadê a roupa nova?','Uma criança conversa com o imperador de camiseta e calção, na rua do desfile.'); house(a,160,325,1.08); house(a,829,328,1.08); cloud(a,470,82,.8); a.p('M322 676 L426 438 H608 L734 676 Z'); person(a,566,356,1.35,'king'); person(a,279,464,.82); person(a,827,440,.94,'maker'); a.line('M209 170 Q500 254 799 170');
for x,y in [(270,187),(357,206),(445,217),(533,219),(621,210),(709,191)]: a.p(f'M{x} {y} l27 4 l-16 34 Z')
a.save()

# 12 — acolhimento antes e depois da descoberta.
for n in (1,2):
 a=Art(f'colecao01-patinho-{n}',('Um lugar para descansar' if n==1 else 'Tem lugar para você'),'Aves acolhem um novo companheiro entre folhas, flores e pequenas ondas.'); outdoors(a)
 a.p('M83 467 C169 420 298 441 377 465 C545 406 863 418 923 515 C969 589 824 624 652 614 C489 658 206 622 124 572 C53 549 32 494 83 467 Z'); a.line('M193 568 Q280 590 361 570 M535 580 Q671 601 762 575')
 reed(a,875,489,.9); reed(a,128,460,.7)
 if n==1: bird(a,627,420,1.1,'duck',-1); bird(a,383,440,.83,'swan'); a.p('M313 501 Q347 518 383 503'); a.line('M300 526 Q355 541 414 523')
 else: bird(a,500,437,1.55,'swan'); bird(a,779,482,.55,'duck',-1); bird(a,223,480,.75,'swan'); a.line('M362 557 Q469 582 580 552')
 leaf(a,164,612,1.2); flower(a,833,565,.8); a.save()

# Bônus: as três fábulas já publicadas ganham uma cena, sem mudar seus textos.
a=Art('colecao01-leao','Uma ajuda do tamanho de um ratinho','O leão agradece ao ratinho; pedaços de corda estão soltos no chão.'); outdoors(a); tree(a,187,491,.86)
a.group(555,406,1.25); a.p('M78 18 Q147 -22 153 41 Q156 65 182 49 L186 61 Q146 93 136 43 Q136 4 86 37 Z'); a.e(8,32,105,74); a.e(-54,87,46,23); a.e(63,87,39,23); a.p('M-83 -52 C-128 -83 -107 -129 -74 -131 C-88 -172 -33 -195 -12 -167 C21 -203 67 -171 61 -140 C108 -138 119 -90 88 -70 C111 -30 74 5 43 -5 C15 29 -27 14 -39 -5 C-83 5 -105 -16 -83 -52 Z'); a.c(-60,-112,18); a.c(52,-111,18); a.e(-5,-77,64,66); eyes(a,-5,-90,25); a.e(-5,-50,30,21); a.p('M-15 -62 H8 L-4 -50 Z'); a.line('M-4 -50 V-38 M-43 82 V99 M-22 83 V103 M52 84 V102 M70 82 V99'); a.end(); mouse(a,302,579,.77); a.line('M372 601 Q436 562 475 605 Q496 641 541 604 M618 612 Q669 646 730 607',7); a.line('M475 605 l-12 -13 M475 605 l-1 -17 M618 612 l-3 -19 M618 612 l-15 -9',2); a.save()
a=Art('colecao01-uvas','As uvas lá no alto','Uma raposa olha para cachos de uva pendurados numa parreira.'); outdoors(a); a.r(225,149,29,407,6); a.r(760,149,29,407,6); a.r(183,162,649,27,6); a.line('M189 185 Q254 106 327 172 Q399 217 468 145 Q539 103 604 169 Q677 213 811 139',7)
for x,y in [(316,220),(531,214),(713,223)]:
 a.line(f'M{x} {y-43} V{y}',4)
 for dx,dy in [(-18,0),(18,0),(-32,28),(0,31),(32,28),(-17,57),(17,57),(0,84)]: a.c(x+dx,y+dy,20)
 leaf(a,x-8,y-31,.9,-1)
fox(a,489,494,1.35); flower(a,819,552,.7); a.save()
a=Art('colecao01-vento-sol','O vento, o sol e o casaco','Um viajante leva seu casaco no braço, sob um sol tranquilo.'); sun(a,808,119); cloud(a,95,84,1.8); a.line('M118 249 Q219 221 306 247 Q340 258 360 237 M84 291 Q224 262 350 297',3); tree(a,803,518,.87); a.p('M170 676 Q333 504 492 443 H569 Q423 568 408 676 Z'); person(a,492,391,1.17,'maker'); a.p('M633 392 Q661 356 691 390 L716 511 L681 522 L674 447 L680 566 L618 566 L623 447 L606 504 L581 491 Z'); a.line('M649 407 V559 M633 392 L650 415 L670 390'); flower(a,161,558,.8); a.save()

(OUT/'indice.json').write_text(json.dumps(INDEX,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(INDEX)} cenas vetoriais geradas em {OUT}')
