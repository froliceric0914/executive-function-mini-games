import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/database'
import { gameProgressCache } from '../cache/gameProgressCache'
import { gameStorageService } from './gameStorageService'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

function cloneForTest<T>(value: T): T {
  if (value instanceof Date) return new Date(value) as T
  if (Array.isArray(value)) return value.map(cloneForTest) as T
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneForTest(item)])) as T
  return value
}

describe('game storage service', () => {
  beforeEach(async () => {
    Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true })
    Object.defineProperty(globalThis, 'structuredClone', { value: cloneForTest, configurable: true })
    await db.attempts.clear()
    await db.sessions.clear()
  })

  it('rebuilds progress from IndexedDB when cache is empty', async () => {
    const session = await gameStorageService.startSession('backward-digit-span', 3)
    await gameStorageService.saveAttempt({
      game: 'backward-digit-span', sessionId: session.id, timestamp: new Date(), spanLength: 3,
      sequence: [1, 2, 3], userAnswer: [3, 2, 1], correct: true, responseTimeMs: 500,
      successStreak: 1, difficultyChanged: false,
    })
    await gameStorageService.updateProgress('backward-digit-span', { currentSpanLength: 3, currentSuccessStreak: 1, lastSessionId: session.id })
    gameProgressCache.clear('backward-digit-span')

    expect(await gameStorageService.getProgress('backward-digit-span')).toMatchObject({ currentSpanLength: 3, currentSuccessStreak: 1 })
  })

  it('stores raw attempt details in IndexedDB', async () => {
    const session = await gameStorageService.startSession('backward-digit-span', 4)
    const result = await gameStorageService.saveAttempt({
      game: 'backward-digit-span', sessionId: session.id, timestamp: new Date(), spanLength: 4,
      sequence: [4, 1, 9, 2], userAnswer: [2, 9, 1, 4], correct: true, responseTimeMs: 750,
      successStreak: 1, difficultyChanged: false,
    })
    expect(result.saved).toBe(true)
    const attempts = await gameStorageService.getAttempts('backward-digit-span')
    expect(attempts[0]).toMatchObject({ sequence: [4, 1, 9, 2], userAnswer: [2, 9, 1, 4], spanLength: 4 })
  })

  it('restarts digit progression after a session ends', async () => {
    const session = await gameStorageService.startSession('backward-digit-span', 5)
    await gameStorageService.endSession(session.id, {
      id: session.id, completedAt: new Date().toISOString(), totalTrials: 0, correctTrials: 0,
      incorrectTrials: 0, accuracy: 0, maxSuccessfulSpan: 0, averageResponseTimeMs: 0, durationMs: 100,
    }, 5)
    gameProgressCache.clear('backward-digit-span')

    expect(await gameStorageService.getProgress('backward-digit-span')).toMatchObject({ currentSpanLength: 3, currentSuccessStreak: 0 })
  })
})
