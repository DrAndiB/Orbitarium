// Unit 11, built from its content file and the engine wiring in engines.ts.
import { UNIT11 } from '../content/unit11';
import { makeUnit } from './generic';
import { ENGINE_U11 } from './engines';

export const unit11 = makeUnit(UNIT11, ENGINE_U11);
