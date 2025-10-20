import { describe, expect, it, vi } from 'vitest'
import { useTextTranslator } from '@/composables/useTextTranslator/useTextTranslator'

const currentCulture = ref('de')
vi.mock('vue-i18n', async () => {
  return {
    useI18n: () => {
      return { locale: currentCulture }
    },
  }
})

describe('Test useTextTranslator', () => {
  const { getTranslatedText } = useTextTranslator()

  it('should translate with quotes', () => {
    const input = 'de="Radiergummi";en="Eraser"'
    currentCulture.value = 'de'
    let result = getTranslatedText(input)
    expect(result).toBe('Radiergummi')
    currentCulture.value = 'en'
    result = getTranslatedText(input)
    expect(result).toBe('Eraser')
  })

  it('should not translate', () => {
    const translatedText = getTranslatedText('Radiergummi')
    expect(translatedText).toBe('Radiergummi')
  })

  it('should use fallback language', () => {
    currentCulture.value = 'en'
    const translatedText = getTranslatedText('de="Radiergummi"')
    expect(translatedText).toBe('Radiergummi')
  })

  it('should handle undefined input', () => {
    const translatedText = getTranslatedText(undefined)
    expect(translatedText).toBe(undefined)
  })

  it('should handle empty translation string', () => {
    currentCulture.value = 'en'
    const translatedText = getTranslatedText('')
    expect(translatedText).toBe('')
  })

  it('should handle three languages', () => {
    const input = 'de="Radiergummi";en="Eraser";fr="Gomme"'
    currentCulture.value = 'fr'
    let result = getTranslatedText(input)
    expect(result).toBe('Gomme')
    currentCulture.value = 'de'
    result = getTranslatedText(input)
    expect(result).toBe('Radiergummi')
    currentCulture.value = 'en'
    result = getTranslatedText(input)
    expect(result).toBe('Eraser')
  })

  it('should handle translation with special characters', () => {
    currentCulture.value = 'EN'
    const translatedText = getTranslatedText('de="Äpfel";eN="Apples 🍎"')
    expect(translatedText).toBe('Apples 🍎')
  })

  it('should support without quotes', () => {
    const input = 'de=Radiergummi;en=Eraser'
    currentCulture.value = 'EN'
    let translatedText = getTranslatedText(input)
    expect(translatedText).toBe('Eraser')
    currentCulture.value = 'DE'
    translatedText = getTranslatedText(input)
    expect(translatedText).toBe('Radiergummi')
  })

  it('should support escaped without quotes', () => {
    const input = 'de=Li\\u003dne\\u003bal;en=Ru\\u003dle\\u003br;'
    currentCulture.value = 'DE'
    let translatedText = getTranslatedText(input)
    expect(translatedText).toBe('Li=ne;al')
    currentCulture.value = 'EN'
    translatedText = getTranslatedText(input)
    expect(translatedText).toBe('Ru=le;r')
  })

  it('should support escaped with quotes', () => {
    const input = 'de="Li\\u003dne\\u003bal";en="Ru\\u003dle\\u003br";'
    currentCulture.value = 'DE'
    let translatedText = getTranslatedText(input)
    expect(translatedText).toBe('Li=ne;al')
    currentCulture.value = 'EN'
    translatedText = getTranslatedText(input)
    expect(translatedText).toBe('Ru=le;r')
  })
})
