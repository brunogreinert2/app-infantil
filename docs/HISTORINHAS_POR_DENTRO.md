# Historinhas por dentro

*O que é, para quem, o que faz, como funciona, e o que ainda não é.*
Retrato de 2026-11-20, versão 0.13.2 (historinhas.app.br).

---

## Como ler este documento

Ele foi escrito para **qualquer leitor**: uma professora, um desenvolvedor,
um especialista em baixa visão, um filósofo, outra inteligência artificial.
Não foi facilitado para nenhum deles. Cada parte fala a língua de uma área,
e quem chega de uma área vai achar as outras partes difíceis. É de propósito:
o app mora no cruzamento dessas áreas, e só se entende o desenho dele vendo
por que cada decisão de uma área depende de uma decisão da outra. Quem
quiser só o essencial lê as partes 1 e 2. Quem for mexer no código lê a 6.
Quem for avaliar a acessibilidade lê a 5, e principalmente a 8.

1. Em poucas linhas
2. Para quem
3. O que dá para fazer
4. A pedagogia por trás
5. A visão por trás (acessibilidade visual)
6. O motor por trás (para quem desenvolve)
7. Desde a SAFIL: o que mudou de 2026-11-05 a 2026-11-20
8. O que o app ainda não é
9. Pequeno glossário

---

## 1. Em poucas linhas

**Em uma frase.** O Historinhas é um app gratuito de **ler, pintar, jogar e
imprimir**, para crianças em alfabetização, desenhado primeiro para quem
**enxerga pouco**.

**Em um parágrafo.** A criança escolhe o seu perfil, abre uma estante de 28
histórias (fábulas, contos clássicos e três historinhas de filosofia), lê
ou ouve a história, responde perguntas que nunca a reprovam, pinta os
desenhos da história na tela ou no papel, joga caça-palavras, cruzadinha,
sudoku, labirinto, contas e memória, e ganha insígnias fixas ao terminar
cada livro. Quem ensina tem, atrás de uma trava simples, uma **oficina** que
faz 21 tipos de folha A4 para imprimir (de caça-palavras a calendário, de
contas armadas a sequência didática), uma **prancha de comunicação
alternativa** (CAA) que fala e também sai no papel, e um guia. Tudo funciona
sem internet depois da primeira visita, nada é enviado para fora do aparelho,
e cada tela se deixa ampliar, contrastar, espaçar e falar.

**O que o distingue.** Não é um app "com recursos de acessibilidade". É um
app em que a letra grande, o contraste alto e a voz são o ponto de partida,
e o resto foi construído em volta, sem usar a palavra "acessibilidade" em
menu nenhum (o rótulo afasta justamente quem mais precisaria dele).

---

## 2. Para quem

**Público delimitado.** Crianças de **6 a 10 anos com baixa visão**, em
processo de alfabetização, na escola inclusiva (sala comum e Atendimento
Educacional Especializado) e em casa.

Por que esse recorte: o app nasceu de um autor que trabalha com óptica e de
uma pergunta concreta: o que o digital pode fazer pela criança que enxerga
pouco **sem depender de um aparelho óptico** (lupa, telelupa, óculos
especiais)? No papel, ampliar exige xerox; na tela, ampliar, contrastar,
espaçar e falar são ferramentas não ópticas que custam zero.

**Quem mais se beneficia** (o efeito rampa: a rampa feita para a cadeira de
rodas serve ao carrinho de bebê, à mala, ao idoso):

| Quem | O que serve | Onde está |
|---|---|---|
| Criança não verbal, autista não verbal | Prancha de CAA que fala, com frase, pastas e varredura | Prancha de comunicação |
| Deficiência intelectual | Rotina visual, pictogramas, instruções curtas, nada de nota | Oficina → Planejar |
| Dislexia | OpenDyslexic, espaço entre letras e linhas, voz | Aparência |
| Daltonismo | Nome da cor sempre escrito, paleta medida sob simulação | Pintar |
| Motora fina | Alvos ≥ 44 px, toque em vez de arrasto, um toque no lugar do toque longo | Todo o app |
| Todas as crianças | O mesmo material, mais limpo e mais claro | — |

**E quem ensina.** Professora da sala comum, professora de AEE, família. A
área dos adultos (atrás de uma conta de multiplicação) tem a oficina, as
pranchas e o guia.

**O que o app NÃO promete.** Resultado clínico, adaptação universal ou
substituição de profissional. É recurso pedagógico que quem ensina escolhe e
adapta.

