// A cópia de segurança, do lado que toca no aparelho: junta o que está
// guardado, entrega o arquivo e, na volta, troca o que há pelo que veio.

import { armazenamento } from './armazenamento';
import { conferirCopia, montarCopia, nomeDoArquivo, type Conferencia, type Copia } from './copia';

export async function fazerCopia(): Promise<{ arquivo: File; quantos: number }> {
  const dados: Record<string, unknown> = {};
  for (const chave of await armazenamento.chaves('')) {
    dados[chave] = await armazenamento.obter(chave);
  }
  const agora = new Date();
  const texto = JSON.stringify(montarCopia(dados, agora));
  return {
    arquivo: new File([texto], nomeDoArquivo(agora), { type: 'application/json' }),
    quantos: Object.keys(dados).length,
  };
}

/** Entrega o arquivo: pelo compartilhar do aparelho, se der; senão, baixa. */
export async function entregarArquivo(arquivo: File): Promise<void> {
  const podeCompartilhar =
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [arquivo] });
  // No celular o "baixar" some numa pasta que ninguém acha; o compartilhar
  // deixa escolher (Arquivos, e-mail, AirDrop). No computador, baixar é o certo.
  if (podeCompartilhar && /Android|iPhone|iPad|iPod/.test(navigator.userAgent)) {
    try {
      await navigator.share({ files: [arquivo], title: 'Cópia do Historinhas' });
      return;
    } catch {
      /* desistiu ou não deu: cai no baixar */
    }
  }
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  link.href = url;
  link.download = arquivo.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function lerCopia(arquivo: File): Promise<Conferencia> {
  if (arquivo.size > 50 * 1024 * 1024) {
    return { ok: false, motivo: 'Este arquivo é grande demais para ser uma cópia do Historinhas.' };
  }
  return conferirCopia(await arquivo.text());
}

/**
 * Troca TUDO o que está no aparelho pelo que veio no arquivo. Tem de ser
 * troca e não mistura: os perfis são numerados por aparelho (1, 2, 3…), e
 * misturar poria as pinturas do "perfil 1" de lá no "perfil 1" daqui.
 */
export async function restaurarCopia(copia: Copia): Promise<void> {
  for (const chave of await armazenamento.chaves('')) await armazenamento.remover(chave);
  for (const [chave, valor] of Object.entries(copia.dados)) await armazenamento.definir(chave, valor);
}
