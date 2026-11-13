# Acessibilidade do Historinhas — o que foi medido, como, e o que não foi

> Correção (2026-11-12): este arquivo dizia "98 cores". São **92**: 18 cores
> com cinco tons, mais branco e preto, que têm um tom só. A conta estava errada
> desde a primeira versão (18 × 5 + 2, não 20 × 5 − 2); o código e os testes
> sempre estiveram certos, o número escrito é que não.

Este arquivo é o registro honesto. Cada linha diz **o que foi verificado**,
**como** e — tão importante quanto — **o que NÃO foi verificado**. Nada aqui
vale como "testado com pessoas": até hoje nenhuma criança ou professora com
deficiência visual, motora ou de leitura avaliou o app de forma organizada.
Simulação e medida automática cobrem uma parte do problema, não ele todo.

Régua: `C:\Claude\portico\NORMAS.md` (LEI 4/5, N29) e a lista "Padrão de
referência em acessibilidade" de `docs/FABLE_PLANO_NOVAS_IDEIAS.md`.

Como ler a coluna **Prova**: *teste* = roda em `npm test`, quebra o build se
regredir; *medido* = número tirado no navegador (Chromium) na data indicada,
não se repete sozinho; *lido* = conferido só pela leitura do código.

---

## Cores de pintar (F1 — 2026-11-11)

Tela: `src/telas/telaColorir.ts`. Dados: `src/canvas/cores.ts`.
Simulador: `src/canvas/visaoDeCores.ts` (só entra nos testes, fora do pacote).

### O que mudou e por quê

| Antes | Agora |
|---|---|
| O nome da cor só existia em `title` (dica de mouse) e `aria-label`. No celular, ninguém via. | O nome da cor escolhida fica **sempre escrito**, grande, ao lado de uma amostra. |
| 14 cores em ordem de arco-íris, quebrando de linha conforme a largura. | 20 cores — 18 com 5 tons cada, mais branco e preto (92 cores com nome), em **grade fixa** e numa ordem **medida**. |
| Cor escolhida = poço um pouco maior. | Cor escolhida = maior + borda grossa + marca ✓. |
| Sem voz. | Voz opcional por perfil ("Falar o nome das cores"), desligada por padrão. |

### A ordem da paleta foi refeita (2026-11-12) — a medida não bastou

A primeira ordem passava no teste (nenhuma vizinha com ΔE abaixo de 25, em
nenhuma das visões simuladas) e mesmo assim o Bruno, que tem protanomalia,
olhou no iPhone e viu **Amarelo-sol ao lado de Vermelho e Verde perto de
Amarelo**. O número estava certo e o resultado, errado: ΔE mede "quão
diferentes são duas cores", mas boa parte dessa diferença era de claridade,
e duas cores da mesma família continuam parecendo da mesma família.

A ordem nova é um **xadrez**. Cada cor tem um lado: *quente* (vermelho,
laranja, os amarelos, os verdes, marrom, bege, vinho — a família que o
daltonismo vermelho-verde confunde entre si) ou *frio* (azuis, roxo, lilás,
rosa, turquesa, verde-mar, cinza, branco, preto). Quente e frio se alternam
como casas de xadrez: nenhuma cor quente encosta em outra quente. É o eixo
amarelado/azulado, que essas visões preservam. A grade passou a ter 5 colunas
em toda tela (com 10 o xadrez não fecha).

| Item | Resultado | Prova |
|---|---|---|
| Cor quente só encosta em cor fria (lado, em cima, embaixo) | sim, nas 31 vizinhanças | teste |
| Menor diferença entre cores encostadas, na pior visão | ΔE 35,8 (piso do teste: 30) | teste |
| Menor diferença na diagonal (mesma família, tocam pelo canto) | ΔE 21,7 (piso: 20) | teste |

Limites: na **diagonal** ficam cores do mesmo lado — Vermelho toca Laranja e
Vinho pelo canto; Amarelo toca Laranja, Verde, Vinho e Verde-oliva. Com dez
cores de cada lado não há como evitar. A classificação quente/frio é minha,
por raciocínio, não por medida; o Verde-mar (frio) é o caso mais discutível.
E, de novo, **só o olho do Bruno diz se melhorou**: da outra vez o teste
também passava. A tabela abaixo é a da primeira ordem, mantida como registro.

### Visão de cores (N29)

| Item | Resultado | Prova |
|---|---|---|
| Toda cor tem nome, nenhum nome se repete, nenhum hex se repete | 92 cores, 92 nomes | teste (`cores.test.ts`) |
| Nenhuma cor da paleta encosta (ao lado, acima, abaixo) em outra parecida, para visão comum, protanopia, deuteranopia e tritanopia | menor diferença entre vizinhas: ΔE 33 (piso do teste: 25) | teste |
| O modelo reproduz a confusão real | vermelho × verde: ΔE 116 na visão comum, 7 na deuteranopia | teste |
| Tons vizinhos de um mesmo matiz continuam diferentes | sim; o par mais fraco é amarelo muito claro × amarelo claro na tritanopia (ΔE 5,9) | teste (piso 5) |
| A marca ✓ se lê sobre qualquer cor | contraste ≥ 4,5:1 nas 92 | teste |

Por que a ordem importa — pares que a ordem antiga (arco-íris) deixava
próximos, pela mesma medida (ΔE na pior visão; abaixo de ~10 confunde):
Rosa × Turquesa 4 · Azul-céu × Verde-mar 5 · Vermelho × Marrom 6 ·
Azul × Roxo 6 · Vermelho × Verde 7 · Vermelho × Verde-oliva 7 ·
Amarelo × Bege 7. Na ordem nova nenhum desses pares é vizinho.

**Limites, sem enfeite:**
- É simulação (Machado, Oliveira e Fernandes, 2009, dicromacia completa) e
  ΔE de 1976. É um modelo de engenharia, não um exame. Ninguém com
  daltonismo conferiu a paleta nova na tela — nem o Bruno (protanomalia) ainda.
- A vizinhança só é garantida nas duas grades que existem: 5 colunas (abaixo
  de 700 px) e 10 colunas. Se alguém mudar o CSS da grade, o teste não percebe:
  as colunas estão declaradas em `COLUNAS_PALETA` e no CSS, à mão, nos dois.
- A garantia é entre **cores-base**. Um tom claro de um matiz pode parecer o
  tom claro de outro (todos os "muito claros" tendem ao branco). Quem cobre
  isso é o nome escrito — por isso o nome é a peça principal, não a ordem.
