# Plano para o Fable — novas ideias do Bruno (2026-11-11)

Preparado pelo Sonnet 5.5 a partir de `C:\Claude\App infantil novas ideias.md`
(as ideias do Bruno, na íntegra) e de uma leitura do código. **Tudo abaixo vem
de leitura de código; nada foi rodado num iPhone.** O que é hipótese está
marcado como *hipótese*.

Regra de economia: este arquivo já aponta os arquivos certos. Não explorar o
repositório inteiro; ler só o que a fase pede. Ao fim de CADA fase: `npm test`
+ `npm run build` verdes, um commit por assunto, atualizar
`docs/CONTINUAR_AQUI.md` (topo) e a ficha `C:\Claude\andamento\app-infantil.md`.
Se os créditos acabarem no meio, o plano retoma da próxima fase não marcada.

## 0. Antes de tudo (F0) — 5 minutos

- `CLAUDE.md`: nunca commitar/mergear/dar push na `master` sem instrução nova
  e explícita. **Criar a branch `fable/novas-ideias` a partir do tip atual**
  (o Bruno já resolveu os commits pendentes) e trabalhar nela.
  Publicação (push) só com autorização expressa do Bruno, por entrega.
  `src/motor/` é cópia: não editar.
- `npm test -- --maxWorkers=1` e `npm run build` verdes antes de começar.
- Para o Bruno testar no iPhone sem publicar: `npm run build` e
  `npm run preview -- --host`, abrir `http://<IP-do-PC>:4173` no iPhone (mesma
  rede Wi-Fi). Dev server também serve (`npm run dev -- --host`).

## Regras que mexem em tudo (NORMAS: `C:\Claude\portico\NORMAS.md`)

- **N29**: nenhum estado só por cor — cor MAIS forma/texto. (É a "lei" que o
  Bruno citou; aqui ela vale para a paleta.)
- LEI 4/5: acessibilidade é piso e vence decoração. Contraste de texto ≥ 7:1.
- LEI 6: id publicado é eterno — não renomear ids de livros, assets, regiões
  (`regiao-*`). Estado salvo de pintura é `{regioes:{id:'#hex'}, tracos:[…]}`
  na chave `<perfil>:colorir:<livro>:<asset>` — **não quebrar esse formato**.
- Princípio 5 do app: troca de perfil nunca passa por trava parental; o app
  sempre abre na seleção de perfil.
- Impressão sempre A4. Tipografia só Cardo / Atkinson / OpenDyslexic.
- UI em português (o app infantil não tem i18n hoje). Commits em português,
  autoria Diaphoreus (já configurada).
- Barra do topo: não engrossar no celular (sem segunda linha) e **mostrar
  captura da tela ao Bruno antes de publicar** (decisão de 2026-10-11, vale
  pelo mesmo princípio aqui).

## Padrão de referência em acessibilidade (vale para TODAS as fases)

O Bruno quer que seus apps sejam **referência em visão e em acessibilidade de
vários tipos**, e usa isso em apresentação acadêmica (UFRGS). "Referência"
significa *medido e documentado*, não "parece bom". Cada fase passa por esta
lista e o resultado vai para `docs/ACESSIBILIDADE.md` (criar na F1 e ir
completando): para cada item, **o que foi verificado, como, e o que NÃO foi
verificado** (nunca afirmar o que só um aparelho/pessoa real confirmaria).

- **Visão — baixa visão e ceratocone/astigmatismo:** entrelinha e espaço entre
  letras ajustáveis (F5); texto a 200% sem perda e sem rolagem horizontal;
  contraste ≥ 7:1 em todos os temas e em estados (selecionado, foco,
  desabilitado); alvo e traço grandes; nenhum texto em imagem.
- **Visão de cores:** N29 — nada só por cor (cor + nome/forma). Conferir
  paleta e feedback do quiz (correta/errada) com simulação de protanopia,
  deuteranopia e tritanopia (filtros SVG/DevTools) e em escala de cinza.
- **Fotossensibilidade e vestibular:** `prefers-reduced-motion` desliga ou
  suaviza confete (`src/efeitos/confete.ts`), aberturas cênicas e
  transições; nada pisca acima de 3 Hz.
