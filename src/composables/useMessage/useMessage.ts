import i18n from '../../plugins/i18nFactory'
import { MessageParamType, MessageType } from '@/types/Api/pcots/PcotsApiModel'

export const useMessage = () => {
  const getMessageTitle = (message: MessageType) => {
    // @ts-ignore i18n.global is big
    const { t } = i18n.global
    let translatedTitle = message.messageTitle
    if (translatedTitle) {
      // @ts-ignore i18n.global is big
      translatedTitle = t(translatedTitle)
    }
    return translatedTitle ?? message.messageTitle ?? ''
  }
  const getMessageText = (message: MessageType) => {
    // @ts-ignore i18n.global is big
    const { t } = i18n.global
    let text = t(message.messageText) ?? message.messageText

    if (message.parameters) {
      const translationParams: string[] = []
      message.parameters.forEach((param: MessageParamType) => {
        if (param.translate) {
          translationParams.push(t(param.value) ?? '')
        } else {
          translationParams.push(param.value)
        }
      })
      text = t(message.messageText, translationParams) ?? message.messageText

      // check if there are still parameters which are not inserted in the text
      if (text.includes('{0}')) {
        for (let i = 0; i < translationParams.length; i++) {
          text = text.replace(`{${i.toString()}}`, translationParams[i])
        }
      }
    }

    return text
  }

  return {
    getMessageTitle,
    getMessageText,
  }
}
