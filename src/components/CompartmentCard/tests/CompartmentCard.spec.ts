import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import CompartmentCard from '@/components/CompartmentCard/CompartmentCard.vue'
import {
  getCompartment,
  getManualConsolidationTask,
} from '@/helpers/testDataProvider'

describe('Test CompartmentCard', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
  })
  const wrapper = shallowMount(CompartmentCard, {
    global: {
      plugins: [i18n],
    },
    props: {
      task: getManualConsolidationTask(),
      compartment: getCompartment(),
      state: CompartmentState.none,
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.compartment-card')).toBeTruthy()
    expect(wrapper.find('el-image-stub')).toBeTruthy()
    expect(wrapper.find('el-image-stub').attributes()).toHaveProperty('src')
    expect(wrapper.find('el-image-stub').attributes().src).toBe(
      '../../../src/assets/images/item-images/TGW_PEN.png'
    )
    expect(wrapper.find('.quantity')).toBeTruthy()
    expect(wrapper.find('.quantity').text()).toBe('10')
    expect(wrapper.find('.item-name')).toBeTruthy()
    expect(wrapper.find('.item-name').text()).toBe('800002')
    expect(wrapper.find('.item-description')).toBeTruthy()
    expect(wrapper.find('.item-description').text()).toBe('TGW Pen')
  })

  it('should render active', async () => {
    await wrapper.setProps({
      task: getManualConsolidationTask(),
      compartment: getCompartment(),
      state: CompartmentState.active,
    })
    expect(wrapper.find('.compartment-card')).toBeTruthy()
    expect(wrapper.find('.compartment-card').classes()).toContain(
      CompartmentState.active
    )
  })

  it('should render selectable', async () => {
    await wrapper.setProps({
      task: getManualConsolidationTask(),
      compartment: getCompartment(),
      state: CompartmentState.selectable,
    })
    expect(wrapper.find('.compartment-card')).toBeTruthy()
    expect(wrapper.find('.compartment-card').classes()).toContain(
      CompartmentState.selectable
    )
  })

  it('should not emit compartmentClicked', async () => {
    await wrapper.setProps({
      task: getManualConsolidationTask(),
      compartment: getCompartment(),
      state: CompartmentState.none,
    })
    await wrapper.find('.compartment-card').trigger('click')
    expect(wrapper.emitted()).not.toHaveProperty('compartmentClicked')
  })

  it('should emit compartmentClicked', async () => {
    await wrapper.setProps({
      task: getManualConsolidationTask(),
      compartment: getCompartment(),
      state: CompartmentState.selectable,
    })
    await wrapper.find('.compartment-card').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('compartmentClicked')
  })
})
