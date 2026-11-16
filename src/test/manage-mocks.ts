import { vi } from "vitest";

/*
 * What the editing components' tests share: every server action of the manage pages answers ok, and the router and
 * toasts are spies. Import this module before the components, then vi.mock the modules it names.
 */
export const router = { refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), back: vi.fn() };
export const toast = { success: vi.fn(), error: vi.fn() };
export const ok = <T, >(data?: T) => Promise.resolve({ ok: true as const, data: data as T });

export function actionsMock(overrides: Record<string, unknown> = {}) {
  return new Proxy(overrides, {
    get: (target, key) => {
      // Not a promise, and nothing for the module system's own lookups
      if (typeof key !== "string" || key === "then" || key === "__esModule" || key === "default") {
        return undefined;
      }
      if (!(key in target)) {
        target[key] = vi.fn(() => ok());
      }
      return target[key];
    },
    has: (_, key) => typeof key === "string" && key.endsWith("Action"),
  });
}