- Escala de cinza (acromatopsia): não medido.
- A pintura já feita na tela não tem nome: só a cor escolhida tem. Uma
  criança daltônica não tem como perguntar "de que cor eu pintei o céu?".

### Baixa visão e contraste

| Item | Resultado | Prova |
|---|---|---|
| Nome da cor sobre o fundo | Claro 11,5:1 · Floresta 10,7:1 · Espaço 16,8:1 · Alto contraste 21:1 | medido 2026-11-11 |
| Texto do botão "Tons" sobre o cartão | 12,3:1 a 18,4:1 nos quatro temas | medido 2026-11-11 |
| Borda de todo poço (para o amarelo-claro e o branco não sumirem) | mesma cor do texto: ≥ 10,7:1 contra o fundo | medido 2026-11-11 |
| Nome da cor acompanha o A−/A+ | usa `em` | lido |

Não verificado: tema "Monte o seu" (as cores são derivadas; não medi as 120
combinações); temas próprios de livro; texto a 200% nesta tela (a tela de
pintar não tem A−/A+ na barra, e não testei com a letra já ampliada).

### Motora

| Item | Resultado | Prova |
|---|---|---|
| Alvo de toque dos poços | 52 × 52 px, 12 px de espaço (eram 44 e 10) | medido |
| Botões "Tons" e voz | 48 px de altura mínima | lido |
| Toque longo tem alternativa de um toque | botão "Tons" faz o mesmo | medido (os dois caminhos) |
| Nada com limite de tempo | o toque longo só *acrescenta* (abre os tons); quem não consegue segurar não perde nada | lido |

Não verificado: uso com acionador (switch), mouse de cabeça ou tremor.
O toque longo dispara em 450 ms — número escolhido, não testado com crianças.

### Leitor de tela e teclado

| Item | Como está | Prova |
|---|---|---|
| Cada poço tem nome | `aria-label` = nome da cor | medido (DOM) |
| Estado escolhido | `aria-pressed` nos poços e nas ferramentas | medido (DOM) |
| Troca de cor é anunciada | o nome é `role="status"` | lido |
| Pintar é anunciado | região viva: "Pintou de Azul-céu" | medido (DOM) |
| "Tons" | `aria-expanded` + `aria-controls`; ao abrir pelo botão o foco vai ao tom atual; `Esc` fecha e devolve o foco | medido (DOM) |
| Branco e Preto não têm tons | botão desabilitado, com rótulo que diz por quê | medido (DOM) |

**Não verificado — e é a maior lacuna desta tela:** nenhum leitor de tela
real (VoiceOver, TalkBack, NVDA) foi ligado. "Medido (DOM)" quer dizer que os
atributos estão certos, não que a experiência falada é boa. E o desenho em si
**não é operável por teclado nem por leitor de tela**: as regiões do SVG só
respondem a toque/clique. Uma criança cega não pinta neste app hoje.

### Fotossensibilidade, cognitiva, auditiva

- Nada novo pisca ou se move. A cor escolhida cresce sem animação.
- Controles sempre no mesmo lugar: ferramentas → nome da cor → tons → cores →
  "Pronto!". O nome tem largura mínima para o botão "Tons" não pular.
- Voz é opcional e nunca a única via: o nome está sempre escrito.
  Desligada por padrão para não brigar com o leitor de tela.

### Alto contraste do sistema (`forced-colors`)

Os poços e a amostra têm `forced-color-adjust: none` — sem isso o Windows
apagaria justamente a cor. **Lido, não medido:** não liguei o modo de alto
contraste do Windows para conferir. O desenho (SVG) também não foi conferido
nesse modo.

### Só um iPhone de verdade confirma

1. O nome aparece ao tocar (era o defeito de origem).
2. O toque longo abre os tons **sem** abrir o menu/lupa de seleção do iOS
   (usei `-webkit-touch-callout: none` e `user-select: none`).
3. A voz fala ao tocar na cor. O iOS só libera voz dentro de um gesto; a fala
   sai 120 ms depois do toque (contorno de um defeito do Chrome), e não sei
   se o Safari aceita esse atraso.
4. O ✓ e as bordas no brilho baixo / Night Shift.

---

## Espaço entre linhas e entre letras (F5 — 2026-11-11)

Onde: `src/telas/espacamento.ts` (tabela e conta), `preferencias.ts`
(aplicação), `telaAparencia.ts` (controles), `estilos.css` (bloco "prosa").

### Por quê

Quem tem **ceratocone** vê a mesma letra duplicada, e o fantasma de uma linha
cai sobre a linha de baixo: o espaço entre linhas é o que separa uma linha da
outra. Vale também para astigmatismo, baixa visão e dislexia. O app tinha
entrelinha fixa de 1,6, sem escolha, e nenhum controle de espaço entre letras.
Agora tem o mesmo modelo do app-leitura — mesmos ids, mesmos valores.

| Escolha (por perfil) | Opções | Padrão |
|---|---|---|
| Espaço entre as linhas | Bem juntas 1,2 · Juntas 1,4 · Normal 1,7 · Afastadas 2,2 | Normal 1,7 |
| Espaço entre as letras | Normal 0 · Afastadas 0,06em (palavra 0,18em) · Bem afastadas 0,12em (palavra 0,36em) | Normal |

Vale em toda prosa que a criança lê: história, pergunta/respostas/explicação
do quiz, o caderno de anotações e a prévia. Títulos e botões de comando não.

### O que foi medido

| Item | Resultado | Prova |
|---|---|---|
| As quatro entrelinhas chegam à tela | corpo 20px → 24 / 28 / 34 / 44px | medido (`getComputedStyle`, Chromium) |
| Os três espaços chegam à tela | corpo 20px → letra 0 / 1,2 / 2,4px; palavra 0 / 3,6 / 7,2px | medido |
| Quiz usa a mesma entrelinha da história | pergunta e alternativa: 20px / 34px | medido |
| Corpo e entrelinha em pixel inteiro do aparelho | todos os corpos de 12 a 180px × 4 entrelinhas × densidades 1 · 1,25 · 1,5 · 2 · 2,625 · 3; desvio máximo de meio pixel do aparelho | teste (`espacamento.test.ts`) |
| O encaixe reage à troca de densidade | com densidade forçada a 1,25 a entrelinha foi a 34,4px (= 43 pixels do aparelho) | medido, com `devicePixelRatio` simulado |
| Letras por linha, tela larga, espaço normal | OpenDyslexic 56–63 · Cardo 56–63 · Atkinson 69–75 | medido (contando caractere por linha) |
| Idem, "bem afastadas" | OpenDyslexic 41–47 · Atkinson 46–54 · Cardo 37–44 | medido |
| Sem rolagem de lado em 390px, "bem afastadas" | limpo até corpo 47px (235% do padrão) | medido |
| Mudar a letra no meio da leitura não perde o lugar | 3 toques no A+ (20 → 29px): o bloco do alto ficou a 1px de onde estava | medido |
| Grego politônico na entrelinha "bem juntas" | sinais de cima e de baixo não se encostam | olhado numa captura, com texto de teste |
| Escolhas persistem por perfil | chaves `<perfil>:entrelinha` e `<perfil>:espacamento` | medido |

