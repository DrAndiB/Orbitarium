// Unit 4, built from its content file and the engine wiring in engines.ts.
import { UNIT4 } from '../content/unit04';
import { makeUnit } from './generic';
import { ENGINE_U4 } from './engines';

export const unit4 = makeUnit(UNIT4, ENGINE_U4);
