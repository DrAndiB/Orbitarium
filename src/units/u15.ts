// Unit 15, built from its content file and the engine wiring in engines.ts.
import { UNIT15 } from '../content/unit15';
import { makeUnit } from './generic';
import { ENGINE_U15 } from './engines';

export const unit15 = makeUnit(UNIT15, ENGINE_U15);
