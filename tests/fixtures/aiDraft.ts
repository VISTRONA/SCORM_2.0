export const fixture = {
  title: 'Clear workplace communication', description: 'A draft for HR review.', objectives: ['Ask clear questions', 'Confirm shared understanding'],
  lessons: Array.from({ length: 3 }, (_, i) => ({ title: `Communication ${i + 1}`, blocks: [
    { type: 'heading', text: 'Ask & clarify', items: [] },
    { type: 'paragraph', text: 'Ask for clarification and confirm what you heard.', items: [] },
    { type: 'list', text: '', items: ['Listen carefully', 'Confirm understanding'] },
    { type: 'note', text: 'Use approved company guidance.', items: [] },
  ] })),
  questions: Array.from({ length: 2 }, (_, i) => ({ prompt: `When instructions are unclear (${i + 1}), what helps?`, options: ['Ask for clarification', 'Guess'], correctIndex: 0, feedback: 'Clarifying avoids assumptions.' })),
}
