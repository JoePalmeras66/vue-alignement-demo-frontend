import { beforeEach, describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { shallowMount } from '@vue/test-utils'
import LoadCarrierDetailsFooter from '@/components/LoadCarrierDetailsFooter/LoadCarrierDetailsFooter.vue'
import { useApiVersionStore } from '@/stores/useApiVersionStore/useApiVersionStore'

setActivePinia(createPinia())

describe('Test LoadCarrierDetailsFooter', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier-details-footer': {},
      },
    },
  })
  const wrapper = shallowMount(LoadCarrierDetailsFooter, {
    global: {
      plugins: [i18n],
      stubs: {
        LoadCarrierDetailsSwitch: true,
      },
    },
  })
  const apiVersionStore = useApiVersionStore()

  beforeEach(() => {
    apiVersionStore.$reset()
  })

  it('should render correctly', () => {
    expect(wrapper.find('.load-carrier-details-footer').exists()).toBeTruthy()
    expect(wrapper.find('icon-button-stub').exists()).toBeTruthy()
    expect(wrapper.find('icon-button-stub').attributes()).toHaveProperty('icon')
    expect(wrapper.find('icon-button-stub').attributes().icon).toBe(
      'arrow-left'
    )
    expect(
      wrapper.find('load-carrier-details-switch-stub').exists()
    ).toBeFalsy()
  })

  it('should render details switch', async () => {
    apiVersionStore.supportedVersionsByBackend['pcots-ext'] = [
      { version: '1.0.0' },
      { version: '2.0.0' },
    ]
    await new Promise(process.nextTick)
    expect(
      wrapper.find('load-carrier-details-switch-stub').exists()
    ).toBeTruthy()
  })

  it('should not render details switch', async () => {
    apiVersionStore.supportedVersionsByBackend['pcots-ext'] = [
      { version: '1.0.0' },
    ]
    await new Promise(process.nextTick)
    expect(
      wrapper.find('load-carrier-details-switch-stub').exists()
    ).toBeFalsy()
  })
})
