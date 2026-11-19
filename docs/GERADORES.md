# Geradores de folhas — `src/geradores/` (2026-11-16)

Branch `fable/ler-o-mundo-e-caa`. **Não publicado.** Motores puros com teste e
uma tela pronta, mas desligada (ver abaixo). Feito por Claude (Fable 5.2).

A ideia do Bruno: o app como uma caixa de brincadeiras e folhas para imprimir,
com muita variedade, tudo gerado na hora a partir de dados simples.

## A receita (seguir em todo gerador novo)

1. Função pura: dados simples entram, SVG A4 sai (viewBox 800 × 1131 com
   `data-folha-a4="true"`, que o `motorImpressao.ts` já imprime).
2. **Sem sorte.** A mesma entrada dá sempre a mesma folha. Onde é preciso
   embaralhar (caça-palavras), o embaralho nasce de uma semente tirada da
   própria lista; `semente: 1, 2, 3…` dá outras folhas com as mesmas palavras.
3. Modelo separado do desenho (`gerarX()` devolve dados; `svgXA4()` desenha),
   para a mesma brincadeira poder existir na tela um dia.
4. O que não coube volta em `fora`, com o motivo, em vez de sumir.
5. Texto sempre por `escrever()` de `comum.ts` (letra em caminhos, nunca lança,
   encolhe para caber). Símbolo que a letra não tem (√, ↓, emoji) é descartado
   em silêncio: escrever por extenso ("raiz de").
6. Medida real por `mm()`: a folha de 800 unidades sai com 190 mm de largura.

## O que existe

