export const STROOP_COLORS = [
  { id: 'red', value: '#ef7d83' },
  { id: 'blue', value: '#78a8ed' },
  { id: 'green', value: '#70c9a2' },
  { id: 'yellow', value: '#e8c96f' },
] as const

export type StroopColorId = typeof STROOP_COLORS[number]['id']

export interface StroopTrial {
  word: StroopColorId
  ink: StroopColorId
}

export const STROOP_ROUNDS = 10

export function createStroopTrial(random = Math.random): StroopTrial {
  const wordIndex = Math.floor(random() * STROOP_COLORS.length)
  let inkIndex = Math.floor(random() * (STROOP_COLORS.length - 1))
  if (inkIndex >= wordIndex) inkIndex += 1
  return { word: STROOP_COLORS[wordIndex].id, ink: STROOP_COLORS[inkIndex].id }
}

export function isStroopAnswerCorrect(trial: StroopTrial, answer: StroopColorId) {
  return trial.ink === answer
}

export function colorDetails(id: StroopColorId) {
  return STROOP_COLORS.find((color) => color.id === id)!
}
