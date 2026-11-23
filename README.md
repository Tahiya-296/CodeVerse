# CodeVerse

CodeVerse is a multi-language online compiler project for C, C++, and Java. This repository currently contains the initial frontend application scaffold; the editor and execution features will be added in later project work.

## Frontend stack

- React
- TypeScript
- Vite
- npm

## Requirements

- Node.js 20.19+ or 22.12+
- npm (included with Node.js)

## Local development

From the repository root, install dependencies and start Vite:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build

```sh
npm run build
npm run preview
```

The production files are written to `dist/`. `npm run preview` serves that build locally for a final check.

## Project structure

```text
src/
  components/   Shared UI components
  App.tsx        Initial CodeVerse homepage
  main.tsx       React application entry point
  styles.css     Global styles and responsive layout
index.html       Vite HTML entry
vite.config.ts   Vite and React plugin configuration
```