- **Dislexia/leitura:** OpenDyslexic/Atkinson continuam opção; colunas
  curtas; sem texto justificado.
- **Motora:** alvos ≥ 44 px com espaçamento; **todo gesto tem alternativa
  de um toque** (pinça → botões de zoom, toque longo → botão visível, arrastar
  → toque); sem exigir precisão fina; nada com limite de tempo.
- **Cognitiva:** instruções curtas, previsíveis, mesma posição dos controles
  em todas as telas, desfazer sempre à mão, sem nota/pressão (princípio 4).
- **Leitor de tela e teclado:** nomes, papéis e estados corretos
  (`aria-*`), regiões vivas só onde ajudam, foco visível e ordem lógica, foco
  preso em painéis/diálogos e devolvido ao fechar, tudo operável só pelo
  teclado, `Esc` fecha.
- **Auditiva:** nada depende só de som; voz (TTS) é sempre opcional.
- **Modo de alto contraste do sistema:** `forced-colors` não pode quebrar a
  pintura nem os controles.
- **Impressão:** contraste e tamanho de letra de ficha de sala de aula; A4.
- Rodar uma auditoria automática (ex.: `axe-core` como devDependência de
  script de teste, **fora do bundle** — LEI 3) nas telas tocadas, e dizer que
  isso cobre só uma parte do problema.

## F1 — Cores: nome visível, tons, voz (bug do iPhone + ideia do Bruno)

**Diagnóstico.** `src/telas/telaColorir.ts`, constante `PALETA` (14 cores) e o
laço que cria `.poco-cor`: o nome só vai em `aria-label` e `title`. `title` é
dica de mouse — no iPhone não existe. Resultado: ninguém vê o nome no toque.

**Fazer.**
1. Mostrar SEMPRE o nome da cor atual, em texto grande, ao lado/acima da
   paleta — **só o nome, sem prefixo** ("Azul-céu", não "Cor: Azul-céu") —, com
   `aria-live="polite"`. Atualizar em `atualizarSelecao`. Visível no toque, sem
   hover. Contraste ≥ 7:1 sobre o fundo de cada tema.
2. Tons: toque longo (~400 ms) numa cor abre uma fileira com os tons dela
   (sugestão: muito claro, claro, base, escuro, muito escuro), cada um com
   nome ("Azul claro", "Azul escuro"…). Tocar num tom o escolhe. **Toque longo
   exige coordenação motora fina e não é descobrível: oferecer também um
   caminho explícito e visível** (um botão "Tons" ao lado do nome da cor, ou um
   pequeno ▾ em cada cor), utilizável por teclado e leitor de tela. Criar
   `nomeDaCor(hex)` com tabela hex→nome cobrindo bases e tons (o estado salvo
   continua em hex). Mais matizes além dos 12 atuais (ex.: turquesa, lilás,
   bege, vinho, verde-oliva), cada um com nome único e bem distinguível.
3. Voz opcional: preferência **por perfil** "Falar o nome das cores"
   (desligada por padrão), em `src/telas/preferencias.ts` + toggle em
   `telaAparencia.ts`. Usar `src/tts.ts` (iOS exige gesto do usuário — o
   toque na cor já é). Respeitar `pararFala`.
4. Opcional barato: ao pintar uma região, anunciar via `aria-live` "Pintou de
   Azul-céu" (leitor de tela).
5. Verde e amarelo vizinhos na paleta (a "sacanagem" do Bruno): reordenar de
   modo que matizes confundíveis para daltônicos (vermelho/verde/laranja,
   verde/marrom) não fiquem adjacentes, e o nome visível cobre o resto.

**Pronto quando:** no viewport 390×844 (e emulando toque) o nome aparece ao
tocar; toque longo abre tons; voz liga/desliga e persiste por perfil; cor
salva antes continua pintando igual; testes novos para `nomeDaCor` e para
"toda cor da paleta tem nome único".

## F2 — Imprimir: iPhone + opção "como pintei" + lupa

**Três defeitos de uma vez, todos em `telaColorir.ts` / `motorImpressao.ts` /
`zoomPinca.ts`.**

