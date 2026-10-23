import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 10 question bank (being written: three variants per concept, every trap option tagged).
export const BANK_U10: Item[] = [
  { id: 'i10a', unit: 10, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u10.acceptor-only'], targets: ['hbond-donor-acceptor'],
    prompt: b('Dimethyl ether, CH₃–O–CH₃, meets water. In a [[h-bond]], dimethyl ether can be…', 'Dimethylether, CH₃–O–CH₃, trifft auf Wasser. In einer [[h-bond]] kann Dimethylether…'),
    options: [
      { text: b('an acceptor only', 'nur Akzeptor sein'), correct: true },
      { text: b('a donor only', 'nur Donor sein'), mis: 'hbond-donor-acceptor' },
      { text: b('both donor and acceptor', 'Donor und Akzeptor sein'), mis: 'hbond-donor-acceptor' },
      { text: b('neither', 'keines von beiden') },
    ],
    explain: b('Its oxygen has lone pairs to accept with, but no H attached to O to donate.', 'Sein Sauerstoff hat freie Paare zum Annehmen, aber kein H am O zum Spenden.') },
];
