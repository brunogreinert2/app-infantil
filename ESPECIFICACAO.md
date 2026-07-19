# Especificação técnica — App Infantil (projeto-irmão do Pedra Angular)

**Status:** rascunho de arquitetura, pré-implementação
**Destinado a:** Claude Code (qualquer modelo — Sonnet, Opus ou Fable) executando a construção
**Herda de:** Pedra Angular — motor de parsing de profundidade arbitrária, sistema de temas por variável CSS, filosofia "zero rede" (fontes embutidas, sem CDN)

---

## 0. Princípios herdados (não negociáveis)

Estes princípios vêm diretamente do `rolo.html` / `ProvaDeFogo.html` e devem ser preservados no app novo:

1. **Sem teto artificial de estrutura.** O parser de cabeçalhos (`/^(#{1,})\s+(.*)$/`) não limita profundidade a 6 níveis (herança do HTML de 1991). Mesmo que o conteúdo infantil raramente passe de 3-4 níveis (Livro → Capítulo → Parágrafo), o motor deve continuar suportando profundidade arbitrária, de graça, para o dia em que um livro mais longo precisar.
2. **Zero dependência de rede em runtime.** Fontes embutidas via `@font-face` com `data:` URI ou empacotadas localmente — nunca carregadas de CDN. Mesma lógica do `ProvaDeFogo.html`.
3. **Conteúdo em domínio público, tradução própria documentada.** Todo texto de origem estrangeira (Grimm, Andersen, Perrault, Esopo) precisa ou (a) tradução direta do original feita pelo projeto, com léxico de decisões próprio, ou (b) tradução portuguesa antiga o suficiente para estar em domínio público, modernizada ortograficamente.
4. **Separação de identidade.** Historinhas filosóficas autorais (Aristóteles sobre Ethos, Epicteto) vivem neste app. No máximo, versões simplificadas aparecem na seção infantil do Pedra Angular. Nunca o inverso.

---

## 1. Stack técnica

| Camada | Escolha | Justificativa |
|---|---|---|
| Build | Vite + TypeScript | Mesma base do Pedra Angular |
| Framework de UI | Vanilla TS (sem framework), por padrão | Consistente com o estilo enxuto do `rolo.html`. Reavaliar Preact (~3kb) só se o estado do canvas de colorir ficar difícil de gerenciar imperativamente |
| Empacotamento nativo | **Capacitor 6+** | Reaproveita ~90% do código web atual; gera app real para iOS/Android; acesso a APIs nativas |
| Persistência | `@capacitor/preferences` | Mais robusto que `localStorage` puro em WebView Android, que pode ser limpo agressivamente pelo sistema |
| Arquivos/cache de assets | `@capacitor/filesystem` | Cache local de SVGs/ilustrações para uso 100% offline após primeiro download |
| Ciclo de vida do app | `@capacitor/app` | Necessário para robustez real: criança troca de app no meio da leitura, volta, estado precisa sobreviver |
| TTS | `@capacitor-community/text-to-speech` (nativo) com fallback para Web Speech API em build de preview no navegador | TTS nativo tende a ser mais estável offline que o do navegador |
| Splash/status bar | `@capacitor/splash-screen`, `@capacitor/status-bar` | Polimento de "app de loja de verdade", não PWA disfarçada |

---

## 2. Arquitetura do parser: texto vs. imagem (decisão central)

**O parser de texto continua burro de propósito.** Ele entende exatamente dois tipos de linha: cabeçalho (`#{1,}`) e linha de texto comum — igual ao `rolo.html` hoje. Não aprende sintaxe de mídia.

**Imagem nunca é sintaxe inline solta no meio do markdown** (nada de `![alt](caminho.png)` livre). Toda imagem é um **asset nomeado**, declarado no front matter YAML do arquivo, e referenciado por id. Três motivos:

- Mantém o parser de texto simples e testável isoladamente (mesmo espírito do `ProvaDeFogo.html`: provar que o motor central aguenta, sem acoplar responsabilidades).
- A mesma ilustração pode servir três papéis (capa, ilustração de página, versão para colorir) sem duplicar ou reescrever o texto.
- Separa o fluxo de trabalho de tradução/texto (você) do fluxo de produção de arte (ilustrador, possivelmente terceirizado no futuro) — um não trava o outro.

Se for necessário ancorar uma imagem a um ponto exato do texto, usa-se uma marca leve, numa linha própria:

```
{{img:il02}}
```

O parser trata isso como um terceiro tipo de nó (`imagem`), resolvido depois por um **resolvedor de assets** que faz o `lookup` do id no front matter. Não é uma sintaxe nova de colchetes-e-parênteses — é só mais uma regra de linha, no mesmo espírito do parser atual.

