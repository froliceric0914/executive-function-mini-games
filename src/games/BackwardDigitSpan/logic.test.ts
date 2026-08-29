import { describe, expect, it } from 'vitest'
import { requiredSuccessesForSpan } from './logic'

describe('Backward Digit Span progression', () => {
  it('requires only one successful attempt at span four', () => {
    expect(requiredSuccessesForSpan(4)).toBe(1)
  })

  it('keeps the standard rotation requirement at other spans', () => {
    expect(requiredSuccessesForSpan(3)).toBe(3)
    expect(requiredSuccessesForSpan(5)).toBe(3)
  })
})
