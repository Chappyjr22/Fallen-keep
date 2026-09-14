// Increment when an older client cannot safely participate in the new state flow.
export const COOP_PROTOCOL=9;
export function compatibleParty(host,guest){return host?.protocol===COOP_PROTOCOL&&guest?.protocol===COOP_PROTOCOL;}
