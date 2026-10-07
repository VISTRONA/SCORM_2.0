import { useState } from 'react'
import { useT } from '../../i18n/I18nProvider'
import HelpDialogShell from './HelpDialogShell'
import license from '../../../LICENSE?raw'
export default function AboutLegal() {
  const [open, setOpen] = useState(false)
  const { t } = useT('welcome')
  return <>
    <button type="button" className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100" onClick={() => setOpen(true)}>{t('about')}</button>
    {open && <HelpDialogShell id="studio-legal" title={t('about')} onClose={() => setOpen(false)}>
      <p className="mb-4 leading-relaxed text-gray-700">{t('aboutText')}</p>
      <a className="text-brand underline" href="https://github.com/dmmat/Scormly" target="_blank" rel="noreferrer">{t('upstream')}</a>
      <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{license}</pre>
    </HelpDialogShell>}
  </>
}
