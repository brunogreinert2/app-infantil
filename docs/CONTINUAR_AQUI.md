# CONTINUAR AQUI — chave de handoff entre sessões/modelos

## Textos próprios compatíveis com o Pedra Angular — 2026-11-12, noite (Opus 5.5)

Branch `fable/sugestoes` (a mesma, que já estava publicada até `8c37d3c`).
**Publicação autorizada em 2026-11-12** ("Pode publicar sim").
**Publicação confirmada:** master em `187233e`, Actions 43346590127 com sucesso; o pacote servido em historinhas.app.br já traz os textos no IndexedDB. Não abri o site num navegador depois.

Pedido do Bruno: Minhas anotações com as mesmas ações dos "Meus arquivos" do
app-leitura (pesquisar, Adicionar, Novo, Exportar, Importar), troca de
textos pelo `.json` dos dois apps, e "Minhas anotações" abrindo ali mesmo no
menu lateral.

- `src/conteudo/textosProprios.ts` — o modelo `TextoProprio` (tipos `nota`,
  `md`, `txt`) e a conta: ler/gerar o `.json` do Pedra Angular
  (`app: 'pedra-angular-leitura'`, `files: [...]`), `.md`/`.txt` → texto,
  juntar sem gravar por cima, pesquisar sem acento. 13 testes.
- `src/armazenamento/textos.ts` — IndexedDB `historinhas-textos` (com volta
  ao localStorage se não abrir); migra `<perfil>:notas` na primeira leitura.
- `telaAnotacoes.ts` — reescrita da lista (o editor cru continua igual).
- `telaLeitura.ts` — 4º parâmetro `textoProprio: { editar }`: sem rodapé de
  "Terminei", com "✏️ Editar". Título mais alto do livro vira h2.
- `painelLateral.ts` — pasta "Minhas anotações", pesquisa no alto.
- Cópia de segurança versão 2 (`textos`), `excluirPerfil` apaga os textos.
- **Nada mudou no app-leitura.** O `.json` exportado daqui foi importado lá
  pela função `importBackup` do próprio app-leitura, em dev, e apagado depois.

O que falta para "igualdade" com o Pedra Angular, se o Bruno quiser: excluir
tudo de Minhas anotações; arrastar e soltar arquivo na janela; abrir arquivo
pelo "Abrir com" do sistema; pesquisa dentro do texto.


## Sugestões aceitas pelo Bruno — em andamento (2026-11-12, Fable 5.2)

O Bruno aceitou as oito sugestões, na ordem. Branch `fable/sugestoes`
(saída da master publicada). **NÃO publicada: pede autorização nova.**
Os retoques anteriores (`fable/retoques-pos-publicacao`) JÁ estão no site
(Actions 43217124678, sucesso — inclusive o teste de 50 mil linhas).

- [x] **Peso da letra** (pedido extra dele, para igualar o app-leitura):
      `PESOS` e `tracoDoPeso()` em `espacamento.ts`; `--reading-stroke`;
      `<perfil>:pesoTraco`; grupo "Peso da letra" na Aparência.
- [x] **1. Pintar por partes**, mantendo o toque: 📋 na tela de pintar;
      `nomeDaParte()` em `src/canvas/partes.ts`; `CamadaBase.regioes()`;
      destaque `.parte-escolhida` na camada de linhas.
- [x] **2. Cópia de segurança** (como o exportar/importar do Pedra Angular):
      `src/armazenamento/copia.ts` (conta, testada) e `copiaNoAparelho.ts`;
      botões em Ajustes. É TROCA, não mistura.
- [x] **3. Guia de quem ensina** dentro do app: `src/conteudo/guia.ts`
      (texto), `src/telas/telaGuia.ts`; entra por Ajustes. Os Números
      entraram em `scripts/exportar-fichas.mjs` (não rodei o script).
      O TEXTO DO GUIA É MEU: o Bruno precisa ler e corrigir.
- [x] **4. Realce do que a voz lê**: `ouvirPedacos()` em `tts.ts`;
      `src/telas/realceLeitura.ts`; `::highlight(lendo)` e `.lendo-agora`.
- [x] **5. Régua de leitura**: `src/telas/reguaLeitura.ts`; botão 📏 na
      leitura; `<perfil>:reguaLeitura`.
- [x] **6. Minhas pinturas**: `src/telas/telaPinturas.ts`; aba na estante e
      item do menu; `desenhoPintadoParaTela()` em `motorImpressao.ts`.
- [x] **Extra — PDF de verdade no app instalado** (o Bruno lembrou que é
      pelo PDF que a folha chega ao computador): `src/impressao/pdf.ts`
      (PDF mínimo escrito à mão) + `folhaParaCompartilhar.ts`. No app de loja
      isso se resolve com impressão e arquivos nativos — ver
      `docs/CAPACITOR_PLANO.md`; até lá, é este o caminho.
- [x] **7. Mais Números**: `svgNumeroAte20A4(n)` (11 a 20) e
      `svgTabuadaDoA4(n)` em `numeroArte.ts`; o livro tem 40 folhas.
      O TRAÇADO (algarismo pontilhado) NÃO foi feito.
- [~] **8. Auditoria**: axe-core instalado (devDependency) e rodado à mão
      em dez telas; cinco achados consertados; zero violações depois. A parte
      com LEITOR DE TELA DE VERDADE não foi feita e não é coisa que uma IA
      faça: o roteiro para o Bruno está no fim de `docs/ACESSIBILIDADE.md`.

- [x] **Pedidos do Bruno ao usar a branch (2026-11-12, tarde):**
      títulos `##` recolhíveis (`src/telas/secoesRecolhiveis.ts`; guia começa
      fechado, livros abertos); régua em três jeitos (`ModoDaRegua`); realce
      também em "Ouvir a história" (`falar(texto, cb, partes)` em `tts.ts`);
      "Monte o seu" com o seletor de cor da pintura
      (`src/telas/seletorDeCor.ts`, `src/telas/temaDerivado.ts`).
      O Bruno leu o guia por alto e aprovou; ajustes de texto ficam para
      depois e podem ser feitos por um modelo menor (`src/conteudo/guia.ts`).

**Publicação autorizada em 2026-11-12** ("Depois disso pode publicar"):
a branch `fable/sugestoes` vai inteira para a master.
**Publicação confirmada:** master em `0b98895`; o
[Actions 43301495350](https://github.com/brunogreinert2/app-infantil/actions/runs/43301495350)
concluiu com sucesso. Conferido por download do pacote servido em
https://historinhas.app.br (traz guia, galeria, títulos recolhíveis, régua,
PDF, peso da letra e tabuadas; não traz o axe-core). NÃO abri o site num
navegador nem num celular depois de publicar. Este registro fica só na
branch. Mudança nova volta a pedir autorização.

**As oito sugestões estão entregues, menos: traçado de algarismos, nomes das
regiões das 51 cenas, e o teste com leitor de tela.** Tudo na branch
`fable/sugestoes`, sem publicar.

Como rodar o axe de novo: com o dev server ligado, no console do navegador,
carregar `/node_modules/axe-core/axe.min.js` num `<script>` e chamar
`axe.run(document)`. Vale virar um comando (falta um navegador controlável
no projeto; o Chromium sem janela de `ms-playwright` serve com um script).

O que não foi provado está em `docs/ACESSIBILIDADE.md` (seção de mesma data).
A lacuna que sobra no item 1: **dar nome às regiões** das 51 cenas das
coleções (hoje "detalhe 12") — sem isso a lista serve mal a quem não vê.


## Retoques depois da publicação — 2026-11-12 (Fable 5.2)

Branch `fable/retoques-pos-publicacao`, saída de `fable/novas-ideias`.
**Publicação autorizada em 2026-11-12** ("Pode publicar") e enviada à master. Ele relatou quatro
coisas usando o site no iPhone:

1. **Imprimir no app instalado não abria nada** (no Safari funciona, numa
   página). Num app instalado o iOS ignora o `print()`. Feito:
   `src/impressao/folhaParaCompartilhar.ts` — a folha vira PNG e sai pelo
   compartilhar do aparelho (`navigator.share` com arquivo), em dois toques.
   `imprimirDocumento` desvia para lá quando `appInstaladoNoIos()`. Acima de
   12 folhas avisa para usar o Safari. **Só simulado; falta o iPhone.**
2. **Risco sobre as bolinhas da reta** nas folhas de Números: a linha
   passava por baixo das casinhas. Agora é feita de pedaços (`reta()` em
   `numeroArte.ts`), com teste.
3. **Voz no quiz**: 🔊 na pergunta (com as opções) e na explicação
   (`blocoQuiz` em `telaLeitura.ts`).
4. **Zoom**: a lupa vai a 4×, como a pinça; `zoomPinca.ts` limpa dedos
   "fantasmas" antes de todo comando que não é pinça. O "não volta do 4×"
   não foi reproduzido no computador — se continuar no iPhone, a causa é outra.

Também: setas do zoom viraram ← ↑ ↓ → (os triângulos saíam de tamanhos
diferentes). Build verde. Testes: 82 de 83 passam NESTA máquina — o que
falha é "50 mil linhas em menos de 4 segundos" (`parser.test.ts`), com ~6 s.
Falha igual SEM as minhas mudanças (conferido com `git stash`, no código já
publicado), e não toca em nada que mexi: é a máquina, com Node 20 local e
carregada. É o mesmo teste que já falhou por tempo em outubro; o Actions usa
Node 24 e passou hoje cedo com este mesmo motor. Não mexi no limite nem no
motor. **Antes de publicar, ver o Actions passar.**

### Ideias que ofereci ao Bruno (ele pediu sugestões) — nada disto foi feito

Em ordem do que eu faria primeiro:
1. Pintura sem toque fino: escolher a região por lista/teclado ("céu",
   "árvore") — é o que falta para o desenho ser operável por leitor de tela e
   por quem não tem precisão motora. Hoje é a maior lacuna de acessibilidade.
