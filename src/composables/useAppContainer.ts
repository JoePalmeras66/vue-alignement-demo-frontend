import { Ref } from 'vue'
import {
  AppEventEnum,
  ContainerEventEnum,
  useAppContainer as useAppContainerPlugin,
} from '@tgw-components/core'
import { notify } from '@tgw-components/web'
import { AppMeta } from '@tgw-components/web/dist/packages/core/src'
import { isTouchMode } from '@/composables/isTouchMode'
import { MessageType } from '@/types/Api/pcots/PcotsApiModel'
import { MessageTypeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useMessage } from '@/composables/useMessage/useMessage'

const { getEnv } = useEnv()
const { getMessageTitle, getMessageText } = useMessage()

export interface NotificationPayload {
  title: string
  description: string
}

// checks if the application is run inside an iFrame
// -> only sends to AppContainer when in iFrame,
// if not a normal notification will be shown
const triggerAppNotification = (
  appEvent:
    | AppEventEnum.APP_NOTIFICATION
    | AppEventEnum.APP_ERROR
    | AppEventEnum.APP_WARNING
    | AppEventEnum.APP_SUCCESS,
  data: NotificationPayload
) => {
  const { isHosted } = useAppContainerPlugin()
  const { getEnv } = useEnv()
  if (isHosted()) {
    parent.postMessage(
      { type: appEvent, payload: data },
      getEnv('VITE_APP_PORTAL_URL')
    )
  } else {
    const notificationTypes = ['success', 'info', 'warning', 'error']
    let notificationType = notificationTypes[0]
    if (appEvent === AppEventEnum.APP_NOTIFICATION) {
      notificationType = notificationTypes[1]
    } else if (appEvent === AppEventEnum.APP_WARNING) {
      notificationType = notificationTypes[2]
    } else if (appEvent === AppEventEnum.APP_ERROR) {
      notificationType = notificationTypes[3]
    }

    notify({
      title: data.title,
      description: data.description,
      type: notificationType,
      duration: 8000,
      closeable: true,
    })
  }
}

export const useAppContainer = () => {
  const data = reactive({})

  const triggerLogoutUserEvent = () => {
    parent.postMessage(AppEventEnum.LOGOUT_USER, getEnv('VITE_APP_PORTAL_URL'))
  }

  const triggerBackHomeEvent = () => {
    parent.postMessage(AppEventEnum.BACK_HOME, getEnv('VITE_APP_PORTAL_URL'))
  }

  const triggerAppLoadedEvent = () => {
    parent.postMessage(AppEventEnum.APP_MOUNTED, getEnv('VITE_APP_PORTAL_URL'))
  }

  const triggerAppNotificationEvent = (data: NotificationPayload) => {
    triggerAppNotification(AppEventEnum.APP_NOTIFICATION, data)
  }

  const triggerAppErrorNotificationEvent = (data: NotificationPayload) => {
    triggerAppNotification(AppEventEnum.APP_ERROR, data)
  }

  const triggerAppWarningNotificationEvent = (data: NotificationPayload) => {
    triggerAppNotification(AppEventEnum.APP_WARNING, data)
  }

  const triggerAppSuccessNotificationEvent = (data: NotificationPayload) => {
    triggerAppNotification(AppEventEnum.APP_SUCCESS, data)
  }

  const triggerAppMetaDataEvent = (data: AppMeta | undefined) => {
    parent.postMessage(
      {
        type: AppEventEnum.APP_META,
        payload: JSON.parse(JSON.stringify(data)),
      },
      getEnv('VITE_APP_PORTAL_URL')
    )
  }

  const setAppContainerEventListener = () => {
    const { locale } = useI18n()

    window.addEventListener(
      'message',
      (event) => {
        if (
          event.data &&
          typeof event.data === 'string' &&
          event.origin === getEnv('VITE_APP_PORTAL_URL')
        ) {
          if (event.data.includes(ContainerEventEnum.CHANGE_LOCALE)) {
            const language = event.data.split(' ')
            locale.value = language[1]
          } else if (
            event.data.includes(ContainerEventEnum.CHANGE_TOUCH_MODE)
          ) {
            const isNewTouchMode = event.data.split(' ')[1]
            isTouchMode.value = !!isNewTouchMode
          }
        }
      },
      false
    )
  }

  const sendMessageToAppContainer = (message: MessageType) => {
    const messageTitle = getMessageTitle(message)
    const messageText = getMessageText(message)

    switch (message.messageType) {
      case MessageTypeEnum.Error:
        triggerAppErrorNotificationEvent({
          title: messageTitle,
          description: messageText,
        })
        break
      case MessageTypeEnum.Warning:
        triggerAppWarningNotificationEvent({
          title: messageTitle,
          description: messageText,
        })
        break
      case MessageTypeEnum.Success:
        triggerAppSuccessNotificationEvent({
          title: messageTitle,
          description: messageText,
        })
        break
      case MessageTypeEnum.Information:
        triggerAppNotificationEvent({
          title: messageTitle,
          description: messageText,
        })
        break
      default:
        break
    }
  }

  const setThemeEventListener = (
    isThemeSelected: Ref<boolean>,
    isDark: Ref<boolean>
  ) => {
    window.addEventListener(
      'message',
      (event) => {
        if (
          event.data &&
          typeof event.data === 'string' &&
          event.data.includes('CHANGE_THEME') &&
          (event.origin === getEnv('VITE_APP_PORTAL_URL') ||
            event.origin === document.location.origin)
        ) {
          isThemeSelected.value = true
          const newTheme = event.data.split(' ')[1]
          isDark.value = newTheme === 'dark'
        }
      },
      false
    )
  }

  const triggerUserIdleEvent = () => {
    parent.postMessage(
      { type: 'USER_IDLE', payload: null },
      getEnv('VITE_APP_PORTAL_URL')
    )
  }

  const triggerUserActiveEvent = () => {
    parent.postMessage(
      { type: 'USER_ACTIVE', payload: null },
      getEnv('VITE_APP_PORTAL_URL')
    )
  }

  return {
    ...toRefs(data),
    triggerAppLoadedEvent,
    setAppContainerEventListener,
    triggerAppNotificationEvent,
    triggerAppErrorNotificationEvent,
    triggerAppWarningNotificationEvent,
    triggerAppSuccessNotificationEvent,
    triggerBackHomeEvent,
    triggerLogoutUserEvent,
    triggerAppMetaDataEvent,
    setThemeEventListener,
    sendMessageToAppContainer,
    triggerUserIdleEvent,
    triggerUserActiveEvent,
  }
}
