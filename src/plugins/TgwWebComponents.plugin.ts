import TgwComponentsWeb from '@tgw-components/web'
import type { App } from 'vue'
import '@tgw-components/core/dist/themes/themes.scss'
import '@tgw-components/web/dist/style.css'
import 'element-plus/dist/index.css'
import '@tgw-components/core/dist/themes/element-components/elements-plus-legacy-theme.scss'

export const install = async (app: App): Promise<void> => {
  return new Promise((resolve) => {
    app.use(TgwComponentsWeb)
    resolve()
  })
}
