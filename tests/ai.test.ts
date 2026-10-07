import { test, expect, vi, afterEach } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { generateDraft, SYSTEM_PROMPT } from '../server/openai'
import { makeAiCourse } from '../src/lib/aiCourse'
import { useCourseStore } from '../src/store/courseStore'
import { checkCourse } from '../src/export/courseCheck'
import BlockPreview from '../src/preview/BlockPreview'
import { I18nProvider } from '../src/i18n/I18nProvider'
import { fixture } from './fixtures/aiDraft'

afterEach(() => vi.unstubAllGlobals())
const input = { material: 'Communication training', audience: 'Employees', length: 'Short', language: 'en' }
test('one structured OpenAI request maps to editable draft and all existing preview block renderers', async () => {
  vi.stubGlobal('localStorage', { getItem: () => 'en' })
  const request = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(fixture) }] }] })))
  const draft = await generateDraft(input, 'server-only-test-key', request)
  expect(request).toHaveBeenCalledTimes(1)
  const sent = JSON.parse(request.mock.calls[0]![1]!.body as string)
  expect(sent.text.format.type).toBe('json_schema')
  expect(sent.text.format.strict).toBe(true)
  expect(sent.store).toBe(false)
  expect(sent.instructions).toBe(SYSTEM_PROMPT)
  const hostile = structuredClone(draft)
  hostile.lessons[0].blocks[1].text = '<script>alert(1)</script>'
  const safe = makeAiCourse(hostile).lessons[0].blocks[1]
  expect(safe.type === 'paragraph' && safe.data.html).toContain('&lt;script&gt;')
  const course = makeAiCourse(draft)
  expect(checkCourse(course)).toEqual([])
  expect(course.lessons.every(l => l.status === 'draft')).toBe(true)
  expect(makeAiCourse(draft).id).not.toBe(course.id)
  useCourseStore.getState().loadCourse(course)
  useCourseStore.getState().updateCourseMeta({ title: 'Edited by HR' })
  expect(useCourseStore.getState().course.title).toBe('Edited by HR')
  for (const block of [...course.intro!.blocks!, ...course.lessons.flatMap(l => l.blocks)]) {
    const html = renderToStaticMarkup(createElement(I18nProvider, null, createElement(BlockPreview, { block })))
    expect(html.length).toBeGreaterThan(0)
    expect(html).not.toContain('<script>')
  }
})
test('invalid output and upstream errors leave the current course untouched', async () => {
  const original = useCourseStore.getState().course
  for (const invalid of [{}, { ...fixture, questions: [{ ...fixture.questions[0], correctIndex: 3 }, fixture.questions[1]] }, { ...fixture, lessons: [{ title: 'Bad', blocks: [{ type: 'video' }] }] }]) expect(() => makeAiCourse(invalid)).toThrow()
  await expect(generateDraft(input, 'test', async () => new Response('{}', { status: 429 }))).rejects.toThrow('QUOTA')
  await expect(generateDraft(input, '')).rejects.toThrow('CONFIG')
  await expect(generateDraft(input, 'test', async () => new Response(JSON.stringify({ status: 'incomplete', output: [] })))).rejects.toThrow('INCOMPLETE')
  expect(useCourseStore.getState().course).toBe(original)
})
