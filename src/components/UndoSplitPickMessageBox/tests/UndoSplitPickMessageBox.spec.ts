// noinspection DuplicatedCode

import { describe, expect, it } from 'vitest'

import { VueWrapper, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import UndoSplitPickMessageBox from '@/components/UndoSplitPickMessageBox/UndoSplitPickMessageBox.vue'

describe('Test UndoSplitPickMessageBox', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'message-box': {
          cancel: 'Cancel',
          confirm: 'Confirm',
        },
        'undo-split-pick-message-box': {
          undo_split_pick_title: 'Undo split pick?',
          undo_split_pick_description:
            'This pick will be restored to its original state. You can then split the pick again.',
        },
      },
    },
  })
  const wrapper: VueWrapper<any> = mount(UndoSplitPickMessageBox, {
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

    expect(wrapper.find('.undo-split-pick-message-box').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').text()).toBe(
      'Undo split pick?'
    )
    expect(wrapper.find('.tgw-message-box__description').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__description').text()).toBe(
      'This pick will be restored to its original state. You can then split the pick again.'
    )
    expect(wrapper.findAll('.dialog-button').length).toBe(2)
    await wrapper.findAll('.dialog-button')[1].trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(submitted).toBeTruthy()
  })

  it('should return cancelled', async () => {
    let submitted = true
    setTimeout(async () => {
      submitted = await (
        wrapper.vm as typeof UndoSplitPickMessageBox
      ).showAndWait()
    }, 1)
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(wrapper.find('.undo-split-pick-message-box').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').text()).toBe(
      'Undo split pick?'
    )
    expect(wrapper.find('.tgw-message-box__description').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__description').text()).toBe(
      'This pick will be restored to its original state. You can then split the pick again.'
    )
    expect(wrapper.findAll('.dialog-button').length).toBe(2)
    await wrapper.findAll('.dialog-button')[0].trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(submitted).toBeFalsy()
  })
})
