// Unit 16, built from its content file and the engine wiring in engines.ts.
import { UNIT16 } from '../content/unit16';
import { makeUnit } from './generic';
import { ENGINE_U16 } from './engines';

export const unit16 = makeUnit(UNIT16, ENGINE_U16);
