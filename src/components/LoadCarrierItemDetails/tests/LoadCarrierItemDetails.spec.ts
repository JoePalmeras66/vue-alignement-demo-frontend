// noinspection DuplicatedCode

import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import LoadCarrierItemDetails from '@/components/LoadCarrierItemDetails/LoadCarrierItemDetails.vue'
import {
  getCompartment,
  getMultiItemCompartment,
  getSourceLoadCarrier,
  getTargetLoadCarrier,
  getUnknownItemCompartment,
} from '@/helpers/testDataProvider'
import { unknownItemUrlLight } from '@/constants/unknownItemUrl'

describe('Test LoadCarrierItemDetails', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier-item-details': {
          no_items_loadcarrier: 'No items in this load carrier',
          no_items_compartment: 'No items in this compartment',
          header_text: 'Item details',
          item_name: 'Item name',
          compartment: 'Compartment',
          item_number: 'Item number',
          quantity: 'Quantity',
          gtins: 'GTINS',
          weight: 'Weight',
        },
      },
    },
  })

  const wrapper = shallowMount(LoadCarrierItemDetails, {
    global: {
      plugins: [i18n],
    },
    props: {
      loadCarrier: undefined,
      selectedCompartment: undefined,
    },
  })

  it('should render correctly', async () => {
    const loadCarrier = getSourceLoadCarrier()
    await wrapper.setProps({
      loadCarrier,
      selectedCompartment: loadCarrier.compartments[0],
    })
    expect(
      wrapper.find('.load-carrier-item-details-container').exists()
    ).toBeTruthy()
    expect(wrapper.find('.header-text').exists()).toBeTruthy()
    expect(wrapper.find('.header-text').text()).toBe('Item details')
    expect(wrapper.find('.item-details-container').exists()).toBeTruthy()
    expect(wrapper.findAll('.name').length).toBe(5)
    expect(wrapper.findAll('.value').length).toBe(5)
    let index = 0
    expect(wrapper.findAll('.name')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.value')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.name')[index].text()).toBe('Item name')
    expect(wrapper.findAll('.value')[index].text()).toBe('TGW Pen')
    index = 1
    expect(wrapper.findAll('.name')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.value')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.name')[index].text()).toBe('Compartment')
    expect(wrapper.findAll('.value')[index].text()).toBe('1')
    index = 2
    expect(wrapper.findAll('.name')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.value')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.name')[index].text()).toBe('Item number')
    expect(wrapper.findAll('.value')[index].text()).toBe('800002')
    index = 3
    expect(wrapper.findAll('.name')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.value')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.name')[index].text()).toBe('Quantity')
    expect(wrapper.findAll('.value')[index].text()).toBe('10')
    index = 4
    expect(wrapper.findAll('.name')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.value')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.name')[index].text()).toBe('Weight')
    expect(wrapper.findAll('.value')[index].text()).toBe('69 g')
    expect(wrapper.find('item-image-gallery-stub').exists()).toBeTruthy()
    expect(wrapper.find('item-image-gallery-stub').attributes()).toHaveProperty(
      'itemimageurls'
    )
    expect(
      wrapper.find('item-image-gallery-stub').attributes().itemimageurls
    ).toBe(
      '../../../src/assets/images/item-images/TGW_PEN.png,../../../src/assets/images/item-images/TGW_NOTES.png,../../../src/assets/images/item-images/TGW_MINT.png'
    )
  })

  it('should render multi item load carrier correctly', async () => {
    const loadCarrier = getSourceLoadCarrier()
    loadCarrier.compartments = [getMultiItemCompartment()]
    const selectedCompartment = loadCarrier.compartments[0]
    selectedCompartment.items = [loadCarrier.compartments[0].items[1]]
    selectedCompartment.stockIndex = 0
    await wrapper.setProps({
      loadCarrier,
      selectedCompartment,
    })
    expect(
      wrapper.find('.load-carrier-item-details-container').exists()
    ).toBeTruthy()
    expect(wrapper.find('.header-text').exists()).toBeTruthy()
    expect(wrapper.find('.header-text').text()).toBe('Item details')
    expect(wrapper.find('.item-details-container').exists()).toBeTruthy()
    expect(wrapper.findAll('.name').length).toBe(5)
    expect(wrapper.findAll('.value').length).toBe(5)
    let index = 0
    expect(wrapper.findAll('.name')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.value')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.name')[index].text()).toBe('Item name')
    expect(wrapper.findAll('.value')[index].text()).toBe('TGW Shirt')
    index = 1
    expect(wrapper.findAll('.name')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.value')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.name')[index].text()).toBe('Compartment')
    expect(wrapper.findAll('.value')[index].text()).toBe('1')
    index = 2
    expect(wrapper.findAll('.name')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.value')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.name')[index].text()).toBe('Item number')
    expect(wrapper.findAll('.value')[index].text()).toBe('800003')
    index = 3
    expect(wrapper.findAll('.name')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.value')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.name')[index].text()).toBe('Quantity')
    expect(wrapper.findAll('.value')[index].text()).toBe('20')
    index = 4
    expect(wrapper.findAll('.name')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.value')[index].exists()).toBeTruthy()
    expect(wrapper.findAll('.name')[index].text()).toBe('Weight')
    expect(wrapper.findAll('.value')[index].text()).toBe('69 g')
    expect(wrapper.find('item-image-gallery-stub').exists()).toBeTruthy()
    expect(wrapper.find('item-image-gallery-stub').attributes()).toHaveProperty(
      'itemimageurls'
    )
    expect(
      wrapper.find('item-image-gallery-stub').attributes().itemimageurls
    ).toBe(
      '../../../src/assets/images/item-images/TGW_PEN.png,../../../src/assets/images/item-images/TGW_NOTES.png,../../../src/assets/images/item-images/TGW_MINT.png'
    )
  })

  it('should render no items correctly', async () => {
    await wrapper.setProps({
      loadCarrier: undefined,
      selectedCompartment: undefined,
    })
    expect(
      wrapper.find('.load-carrier-item-details-container').exists()
    ).toBeTruthy()
    expect(wrapper.find('.header-text').exists()).toBeTruthy()
    expect(wrapper.find('.header-text').text()).toBe('Item details')
    expect(wrapper.find('.no-item-container').exists()).toBeTruthy()
    expect(wrapper.find('.no-items-image').exists()).toBeTruthy()
    expect(wrapper.find('.no-items-image').attributes()).toHaveProperty('src')
    expect(wrapper.find('.no-items-image').attributes().src).toBe(
      'src/assets/images/item-details/Empty-LC-Light.svg'
    )
    expect(wrapper.find('.no-items-text').exists()).toBeTruthy()
    expect(wrapper.find('.no-items-text').text()).toBe(
      'No items in this load carrier'
    )
  })

  it('should render no items compartment correctly', async () => {
    const loadCarrier = getTargetLoadCarrier()
    loadCarrier.compartments[0].items = []
    loadCarrier.compartments.push(getCompartment())
    await wrapper.setProps({
      loadCarrier,
      selectedCompartment: loadCarrier.compartments[0],
    })
    expect(
      wrapper.find('.load-carrier-item-details-container').exists()
    ).toBeTruthy()
    expect(wrapper.find('.header-text').exists()).toBeTruthy()
    expect(wrapper.find('.header-text').text()).toBe('Item details')
    expect(wrapper.find('.no-item-container').exists()).toBeTruthy()
    expect(wrapper.find('.no-items-image').exists()).toBeTruthy()
    expect(wrapper.find('.no-items-image').attributes()).toHaveProperty('src')
    expect(wrapper.find('.no-items-image').attributes().src).toBe(
      'src/assets/images/item-details/Empty-LC-Light.svg'
    )
    expect(wrapper.find('.no-items-text').exists()).toBeTruthy()
    expect(wrapper.find('.no-items-text').text()).toBe(
      'No items in this compartment'
    )
  })

  it('should not render undefined weight', async () => {
    const loadCarrier = getTargetLoadCarrier()
    loadCarrier.compartments[0].items[0].item.weight = undefined
    await wrapper.setProps({
      loadCarrier,
      selectedCompartment: loadCarrier.compartments[0],
    })
    expect(wrapper.findAll('.item-details-entry').length).toBe(4)
  })

  it('should set image urls of unknown items correctly', async () => {
    const loadCarrier = getSourceLoadCarrier()
    const unknownItemCompartment = getUnknownItemCompartment('1', 1, 1)
    loadCarrier.compartments.push(unknownItemCompartment)
    await wrapper.setProps({
      loadCarrier,
      selectedCompartment: loadCarrier.compartments[1],
    })

    expect(
      wrapper.find('item-image-gallery-stub').attributes().itemimageurls
    ).toBe(unknownItemUrlLight)
  })
})
