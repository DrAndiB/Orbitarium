import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 9 question bank (being written: three variants per concept, every trap option tagged).
export const BANK_U9: Item[] = [
  { id: 'i9a', unit: 9, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u9.fair-compare'], targets: ['hbond-donor-acceptor'],
    prompt: b('Propane and acetaldehyde both weigh 44 g/mol. Propane boils at −42 °C, acetaldehyde at 20 °C. Mainly because of…', 'Propan und Acetaldehyd wiegen beide 44 g/mol. Propan siedet bei −42 °C, Acetaldehyd bei 20 °C. Vor allem wegen…'),
    options: [
      { text: b('dipole–dipole attraction', 'Dipol-Dipol-Anziehung'), correct: true },
      { text: b('hydrogen bonds between acetaldehyde molecules', 'Wasserstoffbrücken zwischen Acetaldehyd-Molekülen'), mis: 'hbond-donor-acceptor' },
      { text: b('stronger dispersion', 'stärkerer Dispersion') },
    ],
    explain: b('Acetaldehyde has a polar C=O but no H on oxygen, so it cannot donate a [[h-bond]].', 'Acetaldehyd hat ein polares C=O, aber kein H am Sauerstoff, kann also keine [[h-bond]] spenden.') },
];
