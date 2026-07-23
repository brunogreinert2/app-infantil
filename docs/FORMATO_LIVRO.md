# FORMATO_LIVRO — a linguagem universal dos livros (v1)

Todo livro do app é **um arquivo `.md`** com duas partes: um cabeçalho YAML
(front matter) que declara TUDO que o livro tem — tema, abertura cênica,
imagens, áudios, vídeos, quizzes — e o texto, com três regras de linha e
nada mais. Qualquer livro escrito neste formato funciona igualmente: a
mesma engrenagem serve uma fábula de Esopo, o Pequeno Príncipe ou uma
experiência gamificada completa.

Filosofia (herdada do Pedra Angular): **o texto é burro, o front matter é
rico**. O parser nunca aprende sintaxe nova; toda riqueza (mídia, tema,
abertura) entra por declaração + âncora `{{img:id}}`.

## 1. As três regras de linha do texto

| Linha | Vira |
|---|---|
| `# Título` (`#` sem limite de profundidade) | cabeçalho (com 🔊 que lê o capítulo) |
| `{{img:id}}` sozinha na linha | o asset `id` (imagem, colorir, áudio, vídeo...) |
| qualquer outra linha não vazia | parágrafo (com 🔊 próprio); linhas consecutivas se juntam |

Âncoras automáticas: parágrafos são `p1, p2...` (na ordem, ignorando
imagens e cabeçalhos) — é assim que o quiz se prende ao texto.

## 2. Front matter — referência completa

```yaml
---
titulo: "O Nome do Livro"
autor_original: "Esopo | Saint-Exupéry | Epicteto (adaptação autoral livre)"
fonte_idioma: "grego"
faixa_etaria: "6-9"
nivel_leitura: "iniciante"
licenca: "CC0"
tradutor: "[selo infantil]"

# ---- IMERSÃO TEMÁTICA (o app inteiro se veste do livro ao abri-lo) ----
tema_padrao: "floresta"        # OU um tema pronto (arco-iris|floresta|espaco|alto-contraste)
tema_livro:                    # OU cores exclusivas do livro (vence tema_padrao)
  fundo: "#e8f2fc"
  destaque: "#166b8a"
# Ao sair do livro, o tema escolhido pela criança volta sozinho.

# ---- ABERTURA CÊNICA ("a coruja que entrega o pergaminho") ----
abertura: "carta"              # id de um asset (SVG animado); mostrado em
                               # palco cheio ao abrir da estante, toque entra

# ---- NARRAÇÃO GRAVADA (voz humana no lugar do TTS robótico) ----
narracao: "som01"              # id de um asset tipo "audio"; o botão
                               # "Ouvir a história" toca a gravação em vez
                               # do TTS. Gravar em mp3 comprimido (o áudio
                               # entra no bundle). Sem este campo, o botão
                               # usa TTS do texto inteiro.

assets:
  - id: "carta"                # abertura (não precisa de âncora no texto)
    tipo: "ilustracao"
    arquivo: "nina_abertura.svg"
  - id: "il01"                 # desenho de pintar (ganha 🎨 e 🧩 automáticos)
    tipo: "colorir"
    arquivo_interativo: "nina_colorir.svg"
  - id: "il02"                 # ilustração viva (SVG animado por CSS) ou estática
    tipo: "ilustracao"
    arquivo: "nina_chuva_viva.svg"
  - id: "som01"                # áudio empacotado (registrar em arquivosImagens)
    tipo: "audio"
    arquivo: "narracao.mp3"
  - id: "clipe01"              # vídeo curto empacotado
    tipo: "video"
    arquivo: "clipe.mp4"

quiz:
  - pergunta: "Pergunta presa a um parágrafo?"
    alternativas: ["Errada", "Certa", "Errada"]
    correta: 1
    nivel: "paragrafo"
    ancora: "p3"
    explicacao: "Sempre revelada. ZERO GATE."
  - pergunta: "Interpretação no fim?"
    alternativas: ["...", "...", "..."]
    correta: 0
    nivel: "capitulo"
    explicacao: "..."
---
```

O que cada tipo de asset ganha de graça: `colorir` → tela de pintura
(balde/pincel/borracha), impressão A4, quebra-cabeça 4-20 peças da arte
pintada, preview colorido; `ilustracao` → exibida como é (anima se tiver
CSS); `audio`/`video` → player nativo com controles, sem autoplay.

## 3. Regra de ouro da gamificação: fases por PARTICIPAÇÃO, nunca por acerto

"Quiz para passar de fase" quebraria a decisão zero-gate (spec 8.5, do
Bruno). A forma correta de dar sensação de fases: **avançar por ter feito**
— leu o capítulo, respondeu o quiz (certo OU errado), pintou, montou o
quebra-cabeça. A criança sente progressão e nunca fica travada. Acerto
continua sendo registrado em silêncio, jamais vira portão.

## 4. Enigmas (planejado, ainda não implementado)

Formato previsto: pergunta charada com alternativas em IMAGEM (tocar no
desenho certo, não digitar) — digitação é barreira para 6-7 anos. Entra
como `nivel: "enigma"` no quiz, mesma mecânica zero-gate, revelação
teatral (confetes + explicação). Anotar no CONTINUAR_AQUI quando for
implementar.

## 5. Sobre licenças e o sonho do Harry Potter

IP licenciado (Harry Potter etc.) é juridicamente inviável para app
independente — mas a ENGRENAGEM já faz a experiência: abertura cênica,
tema próprio, imagens vivas, enigmas. O caminho é aplicar essa riqueza
total ao domínio público: O Pequeno Príncipe (as aquarelas do PRÓPRIO
Saint-Exupéry estão em domínio público no Brasil junto com o texto —
redesenhá-las como SVG de pintar é permitido e lindo), Esopo, Grimm,
Andersen, e as historinhas filosóficas autorais.

## 6. Convenções técnicas

- SVG animado: `<style>` + `@keyframes` DENTRO do SVG, classes prefixadas
  com o nome do arquivo (`ncv-`, `nab-`) para nunca colidir.
- Colorir: regiões `id="regiao-*"` + `class="colorir-alvo"`, fill inicial
  `#ffffff`; `<g>` agrupa várias formas numa região só.
- Registro: todo arquivo novo entra em `src/conteudo/catalogo.ts`
  (SVG → `arquivosAssets`; PNG/JPG/mp3/mp4 → `arquivosImagens` via `?url`).
- Ids de livro e de asset são eternos: nunca renomear depois de publicado.
- Antes de concluir: `npm test` (prova de fogo) + `npm run build` limpos.