A coluna de leitura deixou de ser 760px fixos: é `52ch`, medida em letras,
com piso de 30rem. Antes, com a letra grande, a linha encolhia para poucas
palavras; agora o número de letras por linha fica estável.

**Limites, sem enfeite:**
- **A grade de pixels só foi vista em densidade 1.** O teste prova a conta
  para as outras densidades e a simulação prova que o código reage; mas
  ninguém olhou um iPhone (densidade 3) para ver se as faixas de linhas mais
  grossas e mais finas sumiram. O plano pedia Chromium em densidade 1, 2 e 3:
  não havia Playwright instalado no projeto, e não baixei.
- O `ch` mede o zero de cada fonte, e as três têm zeros de largura diferente
  para letras de largura diferente: por isso a Atkinson chega a 75 letras por
  linha e a Cardo com letras bem afastadas cai para 37 (abaixo dos 45 que se
  costuma recomendar). É o preço de uma régua só para três fontes.
- Acima de corpo 68px (340%) a página rola de lado em 390px — por causa de
  títulos e botões, não da prosa. Já era assim.
- A linha que tem grego abre um pouco mais que as outras na entrelinha "bem
  juntas" (o grego é 12% maior e ganhou piso próprio de 1,2). Nessa
  combinação o ritmo de linhas não é perfeitamente igual. Escolha consciente:
  sinal legível vale mais que grade perfeita.
- **Ninguém com ceratocone, astigmatismo ou dislexia testou.** Os valores
  vêm do app-leitura e do que o Bruno defende; a adequação para crianças de 7
  anos não foi medida com crianças.
- Peso do traço (Fina/Média/Grossa do app-leitura) não foi portado.
- O texto justificado: não há nenhum no app (lido no CSS).

### Só um iPhone de verdade confirma

1. Linhas de um parágrafo longo com a mesma espessura de traço (sem faixas).
2. A+ no meio da leitura mantém o lugar com a barra do Safari aparecendo e
   sumindo.

---

## Imprimir e lupa (F2 — 2026-11-11)

Onde: `src/impressao/motorImpressao.ts`, `src/impressao/folhaPintada.ts`,
`src/canvas/zoomPinca.ts`, `src/telas/telaColorir.ts`.

### O que mudou e por quê

| Antes | Agora |
|---|---|
| Imprimir chamava `print()` de um iframe escondido — no iPhone, nada acontecia. | A folha é montada no próprio documento e vale o `window.print()` comum. |
| Só contorno preto e branco. | Pergunta antes: "Só o contorno, para pintar no papel" ou "Do jeito que eu pintei". |
| A lupa só *voltava* a 1×; sem pinça antes, não fazia nada. No computador não havia zoom. | Um toque amplia (1× → 2× → 3× → 1×), com o número escrito no botão. |
| Zoom e arrasto só com dois dedos. | Tudo o que a pinça faz tem caminho de um toque ou de teclado. |

### Motora: nenhum gesto sem alternativa

| Gesto | Alternativa de um toque | Teclado |
|---|---|---|
| Pinça para ampliar | botão da lupa | `+` `−` `0`, Ctrl+roda |
| Dois dedos para andar pela arte | quatro setas, que só aparecem com zoom | setas do teclado |
| Toque longo para tons (F1) | botão "Tons" | `Tab` + `Enter` |

Menor alvo de toque entre ferramentas, setas e opções de impressão: 52 px
(medido em 390×844).

### O que foi verificado

| Item | Resultado | Prova |
|---|---|---|
| Folha pintada: cores nas regiões certas, ids intactos, contorno por cima, traços no meio | sim | teste (`folhaPintada.test.ts`, 8 casos) |
| Só hex vira cor na folha (o valor vem do armazenamento) | texto estranho é ignorado | teste |
| Impressão real, cena só contorno | 1 página A4 paisagem | PDF gerado pelo Chromium sem janela |
| Impressão real, cena pintada (balde + pincel + borracha) | 1 página A4 paisagem; céu, traços e o vão da borracha conferidos | PDF, olhado |
| Impressão real, ficha de alfabeto pintada | 1 página A4 retrato; legendas legíveis por cima da cor | PDF, olhado |
| Impressão real, caderno de 3 fichas | 3 páginas A4 retrato | PDF |
| O app que está na tela não sai no papel | página de teste com 3000 px de conteúdo: 1 página só | PDF |
| Lupa, setas, teclas e Ctrl+roda mudam o zoom | 1× → 2× → 3× → 4× → 1×; 1,2× na roda | medido (DOM) |
| Sem rolagem de lado em 390 px com tudo aberto | sim | medido |
| Leitor de tela | lupa diz o aumento; impressão tem `aria-expanded`, foco vai à primeira opção, `Esc` fecha e devolve o foco | medido (DOM) |

**O que o iPhone do Bruno mostrou (2026-11-11, à noite):**
- A folha de impressão do iOS **abre** — a troca do iframe pelo documento
  principal funcionou.
- Mas o que saía no papel era **a tela do app**, não o desenho. Causa
  provável: no iOS o `print()` volta na hora e o `afterprint` dispara antes
  de a prévia ser desenhada; a limpeza que eu tinha posto no `afterprint`
  removia a folha cedo demais. Nenhum teste meu pegou isso: no Chromium o
  `print()` espera o diálogo fechar. Corrigido (a folha agora fica até a
  próxima impressão) — **e esse conserto também ainda não voltou ao iPhone.**
