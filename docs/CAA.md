# Prancha de CAA — o motor e as telas (2026-11-16)

Branch `fable/ler-o-mundo-e-caa`, em cima do piloto de papel do Fable
(`docs/LER_O_MUNDO.md`). **Não publicado.** Feito no desktop por Claude
(Opus 5.5, "Fable" para o Bruno) no mesmo dia do piloto.

## De onde veio

A professora de AEE entrevistada pelo Bruno disse que a escola **não tem
prancha de CAA**, recurso indicado no PAEE de um aluno. O pedido do Bruno:
"faça os motores; arte a gente ajusta depois". O argumento que ele leva para
o trabalho de Intervenção Pedagógica (Bendinelli): a prancha só serve se sair
da sala de recursos — por isso existe nas duas formas, tela e papel.

Não registrar nome nem dado de aluno em lugar nenhum do repositório.

## O que existe

| Arquivo | O que é |
|---|---|
| `src/caa/modelo.ts` | O motor, puro: tipos (conjunto → pranchas → casas), a frase, a validação do que vem de fora, o formato de arquivo |
| `src/caa/padrao.ts` | O conjunto **essencial**: Início 5 × 6 (núcleo) + 4 pranchas de assunto (Sinto, Lugares, Comida, Escola) |
| `src/caa/pictogramas.ts` | 60 desenhos geométricos nossos (caixa 100 × 100, traço `currentColor`) e o nome de cada um |
| `src/caa/cores.ts` | Cor por categoria (Fitzgerald adaptada), todas ≥ 7:1 com a tinta |
| `src/caa/guardar.ts` | Onde fica: chaves `caa:conjuntos` e `caa:ativo` (do aparelho, não do perfil) |
| `src/caa/figura.ts` | Foto/figura da professora reduzida no aparelho (320 px, JPEG ~20–40 KB) |
| `src/caa/impressaoCaa.ts` | O papel: HTML A4, uma folha por prancha, com as fotos; cores e "tracejado para recortar" opcionais |
| `src/caa/telaPrancha.ts` | A prancha na tela: tocar e ouvir, frase no alto, pastas, varredura |
| `src/caa/telaMontar.ts` | Montar pranchas (área dos adultos): lista, editor casa a casa, arquivo, impressão |
| `src/caa/modelo.test.ts` | 16 testes (frase, essencial íntegra, validação hostil, A4 cabe, contraste) |
| `scripts/exportar-prancha.mjs` | Gera o HTML da essencial para imprimir/virar PDF (pacote das professoras) |

