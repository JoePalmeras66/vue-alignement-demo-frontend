import { storeToRefs } from 'pinia'
import {
  WebsocketConnection,
  useLogger,
  useWebsocket,
} from '@tgw-components/core'
import { validatePcotsEventMessage } from '@/helpers/apiHelpers'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { EventMessageType } from '@/types/Api/pcots/PcotsApiModel'
import { useApiVersionStore } from '@/stores/useApiVersionStore/useApiVersionStore'
import { useUrlJoiner } from '@/composables/useUrlJoiner/useUrlJoiner'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'
import { useWebsocketCreator } from '@/composables/useWebsocketCreator'

export const usePcotsWebsockets = () => {
  let shouldReconnect = true
  let webSocketConnection: WebsocketConnection | null = null
  const { getWorkspace } = storeToRefs(useWorkspaceStore())
  const apiVersionStore = useApiVersionStore()
  const { joinUrls } = useUrlJoiner()
  const { closeConnection } = useWebsocket()
  const logger = useLogger()
  const { createWebsocketConnection, clearWebsocketInterval } =
    useWebsocketCreator()

  /**
   * creates a websocket connection to the pcots events endpoint
   * @returns the websocket connection with the websocket and the interval
   */
  const createConnectionInternal = (): WebsocketConnection => {
    const eventUrl = joinUrls(
      '/Pcots/',
      apiVersionStore.getHighestSupportedVersionByApi(ApiNameEnum.pcots) ?? '',
      getWorkspace.value.workstation.id,
      'PcotsEvents'
    )
    return createWebsocketConnection(eventUrl)
  }

  const handleWebsocketEvent = async (
    event: any,
    onEventReceived: (data: EventMessageType) => Promise<void>
  ) => {
    try {
      const eventMessage = JSON.parse(event.data) as EventMessageType
      validatePcotsEventMessage(eventMessage)
      try {
        await onEventReceived(JSON.parse(event.data) as EventMessageType)
      } catch (e: any) {
        logger.error('Error in event handler', e)
      }
    } catch {
      // ignore invalid messages
      logger.error('Invalid message received', event.data)
    }
  }

  /**
   * connects to the pcots events endpoint
   * @param onEventReceived the callback that is called when an event is received
   * @param onReconnected the callback that is called when the connection is reestablished
   */
  const connectPcotsEvents = (
    onEventReceived: (data: EventMessageType) => Promise<void>,
    onReconnected: (() => Promise<void>) | undefined = undefined
  ) => {
    try {
      shouldReconnect = true
      webSocketConnection = createConnectionInternal()
    } catch {
      webSocketConnection = null
      setTimeout(() => {
        connectPcotsEvents(onEventReceived, onReconnected)
      }, 3000) // try again in 3 seconds
    }

    if (webSocketConnection && webSocketConnection?.websocket) {
      webSocketConnection.websocket.onmessage = async (event: any) => {
        await handleWebsocketEvent(event, onEventReceived)
      }

      webSocketConnection.websocket.onclose = () => {
        // we overwrite onClose of useWebsocketCreator, do code here
        clearWebsocketInterval(webSocketConnection!)

        if (shouldReconnect) {
          setTimeout(async () => {
            connectPcotsEvents(onEventReceived, onReconnected)
            if (onReconnected !== undefined) {
              if (webSocketConnection) {
                // logger.info(
                //   'Connection current status: ',
                //   webSocketConnection.websocket?.readyState
                // )
                await onReconnected()
              }
            }
          }, 3000) // try again in 3 seconds
        }
      }
    }
  }

  /**
   * disconnects from the pcots events endpoint
   */
  const disconnectPcotsEvents = () => {
    shouldReconnect = false
    if (webSocketConnection) {
      closeConnection(webSocketConnection)
    }
  }

  return {
    disconnectPcotsEvents,
    connectPcotsEvents,
  }
}
