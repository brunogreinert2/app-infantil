# Como adicionar um livro novo

Receita completa. Funciona para qualquer história: fábula, conto de domínio
público (ex: O Pequeno Príncipe, em tradução própria) ou historinha filosófica
autoral (Epicteto, "tio Aristóteles"). Use `o-que-depende-de-mim.md` como
modelo vivo — foi o primeiro do gênero filosófico e valida o pipeline inteiro.

## Passo a passo (15 minutos por livro curto)

1. **Criar `src/conteudo/livros/<id-do-livro>.md`** — id em kebab-case, eterno
   (nunca renomear depois de publicado; regra herdada do Pedra Angular).
   Copie o template abaixo.
2. **Criar a arte de colorir** em `src/conteudo/assets/<nome>.svg`:
   - `viewBox="0 0 800 600"` para cena (paisagem) — retrato também funciona,
     a tela e a impressão se adaptam ao viewBox.
   - Cada região pintável: `id="regiao-<nome>"` + `class="colorir-alvo"` +
     `fill="#ffffff"`. Pode ser `<rect>`, `<circle>`, `<path>` ou um `<g>`
     com vários filhos (o grupo inteiro vira uma região só — ver a flor
     do `nina_colorir.svg`).
   - Desenhe de trás para frente (céu primeiro, personagem por último).
   - Contorno e versão de impressão são DERIVADOS automaticamente — não
     criar arquivo P&B separado.
3. **Registrar no `src/conteudo/catalogo.ts`**: 2 imports + 1 entrada em
   `livros` + 1 entrada em `arquivosAssets`.
   - **Imagem que não é de colorir** (ilustração pronta, capa): declare
     `tipo: "ilustracao"` com `arquivo:` no front matter. SVG entra em
     `arquivosAssets`; PNG/JPG entra em `arquivosImagens`
     (`import foto from './assets/foto.png?url'`). Pode adicionar quantas
     quiser, em qualquer ponto do texto, mesmo com o livro já pronto —
     é só ancorar mais `{{img:id}}`.
   - **Áudio e vídeo**: mesmíssimo caminho — `tipo: "audio"` (mp3/ogg) ou
     `tipo: "video"` (mp4/webm), arquivo em `arquivosImagens` via `?url`,
     âncora `{{img:id}}`. Player nativo com controles, sem autoplay.
     Atenção ao peso: mídia entra no bundle do app (zero rede em runtime) —
     preferir clipes curtos e comprimidos.
   - **Imagens que se mexem** (efeito "jornal do Harry Potter"): a forma
     leve e nítida é SVG animado por CSS — `<style>` com `@keyframes` dentro
     do próprio SVG, tipo `ilustracao`. Modelo vivo: `nina_chuva_viva.svg`.
     Prefixe classes e keyframes com o nome do arquivo (ex: `ncv-`) para não
     colidir com outras artes na mesma página. GIF animado também funciona
     (entra como raster comum), mas pesa mais e serrilha ao ampliar.
4. **Opcional — insígnia do livro** em `src/conquistas/insignias.ts`:
   uma entrada em `INSIGNIAS` + uma em `POR_LIVRO`. Regra da casa: fixa e
   previsível, nunca aleatória.
5. **Opcional — emoji de capa** em `EMOJIS_CAPA` (`src/telas/telaEstante.ts`).
6. `npm run build` limpo + testar no navegador (`npm run dev`).

## Template do .md

```markdown
---
titulo: "Título Bonito"
autor_original: "Esopo | Saint-Exupéry | Epicteto (adaptação autoral livre)"
fonte_idioma: "grego | francês | ..."
faixa_etaria: "6-9"
nivel_leitura: "iniciante"
licenca: "CC0"
tradutor: "[selo infantil]"
tema_padrao: "arco-iris"

assets:
  - id: "il01"
    tipo: "colorir"
    arquivo_interativo: "meu_desenho.svg"

quiz:
  - pergunta: "Pergunta ancorada num parágrafo?"
    alternativas:
      - "Errada"
      - "Certa"
      - "Errada"
    correta: 1
    nivel: "paragrafo"
    ancora: "p3"          # p1, p2... contam só parágrafos, na ordem
    explicacao: "Sempre revelada, zero gate."
  - pergunta: "Pergunta de interpretação no fim?"
    alternativas: ["...", "...", "..."]
    correta: 0
    nivel: "capitulo"
    explicacao: "..."
---

# Título Bonito

Parágrafo 1 (vira p1)...

Parágrafo 2...

{{img:il01}}

Parágrafo 3...
```

## Regras de conteúdo (inegociáveis, da spec)

- **Domínio público + tradução própria.** O Pequeno Príncipe: o original
  francês de 1943 está em domínio público no Brasil (Saint-Exupéry † 1944,
  70 anos post mortem) — a tradução precisa ser NOSSA, nunca copiada de
  edição comercial. Documentar decisões de tradução num léxico próprio
  (decisão 4 da spec, ainda aberta).
- **Historinhas filosóficas são autorais** e vivem SÓ neste app (separação
  de identidade, princípio 4). Fonte de consulta: o corpus do Pedra Angular
  via MCP `pedra-angular` (Epicteto, Aristóteles etc. com tradutor declarado).
- **Quiz zero-gate** sempre: nada trava o avanço da criança.
- Livro longo (capítulos)? O parser aceita `##` para capítulos e o quiz
  `nivel: "capitulo"` fica no fim do livro inteiro por ora — quiz por
  capítulo individual é evolução futura (anotar em CONTINUAR_AQUI.md).

## Ideias já encomendadas pelo Bruno

- **O Pequeno Príncipe** (tradução própria do francês, por capítulos).
- **Série "tio Aristóteles"**: ética a Nicômaco em historinhas (coragem como
  meio-termo, amizade, hábito que vira caráter).
- **Mais Epicteto**: "a flecha já voou" (o que passou não volta), "o papel
  no teatro" (fazer bem a parte que nos coube).
