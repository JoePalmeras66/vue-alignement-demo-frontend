import { describe, expect, it } from 'vitest'
import { useUrlJoiner } from '@/composables/useUrlJoiner/useUrlJoiner'

describe('Test useUrlJoiner', () => {
  const { joinUrls } = useUrlJoiner()

  const baseUrl = 'https://asdf:69'

  it('should join urls correctly without /', () => {
    const joinedUrl = joinUrls(baseUrl, 'fdsa')
    expect(joinedUrl).toBe('https://asdf:69/fdsa')
  })

  it('should join urls correctly with /', () => {
    const joinedUrl = joinUrls(baseUrl, '/fdsa')
    expect(joinedUrl).toBe('https://asdf:69/fdsa')
  })

  it('should join urls correctly with multiple /', () => {
    const joinedUrl = joinUrls(baseUrl, '/fdsa/', '/asdf')
    expect(joinedUrl).toBe('https://asdf:69/fdsa/asdf')
  })
})
