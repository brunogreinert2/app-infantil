# Acessibilidade do Historinhas — o que foi medido, como, e o que não foi

Este arquivo é o registro honesto. Cada linha diz **o que foi verificado**,
**como** e — tão importante quanto — **o que NÃO foi verificado**. Nada aqui
vale como "testado com pessoas": até hoje nenhuma criança ou professora com
deficiência visual, motora ou de leitura avaliou o app de forma organizada.
Simulação e medida automática cobrem uma parte do problema, não ele todo.

Régua: `C:\Claude\portico\NORMAS.md` (LEI 4/5, N29) e a lista "Padrão de
referência em acessibilidade" de `docs/FABLE_PLANO_NOVAS_IDEIAS.md`.

Como ler a coluna **Prova**: *teste* = roda em `npm test`, quebra o build se
regredir; *medido* = número tirado no navegador (Chromium) na data indicada,
não se repete sozinho; *lido* = conferido só pela leitura do código.

---

## Cores de pintar (F1 — 2026-11-11)

Tela: `src/telas/telaColorir.ts`. Dados: `src/canvas/cores.ts`.
Simulador: `src/canvas/visaoDeCores.ts` (só entra nos testes, fora do pacote).

### O que mudou e por quê

| Antes | Agora |
|---|---|
| O nome da cor só existia em `title` (dica de mouse) e `aria-label`. No celular, ninguém via. | O nome da cor escolhida fica **sempre escrito**, grande, ao lado de uma amostra. |
| 14 cores em ordem de arco-íris, quebrando de linha conforme a largura. | 20 cores, cada uma com 5 tons (98 cores com nome), em **grade fixa** e numa ordem **medida**. |
| Cor escolhida = poço um pouco maior. | Cor escolhida = maior + borda grossa + marca ✓. |
| Sem voz. | Voz opcional por perfil ("Falar o nome das cores"), desligada por padrão. |

### Visão de cores (N29)

| Item | Resultado | Prova |
|---|---|---|
| Toda cor tem nome, nenhum nome se repete, nenhum hex se repete | 98 cores, 98 nomes | teste (`cores.test.ts`) |
| Nenhuma cor da paleta encosta (ao lado, acima, abaixo) em outra parecida, para visão comum, protanopia, deuteranopia e tritanopia | menor diferença entre vizinhas: ΔE 33 (piso do teste: 25) | teste |
| O modelo reproduz a confusão real | vermelho × verde: ΔE 116 na visão comum, 7 na deuteranopia | teste |
| Tons vizinhos de um mesmo matiz continuam diferentes | sim; o par mais fraco é amarelo muito claro × amarelo claro na tritanopia (ΔE 5,9) | teste (piso 5) |
| A marca ✓ se lê sobre qualquer cor | contraste ≥ 4,5:1 nas 98 | teste |

Por que a ordem importa — pares que a ordem antiga (arco-íris) deixava
próximos, pela mesma medida (ΔE na pior visão; abaixo de ~10 confunde):
Rosa × Turquesa 4 · Azul-céu × Verde-mar 5 · Vermelho × Marrom 6 ·
Azul × Roxo 6 · Vermelho × Verde 7 · Vermelho × Verde-oliva 7 ·
Amarelo × Bege 7. Na ordem nova nenhum desses pares é vizinho.

**Limites, sem enfeite:**
- É simulação (Machado, Oliveira e Fernandes, 2009, dicromacia completa) e
  ΔE de 1976. É um modelo de engenharia, não um exame. Ninguém com
  daltonismo conferiu a paleta nova na tela — nem o Bruno (protanomalia) ainda.
- A vizinhança só é garantida nas duas grades que existem: 5 colunas (abaixo
  de 700 px) e 10 colunas. Se alguém mudar o CSS da grade, o teste não percebe:
  as colunas estão declaradas em `COLUNAS_PALETA` e no CSS, à mão, nos dois.
- A garantia é entre **cores-base**. Um tom claro de um matiz pode parecer o
  tom claro de outro (todos os "muito claros" tendem ao branco). Quem cobre
  isso é o nome escrito — por isso o nome é a peça principal, não a ordem.
- Escala de cinza (acromatopsia): não medido.
- A pintura já feita na tela não tem nome: só a cor escolhida tem. Uma
  criança daltônica não tem como perguntar "de que cor eu pintei o céu?".

### Baixa visão e contraste

