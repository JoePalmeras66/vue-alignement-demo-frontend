import { AxiosError } from 'axios'
import { ZodType } from 'zod'
import { useLogger } from '@tgw-components/core'
import i18n from '@/plugins/i18nFactory'
import { useMessage } from '@/composables/useMessage/useMessage'
import {
  EventMessageType,
  EventMessageTypeValidator,
  MessageType,
  MessageTypeValidator,
} from '@/types/Api/pcots/PcotsApiModel'
import { PcotsEventEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { WorkstationChangedEventTypeValidator } from '@/types/Api/pcots/Events/WorkstationChanged/WorkstationChangedEventType'
import { ItemScannedEventTypeValidator } from '@/types/Api/pcots/Events/ItemScanned/ItemScannedEventType'
import { OccupancyChangedEventTypeValidator } from '@/types/Api/pcots/Events/OccupancyChanged/OccupancyChangedEventType'
import { TaskExecutionStartedEventTypeValidator } from '@/types/Api/pcots/Events/TaskExecutionStarted/TaskExecutionStartedEventType'
import { UserNotificationEventTypeValidator } from '@/types/Api/pcots/Events/UserNotification/UserNotificationEventType'
import { RobotStateChangedEventTypeValidator } from '@/types/Api/pcots/Events/RobotStateChanged/RobotStateChangedEventType'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'

const handleStatusCodeErrors = (error: any, message: string) => {
  const Logger = useLogger()
  const { triggerAppErrorNotificationEvent, triggerLogoutUserEvent } =
    useAppContainer()
  // @ts-ignore i18n.global is big
  const { t } = i18n.global

  if (error.value.response.status === 401) {
    Logger?.error('401 - Error, Unauthorized')
    // no session cookie is set --> send a message to the portal to logout
    triggerLogoutUserEvent()
    return true
  } else if (error.value.response.status === 403) {
    // missing permission. Show error message notification.
    Logger?.error(t(message))
    triggerAppErrorNotificationEvent({
      title: t('notifications.error'),
      description: t(message),
    })
    return true
  }

  return false
}

const handleAxiosError = (
  data: any,
  error: any,
  messageKey: string,
  displayNotification = true
): boolean => {
  const Logger = useLogger()
  const { triggerAppErrorNotificationEvent, sendMessageToAppContainer } =
    useAppContainer()
  // @ts-ignore i18n.global is big
  const { t } = i18n.global
  let shouldTriggerBackHome = true

  if (error.value.name === 'AxiosError') {
    const axiosError = error.value as AxiosError
    const messageParseResult = MessageTypeValidator.safeParse(
      axiosError?.response?.data
    )
    if (messageParseResult.success) {
      shouldTriggerBackHome = false
      if (displayNotification) {
        sendMessageToAppContainer(messageParseResult.data)
      }
    } else {
      Logger?.error(axiosError)
      if (displayNotification) {
        triggerAppErrorNotificationEvent({
          title: t(`${messageKey}-title`),
          description: t(`${messageKey}-description`),
        })
      }
    }
  }

  return shouldTriggerBackHome
}

const handleOracleError = (error: any) => {
  // @ts-ignore i18n.global is big
  const { t } = i18n.global
  const { triggerAppErrorNotificationEvent } = useAppContainer()
  const Logger = useLogger()

  // handle oracle errors
  Logger?.error(error.value)
  triggerAppErrorNotificationEvent({
    title: t('notifications.error'),
    description: error.value,
  })
  throw error.value
}

const handleApplicationError = (data: any) => {
  const { triggerAppErrorNotificationEvent } = useAppContainer()
  const { getMessageTitle, getMessageText } = useMessage()
  const Logger = useLogger()

  if (data.message) {
    // handle application errors
    const errorTitle = getMessageTitle(data.message)
    const errorMessage = getMessageText(data.message)
    Logger?.error(errorTitle, errorMessage)
    triggerAppErrorNotificationEvent({
      title: errorTitle,
      description: errorMessage,
    })
    throw data.message
  } else {
    Logger.error('Error message not available', data)
  }
}

/**
 * Handle response errors
 * @param data - payload from the response
 * @param error - error from the response
 * @param messages - array of messages to show in the notifications (insufficient permissions, error message)
 * @param displayNotification - Should a notification be displayed in app container
 * @returns true if an error occurred, false otherwise
 */
export const handleRequestError = async (
  data: any,
  error: any,
  messages: [string, string],
  displayNotification = true
) => {
  const { triggerBackHomeEvent, triggerAppErrorNotificationEvent } =
    useAppContainer()
  const Logger = useLogger()
  const { t } = i18n.global

  // Check if we get an error back and throw it if there is one
  if (error.value !== '') {
    if (error.value.response) {
      let shouldTriggerBackHome = true
      if (!handleStatusCodeErrors(error, messages[0])) {
        shouldTriggerBackHome = handleAxiosError(
          data,
          error,
          messages[1],
          displayNotification
        )
      }
      if (shouldTriggerBackHome) {
        Logger?.info('Trigger back home event')
        triggerBackHomeEvent()
      }
      throw error.value
    } else if (error.value.code === 'ERR_NETWORK') {
      Logger?.error(
        'Network error occured, please check your network connection and try again.'
      )
      triggerAppErrorNotificationEvent({
        title: t('axios_errors.error'),
        description: t('axios_errors.network_error'),
      })
    } else if (error.value !== '') {
      handleOracleError(error)
    } else {
      handleApplicationError(data)
    }
    return true
  }
  return false
}

export const validateResponse = (response: any, validator: ZodType) => {
  const { triggerAppErrorNotificationEvent } = useAppContainer()
  // @ts-ignore i18n.global is big
  const { t } = i18n.global
  const Logger = useLogger()

  const validationResult = validator.safeParse(response)

  if (!validationResult.success) {
    triggerAppErrorNotificationEvent({
      title: t('notifications.error'),
      description: validationResult.error.message,
    })
    Logger.error('Validation error', response)
    // No log cause there is a global exception handler which logs unhandled errors
    throw validationResult.error
  }
}

export const validatePcotsEventMessage = (data: EventMessageType) => {
  const Logger = useLogger()
  try {
    validateResponse(data, EventMessageTypeValidator)
  } catch (exception) {
    Logger.error('Validation error', exception, data)
    throw exception
  }

  let validator
  switch (data.eventType) {
    case PcotsEventEnum.WorkstationChangedEvent:
      validator = WorkstationChangedEventTypeValidator
      break
    case PcotsEventEnum.ConfirmButtonPressedEvent:
      break
    case PcotsEventEnum.ItemScannedEvent:
      validator = ItemScannedEventTypeValidator
      break
    case PcotsEventEnum.OccupancyChangedEvent:
      validator = OccupancyChangedEventTypeValidator
      break
    case PcotsEventEnum.TaskExecutionStartedEvent:
      validator = TaskExecutionStartedEventTypeValidator
      break
    case PcotsEventEnum.UserNotificationEvent:
      validator = UserNotificationEventTypeValidator
      break
    case PcotsEventEnum.RobotStateChangedEvent:
      validator = RobotStateChangedEventTypeValidator
      break
  }

  if (validator) {
    try {
      // Validate internal event data
      validateResponse(data.data, validator)
    } catch (exception) {
      Logger.error('Validation error', exception, data)
      throw exception
    }
  }
}

export const validateMessageType = (message: MessageType) => {
  const Logger = useLogger()

  try {
    validateResponse(message, MessageTypeValidator)
  } catch (exception) {
    Logger.error('Validation error', exception, message)
    throw exception
  }
}

export const getMessageKeyPermission = (
  apiKey: ApiNameEnum,
  key: string
): string => {
  return `${apiKey}-api.insufficient_permission.${key}`
}

export const getMessageKeyError = (
  apiKey: ApiNameEnum,
  key: string
): string => {
  return `${apiKey}-api.error_message.${key}`
}