- O iOS ignora o `@page` inteiro: nem orientação nem margem. A folha vem
  em pé e com as margens do iOS, maiores. Segundo teste do Bruno (após a
  correção acima, o desenho já saía): a cena deitada quebrava em duas páginas
  com a folha em pé, e a ficha de alfabeto transbordava — reduzindo a 87% na
  mão, cabia. Corrigido: no iOS as medidas fixas saem a 86%
  (`fatorDoPapel`), e a cena deitada passa a ter a largura da página, cabendo
  em pé (menor) ou deitada. Conferido em PDF no computador **imitando** o
  papel do iPhone (margens de 30mm): cena em pé 1 página, cena deitada 1
  página, 2 fichas 2 páginas. As margens reais do iOS eu não sei: os 86% vêm
  só da observação dos 87%. **Falta voltar ao iPhone.**

**Limites, sem enfeite:**
- Os PDFs saíram de uma página de teste que chama as mesmas funções do app,
  com o `print()` trocado por um marcador; não cliquei no botão dentro do
  diálogo de impressão do Windows nem de nenhum celular.
- Firefox e Safari de computador: não testados.
- Impressão em preto e branco de uma folha pintada (impressora sem cor):
  cores de mesma claridade viram o mesmo cinza. Não medi nem tratei.
- A pinça de dois dedos no iOS continua como estava: não testada aqui.
- As teclas `+ − 0` e as setas valem na tela de pintar inteira; não testei
  conflito com leitor de tela (que também usa setas).
- O caderno *inteiro* pintado não existe: "do jeito que pintei" vale para a
  folha que está aberta.

### Só um iPhone de verdade confirma

1. Tocar em 🖨️ e escolher uma opção abre a folha de impressão do iOS —
   no Safari **e** no app instalado na tela inicial.
2. A folha sai em A4, uma página, com as cores (AirPrint ou "Salvar em PDF").
3. A primeira impressão de cena espera a fonte carregar (até 1,5 s): se o iOS
   recusar por estar longe do toque, a segunda tentativa deve funcionar — e
   aí é um defeito a consertar, avisar.
4. Pinça de dois dedos amplia e arrasta; a lupa mostra o número certo.

Se o item 1 falhar, o plano B do plano é abrir a folha numa aba nova e
imprimir de lá. Não foi construído.

---

## Estante em pastas e painel lateral (F3 — 2026-11-11)

Onde: `src/conteudo/pastas.ts`, `src/telas/painelLateral.ts`,
`src/telas/telaEstante.ts`, `src/telas/comum.ts` (avatar), `src/main.ts`.

### O que mudou e por quê

| Antes | Agora |
|---|---|
| 31 cartões numa grade só; achar o Alfabeto era rolar a página inteira. | Cada livro mora numa pasta; a estante mostra uma pasta por vez, em seções. |
| O avatar da barra ia direto para a troca de perfil. | O avatar abre um menu lateral: pastas, anotações, trocar de perfil. |
| Do meio de um livro, o caminho até as anotações era voltar, voltar, rolar. | Dois toques de qualquer tela: avatar → destino. |

Carga cognitiva: a estante abre com 3 botões de pasta sempre no mesmo lugar
e seções com título, em vez de 31 cartões sem ordem aparente.

### O que foi verificado

| Item | Resultado | Prova |
|---|---|---|
| Todo livro do catálogo está numa pasta, e numa só; nenhum some | 30 livros | teste (`pastas.test.ts`) |
| Livro novo sem pasta não desaparece | cai em "Clássicos" | teste |
| A barra do topo não ganhou botão nem segunda linha | 75 px de altura em 390 px e em 1280 px, como antes | medido |
| Alfabetos e Anotações em 2 toques, a partir da tela de pintar | avatar → item | medido (percurso feito por script) |
| Trocar de perfil pelo menu, sem trava | chega à tela de perfis | medido |
| A pasta aberta por último é lembrada por perfil | saiu e voltou: reabriu em "Clássicos" | medido |
| Sem rolagem de lado, 390 px e 1280 px, com menu aberto e fixo | sim | medido |
| Menor alvo de toque dentro do menu | 46 px | medido |
| Gaveta: `role="dialog"`, `aria-modal`, foco entra no item atual | sim | medido (DOM) |
| `Esc`, ✕ e toque fora fecham; o foco volta ao avatar | sim | medido (DOM) |
| Avatar: `aria-expanded`, `aria-controls`, `aria-haspopup` | sim | medido (DOM) |
| Árvore: `role="tree"`/`treeitem`, `aria-level`, setas ↑ ↓ Home End | sim | medido (DOM) |
| Onde estou: `aria-current="page"` + borda + barra à esquerda | sim (forma, não só cor) | medido |
| Menu fixo (📌): só em tela ≥ 1200 px; conteúdo abre espaço; o desenho de pintar continua inteiro (860 px) | sim | medido em 1280 px |

**Refeito no mesmo dia, a pedido do Bruno:** o menu virou árvore de pastas
de verdade, como a do Pedra Angular. Tocar numa pasta a abre ali mesmo (▸
vira ▾, `aria-expanded`), tocar de novo recolhe; desce-se até o livro, e é o
toque no livro que abre. O caminho até onde a criança está fica aberto e
marcado. Teclado: ↑ ↓ andam, → abre, ← recolhe ou sobe, Home/End. Medido
(DOM): Alfabetos → O Alfabeto Grego abre o livro em 3 toques a partir de
qualquer tela; o foco fica na pasta tocada. Custo assumido: pelo menu, um
livro fica a 3 ou 4 toques (avatar → pasta → coleção → livro), não 2 — as
pastas da estante continuam a 1 toque pelos botões do alto.

**Limites, sem enfeite:**
- Nenhum leitor de tela real. Uma árvore (`role="tree"`) é dos padrões que
  os leitores tratam de formas mais diferentes entre si; os atributos estão
  certos, a experiência falada não foi ouvida.
- O foco preso na gaveta foi lido no código, não exercitado com `Tab` real.
- A gaveta não tem animação: aparece e some. É de propósito (movimento
  reduzido sem precisar de exceção), mas ninguém avaliou se a criança
  entende de onde ela veio.
- O avatar mudou de função: quem estava acostumado a tocar nele para trocar
  de perfil agora encontra um menu. Theo e Davi não foram avisados nem
  observados.
- Com o menu fixo e a janela entre 1200 e ~1250 px, a tela de pintar fica
  justa; abaixo de 1200 o menu fixo vira gaveta sozinho.
- Contraste do menu nos temas: usa as mesmas variáveis do resto (texto sobre
  cartão, medido na F1 entre 12:1 e 18:1); o texto suave do contador de
  livros não foi medido.
- Tema "Monte o seu" e temas de livro: não conferidos no menu.

---

## Os Números (F4 — 2026-11-12)

