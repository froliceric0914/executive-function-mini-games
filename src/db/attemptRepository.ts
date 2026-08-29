import Dexie from 'dexie'
import { db } from './database'
import type { GameAttempt, GameId } from '../types/game'

export const attemptRepository = {
  async add(attempt: GameAttempt) {
    return db.attempts.add(attempt)
  },
  async update(id: number, changes: Partial<GameAttempt>) {
    await db.attempts.update(id, changes)
  },
  async getByGame(game: GameId) {
    return db.attempts.where('game').equals(game).sortBy('timestamp')
  },
  async getRecent(game: GameId, limit: number) {
    return db.attempts.where('[game+timestamp]').between([game, Dexie.minKey], [game, Dexie.maxKey]).reverse().limit(limit).toArray()
  },
  async getBySession(sessionId: string) {
    return db.attempts.where('sessionId').equals(sessionId).sortBy('timestamp')
  },
  async clearGame(game: GameId) {
    return db.attempts.where('game').equals(game).delete()
  },
}
