import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'
import { useEnv } from '@/composables/useEnv'

const { getEnv } = useEnv()

const VITE_APP_I18N_LOCALE = getEnv('VITE_APP_I18N_LOCALE')
const VITE_APP_I18N_FALLBACK_LOCALE = getEnv('VITE_APP_I18N_FALLBACK_LOCALE')

function createFormat(format: { de: any; en: any }) {
  const locales = import.meta.glob('../locales/*.yml') // select translation files in local project

  const formats: any = {}

  for (const path in locales) {
    locales[path]().then(() => {
      const matched: any = /(?<=locales\/).+?(?=\.)/i.exec(path)

      if (matched[0] === 'de') {
        formats[matched[0]] = format.de
      } else {
        formats[matched[0]] = format.en
      }
    })
  }
  return formats
}
/**
 * creates the number format json for different languages
 * @returns JSON
 */
function createNumberFormats() {
  return createFormat({
    en: {
      currency: {
        style: 'currency',
        currency: 'USD',
        notation: 'standard',
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
      percent: {
        style: 'percent',
        useGrouping: false,
      },
    },
    de: {
      currency: {
        style: 'currency',
        currency: 'EUR',
        notation: 'standard',
      },
      decimal: {
        style: 'decimal',
        minimumSignificantDigits: 2,
        maximumSignificantDigits: 2,
      },
      percent: {
        style: 'percent',
        useGrouping: false,
      },
    },
  })
}

/**
 * creates the date and time format json for different languages
 * @returns JSON
 */
function createDateTimeFormats() {
  return createFormat({
    en: {
      long: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      },
    },
    de: {
      long: {
        // currently only format for long date and time is available
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      },
    },
  })
}

export default createI18n({
  legacy: false,
  locale: VITE_APP_I18N_LOCALE || 'en', // read from environment variable VITE_APP_I18N_LOCALE or set english
  fallbackLocale: VITE_APP_I18N_FALLBACK_LOCALE || 'en', // fallback environment variable VITE_APP_I18N_FALLBACK_LOCALE or set english
  messages,
  globalInjection: true,
  numberFormats: createNumberFormats(),
  dateTimeFormats: createDateTimeFormats(),
  missingWarn: false, // set to true if you want to see missing translation keys
})
