# CodeVerse backend

Member 2 backend work for the existing React and Vite application. The backend will use Vercel serverless functions and Judge0; submitted source code will never run inside the CodeVerse Node.js process.

## Architecture

- `api/execute.js` accepts the workspace's current `language`, `sourceCode`, and `input` fields and creates a Judge0 submission.
- `api/submissions/[token].js` retrieves one submission result so clients can poll while Judge0 processes it.
- `member-2/services/` contains Judge0 HTTP integration.
- `member-2/utils/` contains language mapping and request validation.
- `member-2/tests/` contains backend tests that can mock Judge0.
- `member-2/docs/API_CONTRACT.md` defines the frontend-facing contract.

The frontend uses `c`, `cpp`, and `java` language identifiers. Its Run handler sends `language`, `sourceCode`, and `input`, then polls by token and updates the existing result state. The stdin and output/error panels remain in `src/components/CompilerWorkspace.jsx`.

## Environment

Configure these server-side Vercel environment variables for the selected Judge0 provider:

- `JUDGE0_API_URL`: base URL for the Judge0 API, including any required `/api` path.
- `JUDGE0_API_KEY`: provider API key, if required.
- `JUDGE0_API_HOST`: provider host header, if required.
- `JUDGE0_LANGUAGE_C`, `JUDGE0_LANGUAGE_CPP`, `JUDGE0_LANGUAGE_JAVA`: IDs from the configured instance's language listing.

Only set credentials required by your provider. Never add secrets to Vite variables or client code. Confirm language ID variables against the configured instance's language listing before use. No Judge0 URL or credentials are configured in this repository, so no IDs are assumed and live connectivity has not been claimed.

Copy `.env.example` to `.env.local` for local server-side configuration. Local `.env*` files are ignored by Git. Do not commit them.

## Local development

Vite alone does not serve Vercel `/api` functions. Install/use the Vercel CLI and run `npx vercel dev` from the repository root to exercise the Vercel functions with the Vite frontend. `npm run dev` remains the frontend-only workflow. Provide server-side settings through Vercel environment variables or a local `.env.local` file (never a `VITE_` variable).

## API and testing

Read [the API contract](docs/API_CONTRACT.md) for request, polling, result, and error shapes. Run `npm test` for dependency-free tests with mocked Judge0 responses; these do not prove live provider connectivity. Live checks require valid server-side provider configuration.

## Deployment

Deploy the repository through Vercel with the root directory set to this project. Add the required Judge0 variables in Vercel's server-side Environment Variables settings for each target environment. Vercel discovers functions under the root `api/` directory; the frontend and Vite build remain in their current locations.
