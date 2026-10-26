// Unit 20, built from its content file and the engine wiring in engines.ts.
import { UNIT20 } from '../content/unit20';
import { makeUnit } from './generic';
import { ENGINE_U20 } from './engines';

export const unit20 = makeUnit(UNIT20, ENGINE_U20);
