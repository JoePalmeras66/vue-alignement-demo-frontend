import { useLogger } from '@tgw-components/core'
import i18n from '@/plugins/i18nFactory'

export const useTranslations = (componentKey: string | undefined) => {
  const { t: tGlobal } = i18n.global
  let t = tGlobal
  try {
    const { t: tLocal } = useI18n()
    if (tLocal !== undefined) {
      t = tLocal
    }
  } catch (e) {
    const logger = useLogger()
    logger.log(
      'Could not load translations from local useI18n -> using global i18n.global instead!'
    )
  }

  const getFullTranslationKey = (key: string) => {
    if (componentKey) {
      return `${componentKey}.${key}`
    }
    return key
  }
  const getTranslation = (
    key: string,
    param?: number | string | Record<string, unknown>
  ) => {
    const fullKey = getFullTranslationKey(key)
    let translatedText: string
    if (param !== undefined) {
      if (typeof param === 'string') {
        translatedText = t(fullKey, [param])
      } else if (typeof param === 'number') {
        translatedText = t(fullKey, param)
      } else {
        translatedText = t(fullKey, param)
      }
    } else {
      translatedText = t(fullKey)
    }

    return translatedText.replaceAll('[new_line]', '\n')
  }
  const getTranslationString = (
    key: string,
    param?: Record<string, unknown>
  ) => {
    const fullKey = getFullTranslationKey(key)
    const { availableLocales, t } = i18n.global
    let translation = ''
    for (const [index, locale] of availableLocales.entries()) {
      if (param) {
        translation += `${locale}="${t(fullKey, param, {
          locale,
        })}"`
      } else {
        translation += `${locale}="${t(fullKey, 1, {
          locale,
        })}"`
      }
      if (index < availableLocales.length - 1) {
        translation += ';'
      }
    }
    return translation
  }

  return { getTranslation, getTranslationString }
}
