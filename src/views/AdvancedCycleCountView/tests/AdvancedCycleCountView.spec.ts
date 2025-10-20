import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { VueWrapper } from '@vue/test-utils/dist/vueWrapper'
import { createPinia, setActivePinia } from 'pinia'
import AdvancedCycleCountView from '@/views/AdvancedCycleCountView/AdvancedCycleCountView.vue'
import { useLoadCarrierDetailsStore } from '@/stores/useLoadCarrierDetailsStore/useLoadCarrierDetailsStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import {
  getCompartment,
  getCycleCountTask,
  getLoadCarrierTypeWithCompartments,
  getMultiItemCycleCountTask,
  getMultiItemLoadCarrier,
  getSourceLoadCarrier,
  getSourceLoadCarrierWithCompartments,
  getTargetLoadCarrier,
} from '@/helpers/testDataProvider'
import {
  BarcodeTypeEnum,
  PcotsLocationEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { BarcodeType } from '@/types/Api/pcots/PcotsApiModel'
import { CycleCountState } from '@/types/CycleCountState'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import DeleteCountMessageBox from '@/components/DeleteCountMessageBox/DeleteCountMessageBox.vue'
import { useScanModificationStore } from '@/stores/useScanModificationStore/useScanModificationStore'

setActivePinia(createPinia())
const mockRouterPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

const checkScanItem = (
  element: DOMWrapper<Element>,
  scanNumber: string,
  maxScans: string
) => {
  expect(element.find('.header .header-icon').exists()).toBeTruthy()
  expect(element.find('.header .scan-number-container').exists()).toBeTruthy()
  expect(
    element.find('.header .scan-number-container .scan-number').text()
  ).toBe(scanNumber)
  expect(element.find('.header .scan-number-container .max-scans').text()).toBe(
    maxScans
  )
}
const checkItemDetail = (
  element: DOMWrapper<Element>,
  name: string,
  value: string
) => {
  expect(element.find('.name').text()).toBe(name)
  expect(element.find('.value').text()).toBe(value)
}

describe('Test AdvancedCycleCountView', () => {
  const currentLocale = ref<string>('en')
  let wrapper: VueWrapper

  const mountView = () => {
    const i18n = createI18n({
      legacy: false,
      locale: currentLocale.value,
      messages: {
        en: {
          'advanced-cycle-count-view': {
            show_target: 'Show target lc',
            show_source: 'Show source lc',
            source_load_carrier: 'Source load carrier',
            target_load_carrier: 'Target load carrier',
            header_text: '- #{0}',
            items_counted:
              'No items counted | {n} item counted | {n} items counted',
            item_types_counted:
              'No item types counted | {n} item type counted | {n} item types counted',
          },
          'delete-count-message-box': {
            delete_count_title: 'Delete count',
            delete_count_description:
              'This action will delete the selected count. To count the items again you can do it from the main view as a normal new count.',
            delete: 'Delete',
            cancel: 'Cancel',
          },
          not_counted: {
            not_counted: 'Please count the items first to see the details',
          },
          'advanced-cycle-count-footer': {
            delete_scan: 'Delete scan',
            delete_count: 'Delete count',
          },
          'advanced-cycle-count-tabs': {
            counted: 'Counted',
            scanned: 'Scanned',
            item_type_details: 'Item type details',
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
        },
      },
    })
    wrapper = mount(AdvancedCycleCountView, {
      global: {
        plugins: [i18n],
        stubs: {
          transition: false,
        },
      },
      props: {},
      components: [DeleteCountMessageBox],
    })
  }

  const loadCarrierDetailsStore = useLoadCarrierDetailsStore()
  const loadCarrierStore = useLoadCarrierStore()
  const taskStore = useTaskStore()
  const barcodeStore = useBarcodeStore()
  const scanModificationStore = useScanModificationStore()

  beforeEach(() => {
    currentLocale.value = 'en'
    loadCarrierDetailsStore.$reset()
    loadCarrierStore.$reset()
    taskStore.$reset()
    barcodeStore.$reset()
    scanModificationStore.$reset()
    mockRouterPush.mockClear()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  const mountWithScanOnce = async () => {
    const compartments = [getCompartment(), getCompartment(), getCompartment()]
    compartments[0].items[0].item.gtins = ['1234']
    compartments[0].cycleCountState = CycleCountState.inProgress
    compartments[0].countedQuantity = 1
    compartments[1].cycleCountState = CycleCountState.toDo
    compartments[2].cycleCountState = CycleCountState.toDo
    const loadCarrier = getSourceLoadCarrierWithCompartments(compartments)
    loadCarrier.loadCarrierType = getLoadCarrierTypeWithCompartments(3)!
    loadCarrierStore.sourceLoadCarrier = loadCarrier
    loadCarrierDetailsStore.setLoadCarrierDetails(
      loadCarrier,
      PcotsLocationEnum.Source
    )

    const barcodes: BarcodeType[] = [
      { barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanOnce },
    ]
    taskStore.task = getCycleCountTask('S2S', barcodes, false, '1234')
    scanModificationStore.handleValidItemScan({
      barcodes: [{ barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' }],
    })

    mountView()
    await new Promise(process.nextTick)
  }

  const mountWithScanEach = async () => {
    const compartments = [getCompartment(), getCompartment(), getCompartment()]
    compartments[0].items[0].item.gtins = ['1234']
    compartments[0].cycleCountState = CycleCountState.inProgress
    compartments[0].countedQuantity = 2
    compartments[1].cycleCountState = CycleCountState.toDo
    compartments[2].cycleCountState = CycleCountState.finished
    compartments[2].items[0].quantity = 2
    const loadCarrier = getSourceLoadCarrierWithCompartments(compartments)
    loadCarrier.loadCarrierType = getLoadCarrierTypeWithCompartments(3)!
    loadCarrierStore.sourceLoadCarrier = loadCarrier
    loadCarrierDetailsStore.setLoadCarrierDetails(
      loadCarrier,
      PcotsLocationEnum.Source
    )

    const barcodes: BarcodeType[] = [
      { barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach },
    ]
    taskStore.task = getCycleCountTask('S2S', barcodes, false, '1234')
    scanModificationStore.handleValidItemScan({
      barcodes: [{ barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' }],
    })
    scanModificationStore.handleValidItemScan({
      barcodes: [{ barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' }],
    })
    mountView()
    await new Promise(process.nextTick)
  }

  const mountMultiItemWithScanEach = async () => {
    const { getStockCompartments } = useApiDataHelper()
    const loadCarrier = getMultiItemLoadCarrier()
    loadCarrier.compartments[0].items[0].item.gtins = ['1234']
    loadCarrier.compartments[0].cycleCountState = CycleCountState.inProgress
    loadCarrier.compartments[0].items[1].item.gtins = ['4567']
    loadCarrier.compartments[0].cycleCountState = CycleCountState.inProgress
    loadCarrier.compartments = getStockCompartments(loadCarrier.compartments)
    loadCarrier.compartments[0].countedQuantity = 2
    loadCarrier.compartments[1].countedQuantity = 1
    loadCarrierStore.sourceLoadCarrier = loadCarrier
    loadCarrierDetailsStore.setLoadCarrierDetails(
      loadCarrier,
      PcotsLocationEnum.Source
    )

    const barcodes: BarcodeType[] = [
      { barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach },
    ]
    taskStore.task = getMultiItemCycleCountTask('S2S', barcodes)
    scanModificationStore.handleValidItemScan({
      barcodes: [{ barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' }],
    })
    scanModificationStore.handleValidItemScan({
      barcodes: [{ barcodeType: BarcodeTypeEnum.Gtin, barcode: '4567' }],
    })
    scanModificationStore.handleValidItemScan({
      barcodes: [{ barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' }],
    })
    mountView()
    await new Promise(process.nextTick)
  }

  it('should render correctly', async () => {
    loadCarrierDetailsStore.loadCarrier = getTargetLoadCarrier()
    loadCarrierDetailsStore.pcotsLocation = PcotsLocationEnum.Target
    mountView()
    await new Promise(process.nextTick)
    expect(wrapper.find('.advanced-cycle-count-view').exists()).toBeTruthy()

    let headerText = wrapper.find('.header .header-with-details .header-text')
    expect(headerText.exists()).toBeTruthy()
    expect(headerText.text()).toBe('Target load carrier - #4712')

    let headerDetailItems = wrapper.findAll(
      '.header .header-with-details .sub-text-items .sub-text-item'
    )
    expect(headerDetailItems.length).toEqual(2)
    expect(headerDetailItems[0].find('.sub-text-item__text').text()).toBe(
      'No items counted'
    )
    expect(
      headerDetailItems[0].find('.sub-text-item__dot').exists()
    ).toBeTruthy()
    expect(headerDetailItems[1].find('.sub-text-item__text').text()).toBe(
      'No item types counted'
    )

    loadCarrierDetailsStore.loadCarrier = getSourceLoadCarrier()
    loadCarrierDetailsStore.pcotsLocation = PcotsLocationEnum.Source
    const barcodes: BarcodeType[] = [
      { barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach },
    ]
    taskStore.task = getCycleCountTask('S2S', barcodes)
    await new Promise(process.nextTick)

    headerText = wrapper.find('.header .header-with-details .header-text')
    expect(headerText.exists()).toBeTruthy()
    expect(headerText.text()).toBe('Source load carrier - #4711')

    headerDetailItems = wrapper.findAll(
      '.header .header-with-details .sub-text-items .sub-text-item'
    )
    expect(headerDetailItems.length).toEqual(2)
    expect(headerDetailItems[0].find('.sub-text-item__text').text()).toBe(
      'No items counted'
    )
    expect(
      headerDetailItems[0].find('.sub-text-item__dot').exists()
    ).toBeTruthy()
    expect(headerDetailItems[1].find('.sub-text-item__text').text()).toBe(
      'No item types counted'
    )
    expect(
      headerDetailItems[1].find('.sub-text-item__dot').exists()
    ).toBeFalsy()

    const showOppositeLcButton = wrapper.find(
      '.header .show-opposite-lc-button'
    )
    expect(showOppositeLcButton.exists()).toBeTruthy()
    expect(showOppositeLcButton.classes().includes('is-disabled')).toBeTruthy()

    const loadCarrierDetailsContainer = wrapper.find(
      '.load-carrier-details-container'
    )
    expect(loadCarrierDetailsContainer.exists()).toBeTruthy()
    expect(
      loadCarrierDetailsContainer
        .find('.load-carrier-details-compartments')
        .exists()
    ).toBeTruthy()
    const loadCarrierDetailsCompartment = wrapper.findAll(
      '.load-carrier-details-compartment'
    )
    expect(loadCarrierDetailsCompartment.length).toBe(1)
    loadCarrierDetailsCompartment[0]
      .findAll('.cycle-count')
      .forEach((compartmentItem) => {
        expect(
          compartmentItem.classes().includes('single-compartment')
        ).toBeTruthy()
      })

    const tabs = wrapper.find('.advanced-cycle-count-tabs.content__tabs')
    expect(tabs.exists()).toBeTruthy()
    const tabItems = tabs.findAll('.tabs-label-header')
    expect(tabItems.length).toBe(1)
    expect(tabItems[0].text()).toBe('Item type details')
    const itemDetailsContent = wrapper.find(
      '.tgw-tabs__content .advanced-cycle-count-tab-details'
    )
    expect(itemDetailsContent.exists()).toBeTruthy()
    expect(itemDetailsContent.find('.not-counted').exists()).toBeTruthy()
    expect(itemDetailsContent.find('.not-counted__text').text()).toBe(
      'Please count the items first to see the details'
    )

    const footer = wrapper.find('.advanced-cycle-count-footer')
    expect(footer.exists()).toBeTruthy()
    expect(footer.findAll('.icon-button').length).toBe(3)
    expect(footer.find('.back-button').exists()).toBeTruthy()
    expect(footer.find('.delete-scan-button').exists()).toBeTruthy()
    expect(footer.find('.delete-scan-button').text()).toBe('Delete scan')
    expect(
      footer.find('.delete-scan-button').classes().includes('is-disabled')
    ).toBeTruthy()
    expect(footer.find('.delete-count-button').exists()).toBeTruthy()
    expect(footer.find('.delete-count-button').text()).toBe('Delete count')
    expect(
      footer.find('.delete-count-button').classes().includes('is-disabled')
    ).toBeTruthy()
  })

  it('should render correctly with scanned barcodes', async () => {
    loadCarrierDetailsStore.loadCarrier = getSourceLoadCarrier()
    loadCarrierDetailsStore.loadCarrier.compartments[0].items[0].item.gtins = [
      '1234',
    ]
    loadCarrierDetailsStore.loadCarrier.compartments[0].cycleCountState =
      CycleCountState.inProgress
    loadCarrierDetailsStore.loadCarrier.compartments[0].countedQuantity = 2
    const barcodes: BarcodeType[] = [
      { barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach },
    ]
    taskStore.task = getCycleCountTask('S2S', barcodes, false, '1234')
    barcodeStore.barcodes = [
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' },
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' },
    ]
    mountView()
    await new Promise(process.nextTick)

    expect(wrapper.find('.advanced-cycle-count-view').exists()).toBeTruthy()

    const headerText = wrapper.find('.header .header-with-details .header-text')
    expect(headerText.exists()).toBeTruthy()
    expect(headerText.text()).toBe('Source load carrier - #4711')

    const headerDetailItems = wrapper.findAll(
      '.header .header-with-details .sub-text-items .sub-text-item'
    )
    expect(headerDetailItems.length).toEqual(2)
    expect(headerDetailItems[0].find('.sub-text-item__text').text()).toBe(
      '2 items counted'
    )
    expect(
      headerDetailItems[0].find('.sub-text-item__dot').exists()
    ).toBeTruthy()
    expect(headerDetailItems[1].find('.sub-text-item__text').text()).toBe(
      '1 item type counted'
    )
    expect(
      headerDetailItems[1].find('.sub-text-item__dot').exists()
    ).toBeFalsy()

    const showOppositeLcButton = wrapper.find(
      '.header .show-opposite-lc-button'
    )
    expect(showOppositeLcButton.exists()).toBeTruthy()
    expect(showOppositeLcButton.classes().includes('is-disabled')).toBeTruthy()

    const loadCarrierDetailsContainer = wrapper.find(
      '.load-carrier-details-container'
    )
    expect(loadCarrierDetailsContainer.exists()).toBeTruthy()
    expect(
      loadCarrierDetailsContainer
        .find('.load-carrier-details-compartments')
        .exists()
    ).toBeTruthy()
    const loadCarrierDetailsCompartment = wrapper.findAll(
      '.load-carrier-details-compartment'
    )
    expect(loadCarrierDetailsCompartment.length).toBe(1)
    loadCarrierDetailsCompartment[0]
      .findAll('.cycle-count')
      .forEach((compartmentItem) => {
        expect(
          compartmentItem.classes().includes('single-compartment')
        ).toBeTruthy()
      })

    await loadCarrierDetailsCompartment[0].trigger('click')
    expect(
      loadCarrierDetailsCompartment[0].classes().includes('active')
    ).toBeTruthy()

    const tabs = wrapper.find('.advanced-cycle-count-tabs.content__tabs')
    expect(tabs.exists()).toBeTruthy()
    const tabItems = tabs.findAll('.tgw-tabs__item')
    expect(tabItems.length).toBe(2)
    expect(tabItems[0].find('.tabs-label-header').text()).toBe('Scanned')
    expect(tabItems[0].classes().includes('is-active')).toBeTruthy()
    expect(tabItems[1].find('.tabs-label-header').text()).toBe(
      'Item type details'
    )

    const scannedTabContent = wrapper.find(
      '.tgw-tabs__content .advanced-cycle-count-tab-scans'
    )
    expect(scannedTabContent.exists()).toBeTruthy()
    const scanItems = scannedTabContent.findAll('.scan-item')
    expect(scanItems.length).toBe(2)
    expect(scanItems[0].classes().includes('is-selected')).toBeTruthy()
    checkScanItem(scanItems[0], '2', '/2')
    checkScanItem(scanItems[1], '1', '/2')

    const itemDetailsContent = wrapper.find(
      '.tgw-tabs__content .advanced-cycle-count-tab-details'
    )
    expect(itemDetailsContent.exists()).toBeTruthy()
    expect(
      itemDetailsContent.find('.load-carrier-item-details-container').exists()
    ).toBeTruthy()
    const itemDetails = itemDetailsContent.findAll(
      '.details-image-container .item-details-container .item-details-entry'
    )
    expect(itemDetails.length).toBe(6)
    checkItemDetail(itemDetails[0], 'Item name', 'TGW Pen')
    checkItemDetail(itemDetails[1], 'Compartment', '1')
    checkItemDetail(itemDetails[2], 'Item number', '800002')
    checkItemDetail(itemDetails[3], 'Quantity', '2')
    checkItemDetail(itemDetails[4], 'GTINS', '1234')
    checkItemDetail(itemDetails[5], 'Weight', '69 g')

    const footer = wrapper.find('.advanced-cycle-count-footer')
    expect(footer.exists()).toBeTruthy()
    expect(footer.findAll('.icon-button').length).toBe(3)
    expect(footer.find('.back-button').exists()).toBeTruthy()
    expect(footer.find('.delete-scan-button').exists()).toBeTruthy()
    expect(footer.find('.delete-scan-button').text()).toBe('Delete scan')
    expect(
      footer.find('.delete-scan-button').classes().includes('is-disabled')
    ).toBeFalsy()
    expect(footer.find('.delete-count-button').exists()).toBeTruthy()
    expect(footer.find('.delete-count-button').text()).toBe('Delete count')
    expect(
      footer.find('.delete-count-button').classes().includes('is-disabled')
    ).toBeFalsy()
  })

  it('should only delete currently selected scans on delete_count button', async () => {
    await mountMultiItemWithScanEach()

    expect(barcodeStore.barcodes.length).toBe(3)
    expect(wrapper.find('.advanced-cycle-count-view').exists()).toBeTruthy()

    let loadCarrierDetailsCompartment = wrapper.findAll(
      '.load-carrier-details-compartment'
    )
    expect(loadCarrierDetailsCompartment.length).toBe(2)
    await loadCarrierDetailsCompartment[0].trigger('click')
    expect(
      loadCarrierDetailsCompartment[0].classes().includes('active')
    ).toBeTruthy()
    await new Promise((resolve) => setTimeout(resolve, 200))

    await wrapper.find('.delete-count-button').trigger('click')
    await (
      wrapper.vm as InstanceType<typeof AdvancedCycleCountView>
    ).deleteCurrentCount()
    loadCarrierDetailsCompartment = wrapper.findAll(
      '.load-carrier-details-compartment'
    )
    expect(loadCarrierDetailsCompartment.length).toBe(1)
    expect(barcodeStore.barcodes).toEqual([
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '4567' },
    ])
  })

  it('should increase quantity when new scan appears', async () => {
    await mountWithScanEach()

    expect(wrapper.find('.advanced-cycle-count-view').exists()).toBeTruthy()

    let headerDetailItems = wrapper.findAll(
      '.header .header-with-details .sub-text-items .sub-text-item'
    )
    expect(headerDetailItems.length).toEqual(2)
    expect(headerDetailItems[0].find('.sub-text-item__text').text()).toBe(
      '4 items counted'
    )
    expect(
      headerDetailItems[0].find('.sub-text-item__dot').exists()
    ).toBeTruthy()
    expect(headerDetailItems[1].find('.sub-text-item__text').text()).toBe(
      '1 item type counted'
    )

    let loadCarrierDetailsCompartment = wrapper.findAll(
      '.load-carrier-details-compartment'
    )
    expect(loadCarrierDetailsCompartment.length).toBe(3)
    await loadCarrierDetailsCompartment[0].trigger('click')
    expect(
      loadCarrierDetailsCompartment[0].classes().includes('active')
    ).toBeTruthy()

    let scannedTabContent = wrapper.find(
      '.tgw-tabs__content .advanced-cycle-count-tab-scans'
    )
    expect(scannedTabContent.exists()).toBeTruthy()
    let scanItems = scannedTabContent.findAll('.scan-item')
    expect(scanItems.length).toBe(2)
    expect(scanItems[0].classes().includes('is-selected')).toBeTruthy()
    checkScanItem(scanItems[0], '2', '/2')
    checkScanItem(scanItems[1], '1', '/2')

    let itemDetails = wrapper.findAll(
      '.tgw-tabs__content .advanced-cycle-count-tab-details .load-carrier-item-details-container .details-image-container .item-details-container .item-details-entry'
    )
    checkItemDetail(itemDetails[3], 'Quantity', '2')

    scanModificationStore.handleValidItemScan({
      barcodes: [{ barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' }],
    })
    await new Promise((resolve) => setTimeout(resolve, 200))

    headerDetailItems = wrapper.findAll(
      '.header .header-with-details .sub-text-items .sub-text-item'
    )
    expect(headerDetailItems.length).toEqual(2)
    expect(headerDetailItems[0].find('.sub-text-item__text').text()).toBe(
      '5 items counted'
    )
    expect(
      headerDetailItems[0].find('.sub-text-item__dot').exists()
    ).toBeTruthy()
    expect(headerDetailItems[1].find('.sub-text-item__text').text()).toBe(
      '1 item type counted'
    )

    loadCarrierDetailsCompartment = wrapper.findAll(
      '.load-carrier-details-compartment'
    )
    expect(loadCarrierDetailsCompartment.length).toBe(3)
    await loadCarrierDetailsCompartment[0].trigger('click')
    expect(
      loadCarrierDetailsCompartment[0].classes().includes('active')
    ).toBeTruthy()

    scannedTabContent = wrapper.find(
      '.tgw-tabs__content .advanced-cycle-count-tab-scans'
    )
    expect(scannedTabContent.exists()).toBeTruthy()
    scanItems = scannedTabContent.findAll('.scan-item')
    expect(scanItems.length).toBe(3)
    expect(scanItems[0].classes().includes('is-selected')).toBeTruthy()
    checkScanItem(scanItems[0], '3', '/3')
    checkScanItem(scanItems[1], '2', '/3')
    checkScanItem(scanItems[2], '1', '/3')

    itemDetails = wrapper.findAll(
      '.tgw-tabs__content .advanced-cycle-count-tab-details .load-carrier-item-details-container .details-image-container .item-details-container .item-details-entry'
    )
    checkItemDetail(itemDetails[3], 'Quantity', '3')
  })

  it('should change text width when language is de', async () => {
    expect((wrapper.vm as any).showOppositeTextMinWidth).toBe('206px')
    currentLocale.value = 'de'
    mountView()
    expect((wrapper.vm as any).showOppositeTextMinWidth).toBe('276px')
  })

  it('should test showOppositeLcButton', async () => {
    loadCarrierStore.sourceLoadCarrier = getSourceLoadCarrier()
    loadCarrierStore.targetLoadCarrier = getTargetLoadCarrier()
    loadCarrierDetailsStore.setLoadCarrierDetails(
      loadCarrierStore.sourceLoadCarrier,
      PcotsLocationEnum.Source
    )
    loadCarrierDetailsStore.loadCarrier!.compartments[0].items[0].item.gtins = [
      '1234',
    ]
    loadCarrierDetailsStore.loadCarrier!.compartments[0].cycleCountState =
      CycleCountState.inProgress
    loadCarrierDetailsStore.loadCarrier!.compartments[0].countedQuantity = 2
    const barcodes: BarcodeType[] = [
      { barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach },
    ]
    taskStore.task = getCycleCountTask('S2T', barcodes, false, '1234')
    barcodeStore.barcodes = [
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' },
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' },
    ]
    mountView()
    await new Promise(process.nextTick)

    let headerText = wrapper.find('.header .header-with-details .header-text')
    expect(headerText.text()).toBe('Source load carrier - #4711')

    let showOppositeLcButton = wrapper.find('.header .show-opposite-lc-button')
    expect(showOppositeLcButton.classes().includes('is-disabled')).toBeFalsy()
    expect(showOppositeLcButton.find('.button-text').text()).toBe(
      'Show target lc'
    )
    await showOppositeLcButton.trigger('click')

    headerText = wrapper.find('.header .header-with-details .header-text')
    expect(headerText.text()).toBe('Target load carrier - #4712')

    showOppositeLcButton = wrapper.find('.header .show-opposite-lc-button')
    expect(showOppositeLcButton.classes().includes('is-disabled')).toBeFalsy()
    expect(showOppositeLcButton.find('.button-text').text()).toBe(
      'Show source lc'
    )
    loadCarrierStore.targetLoadCarrier = undefined
    loadCarrierDetailsStore.pcotsLocation = PcotsLocationEnum.Source
    taskStore.task = getCycleCountTask('S2S', barcodes, false, '1234')
    await new Promise(process.nextTick)
    showOppositeLcButton = wrapper.find('.header .show-opposite-lc-button')
    expect(showOppositeLcButton.classes().includes('is-disabled')).toBeTruthy()
    expect(showOppositeLcButton.find('.button-text').text()).toBe(
      'Show target lc'
    )
    headerText = wrapper.find('.header .header-with-details .header-text')
    expect(headerText.text()).toBe('Source load carrier - #4712')
  })

  it('should update all elements on quantity change', async () => {
    await mountWithScanOnce()

    const loadCarrierDetailsCompartment = wrapper.findAll(
      '.load-carrier-details-compartment'
    )
    await loadCarrierDetailsCompartment[0].trigger('click')
    expect(
      loadCarrierDetailsCompartment[0].classes().includes('active')
    ).toBeTruthy()
    const countedTab = wrapper.find('.advanced-cycle-count-tab-counted')
    expect(countedTab.exists()).toBeTruthy()
    expect(countedTab.find('.increase-button').exists()).toBeTruthy()
    expect(countedTab.find('.input-field__text').text()).toBe('1')
    await countedTab.find('.increase-button').trigger('click')
    await new Promise(process.nextTick)
    expect(countedTab.find('.input-field__text').text()).toBe('2')
  })

  it('should delete scan', async () => {
    await mountWithScanEach()

    const loadCarrierDetailsCompartment = wrapper.findAll(
      '.load-carrier-details-compartment'
    )
    await loadCarrierDetailsCompartment[0].trigger('click')
    expect(
      loadCarrierDetailsCompartment[0].classes().includes('active')
    ).toBeTruthy()
    expect(wrapper.findAll('.scan-items .scan-item').length).toBe(2)
    await wrapper.find('.delete-scan-button').trigger('click')
    expect(wrapper.findAll('.scan-items .scan-item').length).toBe(1)
    expect(taskStore.getCycleCountQuantity()).toBe(1)
  })

  it('should delete scan - multiItem', async () => {
    await mountMultiItemWithScanEach()

    const loadCarrierDetailsCompartment = wrapper.findAll(
      '.load-carrier-details-compartment'
    )
    await loadCarrierDetailsCompartment[0].trigger('click')
    expect(
      loadCarrierDetailsCompartment[0].classes().includes('active')
    ).toBeTruthy()
    expect(wrapper.findAll('.scan-items .scan-item').length).toBe(2)

    expect(taskStore.getCycleCountQuantity('800002')).toBe(2)
    await wrapper.find('.delete-scan-button').trigger('click')
    expect(wrapper.findAll('.scan-items .scan-item').length).toBe(1)
    expect(taskStore.getCycleCountQuantity('800002')).toBe(1)
  })

  it('should delete count - multiItem', async () => {
    await mountWithScanOnce()

    expect(taskStore.getCycleCountQuantity()).toBe(1)
    expect(barcodeStore.barcodes.length).toBe(1)
    await (wrapper.vm as any).deleteCurrentCount()
    expect(taskStore.getCycleCountQuantity()).toBe(0)
    expect(barcodeStore.barcodes.length).toBe(0)
  })
})