| Arquivo | O que faz |
|---|---|
| `comum.ts` | `mm`, semente e sorteador, `escrever`, `negrito`, `comHalo`, `folha` (com cabeçalho) e `folhaNua` |
| `cacaPalavras.ts` | `gerarCacaPalavras({ palavras, nivel, lado, semente })` + `svgCacaPalavrasA4(jogo, { titulo, gabarito })`. Níveis: fácil (→ ↓), médio (+ ↘), difícil (8 direções). Garante cada palavra uma vez só e nenhuma palavra feia formada por acaso |
| `cruzadinha.ts` | `gerarCruzadinha([{ palavra, dica }])` + `svgCruzadinhaA4`. Numeração de jornal; grade de até 15 casas |
| `papeis.ts` | `svgPautaA4` (`PAUTAS.comum / larga / ampliada / muitoAmpliada`), `svgCaligrafiaA4`, `svgQuadriculadoA4`, `svgMilimetradoA4`, `svgPontilhadoA4`, `svgReguasA4`, `svgPlanoCartesianoA4` (com `curva` e `respostas`), `bhaskara`, `passosBhaskara`, `svgCalendarioA4` (modelos `figura` e `anotar`), `svgCalendarioAnoA4`, `feriadosNacionais`, `pascoa` |
| `jogosDeMesa.ts` | `lerPecas` (palavra vira peça; ganha desenho se a prancha tiver), `svgMemoriaA4` (pares iguais ou de leitura, com folha de verso), `gerarDomino`/`svgDominoA4` (7 palavras = 28 pedras), `gerarBingo`/`svgBingoA4` (cartelas todas diferentes + fichas de chamar), `svgTabuleiroA4`, `svgPecasDamasA4`, `svgPecasXadrezA4` |
| `matematica.ts` | `lerHoras`, `svgRelogiosA4` (ler a hora ou marcar os ponteiros, com respostas), `svgRelogioDeMontarA4` (relógio grande com ponteiros de recortar), `svgRetasA4` (reta numérica, com retas para completar) |
| `pedido.ts`, `telaFolhas.ts`, `ligado.ts` | a tela (ver abaixo) |
| `silabario.ts` | `svgFamiliasA4` (BA BE BI BO BU, inteiras ou para completar), `svgSilabasMoveisA4` (monte a palavra: desenho + caixas + sílabas para recortar), `pecasDeSilabas` (peças de bingo e dominó de sílabas, sem desenho) |
| `logica.ts` | `gerarLabirinto` (labirinto perfeito por semente, 3 tamanhos, com caminho de resposta), `gerarSudoku` (4 × 4, 6 × 6 e de figuras, sempre com uma solução só) |
| `contas.ts` | `gerarContas` (as quatro operações, com ou sem "vai um"/"empresta", divisão exata à brasileira), `svgTabuadaA4`, `svgTabuaA4` (tábua de Pitágoras) |
| `recortar.ts` | material dourado, frações em barras (1 a 1/12) e em círculos, quadro de valor posicional, tangram — em mm de verdade |
| `sequencia.ts` | **sequência didática de um livro da estante** (2026-11-18): um caderno com a história para ler (na letra escolhida, com o crédito do texto), perguntas de compreensão (o quiz do livro + "Quem aparece na história?" + caixa "Do que você mais gostou?"), caça-palavras com o vocabulário (`sugerirPalavras`: as que mais se repetem, sem palavras de ligação; quem ensina troca), "O que aconteceu primeiro?" (`momentosDaHistoria`: a primeira frase de quatro parágrafos narrados, sem falas nem notas sobre o livro, mostrados na ordem fixa `EMBARALHO`), "Invente outro final", o desenho de pintar do próprio livro, e as respostas separadas no fim. Cada parte se liga e desliga. Serve aos 28 livros de história (não aos alfabetos e números) |
| `capas.ts` | capas no estilo das da Oficina: com moldura (caderno, apostila), trabalho escolar no modelo ABNT, tópico com lista de leituras. Sem colofão nem "Pedra Angular" |
| `ornamentos.ts` | molduras: meandro grego, filete duplo, pontinhos, sem moldura. Aberto para outros (um nome em `ORNAMENTOS`, um `case` em `moldura()`). **O meandro é a fórmula de `app-leitura/src/components/GregaMeandro.tsx`** (célula 14 × 16, base corrida), montada como no Gerador: o quadro nasce da grade, as deitadas de ponta a ponta, a base voltada para o texto. Mudou lá, muda aqui (N56); o teste guarda a célula |
| `rotina.ts` | **rotina visual**: lista do dia (hora, desenho, palavra, caixa de "feito"), passo a passo para a parede (numerado, 4, 6 ou 9 por folha), cartões de 60 mm para recortar e usar com velcro, quadro "primeiro → depois". Modelos prontos: manhã de escola, tarde, noite, dia na escola, como lavar as mãos, como escovar os dentes. O desenho sai da frase ou da palavra mais longa que tenha desenho (`figuraDoPasso`, com sinônimos: jantar → comer, brincar → recreio); sem desenho, fica a moldura para desenhar ou colar foto |
| `cartoes.ts` | treino de tesoura, "siga o caminho" (traçado entre dois desenhos), HQ em branco (3, 4 ou 6 quadros), crachás, marcadores de página, etiquetas de caderno |
| `geradores.test.ts` | 37 testes |
| `../conteudo/silabas.ts` | separador de sílabas (sugestão que a professora confere) |
| `scripts/exportar-geradores.mjs` | `node scripts/exportar-geradores.mjs <pasta>`: 20 SVGs de amostra + `amostra.html` |

## Conferido

- `npm test`: 216 testes; `npm run build` limpo.
- De olho, em imagem (Chromium sem janela): as 34 folhas de amostra
  (`scripts/exportar-geradores.mjs`) e as 23 do primeiro lote das sugestões
  (`scripts/exportar-lote.mjs`).
- **Em papel, pelo Bruno (2026-11-18):** imprimiu muitas folhas; "a régua
  ficou perfeita, na casa dos milímetros".

**NÃO conferido:** uso por aluno ou professora (nenhuma passou pela mão de uma
professora ainda); iPhone, onde o fator 0,86 **quebra as medidas reais** da
régua, do quadriculado, do milimetrado e da matemática de recortar; as folhas
do primeiro lote (silabário em diante) ainda não foram impressas.

## Decisões e ressalvas

- **Pauta ampliada**: 14 mm entre linhas e traço de 0,8 mm (20 mm e 1,1 mm na
  "muito ampliada"). São números meus, a partir do que o Bruno descreveu
  (cadernos de pauta ampliada para baixa visão); ele não achou o documento da
  antiga ideia "Linha Clara". **Ajustar com um caderno de verdade na mão.**
- **Calendário**: semana começa no domingo. Feriados só os **nacionais** de
  data fixa mais a Sexta-feira Santa; Carnaval e Corpus Christi (pontos
  facultativos), estaduais e municipais ficam de fora. Domingo em letra forte,
  feriado com aro: nada depende de cor.
- **Figura do calendário**: só aceita imagem embutida (`data:` PNG/JPEG/WebP);
  sem imagem fica a moldura tracejada para desenhar ou colar.
