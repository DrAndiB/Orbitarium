// Unit 8, built from its content file and the engine wiring in engines.ts.
import { UNIT8 } from '../content/unit08';
import { makeUnit } from './generic';
import { ENGINE_U8 } from './engines';

export const unit8 = makeUnit(UNIT8, ENGINE_U8);
