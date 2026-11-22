// A stand-in for Spexipedia Server and Keycloak in E2E tests: GraphQL with what the real server answered visitors for
// its sample data (recorded.json), and a mini-Keycloak (discovery, authorize, token, JWKS, userinfo, logout).
//
// People come from Spexregister, which the recording did not have: the mock adds the sample spexare in constants.ts to
// every spex page (the board, a task, a character's actor, a number's lyrics credits) as the server would answer: for visitors
// the nickname of each spexare who has one and nothing else, for members (USER) names, ids and Spexregister links too.
//
// What the recording cannot hold (articles and their revisions, the admin lists, settings, kinds, the change log, the
// trash, search beyond the recorded query) is kept in mock-live.mjs, seeded from the recording and checked by role.
//
// With MOCK_RECORD_FROM set (the local API with sample data), queries are passed on without a token and the answers
// recorded; rerun the tests without it to replay them.

import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { answerLive, failNext, patchSpexPage, patchStartPage, reset, seedFrom, snapshot } from "./mock-live.mjs";

const PORT = Number(process.env.MOCK_PORT || 4106);
const ISSUER = `http://localhost:${PORT}/realms/fgv`;
const CLIENT_ID = "fgv-spexipedia";
const KID = "e2e-key";
const TOKEN_TTL = 3600;
const RECORD_FROM = process.env.MOCK_RECORD_FROM || "";
const RECORDED = new URL("./recorded.json", import.meta.url);

// The same as e2e/constants.ts
const PEOPLE = [
  { nickname: "Kalle Kula", name: "Karl Kulsson" },
  { nickname: "Fia", name: "Sofia Fiasson" },
  { nickname: null, name: "Hemlig Hemligsson" },
];

const PERSONAS = {
  admin: { sub: "p-admin", name: "Sara Admin", email: "sara.admin@example.org", roles: ["USER", "AUTHOR", "EDITOR", "ADMIN"] },
  editor: { sub: "p-editor", name: "Erik Redaktör", email: "erik@example.org", roles: ["USER", "EDITOR"] },
  author: { sub: "p-author", name: "Anna Författare", email: "anna@example.org", roles: ["USER", "AUTHOR"] },
  member: { sub: "p-member", name: "Tina Tittare", email: "tina@example.org", roles: ["USER"] },
  noaccess: { sub: "p-noaccess", name: "Nils Nekad", email: "nils@example.org", roles: [] },
};
const bySub = Object.fromEntries(Object.values(PERSONAS).map(persona => [persona.sub, persona]));
let currentPersona = "member";

const recorded = existsSync(RECORDED) ? JSON.parse(readFileSync(RECORDED, "utf8")) : {};

seedFrom(recorded);

const isMember = persona => Boolean(persona?.roles.includes("USER"));

function personaOf(req) {
  const token = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return bySub[payload.sub] ?? null;
  } catch {
    return null;
  }
}

const operationNameOf = query => /\b(?:query|mutation)\s+([A-Za-z0-9_]+)/.exec(query)?.[1] ?? null;

/** A stable key for an operation and its variables. */
function keyOf(op, variables) {
  const sorted = Object.fromEntries(Object.entries(variables ?? {}).sort(([a], [b]) => a.localeCompare(b)));

  return `${op} ${JSON.stringify(sorted)}`;
}

// --- People, as the server shows them --------------------------------------------------------------------------------

const personFor = (persona, person, index) => isMember(persona)
  ? { id: `spexare-${index + 1}`, nickname: person.nickname, name: person.name, url: null }
  : { id: null, nickname: person.nickname, name: null, url: null };

/** The sample spexare the viewer may see: visitors only those with a nickname. */
const visiblePeople = persona => PEOPLE.map((person, index) => ({ person, index }))
  .filter(({ person }) => isMember(persona) || person.nickname)
  .map(({ person, index }) => personFor(persona, person, index));