| Item | Resultado | Prova |
|---|---|---|
| Nome da cor sobre o fundo | Claro 11,5:1 · Floresta 10,7:1 · Espaço 16,8:1 · Alto contraste 21:1 | medido 2026-11-11 |
| Texto do botão "Tons" sobre o cartão | 12,3:1 a 18,4:1 nos quatro temas | medido 2026-11-11 |
| Borda de todo poço (para o amarelo-claro e o branco não sumirem) | mesma cor do texto: ≥ 10,7:1 contra o fundo | medido 2026-11-11 |
| Nome da cor acompanha o A−/A+ | usa `em` | lido |

Não verificado: tema "Monte o seu" (as cores são derivadas; não medi as 120
combinações); temas próprios de livro; texto a 200% nesta tela (a tela de
pintar não tem A−/A+ na barra, e não testei com a letra já ampliada).

### Motora

| Item | Resultado | Prova |
|---|---|---|
| Alvo de toque dos poços | 52 × 52 px, 12 px de espaço (eram 44 e 10) | medido |
| Botões "Tons" e voz | 48 px de altura mínima | lido |
| Toque longo tem alternativa de um toque | botão "Tons" faz o mesmo | medido (os dois caminhos) |
| Nada com limite de tempo | o toque longo só *acrescenta* (abre os tons); quem não consegue segurar não perde nada | lido |

Não verificado: uso com acionador (switch), mouse de cabeça ou tremor.
O toque longo dispara em 450 ms — número escolhido, não testado com crianças.

### Leitor de tela e teclado

| Item | Como está | Prova |
|---|---|---|
| Cada poço tem nome | `aria-label` = nome da cor | medido (DOM) |
| Estado escolhido | `aria-pressed` nos poços e nas ferramentas | medido (DOM) |
| Troca de cor é anunciada | o nome é `role="status"` | lido |
| Pintar é anunciado | região viva: "Pintou de Azul-céu" | medido (DOM) |
| "Tons" | `aria-expanded` + `aria-controls`; ao abrir pelo botão o foco vai ao tom atual; `Esc` fecha e devolve o foco | medido (DOM) |
| Branco e Preto não têm tons | botão desabilitado, com rótulo que diz por quê | medido (DOM) |

**Não verificado — e é a maior lacuna desta tela:** nenhum leitor de tela
real (VoiceOver, TalkBack, NVDA) foi ligado. "Medido (DOM)" quer dizer que os
atributos estão certos, não que a experiência falada é boa. E o desenho em si
**não é operável por teclado nem por leitor de tela**: as regiões do SVG só
respondem a toque/clique. Uma criança cega não pinta neste app hoje.

### Fotossensibilidade, cognitiva, auditiva

- Nada novo pisca ou se move. A cor escolhida cresce sem animação.
- Controles sempre no mesmo lugar: ferramentas → nome da cor → tons → cores →
  "Pronto!". O nome tem largura mínima para o botão "Tons" não pular.
- Voz é opcional e nunca a única via: o nome está sempre escrito.
  Desligada por padrão para não brigar com o leitor de tela.

### Alto contraste do sistema (`forced-colors`)

Os poços e a amostra têm `forced-color-adjust: none` — sem isso o Windows
apagaria justamente a cor. **Lido, não medido:** não liguei o modo de alto
contraste do Windows para conferir. O desenho (SVG) também não foi conferido
nesse modo.

### Só um iPhone de verdade confirma

1. O nome aparece ao tocar (era o defeito de origem).
2. O toque longo abre os tons **sem** abrir o menu/lupa de seleção do iOS
   (usei `-webkit-touch-callout: none` e `user-select: none`).
3. A voz fala ao tocar na cor. O iOS só libera voz dentro de um gesto; a fala
   sai 120 ms depois do toque (contorno de um defeito do Chrome), e não sei
   se o Safari aceita esse atraso.
4. O ✓ e as bordas no brilho baixo / Night Shift.

---

## O que ainda não tem seção aqui

Estante, leitura, quiz, quebra-cabeça, anotações, impressão, perfis e
ajustes não foram auditados nesta rodada. Pendências já conhecidas:

- **Entrelinha e espaço entre letras** fixos (fase F5 do plano) — é o item
  que o Bruno defende para ceratocone, e o app ainda não tem.
- Poços de cor da tela Aparência ("Monte o seu") têm o código hex como nome
  para leitor de tela ("Fundo #fff6ec").
- Nenhuma auditoria automática (axe-core) foi rodada ainda.
- Feedback do quiz (✓/✗) não foi conferido em simulação de daltonismo.
- Tamanho da letra é gravado em px (ignora a letra configurada no aparelho).
