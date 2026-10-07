import { test, expect, vi, afterEach } from 'vitest'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { useCourseStore } from '../src/store/courseStore'
import { createNewProject, openExistingProject, saveProject } from '../src/lib/projectService'
import { makeHrCourse } from '../src/lib/hrTemplate'
import { checkCourse } from '../src/export/courseCheck'

vi.mock('../src/lib/recentProjects', () => ({ rememberRecentProject: vi.fn(), listRecentProjects: async () => [] }))
vi.mock('../src/hooks/useRoute', () => ({ navigate: vi.fn() }))
afterEach(() => vi.unstubAllGlobals())

test('create, edit content, reorder, delete, theme, save and reopen keep the course intact', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'hr-studio-'))
  const handle = {
    name: 'HR acceptance', kind: 'directory', queryPermission: async () => 'granted',
    getFileHandle: async (name: string, options?: { create?: boolean }) => {
      const path = join(dir, name)
      if (!options?.create) {
        try { await readFile(path) } catch { throw new DOMException('Missing file', 'NotFoundError') }
      }
      return { getFile: async () => ({ text: () => readFile(path, 'utf8') }), createWritable: async () => ({ write: (data: string) => writeFile(path, data), close: async () => {} }) }
    }
  }
  vi.stubGlobal('window', { location: { hash: '#/app/test' }, showDirectoryPicker: async () => handle })
  try {
    await createNewProject()
    let s = useCourseStore.getState()
    const lesson = s.course.lessons[0].id
    s.updateCourseMeta({ title: 'Employee learning', description: 'Objectives: find support and follow approved guidance.' })
    for (const kind of ['paragraph', 'image', 'video', 'quiz'] as const) s.addBlock(lesson, kind)
    s = useCourseStore.getState()
    const [text, image, video, quiz] = s.course.lessons[0].blocks
    s.updateBlockData(lesson, text.id, { html: '<p>Welcome to your first week.</p>' })
    s.updateBlockData(lesson, image.id, { src: 'assets/images/example.png', alt: 'Training example' })
    s.updateBlockData(lesson, video.id, { src: 'assets/videos/example.mp4', transcript: 'Example training transcript' })
    s.updateBlockData(lesson, quiz.id, { passingScore: 80, questions: [{ id: 'q', type: 'single', prompt: 'Who can clarify role priorities?', options: [{ id: 'a', text: 'Your manager', correct: true }, { id: 'b', text: 'An unrelated supplier', correct: false }] }] })
    s.moveBlock(lesson, 3, 0)
    expect(useCourseStore.getState().course.lessons[0].blocks[0].type).toBe('quiz')
    s.deleteBlock(lesson, image.id)
    expect(useCourseStore.getState().course.lessons[0].blocks).toHaveLength(3)
    s.undo()
    s.setTheme('mono')
    s.setPreviewOpen(true)
    expect(useCourseStore.getState().previewOpen).toBe(true)
    await saveProject()
    const expected = structuredClone(useCourseStore.getState().course)
    expect(useCourseStore.getState().saveState).toBe('saved')
    expect(JSON.parse(await readFile(join(dir, 'project.json'), 'utf8'))).toEqual(expected)
    s.closeProject()
    await openExistingProject()
    expect(useCourseStore.getState().course).toEqual(expected)
    await expect(createNewProject()).rejects.toThrow('EXISTING_COURSE')
    expect(JSON.parse(await readFile(join(dir, 'project.json'), 'utf8'))).toEqual(expected)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('HR starter has a valid assessment and no pre-export warnings in either UI language', () => {
  for (const lang of ['en', 'uk'] as const) {
    const course = makeHrCourse(lang)
    expect(checkCourse(course)).toEqual([])
    expect(course.lessons).toHaveLength(3)
    expect(course.intro?.blocks?.length).toBeGreaterThan(0)
  }
})