---

## 3. O que dá para fazer

### Ler
- **Estante em pastas** (Histórias → Primeiras Aventuras, Entre Bosques e
  Castelos, Clássicos, Para pensar; Alfabetos; Números), com o mesmo caminho
  num **menu lateral** em árvore e uma pesquisa por livro, autor ou pasta.
- **28 histórias** em domínio público, com tradução e adaptação próprias
  documentadas (Esopo, Grimm, Andersen, Perrault, *O Pequeno Príncipe*), e
  três de filosofia: *Sócrates e as Duas Cestas*, *O Que Depende de Mim*
  (Epicteto) e *O Sonho do Menino Renê* (Descartes).
- **Voz**: ouvir cada parágrafo, cada capítulo ou a história inteira, com
  **realce** do trecho lido; **régua de leitura** (três jeitos) para não
  perder a linha; títulos que abrem e recolhem; "você parou aqui".
- **Quiz sem reprovação**: qualquer resposta mostra a certa e a explicação;
  nada trava o avanço; os acertos ficam guardados em silêncio, nunca viram
  nota na tela da criança.
- **Insígnias fixas**: terminar *A Lebre e a Tartaruga* dá sempre "Devagar e
  Sempre"; ler três livros dá sempre "Coruja Leitora". Nunca sorteio.
- Alguns livros chegam com **cena de abertura** e **tema de cor próprio**.

### Pintar
- Os desenhos de cada história (contorno preto, fundo branco), pintados com
  **balde, pincel, borracha e escrita** (escrever no desenho e arrastar o
  texto), lupa com zoom de pinça, desfazer.
- **92 cores**: 18 cores com cinco tons cada, mais branco e preto, numa
  paleta em xadrez de quentes e frias. O **nome da cor está sempre escrito**,
  e pode também ser falado.
- **Partes separadas**: o rosto e o fundo de um desenho são regiões
  diferentes. E o **balde em todas da mesma cor** troca, num toque, todas as
  casas de uma cor (as casas escuras do tabuleiro, por exemplo).
- **Quebra-cabeça** de qualquer desenho; galeria **Minhas pinturas**;
  imprimir **P&B para pintar no papel** ou **colorido do jeito que pintou**,
  em A4, com PDF de verdade no app instalado.

### Alfabetos e Números
- O **alfabeto** latino e o **alfabeto grego** (grego antigo, com a convenção
  de leitura explicitada), com letras de pintar, fichas e brincadeiras.
- **Os Números**: livro de 20 folhas A4 (0 a 20, tabuadas, romanos até a
  dúzia e o traço que vale mil).

### Jogar (🎮 Jogos, no alto da estante e no menu)
Sem formulário: a criança escolhe e joga. Seis jogos, todos com progresso
**de cada criança**, ✓ no que terminou, «Outro» em ordem (nunca sorteado) e
ajuda pedida, nunca imposta.

| Jogo | Como se joga | Escolhas |
|---|---|---|
| Caça-palavras | Arrasta o dedo sobre a palavra, ou toca a primeira e a última letra | 12 temas; mais fácil / mais difícil |
| Cruzadinha | Toca a casa e digita; o cursor anda sozinho | 12 temas, palavras escondidas (sem "cola") |
| Sudoku | Toca a casa vazia e depois o número ou a figura | Figuras, 4 × 4, 6 × 6; 12 de cada |
| Labirinto | O bichinho do perfil anda pelo corredor até a ⭐ | Pequeno, médio, grande; 12 de cada |
| Contas | Uma por vez, armada como no caderno; a divisão com a chave | Somar, diminuir, vezes, dividir, tabuada; três tamanhos |
| Memória | Toca uma carta, toca outra | Pares iguais ou figura e palavra; 6 ou 10 pares |

### Escrever
**Minhas anotações**: a criança escreve os próprios textos, que se leem como
os livros. O formato é o mesmo do Pedra Angular (o app de leitura irmão): um
texto passa de um app para o outro por arquivo. Há cópia de segurança do
perfil.

### Comunicar (💬 Prancha de comunicação)
Fora dos perfis, a um toque da tela inicial. Uma prancha **Essencial** (início
de 30 casas, 5 × 6: palavras do núcleo e as pastas Sinto, Lugares, Comida e
Escola) que **fala** cada
palavra, monta a **frase** no alto e a fala inteira; **varredura** para quem
só consegue um gesto (um toque em qualquer lugar ou a barra de espaço
escolhe a casa destacada); **zoom** que cresce as casas sem mudar a ordem
delas. Na área dos adultos: **montar pranchas** casa a casa, com foto própria,
e **imprimir** em A4 (a prancha só serve se sair da sala de recursos).

