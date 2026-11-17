import { describe, expect, it } from 'vitest';
import { separarSilabas, silabasComHifens } from './silabas';
import { TODAS_AS_PALAVRAS, fichaDePalavraPropria } from './lerOMundo';

const confere = (lista: string) => {
  for (const esperado of lista.split(' ')) {
    expect(silabasComHifens(esperado.replace(/-/g, ''))).toBe(esperado);
  }
};

describe('separador de sílabas', () => {
  it('concorda com as 43 palavras do catálogo, separadas à mão', () => {
    for (const p of TODAS_AS_PALAVRAS) {
      expect(separarSilabas(p.palavra).silabas, p.palavra).toEqual(p.silabas);
    }
  });

  it('as partes sempre formam a palavra, como foi escrita', () => {
    for (const w of ['Grêmio', 'ÔNIBUS', 'pneu', 'Yasmin', 'Wesley', 'x', 'brrr', 'Ωμέγα']) {
      expect(separarSilabas(w).silabas.join('')).toBe(w);
    }
    expect(separarSilabas('  casa ').silabas).toEqual(['ca', 'sa']);
    expect(separarSilabas('').silabas).toEqual([]);
  });

  it('consoantes: dígrafos ficam, letras dobradas se separam', () => {
    confere('ca-sa pra-to a-tle-ta pa-la-vra cho-ca-lho ni-nho car-ro pás-sa-ro');
    confere('nas-cer des-ça ex-ce-to fic-ção ap-to rit-mo dig-no ad-vo-ga-do');
    confere('cons-tru-ir pers-pec-ti-va subs-tân-cia pneu psi-co-lo-gi-a trans-por-te');
  });

  it('QU e GU não fazem sílaba sozinhos', () => {
    confere('quei-jo qui-e-to quan-do guer-ra gui-a á-gua ré-gua i-gual lin-gui-ça');
    confere('a-quá-rio U-ru-guai sa-guão fre-quen-te a-gu-do');
  });

  it('ditongos e hiatos', () => {
    confere('pai céu he-rói mui-to cai-xa pei-xe ou-ro Eu-ro-pa sau-da-de viu fui');
    confere('sa-í-da sa-ú-de pa-ís ba-ú ju-í-zo ra-i-nha mo-i-nho a-in-da ru-im');
    confere('sa-ir ra-iz ju-iz Ra-ul a-men-do-im co-in-ci-dir po-e-ta te-a-tro co-e-lho');
    confere('mei-a prai-a i-dei-a a-rei-a cai-u po-ei-ra Pi-au-í');
    confere('le-ão mãe põe a-ção te-le-vi-são re-u-ni-ão ir-mão');
    confere('di-a ri-o ru-a lu-a Ma-ri-a pi-a-da vi-a-gem bi-o-lo-gi-a');
  });

  it('encontro final átono fica junto depois da sílaba acentuada', () => {
    confere('fa-mí-lia ho-rá-rio sé-rie his-tó-ria ci-ên-cia co-lé-gio tê-nue má-goa á-rea');
    confere('se-cre-tá-ria se-cre-ta-ri-a pe-rí-o-do sa-bi-á ál-co-ol');
  });

  it('nomes de gente', () => {
    confere('The-o Da-vi Lu-i-za Lu-iz Bru-no Yas-min Wes-ley Gui-lher-me Jo-a-quim');
  });

  it('avisa quando um humano precisa olhar', () => {
    expect(separarSilabas('MOTORISTA').conferir).toEqual([]);
    expect(separarSilabas('CUIDADO').conferir).toEqual([]);
    expect(separarSilabas('ENVIAR').conferir).not.toEqual([]);
    expect(separarSilabas('FARMÁCIA').conferir).not.toEqual([]);
    expect(separarSilabas('Wesley').conferir).not.toEqual([]);
    expect(separarSilabas('sublinhar').conferir).not.toEqual([]);
    expect(separarSilabas('LINHA 10')).toEqual({
      silabas: ['LINHA 10'],
      conferir: ['não é uma palavra só de letras'],
    });
  });

  it('a sugestão serve de entrada para a ficha da professora', () => {
    const ficha = fichaDePalavraPropria({ palavra: 'restinga', silabas: separarSilabas('restinga').silabas });
    expect(ficha.silabas).toEqual(['RES', 'TIN', 'GA']);
  });
});
