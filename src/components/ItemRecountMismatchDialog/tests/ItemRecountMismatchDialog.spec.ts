import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import ItemRecountMismatchDialog from '@/components/ItemRecountMismatchDialog/ItemRecountMismatchDialog.vue'

describe('Test ItemRecountMismatchDialog', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'item-recount-mismatch-dialog': {
          title: 'Recount mismatch',
          description:
            'The recently counted amount does not match with the previous one. Please, count the items again.',
          confirm: 'Confirm',
        },
      },
    },
  })
  const wrapper = mount(ItemRecountMismatchDialog, {
    global: {
      plugins: [i18n],
    },
    props: {
      isVisible: true,
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.item-recount-mismatch-dialog').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-icon').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-text').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-text').text()).toBe('Recount mismatch')
    expect(wrapper.find('.dialog-body-description').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-body-description').text()).toBe(
      'The recently counted amount does not match with the previous one. Please, count the items again.'
    )
    expect(wrapper.find('.dialog-button')).toBeTruthy()
    expect(wrapper.find('.dialog-button').find('span').text()).toBe('Confirm')
  })
})