Ligações em arquivos que já existiam: `main.ts` (`irPrancha`,
`irPranchasAdultos`, endereço `#prancha`), `telaPerfis.ts` (botão
"💬 Prancha de comunicação"), `telaConfiguracoes.ts` (entrada em "Para quem
ensina"), `estilos.css` (bloco "prancha de comunicação"),
`conteudo/pranchaCaa.ts` (o papel SVG do Fable agora usa os desenhos de
`src/caa/pictogramas.ts` — uma biblioteca só).

## Como se chega

- **Porta de entrada** ("Quem vai ler hoje?"): botão "💬 Prancha de
  comunicação", sem trava e fora dos perfis. É a voz de alguém, tem de estar a
  um toque; e quem usa pode ser adolescente.
- **`historinhas.app.br/#prancha`** abre direto na prancha (para salvar no
  tablet do aluno). Única exceção consciente ao princípio 5 (o app abre nos
  perfis): a prancha não é um cantinho de leitura.
- **Ajustes → Para quem ensina → 💬 Pranchas de comunicação** (atrás da
  trava), ou o ✏️ no canto da prancha (também passa pela trava).

## Regras de CAA que o motor guarda (não "otimizar")

1. **A casa não muda de lugar sozinha.** Colunas fixas; tela pequena encolhe a
   casa em vez de reorganizar a grade. Nada de ordenar por uso, sortear ou
   "sugerir". Quem usa prancha aprende a posição (planejamento motor).
2. **Casa vazia guarda o lugar.** Revelar vocabulário aos poucos sem mexer no
   que já foi aprendido. O editor tem "Esvaziar (guarda o lugar)" e avisa que
   mover atrapalha.
3. **Frase telegráfica e honesta.** Junta o que foi tocado, na ordem; não
   corrige concordância nem inventa palavra. Única ajuda: `naFrase`, escrita
   pela professora (DOR sozinha → "estou com dor"; EU + ESTOU + DOR → "eu
   estou com dor").
4. **Cor nunca é a única pista.** A palavra está sempre escrita; a pasta se
   reconhece pela aba grossa no alto (na tela) e pela faixa preta com o
   destino (no papel).

## Ajustes por conjunto (o editor mostra todos)

Voz a cada toque · frase no alto · cores · voltar ao Início depois de escolher
num assunto · ignorar toque repetido (0 / 0,5 / 1 / 2 s, para quem bate duas
vezes sem querer) · **varredura** (desligada / 1,5 / 2,5 / 4 s por casa): um
destaque passeia pelas casas e um único gesto — tocar em qualquer lugar, barra
de espaço, Enter, ou acionador que imite tecla — escolhe a destacada. Depois de
escolher, recomeça do início.

## Personalização e viagem entre aparelhos

- Conjuntos ilimitados por aparelho (um por aluno), criados da essencial ou em
  branco; duplicar; excluir com confirmação.
- Casa: palavra, o que a voz diz, como entra na frase, categoria (cor), figura
  (desenho nosso, foto do aparelho, ou nenhuma), se abre outra prancha.
- **Arquivo**: "💾 Guardar arquivo" gera `prancha-<nome>.json` (fotos dentro);
  "📂 Trazer de um arquivo" do outro lado. O arquivo passa por
  `validarConjunto`: o que não se reconhece é descartado, imagem só se for
  `data:` PNG/JPEG/WebP ≤ 400 KB, texto é sempre `textContent`. A cópia de
  segurança dos Ajustes já leva as pranchas (copia todas as chaves).

## Conferido (16/11/2026)

- `npm test`: 168 testes; os 16 novos passam. O teste de cronômetro do parser
  ("50 mil linhas em menos de 4 s") falhou uma vez com a máquina ocupada e
  passou sozinho, com e sem estas mudanças.
- `npm run build` limpo.
- No navegador (Chromium do app, desktop e 375 px): prancha abre por `#prancha`,
  EU + QUERO + (Comida) SUCO → a voz recebeu "eu quero suco" e a prancha voltou
  ao Início; varredura escolhe com espaço e com toque em qualquer lugar; editor
  cria conjunto da essencial, acrescenta casa e grava foto reduzida (5 KB).
- Papel: PDF real pelo Chromium sem janela (`scripts/exportar-prancha.mjs` +
  `--print-to-pdf`): 5 páginas A4 nas duas versões, nada vaza da casa.

**NÃO conferido:** voz de verdade em tablet Android/iPad; impressão pelo iPhone
(o fator 0,86 do `motorImpressao` é aplicado, mas não testado com prancha);
leitor de tela (VoiceOver/TalkBack) na prancha; uso por um aluno.

## Corrigido no caminho (vale lembrar)

- A mão de OI/TCHAU saiu primeiro com um dedo comprido no meio — lido como
  gesto obsceno. Redesenhada: mão aberta, quatro dedos parelhos. **Qualquer mão
  nova segue a mesma regra.**
- Rótulo longo quebrava dentro da palavra ("DESCANS/AR"): a letra agora se mede
  pela palavra mais longa e só quebra entre palavras.

## Decisões em aberto (do Bruno)

1. **Arte.** Os 60 desenhos são provisórios; o motor só conhece a chave, então
   trocar a arte não estraga prancha guardada. Fracos: QUERO, ESTOU, POR FAVOR,
   SINTO. ARASAAC continua a questão de licença (ver `LER_O_MUNDO.md`, dec. 4).
2. **Vocabulário da essencial.** Escrito por IA; pede revisão da professora (e,
   idealmente, de fonoaudióloga). Ids publicados não se renomeiam depois.
3. **Voz.** Hoje é a do aparelho (Web Speech). Gravar a própria voz da família
   por casa seria o próximo passo de personalização (áudio no armazenamento —
   pesa; decidir antes).
4. **Gênero na fala** (CANSADO/CANSADA, OBRIGADO/OBRIGADA): hoje a professora
   troca na casa. Uma opção "falar no feminino" por conjunto é simples de fazer.

## Próximos passos sugeridos

1. Revisar no tablet de verdade (voz, tamanho das casas, varredura) e com a
   professora.
2. Varredura por linha e coluna (mais rápida que a linear em 30 casas) e
   varredura com voz (fala baixinho a casa destacada, para baixa visão).
3. Prancha temática pronta do **ônibus** (pegar, descer, linha, ponto, cartão,
   motorista…) como segundo modelo, ao lado da essencial — o hiperfoco do aluno
   vira porta de entrada, sem ser só dele.
4. PDF da essencial no pacote das professoras (`scripts/exportar-prancha.mjs`).
5. Ao publicar: subir a versão (conjunto novo de recursos → 0.10.0).
