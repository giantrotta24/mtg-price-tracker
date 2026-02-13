# MTG Price Tracker

A personal Magic: The Gathering singles price tracker scaffold.

## Current Scope

This repository is currently **scaffold-only**:

- Next.js + TypeScript + Tailwind app initialized
- Basic hello-world homepage
- Health endpoint at `/api/health`
- Baseline test setup with Vitest + React Testing Library
- MVP product plan captured in `docs/mvp-slice1-plan.md`

No product features are implemented yet.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Vitest + React Testing Library
- pnpm

## Local Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
pnpm lint
pnpm test:ci
pnpm build
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill values as needed for future integrations.

```bash
cp .env.example .env.local
```

## License

MIT. See `LICENSE`.