- **Caça-palavras**: a grade não tem acento (ATENÇÃO vira ATENCAO); a lista
  embaixo fica como foi escrita. Palavra dentro de outra (PARA em PARADA) sai,
  porque teria dois lugares certos.
- **Jogos de mesa**: as peças usam os 60 desenhos da prancha (provisórios; ver
  `CAA.md`). Palavra sem desenho vai só escrita, e a tela avisa quais. Na
  memória de leitura o par é figura + palavra. O sorteio do bingo é de papel
  (fichas num saquinho); o app não sorteia nada.
- **Xadrez**: as peças são rodelas com a letra (R, D, T, B, C, P, a notação
  brasileira), não figuras de rei e cavalo. É o que dá para recortar e ler; se
  o Bruno quiser silhuetas, é arte a desenhar. Casas de 22 mm, peças de 19 mm.
  As casas escuras são cinza (pouca tinta, e a peça preta aparece em cima).
- **Letra das folhas** (2026-11-18, pedido do Bruno): quem ensina escolhe na
  tela entre **Atkinson Hyperlegible** (a padrão, a mesma das legendas do app),
  **Cardo** e **OpenDyslexic**. A letra é sempre desenhada em caminhos (nunca
  `<text>`), então sai igual em qualquer aparelho. As tabelas da Cardo e da
  OpenDyslexic, e o negrito e o itálico das três (`src/geradores/letras.json`,
  ~1 MB, ignorado pelo git; só entra no pacote quando a tela for ligada, como
  pedaço carregado à parte) saem
  de `scripts/gera-glifos.mjs`, que roda sozinho antes de `npm test` e de
  `npm run build`. Caractere que a fonte não tem cai na Atkinson. O texto é
  feito em `comum.ts` (`comLetra`, `escrever`); `fazerFolhas(pedido, letra)`.
  **Atenção ao zero:** o da Atkinson tem um risco no meio (decisão já
  registrada em `ACESSIBILIDADE.md`: ruim para quem está aprendendo o zero). Nas
  folhas de número para criança pequena, a Cardo ou a OpenDyslexic são
  melhores. A OpenDyslexic ainda não foi impressa nem testada por quem tem
  dislexia.
- **Figura do calendário** (2026-11-18): controle de tamanho (da figura inteira
  até 3×), botões "Figura inteira" e "Preencher a moldura", e arrastar a
  figura na prévia para escolher o que aparece (`encaixeDaFigura` em
  `papeis.ts`). A figura não é guardada no aparelho entre uma visita e outra
  (é grande); tamanho e posição, sim.
- **Rotina visual** (2026-11-18): os 15 desenhos novos (acordar, dormir,
  banho, escovar os dentes, roupa, café, mochila, torneira aberta e fechada,
  sabonete, esfregar e enxaguar as mãos, toalha, pasta na escova, pia) entraram
  na MESMA biblioteca da prancha (`src/caa/pictogramas.ts`), então também
  servem para as pranchas de comunicação. Mãos seguem a regra de `CAA.md`
  (quatro dedos parelhos). Os modelos prontos são ponto de partida: a rotina se
  monta para a pessoa, com quem a conhece. Sem nome de aluno em lugar nenhum.
- **Sequência didática** (2026-11-18): tudo sai do que o livro já tem (texto,
  quiz, desenho). As perguntas abertas não têm gabarito ("valem as ideias da
  criança"). Os momentos da folha de ordem são escolhidos por regra (parágrafos
  narrados espalhados pela história): numa história com muito diálogo, podem
  sair momentos pouco marcantes — quem ensina confere antes de imprimir. Um
  dos livros (Os Três Porquinhos) abria com uma nota "Uma adaptação livre do
  Historinhas", que a regra agora pula. A lista "O que você quer fazer?" está
  em ordem alfabética (pedido do Bruno). Novo pictograma: carro.
- Folhas sem marca de criança (`IDENTIDADE_NEUTRA`): servem do 1º ano ao
  ensino médio. Passar `identidade` para pôr a marca do Historinhas.

## Pintar — folhas interativas, etapas 1 e 2 (2026-11-18)

Embaixo de cada folha da prévia: **🎨 Pintar** (o nome de dentro das historinhas) abre a folha na MESMA tela
de pintura dos livros (balde, pincel, borracha, escrever no desenho, zoom com
mouse e dedo) e **🧩 Quebra-cabeça** a corta em peças. O app não corrige nada,
como no papel.