function withPeople(persona, spex) {
  const production = { id: spex.id, year: spex.year, revival: spex.revival ?? false };
  const people = visiblePeople(persona);

  if (spex.people) {
    spex.people = {
      ...spex.people,
      available: true,
      board: [{ spex: production, task: { id: "task-chair", name: "Ordförande" }, people: people.slice(0, 1) }],
      tasks: [{ spex: production, task: { id: "task-kapellmastare", name: "Kapellmästare", category: { id: "cat-orkester", name: "Orkester" } }, people: people.slice(1) }],
    };
  }
  if (spex.characters?.length) {
    spex.characters[0] = { ...spex.characters[0], playedBy: people.map(person => ({ person, spex: production })) };
  }
  if (spex.numbers?.length) {
    // The number's lyrics credits, by spexare in Spexregister
    const lyrics = { id: "01900000-0000-7000-8000-000000000201", name: "Text" };

    spex.numbers[0] = {
      ...spex.numbers[0],
      credits: people.map((person, position) => ({ kind: lyrics, position, credit: { person, name: null, unresolved: false } })),
    };
  }
  return spex;
}

// --- GraphQL ---------------------------------------------------------------------------------------------------------

async function answer(op, payload) {
  const key = keyOf(op, payload.variables);

  if (RECORD_FROM) {
    const response = await fetch(RECORD_FROM, {
      method: "POST",
      headers: { "content-type": "application/json", "accept-language": "sv" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();

    if (!/^\s*mutation\b/.test(payload.query) && recorded[key] === undefined) {
      recorded[key] = json;
      writeFileSync(RECORDED, JSON.stringify(Object.fromEntries(Object.entries(recorded).sort(([a], [b]) => a.localeCompare(b))), null, 1) + "\n");
    }
    return structuredClone(json);
  }
  if (recorded[key] === undefined) {
    console.warn(`[mock-backend] not recorded: ${key}`);
    return { data: null, errors: [{ message: `Not recorded: ${key}`, extensions: { classification: "INTERNAL_ERROR" } }] };
  }
  return structuredClone(recorded[key]);
}

async function handleGraphql(req, body, res) {
  const payload = JSON.parse(body);
  const op = operationNameOf(payload.query || "");
  const persona = personaOf(req);
  // While recording, everything goes to the real server; otherwise the live state answers first
  const json = (!RECORD_FROM && answerLive(op, payload.variables, persona, recorded[keyOf(op, payload.variables)]))
    || await answer(op, payload);

  if (op === "StartPage") {
    patchStartPage(json, persona, req.headers["accept-language"]);
  }

  if (op === "SpexPage" && json.data?.spex) {
    patchSpexPage(json, req.headers["accept-language"]);
    json.data.spex = withPeople(persona, json.data.spex);
  }
  res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(json));
}

// --- OIDC ------------------------------------------------------------------------------------------------------------

const oidcConfig = {
  issuer: ISSUER,
  authorization_endpoint: `${ISSUER}/protocol/openid-connect/auth`,
  token_endpoint: `${ISSUER}/protocol/openid-connect/token`,
  userinfo_endpoint: `${ISSUER}/protocol/openid-connect/userinfo`,
  jwks_uri: `${ISSUER}/protocol/openid-connect/certs`,
  end_session_endpoint: `${ISSUER}/protocol/openid-connect/logout`,
  response_types_supported: ["code"],
  subject_types_supported: ["public"],
  id_token_signing_alg_values_supported: ["RS256"],
};

const { privateKey, publicKey } = await generateKeyPair("RS256", { extractable: true });
const publicJwk = { ...(await exportJWK(publicKey)), kid: KID, alg: "RS256", use: "sig" };
const pendingCodes = new Map();

const userClaims = persona => ({
  sub: persona.sub,
  name: persona.name,
  email: persona.email,
  email_verified: true,
  preferred_username: persona.email,
});

const signJwt = (persona, claims, audience) =>
  new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid: KID, typ: "JWT" })
    .setIssuer(ISSUER)
    .setSubject(persona.sub)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL}s`)
    .sign(privateKey);

function handleAuthorize(url, res) {
  const redirectUri = url.searchParams.get("redirect_uri");

  if (!redirectUri) {
    res.writeHead(400).end("missing redirect_uri");
    return;
  }

  const code = randomUUID();
  const target = new URL(redirectUri);

  pendingCodes.set(code, { nonce: url.searchParams.get("nonce"), persona: PERSONAS[currentPersona] });
  target.searchParams.set("code", code);
  if (url.searchParams.get("state")) {
    target.searchParams.set("state", url.searchParams.get("state"));
  }
  res.writeHead(302, { location: target.toString() }).end();
}

async function handleToken(body, res) {
  const params = new URLSearchParams(body);
  let pending = { nonce: null, persona: PERSONAS[currentPersona] };

  if (params.get("grant_type") === "authorization_code") {
    const code = params.get("code");

    if (!pendingCodes.has(code)) {
      res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: "invalid_grant" }));
      return;
    }
    pending = pendingCodes.get(code);
    pendingCodes.delete(code);
  }

  const { persona, nonce } = pending;

  res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({
    access_token: await signJwt(persona, {
      ...userClaims(persona),
      typ: "Bearer",
      azp: CLIENT_ID,
      resource_access: { [CLIENT_ID]: { roles: persona.roles } },
    }, "account"),
    id_token: await signJwt(persona, { ...userClaims(persona), ...(nonce ? { nonce } : {}) }, CLIENT_ID),
    refresh_token: `refresh-${randomUUID()}`,
    token_type: "Bearer",
    expires_in: TOKEN_TTL,
    scope: "openid profile email",
  }));
}

// --- Server ----------------------------------------------------------------------------------------------------------

const server = createServer((req, res) => {
  const chunks = [];

  req.on("data", chunk => chunks.push(chunk));
  req.on("end", () => handle(req, res, Buffer.concat(chunks).toString("utf8")).catch(error => {
    console.error(error);
    if (!res.headersSent) {
      res.writeHead(500).end();
    }
  }));
});

async function handle(req, res, body) {
  const url = new URL(req.url || "", `http://localhost:${PORT}`);
  const path = url.pathname;

  if (path.endsWith("/.well-known/openid-configuration")) {
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(oidcConfig));
  } else if (path.endsWith("/protocol/openid-connect/certs")) {
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ keys: [publicJwk] }));
  } else if (path.endsWith("/protocol/openid-connect/auth")) {
    handleAuthorize(url, res);
  } else if (path.endsWith("/protocol/openid-connect/token")) {
    await handleToken(body, res);
  } else if (path.endsWith("/protocol/openid-connect/userinfo")) {
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(userClaims(personaOf(req) ?? PERSONAS[currentPersona])));
  } else if (path.endsWith("/protocol/openid-connect/logout")) {
    res.writeHead(302, { location: url.searchParams.get("post_logout_redirect_uri") || `http://localhost:${PORT}/` }).end();
  } else if (req.method === "POST" && path === "/__reset") {
    currentPersona = "member";
    reset();
    res.writeHead(204).end();
  } else if (req.method === "POST" && path === "/__fail") {
    const { operation, classification } = JSON.parse(body);

    failNext(operation, classification);
    res.writeHead(204).end();
  } else if (req.method === "GET" && path === "/__state") {
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(snapshot()));
  } else if (req.method === "POST" && path === "/__persona") {
    const { persona } = JSON.parse(body);

    if (!Object.hasOwn(PERSONAS, persona)) {
      res.writeHead(400).end(`unknown persona ${persona}`);
      return;
    }
    currentPersona = persona;
    res.writeHead(204).end();
  } else if (req.method === "POST" && path.includes("/api/graphql")) {
    await handleGraphql(req, body, res);
  } else {
    // Images and anything else: not found, which the pages survive
    res.writeHead(404).end();
  }
}

server.listen(PORT, () => {
  console.log(`[mock-backend] listening on http://localhost:${PORT}${RECORD_FROM ? `, recording from ${RECORD_FROM}` : ""}`);
});
