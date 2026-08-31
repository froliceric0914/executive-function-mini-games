import type { Session } from '../types/session'
import { SessionCard } from '../components/SessionCard'
import { useTranslation } from 'react-i18next'

export function History({ sessions, loading = false }: { sessions: Session[]; loading?: boolean }) {
  const { t } = useTranslation()
  return <main className="page">
    <p className="eyebrow">{t('history.eyebrow')}</p><h1>{t('history.title')}</h1>
    {loading ? <div className="empty-card history-empty"><span>{t('history.loading')}</span></div> : sessions.length ? <div className="history-list">{sessions.map((session) => <SessionCard session={session} key={session.id} />)}</div> : <div className="empty-card history-empty"><strong>{t('history.emptyTitle')}</strong><span>{t('history.emptyBody')}</span></div>}
  </main>
}
