# Ler o Mundo e Prancha de CAA — piloto (2026-11-16)

Branch `fable/ler-o-mundo-e-caa`. Desde 2026-11-20 as folhas saem pela **oficina** (Para quem ensina → Fazer uma folha → Atividades → Ler o Mundo), inclusive a ficha da palavra da professora. Na estante da criança, ainda não.
Feito pelo Fable numa sessão do celular do Bruno; este arquivo é a passagem
de bastão para o Claude Code no desktop.

## De onde veio

Em 16/11/2026 o Bruno entrevistou uma professora de AEE para a disciplina de
Intervenção Pedagógica. Ela gostou dos Alfabetos e deu duas encomendas:

1. **Alfabetização que não seja infantil.** Adolescentes do ensino médio (e
   adultos) ainda não alfabetizados têm vergonha de pintar e de "coisa de
   criancinha". O caso que motivou: um aluno do 1º ano do ensino médio,
   autista e com deficiência intelectual, com hiperfoco em ônibus. O material
   **não é feito só para ele**: há um formato padrão pronto e a professora
   personaliza.
2. **Prancha de CAA** (Comunicação Aumentativa e Alternativa), que a escola
   não tem. No papel e, depois, no app (tocar na casa e ouvir a palavra).

Não registrar nome nem dado de aluno em lugar nenhum do repositório.

## O que já existe nesta branch

| Arquivo | O que é |
|---|---|
| `src/conteudo/lerOMundo.ts` | Catálogo (43 palavras em 7 grupos, sílabas e "parecidas" escritas à mão), `fichaDePalavraPropria()` para a palavra da professora, `gerarCadernoLerOMundo()` |
| `src/conteudo/lerOMundoArte.ts` | As folhas: `svgPalavraA4`, `svgCatalogoA4`, `svgFormularioA4`, `svgDinheiroA4`, `svgHoraA4`; a identidade `IDENTIDADE_LER_O_MUNDO` |
| `src/conteudo/pranchaCaa.ts` | `PRANCHA_ESSENCIAL` (20 casas, com o campo `fala`), `PRANCHA_EM_BRANCO`, 19 pictogramas próprios, `svgPranchaA4` |
| `src/conteudo/lerOMundo.test.ts` | 9 testes (sílabas formam a palavra, IDs únicos, sem marca infantil, sem "pinte", folhas infantis intactas) |
| `scripts/exportar-fichas.mjs` | Agora exporta também `ler-o-mundo` (54 folhas) e `comunicacao` (2 folhas) |

Mudanças em arquivos que já existiam, todas compatíveis:

- `alfabetoArte.ts`: `base()` ganhou um 5º parâmetro opcional, `identidade`
  (marca, descrição, rodapé). Sem ele, sai Historinhas como sempre.
- `numeroArte.ts`: exporta `textoComAlgarismos` (a legenda com zero sem corte).
- `scripts/gera-glifos.mjs` + `glifos.json`: entraram `ÁÉÍÓÚÂÊÔÃÕÀ` na Cardo
  Bold, para SAÍDA, ÔNIBUS, ATENÇÃO.

Conferido: as 125 folhas infantis (alfabeto, grego, números) saem **idênticas
byte a byte** às da `master` (exportei antes e depois e comparei com `diff -r`).

## Folha "Banheiro: masculino e feminino" (2026-11-17)

`svgBanheiroA4()` em `lerOMundoArte.ts`, id `banheiro-sinais`. Motivo: o texto
"O meu irmão" (LEWIS, P. *A case for teaching functional skills*, TASH
Newsletter 23(3), 1997; trad. em APAE Bauru, *Currículo Funcional Natural*,
2011), que o Bruno trouxe: o rapaz diz o nome das letras num cartão, mas não
distingue a placa de banheiro de homem e de mulher no McDonald's. É o
argumento do currículo funcional, e serve de justificativa para todo o
Ler o Mundo.

A folha ensina a **pista** (calça com duas pernas × vestido em triângulo), as
variações reais (HOMENS/MULHERES, SENHORES/SENHORAS, H/F, ♂/♀), o alerta da
letra **M** (Masculino ou Mulheres) e que a cor muda de lugar para lugar. O
exercício final pede para marcar a figura certa sob cada placa. `figura()` é
reaproveitável (cabeça e corpo como regiões, traço fino abaixo de 90 px).
Falta: banheiro acessível e família/unissex, e o passo seguinte do currículo
funcional, que é treinar no lugar de verdade (foto da porta da escola).

## A ficha de palavra, em cinco passos

1. A palavra inteira, **como aparece no mundo**: octógono (PARE), triângulo
   de alerta, círculo cortado, placa com seta, plaquinha de porta, letreiro
   de ônibus, placa em poste, etiqueta de preço, botão no celular, campo de
   formulário. Tipo `Contexto` em `lerOMundo.ts`.
2. A palavra em partes: sílabas em caixas (cada letra é uma região). Sem
   sílabas informadas, letra por letra — **o app não adivinha separação
   silábica**, de propósito.
3. Encontrar a palavra entre quatro parecidas (posições fixas, sem sorteio).
4. Escrever, com modelo em traço cheio.
5. "Onde você vê essa palavra?"

