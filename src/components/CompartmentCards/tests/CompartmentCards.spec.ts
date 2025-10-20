import { describe, expect, it } from 'vitest'

import { VueWrapper, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import CompartmentCards from '@/components/CompartmentCards/CompartmentCards.vue'
import {
  getCompartment,
  getMultiItemCompartment,
} from '@/helpers/testDataProvider'
import { CompartmentState } from '@/types/CompartmentState'
import { CompartmentInfo } from '@/types/CompartmentInfo'

describe('Test CompartmentCards', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
  })
  const wrapper: VueWrapper<any> = mount(CompartmentCards, {
    global: {
      plugins: [i18n],
      stubs: { CompartmentCard: true },
    },
    props: {
      task: undefined,
      compartments: [getCompartment()],
      compartmentInfos: [
        {
          id: '1',
          state: CompartmentState.active,
          stockIndex: 0,
        } as CompartmentInfo,
      ] as CompartmentInfo[],
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.el-carousel')).toBeTruthy()
    expect(wrapper.find('compartment-card-stub')).toBeTruthy()
    expect(wrapper.find('compartment-card-stub').attributes()).toHaveProperty(
      'state'
    )
    expect(wrapper.find('compartment-card-stub').attributes().state).toBe(
      CompartmentState.active
    )
  })

  it('should render multi item correctly', async () => {
    await wrapper.setProps({
      compartments: [getMultiItemCompartment()],
      compartmentInfos: [
        {
          id: '1',
          state: CompartmentState.active,
          stockIndex: 0,
        } as CompartmentInfo,
        {
          id: '1',
          state: CompartmentState.selectable,
          stockIndex: 1,
        } as CompartmentInfo,
      ] as CompartmentInfo[],
    })
    expect(wrapper.find('.el-carousel')).toBeTruthy()
    expect(wrapper.findAll('compartment-card-stub').length).toBe(2)
    expect(
      wrapper.findAll('compartment-card-stub')[0].attributes()
    ).toHaveProperty('state')
    expect(wrapper.findAll('compartment-card-stub')[0].attributes().state).toBe(
      CompartmentState.active
    )
    expect(
      wrapper.findAll('compartment-card-stub')[1].attributes()
    ).toHaveProperty('state')
    expect(wrapper.findAll('compartment-card-stub')[1].attributes().state).toBe(
      CompartmentState.selectable
    )
  })

  it('should emit active compartment changed', async () => {
    const compartment = getCompartment()
    await wrapper.setProps({
      compartments: [compartment],
      compartmentInfos: [
        {
          id: '1',
          state: CompartmentState.selectable,
          stockIndex: 0,
        } as CompartmentInfo,
      ] as CompartmentInfo[],
    })
    expect(wrapper.find('compartment-card-stub')).toBeTruthy()
    expect(wrapper.find('compartment-card-stub').attributes()).toHaveProperty(
      'state'
    )
    expect(wrapper.find('compartment-card-stub').attributes().state).toBe(
      CompartmentState.selectable
    )
    const compartmentCards = wrapper.vm as typeof CompartmentCards
    expect(compartmentCards).toBeTruthy()
    compartmentCards.onCompartmentClicked(compartment)
    expect(wrapper.emitted()).toHaveProperty('activeCompartmentChanged')
    expect(compartmentCards.activeCompartment).toStrictEqual(compartment)
  })
})
