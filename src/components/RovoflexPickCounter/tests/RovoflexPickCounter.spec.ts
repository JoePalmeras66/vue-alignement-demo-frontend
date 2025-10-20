import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import RovoflexPickCounter from '@/components/RovoflexPickCounter/RovoflexPickCounter.vue'

describe('Test RovoflexPickCounter', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'rovoflex-pick-counter': {},
      },
    },
  })
  const wrapper = mount(RovoflexPickCounter, {
    global: {
      plugins: [i18n],
      stubs: {
        ElProgress: true,
      },
    },
    props: {
      currentCount: 2,
      targetCount: 4,
    },
  })
  it('should render correctly', () => {
    expect(wrapper.find('.rovoflex-pick-counter').exists()).toBeTruthy()
    expect(wrapper.find('.rovoflex-pick-counter__label').exists()).toBeTruthy()
    expect(wrapper.find('.rovoflex-pick-counter__current-count').text()).toBe(
      '2'
    )
    expect(wrapper.find('.rovoflex-pick-counter__target-count').text()).toBe(
      '/4'
    )
    const progressBar = wrapper.find('.rovoflex-pick-counter__progress-bar')
    expect(progressBar.exists()).toBeTruthy()
    expect(progressBar.attributes().percentage).toBe('50')
  })

  it('should update the percentage when the props change', async () => {
    let progressBar = wrapper.find('.rovoflex-pick-counter__progress-bar')
    expect(progressBar.exists()).toBeTruthy()
    expect(progressBar.attributes().percentage).toBe('50')
    await wrapper.setProps({
      currentCount: 3,
      targetCount: 4,
    })
    progressBar = wrapper.find('.rovoflex-pick-counter__progress-bar')
    expect(progressBar.exists()).toBeTruthy()
    expect(progressBar.attributes().percentage).toBe('75')
  })
})
