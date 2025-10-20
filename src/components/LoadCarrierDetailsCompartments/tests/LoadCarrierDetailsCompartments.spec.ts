import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { VueWrapper } from '@vue/test-utils/dist/vueWrapper'
import { mount } from '@vue/test-utils'
import LoadCarrierDetailsCompartments from '@/components/LoadCarrierDetailsCompartments/LoadCarrierDetailsCompartments.vue'
import {
  getCompartmentCycleCounting,
  getEmptyCompartment,
  getMultiItemLoadCarrier,
  getSourceLoadCarrier,
} from '@/helpers/testDataProvider'
import { CycleCountState } from '@/types/CycleCountState'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'

describe('Test LoadCarrierDetailsCompartments', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier-details-compartments': {},
      },
    },
  })
  let wrapper: VueWrapper<any>
  const mountWrapper = (props: any) => {
    if (wrapper !== undefined) {
      wrapper.unmount()
    }
    wrapper = mount(LoadCarrierDetailsCompartments, {
      global: {
        plugins: [i18n],
        stubs: { LoadCarrierDetailsCompartment: true },
      },
      props,
    })
  }

  it('should render correctly', async () => {
    const loadCarrier = getSourceLoadCarrier()
    const selectedCompartment = JSON.parse(
      JSON.stringify(loadCarrier.compartments[0])
    )
    selectedCompartment.stockIndex = 0
    mountWrapper({
      loadCarrier,
      selectedCompartment,
    })
    expect(wrapper.find('.scroll-container').exists()).toBeTruthy()
    expect(
      wrapper.find('load-carrier-details-compartment-stub').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('load-carrier-details-compartment-stub').attributes()
    ).toHaveProperty('state')
    expect(
      wrapper.find('load-carrier-details-compartment-stub').attributes().state
    ).toBe('active')
    expect(
      wrapper.find('load-carrier-details-compartment-stub').attributes()
    ).toHaveProperty('ismultiitem')
    expect(
      wrapper.find('load-carrier-details-compartment-stub').attributes()
        .ismultiitem
    ).toBe('false')
    // Automatically select first filled compartment
    expect(wrapper.emitted()).toHaveProperty('selectedCompartmentChanged')
    expect((wrapper.emitted().selectedCompartmentChanged[0] as [0])[0]).toEqual(
      { ...getSourceLoadCarrier().compartments[0], stockIndex: 0 }
    )
  })

  it('should render multi item with empty compartment correctly', async () => {
    const loadCarrier = getMultiItemLoadCarrier()
    loadCarrier.compartments[0].items[0].quantity = 0
    loadCarrier.compartments[0].items[1].quantity = 0
    await wrapper.setProps({ loadCarrier })
    expect(wrapper.find('.scroll-container').exists()).toBeTruthy()
    expect(wrapper.find('.scroll-container').classes()).toContain(
      'is-multi-item'
    )
    expect(
      wrapper.find('load-carrier-details-compartment-stub').exists()
    ).toBeFalsy()
  })

  it('should render multi item correctly', async () => {
    const loadCarrier = getMultiItemLoadCarrier()
    const selectedCompartment = JSON.parse(
      JSON.stringify(loadCarrier.compartments[0])
    )
    selectedCompartment.stockIndex = 0
    mountWrapper({
      loadCarrier,
      selectedCompartment,
    })
    expect(wrapper.find('.scroll-container').exists()).toBeTruthy()
    expect(wrapper.find('.scroll-container').classes()).toContain(
      'is-multi-item'
    )
    const detailCompartments = wrapper.findAll(
      'load-carrier-details-compartment-stub'
    )
    expect(detailCompartments[0].attributes().ismultiitem).toBe('true')
    expect(detailCompartments[0].attributes().state).toBe('active')
    expect(detailCompartments[0].attributes()).not.toHaveProperty('style')
    expect(detailCompartments[1].attributes().ismultiitem).toBe('true')
    expect(detailCompartments[1].attributes().state).toBe('none')
    expect(detailCompartments[1].attributes()).not.toHaveProperty('style')
  })

  it('should rotate lc', async () => {
    await wrapper.setProps({
      loadCarrier: getSourceLoadCarrier(180),
    })
    expect(
      wrapper.find('load-carrier-details-compartment-stub').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('load-carrier-details-compartment-stub').attributes()
    ).toHaveProperty('style')
    expect(
      wrapper.find('load-carrier-details-compartment-stub').attributes().style
    ).toBe('grid-column: -1 / -2; grid-row: 1 / 2;')
  })

  it('render one empty compartment correctly', async () => {
    const loadCarrier = getSourceLoadCarrier()
    loadCarrier.compartments = [getEmptyCompartment()]
    mountWrapper({
      loadCarrier,
      selectedCompartment: undefined,
    })
    expect(wrapper.find('.scroll-container').exists()).toBeTruthy()
    expect(
      wrapper.find('.scroll-container.one-empty-compartment').exists()
    ).toBeTruthy()
  })

  it('should render multi item for cycle counting correctly', async () => {
    const loadCarrier = getMultiItemLoadCarrier()
    const items = loadCarrier.compartments[0].items
    loadCarrier.compartments[0] = getCompartmentCycleCounting(
      CycleCountState.toDo,
      10
    )
    loadCarrier.compartments[0].items = items
    await wrapper.setProps({
      loadCarrier,
      isCycleCount: true,
    })
    expect(
      wrapper.find('load-carrier-details-compartment-stub').exists()
    ).toBeFalsy()
  })

  it('should render multi item for cycle counting finished correctly', async () => {
    const loadCarrier = getMultiItemLoadCarrier()
    const items = loadCarrier.compartments[0].items
    loadCarrier.compartments[0] = getCompartmentCycleCounting(
      CycleCountState.inProgress,
      10
    )
    loadCarrier.compartments[0].items = items
    await wrapper.setProps({
      loadCarrier,
      isCycleCount: true,
    })
    expect(
      wrapper.find('load-carrier-details-compartment-stub').exists()
    ).toBeTruthy()
  })

  it('should preselect the correct compartment', async () => {
    const { getStockCompartments } = useApiDataHelper()
    const loadCarrier = getMultiItemLoadCarrier()
    const items = loadCarrier.compartments[0].items
    loadCarrier.compartments[0] = getCompartmentCycleCounting(
      CycleCountState.finished,
      10
    )
    loadCarrier.compartments[0].items = items
    mountWrapper({
      loadCarrier,
      isCycleCount: true,
      selectedCompartment: undefined,
    })
    const stockCompartments = getStockCompartments(loadCarrier.compartments)
    expect(wrapper.emitted('selectedCompartmentChanged')![0]).toEqual([
      stockCompartments[0],
    ])
  })
})
