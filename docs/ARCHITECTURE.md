# Architecture & quality gates

```text
src/App.tsx                       React UI + browser-only persistence
  ├─ src/domain/schema.ts         Canonical prompt project schema (Zod)
  ├─ src/domain/templates.ts      Original starter templates & defaults
  ├─ src/domain/compile.ts        Deterministic GPT Images prompt compiler
  └─ src/domain/storage.ts        Versioned localStorage boundary
```

No provider, login or image API call occurs in the MVP. The prompt compiler does not need React, network or browser APIs and can be unit tested as a pure function. Model-specific adapters may be introduced later after measurable quality evidence, not before.

## Harness / PR quality gate

1. Update `docs/PRD.md` and create a focused acceptance example.
2. Implement or update domain-level tests first.
3. Keep `schema.ts` as the sole project shape and validate untrusted local storage.
4. Ensure `npm test`, `npm run typecheck`, and `npm run build` pass.
5. Manual browser smoke test (desktop + mobile): open template → edit → preview → copy → save → reload → reopen → delete. Add screenshot to PR when a browser session is available.
6. Never include OpenAI API keys, tokens, ChatGPT cookies, unofficial subscription relays or private reference images in fixtures or committed assets.

## Design constraints

- UTF-8 Chinese-native output is intentional for ChatGPT text prompt handoff.
- Fields with no values should not produce empty sections.
- Reference role metadata is text only; no user images are retained.
- Versioned schema uses `{version: 1}`. If changing shape, add migration tests before bumping version.
- All code compiles under TypeScript `strict` and no unused locals.
