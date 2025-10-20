import type { App } from 'vue'
import i18n from './i18nFactory'

export const install = async (app: App): Promise<void> => {
  return new Promise((resolve) => {
    const i18nFactory = i18n
    app.use(i18nFactory)
    resolve()
  })
}
