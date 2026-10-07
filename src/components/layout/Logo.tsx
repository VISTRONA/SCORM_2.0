import { useT } from '../../i18n/I18nProvider'
export default function Logo() {
  const { t } = useT('welcome')
  return <div className="studio-logo flex items-center gap-3 select-none">
    <span className="studio-mark" aria-hidden="true">HR</span>
    <div><span className="block text-base font-bold tracking-tight text-gray-900">HR-SCORM Studio</span>
    <span className="block text-xs font-medium text-gray-500">{t('workspaceLabel')}</span></div>
  </div>
}
