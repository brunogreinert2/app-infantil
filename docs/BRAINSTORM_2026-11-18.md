# Brainstorm do Bruno — decisões de 2026-11-18

O Bruno anotou ideias num arquivo (`Historinhas Brainstorm.md`, nos Downloads
dele) e pediu uma análise antes de começar. Este é o registro do que foi
decidido. Contexto: o Historinhas virou uma **oficina de materiais
pedagógicos imprimíveis** (A4), juntando o que se aprendeu no Pedra Angular e
nas bancadas do Ateliê. Nas palavras dele: "a gente tá se tornando
especialistas em impressões, A4, tudo relacionado a isso".

## Andamento

- [x] 1. Zoom com mouse — `src/canvas/zoomPinca.ts` e botão ✋ em
  `telaColorir.ts` (espaço + arrastar, botão do meio, roda; a mão vale
  também para um dedo). Conferido no app: nenhum desses gestos pinta.
- [x] 2. Contas da professora — `lerContas` em `contas.ts` (caixa "Ou escreva
  as suas contas"; o que não serve volta explicado).
- [x] 3. Aluno/professor — campo "Imprimir" na tela; `folhasPara` e
  `ehDoProfessor` em `pedido.ts` (folha de respostas = "respostas" no título;
  folha sem respostas sai igual nas duas).
- [x] 4. Capas — `capas.ts` (moldura, ABNT, leituras) e `ornamentos.ts`
  (meandro, filete, pontinhos, sem moldura; para criar outro, um `case` em
  `moldura()`). Letra espaçada de verdade (`espaco` em `escrever`).
- [x] 4b. Ajustes do Bruno nas capas (2026-11-18, noite): o meandro passou a
  ser a FÓRMULA da grega do Pedra Angular (`GregaMeandro.tsx`, a mesma do
  Gerador) — as chaves soltas de antes "não fechavam"; negrito e itálico DE
  VERDADE nas três letras (variantes geradas em `letras.json`, `comEstilo` em
  `comum.ts`), escolha por parte da capa com os padrões da Oficina; dica das
  leituras neutra ("antes do travessão sai maior, em cima"). GoatCounter: em
  stand-by, por decisão do Bruno.
- [x] 5. Código da folha — `src/geradores/codigo.ts`. Ver "O código da folha"
  em `GERADORES.md`. QR Code ainda não (o código mais longo, de uma lista de
  palavras, passa de 100 caracteres: é o caso que pede QR).
- [x] 6a. Folhas interativas, etapa 1 — "🎨 Fazer no app" e "🧩 Quebra-cabeça"
  embaixo de cada folha da prévia. Ver "Fazer no app" em `GERADORES.md`.
- [ ] 6b. Etapa 2, jogo a jogo (caça-palavras arrastando, cruzadinha
  digitando, sudoku, contas com teclado).

## Decidido — fazer, nesta ordem (do mais fácil ao maior)

1. **Zoom da pintura no computador.** Hoje, com zoom, só se anda pela arte
   com as setas, porque arrastar o mouse pinta. Fazer: espaço + arrastar,
   botão do meio + arrastar, e roda do mouse para aproximar ou afastar.
2. **Contas com os números da professora.** Caixa ao lado com uma conta por
   linha (`345 + 278`, `84 ÷ 4`), podendo misturar operações. Vazia, o app
   gera (por semente, como hoje).
3. **Versão do aluno e versão do professor** na hora de imprimir: "do aluno",
   "do professor" ou "as duas". As respostas já saem em folhas separadas; falta
   a escolha.
4. **Capas** (`capas.ts`), no estilo das capas da Oficina
   (`C:\Projetos\OFICINA\CAPAS`): capa com moldura, capa de trabalho escolar no
   modelo ABNT, capa de tópico/lista de leituras.
   - **Sem colofão e sem "Pedra Angular"**: nada de "Ὁ Διαφορεύς παρῆν" nem
     "Coleção Pedra Angular" no Historinhas (o selo adulto não entra no app
     infantil).
   - **O meandro é uma OPÇÃO de ornamento**, não o padrão fixo: o motor de
     ornamentos fica aberto para outros tipos depois (e para enfeitar
     qualquer folha, não só capas).
5. **Código da folha**: cada folha gera um código que, digitado no app, monta
   a mesma folha (com as respostas). O código carrega a própria escolha
   compactada (sem servidor, funciona sem internet), com número de versão e
   testes de "folhas de referência" para um código antigo nunca mudar de folha.
   QR Code na folha do professor quando o código for longo. **Sem código** em
   folhas com nome de aluno (crachás, etiquetas).
6. **Folhas interativas no app**, em duas etapas:
   - etapa 1, para todas as folhas: "Fazer no app" abre a folha no motor de
     pintura que já existe (balde, pincel, escrita, zoom, quebra-cabeça), sem
     corrigir nada;
   - etapa 2, jogo a jogo: caça-palavras arrastando, cruzadinha digitando,
     sudoku, contas. Regra do app: nunca trava, nunca dá nota; a resposta
     aparece se a criança pedir.

## Esperando decisão do Bruno

- **GoatCounter no Historinhas.** O Pedra Angular já usa
  (`app-leitura/src/lib/contador.ts`). Conflito: princípio 3 ("zero rede") e a
  promessa da porta de entrada ("O app não envia nada para a internet"), com
  público de crianças. Opções levadas a ele: contar só a página pública do
  site sem tocar no app (recomendada); mudar o texto da promessa; não contar.

## Registrado como visão (não é próximo passo)

- **App pago para escolas, com login de professor** e livros enviados pela
  escola; e o sonho de um app do MEC com os livros didáticos de toda a
  educação básica, interativos. Exige servidor, contas, contratos e cuidado
  sério com dados de crianças (LGPD) — muda a arquitetura atual, offline e sem
  contas. Meio-termo possível já hoje: pacote para escolas sem login (pranchas
  por arquivo, folhas pelo código). Livro didático de editora só com licença;
  vale pesquisar o que o PNLD já oferece em digital antes de sonhar alto.
