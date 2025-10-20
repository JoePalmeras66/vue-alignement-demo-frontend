import { storeToRefs } from 'pinia'
import { WebsocketConnection, useLogger } from '@tgw-components/core'

// import { WebsocketConnection, useWebsocket } from '@tgw-components/core'
import { useKeycloakStore } from '@/stores/useKeycloakStore/useKeycloakStore'
import { useUrlJoiner } from '@/composables/useUrlJoiner/useUrlJoiner'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'

export const useWebsocketCreator = () => {
  const { joinUrls } = useUrlJoiner()
  const { getEnv } = useEnv()
  const logger = useLogger()

  const getBackEndUrl = () => {
    let backEndUrl = getEnv('VITE_APP_BACKEND_ADAPTER')

    if (backEndUrl === undefined || backEndUrl === '') {
      backEndUrl = getEnv('VITE_APP_CILOG_ADAPTER')
    }

    return backEndUrl
  }

  const getKeycloakTokenWhenNeeded = () => {
    const { isExtendedApiSupported } = storeToRefs(useWorkspaceStore())
    const useKeycloakToken =
      isExtendedApiSupported.value && getEnv('MODE') === 'development'
    if (useKeycloakToken) {
      const { keycloak } = storeToRefs(useKeycloakStore())
      return keycloak.value.token
    }
    return undefined
  }

  // Custom Websocket handling Start
  const convertHttpToWs = (url: string) => {
    return url.replace('http', 'ws')
  }

  /**
   * Clears the interval on the websocket connection
   * @param connection the websocket connection
   */
  const clearWebsocketInterval = (connection: WebsocketConnection) => {
    if (connection.interval !== null) {
      clearInterval(connection.interval)
      connection.interval = null
    }
  }

  const createWebsocketConnectionPcots = (
    url: string,
    shouldSendPing: boolean,
    protocols?: string | string[]
  ): WebsocketConnection => {
    // a websocket connection contains the websocket and the interval
    const connection = {
      websocket: null,
      interval: null,
    } as WebsocketConnection

    const websocketUrl = convertHttpToWs(url)
    connection.websocket = new WebSocket(websocketUrl, protocols)

    connection.websocket.onopen = () => {
      if (shouldSendPing) {
        connection.interval = setInterval(() => {
          if (connection.websocket?.readyState === WebSocket.OPEN) {
            try {
              connection.websocket.send('ping')
            } catch (e) {
              logger.error(`Unable to send ping via websocket ${e}`)
              clearWebsocketInterval(connection)
            }
          } else {
            logger.info(
              `Clear Connection (Url: ${websocketUrl}) Interval, current state: ${connection.websocket?.readyState}`
            )
            clearWebsocketInterval(connection)
          }
        }, 5000)
      }
    }

    connection.websocket.onclose = () => {
      clearWebsocketInterval(connection)
    }

    return connection
  }
  // Custom Websocket handling END

  const createWebsocketConnection = (eventUrl: string): WebsocketConnection => {
    // custom Websocket for bugfix purpose
    return createWebsocketConnectionPcots(
      joinUrls(getBackEndUrl(), eventUrl),
      true,
      getKeycloakTokenWhenNeeded()
    )
  }
  return { createWebsocketConnection, clearWebsocketInterval }
}
