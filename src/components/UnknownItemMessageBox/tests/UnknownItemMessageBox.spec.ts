import { describe, expect, it } from 'vitest'
import { VueWrapper, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import UnknownItemMessageBox from '@/components/UnknownItemMessageBox/UnknownItemMessageBox.vue'

describe('Test UnknownItemMessageBox', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'message-box': {
          cancel: 'Cancel',
          confirm: 'Confirm',
        },
        'unknown-item-message-box': {
          unknown_item_title: 'Item could not be identified',
          unknown_item_description:
            'The load carrier will be sent to the reject station after you complete the cycle. Treat it as a normal item and place it in the corresponding sector.',
        },
      },
    },
  })
  const wrapper: VueWrapper<any> = mount(UnknownItemMessageBox, {
    global: {
      plugins: [i18n],
    },
    props: {
      appendToBody: false,
    },
  })
  it('should render correctly', async () => {
    let submitted: boolean | undefined = false

    setTimeout(async () => {
      submitted = await (
        wrapper.vm as InstanceType<typeof UnknownItemMessageBox>
      ).showAndWait()
    }, 1)
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(wrapper.find('.unknown-item-message-box').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').text()).toBe(
      'Item could not be identified'
    )
    expect(wrapper.find('.tgw-message-box__description').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__description').text()).toBe(
      'The load carrier will be sent to the reject station after you complete the cycle. Treat it as a normal item and place it in the corresponding sector.'
    )
    expect(
      wrapper.find('.tgw-message-box__dont-show-again-wrapper').exists()
    ).toBeTruthy()

    expect(wrapper.findAll('.dialog-button').length).toBe(1)
    await wrapper.findAll('.dialog-button')[0].trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(submitted).toBeTruthy()
  })
})
