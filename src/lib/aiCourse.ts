import { validateDraft } from '../../shared/aiDraft'
import type { Block, Course } from '../types/course'
import { DEFAULT_COURSE_SETTINGS } from '../types/course'
import { uid } from './id'
import { translate } from '../i18n/I18nProvider'
import type { Language } from '../i18n/types'

// Escape every model string used as rich text; the model never supplies markup.
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
export function makeAiCourse(input: unknown, language: Language = 'en'): Course {
  const draft = validateDraft(input)
  const heading = (text: string): Block => ({ id: uid('block'), type: 'heading', settings: {}, data: { level: 2, text } })
  return {
    id: uid('course'), title: draft.title, description: draft.description, theme: 'ocean',
    settings: { ...DEFAULT_COURSE_SETTINGS, contentLanguage: language },
    intro: { enabled: true, layout: 'minimal', showOutline: true, blocks: [heading(translate('ai', 'objectives')), { id: uid('block'), type: 'list', settings: {}, data: { ordered: false, items: draft.objectives } }] },
    lessons: [...draft.lessons.map(lesson => ({ id: uid('lesson'), title: lesson.title, status: 'draft' as const, blocks: lesson.blocks.map((block): Block => {
      const base = { id: uid('block'), settings: {} }
      switch (block.type) {
        case 'heading': return heading(block.text)
        case 'paragraph': return { ...base, type: 'paragraph', data: { html: `<p>${escape(block.text)}</p>` } }
        case 'list': return { ...base, type: 'list', data: { ordered: false, items: block.items } }
        case 'note': return { ...base, type: 'note', data: { variant: 'note', text: block.text } }
      }
    }) })), { id: uid('lesson'), title: translate('ai', 'knowledge'), status: 'draft', blocks: [heading(translate('ai', 'knowledge')), { id: uid('block'), type: 'quiz', settings: {}, data: { passingScore: DEFAULT_COURSE_SETTINGS.passingScore, showAnswers: true, questions: draft.questions.map(q => ({ id: uid('q'), type: 'single', prompt: q.prompt, feedback: q.feedback, options: q.options.map((text, i) => ({ id: uid('a'), text, correct: i === q.correctIndex })) })) } }] }],
  }
}
