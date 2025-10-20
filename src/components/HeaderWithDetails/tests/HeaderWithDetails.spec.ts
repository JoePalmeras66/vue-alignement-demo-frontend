import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import HeaderWithDetails from '@/components/HeaderWithDetails/HeaderWithDetails.vue'

describe('Test HeaderWithDetails', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {},
    },
  })
  const wrapper = shallowMount(HeaderWithDetails, {
    global: {
      plugins: [i18n],
    },
    props: {
      text: 'Wos gibts denn heid zmittog?',
      subTexts: ['Leberkassemmal', 'M13 mit lolle'],
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.header-with-details').exists()).toBeTruthy()
    expect(wrapper.find('.header-text').exists()).toBeTruthy()
    expect(wrapper.find('.header-text').text()).toBe(
      'Wos gibts denn heid zmittog?'
    )
    expect(wrapper.findAll('.sub-text-item__text').length).toBe(2)
    expect(wrapper.findAll('.sub-text-item__text')[0].text()).toBe(
      'Leberkassemmal'
    )
    expect(wrapper.findAll('.sub-text-item__text')[1].text()).toBe(
      'M13 mit lolle'
    )
    expect(wrapper.findAll('.sub-text-item__dot').length).toBe(1)
  })
})
