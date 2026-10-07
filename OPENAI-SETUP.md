# Minimal OpenAI draft generation

Requires Node 22.12+ (Node 24 recommended), npm, and a OpenAI API key with API access/quota. No new dependencies. ChatGPT Plus does not supply OpenAI API quota.

```bash
npm ci
# Paste your key into the included .env file first.
npm run dev:ai
```

Open http://localhost:5173 and choose **Generate with AI ✨** on the welcome screen. Paste text, select audience/length, and Generate Draft. Successful drafts open in the existing editor. Download the project from the existing no-folder banner to retain it; generation initially opens in memory. Existing folder creation/autosave is unchanged. The header shortcut was intentionally omitted to keep this change small and avoid replacing a currently open course.

Production:

```bash
npm run build
npm start
```

The server binds to 127.0.0.1:5173 by default. PORT changes the port; HOST changes the bind address. For company hosting use the existing internal network/reverse proxy access controls and HTTPS. This beta has no authentication: anyone with access to the API endpoint can consume its OpenAI quota. Static-only hosting still supports manual authoring but cannot run AI; use this Node process for AI. `npm run dev` remains the original manual-only Vite command.

OPENAI_API_KEY is read only by server/index.ts at request time. Never prefix it with VITE_, embed it in frontend code, or commit it. Optional server-only OPENAI_MODEL overrides the default gpt-4.1-mini; use a model supporting JSON schema . No automatic retries: one OpenAI request per click. Short requests 3 content lessons and 2 questions; Standard requests 5 content lessons and 4 questions, with a final knowledge-check lesson appended locally. Server and client validate the content response. IDs, Ocean theme, draft status, intro blocks, defaults and quiz blocks are assigned by the app. No model-generated HTML, assets or export machinery is accepted.

The dialog discloses sending submitted text to Google OpenAI. No generation history or server persistence is added. Closing the dialog cancels client loading; an already-issued provider request may still incur usage.

## Verification

- Production build passes.
- 147 tests pass; 4 upstream tests skipped.
- Existing manual create/edit/save/reopen workflow and HR sample tests pass.
- Mocked OpenAI response verifies one structured request, validation, locally generated IDs, editable store state and existing preview renderer output.
- Invalid output/API errors leave the current course unchanged.
- The actual unchanged exporter generates SCORM 1.2 from the AI fixture; package contents and manifest are checked.
- Building with a sentinel OPENAI_API_KEY confirms the secret and provider request code are absent from dist.
- Production HTTP smoke test: app 200, missing-key API 503, server source/.env paths 404.
- No live OpenAI key was available. Live model generation, visual browser interaction and Enthral launch/completion/score/resume remain unverified.

## Files changed

New: server/index.ts, server/openai.ts, shared/aiDraft.ts, src/lib/aiCourse.ts, src/components/ai/GenerateDialog.tsx, src/i18n/locales/ai.ts, tests/ai.test.ts, tests/aiExport.test.ts, tests/fixtures/aiDraft.ts, OPENAI-SETUP.md.

Updated: src/components/Builder.tsx, src/components/welcome/WelcomeScreen.tsx, src/i18n/dictionary.ts, src/i18n/locales/welcome.ts, package.json, tsconfig.json, .gitignore.

No changes to src/export, course types/store, themes, HR sample factory or player.

The included .env contains an empty OPENAI_API_KEY field. Paste your key after the equals sign and restart the server. Both npm run dev:ai and npm start load this file automatically. Existing exported shell variables take precedence; run `unset OPENAI_API_KEY` once if you previously exported an old key. Keep .env private; it is ignored by Git and never served by the production server.

## PDF input

Generate with AI now includes Upload PDF. PDF.js extracts text locally into the existing editable source field, replacing its previous contents only after successful extraction. Review reading order and content before Generate Draft. Only that text is submitted to OpenAI; there is still one model request per generation.

Limits: 10 MB, 50 pages, 20,000 extracted characters. Larger documents are rejected without silently truncating. Scanned/image-only PDFs require OCR first; password-protected or damaged PDFs show an error. Images, diagrams and layout are not imported. Manual pasted text still works.

PDF.js 5.6.205 compatibility build, fonts and character maps are bundled under public/vendor/pdfjs with its Apache-2.0 license; no CDN is used. Verification: 149 tests passed, 4 upstream skipped, production build passed. Includes actual PDF text extraction plus empty/oversized/long-input checks. Visual browser QA and live OpenAI remain unverified here.
