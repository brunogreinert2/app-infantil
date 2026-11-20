# Acessibilidade visual — auditoria e plano (WCAG 2.2 AAA + Perkins)

Começada em 2026-11-20, a pedido do Bruno: «seremos referência nisso». O
público delimitado do app é a **criança com baixa visão em alfabetização**
(6 a 10 anos). A meta é o nível **AAA** do WCAG 2.2 em tudo o que a criança
lê e toca, com as recomendações da Perkins School for the Blind que o Pedra
Angular já segue.

Este arquivo é a régua: o que se mede, o que já passa, o que falta. Ao
consertar um item, marque aqui com a data.

**Princípio (Bruno, 2026-11-20):** a régua mora AQUI e nos testes, nunca na
tela. O app não escreve «7:1» nem «WCAG» para a criança, e não tem menu
chamado «Acessibilidade» — o rótulo afasta justamente quem mais precisa. O
trabalho é feito antes; quem toca no tema colhe o benefício. E o caminho é
não depender de aparelho óptico: no digital, ampliar, contrastar, espaçar e
falar fazem o papel da lupa.

## A régua

| Critério (WCAG 2.2) | Nível | O que pede |
|---|---|---|
| 1.4.6 Contraste reforçado | AAA | texto 7:1; letra grande (≥ 24 px, ou ≥ 18,66 px em negrito) 4,5:1 |
| 1.4.8 Apresentação visual | AAA | cores escolhidas pelo usuário; linha ≤ 80 caracteres; sem justificar; entrelinha ≥ 1,5; texto a 200% sem rolagem lateral |
| 1.4.4 Redimensionar texto | AA | 200% sem perder conteúdo |
| 1.4.10 Refluxo | AA | 320 px de largura (zoom de 400%) sem rolagem lateral — exceto o que é bidimensional (grade, mapa, tabela) |
| 1.4.11 Contraste não textual | AA | borda e ícone que identificam um controle: 3:1 |
| 1.4.12 Espaçamento de texto | AA | aguentar entrelinha 1,5, letra 0,12, palavra 0,16, parágrafo 2× |
| 2.4.13 Aparência do foco | AAA | anel ≥ 2 px de perímetro, 3:1 contra o que está em volta |
| 2.4.12 Foco não encoberto | AAA | nada cobre o elemento em foco |
| 2.5.5 Tamanho do alvo | AAA | 44 × 44 px |

**Perkins** (resumo do que vale para tela): não existe um esquema de cores
universal — cada condição ocular prefere um par texto/fundo — então se
oferecem os pares clássicos, à escolha (preto/branco, branco/preto,
amarelo/preto, verde/preto, amarelo/azul); nenhum padrão atrás da letra;
ampliação sem perder o lugar; letra de alta legibilidade.

## Como se mede (não é chute)

- `src/telas/temas.test.ts` lê o `estilos.css` e mede **todos** os temas:
  texto e texto suave 7:1 no fundo e no cartão; letra do botão 7:1; título
  4,5:1; borda 3:1 nos temas de enxergar melhor. Tema novo que reprovar não
  entra.
- `src/caa/modelo.test.ts` mede a paleta da prancha (tinta ≥ 7:1).
- No navegador: letra 57 px e 180 px, tela de 1600 px e de 375 px.

## Já atende (medido)

- **11 temas, todos ≥ 7:1** no texto (de 7,1 a 21:1). Os 5 de baixa visão e
  os 3 de conforto são os do Pedra Angular, com as mesmas cores.
- **Tema de baixa visão é soberano:** o tema do livro não o troca.
- **Letra de 12 a 180 px** (A− / A+), com passo de 12,5%, encaixada na grade
  de pixels; escolha de letra (Cardo, Atkinson Hyperlegible, OpenDyslexic),
  peso, entrelinha e espaço entre letras e palavras.
- **Zoom do navegador liberado** (o viewport não bloqueia o gesto de pinça).
- **Leitura em voz alta** em todo parágrafo e capítulo.
- **Anel de foco** na cor de destaque do tema (≥ 4,5:1 contra o fundo em
  todos os temas, acima dos 3:1 pedidos).
- `prefers-reduced-motion` e `forced-colors` respeitados.

## Feito em 2026-11-20

1. **Temas para enxergar melhor** (Preto no branco, Branco no preto, Amarelo
   no preto, Verde no preto, Amarelo no azul) e **para ler muito tempo**
   (Sépia, Azul-noite, Azul-petróleo), trazidos do Pedra Angular. Na tela os
   grupos se chamam «Mais contraste», «Para ler por mais tempo» e «Para brincar». A tela de
   aparência mostra os temas **em grupos, na ordem** (baixa visão primeiro) e
   cada botão **veste o seu tema**: a criança vê as cores antes de escolher.
2. **Temas de brincar subiram para AAA:** texto suave do Arco-íris (6,71 →
   8,35:1) e da Floresta (6,59 → 8,24:1); a cor de destaque dos dois (4,97 e
   6,54 → 8,0 e 8,87:1 com a letra do botão). Borda do Branco no preto
   2,67 → 3:1 ou mais.
3. **O 🔊 cobria o fim da linha** com letra grande (captura do Bruno): o
   espaço reservado era de 54 px fixos e o botão crescia com a letra. Agora os
   dois crescem juntos (`max(44px, 1,9em)`).