Onde: `src/conteudo/numeroArte.ts` (desenho), `src/conteudo/numeros.ts`
(livro), pasta "Números" em `pastas.ts`. Vinte folhas A4: todos de zero a
dez numa folha; uma folha por número (0 a 10); de dez em dez até cem;
romanos; relógio romano; juntar, tirar, grupos iguais, repartir; tabuada.

### Decisões de acessibilidade

- **Zero sem corte.** A fonte das legendas (Atkinson Hyperlegible) desenha o
  zero com um risco no meio, para não confundir com a letra O — bom em código,
  ruim numa folha que ensina o zero a uma criança de 7 anos. Nas folhas de
  Números todo algarismo vem da Cardo, e os títulos vão por extenso.
- **Sem certo e errado.** A caixa da resposta fica vazia; a folha não corrige.
  Quem confere é a criança, contando ou pulando na reta (princípio 4).
- **Quantidade antes do símbolo.** Toda conta aparece em bolinhas que se
  podem contar; o algarismo vem junto, nunca sozinho.
- **Mais de um jeito de participar** em cada folha: pintar, apontar, contar
  em voz alta, riscar, desenhar, escrever.
- **Os sinais (+ − × ÷ =) são desenhados**, com traço grosso e nome falado
  (`aria-label`: "mais", "menos"…), sem depender de fonte.
- **Mesma estrutura em todas as folhas de operação**: três contas, a reta, um
  convite para inventar. A criança aprende o caminho uma vez.

### O que foi verificado

| Item | Resultado | Prova |
|---|---|---|
| Vinte folhas, A4, só preto e branco, sem `<text>`, ids de região únicos | sim | teste (`numeroArte.test.ts`) |
| Bolinhas do quadro de dez = o número, de 0 a 10 | sim | teste |
| Nenhum título de folha com algarismo | sim | teste |
| As contas cabem na reta de zero a dez | sim | teste |
| Cada folha desenhada e **olhada** | 3, 0, 10 e as nove folhas que não são "um número" | PNG pelo Chromium sem janela |
| No app: pasta Números, livro com 20 seções e 20 desenhos, pintura por toque | sim, em 390×844, sem rolagem de lado | medido |

**Limites, sem enfeite:**
- As folhas do 1, 2, 4, 5, 6, 7, 8 e 9 **não foram olhadas uma a uma** —
  saem do mesmo molde das três que olhei, mas "mesmo molde" não é "olhei".
- Nenhuma folha foi impressa em papel nem usada por criança ou professora.
- Na tabuada, o número de cada casa é preto: pintando a casa de cor escura,
  o número some. Nas folhas de alfabeto as letras são vazadas; aqui, com cem
  casas, deixei cheio para caber e ler. É uma perda real para quem pinta escuro.
- Os algarismos da Cardo são serifados; para algumas crianças com dislexia
  ou baixa visão um algarismo sem serifa lê melhor. Escolhi a Cardo por causa
  do zero cortado da Atkinson. A OpenDyslexic não foi testada nas folhas.
- O "1" da Cardo tem bandeirinha e pé, diferente do pauzinho que muitas
  crianças aprendem a escrever; o "4" é fechado. Não tratei.
- Leitor de tela: cada legenda tem `aria-label`, mas a folha como um todo é
  um desenho — uma criança cega não faz estas atividades pelo app.
- Relógio: optei por IV (e não IIII, que muitos relógios usam) para bater com
  a regra da folha de romanos.
- A tabuada pesa cerca de 425 KB como SVG na memória (não no pacote: as
  folhas são geradas na hora). Em aparelho fraco não medi.

---

## Retoques depois da publicação (2026-11-12)

Vieram do Bruno usando o site no iPhone.

| O que ele viu | O que era | O que foi feito | Prova |
|---|---|---|---|
| No app INSTALADO, imprimir não abre nada (no Safari abre, e numa página só) | Num app instalado o iOS ignora o `print()`, sem erro | A folha vira imagem PNG e sai pelo compartilhar do aparelho, que tem "Imprimir" e "Salvar imagem". Dois toques: preparar, depois entregar | simulado no computador (aparelho e modo instalado fingidos, compartilhar trocado por um marcador): PNG de 2339×1754 entregue. **No iPhone: não testado** |
| Risco atravessando as bolinhas da reta, só depois de abrir para pintar | A linha passava por baixo das casinhas; na estante o branco a escondia, mas ao pintar e no papel o contorno fica sem preenchimento | A linha agora é feita de pedaços entre as casinhas | teste |
| Perguntas e respostas sem voz | Só os parágrafos tinham 🔊 | 🔊 na pergunta (lê pergunta e opções, sem dizer a certa) e na explicação | medido (DOM); **não ouvi** |
| Lupa parava em 3×, pinça ia a 4× e a lupa não trazia de volta | O teto diferente era erro meu. O "não volta" **não reproduzi** | Lupa vai a 4× como a pinça; todo comando que não é pinça limpa os dedos guardados; o soltar do dedo é ouvido também fora do desenho | medido no computador; a causa no iPhone é palpite |

**Limites, sem enfeite:**
- O caminho do app instalado é o que tem mais chance de surpresa: depende
  de o iOS aceitar o compartilhar de arquivo dentro do toque, e de desenhar
  um SVG com imagem embutida (os traços do pincel) num canvas. Nada disso
  rodou num iPhone.
- No app instalado o caderno completo (46 folhas do alfabeto, 20 dos
  números) não sai: acima de 12 folhas o app avisa e manda imprimir pelo
  Safari. Uma folha de cada vez funciona.
- A imagem compartilhada não tem o título da história escrito (a folha
  impressa pelo Safari tem).
- A voz do quiz diz "Primeira… Segunda…": não testei se soa natural, nem
  com perguntas de mais de três opções.

---

## Pintar por partes, peso da letra e cópia de segurança (2026-11-12)

### Pintar por partes — o desenho deixou de exigir toque fino

Era a maior lacuna registrada neste arquivo: as regiões do desenho só
respondiam a toque ou clique no lugar exato. Agora, além do toque (que
continua igual), o botão 📋 abre "Escolha uma parte e pinte": ← e → andam
pelas partes, uma lista (`<select>` do sistema) pula direto para qualquer
uma, e "Pintar de <cor>" pinta. A parte escolhida fica com o contorno
grosso e tracejado no desenho, com halo branco.

