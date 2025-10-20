import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import i18n from '../../../plugins/i18nFactory'
import { MessageParamType, MessageType } from '@/types/Api/pcots/PcotsApiModel'
import { MessageTypeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useMessage } from '@/composables/useMessage/useMessage'

describe('Test useMessage', () => {
  const i18nPlugin = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        testing: {
          test_title: 'Thats a test title',
          test_text: 'Thats a test text',
          test_text_with_param: 'Thats a {0}',
          test_param: 'test param',
        },
      },
    },
  })

  // Set i18n for composable useMessage
  i18n.global.t = i18nPlugin.global.t

  const { getMessageTitle, getMessageText } = useMessage()
  const getMessageType = (
    title: string,
    text: string,
    parameters: MessageParamType[] = []
  ): MessageType => {
    return {
      messageTitle: title,
      messageText: text,
      parameters,
      messageType: MessageTypeEnum.Information,
    } as MessageType
  }

  it('should translate basic messages', () => {
    const message = getMessageType('testing.test_title', 'testing.test_text')
    const title = getMessageTitle(message)
    const text = getMessageText(message)
    expect(title).toBe('Thats a test title')
    expect(text).toBe('Thats a test text')
  })

  it('should add parameter', () => {
    const message = getMessageType(
      'testing.test_title',
      'testing.test_text_with_param',
      [{ value: 'test param without translation', translate: false }]
    )
    const text = getMessageText(message)
    expect(text).toBe('Thats a test param without translation')
  })

  it('should translate parameter', () => {
    const message = getMessageType(
      'testing.test_title',
      'testing.test_text_with_param',
      [{ value: 'testing.test_param', translate: true }]
    )
    const text = getMessageText(message)
    expect(text).toBe('Thats a test param')
  })

  it('should handle missing translations gracefully', () => {
    const message = getMessageType(
      'testing.missing_title',
      'testing.missing_text'
    )
    const title = getMessageTitle(message)
    const text = getMessageText(message)
    expect(title).toBe('testing.missing_title')
    expect(text).toBe('testing.missing_text')
  })

  it('should handle missing translations with parameters gracefully', () => {
    const message = getMessageType(
      '',
      'This should not be translated. Param is {0}',
      [{ value: 'param value', translate: false }]
    )
    const text = getMessageText(message)
    expect(text).toBe('This should not be translated. Param is param value')
  })

  it('should handle missing parameter values gracefully', () => {
    const message = getMessageType(
      'testing.test_title',
      'testing.test_text_with_param',
      [{ value: 'missing_param', translate: true }]
    )
    const text = getMessageText(message)
    expect(text).toBe('Thats a missing_param')
  })

  it('should handle empty parameters array', () => {
    const message = getMessageType(
      'testing.test_title',
      'testing.test_text_with_param'
    )
    const text = getMessageText(message)
    expect(text).toBe('Thats a ')
  })
})
