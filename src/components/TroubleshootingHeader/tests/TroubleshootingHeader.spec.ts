import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import TroubleshootingHeader from '@/components/TroubleshootingHeader/TroubleshootingHeader.vue'

describe('Test TroubleshootingHeader', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        troubleshooting: {
          header: {
            report_problem: 'Report problem',
            sub_heading: 'Please select one or more problems',
          },
        },
      },
    },
  })
  const wrapper = shallowMount(TroubleshootingHeader, {
    global: {
      plugins: [i18n],
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.troubleshooting-header').exists()).toBeTruthy()
    expect(wrapper.find('.heading').exists()).toBeTruthy()
    expect(wrapper.find('.sub-heading').exists()).toBeTruthy()
  })
})
