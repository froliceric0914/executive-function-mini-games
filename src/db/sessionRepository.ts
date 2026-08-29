import { db } from './database'
import type { GameId, TrainingSession } from '../types/game'

export const sessionRepository = {
  async add(session: TrainingSession) {
    await db.sessions.add(session)
  },
  async update(id: string, changes: Partial<TrainingSession>) {
    await db.sessions.update(id, changes)
  },
  async get(id: string) {
    return db.sessions.get(id)
  },
  async getByGame(game: GameId) {
    const sessions = await db.sessions.where('game').equals(game).toArray()
    return sessions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
  },
  async getLatest(game: GameId) {
    const sessions = await this.getByGame(game)
    return sessions[0]
  },
  async clearGame(game: GameId) {
    return db.sessions.where('game').equals(game).delete()
  },
}