- `pintar.ts` → `folhaParaPintar(svg)`: o balde só pinta REGIÃO, e as folhas
  foram feitas para o papel. Toda forma FECHADA com contorno e sem tinta
  (caixa de resposta, casa, cartão, peça do tangram, círculo) e o fundo viram
  região branca. Letras e desenhos dos pictogramas ficam como estão. Região
  repetida (o desenho do livro dentro da folha "Para pintar") ganha outro nome
  SÓ ali — a folha impressa não muda, e o código dela também não.
- **A pintura fica guardada pelo código da folha** (`folhas:pintura:<código>:<n>`,
  do aparelho, não do perfil): a mesma folha volta como foi deixada. Folha sem
  código (com nomes) guarda pela impressão digital do desenho.
- `telaColorir.ts` e `telaQuebraCabeca.ts` aceitam um livro OU uma
  `FontePintura` ({svg, titulo, chave}); `resolverFonte()` decide. A barra do
  topo funciona sem perfil escolhido (área de quem ensina).
- **Etapa 2 — casas dentro das grades.** `comCasas()` em `comum.ts` liga as
  casas: os geradores desenham cada casa como retângulo invisível
  (`casa()` / `casaD()` com `data-casa="1"`) e ela vira região TRANSPARENTE
  (clicável; o que está embaixo aparece). Têm casas: o mês e o ano do
  calendário (o domingo de vermelho), sudoku, caça-palavras, quadriculado,
  plano cartesiano, labirinto (pintar o caminho), tabuleiro (64 casas, a escura
  começa cinza), tábua (a cabeça começa cinza), material dourado (cada
  cubinho), frações (cada parte da barra e cada FATIA do círculo), quadro de
  valor posicional, cartelas do bingo e toda peça de recortar (cartas, pedras,
  fichas, cartões). **Só para pintar:** na folha impressa `casa()` devolve
  vazio, e por isso o papel e o código da folha não mudam (o teste das folhas
  de referência confirma). A casa não ganha contorno (`criarCamadaLinhas`,
  `derivarContornoPB`, `contornoPreto` e o quebra-cabeça a pulam) e vai para o
  FIM da folha em `folhaParaPintar`, senão a moldura grossa (que também vira
  região) a tapava e roubava o clique — foi o que aconteceu no sudoku e no
  tabuleiro na primeira versão.
- **Partes dos desenhos** (pedido do Bruno, 2026-11-18: «como nos
  alfabetos»): na tela de pintura, `face()` marca o desenho da carta entre
  `<!--desenho-->` e `<!--/desenho-->`; `folhaParaPintar` o leva para o FIM
  (por cima das casas) e transforma cada forma FECHADA que herda «sem tinta» em
  parte (`data-parte`, transparente): o rosto, a boca, a lataria e as janelas
  do ônibus, os dedos da mão. Olho e detalhe cheios ficam pretos. Desenho feito
  só de traço aberto (a casa) pinta só o fundo. Na camada de contorno a parte
  guarda o traço do próprio desenho.
- **Balde em todas da mesma cor** (🪣🪣 na barra da pintura, liga e desliga):
  um toque troca a cor de todas as partes que têm a mesma cor daquela — as 32
  casas cinza do tabuleiro de uma vez. Branco e transparente contam como a
  mesma cor (é o que a criança vê). Desfaz num passo só. Vale também para os
  desenhos dos livros.
- Ainda sem casas: pauta, pontilhado e milimetrado (são para escrever e
  desenhar), reta numérica, relógio.
- **Não conferido:** no tablet com o dedo (só no computador, por eventos), e uma
  criança usando.

## Jogar na tela — caça-palavras e cruzadinha (2026-11-18)

**🎮 Jogar** aparece embaixo da folha do aluno do caça-palavras e da
cruzadinha. O jogo usa a MESMA grade da folha impressa (`jogoDoPedido()` em
`pedido.ts` sai pelo mesmo caminho de `fazerFolhas`). Regras puras e testadas
em `jogo.ts`; a tela em `telaJogo.ts`.

