// Abstração de persistência. Interface async de propósito:
// a implementação web (localStorage) será trocada por
// @capacitor/preferences (chaves triviais) + @capacitor-community/sqlite
// (dados relacionais) no empacotamento nativo — ver ESPECIFICACAO.md 8.1
// e docs/CONTINUAR_AQUI.md. Nenhum chamador precisa mudar quando isso acontecer.

export interface Armazenamento {
  obter<T>(chave: string): Promise<T | null>;
  definir<T>(chave: string, valor: T): Promise<void>;
  remover(chave: string): Promise<void>;
  chaves(prefixo: string): Promise<string[]>; // p/ limpar dados de um perfil excluído
}

const PREFIXO = 'infantil:v1:';

class ArmazenamentoWeb implements Armazenamento {
  async obter<T>(chave: string): Promise<T | null> {
    const bruto = localStorage.getItem(PREFIXO + chave);
    if (bruto === null) return null;
    try {
      return JSON.parse(bruto) as T;
    } catch {
      return null;
    }
  }

  async definir<T>(chave: string, valor: T): Promise<void> {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  }

  async remover(chave: string): Promise<void> {
    localStorage.removeItem(PREFIXO + chave);
  }

  async chaves(prefixo: string): Promise<string[]> {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIXO + prefixo))
      .map((k) => k.slice(PREFIXO.length));
  }
}

export const armazenamento: Armazenamento = new ArmazenamentoWeb();

// Convenção de chaves (documentada para o schema SQLite futuro casar 1:1):
//   perfis                                  → Perfil[]
//   <perfilId>:progresso:<livroId>          → { posicaoAtual: string }
//   <perfilId>:quiz:<perguntaId>            → { tentativas: number; acertou: boolean }
//   <perfilId>:colorir:<ilustracaoId>       → EstadoColorir (regiões + traços)
//   <perfilId>:tema                         → string
//   <perfilId>:tamanhoFonte                 → number