2. Exportar/importar os dados (pinturas, insígnias, anotações): hoje moram
   só no aparelho; já estava na fila como pré-requisito do app de loja.
3. Guia da professora dentro do app (e os Números no pacote de fichas).
4. Realce da palavra/frase que está sendo lida em voz alta.
5. "Minhas pinturas": galeria do que a criança já pintou.
6. Régua de leitura (faixa que isola a linha) — combina com o trabalho de
   espaçamento.
7. Números de 11 a 20 e tabuada por número; folhas de traçado.
8. Auditoria com leitor de tela de verdade (VoiceOver) e axe-core.


## Novas ideias do Bruno — plano em fases (Fable 5.2, desde 2026-11-11)

Plano: `docs/FABLE_PLANO_NOVAS_IDEIAS.md`. **Ordem: F0, F1, F5, F2, F3, F4.**
Branch `fable/novas-ideias` (saiu de `codex/segunda-colecao`, `f579d70`).
Nada foi para a master nem para o site: publicar só com autorização nova.
Registro de acessibilidade, com o que NÃO foi verificado: `docs/ACESSIBILIDADE.md`.

- [x] **F0** — branch criada; 41 testes e build verdes antes de começar.
- [x] **F1 — cores com nome, tons e voz** (2026-11-11). Ver abaixo.
- [x] **F5 — espaçamento como no app-leitura** (2026-11-11). Ver abaixo.
- [x] **F2 — imprimir, "do jeito que pintei", lupa de verdade** (2026-11-11).
      Ver abaixo. No iPhone a folha ABRE; a correção de "sai a tela do app"
      (`c4b17bb`) ainda precisa voltar ao aparelho.
- [x] **F3 — estante em pastas + painel lateral** (2026-11-11). Ver abaixo.
- [x] **F4 — números arábicos, romanos e operações** (2026-11-12). Estilo da
      primeira folha aprovado pelo Bruno ("aprovadíssimo"). Ver abaixo.

**O plano está cumprido (F0, F1, F5, F2, F3, F4).**

