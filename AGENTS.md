# Repository Guidelines

## Project Structure & Module Organization
- `src/main.tsx` wires global providers (React Query, Auth, Router) and mounts the app.
- `src/pages/**` holds feature flows grouped by role (admin, franchisee, customer); `src/components` keeps shared UI (shadcn components under `ui/`) and domain widgets.
- Domain logic lives in `src/lib`, `src/services`, `src/context`, `src/hooks`, and `src/utils`; keep Supabase DTOs in `src/types`.
- `supabase/functions/*` contains Deno edge functions deployed to Supabase; `supabase/migrations` and the root SQL files manage schema updates.
- Static assets reside in `public/`, with Vite configuration and Tailwind settings at the repo root.

## Build, Test, and Development Commands
- `npm install` – install dependencies defined in `package.json`.
- `npm run dev` – start the Vite dev server with HMR on `http://localhost:5173`.
- `npm run build` – produce the production bundle in `dist/`; run before publishing.
- `npm run build:dev` – generate a development-mode bundle for staging smoke tests.
- `npm run lint` – execute ESLint (TypeScript + React Hooks rules); fix issues before committing.
- `npm run preview` – serve the `dist/` output locally to verify a release build.

## Coding Style & Naming Conventions
- TypeScript-first: export typed interfaces for Supabase payloads and component props.
- Use the `@/` alias for internal imports; reserve relative paths for nearby files.
- Components/pages follow `PascalCase.tsx`; hooks `useThing.ts`; utilities/constants `camelCase.ts` or `UPPER_CASE.ts`.
- Prefer Tailwind utility classes; limit custom CSS to `App.css` and `index.css`.
- Maintain 2-space indentation and run `npm run lint` (or save-format in your editor) before each commit.

## Testing Guidelines
- Automated tests are not yet configured; linting plus targeted manual verification is the current baseline.
- When adding tests, colocate Vitest/React Testing Library specs under `src/__tests__` or beside the component (`Component.test.tsx`).
- Cover auth guards, scheduling flows, and Supabase edge-function calls; mock network requests via MSW or lightweight stubs.
- Document manual QA steps in pull requests when no automated coverage exists.

## Commit & Pull Request Guidelines
- Keep commits small and present-tense (e.g., `add scheduling guard`, `refine franchisee form`), mirroring the existing concise history.
- Reference affected routes/services in descriptions and call out schema or Supabase function changes explicitly.
- Pull requests should include a goal-oriented summary, tested commands checklist, screenshots/GIFs for UI updates, and linked issues or Supabase migrations.
- Request review from the relevant domain owner (admin/franchisee/customer) whenever touching their surface area.

## Supabase & Configuration
- Runtime requires `.env` values for Supabase keys and agent credentials; obtain the latest template from the maintainer before running locally.
- Use `supabase functions serve <name>` for local edge-function debugging and keep schema changes in `supabase/migrations` rather than ad-hoc SQL.
- Regenerate typed Supabase clients with `npx supabase gen types typescript --project-id <id> > src/types/database.ts` whenever the database evolves.
