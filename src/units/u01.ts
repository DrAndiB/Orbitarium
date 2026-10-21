// Unit 1, built from its content file and the engine wiring in engines.ts.
import { UNIT1 } from '../content/unit01';
import { makeUnit } from './generic';
import { ENGINE_U1 } from './engines';

export const unit1 = makeUnit(UNIT1, ENGINE_U1);
