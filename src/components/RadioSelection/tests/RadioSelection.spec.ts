import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import RadioSelection from '@/components/RadioSelection/RadioSelection.vue'
import { SupportedStationType } from '@/types/Api/wm/WmApiModel'

describe('Test RadioSelection', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'radio-selection': {},
      },
    },
  })

  const wrapper = mount(RadioSelection, {
    global: {
      plugins: [i18n],
    },
    props: {
      list: [
        {
          id: '101',
          name: 'en="My Station 1";de="Meine Station 1"',
          path: '',
        },
        {
          id: '102',
          name: 'My Station 2',
          path: '',
        },
      ] as SupportedStationType[],
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.radio-selection').exists()).toBeTruthy()
    expect(wrapper.find('.radio-selection-scrollbar').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-radio').exists()).toBeTruthy()
    expect(wrapper.findAll('.workstation-name').length > 0).toBeTruthy()
    expect(wrapper.find('.workstation-icon').exists()).toBeTruthy()
    expect(wrapper.findAll('.workstation-name')[0].text()).toBe('My Station 1')
  })

  it('should select on click', async () => {
    const selectionItem = wrapper.findAll('.tgw-radio')
    expect(selectionItem.length > 0).toBeTruthy()
    await selectionItem[0].trigger('click')
    await new Promise(process.nextTick)
    expect(selectionItem[0].classes().includes('is-checked')).toBeTruthy()
    expect(selectionItem[1].classes().includes('is-checked')).toBeFalsy()
  })

  it('should deselect on click of another item', async () => {
    const selectionItem = wrapper.findAll('.tgw-radio')
    await selectionItem[1].trigger('click')
    await new Promise(process.nextTick)
    expect(selectionItem[0].classes().includes('is-checked')).toBeFalsy()
    expect(selectionItem[1].classes().includes('is-checked')).toBeTruthy()
  })
})