### Ensinar (🖨️ Para quem ensina → Fazer uma folha)
A **oficina**: 21 tipos de folha A4 em quatro seções.

| Seção | Folhas |
|---|---|
| Jogos para imprimir | caça-palavras, cruzadinha, labirinto e sudoku, jogos de mesa (memória, dominó, bingo, damas, xadrez), sílabas (bingo e dominó) |
| Atividades | sílabas (famílias, monte a palavra), contas armadas e tabuada, relógio e reta numérica, matemática de recortar (material dourado, frações, tangram), coordenação (tesoura e caminhos), e os cadernos dos livros: os **alfabetos** (ABC e grego), **Os Números** e o **Ler o Mundo** (alfabetização para jovens e adultos, das placas e sinais, com a ficha da palavra que a professora escolher) |
| Papéis e modelos | folha pautada (até a muito ampliada), quadriculado e milimetrado, réguas, plano cartesiano e parábola, calendário com figura, capas (com meandro), quadrinhos, crachás, marcadores, etiquetas |
| Planejar | sequência didática a partir de um livro da estante, rotina visual (agenda do dia, passo a passo, primeiro → depois) |

Em toda folha: prévia ao lado, **letra à escolha** (Atkinson, Cardo,
OpenDyslexic), folha do aluno e do professor (com respostas), **código da
folha** (digitado, monta a mesma folha de novo), **🔍 Folha ampliada** (liga
e desliga), e os botões **🎨 Pintar**, **🧩 Quebra-cabeça** e **🎮 Jogar**
(a mesma folha na tela).

### Ajustar (🎨 Aparência)
"Deixe tudo do jeito que seus olhos preferem." Temas em três grupos (**Mais
contraste**: preto no branco, branco no preto, amarelo no preto, verde no
preto, amarelo no azul; **Para ler por mais tempo**: sépia, azul-noite,
azul-petróleo; **Para brincar**: arco-íris, floresta, espaço), mais o **Monte o
seu**; letra (Cardo, Atkinson Hyperlegible, OpenDyslexic) de **12 a 180 px**;
peso da letra; espaço entre linhas e entre letras; falar ou não o nome das
cores.

---

## 4. A pedagogia por trás

**A missão.** Aprender tem de competir com o que prende a atenção da criança
hoje. Mas a disputa não se ganha com as armas do outro lado: o app não usa
sorteio, placar, contagem regressiva, cor ou som de erro. Recompensa
**previsível**: a criança sabe o que ganha e por quê.

**Zero pressão de nota.** Errar não tem consequência visível. O quiz revela a
resposta a qualquer escolha; o jogo nunca pinta de vermelho; a conta errada
recebe um convite ("Confira de novo, com calma"), não uma marca. A ajuda está
sempre a um toque e é sempre a mesma (a "casa da ajuda" do sudoku é sempre a
primeira vazia, em ordem de leitura).

**Autonomia e participação.** A criança escolhe o perfil, o tema, a letra, o
jogo. Troca de perfil sem trava. Participa apontando, falando, desenhando,
contornando ou escrevendo, conforme a mediação e a necessidade. O que é da
criança fica dela (o tema do livro é convidado, nunca dono; um tema de mais
contraste nunca é trocado pelo de um livro).

**Ler o mundo.** As folhas e jogos usam o vocabulário do dia a dia (escola,
casa, comida, transporte, sentimentos). Um piloto de letramento para jovens e
adultos (**Ler o Mundo**) parte das placas e sinais da rua.

**Filosofia para crianças.** As historinhas de *Para pensar* são autorais e
partem de ideias reais da história da filosofia:
- *Sócrates e as Duas Cestas*: o saber que sabe que não sabe;
- *O Que Depende de Mim*: a dicotomia do controle de Epicteto (o que está e o
  que não está em nosso poder);
- *O Sonho do Menino Renê*: a dúvida de Descartes, e o "penso, logo existo".
Elas não moralizam: terminam em perguntas ("Para pensar 💭"). A separação é
deliberada: a filosofia infantil vive aqui; o Pedra Angular (o app de leitura
do mesmo autor, com o acervo filosófico completo) é para adultos.

