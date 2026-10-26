// Unit 19, built from its content file and the engine wiring in engines.ts.
import { UNIT19 } from '../content/unit19';
import { makeUnit } from './generic';
import { ENGINE_U19 } from './engines';

export const unit19 = makeUnit(UNIT19, ENGINE_U19);
