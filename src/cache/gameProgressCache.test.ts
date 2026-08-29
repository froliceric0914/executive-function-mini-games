import { beforeEach, describe, expect, it } from 'vitest'
import { CACHE_VERSION, gameProgressCache } from './gameProgressCache'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

describe('game progress cache', () => {
  beforeEach(() => { Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true }) })

  it('round-trips lightweight progress', () => {
    const progress = { currentSpanLength: 5, currentSuccessStreak: 2 }
    gameProgressCache.setProgress('backward-digit-span', progress)
    expect(gameProgressCache.get('backward-digit-span')?.progress).toEqual(progress)
  })

  it('discards records from another cache version', () => {
    localStorage.setItem('executive-function-mini-games:cache:backward-digit-span', JSON.stringify({ version: CACHE_VERSION + 1, progress: {} }))
    expect(gameProgressCache.get('backward-digit-span')).toBeUndefined()
    expect(localStorage.length).toBe(0)
  })
})
