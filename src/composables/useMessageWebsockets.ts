import { storeToRefs } from 'pinia'
import {
  WebsocketConnection,
  useLogger,
  useWebsocket,
} from '@tgw-components/core'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { validateMessageType } from '@/helpers/apiHelpers'
import { MessageType } from '@/types/Api/pcots/PcotsApiModel'
import { useUrlJoiner } from '@/composables/useUrlJoiner/useUrlJoiner'
import { useWebsocketCreator } from '@/composables/useWebsocketCreator'

export const useMessageWebsockets = () => {
  let shouldReconnect = true
  let webSocketConnection: WebsocketConnection | null = null
  const { getWorkspace } = storeToRefs(useWorkspaceStore())
  const { closeConnection } = useWebsocket()
  const logger = useLogger()
  const { sendMessageToAppContainer } = useAppContainer()
  const { joinUrls } = useUrlJoiner()
  const { createWebsocketConnection, clearWebsocketInterval } =
    useWebsocketCreator()

  /**
   * creates a websocket connection to the message events endpoint
   * @returns the websocket connection with the websocket and the interval
   */
  const createConnectionInternal = (): WebsocketConnection => {
    const eventUrl = joinUrls(
      '/Core/',
      `/MessagingEvent?station=${getWorkspace.value.workstation.id}`
    )
    return createWebsocketConnection(eventUrl)
  }

  const connectMessageEvents = () => {
    try {
      shouldReconnect = true
      webSocketConnection = createConnectionInternal()
    } catch {
      logger.info('Connection failed, try again...')
      webSocketConnection = null
      setTimeout(() => {
        connectMessageEvents()
      }, 3000) // try again in 3 seconds
    }

    if (webSocketConnection && webSocketConnection.websocket) {
      webSocketConnection.websocket.onmessage = (event: any) => {
        try {
          const message = JSON.parse(event.data) as MessageType
          validateMessageType(message)
          if (message !== undefined) {
            sendMessageToAppContainer(message)
          } else {
            logger.error(
              `Invalid message received from websocket: ${JSON.stringify(
                message
              )}`
            )
          }
        } catch {
          // ignore invalid messages
          logger.warn('Invalid message received', event.data)
        }
      }

      webSocketConnection.websocket.onclose = () => {
        // we overwrite onClose of useWebsocketCreator, do code here
        clearWebsocketInterval(webSocketConnection!)

        if (shouldReconnect) {
          setTimeout(() => {
            connectMessageEvents()
          }, 3000) // try again in 3 seconds
        }
      }
    }
  }

  /**
   * disconnects the websocket connection from the server
   */
  const disconnectMessageEvents = () => {
    shouldReconnect = false
    if (webSocketConnection) {
      closeConnection(webSocketConnection)
    }
  }

  return {
    connectMessageEvents,
    disconnectMessageEvents,
  }
}
