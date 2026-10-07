import { useEffect, useRef, useState } from 'react'
import { extractPdfText } from '../../lib/pdfText'
import HelpDialogShell from '../help/HelpDialogShell'
import { useLang, useT } from '../../i18n/I18nProvider'
import { makeAiCourse } from '../../lib/aiCourse'
import type { Course } from '../../types/course'

export default function GenerateDialog({ onClose, onGenerated }: { onClose: () => void; onGenerated: (course: Course) => void }) {
  const { t } = useT('ai')
  const { lang } = useLang()
  const [material, setMaterial] = useState('')
  const [audience, setAudience] = useState(t('employees'))
  const [length, setLength] = useState('Short')
  const [readingPdf, setReadingPdf] = useState(false)
  const [pdfName, setPdfName] = useState('')
  const alive = useRef(true)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  async function generate() {
    if (controller.current) return
    const abort = new AbortController()
    controller.current = abort
    const timeout = setTimeout(() => abort.abort(), 100000)
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ material, audience: audience.trim() || t('employees'), length, language: lang }), signal: abort.signal })
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}))
        const keys: Record<string, string> = { CONFIG: 'config', AUTH: 'authError', QUOTA: 'quotaError', MODEL: 'modelError', REQUEST: 'requestError', INCOMPLETE: 'incompleteError', REFUSED: 'refusedError', INVALID: 'error' }
        setError(t(keys[failure.error] || 'error')); return
      }
      const course = makeAiCourse(await response.json(), lang)
      if (!abort.signal.aborted) onGenerated(course)
    } catch { setError(t('error')) }
    finally { clearTimeout(timeout); controller.current = null; setBusy(false) }
  }
  async function uploadPdf(file: File) {
    setReadingPdf(true); setError('')
    try {
      const text = await extractPdfText(file)
      if (alive.current) { setMaterial(text); setPdfName(file.name) }
    } catch (err) {
      if (alive.current) {
        const code = err instanceof Error ? err.message : ''
        setError(t(['pdfSize', 'pdfPages', 'pdfLong', 'pdfEmpty', 'pdfInvalid'].includes(code) ? code : 'pdfInvalid'))
      }
    } finally { if (alive.current) setReadingPdf(false) }
  }
  const field = 'mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-brand focus:outline-none'
  return <HelpDialogShell id="ai-draft" title={t('action')} onClose={onClose}>
    <form onSubmit={e => { e.preventDefault(); void generate() }} className="space-y-4">
      <p className="text-sm text-gray-600">{t('privacy')}</p>
      <label className="block text-sm font-medium">{t('pdfUpload')}<input type="file" accept=".pdf,application/pdf" disabled={busy || readingPdf} className={field} onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void uploadPdf(file) }} /></label>
      <p className="text-xs text-gray-500">{t('pdfHint')}</p>
      {readingPdf && <p role="status">{t('pdfReading')}</p>}
      {pdfName && <p className="text-xs text-gray-600">{pdfName} — {t('pdfReady')}</p>}
      <label className="block text-sm font-medium">{t('material')}<textarea required maxLength={20000} rows={8} value={material} onChange={e => setMaterial(e.target.value)} disabled={busy || readingPdf} className={field} /></label>
      <label className="block text-sm font-medium">{t('audience')}<input maxLength={200} value={audience} onChange={e => setAudience(e.target.value)} disabled={busy || readingPdf} className={field} /></label>
      <label className="block text-sm font-medium">{t('length')}<select value={length} onChange={e => setLength(e.target.value)} disabled={busy || readingPdf} className={field}><option value="Short">{t('short')}</option><option value="Standard">{t('standard')}</option></select></label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button className="btn-primary w-full disabled:opacity-50" disabled={busy || readingPdf || !material.trim()}>{busy ? t('loading') : t('generate')}</button>
      {busy && <p role="status" className="sr-only">{t('loading')}</p>}
    </form>
  </HelpDialogShell>
}
