// A figura que a professora traz (foto do ônibus da linha do aluno, do
// banheiro da escola, da mãe…). Fotos reais costumam funcionar MELHOR que
// desenho para quem está começando — e é aqui que mora a personalização.
//
// A foto é reduzida NO APARELHO a 320 px no lado maior e vira JPEG: dá ~20–40 KB,
// cabe dezenas no armazenamento e viaja dentro do arquivo da prancha. Nada sai
// do aparelho (princípio 3: zero rede).

export const LADO_DA_FIGURA = 320;

export async function reduzirFigura(arquivo: File, lado = LADO_DA_FIGURA): Promise<string> {
  if (!/^image\//.test(arquivo.type)) throw new Error('Escolha uma imagem (foto ou figura).');
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, falha) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => falha(new Error('Não deu para abrir esta imagem.'));
      i.src = url;
    });
    const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * escala));
    const h = Math.max(1, Math.round(img.naturalHeight * escala));
    const tela = document.createElement('canvas');
    tela.width = w;
    tela.height = h;
    const ctx = tela.getContext('2d')!;
    ctx.fillStyle = '#ffffff'; // figura com fundo transparente não fica preta no JPEG
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return tela.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
