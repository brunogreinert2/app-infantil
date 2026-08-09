# CONTINUAR AQUI — chave de handoff entre sessões/modelos

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
1. NUNCA começar do zero — tudo funciona e está testado (19 testes, build
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