### Três tipos de asset visual

| Tipo | Formato | Uso |
|---|---|---|
| `ilustracao` / `capa` | SVG ou PNG | Decorativa/narrativa, estática, sem interação |
| `colorir` | SVG com regiões marcadas (`<path id="regiao-1" class="colorir-alvo">`) | Renderizada dentro do app; toque numa região aplica cor da paleta ativa |
| `impressao` | SVG P&B, só contorno (`fill:none`, `stroke` apenas) | Gerada a partir da mesma arte-fonte do `colorir`, simplificada; usada só para impressão em papel — reaproveita o padrão de botão de impressão por unidade já validado no `rolo.html` |

Persistência do progresso de colorir: `{ ilustracaoId: { regiaoId: corHex } }`, salvo via `@capacitor/preferences`.

---

## 3. Schema de conteúdo (front matter YAML estendido)

```yaml
---
titulo: "A Lebre e a Tartaruga"
autor_original: "Esopo"
fonte_idioma: "grego"
faixa_etaria: "6-9"
nivel_leitura: "iniciante"
licenca: "CC0"
tradutor: "[nome/pseudônimo do projeto infantil]"
tema_padrao: "arco-iris"

assets:
  - id: "il01"
    tipo: "capa"
    arquivo: "il01_capa.svg"
  - id: "il02"
    tipo: "colorir"
    arquivo_interativo: "il02_colorir.svg"
    arquivo_impressao: "il02_pb.svg"

quiz:
  - pergunta: "Por que a tartaruga venceu a corrida?"
    alternativas:
      - "Ela foi mais rápida"
      - "Ela não desistiu"
      - "A lebre dormiu na linha de chegada"
    correta: 1
    nivel: "paragrafo"
    ancora: "p3"
---
```

Campos novos em relação ao schema do Pedra Angular: `faixa_etaria`, `nivel_leitura`, `assets` (substitui imagem solta), `quiz`. Campos herdados sem alteração: `titulo`, `licenca`, `tradutor`, `tema_padrao` (aponta pro sistema de temas, ver seção 5).

---

## 4. Motor de quiz

- Perguntas podem ser ancoradas em `nivel: "paragrafo"` (reforço de leitura, uma por parágrafo, formato pergunta-resposta simples) ou `nivel: "capitulo"` (interpretação de texto mais elaborada, ao final do capítulo).
- `ancora` referencia o id do nó no texto (mesmo mecanismo de âncora que já existe para busca canônica no Pedra Angular).
- UI: pergunta aparece inline, logo após o nó ancorado, ou como modal ao final do capítulo — decisão de UX em aberto (ver seção 7).
- **Interação (decidido, ver 8.5): zero gate.** A criança toca em qualquer alternativa — certa ou errada. O app sempre revela a resposta correta com uma explicação curta, e libera a continuação do texto na sequência. Não é prova, é acessório de reforço de leitura; nada trava o avanço.

---

## 5. Sistema de temas (reaproveitado, não recriado)

O Pedra Angular já resolve isso via variáveis CSS trocáveis (6 temas de alto contraste, escala Perkins, ≥7:1). O app infantil estende o **mesmo mecanismo** com duas categorias:

- **Temas de acessibilidade**: fonte (Atkinson Hyperlegible, OpenDyslexic, sans padrão — todas OFL, embutidas via `@font-face`), tamanho de fonte, alto contraste.
- **Temas decorativos**: escolhidos pela criança — rosa+arco-íris, espaço, floresta, etc. Puramente estéticos, mesma troca de variável CSS, nenhuma lógica nova.

Nota sobre OpenDyslexic: evidência científica é mista quanto a ganho objetivo de velocidade de leitura, mas a preferência subjetiva relatada é forte. Por isso é oferecida como **opção**, nunca como padrão forçado.

---

## 6. Robustez ("aguentar pancada") — checklist de implementação

- [ ] Nenhum asset carregado de rede em runtime após instalação inicial (fontes embutidas, SVGs em cache local via `@capacitor/filesystem`)
- [ ] Estado sobrevive a app indo para background/foreground (`@capacitor/app` lifecycle hooks)
- [ ] Toques múltiplos/rápidos na área de colorir não quebram o estado (debounce ou fila de eventos)
- [ ] Testado em dispositivo Android de entrada (WebView mais lento, menos RAM)
- [ ] Preferences (não localStorage puro) para qualquer dado que precise sobreviver limpeza agressiva do sistema

---

## 7. Decisões ainda em aberto (não resolvidas aqui, precisam da sua palavra)

