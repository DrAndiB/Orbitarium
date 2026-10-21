// Unit 2, built from its content file and the engine wiring in engines.ts.
import { UNIT2 } from '../content/unit02';
import { makeUnit } from './generic';
import { ENGINE_U2 } from './engines';

export const unit2 = makeUnit(UNIT2, ENGINE_U2);
