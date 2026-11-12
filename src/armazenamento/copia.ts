// Cópia de segurança: tudo o que o app guarda (perfis, pinturas, insígnias,
// leitura, anotações, aparência) num arquivo só, para levar a outro aparelho
// ou sobreviver a uma limpeza do navegador. Mesma ideia do exportar/importar
// do Pedra Angular.
//
// Esta parte é só conta — monta e confere o arquivo, sem tocar na tela nem no
// armazenamento. Quem lê e grava é copiaNoAparelho.ts.

export const MARCA_DA_COPIA = 'historinhas';
export const VERSAO_DA_COPIA = 1;

export interface Copia {
  app: typeof MARCA_DA_COPIA;
  versao: number;
  /** data e hora em que foi feita (ISO) */
  feitaEm: string;
  /** chave do armazenamento → valor, do jeito que o app guarda */
  dados: Record<string, unknown>;
}

export function montarCopia(dados: Record<string, unknown>, agora: Date): Copia {
  return { app: MARCA_DA_COPIA, versao: VERSAO_DA_COPIA, feitaEm: agora.toISOString(), dados };
}

export type Conferencia =
  | { ok: true; copia: Copia; perfis: string[] }
  | { ok: false; motivo: string };

// uma chave do app: letras, números e os separadores que ele usa
const CHAVE_VALIDA = /^[\w:.\-]{1,200}$/;

/**
 * Confere um arquivo antes de pôr qualquer coisa no aparelho. Recusa o que
 * não é cópia do Historinhas, o que é de versão que este app não conhece e
 * chaves estranhas. Devolve os nomes dos perfis, para mostrar a quem importa.
 */
export function conferirCopia(texto: string): Conferencia {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    return { ok: false, motivo: 'Este arquivo não é uma cópia do Historinhas.' };
  }
  if (typeof bruto !== 'object' || bruto === null) {
    return { ok: false, motivo: 'Este arquivo não é uma cópia do Historinhas.' };
  }
  const c = bruto as Partial<Copia>;
  if (c.app !== MARCA_DA_COPIA || typeof c.dados !== 'object' || c.dados === null || Array.isArray(c.dados)) {
    return { ok: false, motivo: 'Este arquivo não é uma cópia do Historinhas.' };
  }
  if (typeof c.versao !== 'number' || c.versao > VERSAO_DA_COPIA) {
    return {
      ok: false,
      motivo: 'Esta cópia foi feita por uma versão mais nova do Historinhas. Atualize o app e tente de novo.',
    };
  }
  const dados: Record<string, unknown> = {};
  for (const [chave, valor] of Object.entries(c.dados)) {
    if (!CHAVE_VALIDA.test(chave)) {
      return { ok: false, motivo: 'Esta cópia está estragada: tem um nome que o app não reconhece.' };
    }
    dados[chave] = valor;
  }
  const lista = Array.isArray(dados.perfis) ? dados.perfis : [];
  const perfis = lista
    .map((p) => (typeof p === 'object' && p !== null ? (p as { nome?: unknown }).nome : undefined))
    .filter((n): n is string => typeof n === 'string');
  return {
    ok: true,
    copia: { app: MARCA_DA_COPIA, versao: c.versao, feitaEm: typeof c.feitaEm === 'string' ? c.feitaEm : '', dados },
    perfis,
  };
}

export function nomeDoArquivo(agora: Date): string {
  const dois = (n: number) => String(n).padStart(2, '0');
  return `historinhas-${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}.json`;
}