| Item | Resultado | Prova |
|---|---|---|
| Toda região do desenho está na lista, na ordem do desenho | 33 de 33 na Lebre | medido |
| Pintar pelo botão dá o mesmo resultado do toque (cor, salvar, desfazer) | sim: é a mesma função | medido |
| O toque no desenho continua funcionando com a lista aberta | sim | medido |
| Diz a cor que a parte TEM agora ("Agora está: Verde") | sim — fecha a lacuna "a pintura feita não tem nome" | medido |
| Leitor de tela: anuncia "3 de 33: nuvem. Está Branco." e "Pintou de Verde" | região viva | medido (DOM) |
| Só teclado: abrir, escolher, pintar, `Esc` fecha e devolve o foco | sim | medido (DOM) |
| No celular o desenho volta à vista ao trocar de parte | sim, em 390×844 | medido |
| Alvos | setas 56 px, lista 52 px, botão 56 px | lido no CSS |

**Limites, sem enfeite:**
- **Os nomes são pobres na maior parte dos desenhos.** Só as cinco cenas
  antigas têm regiões com nome de coisa ("céu", "sol"). As 51 cenas das duas
  coleções usam `regiao-detalhe-012` → "detalhe 12", e as folhas de alfabeto e
  de números têm dezenas de "quadro 3", "casa 7". Para uma criança cega, "detalhe
  12" não diz nada: o recurso hoje serve bem a quem VÊ o destaque e não
  consegue tocar com precisão (motora, acionador, teclado), e serve mal a quem
  não vê. Dar nome a cada região é trabalho de revisão das ilustrações.
- Pincel e borracha continuam só por toque/arrasto.
- O destaque é fino em regiões pequenas ou encobertas (o tronco atrás da lebre).
- Nenhum leitor de tela real, nenhum acionador, nenhuma criança.

### Peso da letra

Fina (padrão) · Média · Grossa, por perfil, com os mesmos ids e valores do
app-leitura: contorno de 0,02 / 1 / 2 pixels **do aparelho**, na cor do texto,
aplicado à mesma prosa do espaçamento. Com isto o Historinhas tem os quatro
ajustes de leitura do app-leitura: corpo, entrelinha, espaço entre letras e peso.

| Item | Resultado | Prova |
|---|---|---|
| Mesmos ids e valores do app-leitura | sim | teste |
| Média e Grossa em pixel inteiro do aparelho, em seis densidades | sim | teste |
| Chega à tela e persiste por perfil | densidade 2: 0,01 / 0,5 / 1 px; chave `<perfil>:pesoTraco` | medido |

Limites: visto só nesta tela (densidade 2), não num iPhone; não medi o
contraste efetivo nem se a Grossa "entope" a OpenDyslexic, que já é pesada;
o `-webkit-text-stroke` não existe em impressão de alguns navegadores (não
afeta as folhas, que são desenho).

### Cópia de segurança

Ajustes (atrás da trava dos adultos) → "Guardar uma cópia" grava tudo num
arquivo `.json`; "Trazer de uma cópia…" troca o que há no aparelho pelo
arquivo, depois de mostrar a data e os perfis da cópia e pedir confirmação —
com o foco no "Deixar como está".

| Item | Resultado | Prova |
|---|---|---|
| O que sai é o que volta | 18 itens, idênticos byte a byte | medido (ida e volta no navegador) e teste |
| Arquivo que não é cópia, de versão futura ou com chave estranha é recusado | sim, com mensagem em português | teste |
| Não toca em dados de outros sites/apps do navegador | sim | medido |

Limites: é **troca**, não mistura (os perfis são numerados por aparelho);
não há como trazer um perfil só. No celular a entrega é pelo compartilhar —
não testado em iPhone nem Android. A tela de Ajustes em si não cliquei (fica
atrás da conta de multiplicar): testei as funções que os botões chamam.

---

## Guia de quem ensina, realce da leitura e régua (2026-11-12)

### Guia de quem ensina

Ajustes (área dos adultos) → "📖 Guia de quem ensina": treze assuntos, com
índice, na mesma coluna de leitura do app (tamanho, espaço e peso valem), e
"Imprimir o guia". É onde mora a explicação do ceratocone, do daltonismo e
dos outros porquês — fora da tela da criança.

| Item | Resultado | Prova |
|---|---|---|
| Cobre cada recurso de acesso do app | sim | teste (`guia.test.ts`) |
| Diz o que não foi testado; não promete cura nem diagnóstico | sim | teste |
| Abre, pula pelo índice (o foco vai ao título), volta aos Ajustes | sim, 390×844, sem rolagem de lado | medido |
| Imprime | 5 páginas A4 | PDF pelo Chromium sem janela |

Limites: **o texto é meu, não passou por professora nem por profissional de
saúde ou de visão** — as frases sobre ceratocone, astigmatismo e dislexia
repetem o argumento do Bruno com cautela ("costuma", "ajuda quem"), e o guia
diz que não substitui avaliação. No PDF de teste a fonte saiu a de reserva
(Arial), não a Atkinson. No app instalado do iPhone o guia não imprime (o
caminho de lá só sabe entregar desenhos): pede o Safari.

### Realce do que a voz está lendo

Enquanto o 🔊 fala, o trecho fica marcado: as palavras em preto sobre
amarelo com sublinhado, e uma barra à esquerda do bloco.

| Item | Resultado | Prova |
|---|---|---|
| O realce acompanha a voz, frase a frase, e some no fim | sim | medido, com a voz trocada por um marcador |
| Contraste do trecho marcado | preto sobre #ffe066: 15,9:1, igual em todos os temas | calculado |
| Não é só cor | sublinhado nas palavras + barra no bloco | lido |
| Sem movimento | o realce pula; a tela só rola se o trecho saiu da vista | lido |

Limites: **não ouvi nada** — a voz foi simulada, então a sincronia real
(a voz do aparelho pode atrasar ou adiantar em relação ao aviso) não foi
conferida. O realce é por frase ou grupo de frases (até ~180 letras), não
palavra por palavra. Quando um pedaço atravessa dois parágrafos, só a
primeira frase é marcada. Com narração gravada (`narracao`) não há realce.
Precisa da API de realce do navegador (Safari 17.2+, Chrome 105+); sem ela
fica só a barra no bloco.

### Régua de leitura

Botão "📏 Régua" no alto de cada livro, guardado por perfil: escurece a
tela e deixa clara uma faixa de duas linhas e meia (acompanha o tamanho e a
entrelinha escolhidos). Parada a um terço da tela; com mouse segue o ponteiro.

| Item | Resultado | Prova |
|---|---|---|
| Faixa = 2,5 linhas | 110 px com entrelinha de 44 px | medido |
| Não bloqueia toque nem botões por baixo | `pointer-events: none` | medido |
| Persiste por perfil | `<perfil>:reguaLeitura` | medido |