**Publicação autorizada em 2026-11-12** — o Bruno escreveu "Pode publicar".
A branch `fable/novas-ideias` foi integrada na master por avanço direto
(sem commit de merge) e enviada: o GitHub Actions testa, monta e publica em
https://historinhas.app.br. Foram junto três commits que estavam em
`codex/segunda-colecao` e ainda não na master (`90c16c3`, `ec12d41`,
`f579d70`: registro de publicação e duas sincronizações do motor).
**Publicação confirmada:** master em `b8f1ef0`; o
[Actions 43210047671](https://github.com/brunogreinert2/app-infantil/actions/runs/43210047671)
concluiu testes, build e deploy. Conferido por download do pacote servido em
https://historinhas.app.br: ele já traz as cores novas, o menu lateral, a
impressão nova, o espaçamento e Os Números. NÃO abri o site num navegador
nem num celular depois de publicar. Este registro fica só na branch, para
não disparar outra publicação idêntica.
A autorização vale para ESTA entrega; mudança nova volta a pedir branch
própria e autorização nova. Ainda por confirmar no iPhone, agora no site:
a impressão numa página.
- F6 (triagem de SVGs e histórias) não é para Fable: ver o plano.

### Teste do Bruno no iPhone (2026-11-11, 22h) e o que ele mudou

- Tons e cores: aprovados ("ficou muito legal").
- Imprimir: a folha do iOS abre, mas saía **a tela do app** em vez do
  desenho. Causa provável: no iOS o `afterprint` dispara antes de a prévia ser
  desenhada, e a limpeza removia a folha. Corrigido em `c4b17bb`: a folha fica
  no documento (invisível na tela) até a próxima impressão ou por 10 minutos.
  **Falta ele testar de novo.** Se ainda sair a tela do app, a causa é outra:
  olhar se o Safari aplica `@media print` a regras postas na hora, e aí
  construir o plano B (abrir a folha em aba nova).
- O iOS ignora a orientação do `@page`: a folha vem "Vertical". Não tem
  conserto por CSS; a cena em paisagem cabe em pé, menor.

### F4, o que ficou feito

- `src/conteudo/numeroArte.ts`: as folhas. `svgNumeroA4(n)` (0 a 10),
  `svgNumerosTabelaA4`, `svgDezenasA4`, `svgRomanosA4`, `svgRelogioRomanoA4`,
  `svgJuntarA4`, `svgTirarA4`, `svgVezesA4`, `svgRepartirA4`, `svgTabuadaA4`.
  Usa as peças de `alfabetoArte.ts` (agora exportadas: `base`, `quadro`,
  `regiao`, `letras`, `linha`, `linhasTexto`). `texto()` local troca os
  algarismos pela Cardo (zero sem corte).
- `src/conteudo/numeros.ts`: `gerarCadernoNumeros()` e `gerarNumeros()` — o
  livro `numeros` ("Os Números"), 20 assets `numeros_<id>.svg`, texto na voz
  da criança, um quiz. Entra no `catalogo.ts` junto dos alfabetos.
- `scripts/gera-glifos.mjs`: os algarismos 0–9 entraram nos glifos da Cardo
  Bold (132 glifos).
- Pasta "Números" (`pastas.ts`), capa 🔢 (`capas.ts`), insígnia "Amigo dos
  Números" (`insignias.ts`), botões de impressão no livro (`tabelas.ts`):
  de zero a dez, tabuada, caderno completo.
- 82 testes; build verde.

### F4, o que ficou de fora

- Oito das onze folhas "um número" não foram olhadas uma a uma (1, 2, 4–9).
- `scripts/exportar-fichas.mjs` não exporta os Números (só os alfabetos): o
  pacote de SVG/PDF para as professoras ainda não tem estas folhas.
- Guia da professora para os Números: não escrito.
- Números de 11 a 20, dezenas quebradas (23, 47…), tabuada por número.
- Na tabuada o algarismo é cheio: some se a casa for pintada de cor escura.

### Terceiro retorno do Bruno (2026-11-12): a paleta

Ele ainda via Amarelo-sol ao lado de Vermelho e Verde perto de Amarelo. A
ordem "medida" passava no teste e não resolvia. Refeita como **xadrez
quente/frio** (`lado` em `cores.ts`), grade de 5 colunas em toda tela
(`COLUNAS_PALETA = 5`). "Pode ser aleatório, pensado para o daltonismo" —
palavra dele. Detalhe e limites em `docs/ACESSIBILIDADE.md`. Ele olhou e aprovou ("as cores ficaram ótimas").

### Como olhar uma folha (F4)

Não há Playwright no projeto, mas há um Chromium sem janela em
`%LOCALAPPDATA%\ms-playwright\chromium_headless_shell-*`. Gravar o SVG num
arquivo (um teste temporário do vitest com `writeFileSync` serve) e:
`chrome-headless-shell.exe --headless --hide-scrollbars --window-size=800,1131
--screenshot=saida.png file:///caminho/folha.svg`. Para impressão de verdade:
`--print-to-pdf=saida.pdf` numa página temporária na raiz do projeto, servida
pelo dev server, que importa `motorImpressao.ts` e troca `window.print` por
uma função vazia. Apagar a página depois.

### Segundo retorno do Bruno (2026-11-11, mais tarde)

- Imprimir no iPhone: **o desenho já sai** (a correção `c4b17bb` funcionou).
  Faltava caber: cena em pé quebrava em duas páginas; ficha de alfabeto
  transbordava (a 87% cabia). Feito: `fatorDoPapel()` (86% no iOS) +
  `cssCadernoA4()` e `cssDesenhoA4()` em `motorImpressao.ts`; a constante
  `CSS_CADERNO_A4` deixou de existir. **Falta ele confirmar no aparelho.**
- Menu lateral: pediu árvore recolhível como no app-leitura, descendo até o
  livro. Feito em `painelLateral.ts` (pasta abre ali mesmo; livro abre o
  livro). As capas-emoji foram para `src/conteudo/capas.ts`.

### F3, o que ficou feito

- `src/conteudo/pastas.ts`: a árvore. **Histórias** (Primeiras Aventuras ·
  Entre Bosques e Castelos · Clássicos · Para pensar) e **Alfabetos**. Livro
  novo: pôr o id na pasta; sem pasta, cai em Clássicos e o teste avisa.
  Ids de pasta ficam salvos por perfil — não renomear (o rótulo pode).
- `telaEstante.ts`: mostra a pasta escolhida, em seções; três botões de
  pasta no alto (Histórias · Alfabetos · Anotações). A última pasta fica em
  `<perfil>:pastaEstante`. O cartão "Minhas anotações" saiu da grade (virou
  botão no alto e item do menu).
- `painelLateral.ts`: o avatar da barra abre o menu em qualquer tela.
  Gaveta com foco preso, Esc/✕/toque fora; 📌 fixa em tela ≥ 1200 px
  (`<perfil>:painelFixo`). "Trocar de perfil" está no pé do menu, sem trava.
  `main.ts` liga tudo com `configurarPainel` e `marcarLocal`.
- A barra do topo não mudou de altura nem ganhou botão.
- 71 testes (6 novos em `pastas.test.ts`); build verde.

### F3, decisões minhas que o Bruno pode desfazer

- Os nomes e emojis das pastas, e onde cada livro mora: a Lebre e as três
  fábulas de Esopo antigas foram para **Clássicos**, junto do Pequeno
  Príncipe; Nina, Sócrates e Renê para **Para pensar**.
- O avatar deixou de trocar de perfil num toque (agora são dois).
- A estante abre em "Histórias" inteira, com as quatro coleções em seções.
- Não existe pasta "Ferramentas": as anotações são um item solto do menu.
- A pasta "Números" não existe ainda — nasce com a F4.

### F3, o que ficou de fora

- Animação da gaveta (de propósito; ver ACESSIBILIDADE.md).
- A tela Aparência monta a própria barra (sem avatar): de lá não se abre o
  menu. Voltar um passo resolve.

### F2, o que ficou feito

- `motorImpressao.ts`: `imprimirDocumento(titulo, corpoHtml, css)` mantém a
  assinatura, mas não usa mais iframe. A folha é montada no documento, num
  shadow DOM (`#area-impressao`), escondida na tela; na impressão o resto do
  app se esconde e vale `window.print()`. `@page` e `@font-face` sobem para o
  documento; `html`/`body`/`:root` do CSS da folha viram `:host`. Limpa em
  `afterprint`. Vale para TODA impressão do app (cenas, fichas, cadernos,
  tabelas).
- `folhaPintada.ts` (texto para texto, testável sem navegador): arte com as
  cores + traços como imagem + contorno preto por cima — a mesma pilha de três
  camadas da tela. Traços redesenhados a 2480 px pela mesma função da tela
  (`desenharTracos`, agora exportada de `camadaPincel.ts`).
- Tela de pintar: 🖨️ pergunta "Só o contorno" ou "Do jeito que eu pintei";
  vale também para as fichas de alfabeto.
- Lupa: `zoomPinca.ts` ganhou `definir()`, `mover()` e `aoMudar()`. Botão
  cicla 1× → 2× → 3× → 1× com o número escrito; setas aparecem com zoom;
  teclas `+ − 0` e setas; Ctrl+roda.
- 65 testes (8 novos em `folhaPintada.test.ts`); build verde.
- Impressão REAL conferida em PDF (Chromium sem janela de
  `%LOCALAPPDATA%\ms-playwright`, com `--print-to-pdf` numa página de teste
  temporária que chamava as funções do app): cena P&B e cena pintada = 1
  página A4 paisagem; ficha pintada = 1 página A4 retrato; caderno de 3 = 3
  páginas. A página de teste foi apagada.

### F2, o que o Bruno precisa testar no iPhone (é o ponto da fase)

`npm run build`, `npm run preview -- --host`, abrir `http://<IP-do-PC>:4173`:
1. 🖨️ → qualquer opção → abre a folha de impressão do iOS? No Safari e no
   app instalado na tela inicial.
2. Sai 1 página A4 com as cores?
3. Se a PRIMEIRA tentativa não abrir e a segunda abrir: é a espera da fonte
   (até 1,5 s longe do toque) — avisar, tem conserto simples (pré-carregar).
4. Se nada abrir: construir o plano B (abrir a folha em aba nova).

### F2, o que ficou de fora

- Plano B do iOS (aba nova) — só se o teste falhar.
- Caderno inteiro pintado.
- Folha pintada em impressora preto e branco (cores viram cinzas parecidos).

### F5, o que ficou feito

- `src/telas/espacamento.ts`: `ENTRELINHAS` (1,2 · 1,4 · **1,7 padrão** · 2,2)
  e `ESPACAMENTOS` (0 · 0,06em · 0,12em; palavra = 3× a letra), com os
  **mesmos ids e valores do app-leitura**, e `naGrade()`.
- `preferencias.ts`: corpo e entrelinha encaixados em pixel inteiro do
  aparelho (`--tamanho-base`, `--reading-entrelinha-px`), refeitos no `resize`;
  `--reading-line-height`, `--reading-letter-spacing`, `--reading-word-spacing`;
  chaves por perfil `<perfil>:entrelinha` e `<perfil>:espacamento`;
  `comAncoraDeLeitura()` — o A−/A+ não perde mais o lugar da leitura.
- Aparência: "Espaço entre as linhas" e "Espaço entre as letras", com texto de
  ajuda na voz da criança (o próprio texto de ajuda muda junto, porque a
  prévia fica fora da vista lá no alto).
- CSS: bloco "prosa" (história, quiz, anotações, prévia); coluna em `52ch`
  no lugar de 760px; margem do parágrafo `1em`; palavra longa quebra em vez de
  rolar a página de lado; o grego tem piso próprio de entrelinha.
- 57 testes (5 novos em `espacamento.test.ts`); build verde.

### F5, o que mudou para quem já usa

- A entrelinha padrão subiu de 1,6 para **1,7**. Theo e Davi vão ver as linhas
  um pouco mais afastadas sem terem pedido. O Bruno decide se o padrão das
  crianças fica 1,7.
- A coluna de leitura em tela larga passou de 760px para ~770px (OpenDyslexic)
  ou ~630px (Cardo): varia com a fonte, de propósito.

### F5, o que não foi feito ou não foi provado

- Grade de pixels vista só em densidade 1 (conta testada para as outras;
  ninguém olhou num iPhone). Detalhe em `docs/ACESSIBILIDADE.md`.
- Peso do traço (Fina/Média/Grossa) não foi portado.
- O guia da professora ainda não tem a explicação clínica do espaçamento
  (ceratocone, astigmatismo, dislexia) — o plano manda pôr lá, não na tela.

### Proposta de norma para o Bruno avaliar (NÃO editei o NORMAS.md)

> **N80 — Espaço de leitura.** Todo app do ecossistema que mostra prosa
> oferece ao leitor, por perfil ou por aparelho: (a) entrelinha em múltiplos
> do corpo, com os ids e valores `minima` 1,2 · `compacta` 1,4 · `normal` 1,7
> (padrão) · `ampla` 2,2 — 1,2 é piso por causa do grego politônico e do
> hebraico vocalizado; (b) espaço entre letras em `em`, com `normal` 0 ·
> `amplo` 0,06 · `muito-amplo` 0,12, e o espaço entre palavras sempre 3× o de
> letras; (c) corpo e entrelinha arredondados a pixel inteiro do aparelho
> antes de irem para a tela, guardando o valor pedido; (d) coluna medida em
> `ch`, entre 45 e 75 letras por linha no espaço normal. As variáveis CSS têm
> os mesmos nomes em todos os apps: `--reading-line-height`,
> `--reading-entrelinha-px`, `--reading-letter-spacing`, `--reading-word-spacing`.

### F1, o que ficou feito

- `src/canvas/cores.ts`: 20 cores-base, 5 tons cada (branco e preto, um só) =
  92 cores com nome único (já escrevi 98 aqui: estava errado). `nomeDaCor(hex)`, `matizDe(hex)`. As 14 cores já
  publicadas mantêm o hex; "Verde-claro" passou a se chamar "Verde-limão"
  (senão o tom seria "Verde-claro claro"). Novas: Verde, Turquesa, Lilás,
  Bege, Vinho, Verde-oliva. O formato salvo da pintura não mudou.
- Tela de pintar: nome da cor sempre escrito (só o nome), amostra, botão
  **Tons** (um toque) e toque longo de 450 ms no poço (os dois abrem a mesma
  fileira), botão 🔊/🔇 de voz, ✓ na cor escolhida, poços de 52 px.
- Voz: preferência por perfil `<perfil>:falarCores` (padrão desligada), com
  botão na própria tela de pintar e em Aparência → "Cores de pintar".
- A ordem da paleta foi **medida**: `src/canvas/visaoDeCores.ts` simula
  protanopia, deuteranopia e tritanopia, e o teste exige que nenhuma cor
  encoste numa parecida, na grade de 5 colunas (celular) e na de 10. Por isso
  a paleta virou grade fixa. **Mexeu na ordem, nas cores ou nas colunas da
  grade: rodar `npm test`** (e manter `COLUNAS_PALETA` igual ao CSS).
- 52 testes (11 novos em `cores.test.ts`); build verde. Conferido no Chromium
  em 390×844 e 1280×900, sem rolagem horizontal e sem erro de console.

### F1, o que só o iPhone do Bruno confirma

Servir com `npm run build` e `npm run preview -- --host`, abrir
`http://<IP-do-PC>:4173` no iPhone (mesma rede). Conferir: (1) o nome aparece
ao tocar; (2) o toque longo abre os tons sem abrir menu do iOS; (3) a voz
fala ao tocar na cor — a fala sai 120 ms depois do toque e não sei se o
Safari aceita; (4) o Bruno, com protanomalia, olhar se a ordem nova ajuda.

### Decisões que tomei e o Bruno pode desfazer

- Nome "Verde-limão" no lugar de "Verde-claro"; os seis matizes novos.
- A ordem da paleta deixou de ser arco-íris (é o preço de afastar as cores
  confundíveis). Se as crianças estranharem, a alternativa é voltar ao
  arco-íris e confiar só no nome escrito.
- Botão de voz também na tela de pintar (o plano só pedia em Aparência, mas a
  tela de pintar não tem o 🎨 na barra).

### Ficou de fora da F1

- A pintura já feita não tem nome (só a cor escolhida tem).
- O desenho não é operável por teclado/leitor de tela (era assim antes).
- Poços do "Monte o seu" (Aparência) ainda têm hex como nome falado.
- Node local é 20.20.2; o `.nvmrc` pede 24. Os testes passaram mesmo assim.

## Publicação das coleções autorizada — 15/10/2026

O usuário autorizou expressamente: “Pode publicar no site por favor”.
A autorização abrange a versão revisada na prévia: primeira e segunda coleções,
correção das aves e identidade tipográfica. A integração de
`codex/segunda-colecao` na master está autorizada para esta publicação.
As indicações de “aguarda autorização” abaixo são registros históricos e ficam
superadas por esta entrada. O fluxo de publicação executa testes e build no
GitHub Actions antes de atualizar o GitHub Pages.

Conteúdo final previsto: 28 histórias e dois alfabetos, com as 24 cenas de
Entre Bosques e Castelos e as 27 cenas da primeira entrega. PDFs e ZIPs continuam
na pasta de colaboração; não fazem parte do pacote web desta publicação.
As pendências pedagógicas e técnicas descritas abaixo permanecem válidas.

A master recebeu `fdc9b79`, mas a primeira publicação (Actions 38798916802)
foi corretamente interrompida pelo teste de 50 mil linhas: 4,81 s no servidor
com Node 20, acima do limite de 4 s. Localmente, Node 20 também excedeu o limite;
os outros 40 testes passaram e o build passou. A mesma suíte, sem alterar o
motor nem o teste, passou integralmente com Node 24 e um worker. O workflow
passa a ler Node 24 de `.nvmrc` e usa `npm test -- --maxWorkers=1` para não
disputar CPU entre suítes. Node 24 consta como LTS na
[tabela oficial](https://nodejs.org/en/about/previous-releases).

**Publicação confirmada:** `5312b3f` integrado e enviado à master. O
[Actions 38822990290](https://github.com/brunogreinert2/app-infantil/actions/runs/38822990290)
concluiu testes, build e deploy com sucesso. Em `https://historinhas.app.br/`,
Chromium confirmou os 30 livros (28 histórias e dois alfabetos), as oito novas
histórias com três cenas cada, pintura por toque, cores persistidas, montagem
do quebra-cabeça e recarga offline. Viewport 390×844 sem transbordamento nas
leituras verificadas; nenhum erro JavaScript. A publicação está concluída.
Este registro final é documental, mantido na branch de trabalho para evitar
disparar outra publicação idêntica só pela atualização do relatório.

## Segunda coleção: Entre Bosques e Castelos — 15/10/2026 (Codex)

Branch `codex/segunda-colecao`, criada de `d87df7c` (primeira coleção e fontes).
O usuário pediu uma segunda coleção completa. Nenhum merge ou push na master;
o conteúdo desta branch inclui também a entrega anterior ainda em revisão.

Oito novos recontos: **Os Músicos de Bremen; A Rainha das Abelhas; O Ganso de
Ouro; O Rouxinol e o Imperador; A Princesa e a Ervilha; Os Três Porquinhos;
Cachinhos e os Três Ursos; João e o Pé de Feijão**. Cada um tem 459–508 palavras,
três capítulos, três cenas e três perguntas com explicação. São adaptações livres
com desfecho, não traduções integrais; indicação presente também na leitura.
Fontes históricas, alterações de enredo e sugestões pedagógicas documentadas em
`docs/COLECAO_BOSQUES_CASTELOS.md`. Sem tradução portuguesa contemporânea copiada.

24 SVGs novos `colecao02-*`, regiões brancas e linhas pretas, máscaras de oclusão
para impressão limpa. Sem texto nem dependência de fonte dentro das cenas.
Registro isolado em `src/conteudo/colecaoBosquesCastelos.ts`; estante com 28
histórias e dois alfabetos (31 cartões contando o caderno de anotações).
Geradores reproduzíveis em `scripts/bosques-castelos/`. Nenhum arquivo do motor,
ID anterior, texto anterior ou imagem de coleção anterior foi modificado.
O teste da primeira coleção agora aceita crescimento da estante sem exigir
exatamente 22 livros. Quatro novos testes cobrem registro, cenas, quiz e SVGs.

Validação: **41 testes passaram**, build com TypeScript, carimbo do motor,
PWA e surrogatas passou. Bundle principal ~4,84 MB bruto / 850 KB gzip;
precache ~5,34 MiB. Continua o aviso conhecido de chunk grande. O teto de 6 MiB
por arquivo foi preservado. Uma repetição acidental de formas no desenho do
gigante foi detectada pelo build e corrigida antes da entrega; teste limita o
tamanho de cada novo SVG para evitar recorrência. A próxima coleção merece
avaliar divisão do bundle preservando o precache offline.

No Chromium, todas as 24 cenas passaram por leitura, toque para pintar,
desfazer, persistência, montagem de quatro peças e vitória. Viewport 390×844
sem rolagem horizontal; zero erros de página e zero pedidos externos.
Uma resposta errada em Bremen revelou a explicação e permitiu concluir.
Após recarregar offline, João e sua terceira cena continuaram disponíveis.
A impressão real do app produziu uma página A4 paisagem.

Pacote: `C:\CHATGPT\App-Infantil\colecao-bosques-castelos`, ZIP ao lado.
Inclui 8 Markdown, 24 SVGs, HTML de leitura sem JavaScript, guia, licenças,
**PDF de leitura com 34 páginas A4 retrato** e **caderno com 24 páginas A4
paisagem**. Todas as páginas renderizadas e inspecionadas; margens, dimensões
e presença integral dos 72 parágrafos conferidas. Fontes realmente presentes
no PDF de leitura: somente Cardo, Atkinson Hyperlegible e OpenDyslexic.

Prévia local: `http://127.0.0.1:4176/` servindo o build atual. Pode ser reiniciada
com `npm run preview -- --host 127.0.0.1 --port 4176`.
Materiais de revisão/QA e exportação também permanecem na pasta desta conversa,
em `work/segunda` e `outputs/colecao-bosques-castelos`.

Pendentes: revisão do usuário e autorização antes de integrar/publicar;
Lobato e continuação do Pequeno Príncipe ficam para outra entrega. Validação
com crianças/professoras, rolo geral sem JS e auditoria ampla de acessibilidade
continuam pendentes. A apresentação UFRGS segue prevista para 01/12/2026 ou
08/12/2026, ainda sem data escolhida.

## Identidade tipográfica — 14/10/2026 (Codex)

Escolha expressa do usuário: Cardo nas letras grandes de pintar, inclusive
latinas; Cardo no grego, Atkinson nas legendas e OpenDyslexic na leitura.
Branch continua `codex/colecao-primeiras-aventuras`, sem publicação autorizada.

`gera-glifos.mjs` agora usa Cardo Bold para os 122 glifos de pintura e
Atkinson/Cardo para legendas. Cardo TTF descompactada dos WOFF2 locais em
`scripts/fontes/` permite geração via Node, sem depender de Python no build.
85 fichas exportadas novamente; todos os IDs de regiões e sua ordem preservados.
A mudança de forma da letra não apaga cores salvas; traços livres anteriores
continuam nas coordenadas originais e podem não acompanhar o novo contorno.

As cinco ilustrações antigas que continham `<text>` passaram a incorporar
Atkinson no próprio SVG. Aparência oferece Cardo/Atkinson/OpenDyslexic: a chave
persistida `padrao` foi mantida e agora significa Cardo. O grego usa Cardo
também na leitura. A chave `codigo` das anotações usa Atkinson, por solicitação
de limitar a identidade às três famílias; não é mais fonte monoespaçada.
Não foram alterados o texto das notas, a preservação de espaços nem o teclado.
Ícones/emoji continuam como símbolos da interface, fora da tipografia editorial.

Materiais das pastas de colaboração atualizados: alfabetos, guia, caderno das
cinco cenas antigas, coleção de 27 cenas e HTML de leitura. PDFs/HTML incorporam
as fontes; legendas de SVG são vetores. Licenças acompanham os pacotes.

Validação: 37 testes; build com carimbo do motor/TypeScript/PWA/surrogatas passou.
Aviso de chunk grande permanece (~3 MB bruto / 717 KB gzip), precache ~3,68 MiB.
IDs das 85 fichas comparados antes/depois; margens verificadas e folhas renderizadas.
Pintura, desfazer, persistência, impressão individual e caderno completo passaram;
mobile 390px sem rolagem horizontal, offline e zero pedidos externos conferidos.
Inspeção das fontes realmente renderizadas via Chromium confirmou somente as
famílias locais nos textos latinos/gregos testados e nas cinco aberturas SVG.

Impressão: o app prepara HTML/SVG e chama `window.print()`; salvar em PDF é uma
opção da janela do navegador/Windows. PDFs do pacote são cadernos pré-gerados.
Não há necessidade de implementar uma biblioteca de PDF no app para esse fluxo.

## Coleção Primeiras Aventuras — 14/10/2026 (Codex)

Revisão visual após feedback do usuário: as cegonhas das páginas 03/27 e 04/27
e os cisnes de 24/27 tinham corpos muito finos. O contorno foi refeito sem
cruzamentos internos, com peito/barriga arredondados e asas maiores. A ave da
página 23/27 recebeu o mesmo ajuste para manter consistência. Foram preservados
todos os IDs e a ordem das regiões pintáveis nas quatro cenas. PDF e pacote
de colaboração atualizados. A coleção continua em revisão, sem publicação.

Branch: `codex/colecao-primeiras-aventuras`, criada da master publicada
`1034e22`. O usuário pediu ampliar o acervo com histórias de domínio público,
ilustrações para pintar e quebra-cabeças. Esta entrega grande fica na branch
para revisão; não integrar nem publicar sem a próxima autorização.

Entregues **12 histórias novas**: O Corvo e o Jarro; A Raposa e a Cegonha;
O Rato do Campo e o Rato da Cidade; A Formiga e a Pomba; O Cachorro e o Reflexo;
O Galo e a Pérola; O Carvalho e os Juncos; Os Ratinhos e o Sino; A Panela de
Mingau; Os Duendes e o Sapateiro; A Roupa Nova do Imperador; O Patinho e Seu Lugar.
São adaptações livres próprias de Esopo, Grimm e Andersen, com 204–243 palavras,
dois capítulos, duas imagens e duas perguntas por história. Fontes históricas,
licença e mudanças de enredo: `docs/COLECAO_PRIMEIRAS_AVENTURAS.md`.

**27 SVGs novos**, somente contornos pretos e regiões brancas: 24 nas histórias
novas e três para Leão/Ratinho, Raposa/Uvas e Vento/Sol. Esses três textos antigos
permanecem idênticos; só receberam asset e imagem no final. Nenhum ID publicado,
SVG antigo ou arquivo de `src/motor/` mudou. A estante tem 20 histórias e dois
alfabetos. Registro isolado em `src/conteudo/colecaoPrimeirasAventuras.ts`.
Gerador e pós-processador de máscaras em `scripts/primeiras-aventuras/`.
Não remover máscaras: são necessárias para contornos limpos ao imprimir.

Durante o teste mobile, os seis botões de ferramentas da pintura ultrapassavam
a largura da tela. O grupo agora quebra em linhas e mantém todos acessíveis.

Validação: `npm test` **36/36**; `npm run build` passou com TypeScript, carimbo
do motor, PWA e checagem de surrogatas. Continua o aviso de chunk grande:
bundle principal ~2,41 MB bruto / 429 KB gzip; precache ~3,12 MiB, abaixo do teto
de 6 MiB por arquivo. Não esconder nem aumentar limites para calar o aviso.
No Chromium, as 27 cenas passaram por leitura, pintura por toque, desfazer,
persistência, montagem de quatro peças e vitória, em viewport 390×844 sem
rolagem horizontal. Resposta incorreta não impediu concluir o Corvo.
A versão de produção também abriu a segunda imagem do Patinho após recarga
offline. A impressão real do app produziu uma folha A4 paisagem. O caderno
externo tem 27 páginas A4 paisagem, todas renderizadas e conferidas.

Pacote para revisão/professoras: `C:\CHATGPT\App-Infantil\colecao-primeiras-aventuras`:
textos Markdown, SVGs, guia com fontes, HTML de leitura sem JavaScript/internet,
e PDF para pintar. ZIP ao lado da pasta. Não confundir a leitura estática dessa
coleção com o rolo geral do app, que continua pendente.

Pendentes: revisão do usuário antes de publicar; novas coleções de Lobato,
continuação do Pequeno Príncipe e contos populares; avaliar divisão do catálogo
em módulos conforme crescer, preservando o acesso offline. A validação com
crianças/professoras e auditoria geral de acessibilidade continuam importantes;
esta entrega não pretende substituí-las.

## Publicação autorizada — 14/10/2026

O usuário pediu explicitamente o push para atualizar o app. Essa autorização
permite integrar `codex/alfabetos-a4-ludicos` na `master` e enviar a atualização
ao GitHub Pages nesta entrega. O conjunto inclui `af228d0` e as três revisões
do motor que já estavam na master local (`8db0b2a`, `1539175`, `de609d4`).
Antes do envio, `npm test` passou com 30 testes e `npm run build` concluiu
normalmente. Nenhum arquivo de `src/motor/` foi editado nesta tarefa.
Consultar a última execução de “Publicar no GitHub Pages” e o bundle de
https://historinhas.app.br para confirmar o estado da publicação.
Novas alterações continuam exigindo branch própria e revisão conforme o escopo.

## Retomada lúdica — 14/10/2026 (Codex)

Branch de trabalho: `codex/alfabetos-a4-ludicos`. **Nunca fazer commit,
merge ou push na master nesta tarefa.** O conjunto A4 e esta revisão ficam
na branch para revisão antes de qualquer publicação. Identidade Git já
configurada: Diaphoreus; não atribuir autoria/coautoria ao nome do usuário.
Não editar `src/motor/` nem renomear IDs publicados.

Pedido mais recente: o app continua sendo uma brincadeira para a criança
de 7 a 9 anos em casa. O material de professoras é apoio, não deve tornar
a leitura do app uma aula dirigida ao adulto. As 24 dicas gregas e as 26
letras portuguesas ganharam convites para imaginar, sons e pequenas cenas.
`src/conteudo/alfabetoBrincadeiras.ts` contém os textos infantis. A convenção
de grego antigo permanece; Zeta continua ZD, θ/φ/χ continuam aspiradas.
Ômega volta a dizer “Do alfa ao ômega!”. Orientações de mediação ficaram
nas fichas A4 e no guia; o bloco final para adultos foi retirado da leitura.
Os SVGs de sala de aula continuam iguais aos já conferidos.

Validação final desta revisão: `npm test` passou com 30 testes;
`npm run build` passou no próprio repositório com a configuração normal,
incluindo carimbo do motor, TypeScript, PWA e surrogatas. Permanece apenas
o aviso de tamanho de chunk do Vite. Os bloqueios do ambiente e a oscilação
do teste de tempo registrados na entrega anterior não se repetiram nessa
execução. Sem alteração do limite de tempo e sem modificação do motor.

## Entrega A4 — 14/10/2026 (Codex)

Bruno confirmou o nome **Historinhas**, https://historinhas.app.br.
Apresentação na UFRGS, disciplina **Intervenção Pedagógica e Necessidades
Educativas Especiais**, em **01/12/2026 ou 08/12/2026**, ainda a definir.
Essas decisões estão em `docs/MEMORIA_PEDAGOGICA.md`; não perguntar novamente
o nome, a preferência por contornos pretos nem qual variedade de grego usar.

Alfabetos refeitos em A4: 46 folhas de português e 39 de **grego antigo**,
com convenção ática explicitada. Tabela inteira em uma folha, uma por letra,
ditongos, dígrafos e complementos. Os botões de impressão usam as mesmas
artes do app e incluem caderno completo. IDs publicados preservados.
Os cinco desenhos de histórias aprovados por Bruno também foram integrados.

Pacote em `C:\CHATGPT\App-Infantil\alfabetos-a4`: 85 SVGs, cadernos PDF,
guia de professoras e cinco cenas em A4 paisagem. Detalhes, fontes,
comandos, validação e limites: `docs/ALFABETOS_A4.md`.

Conferidos pintura, desfazer, persistência, impressão, mobile e offline.
O conversor de glifos agora fecha explicitamente os contornos: a otimização
anterior apagava segmentos em letras como L quando usadas sem fill.
Não houve push/publicação. As pendências de rolo sem JavaScript e de
auditoria geral dos temas estão documentadas; não dizer que foram resolvidas.

Os registros abaixo são históricos; números de testes/tamanhos e a indicação
de que o domínio próprio é futuro estão desatualizados.

> Escrito por Claude Fable 5 (últimas sessões do Bruno com esse modelo,
> 2026-07-19/20). Qualquer Claude (Sonnet, Opus, Haiku) continua daqui
> sem precisar de NENHUM contexto da conversa original.

## 🔑 CHAVE DE RETOMADA — copie e cole num chat novo do Claude Code

> **"Continue o app infantil em C:\Claude\app-infantil. Antes de qualquer
> coisa, leia nesta ordem: CLAUDE.md, docs/CONTINUAR_AQUI.md,
> docs/FORMATO_LIVRO.md e ESPECIFICACAO.md. Rode npm test e npm run build
> para confirmar que está tudo verde. Depois siga a FILA DE TRABALHO do
> CONTINUAR_AQUI.md, uma tarefa por vez, committando em português ao fim
> de cada uma e atualizando o próprio CONTINUAR_AQUI.md antes de encerrar
> a sessão."**

Regras de sobrevivência para o próximo Claude:
1. NUNCA começar do zero — tudo funciona e está testado (23 testes, build
   limpo, 8 rodadas committadas no git local).
2. Toda sessão TERMINA atualizando este arquivo + commit. Créditos do Bruno
   são escassos; a sessão pode morrer a qualquer momento.
3. Decisões do Bruno já tomadas não se rediscutem (zero-gate, recompensa
   fixa, OpenDyslexic padrão, nunca estado só por cor, sempre A4).
4. A memória persistente (MEMORY.md do diretório C:\Claude) tem o contexto
   humano: Theo (7), Davi (9, ama grego), protanomalia do Bruno, os R$5.

## 🌐 OPERAÇÃO — o app está PUBLICADO

- **URL: https://brunogreinert2.github.io/app-infantil/** (repo público
  `brunogreinert2/app-infantil`, GitHub Pages via Actions).
- **Publicar atualização = `git push origin master`** — o workflow roda
  `npm test` + `npm run build` e sobe sozinho (~1 min). Se falhar, ver
  `gh run list` / `gh run view <id> --log-failed`.
- É **PWA**: no tablet/celular, abrir a URL no navegador → "Adicionar à
  tela inicial" → vira app com ícone 🌈, tela cheia e 100% offline após a
  primeira visita (service worker precacheia tudo, ~340 KB).
- Nota CI: o workflow usa `npm install` (não `npm ci`) porque o lockfile
  gerado no Windows do Bruno omite binários opcionais de outras plataformas.
- Domínio próprio (tipo historinhas.app.br) é opcional futuro — mesmo
  fluxo do pedraangular.app.br (registro.br + CNAME no Pages).

## Rodada 15 — o motor do ecossistema (2026-10-02, Claude Opus 5.5)

O Historinhas passou a ler pelo **mesmo motor do Pedra Angular** (passo 5 de
`C:\Claude\parser\proposta.md`, opção (c): "os dois parsers são iguais mas
moram cada um dentro do seu app").

- `src/motor/ecossistema/` = **cópia carimbada** do motor; a fonte é
  `C:\Claude\parser\motor\`. Nunca editar aqui: `npm run build` começa por
  `scripts/conferir-motor.mjs`, que barra cópia editada à mão. Para mudar:
  editar a fonte, `npm run espalhar` e `npm run tortura` em `C:\Claude\parser`,
  depois `npm test` e `npm run build` aqui.
- `src/motor/parser.ts` pede a leitura ao motor e monta os blocos com os
  MESMOS nomes de antes (c1.., p1.., img1..). Tipo novo `bloco` (citação,
  lista, caixa de nota, fórmula, tabela…) conta como parágrafo. O 🔊 lê o texto
  puro (sem asteriscos; a fonte TeX de fórmula não é lida).
- Prova: os 8 livrinhos dão os mesmos blocos, nomes e textos do parser antigo
  (8/8 idênticos) — nenhum quiz se soltou, nenhum "parei aqui" se perdeu.
- Testes: 23 (eram 19). Dois mudaram, com o motivo escrito neles: `#` sozinho
  é título vazio (CommonMark); a pancada de stress passou a 50 mil linhas em
  < 4 s (o motor é ~9× mais lento que as três regras; os 8 livrinhos juntos
  levam 57 ms).
- Estilos novos em `estilos.css` para citação, caixa de nota, lista, fórmula,
  wikilink, embed; o grego (`.grego`, lang grc) usa a Cardo — a fonte das
  crianças não tem o politônico e o navegador remendava letra a letra.
- Pacote: 63 → 237 KB gzip (motor + fórmula + leitor de HTML).
- `docs/FORMATO_LIVRO.md` virou v2 (o formato é o do ecossistema).
- Configuração `infantil` (porta 5174) criada em `C:\Claude\.claude\launch.json`.

Ainda NÃO feito: o caderno de anotações (`telaAnotacoes.ts`) continua fora do
motor e guardando objeto, não `.md` — isso vem com o editor novo (passo 6 do
parser: CodeMirror com modo Código para os comandos de Minecraft do Davi).

## Rodada 10 — livros do selo do Bruno + app publicado

- **Sócrates e as Duas Cestas** 🏛️ e **O Sonho do Menino Renê** 🌙:
  historinhas escritas pelo Bruno com Sonnet 5, seguindo FORMATO_LIVRO à
  risca (temas próprios, aberturas, 4 quizzes cada). Fable criou as 6
  artes (aberturas: coruja de Atena / vela na janela; colorir: duas
  cestas / quarto do Renê; vivas: Parmênides / mago dos sonhos).
  Insígnias 🧺 Guardião das Duas Cestas e 🕯️ Penso Logo Existo.
- **Padrão novo**: seção final "# Para os adultos que leem junto" com
  contexto histórico + sugestão de conversa — manter nos próximos livros.
- **Colofão adulto (Ὁ Διαφορεύς) não entra no app** — o Bruno o reserva
  para os FUTUROS LIVROS FÍSICOS do selo (ele quer fabricar livros
  próprios, do simples ao luxo — contexto na memória bruno-contexto).
- 7 livros na estante. PWA + Pages + workflow (ver OPERAÇÃO acima).

## Rodada 13 — as NORMAS do ecossistema + piso de acessibilidade (2026-08-08)

- **`C:\Claude\NORMAS.md` passa a valer acima deste arquivo.** Norma rígida
  comum a app-infantil, app-leitura e Rolo_HTML: 7 leis + N1–N59, com tabela
  de conformidade por app. Em conflito, NORMAS.md vence — relatar, não
  resolver em silêncio. Ler o Anexo B ("Para agentes de IA") antes de mexer
  em aparência.
- **Vocabulário de token decidido pelo Bruno: prefixo `--ui-` + nome em
  português** (`--ui-fundo`, `--ui-texto`, `--ui-acento`). Regra: token NOVO
  já nasce com o nome novo; os antigos (`--fundo`, `--destaque`, `--cartao`)
  trocam depois, numa passada mecânica única. Não renomear aos pedaços.
- **Foco de teclado agora existe** (`estilos.css`): token `--ui-foco` +
  `:focus-visible` global com anel de 3px e offset 3px. Antes só
  `.cartao-perfil` e `.cartao-livro` reagiam, e reagiam crescendo 4% —
  aumento de tamanho não é indicador de foco. O token segue `--titulo` no
  tema "Monte o seu" (já passa por `garantirContraste`) e `--destaque` nos
  quatro prontos. Medido: 4,65:1 (Claro) a 14,67:1 (Alto contraste) contra o
  fundo; piso 3:1.
- **`prefers-reduced-motion` agora existe.** Era a lacuna mais feia do app:
  duas animações `infinite` (`peca-dancando`, `pulsar-dica`) e público de 7
  anos. Usa duração de 0.01ms, **não** `animation: none` — `none` mataria o
  `animationend`. O parágrafo retomado não fica sem sinal: o pulso vira fundo
  estático, que o temporizador de 5s da telaLeitura retira igual.
- Verificado ao vivo nos 4 temas prontos + no personalizado; `npm test` 19/19
  e `npm run build` limpos; zero erro de console.
- **Próximo item da fila do ecossistema (NORMAS.md, Anexo A):** tamanho de
  fonte relativo — hoje `preferencias.ts` linha 97 grava `${px}px`, o que faz
  o app ignorar a letra que a pessoa já configurou no aparelho. Tem migração
  do valor salvo dos perfis; fazer com atenção, em sessão própria.
- **Lacuna maior deste app (NORMAS.md N1):** não tem rolo estático. Os 7
  livros só existem dentro do bundle — uma IA que receber o link vê casca
  vazia. É a mesma dor que fez o rolo do Pedra Angular nascer.

## Rodada 14 — OpenDyslexic: o grego que não existia (2026-08-09)

- **Descoberto:** o pacote npm `open-dyslexic` distribui um build de mais de
  dez anos (v2.001, 233 glifos) **sem alfabeto grego**. Como OpenDyslexic é a
  fonte PADRÃO daqui e cada página do livro do alfabeto é `## Α α — Alfa` com
  os caracteres gregos como TEXTO, as 24 letras gregas caíam numa serifada do
  sistema enquanto o resto da página era OpenDyslexic. Justo as letras que o
  livro existe para ensinar, e justo para o Davi.
- **Não afetados:** os pôsteres de colorir (vêm de `glifos.json`, caminhos
  vetoriais da DejaVu) e a tabela impressa (usa Georgia). Era só texto na tela.
- **Resolvido sem mudar o desenho.** O Bruno gosta do build 2.001 e teme que
  trocar deixe o app feio. Então as DUAS faces convivem sob a mesma família,
  com `unicode-range`: a 2.001 para tudo, e a 0.920 (1927 glifos) restrita a
  `U+0370-03FF, U+1F00-1FFF`. O navegador escolhe por caractere.
  **Verificado: a largura do latim é idêntica à de antes (`Aa` = 85,4 px nos
  dois casos); só o grego mudou.**
- **Cuidado com o número da versão:** 0.920 é POSTERIOR a 2.001 — o projeto
  renumerou depois de reescrever a fonte. Conferir a tabela `name` do arquivo
  (ferramenta de build e nome da designer), nunca o número.
- Fontes agora vendorizadas em `src/fontes/`, com a licença junto; a
  dependência npm `open-dyslexic` saiu do `package.json`.
- Custo: precache do PWA foi de 339 KB para 625 KB. O `unicode-range` faria o
  arquivo grego baixar só quando aparecesse grego, mas o service worker
  precacheia tudo — então o ganho de carga preguiçosa não se realiza aqui.
- **Limite honesto:** nas páginas do alfabeto, a letra grega continua com
  desenho diferente do texto latino ao redor (mais fina e mais espaçada), só
  que agora é OpenDyslexic contra OpenDyslexic, não OpenDyslexic contra uma
  serifada qualquer. Se incomodar, as saídas são: usar a 0.920 para tudo
  (unifica, mas muda o app inteiro) ou aceitar.

## Rodada 12 — soberania do usuário sobre temas + plano Capacitor

- **Tema do livro é convidado, nunca dono**: `aplicarTemaDeLivro` agora só
  roda na ENTRADA pela estante (troca no 🎨 no meio da leitura fica valendo)
  e é ignorado quando (a) o perfil marcou "🛡️ Manter sempre o MEU tema"
  (novo controle na Aparência, `temaSoberano` por perfil) ou (b) o tema do
  perfil é alto-contraste — acessibilidade vence decoração SEMPRE, sem
  configuração. Verificado: alto contraste + Pequeno Príncipe = app preto.
- **docs/CAPACITOR_PLANO.md**: o caminho PWA → app de loja explicado e
  ordenado (8 passos, cada um cabe numa sessão). Decisão do Bruno:
  pedraangular fica PWA leve; infantil vira app robusto (GBs ok, mídia
  pesada via Filesystem, não no bundle). Passo 1 obrigatório: exportar/
  importar dados.
- Contexto novo na memória: Bruno cursa Filosofia na UFRGS e quer
  apresentar o app a professores — polimento importa.

## Rodada 11 — polimento pós-família (v0.2.0)

Família inteira usando (mãe do Bruno leu no ônibus até a praia!). Itens:

- **A+ consertado na estante**: botões HTML não herdam font-size — regra
  global `button { font-size: inherit }` resolveu estante + quiz.
- **🔊 "Ouvir a história"** no topo de todo livro: TTS do texto inteiro
  (para antes da seção dos adultos). **Campo `narracao` no front matter**
  (FORMATO_LIVRO): aponta um asset de áudio e o botão vira 🎙️ tocando a
  GRAVAÇÃO humana no lugar do TTS. Narração por parágrafo = futuro (fila).
- **🔄 Procurar atualização** nos Ajustes (lição do pedraangular: PWA
  segura cache) + aviso de que atualizar nunca apaga pinturas/insígnias
  (localStorage sobrevive a qualquer deploy).
- **Retomada visível**: ao reabrir livro, o parágrafo onde parou pisca
  5s (classe .retomada) — a memória de posição já existia desde a rodada 1.
- **Quebra-cabeça explicado**: instrução na escolha e no tabuleiro; peça
  selecionada agora "dança" (animação) até a troca.
- **Zoom de pinça no colorir** (`src/canvas/zoomPinca.ts`): dois dedos
  ampliam 1x–4x e arrastam, um dedo pinta; botão 🔍 volta ao normal.
  Camadas vivem numa `.lente-zoom` transformada; traço iniciado pelo 1º
  dedo é cancelado quando vira pinça; clique fantasma engolido.

## 📋 FILA DE TRABALHO (em ordem)

1. **Pequeno Príncipe, capítulos 2 em diante** (cap. 1 PRONTO, ver seção
   Rodada 9). Cap. 2 = o encontro no deserto e o "desenha-me um carneiro"
   — pede colorir do carneiro na caixa (a piada visual mais famosa do
   livro: a caixa COM furos). Tradução PRÓPRIA do francês de 1943, tom do
   cap. 1 (fluida, infantil, fiel). Um capítulo por sessão está ótimo.
   São 27 capítulos; âncoras de quiz por capítulo; arte de colorir a cada
   2-3 capítulos.
2. **Fontes de acessibilidade já estão embutidas** — mas falta empacotar
   Capacitor (passo antigo 5): `npx cap init` + `npx cap add android`,
   trocar armazenamento.ts por Preferences+SQLite (schema na spec 8.4),
   TTS nativo, lifecycle. É o passo "app de loja de verdade".
3. **Figurinhas ricas** (evolução das insígnias): arte própria + curiosidade
   falada por TTS ao tocar.
4. **Enigmas** (FORMATO_LIVRO.md §4): alternativas em imagem, zero-gate.
5. **Persistência do quebra-cabeça** (hoje não salva partida pela metade).
6. **Mais historinhas filosóficas**: "a flecha já voou", "o papel no
   teatro" (Epicteto); série tio Aristóteles (coragem como meio-termo,
   amizade, hábito vira caráter). Corpus adulto via MCP pedra-angular.
7. **Testar em Android de entrada** (checklist spec §6).
8. **Narração gravada por parágrafo** (hoje é por livro via `narracao`).
9. **Backup/exportar dados** (pinturas+insígnias) — essencial ANTES da
   migração Capacitor, e útil para trocar de aparelho.
10. **Seção infantil no Pedra Angular compartilhada com este app** (desejo
    do Bruno): mesmo corpus .md servido nos dois — estudar servir os livros
    daqui via catalogo.json como o pedraangular faz.
11. **Importar textos próprios** no app (leituras mais maduras — o público
    adulto da família adotou o app; a mãe do Bruno é usuária ativa).

## Rodada 9 — O Pequeno Príncipe começou (cap. 1 completo e verificado)

- `src/conteudo/livros/o-pequeno-principe.md`: tradução própria do cap. 1
  ("O desenho número 1"), tema dourado-deserto próprio (`tema_livro`),
  abertura cênica `pp_abertura.svg` (noite no deserto, estrela pulsando,
  aviãozinho cruzando o céu), colorir `pp_jiboia_colorir.svg` (o desenho
  número 2: jiboia aberta com o elefante — recriação própria, não cópia
  de edição), 2 quizzes zero-gate, insígnia 🌹 Amigo do Principezinho.
- Padrão a seguir nos próximos capítulos: `## Capítulo N — título`, quiz
  ancorado no parágrafo-chave + quiz de capítulo ao final do livro.

## Rodada 8 — imersão temática por livro + a "linguagem universal"

Visão do Bruno: cada livro é um mundinho (abertura cênica tipo "coruja
entrega o pergaminho", tema próprio, enigmas). Implementado o motor:

- **`docs/FORMATO_LIVRO.md` é a spec da linguagem universal** — leitura
  obrigatória antes de criar livro rico. Front matter completo, 3 regras de
  linha, o que cada tipo de asset ganha de graça, convenções.
- **Tema por livro**: `tema_padrao` (tema pronto) ou `tema_livro`
  (fundo+destaque exclusivos) no front matter → o app inteiro se veste do
  livro ao abri-lo; ao voltar à estante/perfis o tema da criança volta
  sozinho (main.ts chama carregarPreferencias na saída). Demo: Nina =
  azul-chuva próprio; lebre = floresta; alfabeto grego = espaço.
- **Abertura cênica**: `abertura: <assetId>` no front matter → telaAbertura
  mostra o SVG animado em palco cheio (vindo da estante; voltar do colorir
  NÃO repete). Demo: `nina_abertura.svg` (carta desce da nuvem balançando,
  selo de coração, "Chegou uma carta para você..."). Genérico: livro novo
  ganha abertura só declarando o asset.
- **Regra registrada**: fases/gamificação avançam por PARTICIPAÇÃO (fez),
  nunca por acerto — preserva o zero-gate. Enigmas: planejados na spec do
  formato (alternativas em imagem, sem digitação), não implementados.
- Harry Potter licenciado = inviável juridicamente; a riqueza vai toda para
  domínio público (aquarelas do próprio Saint-Exupéry são PD no Brasil).

## Rodada 7.1 — prévia ao vivo na Aparência

Feedback do Bruno: clicar na "cor favorita" parecia não fazer nada (ela só
aparecia lá na leitura). Agora a tela de Aparência tem um cartão de PRÉVIA
("O título fica assim / E o botão fica assim") que reage na hora a qualquer
escolha, as bolinhas de fundo/cor mostram anel de selecionada, e o rótulo
explica: "Cor favorita (pinta títulos e botões)". Títulos de seção e
"Para pensar 💭" também vestem a cor favorita.

## Rodada 7 (mesma data — prova de fogo, visão de cores, imagens vivas)

- **Prova de Fogo do motor** (`npm test`, vitest): 19 testes — parser sem teto
  (profundidade 1000), 200k linhas < 2s, parágrafo de 1MB, `{{img:}}`
  malformado, YAML inválido NÃO derruba mais o app (guard novo em
  frontmatter.ts), fatiador do TTS nunca passa de 240 chars. Rodar `npm test`
  antes de qualquer mexida no motor.
- **Decisão do Bruno (revoga a orientação da spec §5): OpenDyslexic é a fonte
  PADRÃO.** Ele é profissional da óptica (14 anos), tem protanomalia, adorou a
  cara infantil/legível. Continua trocável no 🎨 — padrão ≠ forçada.
- **Visão de cores** (Bruno tem protanomalia — ver memória bruno-contexto):
  quiz revela com ✓/✗ + cor (nunca cor sozinha); paleta de pintura com nome
  falável em cada cor (aria-label + title). REGRA DA CASA daqui em diante:
  nenhum estado comunicado só por cor.
- **"Cor favorita" agora pinta os títulos** (`--titulo`), com
  `garantirContraste()` no tema personalizado (mistura em direção ao texto
  até ≥4.5 WCAG — verificado: vermelho em fundo azul-noite virou #e1707a).
- **Papel de parede com marca d'água por tema** (ideia do Bruno): estrelas +
  planeta no Espaço, folhinhas na Floresta, arcos no Claro; alto contraste
  fica LIMPO de propósito. Data URIs em estilos.css (--papel).
- **Imagens vivas ("jornal do Harry Potter")**: `nina_chuva_viva.svg` —
  SVG animado por CSS puro (nuvem flutua, gotas caem, poça ondula), tipo
  `ilustracao`. GIF também funciona (é raster comum via arquivosImagens).
  Convenção: prefixar classes/keyframes com o nome do arquivo (ncv-*) para
  não colidir. Direção de conteúdo do Bruno: qualidade das obras — imagens
  bonitas, vídeos curtos lúdicos e "mágicos".

## Rodada 6 (mesma data — aparência, fontes de acessibilidade, mídia)

- **TTS no Chrome do Bruno**: diagnóstico — o problema é do Chrome dele
  (nem pedraangular.app.br toca; Edge funciona). Checar
  chrome://settings/content/sound e vozes pt-BR no Windows. O código segue
  com os 3 contornos da rodada 5.
- **🔊 no cabeçalho lê o capítulo inteiro** (todos os parágrafos até o
  próximo cabeçalho), além do 🔊 por parágrafo.
- **Tela de Aparência** (`telaAparencia.ts`, botão 🎨 na barra, SEM trava —
  é da criança): 4 temas prontos com foco acessibilidade (Claro, Floresta
  agora bem distinta, Espaço, **Alto contraste** preto/branco/amarelo estilo
  Perkins), fontes **Atkinson Hyperlegible** e **OpenDyslexic** (empacotadas
  no bundle via @fontsource e open-dyslexic — zero CDN; OpenDyslexic é opção,
  nunca padrão), tamanho, e **"Monte o seu"**: criança escolhe fundo (12) +
  cor favorita (10); texto/cartão/borda são DERIVADOS por luminância
  (`derivarPaleta` em preferencias.ts) — nunca fica ilegível. Tudo por perfil.
- **Áudio e vídeo como assets**: tipos `audio`/`video` no front matter,
  arquivo registrado em `arquivosImagens` (?url), `{{img:id}}` no texto →
  player nativo com controles, sem autoplay. Mesmo pipeline das imagens.
- Barra do topo enxuta: A− / A+ / 🎨 (os 3 botões de tema saíram de lá).

## Rodada 5 (mesma data — motores: TTS de vez, quebra-cabeça, ajustes/perfis)

- **TTS reescrito de vez** (`src/tts.ts`): além do atraso pós-cancel, agora
  contorna os DOIS outros bugs do Chrome — utterance coletado pelo GC no meio
  da fala (referência viva em módulo) e fala longa que para aos ~15s (texto
  fatiado em pedaços ≤180 chars encadeados por onend + resume periódico +
  voz pt-BR selecionada explicitamente). Se AINDA falhar em algum aparelho,
  o plano definitivo é o TTS nativo do Capacitor (passo 5 da lista).
- **Quebra-cabeça** (`src/telas/telaQuebraCabeca.ts`): botão 🧩 em todo
  desenho de colorir; monta a arte COM as cores que a criança pintou;
  4/6/9/12/16/20 peças; recorte por viewBox (nada de imagem rasterizada);
  interação toque-para-trocar; vitória = confetes. Estado NÃO persiste entre
  saídas (evolução futura).
- **Ajustes + gestão de perfis** (`src/telas/telaConfiguracoes.ts`): botão
  ⚙️ discreto na tela de perfis → trava parental (multiplicação 6-9 × 6-9)
  → criar/editar/excluir perfis (16 avatares, faixas etárias; exclusão em
  dois toques apaga TODOS os dados do perfil via `armazenamento.chaves()`).
  Troca de perfil continua SEM trava (spec 8.6).
- **Imagens ilimitadas por livro**: tipo `ilustracao` renderiza SVG como é
  (sem contorno); raster PNG/JPG entra por `arquivosImagens` no catálogo
  (`import x from './assets/x.png?url'`). Guia atualizado.
- **Vogais logo abaixo da tabela completa** nos livros de alfabeto (pedido
  do Bruno).

## Rodada 4 (mesma data — pôsteres pintáveis + primeira historinha filosófica)

- **Pôsteres pintáveis** nos livros de alfabeto (gerados em `alfabetos.ts`):
  "A tabela inteira para pintar" (todas as letras num SVG só, retrato) e
  "Vogais e ditongos/encontros para pintar". Regiões podem ser `<g>` (grupo
  inteiro = uma região). Tela de colorir e impressão agora respeitam o
  viewBox (retrato → A4 portrait automático).
- **Primeira historinha filosófica autoral**: "O Que Depende de Mim"
  (`o-que-depende-de-mim.md`) — dicotomia do controle de Epicteto virou a
  Nina e o piquenique na chuva. Cena de colorir própria (`nina_colorir.svg`),
  quiz ancorado + de capítulo, insígnia 🏺 Pequeno Filósofo. Valida o
  pipeline do gênero que o Bruno quer expandir ("tio Aristóteles").
- **Guia de conteúdo**: `docs/COMO_ADICIONAR_LIVROS.md` — receita completa
  com template, regras de domínio público (Pequeno Príncipe: tradução PRÓPRIA
  do francês, nunca copiar edição comercial) e fila de ideias encomendadas.

## Rodada 3 (mesma data — Davi pintou o alfabeto grego INTEIRO; Theo ofereceu R$5 pelo app)

- **Letras agora são caminhos vetoriais** (`src/conteudo/glifos.json`, gerado por
  `npm run gera:glifos` a partir da DejaVu Serif Bold via opentype.js, build-time).
  Motivo: `<text>` no SVG captura cliques pela caixa retangular inteira do
  caractere — o vão do A/O nunca deixaria o clique passar. Com caminho, o furo
  é real: clique no vão pinta o AZULEJO local (regiao-quadro-*), novo em cada
  página de letra. Bônus: glifo idêntico em qualquer aparelho/WebView.
  Se mudar o conjunto de letras, rodar `npm run gera:glifos` de novo.
- **Paleta ganhou branco e preto** (a criança escolhe branco em vez de "deixar
  sem pintar"; poço branco tem borda cinza p/ não sumir).
- **Preview não vaza mais cor**: regiões não pintadas ficam brancas opacas no
  contorno do preview (antes a nuvem branca aparecia azul-céu).
- **Tabelas de referência imprimíveis A4** (`src/impressao/tabelas.ts`), botões
  no topo dos livros de alfabeto: grade completa (grego mostra o nome EM grego:
  Αλφα, Βητα…; latino mostra a palavra-exemplo), "Vogais e Ditongos Gregos"
  (espelho da tabela de estudo do Bruno) e "Vogais e Encontros" do português.
- `motorImpressao.ts` refatorado: `imprimirDocumento(titulo, corpo, css)` genérico.

## Rodada 2 (mesma data, após teste real com Theo e Davi)

Feedback aplicado e verificado no navegador:

- **Insígnias** (`src/conquistas/insignias.ts`): fixas e previsíveis, inspiração
  Pokémon SEM aleatoriedade. Livro concluído → insígnia certa (lebre 🏆, grego Ω,
  ABC 🔤); marcos fixos: 3 livros → 🦉 Coruja Leitora, 5 → 🏛️ Grandes Clássicos.
  Aparecem sob o nome na tela de perfis e no rodapé do livro lido.
- **Botão "✓ Terminei este livro!"** no fim de cada livro → status `concluido`,
  confetes, insígnia. Estante mostra "⭐ Lido". Tela de colorir tem "✓ Pronto!".
- **Alfabetos gerados por código** (`src/conteudo/alfabetos.ts`): O Alfabeto
  Grego (24 letras) e O Alfabeto (26 letras), uma página de colorir por letra
  (letra = região SVG `<text>` preenchível), com nome + dica de som + TTS.
  Pedido do Davi. Passam pelo pipeline normal (markdown gerado + carregarLivro).
- **Confetes** (`src/efeitos/confete.ts`) ao acertar quiz e ao terminar.
- **Preview colorido**: cartão de imagem na leitura usa `derivarContornoPB` +
  aplica as cores salvas da criança (antes o preview era branco-no-branco).
- **TTS consertado** (`src/tts.ts`): bug clássico Chrome/Windows — speak() logo
  após cancel() trava a voz; agora há atraso de 80ms + resume() a cada 10s.
  Botão 🔊 vira ⏹ enquanto fala (botão de parar).
- **Impressão sempre A4 paisagem** (`@page size: A4 landscape`), título +
  desenho numa página só (antes quebrava em 3).
- **História da lebre ganhou o final do Theo e do Davi**: a tartaruga levanta
  o troféu e vai para casa. Preservar — é a contribuição autoral deles.

## Estado em 2026-07-19 (o que JÁ FUNCIONA, verificado no navegador)

- Fluxo completo: seleção de perfil (Theo/Davi semeados) → estante → leitura
  → quiz zero-gate inline (testado: resposta errada revela a correta + explicação,
  nada trava) → tela de colorir.
- Parser das 3 regras de linha + front matter YAML + catálogo de assets por id.
- Canvas 3 camadas com roteamento de pointer-events verificado
  (balde atravessa até a região SVG; pincel/borracha capturam o traço).
- Persistência por perfil (posição de leitura, quiz silencioso, estado de colorir,
  tema, tamanho de fonte) — chaves documentadas em `src/armazenamento/armazenamento.ts`.
- 3 temas decorativos (arco-íris/espaço/floresta), A−/A+, TTS por parágrafo
  (Web Speech, pt-BR), impressão P&B v0, desfazer unificado (balde+pincel).
- 1 título completo: "A Lebre e a Tartaruga" (Esopo, tradução própria) com
  arte de colorir de 16 regiões.
- `npm run build` passa limpo (tsc + vite). Dev server: launch.json da raiz
  `C:\Claude\.claude\launch.json`, config "app-infantil", porta 5174.

## Próximos passos, EM ORDEM

1. **Fontes embutidas** (spec 5): Atkinson Hyperlegible + OpenDyslexic (ambas OFL)
   via `@font-face` com arquivo local empacotado (não CDN). Adicionar seletor de
   fonte nos ajustes, por perfil. OpenDyslexic é opção, nunca padrão.
2. **Mais 2–4 títulos** para validar o pipeline de conteúdo (spec seção 7.3 sugere:
   mais 1 fábula de Esopo + 1 conto de domínio público + 1 historinha filosófica
   autoral simplificando Aristóteles/Epicteto — o corpus adulto está acessível via
   MCP `pedra-angular`). Basta seguir "Adicionar um livro novo" no CLAUDE.md.
3. **Figurinhas** (spec 8.4/8.5): a v1 já existe como insígnias
   (`src/conquistas/insignias.ts`). Evoluir para figurinhas com arte própria e
   curiosidade falada por TTS; manter a regra: fixa e previsível, nunca sorte.
4. **Motor de impressão 8.3 completo**: se houver traços de pincel, compor base
   colorida + pincel em escala de cinza + linhas; toggle "imprimir em cores".
5. **Capacitor** (spec 1 e 8.1): `npm i @capacitor/core @capacitor/cli`, `npx cap init`,
   `npx cap add android`. Trocar a impl de `armazenamento.ts`:
   chaves triviais → `@capacitor/preferences`; dados relacionais →
   `@capacitor-community/sqlite` (schema pronto na spec 8.4, chaves atuais mapeiam 1:1).
   TTS → `@capacitor-community/text-to-speech` (assinatura já isolada em `src/tts.ts`).
   Lifecycle → `@capacitor/app` (salvar estado no background).
6. **Gestão de perfis**: hoje Theo/Davi são semente fixa em `src/perfis/perfis.ts`.
   Criar/editar/excluir perfil — exclusão atrás de trava parental (spec 8.5).
7. **Testes do parser** no espírito ProvaDeFogo: profundidade absurda de cabeçalhos,
   `{{img:}}` malformado, front matter ausente.
8. **Testar em Android de entrada** (checklist spec seção 6).

## Decisões tomadas nesta sessão (dentro do espaço que a spec deixava aberto)

- Pasta do projeto: `C:\Claude\app-infantil`. Nome de exibição provisório:
  "Historinhas" (decisão 1 da spec seção 7 continua ABERTA — nome/selo é do Bruno).
- Quiz inline após o parágrafo ancorado + perguntas de capítulo agrupadas no fim
  sob "Para pensar 💭" (resolve parcialmente a decisão 2; configurável por livro
  ainda pode vir depois).
- Traços do pincel persistidos em coordenadas normalizadas 0..1 (independentes de
  resolução/DPR).
- Avatares-semente: Theo 🦖, Davi Ω (o Ω é homenagem ao alfabeto grego que ele
  decorou — trocar quando existir editor de perfis).
- Emoji de capa por livro em `telaEstante.ts` (`EMOJIS_CAPA`) até existir arte de capa.

## Decisões AINDA abertas (seção 7 da spec — só o Bruno decide)

nome/selo do projeto · léxico pedagógico próprio · colofão infantil ·
primeiros títulos definitivos.

## Armadilhas conhecidas

- O launch.json que vale para o preview é o da RAIZ (`C:\Claude\.claude\launch.json`),
  não o de `app-infantil/.claude/` — a sessão roda com cwd `C:\Claude`.
- `vite.config.ts` usa `base: './'` — obrigatório para o WebView do Capacitor; não remover.
- No pane de preview desta máquina, `screenshot` pode dar timeout — verificar via
  `read_page`/JS (aconteceu na sessão de 2026-07-19; o app estava saudável).
