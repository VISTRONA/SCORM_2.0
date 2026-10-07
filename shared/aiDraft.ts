// Content-only wire format: no IDs, HTML, assets, themes or export instructions.
export interface DraftBlock { type: 'heading' | 'paragraph' | 'list' | 'note'; text: string; items: string[] }
export interface Draft { title: string; description: string; objectives: string[]; lessons: { title: string; blocks: DraftBlock[] }[]; questions: { prompt: string; options: string[]; correctIndex: number; feedback: string }[] }
const str = { type: 'string', minLength: 1, maxLength: 4000 }
const array = (items: object, minItems: number, maxItems: number) => ({ type: 'array', items, minItems, maxItems })
const object = (properties: Record<string, object>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false })
export const draftSchema = object({
  title: str, description: str, objectives: array(str, 2, 5),
  lessons: array(object({ title: str, blocks: array(object({ type: { type: 'string', enum: ['heading', 'paragraph', 'list', 'note'] }, text: { type: 'string', maxLength: 4000 }, items: array(str, 0, 8) }), 2, 4) }), 3, 5),
  questions: array(object({ prompt: str, options: array(str, 2, 4), correctIndex: { type: 'integer', minimum: 0, maximum: 3 }, feedback: str }), 2, 4),
})

export function validateDraft(value: unknown): Draft {
  function check(schema: any, input: any): void {
    if (schema.type === 'object') {
      if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k => !(k in schema.properties))) throw Error('Invalid draft')
      for (const key of schema.required) check(schema.properties[key], input[key])
    } else if (schema.type === 'array') {
      if (!Array.isArray(input) || input.length < schema.minItems || input.length > schema.maxItems) throw Error('Invalid draft')
      input.forEach(item => check(schema.items, item))
    } else if (schema.type === 'string') {
      if (typeof input !== 'string' || input.trim().length < (schema.minLength ?? 0) || input.length > (schema.maxLength ?? 4000) || (schema.enum && !schema.enum.includes(input))) throw Error('Invalid draft')
    } else if (!Number.isInteger(input) || input < schema.minimum || input > schema.maximum) throw Error('Invalid draft')
  }
  check(draftSchema, value)
  const draft = value as Draft
  for (const lesson of draft.lessons) for (const block of lesson.blocks) {
    if (block.type === 'list' ? block.items.length < 2 : !block.text.trim()) throw Error('Invalid draft')
  }
  for (const q of draft.questions) if (q.correctIndex >= q.options.length || new Set(q.options.map(o => o.trim().toLowerCase())).size !== q.options.length) throw Error('Invalid draft')
  return draft
}
