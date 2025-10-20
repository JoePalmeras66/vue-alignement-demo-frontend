import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import ItemScanFailedDialog from '@/components/ItemScanFailedDialog/ItemScanFailedDialog.vue'

describe('Test ItemScanFailedDialog', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'item-scan-failed-dialog': {
          title: 'Item scan failed',
          description:
            'The last scanned barcode doesn’t match the expected item. Please scan the correct item or report a problem if the barcode is invalid.',
          ok: 'Ok',
        },
      },
    },
  })

  const wrapper = mount(ItemScanFailedDialog, {
    global: {
      plugins: [i18n],
    },
    props: {
      isVisible: true,
    },
  })

  it('should render correctly', async () => {
    expect(wrapper.find('.item-scan-failed-dialog').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-icon').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-text').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-text').text()).toBe('Item scan failed')
    expect(wrapper.find('.dialog-body-description').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-body-description').text()).toBe(
      'The last scanned barcode doesn’t match the expected item. Please scan the correct item or report a problem if the barcode is invalid.'
    )
    expect(wrapper.findAll('.dialog-button').length).toBe(1)
    expect(wrapper.findAll('.dialog-button')[0].text()).toBe('Ok')
  })

  it('should close on ok click', async () => {
    await wrapper.setProps({ isVisible: true })
    await new Promise(process.nextTick)
    expect(wrapper.vm.isVisible).toBeTruthy()
    const okButton = wrapper.findAll('.dialog-button')[0]
    await okButton.trigger('click')
    await new Promise(process.nextTick)
    expect((wrapper.emitted()['update:isVisible'][0] as [0])[0]).toBeFalsy()
  })

  it('should render a custom error text', async () => {
    await wrapper.setProps({
      isVisible: true,
      errorMessage: 'This is my error message!',
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.dialog-body-description').text()).toBe(
      'This is my error message!'
    )
  })
})
