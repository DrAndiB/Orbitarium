// Unit 10, built from its content file and the engine wiring in engines.ts.
import { UNIT10 } from '../content/unit10';
import { makeUnit } from './generic';
import { ENGINE_U10 } from './engines';

export const unit10 = makeUnit(UNIT10, ENGINE_U10);