**Conteúdo.** Domínio público, com tradução e adaptação próprias
documentadas. A impressão é **A4 desde a concepção**: nada é cortado, nenhuma
ficha se divide entre páginas.

**Sala de aula.** A prancha de CAA nasceu de uma professora de AEE que não
tinha prancha para um aluno com o recurso indicado no plano dele. Por isso
ela existe na tela e no papel. As folhas da oficina saem com folha do
professor e código para refazer igual.

---

## 5. A visão por trás (acessibilidade visual)

**A régua.** WCAG 2.2 no nível **AAA** em tudo o que a criança lê e toca, e
as recomendações da Perkins School for the Blind para baixa visão. A régua
mora nos documentos e nos testes, nunca na tela: o app não escreve "7:1" para
ninguém.

**Contraste (1.4.6, AAA).** Os 11 temas passam em **7:1** no texto e no texto
secundário, sobre o fundo e sobre o cartão, e a letra dos botões também. O
título (letra grande) passa em 4,5:1. Isso não é afirmado: é **medido por
teste** (`src/telas/temas.test.ts` lê a folha de estilos e reprova tema que
caia). Os cinco temas de mais contraste são os pares clássicos para baixa
visão, com as mesmas cores do Pedra Angular, porque não existe esquema
universal: cada condição ocular prefere um par. Sem papel de parede neles:
nada compete com a letra.

**Ampliação: reflow, não lupa.** O A+ refaz a página com letra maior: o texto
quebra em novas linhas e cabe na largura da tela, sem rolar para os lados
(1.4.10). É diferente da pinça do aparelho, que é uma lupa sobre a página e
obriga a arrastar de um lado para o outro; a pinça fica liberada de
propósito (1.4.4), como reserva para espiar um detalhe. Regras que fazem o
reflow funcionar:
- dentro das telas, tudo é medido em `em` (cresce com o A+): poços de tinta,
  temas dos jogos, teclado das contas, menu lateral (13 letras de largura, e
  uma alça para alargar);
- a **barra do alto não engrossa**: é a mesma em toda tela (← · menu · título
  · A− A+ · 🎨), fixa no alto e em `rem`, para não comer o espaço que a pessoa
  ganhou aumentando a letra;
- nenhum botão fica mais largo que a tela (uma palavra enorme quebra, mas não
  some);
- a letra é encaixada na grade de pixels do aparelho, para não sair borrada
  em faixas.

**Tipografia escolhida por quem trabalha com óptica.** OpenDyslexic na
leitura (padrão), Atkinson Hyperlegible (desenhada para baixa visão: letras
que não se confundem) e Cardo. Peso da letra ajustável, porque traço fino
some para quem enxerga pouco.

**A folha ampliada.** Na oficina, um liga/desliga: letra mais grossa, traço
1,6× mais grosso, cinza claro escurecido (linha-guia clara some), e onde o
desenho deixa, casas e letras maiores (caça-palavras na menor grade em que as
palavras cabem; cruzadinha com a grade numa folha e as dicas grandes na
outra; contas 1,5× maiores, seis por folha).

**Cor nunca sozinha.** O nome da cor está sempre escrito; pasta da prancha
tem forma diferente (não só cor diferente); casa certa ganha ✓, não só verde;
a paleta de pintar foi ordenada medindo sob simulação de daltonismo.

**Toque.** Alvos de 44 px ou mais (2.5.5); toque duplo não dá zoom no iPhone;
toque longo sempre tem um caminho de um toque; nada com limite de tempo.

**Prancha.** Paleta própria, clara e fixa (quem aprende a prancha num aparelho
a reconhece no outro), tinta ≥ 7:1 sobre cada cor de categoria, zoom que
nunca muda a ordem das casas (a memória do lugar de cada palavra é o que deixa
a CAA rápida) e barra travada.

O registro completo, com o que foi medido, como e o que não foi:
`docs/ACESSIBILIDADE.md` e `docs/ACESSIBILIDADE_VISUAL.md`.

---

## 6. O motor por trás (para quem desenvolve)

**Pilha.** Vite + TypeScript **sem framework** (DOM direto), ~23 mil linhas de
TS. PWA instalável e **offline** (service worker com tudo pré-carregado,
inclusive fontes). Zero rede em tempo de execução. Publicado no GitHub Pages
por GitHub Actions (testes e build antes de publicar). Próximo passo
planejado: Capacitor, para lojas (`docs/CAPACITOR_PLANO.md`).

