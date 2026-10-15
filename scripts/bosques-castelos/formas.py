"""Base de formas da coleção Entre Bosques e Castelos. Python 3, sem dependências.

Gera SVGs de trabalho; o pós-processamento de oclusões está em ../primeiras-aventuras/mascaras.mjs.
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
  # Contorno contínuo: costas, pescoço, peito e barriga, sem cruzar o corpo.
  a.p('M-107 -5 Q-116 -18 -123 -30 Q-100 -22 -81 -23 C-52 -48 -8 -36 10 -16 C20 -28 9 -53 13 -77 C16 -111 39 -130 62 -119 C83 -111 89 -88 73 -74 C57 -61 47 -49 51 -26 C78 0 69 41 40 59 C9 79 -47 72 -76 48 Q-99 30 -107 -5 Z')
  a.p('M66 -110 L141 -84 L69 -83 Z' if kind=='stork' else 'M66 -109 L104 -92 L70 -82 Z'); a.c(56,-104,4)
  a.p('M-91 -4 C-63 -24 -12 -23 22 12 Q-8 58 -59 40 Q-79 27 -91 -4 Z'); a.line('M-72 2 Q-42 23 -12 22 M-60 17 Q-37 34 -24 32')
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
