import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import MessageContainer from '@/components/MessageContainer/MessageContainer.vue'

describe('Test MessageContainer', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
  })
  const wrapper = mount(MessageContainer, {
    global: {
      plugins: [i18n],
    },
    props: { messageText: 'My text to display! [highlighted][/highlighted]' },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.message-container').exists()).toBeTruthy()
    expect(wrapper.find('.message-text').exists()).toBeTruthy()
    expect(wrapper.find('.message-text').text()).contains('My text to display!')
  })
})
