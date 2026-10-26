// Unit 17, built from its content file and the engine wiring in engines.ts.
import { UNIT17 } from '../content/unit17';
import { makeUnit } from './generic';
import { ENGINE_U17 } from './engines';

export const unit17 = makeUnit(UNIT17, ENGINE_U17);
