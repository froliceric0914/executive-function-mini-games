import Dexie, { type EntityTable } from 'dexie'
import type { GameAttempt, TrainingSession } from '../types/game'

export class TrainingDatabase extends Dexie {
  attempts!: EntityTable<GameAttempt, 'id'>
  sessions!: EntityTable<TrainingSession, 'id'>

  constructor(name = 'executive-function-mini-games') {
    super(name)
    this.version(1).stores({
      attempts: '++id, game, sessionId, timestamp, spanLength, correct, [game+timestamp]',
      sessions: 'id, game, startedAt, endedAt, [game+startedAt]',
    })
  }
}

export const db = new TrainingDatabase()
