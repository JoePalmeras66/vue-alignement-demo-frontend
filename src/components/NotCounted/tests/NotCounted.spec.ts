import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import NotCounted from '@/components/NotCounted/NotCounted.vue'

describe('Test NotCounted', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        not_counted: {
          not_counted: 'Please count the items first to see the details',
        },
      },
    },
  })
  const wrapper = shallowMount(NotCounted, {
    global: {
      plugins: [i18n],
    },
    props: {},
  })

  it('should render correctly', () => {
    expect(wrapper.find('.not-counted').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').exists()).toBeTruthy()
    expect(wrapper.find('.not-counted__text').exists()).toBeTruthy()
    expect(wrapper.find('.not-counted__text').text()).toBe(
      'Please count the items first to see the details'
    )
  })
})
