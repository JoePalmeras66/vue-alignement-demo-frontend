import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import IconButton from '@/components/IconButton/IconButton.vue'

describe('Test IconButton', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
  })
  const wrapper = mount(IconButton, {
    global: {
      plugins: [i18n],
    },
    props: { icon: 'status-warning-triangle', text: 'test', type: 'primary' },
  })

  it('should render correctly', async () => {
    expect(wrapper.find('.icon-button').exists()).toBeTruthy()
    expect(wrapper.find('.flex-container').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-icon').exists()).toBeTruthy()
    expect(wrapper.find('svg').exists()).toBeTruthy()
    expect(wrapper.find('path').exists()).toBeTruthy()
    expect(wrapper.find('.button-text').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-icon').classes()).not.toContain('no-text')
    const path = wrapper.find('path')
    const text = wrapper.find('.button-text')
    expect(path.attributes()).toHaveProperty('fill')
    expect(path.attributes().fill).toBe('var(--tgw-icon-primary)')
    expect(text.text()).toBe('test')
  })

  it('should set color with props', async () => {
    await wrapper.setProps({
      text: 'test',
      icon: 'status-warning-triangle',
      iconColor: 'var(--there-should-be-a-cool-color)',
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('path').exists()).toBeTruthy()
    const path = wrapper.find('path')
    expect(path.attributes()).toHaveProperty('fill')
    expect(path.attributes().fill).toBe('var(--there-should-be-a-cool-color)')
  })

  it('should remove margin from icon when no text', async () => {
    await wrapper.setProps({ text: '', icon: 'status-warning-triangle' })
    await new Promise(process.nextTick)
    expect(wrapper.find('.tgw-icon').exists()).toBeTruthy()
    const icon = wrapper.find('.tgw-icon')
    expect(icon.classes()).toContain('no-text')
  })

  it('should align to left', async () => {
    await wrapper.setProps({
      text: '',
      icon: 'status-warning-triangle',
      iconAlignment: 'left',
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.flex-container').classes()).toContain('left')
  })
})
