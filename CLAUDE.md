# App Infantil — "Historinhas" (nome provisório)

App educativo de leitura + quiz + colorir para crianças, projeto-irmão do
Pedra Angular (`C:\Claude\app-leitura`). Público inicial: Theo (7) e Davi (9),
filhos do Bruno. Missão: aprender tem que competir com brainrot — lúdico,
recompensa previsível (nunca aleatória), zero pressão de nota.

**Leia primeiro:** `ESPECIFICACAO.md` (spec completa, decisões numeradas) e
`docs/CONTINUAR_AQUI.md` (estado atual + próximos passos em ordem).

## Stack

- Vite + TypeScript **vanilla** (sem framework — decisão da spec, seção 1)
- `js-yaml` para front matter (empacotado; zero rede em runtime)
- Alvo final: **Capacitor 6+** (Android/iOS de loja, não PWA) — ainda não adicionado
- Persistência: abstração em `src/armazenamento/armazenamento.ts`
  (hoje localStorage; trocar por `@capacitor/preferences` + SQLite sem mudar chamadores)

## Rodar

```bash
npm run dev      # localhost:5173 (ou 5174 via launch.json da raiz C:\Claude)
npm run build    # tsc --noEmit && vite build — precisa passar limpo antes de concluir
```

## Princípios inegociáveis (herdados da spec)

1. Parser burro de propósito (`src/motor/parser.ts`): só cabeçalho `#{1,}` (profundidade
   ARBITRÁRIA, sem teto de 6), linha de texto, e `{{img:id}}` em linha própria. Nada mais.
2. Imagem nunca é sintaxe inline — todo asset é declarado no front matter e referenciado
   por id (`src/conteudo/catalogo.ts` faz o lookup).
3. Zero rede em runtime: tudo via `import ?raw` no bundle.
4. Quiz **zero-gate**: qualquer resposta revela a correta + explicação; nada trava o
   avanço; tentativas/acertos gravados em silêncio, NUNCA exibidos como nota à criança.
5. App sempre abre na seleção de perfil; troca de perfil nunca passa por trava parental.
6. Conteúdo: domínio público com tradução própria documentada (campo `tradutor` no YAML).
7. Recompensas fixas e previsíveis — nunca mecânica de sorte/aleatória.

## Arquitetura (mapa rápido)

```
src/motor/        parser.ts (3 regras de linha), frontmatter.ts, tipos.ts
src/conteudo/     catalogo.ts (registro de livros+assets), livros/*.md, assets/*.svg
src/canvas/       camadaBase (SVG fill por toque), camadaPincel (canvas traço livre,
                  coords normalizadas 0..1), roteadorFerramenta (pointer-events)
src/impressao/    motorImpressao.ts (v0: contorno P&B via iframe)
src/telas/        telaPerfis, telaEstante, telaLeitura, telaColorir, comum, preferencias
src/armazenamento/ interface async + impl web; convenção de chaves documentada no arquivo
src/perfis/       perfis semeados: Theo 🦖 (6-8), Davi Ω (9-11)
```

Canvas de colorir = 3 camadas na ordem do DOM: base (SVG com `.colorir-alvo`),
pincel (canvas, `pointer-events` alterna com a ferramenta), linhas (SVG contorno,
`pointer-events:none` sempre). As camadas linhas e P&B de impressão são DERIVADAS
da mesma arte-fonte em runtime (`camadaBase.ts`) — uma arte, três papéis.

## Adicionar um livro novo

1. `src/conteudo/livros/<id>.md` — front matter (schema na spec seção 3) + texto.
2. SVG de colorir em `src/conteudo/assets/` — cada região com `id="regiao-*"`
   e `class="colorir-alvo"`, fill inicial `#ffffff`.
3. Registrar ambos em `src/conteudo/catalogo.ts` (2 imports + 2 entradas).

## Convenções

- UI, identificadores e commits em português (o código-fonte é bilíngue de propósito:
  módulos seguem os nomes da spec — camadaBase, roteadorFerramenta, etc.).
- Commits pequenos e frequentes, mensagens em português.
- Antes de concluir qualquer fase: `npm run build` limpo + teste no viewport mobile.
- Contraste de texto ≥ 7:1 em todos os temas (padrão Perkins herdado do Pedra Angular).