1. Nome/identidade do projeto e do selo/pseudônimo autoral infantil.
2. UX do quiz: inline após parágrafo vs. modal ao final do capítulo — ou os dois, configurável por livro.
3. Primeiros 3-5 títulos de lançamento (sugestão: 1-2 fábulas de Esopo traduzidas direto do grego + 1-2 contos de domínio público já resolvidos juridicamente + 1 historinha filosófica autoral, pra validar o pipeline completo desde o primeiro título).
4. Léxico de decisões pedagógicas: arquivo separado do léxico acadêmico do Pedra Angular, documentando escolhas de simplificação ao adaptar Aristóteles/Epicteto para criança.
5. Se o app infantil carrega algum colofão próprio, ou se fica só com crédito simples (o `Ὁ Διαφορεύς παρῆν` é da persona filosófica adulta, provavelmente não é o selo certo aqui).

---

---

## 8. Canvas de pintura híbrido, motor de impressão e gamificação construtiva

*(Seção incorporando e revisando propostas externas trazidas pelo usuário — validadas com ajustes técnicos abaixo.)*

### 8.1 Correção de stack: SQLite, não Hive

Hive é específico do ecossistema Flutter/Dart e não se aplica a um stack Capacitor/TypeScript. O banco local real é **`@capacitor-community/sqlite`**. O `@capacitor/preferences` (seção 1) continua existindo, mas só para chaves triviais (tema ativo, último perfil usado) — dados relacionais (progresso, figurinhas, estado de colorir por criança) vivem no SQLite.

### 8.2 Estrutura de camadas do canvas (DOM + módulos TS, vanilla)

```
<div class="tela-colorir">
  <svg class="camada-base">        <!-- z-index mais baixo -->
    <path id="regiao-1" fill="...">
    <path id="regiao-2" fill="...">
    ...
  </svg>

  <canvas class="camada-pincel">   <!-- z-index meio -->
    <!-- transparente; captura stroke quando ferramenta = pincel -->
  </canvas>

  <svg class="camada-linhas" style="pointer-events:none">  <!-- z-index topo -->
    <path stroke="#000" fill="none">  <!-- só contorno, nunca recebe clique -->
  </svg>

  <div class="barra-ferramentas">
    <!-- seletor balde/pincel, paleta, borracha, desfazer -->
  </div>
  <button class="botao-imprimir">
</div>
```

**Roteamento de eventos (ponto que a proposta original deixava ambíguo):**
- `camada-linhas` tem `pointer-events:none` sempre — é só visual, nunca intercepta toque.
- `camada-pincel` alterna `pointer-events` conforme a ferramenta ativa: `auto` quando pincel está selecionado (captura o traço), `none` quando balde está selecionado (deixa o clique passar direto pra camada base).
- Com o balde ativo, o clique cai naturalmente sobre um `<path>` real da `camada-base` — o navegador já resolve isso via `event.target.id`, sem precisar calcular manualmente "que polígono contém essas coordenadas". Isso é mais simples e mais robusto do que fazer matemática de ponto-em-polígono na mão.

Módulos TS sugeridos: `canvas/camadaBase.ts` (fill dinâmico por id), `canvas/camadaPincel.ts` (captura de stroke, undo/redo), `canvas/roteadorFerramenta.ts` (alterna pointer-events e ferramenta ativa), `impressao/motorImpressao.ts` (seção 8.3).

### 8.3 Motor de impressão inteligente

```
Se camada-pincel nunca recebeu stroke:
  → renderizar camada-base com fill forçado para "none"
  → sobrepor camada-linhas
  → gerar PDF: livro de colorir P&B clássico

Se camada-pincel recebeu stroke:
  → converter conteúdo da camada-pincel para escala de cinza (canvas filter ou reprocessamento de pixel)
  → compor: camada-base (cores escolhidas) + camada-pincel (cinza) + camada-linhas (preto)
  → gerar PDF: registro do desenho da criança, econômico em tinta
```

Recomendo expor essa decisão como padrão automático, mas com um toggle visível "imprimir em cores" — assim o pai decide se quer gastar mais tinta, em vez do app decidir sozinho sem opção de escolha.

### 8.4 Schema do banco local (SQLite)

