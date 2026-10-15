# Fontes para gerar contornos

Os TTF Cardo são os WOFF2 de src/fontes descompactados, sem alteração dos glifos.
São usados somente na compilação (opentype.js não lê WOFF2); não entram no bundle.
Cardo Bold fornece as letras de pintar. Cardo Regular fornece grego em legendas.
Atkinson vem dos WOFF latin/latin-ext do pacote @fontsource já instalado.
O gerador falha se um caractere necessário não existir nessas fontes.
Licença Cardo: Cardo-OFL.txt. Licença Atkinson: pacote @fontsource correspondente.
