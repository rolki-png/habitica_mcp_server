# Agent notes

Habitica MCP server in TypeScript. Run these before pushing:

- `npm ci`
- `npm run lint`
- `npm run build`
- `npm test`

The `ci` workflow runs the same four commands on pull requests and on pushes to `main`.

The server needs `HABITICA_USER_ID` and `HABITICA_API_TOKEN` to start. Tests must not call the real Habitica API, so stub `globalThis.fetch` as `src/habiticaClient.test.ts` does.
