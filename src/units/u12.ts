// Unit 12, built from its content file and the engine wiring in engines.ts.
import { UNIT12 } from '../content/unit12';
import { makeUnit } from './generic';
import { ENGINE_U12 } from './engines';

export const unit12 = makeUnit(UNIT12, ENGINE_U12);
