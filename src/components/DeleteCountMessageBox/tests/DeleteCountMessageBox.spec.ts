// noinspection DuplicatedCode

import { describe, expect, it } from 'vitest'

import { VueWrapper, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import DeleteCountMessageBox from '@/components/DeleteCountMessageBox/DeleteCountMessageBox.vue'

describe('Test DeleteCountMessageBox', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'message-box': {
          cancel: 'Cancel',
          confirm: 'Confirm',
        },
        'delete-count-message-box': {
          delete_count_title: 'Delete this count?',
          delete_count_description:
            'This action will delete the selected count.;To count the items again you can do it from the main view as a normal new count.',
          delete: 'Delete count',
        },
      },
    },
  })
  const wrapper: VueWrapper<any> = mount(DeleteCountMessageBox, {
    global: {
      plugins: [i18n],
    },
    props: {
      appendToBody: false,
    },
  })

  it('should render correctly', async () => {
    let submitted = false
    setTimeout(async () => {
      submitted = await (
        wrapper.vm as typeof DeleteCountMessageBox
      ).showAndWait()
    }, 1)
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(wrapper.find('.delete-count-message-box').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').text()).toBe(
      'Delete this count?'
    )

    const bodyTexts = wrapper.findAll('.delete-count-message-box__body-text')
    expect(bodyTexts.length).toBe(2)

    expect(bodyTexts[0].text()).toBe(
      'This action will delete the selected count.'
    )
    expect(bodyTexts[1].text()).toBe(
      'To count the items again you can do it from the main view as a normal new count.'
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
        wrapper.vm as typeof DeleteCountMessageBox
      ).showAndWait()
    }, 1)
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(wrapper.find('.delete-count-message-box').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').text()).toBe(
      'Delete this count?'
    )

    const bodyTexts = wrapper.findAll('.delete-count-message-box__body-text')
    expect(bodyTexts.length).toBe(2)

    expect(bodyTexts[0].text()).toBe(
      'This action will delete the selected count.'
    )
    expect(bodyTexts[1].text()).toBe(
      'To count the items again you can do it from the main view as a normal new count.'
    )

    expect(wrapper.findAll('.dialog-button').length).toBe(2)
    await wrapper.findAll('.dialog-button')[0].trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(submitted).toBeFalsy()
  })
})
