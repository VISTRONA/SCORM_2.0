# HR-SCORM Studio — Kirloskar HR/L&D beta

A local-first web course authoring beta built on [Scormly](https://github.com/dmmat/Scormly).
Upstream revision: `da60742b99428ed0276b22f21857eb0e9c5051b9`.
The original MIT copyright/license is preserved in `LICENSE`, the About / Legal screen,
and exported SCORM packages. This is a customized fork, not an independently written SCORM engine.

## Run

Use Node.js 22.12+ and Chrome or Edge.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. Use `npm run dev -- --host 127.0.0.1` if
an environment prevents network-interface enumeration.

## Build and host

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Serve **the contents of `dist/`** at the root of an HTTPS static site.
There is no server application or database. Do not open `dist/index.html` through
`file://`; exporting fetches the bundled player files. Keep `scorm-player/` intact.
HTTPS (or localhost) and a Chromium browser are needed for folder-based saving.
The included `dist/` is a prebuilt production build; no build is needed to host it.

## Demo flow

1. Select **New Course** and choose an empty local folder; alternatively select
   **Use onboarding starter** to create an editable example in a folder.
2. Open **Course Details**, edit the title/description, and set completion/scoring.
   Learning objectives can be authored as content on the cover or first lesson.
3. **Add Content** for text, image, uploaded video, embedded video or a quiz.
   Drag handles reorder content and lessons; content actions support editing,
   duplication and deletion with undo.
4. Select **Appearance** for an existing course theme. More layout/typography
   options are available in Course Details.
5. Use **Preview**, then **Save**. The saved indicator refers to the selected folder.
6. Select **Export for LMS → SCORM 1.2**. Fix pre-export warnings before assigning
   training. Import the resulting ZIP into your LMS.
7. Keep a **course backup ZIP** from the course menu. To reopen a backup, extract it
   into a folder, then choose Open Course. An LMS SCORM ZIP is a different artifact.

The **Explore employee onboarding** option is an unsaved in-memory preview.
It explicitly warns about losing edits; download a backup before closing it.
The starter content is illustrative and requires HR review before use.

## What changed

- Direct entry to authoring; removed upstream marketing prerender/custom domain.
- HR-SCORM Studio branding, navy/blue workspace styling, corporate welcome screen.
- HR vocabulary, Course Details, Add Content, Appearance and Export for LMS.
- Editable three-lesson onboarding starter with objectives and an assessment.
- Ocean as the default; all existing themes remain available.
- Accessible About / Legal with original MIT notice; notice also ships with player exports.
- New Course refuses to overwrite an existing `project.json`.

The course JSON schema, rich content editors, preview renderer, SCORM runtime,
asset storage and packaging algorithms are retained. The only export change is
including the upstream license file. No AI, accounts, backend, collaboration or
enterprise deployment infrastructure has been added.

## Verification and remaining gates

`npm run build` passes. `npm test`: **144 passed, 4 skipped** (13 files).
Additional tests exercise course creation, text/image/video/quiz edits, reorder,
delete/undo, theme changes, saving to temporary files, reopening, overwrite
protection, valid onboarding content and the actual SCORM 1.2 export function.
File-picker and permission APIs are simulated for these tests. Media playback,
real OS folder selection and visual UI interactions are not proven by them.
Upstream tests use mock LMS APIs to check scoring, completion and suspend/resume.

Browser QA could not complete: the cloud browser refused the preview URL and
local Chromium installation failed. **Visual layout, full browser workflow and
Enthral compatibility remain unverified.** A production build is not LMS certification.
There is a nonblocking Vite chunk-size warning (~832 kB JS before gzip).

Before the industry demonstration, test on Chrome/Edge: create a folder course,
upload an image and video, edit a quiz, reorder, save/reopen, preview and export.
On Enthral, verify launch, pass/fail score, completion and resume after closing
and relaunching. Use nonconfidential test content for this first check.

Local-first means no shared course library or cross-device synchronization.
External embedded videos require provider/network access. Prefer uploaded media
for an offline LMS demonstration. No live deployment or GitHub fork was published.

See `docs/UPSTREAM_README.md` for upstream documentation.
