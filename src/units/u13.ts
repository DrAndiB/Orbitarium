// Unit 13, built from its content file and the engine wiring in engines.ts.
import { UNIT13 } from '../content/unit13';
import { makeUnit } from './generic';
import { ENGINE_U13 } from './engines';

export const unit13 = makeUnit(UNIT13, ENGINE_U13);
