import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 8 question bank (being written: three variants per concept, every trap option tagged).
export const BANK_U8: Item[] = [
  { id: 'i8a', unit: 8, kind: 'rank', format: 'rank', concepts: ['u8.dispersion'], mis: 'dispersion-direction', table: 'category',
    prompt: b('Rank the noble gases by boiling point, highest first.', 'Ordne die Edelgase nach Siedepunkt, den höchsten zuerst.'),
    order: [b('Xe', 'Xe'), b('Ar', 'Ar'), b('Ne', 'Ne'), b('He', 'He')],
    explain: b('More electrons, bigger and softer clouds, stronger [[dispersion]]: Xe 165 K, Ar 87 K, Ne 27 K, He 4 K.', 'Mehr Elektronen, größere, weichere Wolken, stärkere [[dispersion]]: Xe 165 K, Ar 87 K, Ne 27 K, He 4 K.') },
  { id: 'i8b', unit: 8, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u8.shape'], targets: ['dispersion-direction'],
    prompt: b('Pentane and neopentane are both C₅H₁₂. Which boils higher?', 'Pentan und Neopentan sind beide C₅H₁₂. Welches siedet höher?'),
    options: [
      { text: b('Pentane: the chain has more contact area', 'Pentan: die Kette hat mehr Kontaktfläche'), correct: true },
      { text: b('Neopentane: it is more compact', 'Neopentan: es ist kompakter'), mis: 'dispersion-direction' },
      { text: b('Neither: same electrons, same boiling point', 'Keines: gleiche Elektronen, gleicher Siedepunkt') },
    ],
    explain: b('Pentane 36 °C, neopentane 9.5 °C. Dispersion only acts where molecules touch.', 'Pentan 36 °C, Neopentan 9,5 °C. Dispersion wirkt nur, wo sich Moleküle berühren.') },
];
