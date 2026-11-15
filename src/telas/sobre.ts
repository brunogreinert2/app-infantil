// O texto do "Sobre" (Ajustes). Fora da tela, para se testar sem navegador.
/** O "Sobre": versão do package.json e data da montagem, nunca escritas à mão. */
export function textoSobre(versao = __VERSAO__, montadoEm = __MONTADO_EM__): string {
  const [a, m, d] = montadoEm.split('-');
  const data = a && m && d ? `${d}/${m}/${a}` : montadoEm;
  return (
    `Historinhas — historinhas.app.br — versão ${versao}, de ${data}. ` +
    'Histórias para ler e ouvir, desenhos para pintar, alfabetos e números, feitos para ' +
    'crianças de 5 a 9 anos e para quem ensina. As histórias são adaptações próprias de ' +
    'contos e fábulas em domínio público.'
  );
}

