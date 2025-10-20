import { MessageType } from '@/types/Api/pcots/PcotsApiModel'
import { useMessage } from '@/composables/useMessage/useMessage'

export class BarcodeValidationResult {
  isValid: boolean
  message?: MessageType

  constructor(isValid: boolean, message?: MessageType) {
    this.isValid = isValid
    this.message = message
  }

  public get errorMessageTranslated(): string | undefined {
    const { getMessageText } = useMessage()
    if (this.message !== undefined) {
      return getMessageText(this.message)
    }
    return undefined
  }
}
