// Unit 7 — Who carries the charge, on the conduction view (Lattice Builder family). Closes module 2: metallic,
// ionic and covalent bonding and the properties they predict.
// Data: conductivities from CONDUCTIVITY in substances.ts. Copper 5.96 × 10⁷ S/m, deionised water 5.5 × 10⁻⁶ S/m,
// drinking water 0.0005–0.05 S/m, seawater 4.5–5.5 S/m: Engineering ToolBox, "Electrical conductivity of
// common conductors" (engineeringtoolbox.com/conductors-d_1381.html). Salt water 1 mol/L (58 g NaCl per litre):
// about 8.6 S/m, from the molar conductivity of NaCl at that concentration (about 86 S·cm²/mol). Molten NaCl:
// "several hundred S/m" in the text (the engine shows the data file's value). Pure water: [H₃O⁺] = 10⁻⁷ mol/L
// against 55.5 mol/L of water molecules, one H₃O⁺ per 555 million molecules. Melting points (elements.ts):
// Na 97.8 °C, Mg 649.9 °C, Al 660.3 °C, Cu 1084.6 °C, Hg −38.8 °C; NaCl 801 °C (ions.ts); HCl boils at −85.1 °C
// (substances.ts). Molten NaCl density 1.556 g/cm³ at 801 °C (Janz, Molten Salts Handbook: ρ = 2.139 − 0.000543·T/K).
// Downs process for sodium: molten NaCl with CaCl₂ added, about 600 °C.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem, EstimateItem } from './items';
import type { UnitContent } from './unitTypes';
import type { Idea, ExploreTask, Reading } from './unit06';

const b = (en: string, de: string): Bi => ({ en, de });

// Negated phrases that belong to an idea itself ("the ions can't move", "keine Gesamtladung"). The matcher accepts a
// negation inside a match only when that exact phrase appears in the pattern's source, so each idea lists its own
// phrases in a branch that never matches on its own. A negation that contradicts the idea ("the electrons are not
// free") must not be listed for that idea.
// (The matcher reads the negation plus the next word, punctuation included, so each phrase also comes with a comma.)
const bank = (...phrases: string[]) => `(?!)(${phrases.flatMap((p) => [p, p + ',']).join('|')})`;
const NO_CURRENT_EN = ["doesn't conduct", 'does not conduct', "don't conduct", 'do not conduct', "can't conduct", 'cannot conduct', "won't conduct", 'not conduct', 'no current', 'nothing flows', 'nothing moves', 'nothing happens', 'nothing to carry', 'nothing to push', 'nothing to pull'];
const NO_CURRENT_DE = ['leitet nicht', 'leiten nicht', 'leitet es nicht', 'leitet sie nicht', 'kein strom', 'keinen strom', 'nichts fließt', 'nichts bewegt', 'nichts wandert'];
const NEG = {
  carriers: { en: bank(...NO_CURRENT_EN), de: bank(...NO_CURRENT_DE) },
  metal: { en: bank('not tied', "isn't tied", "aren't tied", 'not bound', "aren't bound", "isn't bound", 'not attached', 'no single atom', 'not to one atom', 'not stuck'), de: bank('nicht gebunden', 'keinem einzelnen', 'keinem atom', 'nicht an ein', 'nicht fest') },
  solid: { en: bank("can't move", 'cannot move', 'can not move', "don't move", 'do not move', 'not move', "aren't free", 'are not free', 'not free', "can't travel", 'cannot travel', "can't go", 'not able', ...NO_CURRENT_EN), de: bank('nicht beweglich', 'nicht bewegen', 'nicht wandern', 'nicht frei', 'nicht von der stelle', ...NO_CURRENT_DE) },
  free: { en: bank('not electrons', 'not the electrons', 'no electrons', 'no electron', 'not by electrons'), de: bank('nicht die elektronen', 'keine elektronen', 'nicht elektronen', 'kein elektron') },
  molecular: { en: bank('no charge', 'no charges', 'no net', 'no overall', 'no real', 'no full', 'no ions', 'no free', 'no carriers', 'no charge carriers', 'not charged', "don't form", 'do not form', "doesn't form", 'does not form', 'not form', "don't split", 'do not split', "doesn't split", 'not split', "don't break", "doesn't break", 'not break', ...NO_CURRENT_EN), de: bank('keine ladung', 'keine gesamtladung', 'keine nettoladung', 'keine ionen', 'keine freien', 'keine echte', 'keine volle', 'nicht geladen', 'nicht in', 'keine beweglichen', 'keine ladungsträger', 'kein ion', ...NO_CURRENT_DE) },
};

