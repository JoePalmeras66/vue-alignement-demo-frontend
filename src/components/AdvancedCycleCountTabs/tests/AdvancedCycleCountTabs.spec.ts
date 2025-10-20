import { describe, expect, it } from 'vitest'

import { VueWrapper, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import AdvancedCycleCountTabs from '@/components/AdvancedCycleCountTabs/AdvancedCycleCountTabs.vue'
import {
  getBarcode,
  getBarcodeData,
  getCompartmentCycleCounting,
  getCycleCountTask,
  getSourceLoadCarrier,
} from '@/helpers/testDataProvider'
import { CycleCountState } from '@/types/CycleCountState'
import {
  BarcodeTypeEnum,
  PcotsLocationEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'

describe('Test AdvancedCycleCountTabs', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'advanced-cycle-count-tabs': {
          counted: 'Counted',
          scanned: 'Scanned',
          item_type_details: 'Item type details',
        },
        'cycle-count-input': {
          quantity_input_title: 'Quantity input',
        },
        'load-carrier-item-details': {
          header_text: 'Item details',
          item_name: 'Item name',
          compartment: 'Compartment',
          item_number: 'Item number',
          gtins: 'GTINS',
          quantity: 'Quantity',
          weight: 'Weight',
          item_description: 'Item description',
          no_items_compartment: 'No items in this compartment',
          no_items_loadcarrier: 'No items in this load carrier',
        },
        not_counted: {
          not_counted: 'Not counted',
        },
        'delete-count-message-box': {
          delete_count_title: 'Delete count',
          delete_count_description:
            'This action will delete the selected count. To count the items again you can do it from the main view as a normal new count.',
          delete: 'Delete',
          cancel: 'Cancel',
        },
      },
    },
  })
  let wrapper: VueWrapper<any>
  const mountComponent = async (props: any) => {
    if (wrapper) {
      wrapper.unmount()
    }
    wrapper = mount(AdvancedCycleCountTabs, {
      global: {
        plugins: [i18n],
        stubs: {
          transition: false,
        },
      },
      props,
    })
  }

  it('should render correctly', async () => {
    await mountComponent({
      loadCarrier: getSourceLoadCarrier(),
      task: getCycleCountTask('S2S', undefined),
      pcotsLocation: PcotsLocationEnum.Source,
    })
    expect(wrapper.find('.advanced-cycle-count-tabs').exists()).toBeTruthy()
    expect(wrapper.find('#pane-counted').exists()).toBeTruthy()
    expect(wrapper.find('#pane-scanned').exists()).toBeFalsy()
    expect(wrapper.find('#pane-item_type_details').exists()).toBeTruthy()
    expect(wrapper.findAll('.tabs-label-header').length).toBe(2)
    expect(wrapper.findAll('.tabs-label-header')[0].text()).toBe('Counted')
    expect(wrapper.findAll('.tabs-label-header')[1].text()).toBe(
      'Item type details'
    )
  })

  it('should render correctly - scanning', async () => {
    await mountComponent({
      loadCarrier: getSourceLoadCarrier(),
      task: getCycleCountTask('S2S', [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
      barcodes: [getBarcodeData(BarcodeTypeEnum.Gtin)],
      pcotsLocation: PcotsLocationEnum.Source,
    })
    expect(wrapper.find('.advanced-cycle-count-tabs').exists()).toBeTruthy()
    expect(wrapper.find('#pane-counted').exists()).toBeFalsy()
    expect(wrapper.find('#pane-scanned').exists()).toBeTruthy()
    expect(wrapper.find('#pane-item_type_details').exists()).toBeTruthy()
    expect(wrapper.findAll('.tabs-label-header').length).toBe(2)
    expect(wrapper.findAll('.tabs-label-header')[0].text()).toBe('Scanned')
    expect(wrapper.findAll('.tabs-label-header')[1].text()).toBe(
      'Item type details'
    )
  })

  it('should emit quantity changed on reduce button click', async () => {
    const loadCarrier = getSourceLoadCarrier()
    loadCarrier.compartments[0] = getCompartmentCycleCounting(
      CycleCountState.inProgress,
      10
    )
    await mountComponent({
      loadCarrier: getSourceLoadCarrier(),
      task: getCycleCountTask('S2S', undefined),
      selectedCompartment: loadCarrier.compartments[0],
      pcotsLocation: PcotsLocationEnum.Source,
    })
    expect(wrapper.find('.input-field__text').exists()).toBeTruthy()
    expect(wrapper.find('.input-field__text').text()).toBe('10')
    expect(
      wrapper.find('.cycle-count-input__button.reduce-button').exists()
    ).toBeTruthy()
    expect(wrapper.emitted().quantityChanged.length).toBe(1)
    await wrapper
      .find('.cycle-count-input__button.reduce-button')
      .trigger('click')
    expect(wrapper.emitted()).toHaveProperty('quantityChanged')
    expect(wrapper.emitted().quantityChanged.length).toBe(2)
    expect(wrapper.emitted().quantityChanged[1]).toStrictEqual([9])
  })

  it('should emit active tab on changed', async () => {
    const loadCarrier = getSourceLoadCarrier()
    loadCarrier.compartments[0] = getCompartmentCycleCounting(
      CycleCountState.inProgress,
      10
    )
    await mountComponent({
      loadCarrier: getSourceLoadCarrier(),
      task: getCycleCountTask('S2S', undefined),
      selectedCompartment: loadCarrier.compartments[0],
      pcotsLocation: PcotsLocationEnum.Source,
    })

    expect(wrapper.find('.tabs-label-header').exists()).toBeTruthy()
    expect(wrapper.findAll('.tabs-label-header')[1].text()).toBe(
      'Item type details'
    )
    await wrapper.findAll('.tabs-label-header')[1].trigger('click')
    expect(wrapper.emitted()).toHaveProperty('activeTabChanged')
    expect(wrapper.emitted().activeTabChanged.length).toBe(2)
    expect(wrapper.emitted().activeTabChanged[1]).toStrictEqual([
      CycleCountTabs.item_type_details,
    ])
  })

  it('should always select the last active set tab', async () => {
    expect(wrapper.emitted().activeTabChanged.length).toBe(2)
    const loadCarrier = getSourceLoadCarrier()
    loadCarrier.compartments[0] = getCompartmentCycleCounting(
      CycleCountState.inProgress,
      10
    )
    loadCarrier.compartments.push(
      getCompartmentCycleCounting(CycleCountState.toDo, 5)
    )
    await wrapper.setProps({
      loadCarrier,
      task: getCycleCountTask('S2S', undefined),
      selectedCompartment: loadCarrier.compartments[0],
      pcotsLocation: PcotsLocationEnum.Source,
    })
    expect(wrapper.findAll('.tgw-tabs__item').length).toBe(2)
    expect(wrapper.find('.tabs-label-header').exists()).toBeTruthy()
    expect(wrapper.findAll('.tabs-label-header')[0].text()).toBe('Counted')
    await wrapper.findAll('.tabs-label-header')[0].trigger('click')
    expect(wrapper.emitted().activeTabChanged.length).toBe(3)
    expect(wrapper.emitted().activeTabChanged[2]).toStrictEqual([
      CycleCountTabs.counted,
    ])

    await wrapper.setProps({
      selectedCompartment: loadCarrier.compartments[1],
    })
    expect(wrapper.emitted().activeTabChanged.length).toBe(4)
    expect(wrapper.emitted().activeTabChanged[3]).toStrictEqual([
      CycleCountTabs.item_type_details,
    ])

    await wrapper.setProps({
      selectedCompartment: loadCarrier.compartments[0],
    })
    expect(wrapper.emitted().activeTabChanged.length).toBe(5)
    expect(wrapper.emitted().activeTabChanged[4]).toStrictEqual([
      CycleCountTabs.counted,
    ])
  })

  it('should select the first tab if it is the only visible tab', async () => {
    expect(wrapper.emitted().activeTabChanged.length).toBe(5)
    const loadCarrier = getSourceLoadCarrier()
    loadCarrier.compartments[0].cycleCountState = CycleCountState.finished
    await wrapper.setProps({
      loadCarrier,
      selectedCompartment: loadCarrier.compartments[0],
      task: getCycleCountTask('S2S', undefined),
      pcotsLocation: PcotsLocationEnum.Target,
    })
    // expect(wrapper.findAll('.el-tabs__item').length).toBe(1)
    expect(wrapper.findAll('.tabs-label-header').length).toBe(1)
    expect(wrapper.findAll('.tabs-label-header')[0].text()).toBe(
      'Item type details'
    )
    expect(wrapper.emitted().activeTabChanged.length).toBe(6)
  })
})
