import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import LoadCarrierNoRead from '@/components/LoadCarrierNoRead/LoadCarrierNoRead.vue'

describe('Test LoadCarrierNoRead', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier-no-read': {
          load_carrier_no_read: 'Behälter konnte nicht gelesen werden',
          enter_load_carrier_number: 'Behälternummer eingeben',
        },
      },
    },
  })
  const wrapper = mount(LoadCarrierNoRead, {
    global: {
      plugins: [i18n],
      stubs: {
        TgwIcon: true,
      },
    },
    props: {},
  })
  it('should render correctly', () => {
    expect(wrapper.find('.no-read-container').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').exists()).toBeTruthy()
    expect(wrapper.find('.no-read-text').exists()).toBeTruthy()
    expect(wrapper.find('.no-read-button').exists()).toBeTruthy()
  })

  it('should show quantity input on click of enterLoadCarrierNumber button', async () => {
    expect(wrapper.find('.quantity-input-dialog').exists()).toBeFalsy()
    const enterLoadCarrierNumberButton = wrapper.find('.no-read-button')
    await enterLoadCarrierNumberButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.find('.quantity-input-dialog').exists()).toBeTruthy()
  })

  it('should emit identifyLoadCarrier on submit of quantity input', async () => {
    expect(wrapper.emitted()).not.toHaveProperty('identifyLoadCarrier')
    const inputField = wrapper.find('input')
    expect(inputField.exists()).toBeTruthy()
    await inputField.setValue('123456')
    const submitButton = wrapper.find('.submit-button')
    await submitButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('identifyLoadCarrier')
  })
})
