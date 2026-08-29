import { db } from '../db/database'
import { attemptRepository } from '../db/attemptRepository'
import { sessionRepository } from '../db/sessionRepository'
import { gameProgressCache } from '../cache/gameProgressCache'
import type { GameAttempt, GameId, GameProgress, GameStats, TrainingSession } from '../types/game'
import type { Session } from '../types/session'

const DEFAULT_SPAN = 3
const LEGACY_SESSIONS_KEY = 'executive-function-mini-games:sessions'
const unsavedAttempts: GameAttempt[] = []

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function deriveProgress(game: GameId): Promise<GameProgress> {
  const latestSession = await sessionRepository.getLatest(game)
  if (!latestSession) return { currentSpanLength: DEFAULT_SPAN, currentSuccessStreak: 0 }
  const currentSpanLength = latestSession.endingSpan ?? latestSession.startingSpan
  const attempts = await attemptRepository.getBySession(latestSession.id)
  const lastAtSpan = [...attempts].reverse().find((attempt) => attempt.spanLength === currentSpanLength)
  return {
    currentSpanLength,
    currentSuccessStreak: lastAtSpan?.successStreak ?? 0,
    lastSessionId: latestSession.id,
    lastPlayedAt: lastAtSpan?.timestamp.toISOString() ?? latestSession.startedAt.toISOString(),
  }
}

async function calculateStats(game: GameId): Promise<GameStats> {
  const attempts = await attemptRepository.getByGame(game)
  const correct = attempts.filter((attempt) => attempt.correct)
  return {
    totalAttempts: attempts.length,
    correctAttempts: correct.length,
    accuracy: attempts.length ? (correct.length / attempts.length) * 100 : 0,
    maxSpan: Math.max(0, ...correct.map((attempt) => attempt.spanLength)),
    averageResponseTimeMs: attempts.length ? attempts.reduce((sum, attempt) => sum + attempt.responseTimeMs, 0) / attempts.length : 0,
  }
}

async function migrateLegacySessions() {
  const raw = localStorage.getItem(LEGACY_SESSIONS_KEY)
  if (!raw) return
  try {
    const sessions = JSON.parse(raw) as Session[]
    await db.transaction('rw', db.sessions, async () => {
      for (const summary of sessions) {
        const exists = await db.sessions.get(summary.id)
        if (!exists) {
          const endedAt = new Date(summary.completedAt)
          await db.sessions.add({
            id: summary.id,
            game: 'backward-digit-span',
            startedAt: new Date(endedAt.getTime() - summary.durationMs),
            endedAt,
            startingSpan: DEFAULT_SPAN,
            endingSpan: summary.maxSuccessfulSpan || DEFAULT_SPAN,
            summary,
          })
        }
      }
    })
    localStorage.removeItem(LEGACY_SESSIONS_KEY)
  } catch {
    // Keep legacy data intact if parsing or migration fails.
  }
}

export const gameStorageService = {
  async initialize() { await migrateLegacySessions() },

  async saveAttempt(attempt: GameAttempt) {
    try {
      await this.retryUnsavedAttempts()
      const id = await attemptRepository.add(attempt)
      return { saved: true as const, id }
    } catch (error) {
      unsavedAttempts.push(attempt)
      return { saved: false as const, error }
    }
  },

  async retryUnsavedAttempts() {
    while (unsavedAttempts.length) {
      const attempt = unsavedAttempts[0]
      await attemptRepository.add(attempt)
      unsavedAttempts.shift()
    }
  },

  getAttempts(game: GameId) { return attemptRepository.getByGame(game) },
  getRecentAttempts(game: GameId, limit: number) { return attemptRepository.getRecent(game, limit) },

  async getProgress(game: GameId) {
    const cached = gameProgressCache.get(game)?.progress
    if (cached) {
      void this.rebuildCache(game).catch(() => undefined)
      return cached
    }
    return this.rebuildCache(game)
  },

  async updateProgress(game: GameId, progress: GameProgress) {
    if (progress.lastSessionId) {
      await sessionRepository.update(progress.lastSessionId, { endingSpan: progress.currentSpanLength })
    }
    gameProgressCache.setProgress(game, progress)
  },

  async getStats(game: GameId) {
    const stats = await calculateStats(game)
    const progress = await this.getProgress(game)
    gameProgressCache.setStats(game, stats, progress)
    return stats
  },

  async rebuildCache(game: GameId) {
    const progress = await deriveProgress(game)
    const stats = await calculateStats(game)
    gameProgressCache.setStats(game, stats, progress)
    return progress
  },

  async startSession(game: GameId, startingSpan: number) {
    const session: TrainingSession = { id: newId(), game, startedAt: new Date(), startingSpan, endingSpan: startingSpan }
    await sessionRepository.add(session)
    const progress: GameProgress = { currentSpanLength: startingSpan, currentSuccessStreak: 0, lastSessionId: session.id, lastPlayedAt: session.startedAt.toISOString() }
    gameProgressCache.setProgress(game, progress)
    return session
  },

  async endSession(sessionId: string, summary: Session, endingSpan: number) {
    await sessionRepository.update(sessionId, { endedAt: new Date(), endingSpan, summary })
    gameProgressCache.clear('backward-digit-span')
    await this.rebuildCache('backward-digit-span')
  },

  async markDifficultyChanged(attemptId: number) {
    await attemptRepository.update(attemptId, { difficultyChanged: true })
  },

  async getSessions(game: GameId) {
    const sessions = await sessionRepository.getByGame(game)
    return sessions.flatMap((session) => session.summary ? [session.summary] : [])
  },

  async clearHistory(game: GameId) {
    await db.transaction('rw', db.attempts, db.sessions, async () => {
      await attemptRepository.clearGame(game)
      await sessionRepository.clearGame(game)
    })
    gameProgressCache.clear(game)
  },
}
