import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import LoadCarrierDetailsCompartment from '@/components/LoadCarrierDetailsCompartment/LoadCarrierDetailsCompartment.vue'
import {
  getCompartment,
  getUnknownItemCompartment,
} from '@/helpers/testDataProvider'

describe('Test LoadCarrierDetailsCompartment', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier-details-compartment': {},
      },
    },
  })
  const wrapper = shallowMount(LoadCarrierDetailsCompartment, {
    global: {
      plugins: [i18n],
    },
    props: {
      compartment: getCompartment(),
      state: 'none',
      isMultiItem: false,
      compartmentCount: 1,
    },
  })

  it('should render correctly', () => {
    expect(
      wrapper.find('.load-carrier-details-compartment').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.load-carrier-details-compartment').classes()
    ).toContain('filled')
    expect(wrapper.find('.header-container').exists()).toBeTruthy()
    expect(wrapper.find('.header-container.cycle-count').exists()).toBeFalsy()
    expect(wrapper.find('.quantity').exists()).toBeTruthy()
    expect(wrapper.find('.quantity').text()).toBe('10')
    expect(
      wrapper.find('.item-image-container .item-image').attributes()
    ).toHaveProperty('src')
    expect(
      wrapper.find('.item-image-container .item-image').attributes().src
    ).toBe('../../../src/assets/images/item-images/TGW_PEN.png')
    expect(wrapper.find('.content-container').exists()).toBeTruthy()
    expect(wrapper.find('.item-name').exists()).toBeTruthy()
    expect(wrapper.find('.item-name').text()).toBe('TGW Pen')
    expect(wrapper.find('.item-number').exists()).toBeTruthy()
    expect(wrapper.find('.item-number').text()).toBe('800002')
  })

  it('should render active correctly', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      state: 'active',
      isMultiItem: false,
      compartmentCount: 1,
    })
    expect(
      wrapper.find('.load-carrier-details-compartment').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.load-carrier-details-compartment').classes()
    ).toContain('filled')
    expect(
      wrapper.find('.load-carrier-details-compartment').classes()
    ).toContain('active')
  })

  it('should render disable_selection correctly', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      state: 'disable_selection',
      isMultiItem: false,
      compartmentCount: 1,
    })
    expect(
      wrapper.find('.load-carrier-details-compartment').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.load-carrier-details-compartment').classes()
    ).not.toContain('filled')
    expect(
      wrapper.find('.load-carrier-details-compartment').classes()
    ).toContain('disable-selection')
  })

  it('should render multi item correctly', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      state: 'active',
      isMultiItem: true,
      compartmentCount: 1,
    })
    expect(
      wrapper.find('.load-carrier-details-compartment').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.load-carrier-details-compartment').classes()
    ).toContain('filled')
    expect(
      wrapper.find('.load-carrier-details-compartment').classes()
    ).toContain('active')
    expect(
      wrapper.find('.load-carrier-details-compartment').classes()
    ).toContain('is-multi-item')
  })

  it('should emit compartmentClicked', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      state: 'none',
      isMultiItem: false,
      compartmentCount: 1,
    })

    expect(wrapper.emitted()).not.toHaveProperty('compartmentClicked')
    await wrapper.find('.load-carrier-details-compartment').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('compartmentClicked')
    expect((wrapper.emitted().compartmentClicked[0] as [0])[0]).toEqual(
      getCompartment()
    )
  })

  it('should render cylce counting compartment correctly', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      state: 'none',
      isMultiItem: false,
      compartmentCount: 1,
      isCycleCount: true,
    })
    expect(
      wrapper.find('.load-carrier-details-compartment').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.load-carrier-details-compartment').classes()
    ).not.toContain('filled')
    expect(wrapper.find('.header-container').exists()).toBeTruthy()
    expect(
      wrapper.find('.header-container.cycle-count.single-compartment').exists()
    ).toBeTruthy()
    expect(wrapper.find('.quantity').exists()).toBeTruthy()
    expect(wrapper.find('.quantity').text()).toBe('')
    expect(
      wrapper.find('.item-image-container .item-image').exists()
    ).toBeFalsy()
    expect(
      wrapper.find('.content-container.cycle-count.single-compartment').exists()
    ).toBeTruthy()
    expect(wrapper.find('.item-name').exists()).toBeTruthy()
    expect(wrapper.find('.item-name').text()).toBe('')
    expect(wrapper.find('.item-number').exists()).toBeTruthy()
    expect(wrapper.find('.item-number').text()).toBe('')
  })

  it('should render unknown item correctly', async () => {
    await wrapper.setProps({
      compartment: getUnknownItemCompartment('1', 1, 1),
      state: 'none',
      isMultiItem: false,
      compartmentCount: 1,
      isCycleCount: true,
    })
    expect(
      wrapper.find('.load-carrier-details-compartment').exists()
    ).toBeTruthy()
    expect(wrapper.find('.header-container.cycle-count').exists()).toBeTruthy()
    expect(
      wrapper
        .find(
          '.header-container.cycle-count .item-image-container.unknown-item'
        )
        .exists()
    ).toBeTruthy()
    expect(wrapper.find('.quantity').text()).toBe('1')
    expect(
      wrapper.find('.item-image-container .item-image').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.content-container.cycle-count.single-compartment').exists()
    ).toBeTruthy()

    expect(wrapper.find('.item-name').text()).toBe('Unknown Item 1')
    expect(wrapper.find('.item-number').text()).toBe('-')
  })
})