**Mapa.**
```
src/motor/        leitura do .md: o MOTOR DO ECOSSISTEMA (cópia carimbada de
                  C:\Claude\parser\motor — nunca se edita aqui) → blocos com nome
src/conteudo/     livros/*.md (front matter YAML + texto), catálogo, pastas,
                  alfabetos, números, Ler o Mundo, textos próprios
src/telas/        perfis, estante, leitura, pintura, anotações, aparência,
                  ajustes, guia, menu lateral, barra comum
src/canvas/       pintura em 3 camadas: base (SVG com regiões), pincel
                  (canvas), linhas (contorno); zoom, partes, cores
src/impressao/    impressão A4 por iframe, PDF, folha pintada
src/geradores/    a oficina: geradores PUROS de folhas, código da folha,
                  jogos na tela, tela Jogos da criança
src/caa/          prancha: modelo, pictogramas (75, desenhos nossos), telas
src/armazenamento/ abstração assíncrona (localStorage hoje; IndexedDB para
                  textos; Capacitor Preferences/SQLite depois)
```

**Conteúdo.** Cada livro é um `.md` com front matter (título, autor, faixa
etária, assets declarados por id, quiz ancorado em parágrafo, tema). Imagem
entra como `{{img:id}}` sozinho na linha. O texto é lido pelo **mesmo motor**
do Pedra Angular (CommonMark ampliado: citações, notas, fórmulas, tabelas,
grego e hebraico com idioma, títulos sem teto de profundidade). O motor gera
blocos com nomes estáveis (p1, p2…), e é neles que o quiz e o "parei aqui" se
prendem.

**Geradores de folhas.** Funções puras `pedido → SVG A4` (800 × 1131 unidades
= 190 mm de largura útil). Texto desenhado como **contorno de glifo** (tabelas
de glifos das três fontes geradas no build), então a folha não depende de
fonte instalada e sai igual em qualquer impressora. **Nada é sorteado**: todo
"embaralhar" usa um gerador pseudoaleatório com semente fixa (mulberry32 sobre
FNV-1a), e a mesma escolha dá sempre a mesma folha.

**Código da folha.** `H1-XXXX-…`: o pedido do formulário (só o que difere do
pedido de partida de uma data fixa), em base 32 de Crockford com caractere de
conferência. Listas de tipos e campos **só crescem no fim**; o pedido de
partida é **congelado por teste**; códigos de referência e o desenho de cada
um são conferidos por teste. Um código impresso hoje monta a mesma folha
daqui a anos.

**Jogos na tela.** As regras são puras e testadas (`jogo.ts`: linha entre
casas, entrada completa, sudoku, labirinto com caminho validado, contas em
caixas, memória); a tela só desenha e escuta o dedo. O jogo da tela é **o
mesmo** da folha impressa com a mesma semente.

**Pintar qualquer folha.** Na pintura, a folha é refeita com as "casas"
ligadas (retângulos invisíveis que viram regiões) e os desenhos marcados (as
formas fechadas viram partes). Na folha impressa elas não existem, e o código
não muda.

**Perfis e dados.** Tudo fica no aparelho, por perfil (chaves `perfil:…`), e a
prancha e a oficina são do aparelho. Nenhum servidor, nenhuma conta, nenhum
envio.

**Garantias.** 284 testes em 26 arquivos (vitest), `tsc` estrito, conferência
de que a cópia do motor não foi editada à mão, conferência de surrogates
Unicode no build. Regex com faixas Unicode sempre em `\u`, nunca com o
caractere literal. Teste de contraste dos temas lendo o CSS real.

**Versionamento e fluxo.** Trabalho numa branch; publicação só com ordem do
dono, por *fast-forward* da master; versão no `package.json` (o "Sobre" a
lê). Toda sessão termina com o arquivo de passagem atualizado
(`docs/CONTINUAR_AQUI.md`).

---

## 7. Desde a SAFIL: o que mudou de 2026-11-05 a 2026-11-20

Depois da palestra na SAFIL (UFRGS, 2026-11-05), o trabalho saiu do Pedra
Angular e se concentrou no Historinhas: **82 commits em nove dias de
trabalho**, até a versão **0.13.2**.

