export const formatPercent = (value: number) => `${Math.round(value)}%`
export const formatSeconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`
export const formatDuration = (ms: number) => {
  const seconds = Math.round(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  return minutes ? `${minutes}m ${seconds % 60}s` : `${seconds}s`
}

export const formatSessionDate = (iso: string, includeTime = false) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric',
    ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(new Date(iso))
