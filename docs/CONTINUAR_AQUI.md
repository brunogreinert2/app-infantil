# CONTINUAR AQUI — chave de handoff entre sessões/modelos

> Escrito por Claude Fable 5 em 2026-07-19, na última sessão do Bruno com esse
> modelo. Qualquer Claude (Sonnet, Opus, Haiku) abre este arquivo + `CLAUDE.md`
> + `ESPECIFICACAO.md` e continua sem precisar de contexto da conversa original.
>
> **Prompt sugerido para retomar num chat novo (copie e cole):**
> "Continue o app-infantil em C:\Claude\app-infantil. Leia CLAUDE.md,
> docs/CONTINUAR_AQUI.md e ESPECIFICACAO.md antes de qualquer coisa e siga
> a lista de próximos passos na ordem."

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
