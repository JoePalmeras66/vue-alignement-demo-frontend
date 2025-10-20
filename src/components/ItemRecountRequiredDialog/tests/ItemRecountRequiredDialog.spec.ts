import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import ItemRecountRequiredDialog from '@/components/ItemRecountRequiredDialog/ItemRecountRequiredDialog.vue'

describe('Test ItemRecountRequiredDialog', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'item-recount-required-dialog': {
          title: 'Item recount required',
          description1: 'For security reasons a recount is required.',
          description2: 'Please, count the items again.',
          ok: 'Ok',
        },
      },
    },
  })
  const wrapper = mount(ItemRecountRequiredDialog, {
    global: {
      plugins: [i18n],
    },
    props: {
      isVisible: true,
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.item-recount-required-dialog').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-icon').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-text').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-text').text()).toBe(
      'Item recount required'
    )
    expect(wrapper.find('.dialog-body-description').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-body-description').text()).toBe(
      'For security reasons a recount is required.'
    )
    expect(wrapper.find('.dialog-body-description.fatty').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-body-description.fatty').text()).toBe(
      'Please, count the items again.'
    )
    expect(wrapper.find('.dialog-button').text()).toBeTruthy()
    expect(wrapper.find('.dialog-button').find('span').text()).toBe('Ok')
  })
})
