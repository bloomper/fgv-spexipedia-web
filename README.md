# fgv-spexipedia-web

The web of Spexipedia, FGV's encyclopedia of the Chalmers spex: Next.js 16, React 19, next-intl, urql with GraphQL
codegen, Better Auth with Keycloak, Tailwind and shadcn. See `AGENTS.md` for how it is organised and
`fgv-spexipedia-spec` for what it does.

## Running locally

1. Start `fgv-infra-deploy`'s local stack (Keycloak, Caddy) and `fgv-spexipedia-server` (API on 8088, media on 8089).
2. Create `.env.local` with the secrets:

   ```
   AUTH_SECRET=<random>
   KEYCLOAK_CLIENT_ID=fgv-spexipedia
   KEYCLOAK_CLIENT_SECRET=<from fgv-infra-deploy/secrets/clients/fgv-spexipedia>
   BETTER_AUTH_URL=http://localhost:3006
   API_GRAPHQL_ENDPOINT=http://localhost:8088/api/graphql
   API_ENDPOINT=http://localhost:8088
   MEDIA_ORIGIN=http://localhost:8089
   KEYCLOAK_ISSUER=https://auth.fgv.local.nu:8443/auth/realms/fgv
   SPEXREGISTER_WEB_URL=http://localhost:3000
   ```

3. `npm install`, then `npm run dev` and open http://localhost:3006.

The sample users (`admin@fgv.nu`, `editor@fgv.nu`, `author@fgv.nu`, `user@fgv.nu`) come from the server's sample data.

## Checks

`npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`. After a schema change in the server run
`npm run gql-codegen` and commit `src/gql/`.
