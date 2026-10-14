# Alfabetos e material para impressão A4

Entrega local de 14/10/2026, solicitada por Bruno para o Historinhas
(https://historinhas.app.br). Contexto da apresentação e preferências:
[MEMORIA_PEDAGOGICA.md](MEMORIA_PEDAGOGICA.md).

## Conteúdo

- Português: 46 folhas. Alfabeto completo em uma folha; vogais e dígrafos;
  26 fichas de letras; consulta de ditongos; sete dígrafos; oito exemplos
  de ditongos; C com cedilha; hiato.
- Grego antigo: 39 folhas. Alfabeto completo em uma folha; vogais e
  ditongos; 24 fichas de letras; oito grafias de ditongos; sigma final;
  três fichas de iota subscrito; espíritos suave e áspero.
- Cinco cenas de histórias aprovadas por Bruno foram incorporadas aos
  respectivos assets do app. Os arquivos e IDs publicados continuam iguais.
- Pacote para professoras em `C:\CHATGPT\App-Infantil\alfabetos-a4`:
  85 SVGs, dois cadernos PDF, cinco cenas em um PDF A4 paisagem,
  guia de quatro páginas, versões HTML estáticas e índice.

Cada folha de alfabeto usa viewBox 800 x 1131, margens internas, contorno
preto e regiões inicialmente brancas. As legendas são caminhos vetoriais:
os SVGs não dependem de fontes instaladas nem de rede. Cada legenda tem
aria-label; os trechos gregos usam lang="grc". O texto de cada letra e
complemento também permanece no livro para a leitura em voz alta.

No celular, a espessura acompanha a redução da folha. Máscaras nos desenhos
mantêm ocultas as linhas encobertas quando a camada de contorno perde o fill.
As regiões existentes das letras e tabelas mantêm seus IDs. Pincel antigo
usa coordenadas relativas: traços feitos no layout anterior podem aparecer
em posições diferentes no novo; nenhum estado é apagado automaticamente.

## Convenção de leitura do grego

Grego antigo, convenção didática de base ática clássica. θ/φ/χ são
aspiradas (t/p/k seguidos de ar), η/ω são longas, υ é uma vogal arredondada.
ζ foi explicitado como ZD, reconhecendo que há tradições que usam DZ.
ει/ου, tradicionalmente agrupados entre ditongos, são lidos aqui como
vogais longas. Não misturar silenciosamente com a pronúncia moderna.
A leitura automática do aparelho não garante essa convenção: para sons,
o modelo consciente da professora é a referência.

As fichas de português distinguem dígrafo, ditongo e hiato. QU/GU têm
exemplos em que U não é pronunciado; Ç não é contado como letra adicional.
Os oito ditongos selecionados são exemplos iniciais, não lista exaustiva.

Fontes de conferência (consultadas em 13/10/2026):

- UMKC, alfabeto e ditongos: https://daedalus.umkc.edu/FirstGreekBook/JWW_FGB1.html
- UT Austin, fonologia: https://lrc.la.utexas.edu/eieol/grkol/10
- Major e Laughy, consoantes: https://pressbooks.pub/ancientgreek/chapter/2/
- Major e Laughy, vogais: https://pressbooks.pub/ancientgreek/chapter/1/
- CEALE/UFMG, convenções da escrita: https://ceale.fae.ufmg.br/glossarioceale/verbetes/convencoes-da-escrita
- DGE, dimensão ortográfica: https://www.dge.mec.pt/sites/default/files/Basico/Documentos/ensino_escrita_net.pdf

## Gerar e imprimir

```powershell
npm run gera:glifos
npm run exportar:fichas -- --destino C:\CHATGPT\App-Infantil\alfabetos-a4
npm test -- --maxWorkers=1
npm run build
```

`alfabetoArte.ts` desenha as folhas; `alfabetoComplementos.ts` guarda o
conteúdo adicional; `alfabetos.ts` registra livros e arquivos pelo pipeline
normal. `glifos-legendas.json` é gerado, ignorado pelo Git e reconstruído
nos hooks prebuild/pretest. `glifos.json` continua versionado como antes.
DejaVu é usado para contornos; a licença acompanha o pacote exportado.

No livro, os botões imprimem o alfabeto em uma folha, a tabela de consulta
ou o caderno inteiro. Na tela de pintura, imprimir gera apenas aquela ficha
sem as cores salvas. A4 retrato, margem externa de 10 mm, uma folha por
página. Histórias usam A4 paisagem. Desativar cabeçalhos/rodapés do navegador
e usar 100% ou tamanho real.

## Leitura infantil e validação final

A leitura do app usa `alfabetoBrincadeiras.ts`: 24 dicas gregas e 26
brincadeiras com as letras portuguesas, escritas para a criança de 7 a 9
anos em casa. A convenção antiga continua igual; as orientações à professora
ficam nas fichas e no guia. Os SVGs/PDFs de sala de aula não foram alterados
por essa revisão de texto. Branch: `codex/alfabetos-a4-ludicos`.

- `npm test`: 30 de 30 testes passaram na revisão final. Incluem cobertura
  das dicas infantis, separação das orientações de adultos, conteúdo antigo
  e fechamento explícito de todos os contornos dos glifos.
- TypeScript, integridade do motor vendorizado e verificação de surrogatas
  do bundle passaram. Nenhum arquivo do motor vendorizado foi alterado.
- `npm run build` passou no próprio repositório com a configuração normal.
  Houve bloqueios de caminhos do sandbox em uma etapa anterior; após renovar
  as permissões, não foi necessário o ajuste temporário preserveSymlinks.
  A configuração de produção do repositório não mudou.
- Há o aviso de tamanho de chunk do Vite: o JavaScript ficou em cerca de
  1,3 MB antes de gzip (cerca de 337 KB comprimido). Precache abaixo de 6 MB.
- O teste preexistente de stress do parser oscilou durante a etapa anterior
  (chegou a 4,81 segundos, acima dos 4 segundos). Ele passou na execução final
  de `npm test`, sem afrouxar limites ou desativar testes.
- Navegador: celular 390 x 844 sem overflow lateral, desktop 1280 x 900,
  pintar, desfazer, persistência, impressão individual/caderno e reabertura
  offline. Zero erros de JavaScript e zero requisições externas no fluxo.
- Folhas renderizadas e PDFs verificados em A4. Preto sobre branco: 21:1.
  Os temas existentes não foram redesenhados; o repo não contém um script
  geral de auditoria de contraste para todos os temas.
- O app ainda é uma SPA e não oferece o rolo sem JavaScript exigido pela
  norma N58 do ecossistema. É uma pendência preexistente. Os cadernos HTML
  entregues são estáticos e abrem sem JavaScript, mas não substituem a
  implementação desse recurso no site.
- Não houve publicação nem push. A apresentação na UFRGS permanece com
  data a definir entre 01/12/2026 e 08/12/2026.
