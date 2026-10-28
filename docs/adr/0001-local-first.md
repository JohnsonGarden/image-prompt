# ADR-0001: Local-first, manual ChatGPT handoff

**Status:** Accepted (2026-10-28)

## Context

The primary user has a ChatGPT Plus subscription but no paid image-generation API. ChatGPT Plus and official API usage are billed separately; arbitrary third-party apps must not assume ChatGPT OAuth gives access to image-generation quotas. The useful first product is a visual structured prompt builder, not a hidden model relay.

## Decision

Ship a static React/TypeScript/Vite UI with a pure deterministic prompt compiler and versioned browser localStorage. Provide a copy action plus an explicit `chatgpt.com` external link. Do not accept credentials, call AI APIs, or automatically upload images. All current bundled templates are original. Use Vitest and GitHub Actions on every pull request.

## Consequences

Pros: no user API expenditure, fast startup, easy deployment, no server-held credentials, straightforward TDD.

Cons: manual ChatGPT handoff, no model selection guarantee, browser-data loss risk, no cloud sync, prompt quality requires future measured A/B studies.

## Revisit when

The user explicitly elects an official paid API integration, or needs durable export/import and local image asset management. Those must not degrade no-API operation.
