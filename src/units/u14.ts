// Unit 14, built from its content file and the engine wiring in engines.ts.
import { UNIT14 } from '../content/unit14';
import { makeUnit } from './generic';
import { ENGINE_U14 } from './engines';

export const unit14 = makeUnit(UNIT14, ENGINE_U14);
