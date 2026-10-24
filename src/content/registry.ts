// Units built from UnitContent bring their own misconceptions and glossary terms. This module merges them into
// the shared lists once, at start-up; import it before anything renders.
import { MISCONCEPTIONS } from './curriculum';
import { GLOSSARY } from './glossary';
import type { UnitContent } from './unitTypes';
import { UNIT1 } from './unit01';
import { UNIT2 } from './unit02';
import { UNIT3 } from './unit03';
import { UNIT4 } from './unit04';
import { UNIT5 } from './unit05';
import { UNIT7 } from './unit07';
import { UNIT8 } from './unit08';
import { UNIT9 } from './unit09';
import { UNIT10 } from './unit10';
import { UNIT11 } from './unit11';
import { UNIT12 } from './unit12';
import { UNIT13 } from './unit13';
import { UNIT14 } from './unit14';
import { UNIT15 } from './unit15';
import { UNIT16 } from './unit16';

export const CONTENT_UNITS: UnitContent[] = [UNIT1, UNIT2, UNIT3, UNIT4, UNIT5, UNIT7, UNIT8, UNIT9, UNIT10, UNIT11, UNIT12, UNIT13, UNIT14, UNIT15, UNIT16];

for (const U of CONTENT_UNITS) {
  for (const m of U.misconceptions) if (!MISCONCEPTIONS.some((x) => x.id === m.id)) MISCONCEPTIONS.push({ ...m, unit: U.n });
  for (const [id, term] of Object.entries(U.glossary)) if (!GLOSSARY[id]) GLOSSARY[id] = term;
}
