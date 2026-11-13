export const AUTH_SECRET = "e2e-super-secret-key-for-tests-only-0123456789abcdef";
export const MOCK_PORT = 4106;
export const APP_PORT = 3106;
export const BASE_URL = `http://localhost:${APP_PORT}`;
export const MOCK_URL = `http://localhost:${MOCK_PORT}`;

/**
 * The sample spexare the mock backend adds to every spex page, as Spexregister would answer: visitors see a published
 * spexare's nickname only, and nothing of one without a nickname; members see the names too.
 */
export const PEOPLE = [
  { nickname: "Kalle Kula", name: "Karl Kulsson" },
  { nickname: "Fia", name: "Sofia Fiasson" },
  { nickname: null, name: "Hemlig Hemligsson" },
] as const;