Limites: a parte escurecida perde contraste de propósito (é o que a régua
faz) — não medi quanto, e num tema escuro o efeito é fraco: lá quem marca a
faixa são as duas linhas de borda. No celular a faixa não se move; não
testei se um terço da tela é a altura boa para uma criança. Não é
anunciada ao leitor de tela (é só visual).

---

## PDF no app instalado, Minhas pinturas, mais Números (2026-11-12)

- **PDF de verdade no app instalado do iPhone.** As folhas viram um PDF
  montado no próprio aparelho (`src/impressao/pdf.ts`, escrito à mão, sem
  biblioteca) e saem pelo compartilhar — Arquivos, Drive, e-mail, impressora.
  O caderno completo passou a caber (até 60 folhas). Provas: teste do gerador
  (tabela de objetos, A4 em pé e deitado, imagem dentro das margens, JPEG
  intacto); um PDF de três páginas aberto num leitor de PDF de verdade; e o
  caderno de 20 folhas dos Números gerado no navegador em 2 s, 6,1 MB, com
  aparelho e modo instalado fingidos. **No iPhone: não testado.** O PDF é
  feito de imagens: não tem texto selecionável nem lido por leitor de tela.
- **Minhas pinturas** (aba na estante e item do menu): tudo o que o perfil
  pintou, com miniatura fiel (cores, pincel, borracha); tocar continua a
  pintura e o "voltar" devolve à galeria. Cada cartão é um botão com nome
  ("Continuar a pintura: O Corvo e o Jarro · desenho 2 de 2"); o desenho é
  marcado como enfeite, porque não tem descrição do que mostra. Sem ordem por
  data (o app não guarda quando se pintou). Não há como apagar uma pintura
  pela galeria.
- **Números de onze a vinte** (dois quadros de dez: "dez e mais dois") e
  **uma folha por tabuada** (linha k com k bolinhas, cada uma valendo n). O
  livro passou a ter 40 folhas. Olhadas em imagem: a do 12 e a tabuada do 3;
  as outras dezoito saem do mesmo molde e NÃO foram olhadas. O traçado de
  algarismos (pontilhado) não foi feito.

## Auditoria automática (axe-core 4.14, 2026-11-12)

Rodei o axe-core, com as regras padrão (WCAG A e AA e boas práticas), em dez
telas, em 390×844, tema Claro: perfis, trava dos adultos, ajustes, guia,
estante, menu aberto, minhas pinturas, leitura com quiz respondido, pintar
(com tons e partes abertos) e aparência.

| O que o axe achou | Onde | Conserto |
|---|---|---|
| Página sem região principal; conteúdo fora de marcos | todas | o `#app` virou `<main>` |
| Nome falado não contém o texto visível ("A−", "A+") — atrapalha controle por voz | barra do alto | nomes viraram "A−: diminuir a letra" e "A+: aumentar a letra" |
| Ordem de títulos quebrada (h3 antes de h2) | aparência | a amostra de título virou parágrafo |
| `<aside>` com papel de diálogo | menu | virou `<div>`: diálogo na gaveta, navegação quando fixo |
| Tela sem título de nível 1 | trava dos adultos | o título virou `<h1>` |

Depois dos consertos: **nenhuma violação nas dez telas** (entre 17 e 35
regras aprovadas por tela).

**O que isso NÃO quer dizer.** Ferramenta automática pega uma parte pequena
dos problemas de acessibilidade — a que dá para decidir sem gente. Não diz
se a ordem do foco faz sentido, se os nomes ajudam, se o app é usável de
ouvido. Ficou de fora da medição: os outros temas (Floresta, Espaço, Alto
contraste, "Monte o seu") e os temas de livro; tela larga; os desenhos por
dentro (SVG); quebra-cabeça, abertura cênica e anotações. O axe-core é
dependência de desenvolvimento: não entra no pacote do app, e não há ainda
um comando que o rode sozinho — rodei à mão, no painel do navegador.

**Leitor de tela de verdade: continua não feito.** Eu não tenho como ligar o
VoiceOver nem o TalkBack. É o item que só uma pessoa faz, de preferência
alguém que usa leitor de tela no dia a dia. Roteiro sugerido para o Bruno,
no iPhone (Ajustes → Acessibilidade → VoiceOver): (1) criar um perfil;
(2) achar e abrir "A Lebre e a Tartaruga" pelo menu do avatar; (3) ouvir um
parágrafo e responder a pergunta; (4) abrir o desenho, escolher uma parte
pela lista e pintar; (5) mudar o espaço entre as linhas em Aparência.
Anotar onde travou, onde o que se ouve não diz o que é, e onde o foco some.

---

## Títulos recolhíveis, régua em três jeitos, cores do "Monte o seu" (2026-11-12)

Pedidos do Bruno depois de usar a branch.

### Títulos `##` que abrem e recolhem

Como no Pedra Angular: o título de nível 2 é um botão (▸ fechado, ▾ aberto,
`aria-expanded`); o conteúdo recolhido some também para o leitor de tela e
para o Tab; no fim da seção aberta há um "▴ Recolher", que devolve o foco ao
título. Nos livros as seções começam abertas; **o Guia de quem ensina começa
todo fechado** — a lista de títulos é o sumário, e saiu o índice que rolava a
página. Medido: 40 seções em Os Números, 13 no guia; perguntas finais e
rodapé ficam fora das seções; o "você parou aqui" e a voz abrem a seção
fechada em que caem. Limites: livros sem `##` (A Lebre e a Tartaruga) não
mudam; não há "abrir tudo / fechar tudo"; o estado não é lembrado ao voltar.

### Realce em "Ouvir a história"

O realce só funcionava no 🔊 de cada parágrafo. No "Ouvir a história" a voz
juntava o fim de um parágrafo com o começo do seguinte numa fala só, e o
realce não tinha onde marcá-la. Agora a voz recebe o texto em blocos e nunca
atravessa de um para outro. Medido com a voz simulada: 12 falas na Lebre, 12
realçadas, do título ao último parágrafo. **Não ouvido com voz de verdade.**

### Régua de leitura: três jeitos

O botão 📏 anda por: sem régua → parada (a um terço da tela) → seguindo o
mouse → sem régua. Seguir o mouse era automático e incomodava; agora é
escolha. Em tela de toque só há os dois primeiros. Prova: teste da ordem dos
jeitos; a régua parada medida no navegador. O "segue o mouse" depois da
mudança não foi exercitado com mouse de verdade (o painel de teste estava
como celular).

