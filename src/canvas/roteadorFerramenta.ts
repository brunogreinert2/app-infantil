// Estado da ferramenta ativa + roteamento de pointer-events entre camadas
// (ESPECIFICACAO.md 8.2). Balde → clique atravessa até a camada base;
// pincel/borracha → camada de pincel captura o traço.

import type { CamadaPincel } from './camadaPincel';

export type Ferramenta = 'balde' | 'pincel' | 'borracha';

export class RoteadorFerramenta {
  private _ferramenta: Ferramenta = 'balde';
  private _cor = '#e63946';
  private pincel: CamadaPincel;
  private cb: (() => void) | null = null;

  constructor(pincel: CamadaPincel) {
    this.pincel = pincel;
    this.pincel.ativa(false);
  }

  get ferramenta(): Ferramenta {
    return this._ferramenta;
  }

  get cor(): string {
    return this._cor;
  }

  definirFerramenta(f: Ferramenta): void {
    this._ferramenta = f;
    this.pincel.ativa(f === 'pincel' || f === 'borracha');
    this.cb?.();
  }

  definirCor(cor: string): void {
    this._cor = cor;
    this.cb?.();
  }

  estiloPincel(): { cor: string; borracha: boolean } {
    return { cor: this._cor, borracha: this._ferramenta === 'borracha' };
  }

  aoMudar(cb: () => void): void {
    this.cb = cb;
  }
}
