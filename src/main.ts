import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import Keycloak, { KeycloakOnLoad } from 'keycloak-js'
import Vue3Lottie from 'vue3-lottie'
import {
  AppContainerConfig,
  AppContainerPlugin,
  ILoggerConfig,
  LoggerServicePlugin,
} from '@tgw-components/core'
import ElementPlus from 'element-plus'
import { configureDevExpressLicence } from '../devextreme-key'
import App from './App.vue'
import { useKeycloakStore } from '@/stores/useKeycloakStore/useKeycloakStore'
import { fetchEnvironmentVariables } from '@/api/envApi'
import 'vue3-lottie/dist/style.css'
import '@tgw-components/core/dist/themes/tgw-data-grid.scss'
import { router } from '@/router'

// import '@tgw-components/core/dist/themes/element-components/elements-plus-legacy-theme.scss'

const isAppContainerPreload = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('preload') === 'true'
}

export const app = createApp(App)
for await (const i of Object.values(
  import.meta.glob('./plugins/*.plugin.ts', { eager: true })
)) {
  await (i as any).install(app)
}

const { getEnv, setEnv } = useEnv()

if (getEnv('MODE') === 'production') {
  try {
    const response = await fetchEnvironmentVariables()
    for (const key in response.data) {
      setEnv(key, response.data[key])
    }
  } catch (error) {
    console.error('Error while fetching environment variables', error)
  }
}

const appContainerConfig = {
  appContainerUrl: getEnv('VITE_APP_PORTAL_URL'),
  meta: {
    containerHeaderMenuItems: [],
  },
  autoTriggerAppLoadedEvent: false,
} as AppContainerConfig

const loggerConfig = {
  url: getEnv('VITE_APP_LOGGER_SERVICE'), // usually a fluentD endpoint https://www.fluentd.org/
  production: getEnv('MODE') === 'production', // if false, the logger will only log to the console
  enableAutoLog: true, // if true, the logger will automatically log all errors to the host (optional)
} as ILoggerConfig

configureDevExpressLicence()

const startApp = async () => {
  if (isAppContainerPreload()) {
    return
  }

  app.use(router)
  appContainerConfig.router = router
  app.use(AppContainerPlugin, appContainerConfig)
  app.use(ElementPlus)
  await router.isReady()
  app.mount('#app')
}

function updateStore(keycloak: any) {
  const { setLogin, setKeycloak } = useKeycloakStore()
  setLogin({
    idToken: keycloak.idToken,
    accessToken: keycloak.token, // this token can be used as Bearer in api calls
  })
  setKeycloak(keycloak)
}

app
  .use(createPinia().use(piniaPluginPersistedstate))
  .use(Vue3Lottie, { name: 'LottieAnimation' })
  .use(LoggerServicePlugin, loggerConfig)

// check if application runs in development mode and use keycloak.js for authentication
if (getEnv('MODE') === 'development') {
  const initOptions = {
    url: getEnv('VITE_APP_KEYCLOAK_URL'),
    realm: getEnv('VITE_APP_KEYCLOAK_REALM_NAME'),
    clientId: getEnv('VITE_APP_KEYCLOAK_CLIENT_NAME'),
    onLoad: 'login-required',
  }
  const keycloak = new Keycloak(initOptions)

  keycloak
    .init({
      onLoad: initOptions.onLoad as KeycloakOnLoad,
      checkLoginIframe: false,
    })
    .then(async (auth: any) => {
      if (!auth) {
        window.location.reload()
      } else {
        updateStore(keycloak)
        await startApp()
      }

      // Token Refresh
      setInterval(() => {
        keycloak.updateToken(70)
      }, 6000)
    })
    .catch((e) => {
      console.error(e)
      console.error('Authenticated Failed')
    })
} else {
  await startApp()
}