- **Caça-palavras:** arrastar o dedo sobre a palavra, ou tocar a primeira
  letra e depois a última (para quem não consegue arrastar) — nos dois
  sentidos. A palavra achada ganha cor (fixa pela ordem da lista: recompensa
  previsível), é falada e riscada na lista. Linha que não é palavra só diz
  «tente outra», sem cor nem som de erro. Ajudas: «💡 Uma dica» (a primeira
  letra pisca e a palavra é falada), «Mostrar todas», «Recomeçar».
- **Cruzadinha:** tocar a casa e digitar (um campo por casa: o teclado do
  celular abre sozinho); o cursor anda; tocar de novo na casa do cruzamento
  troca deitada ↔ em pé; apagar numa casa vazia volta uma; tocar a dica
  escolhe a palavra. Acento não importa (Ã vale A). Palavra completa fica
  verde e é falada; nunca se marca o errado. Ajudas: «💡 Uma letra»,
  «Mostrar respostas», «Recomeçar». A festa (confete) é uma vez, quando a
  última palavra fecha.
- **Progresso guardado pelo código da folha** (`folhas:jogo:<código>`).
- **Cruzadinhas prontas** (`cruzadinhasProntas.ts`, pedido do Bruno: quem
  joga sozinho «cola na prova», porque as palavras estão escritas ao lado): 12
  temas de 8 palavras (bichos, frutas, corpo, casa, escola, transporte,
  natureza, cores, profissões, comidas, brinquedos, sentimentos), todos
  conferidos por teste. Escolhida uma pronta, as palavras ficam escondidas
  («Ver as palavras (para quem ensina)»); mexer nelas a torna «a minha».
  «🔀 Outra cruzadinha pronta» no formulário e «➡️ Outra cruzadinha» no jogo
  passam para a próxima EM ORDEM (nada sorteado). A lista só cresce no fim.
- **Imprimir colorido:** já funcionava, e foi conferido: 🎨 Pintar → 🖨️ →
  «Do jeito que eu pintei» manda a folha com as cores (o calendário com os
  domingos vermelhos saiu com as cores e `print-color-adjust`).
- **Conferido no app** (computador e 375 px, por eventos): arrastar, tocar
  começo e fim ao contrário, palavra repetida, dica, mostrar; cruzadinha
  digitando BORRACHA com o cursor andando, ajuda, respostas. **Não conferido:**
  com o dedo num tablet de verdade, e leitor de tela. No celular a casa do
  caça-palavras de 12 × 12 fica com ~29 px — pequena para dedo de criança;
  com lista grande, preferir grade menor.

## O código da folha (2026-11-18)

**Ajuste do Bruno no mesmo dia:** o código NÃO vai impresso por padrão — «casos
bem específicos» (matemática, o que tem caminho de volta, como a especificação
que a Oficina manda ao Gerador); «tem código até em folha pautada». Fica num
cantinho fechado da tela («Código da folha»), com a caixa «Imprimir o código no
pé da folha do professor» desligada. A escolha fica guardada no aparelho.

`src/geradores/codigo.ts`. Cada folha tem um código (`H1-64RQ-WC3Y-6CYK-6V`)
que, digitado na tela ("Montar uma folha pelo código"), monta **a mesma
folha**, com as respostas. Funciona porque nada é sorteado: o código carrega a
própria escolha do formulário, compacta, sem servidor e sem internet.

- **Formato:** `H1` (versão) + o pedido em texto curto
  (`tipo~letra~campo=valor…`, só o que difere do pedido de partida) em base 32
  de Crockford (sem I, L, O, U) + um caractere de conferência. Lê minúscula,
  espaço, sem traço, e O/I/L no lugar de 0/1; um caractere trocado é recusado.
- **Tamanho medido:** caça-palavras de partida `H1-61Z3-0Q` (10); contas com
  outra semente, 20; parábola, 29; labirinto grande, 42; lista de palavras
  própria, ~100 (é o caso que um QR Code resolveria — ainda não feito).
- **Onde vai impresso:** no pé da folha do professor (as de respostas). Na do
  aluno, não: o código monta também as respostas. Tipo sem respostas (pauta,
  capa) leva em todas. Sempre na Atkinson (o zero com risco é o certo num código).
- **Sem código:** folha com nomes de alunos (crachás, etiquetas, marcadores com
  nome) — o nome iria impresso dentro dele. A figura do calendário não entra
  (grande demais); o código guarda o resto.