### "Monte o seu": fundo e cor favorita com nome, xadrez e tons

Eram bolinhas sem nome (para o leitor de tela, "Fundo #fff6ec"), com cores
parecidas lado a lado — o mesmo defeito que a pintura tinha. Agora usam o
mesmo seletor: nome escrito, grade em xadrez, botão "Tons", ✓ na escolhida,
e a voz das cores, se o perfil a ligou.

| Item | Resultado | Prova |
|---|---|---|
| No FUNDO só entram tons em que a letra tem contraste ≥ 7:1 | 60 dos 92 tons; toda cor tem pelo menos um | teste (`cores.test.ts`) |
| Nenhuma combinação oferecida fica ilegível: texto ≥ 7, título ≥ 4,5, letra do botão ≥ 4,5, texto suave ≥ 4,5 | todas as 5.520 combinações de fundo × favorita (60 × 92) | teste (`temaDerivado.test.ts`) |
| Temas feitos com as cores antigas continuam legíveis | as 120 combinações antigas | teste |
| axe-core na Aparência, com tons abertos | nenhuma violação | medido |

O que mudou para quem já tinha tema próprio: a cor favorita pode sair um
pouco mais escura ou mais clara nos BOTÕES do que a escolhida, porque agora é
ajustada até a letra do botão se ler (antes só o título era ajustado). A
conta do tema foi para `src/telas/temaDerivado.ts`.

Limites: ao tocar numa cor para fundo, o app escolhe sozinho o tom dela que
serve (um vermelho vira "Vermelho muito claro" ou "muito escuro") — pode
surpreender; o nome escrito diz o que ficou. A tela de pintar e a Aparência
têm cada uma a sua montagem do seletor (mesmos dados, código repetido).

Outros dois achados do axe nesta rodada, consertados: o texto de ajuda
"suave" podia cair abaixo de 4,5:1 num tema próprio; e as letras e números
das folhas tinham `aria-label` num `<g>` sem papel (291 ocorrências numa
tela) — ganharam `role="img"`.

---

## Minhas anotações como "Meus arquivos" do Pedra Angular (2026-11-12, noite)

Pedido do Bruno: igualar as anotações aos textos próprios do app-leitura e
trocar textos entre os dois apps.

**O que existe agora.** Na tela de anotações: pesquisar, ✨ Novo,
➕ Adicionar (.md e .txt, vários de uma vez, livros inteiros), ⇩ Exportar e
⇧ Importar. No menu lateral, "Minhas anotações" é pasta que abre ali mesmo
com cada texto dentro, e um campo de pesquisa no alto acha livro, autor,
pasta e texto próprio. Um `.md` abre como livro (voz, realce, régua, espaço
entre linhas, títulos recolhíveis) com um botão "✏️ Editar"; anotação escrita
aqui e `.txt` continuam abrindo no editor cru, sem correção automática.

**Formato de troca: o do Pedra Angular.** Exportar gera o `.json` que o
app-leitura já sabe importar, sem mudar uma linha de lá. Importar aceita o
`.json` do Pedra Angular (de lá ou feito aqui) e pega só os textos. Nada é
gravado por cima: texto igual não duplica; mesmo id com conteúdo diferente
entra ao lado, como "título (cópia)".

**Onde moram os textos: IndexedDB**, não o localStorage. O localStorage tem
um teto de poucos MB por site (e já guarda perfis e pinturas); um livro em
`.md` passa de 1 MB. As anotações antigas passam sozinhas para o lugar novo
na primeira abertura; a chave antiga só é apagada depois. A cópia de
segurança de Ajustes passou à versão 2 e leva os textos; a versão 1 ainda se
traz.

| Item | Resultado | Prova |
|---|---|---|
| Ler um backup do Pedra Angular; exportar no formato dele; ida e volta | sim | teste (`textosProprios.test.ts`, 13 casos) |
| O Pedra Angular importa o que sai daqui | 4 de 4 textos, com o tipo certo (nota → .txt), sem mexer no tema de lá | **rodado no app-leitura local**, com a função `importBackup` dele; textos de teste apagados depois |
| Importar o mesmo arquivo duas vezes não duplica | "0 entraram, 2 já estavam" | medido |
| Arquivo que não é .md/.txt fica de fora, com aviso | sim | medido |
| Anotações antigas migram | sim, e a chave antiga some | medido |
| Cópia de segurança leva e devolve os textos | sim | medido e teste |
| Backup do Pedra Angular em Ajustes recebe o caminho certo | "…se trazem em Minhas anotações → Importar" | teste |
| axe-core: anotações, menu com a pasta aberta, menu com pesquisa, livro próprio, editor | nenhuma violação | medido |

Consertos que a auditoria pediu: nomes falados dos quatro botões passaram a
começar pelo texto visível ("Novo: …"); e um texto que começa em `##` pulava
do h1 para o h3 — agora o título mais alto de qualquer livro vira h2.

**Limites, sem enfeite:**
- **Só textos atravessam.** Tema, letra e posição de leitura de um app não
  vão para o outro (as chaves são diferentes e as escolhas têm sentidos
  diferentes). Pinturas e insígnias não existem no Pedra Angular.
- **O Pedra Angular → Historinhas foi testado com um `.json` montado no
  formato dele** (o mesmo de `src/lib/backup.ts` de lá), não com um backup
  baixado do app-leitura de verdade.
- **Livro grande não foi medido.** O IndexedDB aguenta; o que não sei é
  quanto tempo um livro de vários MB leva para abrir no celular (o leitor
  monta o livro inteiro de uma vez).
- Imagens do `.md` (`![](…)`, `{{img:…}}`) não vêm junto: o Pedra Angular
  também não as guarda nos textos próprios.
- A pesquisa do menu não procura DENTRO dos textos, só em título, autor e
  pasta — como a do Pedra Angular.
- Não há "excluir tudo de Minhas anotações" (o Pedra Angular tem); apaga-se
  uma por vez.
- Nada disto rodou num iPhone. O "Adicionar" no iPhone abre o app Arquivos.

---

## O que ainda não tem seção aqui

Estante, leitura, quiz, quebra-cabeça, anotações, impressão, perfis e
ajustes não foram auditados nesta rodada. Pendências já conhecidas:

- Feedback do quiz (✓/✗) não foi conferido em simulação de daltonismo.
- Tamanho da letra é gravado em px (ignora a letra configurada no aparelho).
