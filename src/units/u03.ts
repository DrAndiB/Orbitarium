// Unit 3, built from its content file and the engine wiring in engines.ts.
import { UNIT3 } from '../content/unit03';
import { makeUnit } from './generic';
import { ENGINE_U3 } from './engines';

export const unit3 = makeUnit(UNIT3, ENGINE_U3);