- **Regras para nunca quebrar um código já impresso:** `TIPOS_NO_CODIGO` e
  `CAMPOS_NO_CODIGO` só crescem NO FIM; o pedido de partida é o de uma data fixa
  (`DATA_DE_REFERENCIA`); e o teste **"códigos antigos montam exatamente as
  mesmas folhas"** guarda oito códigos de verdade com a impressão digital das
  folhas. Se um gerador mudar a folha que um código monta, ele reprova: ou se
  conserta o gerador, ou se sobe a versão (`H2`) — **nunca se troca o número do
  teste por conveniência**. E o PEDIDO DE PARTIDA de todos os tipos também está
  congelado por teste («pedido de partida congelado»): o código guarda só o que
  difere dele, então mudar um valor de partida mudaria o que um código antigo
  monta. Campo novo entra como OPCIONAL (como `pronta`), nunca no pedido de
  partida.

## A tela "Fazer uma folha" — pronta e DESLIGADA

`src/geradores/telaFolhas.ts` (a tela), `pedido.ts` (do formulário à folha,
parte pura e testada) e `ligado.ts` (a chave).

- **Para usar hoje, no computador:** `npm run dev` e abrir
  `http://localhost:5173/#folhas`. Escolher o tipo, preencher, ver a prévia e
  "🖨️ Imprimir ou guardar em PDF" (na janela de impressão, "Salvar como PDF";
  escala 100% para as medidas valerem). Funciona sem internet.
- **No app publicado, enquanto `FOLHAS_LIGADAS` for `false`:** `#folhas` não
  abre nada, não há botão em menu nenhum e o código da tela nem entra no
  pacote (conferido no `dist/`: nenhum arquivo dela).
- **Para ligar:** trocar para `true` em `src/geradores/ligado.ts` (e ajustar o
  teste "a tela nasce desligada"). Aparece o botão "🖨️ Fazer uma folha" em
  Ajustes → Para quem ensina, atrás da trava; `#folhas` passa a pedir a trava.
- O que se preenche fica guardado no aparelho (`folhas:pedidos`), menos a
  figura do calendário, que é grande.
- No caça-palavras há "Ver estas palavras em sílabas" (sugestão do separador).

Conferido no navegador do app (1280 px e 375 px): os sete tipos dão prévia,
avisos aparecem (palavra que ficou de fora), a impressão monta as folhas A4,
sem rolagem lateral no celular, sem erro no console. **NÃO conferido:** o PDF
de verdade saindo da janela de impressão, papel, iPhone, leitor de tela, e a
figura do calendário com foto real.

## O que falta

1. **Ligar a tela** quando o Bruno decidir (acima) e decidir onde ela mora
   para um adolescente (decisão 3 de `LER_O_MUNDO.md`).
2. Caça-palavras a partir das palavras de um livro da estante e dos grupos do
   Ler o Mundo (um botão em cada um).
3. Cruzadinha com **desenho no lugar da dica** (os 60 pictogramas de
   `src/caa/pictogramas.ts`).
4. Mais jogos de mesa: trilha (tabuleiro de percurso), jogo da velha, ludo,
   quebra-cabeça de recortar, dominó de figura com palavra.
5. Mais matemática: função do 1º grau, folha de exercícios de Bhaskara com
   gabarito (a conta já existe em `passosBhaskara`), troco com
   dinheiro de brincadeira, "quanto falta para o ônibus das 7:15" (o relógio
   já existe em `matematica.ts`).
6. Frase → tira de pictogramas; diário de uso da prancha.
7. **Sugestões das outras IAs ainda não feitas** (lista avaliada em 2026-11-18):
   - médias: ligue os pontos (pontos tirados do contorno dos desenhos),
     simetria no quadriculado, pintura por código (conta ou sílaba), letras
     vazadas para cobrir (a rotina visual foi feita em 2026-11-18);
   - a sequência didática foi feita em 2026-11-18 (`sequencia.ts`); falta
     escolher só um capítulo nos livros longos e a cruzadinha com as palavras
     da história;
   - silhuetas do tangram (figuras para montar);
   - **não fazer**: "melhor leitor", semáforo e quadro de comportamento
     (ranking e pressão contrariam os princípios 4 e 7 do CLAUDE.md); diploma
     só de participação ("Terminei o livro X"). Mapas mudos e máscaras ficam
     para depois (dados geográficos pesados; arte à mão).

## A oficina em quatro seções e os Jogos da criança (2026-11-19)