4. **Menu lateral cresce com a letra** (13 letras de largura; nunca menos de
   320 px nem mais de 88% da tela; fixo, no máximo metade da tela). Na letra
   57, «Bruno» e «Histórias» saíam letra por letra. E ganhou uma **alça** na
   borda: arrastar (mouse ou dedo) ou setas com ela em foco alargam ou
   estreitam; Home ou dois toques voltam ao normal. A largura fica guardada
   **por perfil, em letras** (muda a letra, continua cabendo).
5. **Prancha com zoom** (A− / A+ na barra dela, 6 degraus, guardado no
   aparelho). As casas crescem a partir do tamanho que cabe na tela, e a letra
   da barra, da frase e dos botões cresce junto. **A ordem das casas nunca
   muda** (a memória de onde fica cada palavra é o que deixa a CAA rápida):
   quando não cabem, a prancha rola para os lados (exceção do 1.4.10 para
   conteúdo bidimensional) — sem cortar a primeira coluna. A barra e a frase
   quebram linha em vez de alargar a página.

## Falta (em ordem de impacto para baixa visão)

1. **Primeira vez:** perguntar à criança/família «como você enxerga melhor?»
   já com os botões vestidos de cada tema, e respeitar `prefers-contrast:
   more` e `prefers-color-scheme: dark` do aparelho (o Pedra já usa o tema
   escuro do sistema).
2. **Prancha de alto contraste:** hoje a prancha tem paleta fixa clara. Quem
   enxerga melhor em fundo escuro precisa de uma versão escura (fundo preto,
   casas com borda clara, figura em traço branco), mantendo as cores de
   categoria como faixa, não como fundo.
3. ~~**Folhas A4 ampliadas**~~ — FEITO em 2026-11-20 (ver abaixo). Falta
   levar o «maior onde cabe» a mais tipos (sílabas, memória, relógio, rotina).
4. **Bordas dos temas de brincar** (1,2 a 1,7:1): onde a borda é o que
   separa o botão do fundo, ela precisa de 3:1. Medir botão a botão; onde for
   preciso, uma `--borda-ui` mais escura só nos controles (como no Pedra).
5. **Jogos na tela com o tema:** as grades usam papel branco e tinta preta
   fixos (bom contraste, mas não seguem o Amarelo no preto etc.). Levar as
   variáveis do tema para o caça-palavras, a cruzadinha, o sudoku, as contas
   e a memória.
6. **Linha ≤ 80 caracteres** (1.4.8): medir a coluna de leitura em tela larga
   com letra pequena.
7. **Refluxo a 400%** em todas as telas (oficina, jogos, ajustes) e teste com
   leitor de tela (TalkBack e VoiceOver) — ainda não feitos.
8. **Alvos de 44 px** em toda parte: conferir as bolinhas das contas (40 px)
   e as casas do caça-palavras grande no celular (o 2.5.5 dispensa grade que
   é o próprio conteúdo, mas vale tentar).

## Folha ampliada (2026-11-20)

Um liga/desliga a mais na oficina, **«🔍 Folha ampliada»**, desligado por
padrão: com ele desligado, toda folha e todo código continuam iguais.

- **Em toda folha** (`ampliarFolha`, em `geradores/comum.ts`): a letra ganha
  contorno da própria tinta (≈ 4% da letra: mais grossa sem mudar de lugar),
  todo traço fica 1,6× mais grosso e o cinza do meio vira cinza escuro (a
  linha-guia clara some para quem vê pouco; o quase branco fica).
- **Maior onde cabe** (os geradores leem `ampliada()`):
  - caça-palavras: a MENOR grade em que todas as palavras cabem uma vez só (o
    que limita a letra é a largura da folha ÷ colunas) e lista em letra 30;
    se ainda ficar com mais de 10 colunas, um aviso sugere menos palavras;
  - cruzadinha: a grade ocupa uma folha inteira (casas até 110) e as dicas vão
    para a folha seguinte, em letra 28;
  - contas armadas: cada conta 1,5× maior, seis por folha.
- Entra no **código da folha** (campo `ampliada`, no fim da lista) só quando
  ligada; montar pelo código liga a caixa de novo. O 🎮 Jogar de uma folha
  ampliada joga a mesma grade dela.

## A mesma barra em toda tela (2026-11-20)

Pedido do Bruno, com capturas: a barra do alto é sempre a mesma, fixa no alto
e do mesmo tamanho (não engrossa com o A+), como a do Pedra Angular:
**← · menu (o avatar, com perfil) · título · A− A+ · 🎨**.

- `barraTopo()` (telas/comum.ts) é a única barra; a oficina, os ajustes, o
  guia, a trava dos adultos, o montar pranchas e a aparência deixaram de
  montar a sua (eram só ← e título).
- A− / A+ funcionam também sem perfil (área dos adultos): a letra fica
  guardada no APARELHO (`aparelho:tamanhoFonte`).
- O 🎨 das telas sem caminho próprio (jogos, pintura, quebra-cabeça,
  oficina) abre a aparência POR CIMA da tela; as mudanças valem na hora e
  ← ou Esc voltam para onde se estava. Sem perfil não há 🎨 (a aparência é de
  cada criança).
- A barra da prancha é presa no alto e TRAVADA: o zoom cresce as casas e a
  frase, nunca a barra.