### 2a. Imprimir não faz nada no iPhone (*hipótese*)
`imprimirDocumento` (`src/impressao/motorImpressao.ts`) cria um `iframe` de
0×0 e chama `iframe.contentWindow.print()`. Safari do iOS e o PWA instalado
costumam ignorar `print()` de iframe oculto. Caminho sugerido: imprimir **do
documento principal** — inserir um `<div id="area-impressao">` com o conteúdo,
CSS `@media print { body > *:not(#area-impressao){display:none} @page{size:A4…} }`,
chamar `window.print()` e limpar em `afterprint`. Isso abre a folha de
impressão do iOS (compartilhar → Salvar em PDF/AirPrint). Manter o contrato
atual de `imprimirDocumento(titulo, corpoHtml, css)`: quem chama (livros,
tabelas em `impressao/tabelas.ts`, cadernos de alfabeto) não muda. Se mesmo
assim não imprimir no aparelho, plano B: abrir o HTML da folha em nova aba
(blob) já com o CSS de impressão e o usuário imprime dali. **Não dá para provar
no iOS daqui — o Bruno testa pelo `--host` acima; dizer isso claramente.**

### 2b. Opção de imprimir como pintado
Hoje só P&B (`derivarContornoPB` em `src/canvas/camadaBase.ts`; o próprio
comentário no topo de `motorImpressao.ts` já prevê "toggle imprimir em
cores"). Viável e pequeno:
- Ao tocar em 🖨️, perguntar: **"Só o contorno (para pintar no papel)"** ou
  **"Do jeito que pintei"**. Padrão continua P&B.
- Colorido: aplicar `estado.regioes` (fills por id) ao SVG-fonte e manter o
  contorno preto por cima. **Cuidado com as máscaras de oclusão** (necessárias
  no P&B; ver `scripts/primeiras-aventuras/mascaras.mjs`) — conferir que com
  preenchimento o resultado sai limpo.
- Traços de pincel/borracha (`camadaPincel`, coordenadas 0..1, borracha =
  `destination-out`): re-renderizar num canvas fora da tela em alta resolução
  (≈2480 px de largura para A4) com a MESMA lógica de `desenharTraco`, e
  inserir como `<image>` no SVG. Não usar o canvas da tela (baixa resolução).
- CSS de impressão com `-webkit-print-color-adjust: exact; print-color-adjust: exact`.
- Valer também para as folhas de alfabeto (`data-folha-a4`, ramo de
  `imprimirParaColorir` com `CSS_CADERNO_A4`).
- Fora de escopo agora: imprimir o *caderno inteiro* pintado (pode virar tarefa
  depois; mencionar no handoff).

### 2c. A lupa 🔍 "não faz nada"
Não é só o iPhone: o botão chama `zoom.reiniciar()` — **volta a 1×**; sem zoom
aplicado, não tem efeito visível, e o desktop não tem zoom nenhum (só pinça de
dois dedos). Transformar em controle real: tocar alterna 1× → 2× → 3× → 1×
(centrado), com o fator escrito no botão ("2×"), mais roda do mouse/Ctrl+roda e
teclado (`+`/`-`/`0`) no desktop. Conferir também que a pinça funciona no iOS
(`touch-action: none` está em `.tela-colorir`, `estilos.css` ~l.624).

**Pronto quando:** teste automático monta a folha colorida (fills + traços) e
confere cores/ids; captura da folha colorida e da P&B; lupa muda o zoom no
desktop e no toque; lista honesta do que só o iPhone real pode confirmar.

## F3 — Estante em pastas + painel lateral (o "Φ do infantil")

**Estado:** `src/telas/telaEstante.ts` despeja ~31 cartões numa só grade
(`livros` do catálogo + cartão "Minhas anotações"). O chip de avatar em
`barraTopo` (`src/telas/comum.ts`) só chama `aoTrocarPerfil`; `main.ts` liga
tudo por callbacks (`irPerfis`, `irEstante`, `irAnotacoes`…).

**Fazer.**
1. Dar estrutura às prateleiras. As coleções já existem no código
   (`colecaoPrimeirasAventuras.ts`, `colecaoBosquesCastelos.ts`; alfabetos
   gerados em `alfabetos.ts`). Criar `src/conteudo/pastas.ts` com a árvore e a
   pasta de cada livro por `id` (sem alterar os ids). Proposta inicial:
   *Histórias* → Primeiras Aventuras · Entre Bosques e Castelos · Clássicos
   (Pequeno Príncipe, Esopo) · Para pensar (Nina/Epicteto, Sócrates, Renê);
   *Alfabetos*; *Números* (F4); *Ferramentas* → Minhas anotações. O Bruno ajusta.
2. `telaEstante` passa a mostrar só a pasta escolhida (lembrar a última por
   perfil).
3. Novo componente vanilla `src/telas/painelLateral.ts`: abre ao tocar no chip
   de perfil (e fecha ao tocar fora/Esc), mostra a **árvore de pastas** e, numa
   delas, **"Trocar de perfil"** (sem trava parental — princípio 5). Convive
   com o botão de aparência 🎨 (`A−`/`A+`/🎨 em `barraTopo`), que permanece.
   Em tela larga, poder **fixar** o painel (alfinete), como o Φ/Ξ do
   Pedra Angular. Referência de *comportamento* (não de código — lá é React):
   `C:\Claude\app-leitura\src\components\Sidebar.tsx` e `fixar()` em
   `App.tsx` (~l.157–175: onde só cabe um painel, fixar um solta o outro).
4. Como `barraTopo` é compartilhada, o painel fica disponível em leitura,
   colorir etc. — não só na estante. Alcançar o Editor de Textos
   (`telaAnotacoes`) e os Alfabetos sem arrastar a página é o objetivo.
5. Acessível: foco preso no painel aberto, `aria-expanded`, árvore com
   `role="tree"`, alvo de toque ≥ 44 px.

**Pronto quando:** em 390×844 e 1280×900 a barra não ganha segunda linha;
painel abre/fecha/fixa; dá para chegar a Alfabetos e Anotações em 2 toques;
trocar de perfil pelo painel funciona; captura mostrada ao Bruno.

## F4 — Números arábicos, romanos e operações (conteúdo novo)

**Modelo.** O alfabeto é gerado por código e entra pelo mesmo pipeline dos
livros — repetir o padrão, sem tocar no parser:
`src/conteudo/alfabetos.ts` (dados + `gerarAlfabetos()`), `alfabetoArte.ts`
(desenho das folhas: `svgLetraA4`, `svgTabelaA4`…), `alfabetoComplementos.ts`,
`alfabetoBrincadeiras.ts` (textos para a criança), `scripts/gera-glifos.mjs`
(contornos de glifos a partir de Cardo Bold, via opentype.js), teste em
`alfabetos.test.ts`, exportação em `scripts/exportar-fichas.mjs`. Doc do
padrão: `docs/ALFABETOS_A4.md`. Criar `numeros.ts` (+ arte/complementos/testes)
espelhando isso, e registrar em `catalogo.ts`.

**Escopo sugerido (o Bruno aprova ao ver a primeira folha).**
- Arábicos 0–9 (+ dezenas até 20/100 em tabela): ficha por algarismo com
  contorno grande para pintar e a quantidade em pontinhos/quadro de dez.
- Romanos I–X como núcleo, V X L C D M e a regra de subtração (IV, IX) em
  tabela de consulta; relógio romano é um bom gancho lúdico.
- Operações + − × ÷ : fichas visuais (grupos de objetos pintáveis, reta
  numérica, quadro de dez, tabuada pintável), sem "nota" — mesma filosofia do
  app (zero pressão).
- Folha única com todos os números (como "alfabeto completo em uma folha").
- Texto para a criança de 7–9 anos leve e lúdico; orientação à professora só
  nas fichas/guia (decisão de 14/10/2026, `docs/MEMORIA_PEDAGOGICA.md`).
- Cada folha: A4, contorno preto, regiões brancas com `id="regiao-*"` e
  `class="colorir-alvo"`, legendas como caminhos vetoriais (nada de depender
  de fonte instalada).

**Verificação visual obrigatória:** renderizar cada folha nova em PNG e
*olhar* antes de seguir (sem isso nasce "desenho tosco"). Preferir arte
geométrica (círculos, quadros de dez, reta numérica) — é onde o código acerta;
bichos orgânicos ficam para quem revisa a ilustração (F6).

## F5 — Espaçamento como no app-leitura (IMPORTANTE — vem logo após F1)

O Bruno defendeu na palestra que o espaço entre linhas é benéfico para
**ceratocone** (e astigmatismo, baixa visão, dislexia). Este app tem de ter o
mesmo rigor do app-leitura, não uma aproximação. Comparei os dois; **o infantil
hoje não tem nada disso**: `body { line-height: 1.6 }` fixo (`estilos.css` l.85),
sem controle de entrelinha nem de espaço entre letras/palavras, coluna em
`max-width: 760px` (não em `ch`), corpo da letra em px fracionário
(`--tamanho-base`, passo 1,125, `aplicarTamanho` em `preferencias.ts`).

**O que o app-leitura faz** (fontes para ler; é React, portar a *lógica*):
- **Entrelinha escolhida pelo leitor**, em múltiplos do corpo:
  `ENTRELINHAS` em `components/ThemeDialog.tsx` l.334 — Mínima 1,2 · Compacta
  1,4 · **Normal 1,7 (padrão)** · Ampla 2,2. Por quê (comentário l.325–330):
  no ceratocone a mesma letra aparece duplicada, e o fantasma de uma linha cai
  sobre a linha de baixo — o espaço *separa* as linhas, não é conforto. O piso
  1,2 existe por causa do grego politônico/hebraico com sinais acima e abaixo
  (o infantil também tem alfabeto grego: manter o piso).
- **Espaço entre letras/palavras escolhido**, em `em` (acompanha o corpo):
  `ESPACAMENTOS` l.293 — Normal 0/0 · Amplo 0,06em/0,18em · Muito amplo
  0,12em/0,36em (palavra ≈ 3× a letra, senão a palavra se desmancha).
  Variáveis `--reading-letter-spacing` e `--reading-word-spacing`.
- **Grade de pixels** (`components/FontControls.tsx`, `encaixarNaGradeDePixels`,
  nota longa l.~85–135): entrelinha e **corpo da letra** arredondados a um
  número inteiro de pixels *do aparelho* (`devicePixelRatio`), para que todas
  as linhas caiam no mesmo ponto da grade — sem faixas mais grossas/finas.
  Vai numa variável separada, `--reading-entrelinha-px`, aplicada só nos blocos
  de prosa (`.reader-body p, li, blockquote, dd`, `styles.css` ~l.1536–1566),
  com fallback para o multiplicador. O valor guardado segue fracionário (senão
  o A+ emperra); só o que vai para a tela é encaixado. Refazer ao mudar `resize`.
- **Coluna em `ch`**, não px: `max-width: max(30rem, calc(61ch + 2rem))`
  (`styles.css` ~l.1533, comentário l.1495–1530) ≈ 75 caracteres por linha em
  qualquer corpo; acima de ~80 a vista erra o começo da linha seguinte.
- **Âncora de leitura** ao mudar o corpo (`withReadingAnchor`): o leitor
  continua no mesmo ponto do texto depois do reflow.
- Também existe **peso do traço** (Fina/Média/Grossa; `ThemeDialog.tsx`). O
  Cardo é leve; avaliar se vale oferecer ao infantil — decidir ao ver a tela.

**Fazer no infantil.**
1. Portar o modelo: variáveis `--reading-line-height`, `--reading-entrelinha-px`,
   `--reading-letter-spacing`, `--reading-word-spacing`, mesmos **ids e valores**
   de `ENTRELINHAS`/`ESPACAMENTOS` (consistência do ecossistema) e encaixe na
   grade de pixels. Aplicar em toda prosa que a criança lê: `.paragrafo`
   (`telaLeitura.ts`), enunciado e alternativas do quiz, dicas dos alfabetos,
   textos de `telaAnotacoes`. Títulos/cabeçalhos e botões ficam de fora.
2. Preferência **por perfil** (como `tamanhoFonte`: chave `<perfil>:entrelinha`
   e `<perfil>:espacamento`, em `preferencias.ts`) com controles em
   `telaAparencia.ts`, usando a prévia ao vivo que a tela já tem. Textos de
   ajuda na voz da criança, curtos ("Linhas mais afastadas: cada linha fica
   sozinha, mais fácil de seguir"). A explicação clínica (ceratocone,
   astigmatismo, dislexia) vai no guia da professora, não na tela da criança.
3. Padrão: **Normal 1,7** (o valor que o Bruno defendeu) e espaço Normal; o
   Bruno ajusta o default das crianças depois. Sinalizar no handoff.
4. Coluna em `ch` no lugar dos 760px, respeitando o `padding-right: 54px` do
   botão 🔊 (`.paragrafo`). Piso de 30rem como no app-leitura.
5. Âncora de leitura ao mudar tamanho/entrelinha/espaço durante a leitura.
6. Margem do parágrafo em `em` inteiros de pixel (o corpo encaixado já resolve).

**Pronto quando (medir, não supor):** em Chromium com `deviceScaleFactor` 1, 2
e 3, `getComputedStyle` mostra entrelinha e corpo em múltiplos exatos de
`1/dpr` px; as quatro entrelinhas e os três espaçamentos aparecem na prévia e
na leitura; nenhum transbordo horizontal em 390 px com corpo máximo e
espaçamento "muito amplo"; a linha tem ~45–75 caracteres; mudar corpo no meio da
leitura não perde o ponto; grego (alfabeto grego) sem sinais encostando na
entrelinha mínima; capturas antes/depois. Não mexer em ids nem em `src/motor/`.
Propor ao Bruno (sem editar `NORMAS.md`) o texto de uma norma que fixe esses
ids/valores para todos os apps.

## F6 — Revisar SVGs e histórias (NÃO é para gastar Fable à toa)

~85 fichas de alfabeto (geradas, consistentes) + ~58 cenas de histórias
(`scripts/primeiras-aventuras/artes.py`, `scripts/bosques-castelos/artes.py`
e SVGs antigos em `src/conteudo/assets/`) + 28 histórias (`src/conteudo/livros/*.md`).
- **Triagem visual** (renderizar tudo em folhas-contato e listar as piores
  com uma frase de defeito cada) e **leitura das 28 histórias** (idade-alvo,
  coerência, erro de português, fidelidade à fonte) são trabalho para modelo
  menor com visão — o Sonnet faz sob demanda do Bruno e devolve uma fila
  ordenada. Só as *reescritas de arte* mais graves (cenas procedurais que
  ficam tortas) valem Fable, e só depois dessa fila.

## À parte — NÃO é deste repositório

O pedido do Φ clicável durante a edição de texto e fixável é do
**app-leitura**. O Ξ do Sumário já existe no editor (`TextEditor.tsx` ~l.430)
e `onAlternarSumarioFixo` também; falta o Φ no mesmo molde. Sessão própria em
`C:\Claude\app-leitura`, sem misturar com este plano.

---

## Prompt para colar no Fable

> Leia `CLAUDE.md` e `docs/FABLE_PLANO_NOVAS_IDEIAS.md` em
> `C:\Claude\app-infantil` e nada além disso para começar. Execute as fases
> uma de cada vez, numa branch
> `fable/novas-ideias` (nunca `master`; nada de push sem eu autorizar).
> **Ordem real: F0, F1, F5, F2, F3, F4** (F5 = espaçamento como no app-leitura,
> é prioridade). Meus apps têm de ser referência em visão e em acessibilidade:
> aplique a seção "Padrão de referência em acessibilidade" a cada fase e
> mantenha `docs/ACESSIBILIDADE.md` honesto sobre o que foi e o que não foi
> verificado. Cada fase termina com `npm test -- --maxWorkers=1` e `npm run build`
> verdes, **verificação visual por captura de tela** (390×844 e desktop) e um
> commit em português por assunto. Depois de cada fase, atualize o topo de
> `docs/CONTINUAR_AQUI.md` e `C:\Claude\andamento\app-infantil.md` com o que
> foi feito, o que ficou, e o que só testando no iPhone real se confirma. Se
> encontrar uma decisão que é minha (ex.: nomes das pastas, escopo dos
> Números), proponha a melhor opção e siga; só pare se bloquear. Não explore o
> repositório além dos arquivos citados na fase. Se os créditos acabarem, o
> handoff já deve estar atualizado.
