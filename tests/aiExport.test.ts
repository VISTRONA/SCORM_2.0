import { test, expect, vi } from 'vitest'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import JSZip from 'jszip'
import { exportScorm } from '../src/export/exportScorm'
import { useCourseStore } from '../src/store/courseStore'
import { makeAiCourse } from '../src/lib/aiCourse'
import { fixture } from './fixtures/aiDraft'

test('exports the generated AI course through the SCORM 1.2 exporter', async () => {
  let result: Blob | undefined
  vi.stubGlobal('fetch', async (url: string) => {
    try { return new Response(await readFile('public/' + url.replace(/^\//, ''))) }
    catch { return new Response('', { status: 404 }) }
  })
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => { result = blob as Blob; return 'blob:beta' })
  vi.stubGlobal('document', { body: { appendChild() {} }, createElement: () => ({ click() {}, remove() {}, href: '', download: '' }) })
  const timer = globalThis.setTimeout
  vi.stubGlobal('setTimeout', (fn: () => void, ms: number) => ms === 60000 ? 0 : timer(fn, ms))
  try {
    useCourseStore.getState().loadCourse(makeAiCourse(fixture))
    const filename = await exportScorm('1.2')
    expect(result).toBeDefined()
    const bytes = Buffer.from(await result!.arrayBuffer())
    const zip = await JSZip.loadAsync(bytes)
    const manifest = await zip.file('imsmanifest.xml')!.async('string')
    expect(manifest).toContain('<schemaversion>1.2</schemaversion>')
    expect(manifest).toContain('adlcp:scormtype="sco"')
    for (const file of ['index.html', 'player.js', 'player.css', 'scorm.js', 'course-data.js']) expect(zip.file(file)).not.toBeNull()
    await mkdir('artifacts', { recursive: true })
    await writeFile('artifacts/AI-' + filename, bytes)
    await writeFile('artifacts/AI-project.json', JSON.stringify(useCourseStore.getState().course, null, 2))
    expect(await zip.file('LICENSE.txt')!.async('string')).toContain('Copyright (c) 2026 Dmytro Matsiuk')
  } finally { vi.unstubAllGlobals(); vi.restoreAllMocks() }
})
