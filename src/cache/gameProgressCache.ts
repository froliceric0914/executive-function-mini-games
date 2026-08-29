import type { GameId, GameProgress, GameStats } from '../types/game'

export const CACHE_VERSION = 1
const PREFIX = 'executive-function-mini-games:cache:'

type CacheRecord = { version: number; progress: GameProgress; stats?: GameStats }

function key(game: GameId) { return `${PREFIX}${game}` }

export const gameProgressCache = {
  get(game: GameId): CacheRecord | undefined {
    try {
      const raw = localStorage.getItem(key(game))
      if (!raw) return undefined
      const record = JSON.parse(raw) as CacheRecord
      if (record.version !== CACHE_VERSION || !record.progress) {
        try { localStorage.removeItem(key(game)) } catch { /* Disposable cache. */ }
        return undefined
      }
      return record
    } catch {
      try { localStorage.removeItem(key(game)) } catch { /* Disposable cache. */ }
      return undefined
    }
  },
  setProgress(game: GameId, progress: GameProgress) {
    try {
      const current = this.get(game)
      localStorage.setItem(key(game), JSON.stringify({ version: CACHE_VERSION, progress, stats: current?.stats }))
    } catch { /* Cache failure must not invalidate a durable database write. */ }
  },
  setStats(game: GameId, stats: GameStats, progress: GameProgress) {
    try { localStorage.setItem(key(game), JSON.stringify({ version: CACHE_VERSION, progress, stats })) } catch { /* Disposable cache. */ }
  },
  clear(game: GameId) { try { localStorage.removeItem(key(game)) } catch { /* Disposable cache. */ } },
}