| Data | O que entrou |
|---|---|
| 11/11 | Estante em pastas e menu lateral no avatar; cores de pintar com nome sempre escrito, tons e voz; espaço entre linhas e letras; impressão do documento principal e lupa de verdade; impressão no iPhone |
| 12/11 | Guia de quem ensina; realce da leitura em voz alta; régua de leitura; *Os Números* (20 folhas); auditoria automática de acessibilidade; Minhas anotações compatíveis com o Pedra Angular; PDF no app instalado; Minhas pinturas; pintar por partes; peso da letra; cópia de segurança; tabelas e títulos recolhíveis |
| 13/11 | A barra do alto não engrossa com o A+ |
| 15/11 | Escrever no desenho e arrastar; detalhes do front matter; versão real no "Sobre" (0.9.0, publicada) |
| 16/11 | Geradores de folhas (caça-palavras, cruzadinha, pautas, quadriculados, régua, plano cartesiano, calendário); jogos de mesa; separador de sílabas; **prancha de CAA** (motor, tela que fala, editor, papel); piloto **Ler o Mundo** |
| 17/11 | Relógios e reta numérica; romanos até a dúzia; folha dos sinais de banheiro |
| 18/11 | Silabário, labirinto, sudoku, contas, matemática de recortar, tesoura, quadrinhos e cartões; letra das folhas; rotina visual; sequência didática; capas com meandro; **código da folha**; pintar qualquer folha (casas e partes); balde em todas da mesma cor; jogar caça-palavras e cruzadinha na tela; 12 cruzadinhas prontas |
| 19/11 | Oficina **ligada**, em quatro seções; Jogos na barra da criança e no alto da estante; sudoku, labirinto, contas e memória na tela (0.10.0, 0.11.0, 0.12.0) |
| 20/11 | Frente de **acessibilidade visual**: temas de mais contraste e de leitura longa (Perkins/Pedra Angular), temas de brincar em AAA, 🔊 que não cobre o texto, menu que cresce com a letra e tem alça, zoom na prancha, folha ampliada, Aparência enxuta, a mesma barra em toda tela, tudo crescendo com o A+, divisão com a chave, consertos do iPhone (0.13.0 a 0.13.2) |

---

## 8. O que o app ainda não é

Dito com a mesma clareza do resto, porque um material de inclusão que esconde
os próprios limites engana quem mais confia nele.

- **Não foi avaliado por crianças com deficiência** de forma organizada.
  Os primeiros leitores foram duas crianças de 7 e 9 anos, da família do
  autor. Medida automática e simulação cobrem parte do problema, não ele
  todo.
- **Nenhum leitor de tela real** (VoiceOver, TalkBack, NVDA) foi ligado com
  método. Os atributos estão no lugar; a experiência falada não foi avaliada.
- **O desenho de pintar não é operável por teclado** nem por leitor de tela:
  uma criança cega não pinta no app hoje.
- **A prancha tem só a paleta clara.** Uma versão escura, para quem enxerga
  melhor em fundo preto, está na fila.
- **O "Monte o seu" e os temas próprios dos livros** não têm o contraste
  medido em todas as combinações.
- **As bordas dos temas de brincar** ficam abaixo de 3:1 onde são só
  decorativas; falta conferir botão a botão.
- **Não é app de loja ainda** (é PWA instalável). Capacitor planejado.
- **Interface só em português.**

A lista viva do que falta, em ordem de impacto: `docs/ACESSIBILIDADE_VISUAL.md`.

---

## 9. Pequeno glossário

- **AEE / PAEE**: Atendimento Educacional Especializado / o plano dele para um
  aluno.
- **CAA**: Comunicação Aumentativa e Alternativa; a prancha é uma ferramenta
  de CAA.
- **Varredura**: o destaque passeia pelas casas sozinho e um único gesto
  escolhe; para quem não consegue apontar.
- **Baixa visão**: perda visual que óculos comuns não corrigem, mas com visão
  útil (diferente de cegueira).
- **Contraste 7:1**: razão de luminância entre letra e fundo; 21:1 é preto no
  branco.
- **Reflow**: o conteúdo se rearranja quando a letra cresce, sem rolagem
  lateral.
- **WCAG**: as diretrizes internacionais de acessibilidade para a web; AAA é
  o nível mais exigente.
- **DUA**: Desenho Universal para a Aprendizagem; o efeito rampa aplicado à
  escola.
- **PWA**: site que se instala como app e funciona sem internet.
- **Front matter**: o cabeçalho YAML no início de um `.md`, com os dados do
  livro.
- **Semente**: o número que faz um "embaralhar" sair sempre igual.
- **Zero-gate**: nada bloqueia o avanço da criança.

---

*Historinhas — historinhas.app.br. Autoria: Διαφορεύς.*
