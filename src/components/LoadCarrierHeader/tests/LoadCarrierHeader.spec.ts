import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import LoadCarrierHeader from '@/components/LoadCarrierHeader/LoadCarrierHeader.vue'
import LoadCarrierHeaderItem from '@/components/LoadCarrierHeaderItem/LoadCarrierHeaderItem.vue'
import { Position } from '@/types/Position'
import { getSourceLoadCarrier } from '@/helpers/testDataProvider'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

describe('Test LoadCarrierHeader', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier-header': {
          source: 'Source',
          target: 'Target',
          no_read_header: 'NOREAD',
        },
      },
    },
  })
  const wrapper = shallowMount(LoadCarrierHeader, {
    global: {
      plugins: [i18n],
    },
    props: {
      pcotsLocation: PcotsLocationEnum.Source,
      loadCarrier: getSourceLoadCarrier(),
      position: Position.left,
      headerData: '0815',
      noRead: false,
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.load-carrier-header').exists()).toBeTruthy()
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(wrapper.find('.header-item').exists()).toBeTruthy()
    expect(wrapper.find('.header-text').exists()).toBeTruthy()
    expect(wrapper.find('.header-text').text()).toBe('Source')
    const loadCarrierHeaderItem = wrapper.findComponent(LoadCarrierHeaderItem)
    expect(loadCarrierHeaderItem.attributes()).toHaveProperty('color')
    expect(loadCarrierHeaderItem.attributes().color).toBe(
      'var(--tgw-icon-secondary)'
    )
  })

  it('should render source left correctly', () => {
    const headerItem = wrapper.find('.header-item')
    expect(headerItem.classes()).toContain('left')
    const headerText = wrapper.find('.header-text')
    expect(headerText.classes()).toContain('left')
    expect(headerText.text()).toBe('Source')
    expect(wrapper.vm.headerInfoIcon).toBe('load-carrier-on-its-way')
  })

  it('should render target right correctly', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Target,
      position: Position.right,
      noRead: false,
    })
    const headerItem = wrapper.find('.header-item')
    expect(headerItem.classes()).toContain('right')
    const headerText = wrapper.find('.header-text')
    expect(headerText.classes()).toContain('right')
    expect(headerText.text()).toBe('Target')
    expect(wrapper.vm.headerInfoIcon).toBe('load-carrier-send')
  })

  it('should render noRead correctly', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Target,
      position: Position.right,
      noRead: true,
    })
    expect(wrapper.find('.load-carrier-header').exists()).toBeTruthy()
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(wrapper.find('.header-item').exists()).toBeFalsy()
    expect(wrapper.find('.header-text').exists()).toBeTruthy()
    expect(wrapper.find('.header-text').text()).toBe('Target')
  })
})
