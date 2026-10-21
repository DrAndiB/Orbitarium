// Unit 5, built from its content file and the engine wiring in engines.ts.
import { UNIT5 } from '../content/unit05';
import { makeUnit } from './generic';
import { ENGINE_U5 } from './engines';

export const unit5 = makeUnit(UNIT5, ENGINE_U5);