A oficina foi LIGADA (`FOLHAS_LIGADAS = true` em `ligado.ts`): a Luiza olha o app
na semana seguinte e o Bruno quis «acesso total das funcionalidades».

- **Quatro seções** no alto da oficina, no lugar da lista única de 18:
  🎲 Jogos para imprimir · ✏️ Atividades · 📄 Papéis e modelos · 🧑‍🏫 Planejar.
  O registro é a própria `TIPOS` (`pedido.ts`): cada tipo tem `secao` e, se
  aparece também noutra, `tambem` (as sílabas, com bingo e dominó, aparecem em
  Atividades e em Jogos — o mesmo gerador, dois caminhos). Tipo novo entra
  em `TIPOS` com a sua seção; o teste barra seção vazia.
- **Barra lateral da criança:** 🎮 Jogos (pasta com Caça-palavras e Cruzadinha)
  e 🖨️ Para quem ensina (abre a trava dos adultos e, depois dela, a oficina;
  desistir volta à estante). Os dois só existem com a oficina ligada.
- **Tela Jogos** (`telaJogos.ts`; regras puras em `jogosDaCrianca.ts`): sem
  formulário. Os 12 temas das cruzadinhas prontas servem os DOIS jogos; o
  caça-palavras tem «Mais fácil / Mais difícil» (quem tem 9+ começa no mais
  difícil; a escolha fica lembrada). ✓ no tema terminado. Progresso POR PERFIL:
  `<perfil>:jogo:<caca|cruzadinha>:<tema>[:<nível>]`.
- Damas e xadrez ficam só na oficina (na tela não são jogáveis).

## Sudoku na tela (2026-11-19)

- Na oficina: 🎮 Jogar aparece também na folha do sudoku (4 × 4, 6 × 6 e de
  figuras; o labirinto ainda não). «➡️ Outro sudoku» = a semente seguinte, a
  mesma que a folha daria.
- Na barra da criança: 🎮 Jogos → 🔢 Sudoku. Três modelos (Figuras, Números
  4 × 4, Números 6 × 6; até 8 anos começa nas figuras, 9+ no 4 × 4; a escolha
  fica lembrada) e 12 sudokus numerados por modelo. O sudoku N da criança é a
  folha impressa com semente N − 1.
- Jogar: toca a casa vazia, depois o número ou a figura na fileira de baixo
  (ou o teclado: números, ⌫, setas). A seleção anda sozinha para a próxima
  vazia. Nada marca erro: só se festeja a linha, a coluna e o bloco que
  FECHAM certos, e o sudoku inteiro (confete uma vez). 💡 Uma casa vai sempre
  à primeira vazia, em ordem (sem vazia, à primeira que não fecha).
- Regras puras em `jogo.ts` (valorDaCasa, gruposCertos, sudokuCompleto,
  casaDaAjuda, proximaVazia); progresso `{ valores }`.
- Publicado: 0.10.0 (master `0568aff`). Sudoku e labirinto saíram juntos na
  0.11.0 (pedido do Bruno: «junta com o próximo»).

## Labirinto na tela (2026-11-19)

- Na oficina: 🎮 Jogar na folha do labirinto; «➡️ Outro labirinto» = semente
  seguinte. Na barra da criança: 🎮 Jogos → 🌀 Labirinto, tamanhos Pequeno,
  Médio e Grande (até 8 anos começa no pequeno, 9+ no médio; lembrado), 12
  numerados cada, iguais à folha com semente N − 1; ✓ no que chegou.
- Jogar: o BICHINHO DO PERFIL anda pelo labirinto (sem perfil, 🙂) da entrada
  até a ⭐. Arrastar o dedo pelos corredores (o dedo rápido num corredor reto
  preenche as casas do meio), tocar casa a casa, ou setas do teclado. Voltar
  por cima do rastro apaga o pedaço; a parede só não deixa passar — sem cor
  nem som de erro. 💡 Um pedaço (o caminho certo até onde a criança acertou,
  mais 5 casas), Mostrar o caminho (tracejado, liga e desliga), Recomeçar.
- Regras puras em `jogo.ts` (podePassar, andarAte, chegou, caminhoValido,
  pedacoDaSolucao); progresso `{ caminho }`, conferido ao abrir (caminho
  guardado que atravesse parede não vale).
- No celular o Grande fica com casas de ~15 px: dá para arrastar, mas é
  apertado — para tablet ou computador.

