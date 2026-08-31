import type { Session } from '../types/session'
import { formatPercent, formatSeconds, formatSessionDate } from '../utils/format'
import { useTranslation } from 'react-i18next'

export function SessionCard({ session, recent = false }: { session: Session, recent?: boolean }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === 'zh-CN' ? 'zh-CN' : 'en'
  return <article className="session-card">
    <div className="session-card-top"><strong>{recent ? t('results.mostRecent') : formatSessionDate(session.completedAt, false, locale)}</strong>{recent && <span>{formatSessionDate(session.completedAt, true, locale)}</span>}</div>
    <div className="metrics-row">
      <div><span>{t('results.maxSpan')}</span><strong>{session.maxSuccessfulSpan}</strong></div>
      <div><span>{t('results.accuracy')}</span><strong>{formatPercent(session.accuracy)}</strong></div>
      <div><span>{t('results.averageResponse')}</span><strong>{formatSeconds(session.averageResponseTimeMs, locale)}</strong></div>
    </div>
  </article>
}
