# Gerar as cenas de Entre Bosques e Castelos

Python 3, sem bibliotecas adicionais:

```powershell
python scripts/bosques-castelos/artes.py CAMINHO_TEMPORARIO
```

O resultado inicial precisa das máscaras de oclusão. Para cada SVG, monte-o no
DOM de um navegador e execute `adicionarMascaras`, exportada por
`../primeiras-aventuras/mascaras.mjs`. Salve o SVG retornado. Só então copie os
24 arquivos finais para `src/conteudo/assets/` e confira as versões de tela e
de impressão (fills removidos). Não execute sobre arquivos já mascarados.

`formas.py` contém a base de formas compartilhadas conceitualmente com a
primeira coleção; `artes.py` acrescenta personagens, cenários e 24 composições.
Os scripts não alteram livros, catálogo nem arquivos da primeira coleção.

As novas histórias são mantidas diretamente nos Markdown em
`src/conteudo/livros/`. Fontes históricas e decisões editoriais estão em
`docs/COLECAO_BOSQUES_CASTELOS.md`.

Depois de publicadas, preserve os IDs das regiões e a ordem das formas:
pinturas infantis são armazenadas por esses identificadores.
