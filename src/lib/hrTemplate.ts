import type { Block, Course } from '../types/course'
import { DEFAULT_COURSE_SETTINGS } from '../types/course'
import type { Language } from '../i18n/types'
import { uid } from './id'

/** Editable example, not an authoritative company policy. Uses the upstream schema. */
export function makeHrCourse(lang: Language = 'en'): Course {
  const t = (en: string, uk: string) => lang === 'uk' ? uk : en
  const heading = (text: string): Block => ({ id: uid('block'), type: 'heading', settings: {}, data: { level: 2, text } })
  const paragraph = (html: string): Block => ({ id: uid('block'), type: 'paragraph', settings: {}, data: { html } })
  const list = (items: string[]): Block => ({ id: uid('block'), type: 'list', settings: {}, data: { ordered: false, items } })
  return {
    id: uid('course'), title: t('Your first week', 'Ваш перший тиждень'),
    description: t('Employee onboarding · A practical introduction to your people, workplace and first-week priorities.', 'Адаптація працівників · Знайомство з командою, робочим місцем і пріоритетами першого тижня.'),
    theme: 'ocean',
    settings: { ...DEFAULT_COURSE_SETTINGS, contentLanguage: lang, passingScore: 80 },
    intro: { enabled: true, layout: 'minimal', eyebrow: t('EMPLOYEE ONBOARDING · 5 MIN', 'АДАПТАЦІЯ ПРАЦІВНИКІВ · 5 ХВ'), showOutline: true,
      blocks: [heading(t('What you will learn', 'Чого ви навчитеся')), list([
        t('Find the right people for help and support.', 'Знайти потрібних людей для підтримки.'),
        t('Plan your first-week conversations and learning.', 'Спланувати зустрічі й навчання першого тижня.'),
        t('Recognize when to ask for clarification before acting.', 'Визначити, коли потрібно попросити пояснення.')
      ])] },
    lessons: [
      { id: uid('lesson'), title: t('Welcome & connections', 'Вітання та знайомство'), status: 'draft', blocks: [
        heading(t('A confident start', 'Впевнений початок')),
        paragraph(t('<p>Your first week is about getting connected and asking questions. Meet your manager, agree on priorities and learn where to find reliable information.</p>', '<p>Познайомтеся з керівником, узгодьте пріоритети та дізнайтеся, де знайти надійну інформацію.</p>')),
        { id: uid('block'), type: 'note', settings: { background: 'soft' }, data: { variant: 'note', text: t('Example training content. HR should replace this guidance with approved company information before assigning the course.', 'Приклад навчального контенту. HR має замінити його затвердженою інформацією компанії.') } },
        list([t('Your manager: role expectations and priorities.', 'Ваш керівник: очікування та пріоритети.'),t('HR: onboarding questions and approved policies.', 'HR: адаптація та затверджені політики.'),t('IT support: accounts, devices and access.', 'ІТ-підтримка: облікові записи, пристрої та доступ.')])
      ] },
      { id: uid('lesson'), title: t('Your first-week checklist', 'План першого тижня'), status: 'draft', blocks: [
        heading(t('Make space to learn', 'Знайдіть час для навчання')),
        list([t('Confirm your reporting contact and work schedule.', 'Уточніть контактну особу та графік роботи.'),t('Complete the training assigned by HR.', 'Пройдіть навчання, призначене HR.'),t('Ask your manager which tasks you are authorized to perform.', 'Уточніть у керівника, які завдання ви можете виконувати.'),t('Schedule a short check-in at the end of the week.', 'Заплануйте коротку зустріч наприкінці тижня.')]),
        paragraph(t('<p><strong>Before you act:</strong> if a process is unclear, pause and ask your designated contact. Use approved guidance rather than assumptions.</p>', '<p><strong>Перед дією:</strong> якщо процес незрозумілий, зверніться до відповідальної особи. Користуйтеся затвердженими інструкціями.</p>'))
      ] },
      { id: uid('lesson'), title: t('Knowledge check', 'Перевірка знань'), status: 'draft', blocks: [
        heading(t('Ready for your first week?', 'Готові до першого тижня?')),
        { id: uid('block'), type: 'quiz', settings: {}, data: { passingScore: 80, showAnswers: true, questions: [
          { id: uid('q'), type: 'single', prompt: t('A task is unfamiliar and the instructions are unclear. What should you do first?', 'Завдання незнайоме, а інструкції незрозумілі. Що зробити спочатку?'), options: [
            { id: uid('a'), text: t('Ask the designated contact for clarification.', 'Попросити пояснення у відповідальної особи.'), correct: true },
            { id: uid('a'), text: t('Guess the process to avoid asking questions.', 'Вгадати процес, щоб не ставити запитань.'), correct: false }
          ], feedback: t('Clarifying expectations helps you work confidently and follow approved procedures.', 'Уточнення очікувань допомагає дотримуватися затверджених процедур.') },
          { id: uid('q'), type: 'single', prompt: t('Who should help you agree on your role priorities?', 'Хто допоможе узгодити пріоритети вашої ролі?'), options: [
            { id: uid('a'), text: t('Your manager.', 'Ваш керівник.'), correct: true },
            { id: uid('a'), text: t('An unrelated external supplier.', 'Сторонній постачальник.'), correct: false }
          ] }
        ] } }
      ] }
    ]
  }
}