// Polar molecules taken as the reason for conduction (unit 7's main misconception), unless the clause negates it.
const POLAR_CONDUCTS = {
  en: /^(?![^.;]*(n't|\bnot\b|\bno\b|\bnever\b|\bbarely\b|\bhardly\b|\beven\b))[^.;]*(\bpolar|partial charges?|δ)[^.;]{0,60}(conduct|carr(y|ies) (the |a )?current|let(s)? (the |a )?current)|^(?![^.;]*(n't|\bnot\b|\bno\b|\bnever\b|\bbarely\b|\bhardly\b))[^.;]*conduct\w*[^.;]{0,60}(because|since|as)[^.;]{0,30}(\bpolar|partial charges?)/,
  de: /^(?![^.;]*(nicht|kein|\bnie\b|kaum|auch wenn))[^.;]*(\bpolar|partialladung|teilladung|δ)[^.;]{0,60}(leit|strom)|^(?![^.;]*(nicht|kein|\bnie\b|kaum))[^.;]*leit\w*[^.;]{0,60}(weil|\bda\b)[^.;]{0,30}(\bpolar|partialladung|teilladung)/,
};
// Electrons swimming through a melt or solution (instead of ions moving), unless negated.
const ELECTRONS_THROUGH = {
  en: /^(?![^.;]*(n't|\bnot\b|\bno\b|\bnever\b|\bonly at\b))[^.;]*electrons? (flow|move|travel|pass|go|jump|swim|carry)\w*[^.;]{0,30}(through|across) (the )?(salt ?water|solution|water|melt|liquid)/,
  de: /^(?![^.;]*(nicht|kein|\bnie\b|nur an))[^.;]*elektronen (fließen|wandern|bewegen sich|gehen|springen|schwimmen)[^.;]{0,30}durch (die |das )?(salzlösung|lösung|wasser|schmelze|flüssigkeit|salzwasser)/,
};

export const UNIT7: UnitContent = {
  n: 7,
  title: b('Who carries the charge', 'Wer trägt die Ladung'),
  lead: b('Why a copper wire, molten salt and salt water carry a current, while solid salt and sugar water do not.',
    'Warum ein Kupferdraht, geschmolzenes Salz und Salzlösung Strom leiten, festes Salz und Zuckerlösung aber nicht.'),

  puzzle: {
    title: b('Both dissolve, only one conducts', 'Beide lösen sich, nur eines leitet'),
    lead: b('Salt and sugar both dissolve completely in water, and both solutions look like plain water. Put two metal plates and a lamp on a battery into each, though, and they behave very differently.',
      'Salz und Zucker lösen sich beide vollständig in Wasser, und beide Lösungen sehen aus wie klares Wasser. Hält man aber zwei Metallplatten hinein, die über eine Lampe mit einer Batterie verbunden sind, verhalten sie sich ganz verschieden.'),
    data: {
      caption: b('Electrical conductivity at room temperature, in siemens per metre (S/m): how easily a current passes through. Higher means better. Salt water: 58 g of salt per litre.',
        'Elektrische Leitfähigkeit bei Raumtemperatur in Siemens pro Meter (S/m): wie leicht Strom hindurchfließt. Höher bedeutet besser. Salzlösung: 58 g Salz pro Liter.'),
      head: [b('Material', 'Stoff'), b('Conductivity (S/m)', 'Leitfähigkeit (S/m)'), b('Lamp', 'Lampe')],
      rows: [
        { cells: [b('copper wire', 'Kupferdraht'), b('60 million', '60 Millionen'), b('bright', 'hell')] },
        { cells: [b('solid salt crystals', 'feste Salzkristalle'), b('practically 0', 'praktisch 0'), b('off', 'aus')] },
        { cells: [b('salt water', 'Salzlösung'), b('about 9', 'etwa 9'), b('lit', 'leuchtet')] },
        { cells: [b('sugar water', 'Zuckerlösung'), b('0.000006', '0,000006'), b('off', 'aus')], mystery: true },
        { cells: [b('pure water', 'reines Wasser'), b('0.0000055', '0,0000055'), b('off', 'aus')] },
      ],
      numeric: [1],
    },
    clash: b('Solid salt is made entirely of ions, yet it does not light the lamp; dissolved, it does. Sugar dissolves just as completely, yet sugar water conducts no better than the pure water it was made with. What does a material need in order to carry a current?',
      'Festes Salz besteht ganz aus Ionen und bringt die Lampe trotzdem nicht zum Leuchten; gelöst schon. Zucker löst sich genauso vollständig, aber Zuckerlösung leitet nicht besser als das reine Wasser, aus dem sie gemacht ist. Was braucht ein Stoff, um Strom zu leiten?'),
    question: {
      id: 'u7-puzzle', unit: 7, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u7.carriers', 'u7.molecular'], targets: ['every-solution-conducts', 'polarity-conduction', 'electrons-through-solution'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Water: anything dissolved in water conducts', 'Wasser: Alles, was in Wasser gelöst ist, leitet'), mis: 'every-solution-conducts' },
        { text: b('Charged particles that are free to move', 'Geladene Teilchen, die sich frei bewegen können'), correct: true },
        { text: b('Polar particles: the more polar, the better it conducts', 'Polare Teilchen: Je polarer, desto besser leitet es'), mis: 'polarity-conduction' },
        { text: b('A liquid, so that electrons can flow through it', 'Eine Flüssigkeit, damit Elektronen hindurchfließen können'), mis: 'electrons-through-solution' },
      ],
      explain: b('A current is moving charge, so a material needs [[charge-carrier|charge carriers]]: charged particles that are free to move. Copper has electrons that roam through the metal. Salt is made of {{Na+}} and {{Cl-}} ions, but in the crystal they are held in place; in water they come apart and can move. Sugar dissolves as whole molecules: polar, but neutral overall, so they carry no charge anywhere.',
        'Strom ist bewegte Ladung, also braucht ein Stoff [[charge-carrier|Ladungsträger]]: geladene Teilchen, die sich frei bewegen können. Kupfer hat Elektronen, die sich durch das ganze Metall bewegen. Salz besteht aus {{Na+}}- und {{Cl-}}-Ionen, aber im Kristall sitzen sie fest; im Wasser lösen sie sich voneinander und können wandern. Zucker löst sich als ganze Moleküle: polar, aber insgesamt ungeladen, also transportieren sie keine Ladung.'),
    } as ChoiceItem,
    after: b('Next: connect the battery to each material and watch what moves.', 'Als Nächstes: Schließ die Batterie an jeden Stoff an und sieh zu, was sich bewegt.'),
  },

  explore: {
    title: b('Two electrodes and a lamp', 'Zwei Elektroden und eine Lampe'),
    intro: b('A current is charge on the move. Here a material sits between two metal plates, the [[electrode|electrodes]], joined through a battery and a lamp: the plate marked − is the negative pole, the one marked + the positive pole. Blue marks positive particles, red negative ones, and the small red-pink dots are electrons. The bar compares how well each material conducts, in siemens per metre (S/m); each step along it is ten times more.',
      'Strom ist bewegte Ladung. Hier liegt ein Stoff zwischen zwei Metallplatten, den [[electrode|Elektroden]], die über eine Batterie und eine Lampe verbunden sind: Die Platte mit − ist der Minuspol, die mit + der Pluspol. Blau markiert positive Teilchen, Rot negative, und die kleinen rosaroten Punkte sind Elektronen. Der Balken vergleicht die elektrische Leitfähigkeit in Siemens pro Meter (S/m); jeder Schritt auf ihm ist zehnmal mehr.'),
    tasks: [
      { id: 'metal', key: true, text: b('Load copper and connect the battery. Which particles move, and which way?', 'Lade Kupfer und schließ die Batterie an. Welche Teilchen bewegen sich, und in welche Richtung?') },
      { id: 'solid', key: true, text: b('Load solid salt and connect the battery. What do the ions do?', 'Lade festes Salz und schließ die Batterie an. Was machen die Ionen?') },
      { id: 'melt', key: true, text: b('Heat the salt past 801 °C and connect the battery. Where do the blue ions go, and where the red ones?', 'Erhitze das Salz über 801 °C und schließ die Batterie an. Wohin wandern die blauen Ionen, wohin die roten?') },
      { id: 'solution', key: true, text: b('Try salt water. Where does it sit on the conductivity bar, compared with the melt?', 'Probier Salzlösung. Wo steht sie auf dem Leitfähigkeitsbalken, verglichen mit der Schmelze?') },
      { id: 'sugar', text: b('Try sugar water. Sugar dissolves too, so why does the lamp stay dark?', 'Probier Zuckerlösung. Zucker löst sich auch: Warum bleibt die Lampe trotzdem aus?') },
      { id: 'reverse', challenge: true, text: b('While ions are moving, swap the poles. What do the ions do?', 'Vertausche die Pole, während Ionen wandern. Was machen die Ionen?') },
    ] as ExploreTask[],
    notes: {
      metal: b('Each copper atom gives its outer electron to a shared sea of electrons that spreads through the whole metal; what is left are positive atom cores. With the battery on, the electrons drift towards the + plate, while the cores only vibrate in place. This is the [[metallic-bond]]: positive cores held together by mobile electrons.',
        'Jedes Kupferatom gibt sein Außenelektron an ein gemeinsames „Elektronengas“ ab, das sich durch das ganze Metall verteilt; zurück bleiben positive Atomrümpfe. Mit Batterie wandern die Elektronen zum Pluspol, die Atomrümpfe schwingen nur an ihrem Platz. Das ist die [[metallic-bond]]: positive Atomrümpfe, zusammengehalten von frei beweglichen Elektronen.'),
      solid: b('The ions are all there, but each one sits among six neighbours of opposite charge (unit 4). They vibrate in place; none can travel to a plate, so practically no current flows.',
        'Die Ionen sind alle da, aber jedes sitzt zwischen sechs Nachbarn mit Gegenladung (Einheit 4). Sie schwingen an ihrem Platz; keines kann zu einer Platte wandern, also fließt praktisch kein Strom.'),
      melt: b('Above 801 °C the lattice falls apart. Now the blue {{Na+}} ions drift to the − plate and the red {{Cl-}} ions to the + plate: opposite charges attract. The ions themselves carry the charge; no electrons travel through the melt.',
        'Über 801 °C bricht das Gitter zusammen. Jetzt wandern die blauen {{Na+}}-Ionen zum Minuspol und die roten {{Cl-}}-Ionen zum Pluspol: Gegensätzliche Ladungen ziehen sich an. Die Ionen selbst tragen die Ladung; keine Elektronen wandern durch die Schmelze.'),
      solution: b('Water pulls the lattice apart (unit 11 shows how), and the freed ions drift just as in the melt. Salt water conducts about a million times better than pure water, though less well than the melt, which packs far more ions into every litre.',
        'Wasser zieht das Gitter auseinander (Einheit 11 zeigt, wie), und die frei gewordenen Ionen wandern genauso wie in der Schmelze. Salzlösung leitet etwa eine Million Mal besser als reines Wasser, aber schlechter als die Schmelze, die viel mehr Ionen in jeden Liter packt.'),
      sugar: b('Sugar molecules have δ+ and δ− ends, but these partial charges add up to zero: each molecule is neutral as a whole. The battery has nothing to pull along, so sugar water conducts about as poorly as pure water.',
        'Zuckermoleküle haben δ+- und δ−-Enden, aber diese Partialladungen ergeben zusammen null: Jedes Molekül ist insgesamt ungeladen. Die Batterie hat nichts, woran sie ziehen kann, also leitet Zuckerlösung etwa so schlecht wie reines Wasser.'),
      reverse: b('The ions turn round and head for the other plates: positive ions always go to whichever plate is negative. They follow the charges on the plates, not a direction built into the material.',
        'Die Ionen kehren um und steuern die anderen Platten an: Positive Ionen wandern immer zu der Platte, die gerade negativ ist. Sie folgen den Ladungen auf den Platten, nicht einer Richtung, die im Stoff festgelegt ist.'),
    },
    check: {
      id: 'u7-check', unit: 7, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u7.carriers', 'u7.salt-free', 'u7.molecular'],
      prompt: b('Quick check: rank by how well they conduct, best first.', 'Kurzer Check: Ordne danach, wie gut sie leiten, den besten Leiter zuerst.'),
      order: [b('copper', 'Kupfer'), b('molten salt', 'geschmolzenes Salz'), b('salt water', 'Salzlösung'), b('sugar water', 'Zuckerlösung')],
      explain: b('Copper: about 60 million S/m, carried by electrons. Molten salt: several hundred S/m, carried by ions. Salt water: about 9 S/m, with far fewer ions per litre than the melt. Sugar water: about 0.000006 S/m, as poor as pure water, because it has no charge carriers.',
        'Kupfer: etwa 60 Millionen S/m, getragen von Elektronen. Geschmolzenes Salz: einige Hundert S/m, getragen von Ionen. Salzlösung: etwa 9 S/m, mit viel weniger Ionen pro Liter als die Schmelze. Zuckerlösung: etwa 0,000006 S/m, so schlecht wie reines Wasser, weil sie keine Ladungsträger hat.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u7-graphite', unit: 7, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u7.carriers', 'u7.bond-types'],
        prompt: b('Graphite, the "lead" in a pencil, is pure carbon: each atom is bonded to three others by shared pairs, in flat sheets. Draw a thick pencil line and put it between the electrodes. Does it conduct?',
          'Graphit, die „Mine“ eines Bleistifts, ist reiner Kohlenstoff: Jedes Atom ist über gemeinsame Elektronenpaare an drei andere gebunden, in flachen Schichten. Zeichne einen dicken Bleistiftstrich und leg ihn zwischen die Elektroden. Leitet er?'),
        options: [
          { text: b('No: in covalent bonds every electron sits in a fixed shared pair', 'Nein: In Atombindungen sitzt jedes Elektron in einem festen gemeinsamen Paar') },
          { text: b('No: carbon is a non-metal, and non-metals never conduct', 'Nein: Kohlenstoff ist ein Nichtmetall, und Nichtmetalle leiten nie') },
          { text: b('Yes: one electron per carbon is in no bond and can move along the sheet', 'Ja: Ein Elektron pro Kohlenstoffatom steckt in keiner Bindung und kann sich entlang der Schicht bewegen'), correct: true },
          { text: b('Yes: the carbon atoms form ions that wander through the sheet', 'Ja: Die Kohlenstoffatome bilden Ionen, die durch die Schicht wandern') },
        ],
        explain: b('Carbon has four outer electrons. In graphite each atom shares three of them with its three neighbours in the sheet. The fourth is not tied to one bond: these electrons spread over the whole sheet and can move along it, much as in a metal.',
          'Kohlenstoff hat vier Außenelektronen. Im Graphit teilt jedes Atom drei davon mit seinen drei Nachbarn in der Schicht. Das vierte gehört zu keiner bestimmten Bindung: Diese Elektronen verteilen sich über die ganze Schicht und können sich entlang der Schicht bewegen, ähnlich wie in einem Metall.'),
      } as ChoiceItem,
      show: { engine: 'conduct', material: 'Cu', on: true },
      revealText: b('Graphite conducts: a heavy pencil line carries enough current to light a small LED. Along its sheets it behaves much like the copper shown here, with electrons free to move; across the sheets it conducts far worse. Diamond is pure carbon too, but each atom uses all four outer electrons in bonds, so it has no free electrons and does not conduct. Same element, different bonding, opposite result.',
        'Graphit leitet: Ein kräftiger Bleistiftstrich leitet genug Strom, um eine kleine LED zum Leuchten zu bringen. Entlang seiner Schichten verhält er sich ähnlich wie das Kupfer hier, mit frei beweglichen Elektronen; quer zu den Schichten leitet er viel schlechter. Diamant ist ebenfalls reiner Kohlenstoff, aber jedes Atom nutzt alle vier Außenelektronen für Bindungen; er hat keine freien Elektronen und leitet nicht. Dasselbe Element, andere Bindung, gegenteiliges Ergebnis.'),
      extra: {
        title: b('Count the electrons that are left over', 'Die übrigen Elektronen zählen'),
        steps: [
          b('A current needs charged particles that can move. Graphite contains no ions, so in it they could only be electrons.', 'Strom braucht geladene Teilchen, die sich bewegen können. Graphit enthält keine Ionen, also kämen nur Elektronen infrage.'),
          b('Carbon has four outer electrons. In graphite each carbon atom is bonded to three neighbours, so three of them sit in shared pairs.', 'Kohlenstoff hat vier Außenelektronen. Im Graphit ist jedes Kohlenstoffatom an drei Nachbarn gebunden, also sitzen drei davon in gemeinsamen Paaren.'),
          b('The fourth electron of each atom is not stuck between two atoms: it is shared across the whole sheet.', 'Das vierte Elektron jedes Atoms sitzt nicht zwischen zwei Atomen fest: Es gehört der ganzen Schicht.'),
          b('Those electrons can move along the sheet, so graphite conducts, like a metal along its layers.', 'Diese Elektronen können sich entlang der Schicht bewegen, also leitet Graphit, wie ein Metall entlang seiner Schichten.'),
        ],
      },
    },
    {
      item: {
        id: 'u7-hcl', unit: 7, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u7.molecular'], targets: ['polarity-conduction', 'every-solution-conducts', 'polar-means-ions'],
        prompt: b('Hydrogen chloride is strongly polar (electronegativity difference 0.96, unit 5). Below −85 °C it is a liquid made of HCl molecules. Put the pure liquid between the electrodes. What does the lamp do?',
          'Chlorwasserstoff ist stark polar (ΔEN 0,96, Einheit 5). Unter −85 °C ist er eine Flüssigkeit aus HCl-Molekülen. Gib die reine Flüssigkeit zwischen die Elektroden. Was macht die Lampe?'),
        options: [
          { text: b('It lights: polar molecules carry the current', 'Sie leuchtet: Polare Moleküle transportieren den Strom'), mis: 'polarity-conduction' },
          { text: b('It lights: every liquid conducts', 'Sie leuchtet: Jede Flüssigkeit leitet'), mis: 'every-solution-conducts' },
          { text: b('It lights: the molecules split into H⁺ and Cl⁻ ions on their own', 'Sie leuchtet: Die Moleküle zerfallen von selbst in H⁺- und Cl⁻-Ionen'), mis: 'polar-means-ions' },
          { text: b('It stays dark: the molecules are polar, but each one is neutral overall', 'Sie bleibt aus: Die Moleküle sind polar, aber jedes ist insgesamt ungeladen'), correct: true },
        ],
        explain: b('δ+ and δ− are partial charges that add up to zero, so each HCl molecule is neutral as a whole. With no free charges, the battery has nothing to push along.',
          'δ+ und δ− sind Partialladungen, die zusammen null ergeben; jedes HCl-Molekül ist also insgesamt ungeladen. Ohne freie Ladungen hat die Batterie nichts, was sie bewegen könnte.'),
      } as ChoiceItem,
      show: { engine: 'conduct', material: 'sugar-aq', on: true },
      revealText: b('Pure liquid hydrogen chloride is a very poor conductor, much like the sugar water shown here: polar molecules, but no charges that can travel. Bubble the same gas into water and the solution conducts well: water takes an H⁺ from each HCl molecule, giving {{H3O+}} and {{Cl-}} ions. That solution is hydrochloric acid (unit 26).',
        'Reiner flüssiger Chlorwasserstoff leitet sehr schlecht, ähnlich wie die Zuckerlösung hier: polare Moleküle, aber keine Ladungen, die wandern könnten. Leitet man dasselbe Gas in Wasser ein, leitet die Lösung gut: Das Wasser nimmt jedem HCl-Molekül ein H⁺ ab, es entstehen {{H3O+}}- und {{Cl-}}-Ionen. Diese Lösung ist Salzsäure (Einheit 26).'),
      extra: {
        title: b('Partial charges are not ions', 'Partialladungen sind keine Ionen'),
        steps: [
          b('A current needs charges that can travel from one plate to the other.', 'Strom braucht Ladungen, die von einer Platte zur anderen wandern können.'),
          b('An HCl molecule has a δ+ end (H) and a δ− end (Cl). The two partial charges are equal and opposite: together they make zero.', 'Ein HCl-Molekül hat ein δ+-Ende (H) und ein δ−-Ende (Cl). Die beiden Partialladungen sind gleich groß und entgegengesetzt: Zusammen ergeben sie null.'),
          b('The battery can turn a polar molecule a little, but it cannot pull a neutral molecule over to a plate.', 'Die Batterie kann ein polares Molekül etwas drehen, aber sie kann kein ungeladenes Molekül zu einer Platte ziehen.'),
          b('No free charges, no current: the lamp stays dark. Ions appear only when water splits the molecules (unit 26).', 'Keine freien Ladungen, kein Strom: Die Lampe bleibt aus. Ionen entstehen erst, wenn Wasser die Moleküle aufspaltet (Einheit 26).'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Copper wire', 'Kupferdraht'), tag: 'Cu', show: { engine: 'conduct', material: 'Cu', on: true },
      numbers: [{ v: '1', label: b('free electron from each copper atom (simple model)', 'freies Elektron pro Kupferatom (einfaches Modell)') }, { v: '6 × 10⁷ S/m', label: b('conductivity, second only to silver', 'Leitfähigkeit, nur Silber leitet besser') }, { v: '1084.6 °C', label: b('melting point', 'Schmelzpunkt') }],
      body: b('Each copper atom gives its outer electron to a sea of electrons that spreads through the whole metal; what stays behind are positive atom cores. The sea holds the cores together in every direction: this is the [[metallic-bond]]. Its electrons belong to no single atom, so a battery only has to push them along.',
        'Jedes Kupferatom gibt sein Außenelektron an ein Elektronengas ab, das sich durch das ganze Metall verteilt; zurück bleiben positive Atomrümpfe. Das Elektronengas hält die Atomrümpfe in alle Richtungen zusammen: Das ist die [[metallic-bond]]. Seine Elektronen gehören keinem einzelnen Atom, also muss eine Batterie sie nur noch anschieben.'),
      soWhat: b('The same sea lets metals bend instead of shattering: shift a layer of cores and it still sits in the same sea, so no like charges are pushed together as in salt (unit 4). In the wire the electrons drift from the − pole to the + pole; circuit diagrams draw the current from + to −, an older convention.',
        'Dasselbe Elektronengas lässt Metalle sich verbiegen, statt zu zerspringen: Verschiebt man eine Schicht Atomrümpfe, liegt sie immer noch im selben Elektronengas, und keine gleichen Ladungen werden aneinandergedrückt wie beim Salz (Einheit 4). Im Draht wandern die Elektronen vom Minuspol zum Pluspol; die technische Stromrichtung von + nach − ist eine ältere Vereinbarung. In der Klausur darfst du sie benutzen, solange klar ist, dass die Elektronen von − nach + wandern.'),
    },
    {
      title: b('Molten salt makes sodium', 'Aus Salzschmelze wird Natrium'), tag: 'NaCl', show: { engine: 'conduct', material: 'NaCl-melt', on: true },
      numbers: [{ v: '801 °C', label: b('melting point of sodium chloride', 'Schmelzpunkt von Natriumchlorid') }, { v: '0', label: b('electrons that cross the melt', 'Elektronen, die durch die Schmelze wandern') }, { v: '≈ 600 °C', label: b('in the industrial cell, with calcium chloride added', 'in der Industrieanlage, mit Calciumchlorid-Zusatz') }],
      body: b('In the melt, {{Na+}} ions drift to the negative electrode and {{Cl-}} ions to the positive one. No electron swims through the melt: at the negative electrode each {{Na+}} takes an electron and becomes a sodium atom, and at the positive one {{Cl-}} ions hand over electrons and form chlorine gas. A substance that conducts like this when molten or dissolved is an [[electrolyte]].',
        'In der Schmelze wandern {{Na+}}-Ionen zur negativen Elektrode und {{Cl-}}-Ionen zur positiven. Kein Elektron schwimmt durch die Schmelze: An der negativen Elektrode nimmt jedes {{Na+}} ein Elektron auf und wird zum Natriumatom, an der positiven geben {{Cl-}}-Ionen Elektronen ab und bilden Chlorgas. Ein Stoff, der geschmolzen oder gelöst so leitet, ist ein [[electrolyte]].'),
      soWhat: b('This is how sodium metal is made (the Downs process). Calcium chloride is added to lower the melting point, so the cell runs at about 600 °C instead of 801 °C. Unit 33 does the electron bookkeeping of such electrolysis.',
        'So wird Natrium hergestellt (Downs-Verfahren). Calciumchlorid wird zugesetzt, um den Schmelzpunkt zu senken, sodass die Anlage bei etwa 600 °C statt 801 °C läuft. In der Schmelzflusselektrolyse heißt die negative Elektrode Kathode, die positive Anode; Einheit 33 rechnet die Elektronen dabei genau nach.'),
    },
    {
      title: b('Pure water: where the rule bends', 'Reines Wasser: wo die Regel nachgibt'), tag: 'H2O', show: { engine: 'conduct', material: 'water', on: true },
      numbers: [{ v: '5.5 × 10⁻⁶ S/m', label: b('pure water', 'reines Wasser') }, { v: '0.0005–0.05 S/m', label: b('tap water, depending on its minerals', 'Leitungswasser, je nach Mineralgehalt') }, { v: '555 000 000', label: b('water molecules for each H₃O⁺ ion in pure water', 'Wassermoleküle auf jedes H₃O⁺-Ion in reinem Wasser') }],
      body: b('Even pure water is not a perfect insulator. Now and then one water molecule passes a proton (a hydrogen nucleus) to another, giving an {{H3O+}} and an {{OH-}} ion, but in pure water there is only one {{H3O+}} for every 555 million molecules, far too few to light the lamp. Tap water conducts a hundred to ten thousand times better because of its dissolved minerals, which are ions.',
        'Selbst reines Wasser ist kein perfekter Isolator. Ab und zu gibt ein Wassermolekül ein Proton (einen Wasserstoffkern) an ein anderes ab, und es entstehen ein {{H3O+}}- und ein {{OH-}}-Ion; in reinem Wasser kommt aber nur ein {{H3O+}} auf 555 Millionen Moleküle, viel zu wenige für die Lampe. Leitungswasser leitet hundert- bis zehntausendmal besser, wegen der gelösten Mineralstoffe, und die sind Ionen.'),
      soWhat: b('So "molecular substances do not conduct" holds for pure ones. Bath water and puddles carry dissolved ions, which is why water and mains electricity are a dangerous mix. Unit 27 counts the {{H3O+}} ions with the pH scale.',
        '„Molekulare Stoffe leiten nicht“ gilt also für reine Stoffe. Badewasser und Pfützen enthalten gelöste Ionen; deshalb sind Wasser und Netzstrom eine gefährliche Mischung. Einheit 27 zählt die {{H3O+}}-Ionen mit der pH-Skala.'),
    },
  ],

  flaw: {
    id: 'u7-flaw', unit: 7, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u7.molecular'], targets: ['polarity-conduction'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('Sugar dissolves completely in water, just as salt does.', 'Zucker löst sich vollständig in Wasser, genau wie Salz.'),
      b('Sugar molecules are polar, with δ+ and δ− ends, so they are charged particles like ions.', 'Zuckermoleküle sind polar, mit δ+- und δ−-Enden, also sind sie geladene Teilchen wie Ionen.'),
      b('Charged particles that can move carry a current.', 'Geladene Teilchen, die sich bewegen können, transportieren Strom.'),
      b('So sugar water conducts as well as salt water.', 'Also leitet Zuckerlösung so gut wie Salzlösung.'),
    ],
    flaw: 1,
    alsoFalse: [3],
    near: [{ step: 2, note: b('Step 3 is true: it is the rule this unit is built on. The slip comes before it: a polar molecule is neutral overall, so it is not a charged particle in this sense.', 'Schritt 3 stimmt: Auf dieser Regel baut die ganze Einheit auf. Der Fehler kommt vorher: Ein polares Molekül ist insgesamt ungeladen, also kein geladenes Teilchen in diesem Sinn.') }],
    explain: b('Step 2 is where it goes wrong. Step 1 is true: sugar dissolves completely. But δ+ and δ− are partial charges that add up to zero: a sugar molecule as a whole is neutral, not an ion, so the battery has nothing to push along. Step 3 is true; it is the rule of this unit. Step 4 is false only because it follows from step 2: sugar water conducts no better than pure water, about 0.000006 S/m against about 9 S/m for salt water.',
      'Schritt 2 ist der Fehler. Schritt 1 stimmt: Zucker löst sich vollständig. Aber δ+ und δ− sind Partialladungen, die zusammen null ergeben: Ein Zuckermolekül ist insgesamt ungeladen, kein Ion, also hat die Batterie nichts, was sie bewegen könnte. Schritt 3 stimmt; das ist die Regel dieser Einheit. Schritt 4 ist nur falsch, weil er aus Schritt 2 folgt: Zuckerlösung leitet nicht besser als reines Wasser, etwa 0,000006 S/m gegenüber etwa 9 S/m bei Salzlösung.'),
  } as FlawItem,

  deeper: {
    id: 'u7-deeper', unit: 7, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u7.salt-free'],
    prompt: b('Go deeper: molten salt holds far more ions per litre than salt water. A litre of molten sodium chloride at 801 °C weighs about 1556 g; one mole of NaCl weighs 58.4 g and gives one mole of {{Na+}}. Estimate how many moles of {{Na+}} ions one litre of the melt holds.',
      'Tiefer gehen: Geschmolzenes Salz enthält viel mehr Ionen pro Liter als Salzlösung. Ein Liter geschmolzenes Natriumchlorid wiegt bei 801 °C etwa 1556 g; ein Mol NaCl wiegt 58,4 g und liefert ein Mol {{Na+}}. Schätze, wie viel Mol {{Na+}}-Ionen ein Liter Schmelze enthält.'),
    min: 0, max: 60, step: 0.5, answer: 26.5, tolerance: 1, suffix: ' mol',
    near: [{ value: 53, tol: 1.5, note: b('53 counts both kinds of ion, {{Na+}} and {{Cl-}}. The question asks for {{Na+}} only: half of that.', '53 zählt beide Ionensorten, {{Na+}} und {{Cl-}}. Gefragt ist nur nach {{Na+}}: die Hälfte davon.') }],
    explain: b('1556 ÷ 58.4 ≈ 26.6 mol of {{Na+}} per litre, and as many {{Cl-}}. Salt water at 1 mol/L (58 g per litre) holds 1 mol of each: the melt packs about 27 times as many ions into every litre, one reason it conducts far better.',
      '1556 ÷ 58,4 ≈ 26,6 mol {{Na+}} pro Liter, und ebenso viele {{Cl-}}. Salzlösung mit 1 mol/L (58 g pro Liter) enthält 1 mol von jedem: Die Schmelze packt etwa 27-mal so viele Ionen in jeden Liter, ein Grund, warum sie viel besser leitet.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: what does a substance need in order to conduct electricity, and which substances have it?', 'In eigenen Worten: Was braucht ein Stoff, um Strom zu leiten, und welche Stoffe haben das?'),
    ideas: [
      { id: 'carriers', concept: 'u7.carriers', idea: b('A current needs charged particles that are free to move', 'Strom braucht geladene Teilchen, die sich frei bewegen können'),
        en: new RegExp(`((charged (particles?|things|bits|ones)|charge carriers?|carriers? of (the )?charge|\\bcharges\\b)[^.;]{0,50}(free to move|can move|able to move|that move|moving|mobile|move freely|move around|flow|travel|drift)|(mobile|moving|free|movable|free-moving|loose|wandering) (charged particles?|charges|charge carriers?|carriers)|(needs?|requires?|must have|has to have|have to have|only (if|when|with)|depends on|as long as)\\b[^.;]{0,40}(charged|charges|ions|electrons|carriers)[^.;]{0,40}(move|mobile|free|travel|flow)|(current|electricity) (is|means) (moving|flowing|travelling|traveling|mobile) (charges?|electrons|ions)|(current|electricity) is charge (on the move|moving|that moves|in motion))[^.;]*|${NEG.carriers.en}`),
        de: new RegExp(`((geladene teilchen|ladungsträger|ladungen)[^.;]{0,50}(beweg|wander|frei|fließ|transport)|(bewegliche|frei bewegliche|freie|wandernde) (geladene teilchen|ladungsträger|ladungen)|(braucht|brauchen|benötigt|benötigen|nötig|voraussetzung|nur wenn|nur, wenn|muss|müssen)\\b[^.;]{0,40}(geladen|ladung|ionen|elektronen)[^.;]{0,40}(beweg|frei|wander)|strom (ist|bedeutet) (bewegte|fließende|wandernde) (ladung|elektronen|ionen))[^.;]*|${NEG.carriers.de}`) },
      { id: 'metal', concept: 'u7.metallic', idea: b('In a metal, outer electrons move freely among positive atom cores and carry the current', 'Im Metall bewegen sich die Außenelektronen frei zwischen positiven Atomrümpfen und tragen den Strom'),
        // The cores (or "metal ions") taken as the moving carriers.
        contra: { en: /^(?![^.;]*(n't|\bnot\b|\bno\b|\bnever\b|\bstay|\bonly vibrate))[^.;]*\b((atom(ic)? )?cores|metal ions|copper ions|copper atoms|metal atoms|nuclei)\b[^.;]{0,20}\b(move|moves|flow|flows|travel|travels|drift|drifts|carry|carries|wander|wanders|migrate|migrates)\b/, de: /^(?![^.;]*(nicht|kein|\bnie\b|bleiben|schwingen nur))[^.;]*((atomrümpfe|metall-?ionen|kupfer-?ionen|kupferatome|metallatome|atomkerne)[^.;]{0,20}(wandern|bewegen sich|fließen|tragen|transportieren)|(wandern|bewegen sich|fließen)[^.;]{0,12}(die )?(atomrümpfe|metall-?ionen|kupfer-?ionen|kupferatome|metallatome))/ },
        en: new RegExp(`((metal|copper|metallic|wire)[^.;]{0,60}electrons?[^.;]{0,40}(free|loose|move|moving|mobile|roam|flow|delocali|sea|shared|wander|drift|travel|carry|not tied|isn't tied|aren't tied)|electrons?[^.;]{0,40}(free|loose|move|roam|flow|delocali|wander|drift)[^.;]{0,40}(metal|copper|wire|cores?|atoms)|(sea|cloud|gas) of (free |mobile |delocali[sz]ed )?electrons|electron (sea|gas|cloud)|delocali[sz]ed electrons|free electrons|(positive )?(atom(ic)? )?cores? (in|among|surrounded by)|metallic bond)[^.;]*|${NEG.metal.en}`),
        de: new RegExp(`((metall|kupfer|draht)[^.;]{0,60}elektron[^.;]{0,40}(frei|beweg|wander|fließ|delokal|gas|see|wolke|trag)|elektronen[^.;]{0,40}(frei|beweg|wander|fließ)[^.;]{0,40}(metall|kupfer|draht|atomrümpf|atomrumpf)|elektronengas|elektronensee|elektronenwolke|freie elektronen|frei bewegliche elektronen|delokalisierte elektronen|atomrümpfe|atomrumpf|metallbindung[^.;]{0,40}(elektron|leit))[^.;]*|${NEG.metal.de}`) },
      { id: 'solid', concept: 'u7.salt-solid', idea: b('In solid salt the ions are held in place in the lattice, so it does not conduct', 'Im festen Salz sitzen die Ionen fest im Ionengitter, deshalb leitet es nicht'),
        contra: { en: /^(?![^.;]*(n't|\bnot\b|\bnever\b))[^.;]*((there are )?no ions (in|until|before|unless)|ions (only )?(form|appear|are made|exist) (only )?(when|once|after|if) (it |the salt )?(melt|dissolv))/, de: /^(?![^.;]*(nicht|\bnie\b))[^.;]*(keine ionen,? (bis|bevor|solange|wenn|im festen)|ionen (entstehen|bilden sich|gibt es) erst,? (wenn|beim|nach))/ },
        en: new RegExp(`((solid|crystal|lattice|frozen|room temperature)[^.;]{0,80}(ions?|particles?|they|charges)[^.;]{0,40}(fixed|locked|held|stuck|trapped|in place|in position|in their places?|only vibrate|vibrate in place|just vibrate|wobble|jiggle|can't move|cannot move|can not move|don't move|do not move|aren't free|are not free|not free to move|can't travel|cannot travel|can't go anywhere)|(ions?|particles?|they)[^.;]{0,40}(fixed|locked|held|stuck|trapped|in place|in position|in their places?|only vibrate|just vibrate|wobble|jiggle|can't move|cannot move|can not move|don't move|do not move|aren't free|are not free|not free to move)[^.;]{0,60}(solid|crystal|lattice))[^.;]*|${NEG.solid.en}`),
        de: new RegExp(`((fest\\w*|kristall|gitter|ionengitter|raumtemperatur)[^.;]{0,80}(ionen|teilchen|sie|ladungen)[^.;]{0,40}(sitzen fest|sitzen dort fest|fest|festgehalten|gehalten|gebunden|an ihrem platz|auf ihren plätzen|schwingen nur|nur schwingen|nicht beweglich|unbeweglich|können sich nicht bewegen|können nicht wandern|nicht bewegen|nicht wandern|nicht frei)|(ionen|teilchen|sie)[^.;]{0,40}(sitzen fest|festgehalten|gehalten|gebunden|an ihrem platz|schwingen nur|nicht beweglich|unbeweglich|können sich nicht bewegen|können nicht wandern|nicht frei)[^.;]{0,60}(fest|kristall|gitter))[^.;]*|${NEG.solid.de}`) },
      { id: 'free', concept: 'u7.salt-free', idea: b('Molten or dissolved, the ions can move: positive ions to the negative pole, negative ions to the positive pole', 'In der Schmelze oder in Lösung können die Ionen wandern: positive zum Minuspol, negative zum Pluspol'),
        contra: ELECTRONS_THROUGH,
        en: new RegExp(`((molten|melts?|melted|melting|dissolv\\w*|solution|in water|liquid|salt ?water|salty water)[^.;]{0,80}(ions?|na\\+|cl-|cations?|anions?|charges)[^.;]{0,50}(move|moving|free|mobile|flow|drift|travel|wander|migrat|carry|go to|head)|(ions?|na\\+|cl-|cations?|anions?)[^.;]{0,50}(move|moving|free|mobile|flow|drift|travel|wander|migrat|carry)[^.;]{0,60}(molten|melt|dissolv\\w*|solution|in water|liquid)|(ions?|na\\+|cl-|cations?|anions?)[^.;]{0,20}(can|are free to|are able to|start to|begin to) (move|flow|travel|drift|wander)|(positive|\\+|na\\+|cations?)[^.;]{0,40}(to|towards|toward|at) the (negative|minus|-|cathode)|(negative|cl-|anions?)[^.;]{0,40}(to|towards|toward|at) the (positive|plus|\\+|anode))[^.;]*|${NEG.free.en}`),
        de: new RegExp(`((geschmolzen|schmelze|gelöst|lösung|in wasser|salzwasser|flüssig)[^.;]{0,80}(ionen|na\\+|cl-|kationen|anionen|ladungen)[^.;]{0,50}(beweg|wander|frei|fließ|transport|trag|gleit)|(ionen|na\\+|cl-|kationen|anionen)[^.;]{0,50}(beweg|wander|frei|fließ|trag)[^.;]{0,60}(geschmolzen|schmelze|gelöst|lösung|wasser)|(ionen|kationen|anionen)[^.;]{0,20}(können|sind) (sich )?(frei )?(beweg|wander)|(positive\\w*|\\+|na\\+|kationen)[^.;]{0,40}(zum|zur|an den|an die|in richtung) (minuspol|negativen|kathode|-)|(negative\\w*|cl-|anionen)[^.;]{0,40}(zum|zur|an den|an die|in richtung) (pluspol|positiven|anode|\\+))[^.;]*|${NEG.free.de}`) },
      { id: 'molecular', concept: 'u7.molecular', idea: b('Molecular substances such as sugar barely conduct, even when polar: their molecules carry no net charge', 'Molekulare Stoffe wie Zucker leiten kaum, auch wenn sie polar sind: Ihre Moleküle tragen keine Gesamtladung'),
        contra: POLAR_CONDUCTS,
        en: new RegExp(`((sugar|molecul\\w*|covalent|polar)[^.;]{0,80}(no (overall |net |real |full )?charges?|neutral|uncharged|not charged|no ions|no free (charges?|electrons|ions)|no (charge )?carriers|don't form ions|do not form ions|doesn't form ions|does not form ions|don't split|do not split|don't break (up )?(apart )?into ions|stay whole|stays whole|whole molecules|only partial charges|partial charges only|partial charges (that )?(cancel|add up to zero))|(neutral|uncharged|no (net |overall )?charge)[^.;]{0,60}(sugar|molecul\\w*))[^.;]*|${NEG.molecular.en}`),
        de: new RegExp(`((zucker|molekül\\w*|molekular\\w*|atombindung|polar\\w*)[^.;]{0,80}(keine (gesamt|netto)?ladung\\w*|keine echte ladung|keine volle ladung|keine ionen|keine freien (ladungsträger|elektronen|ionen|ladungen)|keine (beweglichen )?ladungsträger|ungeladen|elektrisch neutral|neutral|nicht geladen|nur partialladungen|nur teilladungen|zerfallen nicht in ionen|bilden keine ionen|bleiben ganz|ganze moleküle|partialladungen,? die sich aufheben)|(neutral|ungeladen|keine ladung)[^.;]{0,60}(zucker|molekül))[^.;]*|${NEG.molecular.de}`) },
    ] as Idea[],
    tightened: b('A current is charge on the move, so a substance conducts only if it has charged particles that are free to move. In a metal the outer electrons move freely among the positive atom cores and carry the current. Solid salt is made of ions, but they are held in place in the lattice, so it does not conduct. Molten or dissolved, the ions can move: positive ions drift to the negative pole and negative ions to the positive pole. Molecular substances such as sugar barely conduct, even when they are polar, because their molecules carry no net charge.',
      'Strom ist bewegte Ladung, deshalb leitet ein Stoff nur, wenn er frei bewegliche geladene Teilchen hat. Im Metall bewegen sich die Außenelektronen frei zwischen den positiven Atomrümpfen und tragen den Strom. Festes Salz besteht aus Ionen, aber sie sitzen fest im Ionengitter, deshalb leitet es nicht. In der Schmelze oder in Lösung können die Ionen wandern: Die positiven Ionen wandern zum Minuspol, die negativen zum Pluspol. Molekulare Stoffe wie Zucker leiten kaum, auch wenn sie polar sind, denn ihre Moleküle tragen keine Gesamtladung.'),
  },

  terms: ['metallic-bond', 'charge-carrier', 'electrolyte', 'electrode', 'ionic-lattice', 'partial-charge'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Electrolytes and Nonelectrolytes', 'Electrolytes and Nonelectrolytes'), source: 'CK-12, via LibreTexts',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(CK-12)/15:_Water/15.07:_Electrolytes_and_Nonelectrolytes',
      lookFor: [
        b('Its definition of an electrolyte: it conducts in solution or when melted. Which materials in the conduction view fit it?', ''),
        b('Sugar as a nonelectrolyte. What reason does it give, and how does that fit the δ+ and δ− ends a sugar molecule has?', ''),
        b('Calcium carbonate counts as an electrolyte although it hardly dissolves. Why, by its own definition?', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Metallic Bonding', 'Metallic Bonding'), source: 'chemguide',
      url: 'https://www.chemguide.co.uk/atoms/bonding/metallic.html',
      lookFor: [
        b('Its warning that sodium metal is made of atoms, written Na, not Na⁺. How does that fit "positive atom cores in a sea of electrons"?', ''),
        b('Sodium melts at 97.8 °C and magnesium much higher (650 °C). Which reasons does it give?', ''),
        b('It never mentions conduction. Add the missing sentence from the conduction view: what do the delocalised electrons do when a battery is connected?', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Metallbindung', 'Metallbindung'), source: 'Lernhelfer Schülerlexikon',
      url: 'https://www.lernhelfer.de/schuelerlexikon/chemie/artikel/metallbindung',
      lookFor: [
        b('', 'Den Begriff Elektronengas und den Hinweis, es sei eine Modellvorstellung. Was davon zeigt dir die Leitfähigkeitsansicht beim Kupfer?'),
        b('', 'Warum die Leitfähigkeit eines Metalls mit steigender Temperatur sinkt. Beim Salz steigt sie dagegen beim Schmelzen enorm. Woher kommt der Unterschied?'),
        b('', 'Die Zahl der Außenelektronen, die Metallatome abgeben. Wie viele gibt ein Natriumatom an das Elektronengas ab, wie viele ein Magnesiumatom?'),
      ],
    },
  ] as Reading[],

  misconceptions: [
    { id: 'electrons-through-solution', name: b('Electrons flow through salt water or a melt, as through a wire', 'Elektronen fließen durch Salzlösung oder Schmelze wie durch einen Draht') },
    { id: 'metal-cores-carry', name: b('In a metal, the atom cores move and carry the current', 'Im Metall wandern die Atomrümpfe und tragen den Strom') },
    { id: 'every-solution-conducts', name: b('Anything liquid or dissolved conducts', 'Alles Flüssige oder Gelöste leitet Strom') },
    { id: 'pure-water-conducts', name: b('Pure water is a good conductor', 'Reines Wasser leitet gut') },
  ],

  glossary: {
    'metallic-bond': {
      en: 'metallic bonding', de: 'Metallbindung', unit: 7,
      def: { en: 'Positive atom cores held together in every direction by a sea of outer electrons that are free to move through the whole metal.', de: 'Positive Atomrümpfe, die ein „Elektronengas“ aus frei beweglichen Außenelektronen in alle Richtungen zusammenhält.' },
      falseFriend: { en: 'German school books say "Elektronengas" (electron gas) and "Atomrümpfe" (atom cores) for the sea and the cores.', de: 'Englisch: „sea of electrons“ und „positive ions“ oder „cores“ für Elektronengas und Atomrümpfe.' },
    },
    'charge-carrier': {
      en: 'charge carrier', de: 'Ladungsträger', unit: 7,
      def: { en: 'A charged particle that can move and so carry a current: electrons in a metal, ions in a melt or solution.', de: 'Ein geladenes Teilchen, das sich bewegen und so Strom transportieren kann: Elektronen im Metall, Ionen in Schmelzen und Lösungen.' },
    },
    electrolyte: {
      en: 'electrolyte', de: 'Elektrolyt', unit: 7,
      def: { en: 'A substance that conducts when molten or dissolved in water, because it then provides ions that can move, such as table salt.', de: 'Ein Stoff, der geschmolzen oder in Wasser gelöst Strom leitet, weil er dann bewegliche Ionen liefert, zum Beispiel Kochsalz.' },
      falseFriend: { en: 'Both languages also use the word for the conducting solution itself, as in a battery.', de: 'In beiden Sprachen bezeichnet das Wort auch die leitende Lösung selbst, etwa in einer Batterie.' },
    },
    electrode: {
      en: 'electrode', de: 'Elektrode', unit: 7,
      def: { en: 'A metal or graphite plate or rod through which current enters or leaves a melt or solution. In electrolysis the negative electrode is the cathode, the positive one the anode.', de: 'Eine Platte oder ein Stab aus Metall oder Graphit, über die Strom in eine Schmelze oder Lösung hinein- und wieder herausfließt. Bei der Elektrolyse ist die negative Elektrode die Kathode, die positive die Anode.' },
    },
  },
};
