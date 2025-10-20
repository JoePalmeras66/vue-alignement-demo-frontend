import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import CircleIndicator from '@/components/CircleIndicator/CircleIndicator.vue'

describe('Test CircleIndicator', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
  })
  const wrapper = mount(CircleIndicator, {
    global: {
      plugins: [i18n],
    },
    props: {
      backgroundColor: 'red',
      icon: 'edit',
    },
  })

  it('should not render indicator text', () => {
    expect(wrapper.find('.circle-indicator-container').exists()).toBeTruthy()
    expect(
      wrapper.find('.circle-indicator-container .tgw-icon').exists()
    ).toBeTruthy()
    expect(
      wrapper
        .find('.circle-indicator-container .circle-indicator-text')
        .exists()
    ).toBeFalsy()
  })

  it('should render correctly', async () => {
    await wrapper.setProps({
      backgroundColor: 'red',
      icon: 'edit',
      text: 'Hi',
    })
    expect(wrapper.find('.circle-indicator-container').exists()).toBeTruthy()
    expect(
      wrapper.find('.circle-indicator-container .tgw-icon').exists()
    ).toBeTruthy()
    expect(
      wrapper
        .find('.circle-indicator-container .circle-indicator-text')
        .exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.circle-indicator-container .circle-indicator-text').text()
    ).toBe('Hi')
  })
})
