import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import LoadCarrierHeaderItem from '@/components/LoadCarrierHeaderItem/LoadCarrierHeaderItem.vue'

describe('Test LoadCarrierHeaderItem', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
  })
  const wrapper = shallowMount(LoadCarrierHeaderItem, {
    global: {
      plugins: [i18n],
    },
    props: {
      color: 'var(--tgw-icon-secondary)',
      icon: 'load-carrier-send',
      infoText: 'Foo text',
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.load-carrier-info-item').exists()).toBeTruthy()
    expect(wrapper.find('.info-icon').exists()).toBeTruthy()
    expect(wrapper.find('.info-text').exists()).toBeTruthy()
    const infoText = wrapper.find('.info-text')
    expect(infoText.text()).toBe('Foo text')
    expect(wrapper.find('tgw-icon-stub').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').attributes()).toHaveProperty('color')
    expect(wrapper.find('tgw-icon-stub').attributes().color).toBe(
      'var(--tgw-icon-secondary)'
    )
  })
})
