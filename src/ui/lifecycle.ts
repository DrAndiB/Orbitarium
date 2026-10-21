// Callbacks that run when the current screen is left (dispose 3D scenes, timers, classes).
let fns: (() => void)[] = [];
export function onLeave(f: () => void) { fns.push(f); }
export function leaveScreen() { const run = fns; fns = []; run.forEach((f) => { try { f(); } catch (e) { console.warn(e); } }); }
