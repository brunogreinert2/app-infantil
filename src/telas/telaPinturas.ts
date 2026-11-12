// Minhas pinturas: tudo o que este perfil já pintou, num lugar só — para
// rever, mostrar para alguém, continuar ou imprimir. Antes, uma pintura só
// reaparecia para quem lembrasse em que livro (e em que página) ela estava.
//
// Não guarda nada novo: lê as mesmas chaves `<perfil>:colorir:<livro>:<asset>`
// que a tela de pintar grava.

import { armazenamento } from '../armazenamento/armazenamento';
import { arquivosAssets, livros } from '../conteudo/catalogo';
import { desenhoPintadoParaTela, type Pintura } from '../impressao/motorImpressao';
import type { Livro } from '../motor/tipos';
import { perfilAtivo } from '../perfis/perfis';
import { barraTopo, el } from './comum';

export interface PinturaGuardada {
  livro: Livro;
  assetId: string;
  /** "desenho 2 de 3" dentro do livro, para dar nome ao cartão */
  ordem: number;
  total: number;
  svgFonte: string;
  pintura: Pintura;
}

/** As pinturas do perfil ativo, na ordem da estante e, dentro do livro, na do texto. */
export async function listarPinturas(): Promise<PinturaGuardada[]> {
  const prefixo = `${perfilAtivo().id}:colorir:`;
  const chaves = new Set(await armazenamento.chaves(prefixo));
  const achadas: PinturaGuardada[] = [];
  for (const livro of livros) {
    const desenhos = (livro.metadados.assets ?? []).filter((a) => a.arquivo_interativo);
    for (const [i, asset] of desenhos.entries()) {
      const chave = `${prefixo}${livro.id}:${asset.id}`;
      if (!chaves.has(chave)) continue;
      const pintura = await armazenamento.obter<Pintura>(chave);
      const svgFonte = arquivosAssets[asset.arquivo_interativo!];
      // folha aberta e deixada em branco não é pintura
      const temAlgo = pintura && (Object.keys(pintura.regioes ?? {}).length > 0 || (pintura.tracos ?? []).length > 0);
      if (!temAlgo || !svgFonte) continue;
      achadas.push({
        livro,
        assetId: asset.id,
        ordem: i + 1,
        total: desenhos.length,
        svgFonte,
        pintura: { regioes: pintura.regioes ?? {}, tracos: pintura.tracos ?? [] },
      });
    }
  }
  return achadas;
}

export async function montarTelaPinturas(
  raiz: HTMLElement,
  nav: {
    perfis: () => void;
    aparencia: () => void;
    estante: () => void;
    pintar: (livro: Livro, assetId: string) => void;
  },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-pinturas';
  raiz.appendChild(
    barraTopo({
      titulo: '🖼️ Minhas pinturas',
      aoVoltar: nav.estante,
      aoTrocarPerfil: nav.perfis,
      aoAparencia: nav.aparencia,
    }),
  );

  const pinturas = await listarPinturas();
  if (pinturas.length === 0) {
    const vazio = el('div', 'pinturas-vazio');
    vazio.appendChild(el('p', 'capa-emoji', '🎨'));
    vazio.appendChild(
      el('p', 'texto-vazio', 'Aqui vão morar os seus desenhos pintados. Abra uma história, toque em “Pintar” e volte para ver!'),
    );
    const ir = el('button', 'botao-grande', '📚 Escolher uma história');
    ir.addEventListener('click', nav.estante);
    vazio.appendChild(ir);
    raiz.appendChild(vazio);
    return;
  }

  raiz.appendChild(
    el('p', 'conta-pinturas', pinturas.length === 1 ? 'Você já pintou 1 desenho.' : `Você já pintou ${pinturas.length} desenhos.`),
  );
  const grade = el('div', 'grade-pinturas');
  for (const p of pinturas) {
    const nome =
      p.total > 1 ? `${p.livro.metadados.titulo} · desenho ${p.ordem} de ${p.total}` : p.livro.metadados.titulo;
    const cartao = el('button', 'cartao-pintura');
    cartao.setAttribute('aria-label', `Continuar a pintura: ${nome}`);
    const quadro = el('span', 'quadro-pintura');
    quadro.setAttribute('aria-hidden', 'true'); // o desenho é enfeite aqui; o nome diz o que é
    quadro.innerHTML = desenhoPintadoParaTela(p.svgFonte, p.pintura);
    cartao.append(quadro, el('span', 'nome-pintura', nome));
    cartao.addEventListener('click', () => nav.pintar(p.livro, p.assetId));
    grade.appendChild(cartao);
  }
  raiz.appendChild(grade);
}