```sql
CREATE TABLE perfis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  avatar_id TEXT NOT NULL,
  faixa_etaria TEXT,             -- ex: '6-9' — casa com o campo faixa_etaria do front matter (seção 3)
  tema_preferido TEXT DEFAULT 'padrao',
  criado_em TEXT DEFAULT (datetime('now'))
);

CREATE TABLE progresso_livros (
  perfil_id INTEGER REFERENCES perfis(id),
  livro_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('nao_iniciado','em_andamento','concluido')) DEFAULT 'nao_iniciado',
  posicao_atual TEXT,           -- id do nó/parágrafo onde parou
  atualizado_em TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (perfil_id, livro_id)
);

CREATE TABLE progresso_quiz (
  perfil_id INTEGER REFERENCES perfis(id),
  pergunta_id TEXT NOT NULL,
  tentativas INTEGER DEFAULT 0,
  acertou INTEGER DEFAULT 0,     -- 0/1
  respondido_em TEXT,
  PRIMARY KEY (perfil_id, pergunta_id)
);

CREATE TABLE estado_colorir (
  perfil_id INTEGER REFERENCES perfis(id),
  ilustracao_id TEXT NOT NULL,
  regiao_id TEXT NOT NULL,
  cor_hex TEXT,
  usou_pincel_livre INTEGER DEFAULT 0,
  PRIMARY KEY (perfil_id, ilustracao_id, regiao_id)
);

CREATE TABLE figurinhas_desbloqueadas (
  perfil_id INTEGER REFERENCES perfis(id),
  figurinha_id TEXT NOT NULL,
  desbloqueada_em TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (perfil_id, figurinha_id)
);
```

**Nota de arquitetura:** o catálogo de figurinhas (nome, imagem, curiosidade pro TTS) é conteúdo estático — deve viver num arquivo JSON/YAML empacotado junto com os assets, não numa tabela do banco. O banco guarda só *qual figurinha cada perfil já desbloqueou*, nunca o catálogo em si. Mesma lógica de separação texto/asset da seção 2.

### 8.5 Ajuste de bem-estar na gamificação

- Quiz por parágrafo: **zero gate** (decisão final do usuário, substitui a sugestão inicial de soft-gate com tentativas). A criança toca numa alternativa, certa ou errada, o app sempre revela a resposta correta com explicação breve e libera a continuação. As colunas `acertou`/`tentativas` na tabela `progresso_quiz` continuam existindo, mas só para uso silencioso — nunca exibidas como nota/placar pra criança. Servem, no máximo, pra um resumo opcional voltado ao pai (ex: "esse mês, X livros lidos"), nunca como pressão sobre o filho.
- Recompensas (figurinhas, avanço no tabuleiro) devem ser **fixas e previsíveis** por conquista (terminar livro X sempre dá figurinha Y) — nunca aleatórias ou com mecânica de sorte, pra não reintroduzir o mesmo gatilho de dopamina que o "anti-brainrot" pretende evitar.
- Trava parental: desafio matemático simples é proporcional pra alternar entre perfis de irmãos. Se no futuro existir qualquer ação sensível (compra, exclusão de dados), vale um gate mais deliberado do que uma soma simples que uma criança de 9 anos resolve de cabeça.
- **Múltiplos perfis num único aparelho** (cenário real do usuário: dois filhos, um iPad): a tela de seleção de perfil na abertura do app é o primeiro ponto de contato, antes de qualquer conteúdo — precisa ser puramente visual (avatar grande, nome, sem texto pequeno) pra uma criança de 7 anos escolher o próprio perfil sem ajuda. `faixa_etaria` por perfil (seção 8.4) permite que o mesmo acervo sirva os dois irmãos, cada um vendo recomendações/filtros adequados à própria idade automaticamente.

### 8.6 Fluxo de abertura e troca de perfil

- O app **sempre** abre na tela de seleção de perfil — nunca pula direto pro último perfil usado, mesmo que só exista um perfil configurado.
- Seleção é **um toque só**: avatar grande, nome, nada de texto pequeno ou passos intermediários. Ao tocar, carrega direto a `posicao_atual` de `progresso_livros` (seção 8.4) — a criança continua exatamente de onde parou, sem telas extras no meio.
- Nicety opcional: a tela de seleção pode destacar visualmente o último perfil usado (borda, leve realce), mas isso é só uma pista visual — ainda exige o toque, nunca auto-entra sozinho.
- **Troca de perfil com o app já aberto**: precisa de um elemento de UI persistente e visível (ex: avatar pequeno fixo num canto da tela) que, tocado a qualquer momento, volta direto pra tela de seleção de perfil.
- **Correção importante ao escopo da trava parental (seção 8.5):** troca de perfil — seja no lançamento, seja em uso — **não passa pela trava parental**. É ação normal do dia a dia entre irmãos, precisa ser sem fricção nenhuma. A trava parental fica reservada só pra configurações do app, gerenciamento/exclusão de dados, e futuras compras. A proposta original (seção 8) agrupava troca de perfil junto dessas ações sensíveis — esse agrupamento fica revisado aqui.

---

*Este documento é ponto de partida para implementação, não spec final travada — espera-se revisão conforme a construção avança.*
