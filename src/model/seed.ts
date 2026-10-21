// The learner's own history (from the chat lessons), injected at build time from seed.local.md
// or the SEED_PROGRESS secret in CI. It is not part of the public source code.
declare const __SEED_PROGRESS__: string;
export const SEED_PROGRESS: string = typeof __SEED_PROGRESS__ === 'string' ? __SEED_PROGRESS__ : '';
