export const useTextTranslator = () => {
  const { locale } = useI18n()

  const getCurrentCulture = () => {
    return locale.value.toLowerCase()
  }

  const getTranslationGroup = (
    culture: string | undefined,
    translation: string | undefined
  ) => {
    if (culture && translation) {
      return {
        culture: culture.replace(/^"?(.*?)"?$/, '$1').toLowerCase(),
        translation: translation
          .replace(/^"?(.*?)"?$/, '$1')
          .replace(/\\;/g, ';')
          .replace(/\\(.)/g, '$1'),
      }
    }
    return undefined
  }

  const decodeEscapedCharacters = (str: string | undefined) => {
    if (str !== undefined) {
      return str.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
        return String.fromCharCode(Number.parseInt(match.slice(2), 16))
      })
    }
  }

  const getTranslatedText = (text: string | undefined) => {
    if (text === undefined) {
      return text
    }

    const currentCulture = getCurrentCulture()
    const regEx =
      /(?<culture>[a-zA-Z]{1,4000})=(?<translation>[^;]{1,4000})(?:;|$)/g
    let fallbackTranslation
    let match

    // eslint-disable-next-line no-cond-assign
    while ((match = regEx.exec(text)) !== null) {
      const translationGroup = getTranslationGroup(
        match.groups?.culture,
        decodeEscapedCharacters(match.groups?.translation)
      )
      if (translationGroup) {
        if (translationGroup.culture === currentCulture) {
          return translationGroup.translation
        } else if (!fallbackTranslation) {
          fallbackTranslation = translationGroup.translation
        }
      }
    }
    return fallbackTranslation ?? text
  }

  return { getTranslatedText }
}
