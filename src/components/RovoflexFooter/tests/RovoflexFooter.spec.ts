// noinspection DuplicatedCode

import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import RovoflexFooter from '@/components/RovoflexFooter/RovoflexFooter.vue'
import { RovoflexState } from '@/types/RovoflexState'

describe('Test RovoflexFooter', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'rovoflex-footer': {
          picking_header: 'Robot is picking',
          picking_description: 'Please stay outside in the safe area',
          error_header: 'Robot has stopped',
          error_description: 'Waiting for manual troubleshooting',
        },
      },
    },
  })
  const wrapper = shallowMount(RovoflexFooter, {
    global: {
      plugins: [i18n],
    },
    props: { state: RovoflexState.RovoflexPicking },
  })

  it('should render Picking correctly', () => {
    expect(wrapper.find('.rovoflex-footer').exists()).toBeTruthy()
    expect(wrapper.find('.content-left').exists()).toBeTruthy()
    expect(wrapper.find('rovoflex-to-manual-stub').exists()).toBeTruthy()
    expect(wrapper.find('.content-mid').exists()).toBeTruthy()
    expect(wrapper.find('.content-right').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').attributes().icon).toBe(
      'status-warning-triangle'
    )
    expect(wrapper.find('tgw-icon-stub').attributes().color).toBe(
      'var(--tgw-accent-lighten)'
    )
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(wrapper.find('.header').text()).toBe('Robot is picking')
    expect(wrapper.find('.description').exists()).toBeTruthy()
    expect(wrapper.find('.description').text()).toBe(
      'Please stay outside in the safe area'
    )
  })

  it('should render ManualPickingRequested correctly', async () => {
    await wrapper.setProps({ state: RovoflexState.ManualPickingRequested })
    expect(wrapper.find('.rovoflex-footer').exists()).toBeTruthy()
    expect(wrapper.find('.content-left').exists()).toBeTruthy()
    expect(wrapper.find('rovoflex-to-manual-stub').exists()).toBeTruthy()
    expect(wrapper.find('.content-mid').exists()).toBeTruthy()
    expect(wrapper.find('.content-right').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').attributes().icon).toBe(
      'status-warning-triangle'
    )
    expect(wrapper.find('tgw-icon-stub').attributes().color).toBe(
      'var(--tgw-accent-lighten)'
    )
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(wrapper.find('.header').text()).toBe('Robot is picking')
    expect(wrapper.find('.description').exists()).toBeTruthy()
    expect(wrapper.find('.description').text()).toBe(
      'Please stay outside in the safe area'
    )
  })

  it('should render Error correctly', async () => {
    await wrapper.setProps({ state: RovoflexState.Error })
    expect(wrapper.find('.rovoflex-footer').exists()).toBeTruthy()
    expect(wrapper.find('.content-left').exists()).toBeTruthy()
    expect(wrapper.find('rovoflex-to-manual-stub').exists()).toBeTruthy()
    expect(wrapper.find('.content-mid').exists()).toBeTruthy()
    expect(wrapper.find('.content-right').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').attributes().icon).toBe(
      'status-error-circle'
    )
    expect(wrapper.find('tgw-icon-stub').attributes().color).toBe(
      'rgba(13, 16, 20, 0.86)'
    )
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(wrapper.find('.header').text()).toBe('Robot has stopped')
    expect(wrapper.find('.description').exists()).toBeTruthy()
    expect(wrapper.find('.description').text()).toBe(
      'Waiting for manual troubleshooting'
    )
  })
})
