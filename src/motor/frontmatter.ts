// Separa o front matter YAML do corpo do arquivo e monta o Livro.
// O YAML é parseado pelo js-yaml (empacotado no bundle — zero rede em runtime).

import { load } from 'js-yaml';
import { analisar } from './parser';
import type { Livro, MetadadosLivro } from './tipos';

const RE_FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function carregarLivro(id: string, conteudo: string): Livro {
  const m = conteudo.match(RE_FRONT_MATTER);
  let metadados: MetadadosLivro = { titulo: id };
  let corpo = conteudo;

  if (m) {
    metadados = { titulo: id, ...(load(m[1]) as Partial<MetadadosLivro>) };
    corpo = conteudo.slice(m[0].length);
  }

  return { id, metadados, nos: analisar(corpo) };
}
