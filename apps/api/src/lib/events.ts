import { EventEmitter } from "node:events";

export const BRAND_COLORS_UPDATED = "brandColorsUpdated";

export type BrandColorsUpdatedPayload = {
  domains: string[];
  at: number;
};

export const appEvents = new EventEmitter();
appEvents.setMaxListeners(Infinity);

export const emitBrandColorsUpdated = (domains: string[]): void => {
  const payload: BrandColorsUpdatedPayload = { domains, at: Date.now() };

  appEvents.emit(BRAND_COLORS_UPDATED, payload);
};
