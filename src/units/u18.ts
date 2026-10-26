// Unit 18, built from its content file and the engine wiring in engines.ts.
import { UNIT18 } from '../content/unit18';
import { makeUnit } from './generic';
import { ENGINE_U18 } from './engines';

export const unit18 = makeUnit(UNIT18, ENGINE_U18);
