# Acessibilidade do Historinhas — o que foi medido, como, e o que não foi

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
| 14 cores em ordem de arco-íris, quebrando de linha conforme a largura. | 20 cores, cada uma com 5 tons (98 cores com nome), em **grade fixa** e numa ordem **medida**. |
| Cor escolhida = poço um pouco maior. | Cor escolhida = maior + borda grossa + marca ✓. |
| Sem voz. | Voz opcional por perfil ("Falar o nome das cores"), desligada por padrão. |

### Visão de cores (N29)

| Item | Resultado | Prova |
|---|---|---|
| Toda cor tem nome, nenhum nome se repete, nenhum hex se repete | 98 cores, 98 nomes | teste (`cores.test.ts`) |
| Nenhuma cor da paleta encosta (ao lado, acima, abaixo) em outra parecida, para visão comum, protanopia, deuteranopia e tritanopia | menor diferença entre vizinhas: ΔE 33 (piso do teste: 25) | teste |
| O modelo reproduz a confusão real | vermelho × verde: ΔE 116 na visão comum, 7 na deuteranopia | teste |
| Tons vizinhos de um mesmo matiz continuam diferentes | sim; o par mais fraco é amarelo muito claro × amarelo claro na tritanopia (ΔE 5,9) | teste (piso 5) |
| A marca ✓ se lê sobre qualquer cor | contraste ≥ 4,5:1 nas 98 | teste |

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

**Limites, sem enfeite:**
- **O iPhone não foi testado — e era o defeito de origem.** A troca de
  iframe por documento principal é uma *hipótese* bem fundada, não um
  conserto provado. Só o aparelho do Bruno diz.
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

## O que ainda não tem seção aqui

Estante, leitura, quiz, quebra-cabeça, anotações, impressão, perfis e
ajustes não foram auditados nesta rodada. Pendências já conhecidas:

- Poços de cor da tela Aparência ("Monte o seu") têm o código hex como nome
  para leitor de tela ("Fundo #fff6ec").
- Nenhuma auditoria automática (axe-core) foi rodada ainda.
- Feedback do quiz (✓/✗) não foi conferido em simulação de daltonismo.
- Tamanho da letra é gravado em px (ignora a letra configurada no aparelho).
