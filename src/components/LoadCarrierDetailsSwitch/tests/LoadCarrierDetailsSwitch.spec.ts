import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import LoadCarrierDetailsSwitch from '@/components/LoadCarrierDetailsSwitch/LoadCarrierDetailsSwitch.vue'
import { LoadCarrierDetailsPageEnum } from '@/types/LoadCarrierDetailsPageEnum'

describe('Test LoadCarrierDetailsSwitch', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier-details-switch': {
          item_details: 'Item details',
          order_lines: 'Order lines',
        },
      },
    },
  })

  const wrapper = shallowMount(LoadCarrierDetailsSwitch, {
    global: {
      plugins: [i18n],
    },
    props: {
      modelValue: LoadCarrierDetailsPageEnum.item_details,
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.load-carrier-details-switch').exists()).toBeTruthy()
    expect(wrapper.findAll('.toggle-option').length).toBe(2)
    expect(wrapper.findAll('.toggle-option')[0].text()).toBe('Item details')
    expect(wrapper.findAll('.toggle-option')[1].text()).toBe('Order lines')
    expect(wrapper.findAll('.toggle-option')[0].classes()).toContain('active')
  })

  it('should update modelValue on click', async () => {
    await wrapper.findAll('.toggle-option')[1].trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe(
      LoadCarrierDetailsPageEnum.order_lines
    )
  })
})
