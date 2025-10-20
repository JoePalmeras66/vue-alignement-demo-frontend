import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import LeavePageDialog from '@/components/LeavePageDialog/LeavePageDialog.vue'
import UndoSplitPickMessageBox from '@/components/UndoSplitPickMessageBox/UndoSplitPickMessageBox.vue'

describe('Test LeavePageDialog', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'leave-page-dialog': {
          title: 'Go back without saving?',
          description:
            'You have unsaved changes.[new_line]If you go back, these changes will not be applied.',
          cancel: 'Cancel',
          go_back: 'Go back',
        },
      },
    },
  })

  const wrapper = mount(LeavePageDialog, {
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
        wrapper.vm as InstanceType<typeof UndoSplitPickMessageBox>
      ).showAndWait()
    }, 1)
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(wrapper.find('.leave-page-dialog').exists()).toBeTruthy()
    expect(
      wrapper.find('.tgw-message-box__dialog-header').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.tgw-message-box__icon-container').exists()
    ).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').text()).toBe(
      'Go back without saving?'
    )
    expect(wrapper.find('.tgw-message-box__description').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__description').text()).toBe(
      'You have unsaved changes.\nIf you go back, these changes will not be applied.'
    )
    expect(wrapper.findAll('.dialog-button').length).toBe(2)
    expect(wrapper.findAll('.dialog-button')[0].text()).toBe('Cancel')
    expect(wrapper.findAll('.dialog-button')[1].text()).toBe('Go back')
    await wrapper.findAll('.dialog-button')[1].trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(submitted).toBeTruthy()
  })
})