Verbos: destaque, circule, aponte, fale, escreva. Nunca "pinte".

## Decisões em aberto (são do Bruno)

1. **Nome.** "LER O MUNDO" é provisório (aceno a Paulo Freire: a leitura do
   mundo precede a leitura da palavra). Trocar em `IDENTIDADE_LER_O_MUNDO`.
2. **Endereço no rodapé.** Deixei vazio: "historinhas.app.br" na folha de um
   adolescente desfaz o cuidado. Opções: sem endereço, subdomínio, outro
   domínio.
3. **Onde mora no app.** Não registrei em `catalogo.ts`: pôr isto na estante
   das crianças seria o mesmo erro. Proposta: uma área "Para a sala de aula"
   (ou perfil de professora) com Ler o Mundo e Pranchas, fora da estante.
4. **Pictogramas da prancha.** Os meus são geométricos e provisórios (QUERO
   é o mais fraco; BEM/MAL são carinhas, talvez infantis para um adolescente
   — polegar para cima/baixo é alternativa). O padrão nas escolas é o
   **ARASAAC**: licença CC BY-NC-SA, autor Sergio Palao, propriedade do
   Governo de Aragão. Dá para usar com atribuição, mas é **não comercial** e
   **compartilha-igual**: pesa se um dia houver versão paga, e o princípio 6
   do CLAUDE.md pede conteúdo próprio ou domínio público. Decidir antes de
   crescer a prancha.
5. **Cor por categoria na prancha.** Pranchas costumam usar cores por classe
   de palavra (chave de Fitzgerald). A folha é P&B; no app, se houver cor,
   escolher par seguro para protanopia e nunca depender só da cor (o campo
   `categoria` já existe em `CasaCaa`).
6. **Letra das placas.** Passos 1, 3 e 4 usam Atkinson cheia (cara de placa);
   o passo 2 usa Cardo vazada (identidade das letras de destacar). Ver a
   mesma palavra em duas letras ajuda a generalizar, mas é escolha a validar.

## O que falta (coisa de motor e de tela — Claude Code)

> **Atualização 16/11 (noite):** os itens 1 (tela da prancha) e 3 (prancha
> personalizada, com foto) estão feitos em `src/caa/` — ver `docs/CAA.md`.
> A decisão 3 ("onde mora no app") foi resolvida só para a prancha: botão
> próprio na porta de entrada, fora da estante. Ler o Mundo continua sem casa.

Em ordem sugerida:

1. **Tela da prancha no app.** Grade tocável; tocar fala `casa.fala` com
   `falar()` de `src/tts.ts` (já lida com os bugs do Chrome). Uma faixa no
   alto que junta as casas tocadas ("EU QUERO MAIS") e um botão para falar a
   frase inteira e outro para limpar. Alvos de toque grandes; sem animação.
2. **Formulário da professora** para `fichaDePalavraPropria`: palavra,
   sílabas (opcional, com hífens), contexto (lista), parecidas (opcional).
   O campo das sílabas já pode nascer preenchido por `silabasComHifens()` de
   `src/conteudo/silabas.ts`, com os avisos de `conferir` ao lado: é sugestão
   que ela confirma ou corrige, nunca separação automática na ficha.
   Guardar por perfil em `armazenamento.ts`. Gerar e imprimir pelo
   `motorImpressao.ts` (já aceita SVG A4).
3. **Prancha personalizada**: escolher casas do catálogo de palavras + casas
   próprias (palavra + figura enviada pela professora, guardada no aparelho).
   `svgPranchaA4` já aceita qualquer `Prancha`; casa sem pictograma mostra só
   a palavra — falta aceitar imagem.
4. **Registrar os cadernos** no pipeline normal (como `numeros.ts` faz com
   `carregarLivro`) quando a decisão 3 estiver tomada. Os IDs de ficha e de
   região desta branch ainda **não são publicados**: podem mudar até lá.
5. **PDF dos cadernos** no pacote das professoras (o mesmo caminho de
   `docs/ALFABETOS_A4.md`).
6. Subir a versão em `package.json` ao publicar (regra do CLAUDE.md).

## Ressalvas pedagógicas (não prometer o que não se sabe)

- Ninguém usou isto com aluno ainda. O desenho é hipótese até a professora e
  um estudante experimentarem. Tratar a professora como coautora.
- Vale a regra de `MEMORIA_PEDAGOGICA.md`: recurso pedagógico que a
  professora seleciona e adapta; nenhuma promessa clínica.
- O catálogo e as sílabas foram escritos por IA e conferidos só por teste
  automático (partes formam a palavra). **Pedem revisão humana** — entra na
  pasta de revisão da Luiza.
- Prancha de CAA de verdade é montada para a pessoa, de preferência com
  fonoaudióloga. A "essencial" é ponto de partida, não prescrição.
- As frases do passo 5 ("Na esquina. No portão da garagem.") são exemplos
  gerais; a tabela de horários e a "LINHA 10" são inventadas.

## Gerar e ver

```bash
npm test -- --maxWorkers=1
npm run exportar:fichas -- --destino <pasta>   # svg/ler-o-mundo e svg/comunicacao
```
