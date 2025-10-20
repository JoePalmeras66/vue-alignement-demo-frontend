// noinspection DuplicatedCode

import { describe, expect, it } from 'vitest'

import { VueWrapper, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import LoadCarrierCompartment from '@/components/LoadCarrierCompartment/LoadCarrierCompartment.vue'
import { BarcodeDataType, BarcodeType } from '@/types/Api/pcots/PcotsApiModel'
import {
  getBarcode,
  getCompartment,
  getConsolidationTask,
  getCycleCountTask,
  getEmptyCompartment,
  getItem2,
  getManualConsolidationTask,
  getMultiItemCompartment,
  getMultiItemCycleCountTask,
  getPickingTask,
  getPurgeAndRecallTask,
  getSourceLoadCarrier,
} from '@/helpers/testDataProvider'
import { CompartmentState } from '@/types/CompartmentState'
import { ConsolidationModeEnum } from '@/types/ConsolidationModeEnum'
import {
  BarcodeTypeEnum,
  PcotsLocationEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { useScanModificationStore } from '@/stores/useScanModificationStore/useScanModificationStore'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'

setActivePinia(createPinia())

/*
   INFORMATION: Highlighting of quantity > 1 currently not needed
*/

describe('Test LoadCarrierCompartment', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier-compartment': {
          pick: 'Pick',
          put: 'Put',
          count: 'Count',
          scan: 'Scan',
        },
      },
    },
  })
  let wrapper: VueWrapper<any>

  const mountWrapper = (props: any) => {
    wrapper = mount(LoadCarrierCompartment, {
      global: {
        plugins: [i18n],
        stubs: {
          TgwIcon: true,
          CompartmentIndicator: true,
        },
      },
      props,
    })
  }
  mountWrapper({
    compartment: getCompartment(),
    pcotsLocation: PcotsLocationEnum.Source,
    task: getPickingTask(2),
    compartmentCount: 1,
    isMultiItem: false,
  })

  it('should render correct stock -Picking', async () => {
    const pickingTaskWithStock2 = getPickingTask(5)
    pickingTaskWithStock2.item = getItem2()
    await wrapper.setProps({
      compartment: getMultiItemCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: pickingTaskWithStock2,
      compartmentCount: 1,
      isMultiItem: true,
      state: CompartmentState.active,
      scannedBarcodes: [] as BarcodeDataType[],
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-description').exists()).toBeTruthy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.text()).toBe('5')
    // HIGHLIGHTING currently not needed
    // expect(lcItemCount.classes()).toContain('highlighted')
    const lcItemName = wrapper.find('.lc-item-name')
    expect(lcItemName.text()).toBe('800003')
    const lcItemDescription = wrapper.find('.lc-item-description')
    expect(lcItemDescription.text()).toBe('TGW Shirt')
  })

  it('should render correctly -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPickingTask(2),
      compartmentCount: 1,
      isMultiItem: false,
      state: CompartmentState.active,
      consolidationMode: ConsolidationModeEnum.AUTO,
      scannedBarcodes: [] as BarcodeDataType[],
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-description').exists()).toBeTruthy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.text()).toBe('2')
    // HIGHLIGHTING currently not needed
    // expect(lcItemCount.classes()).toContain('highlighted')
    const lcItemName = wrapper.find('.lc-item-name')
    expect(lcItemName.text()).toBe('800002')
    const lcItemDescription = wrapper.find('.lc-item-description')
    expect(lcItemDescription.text()).toBe('TGW Pen')
  })

  it('should render correctly for target -Picking', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Target,
      task: getPickingTask(10),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: true,
    })
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeTruthy()
  })

  it('should not emit compartmentClicked -Picking', async () => {
    await wrapper.setProps({
      state: 'none',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const compartment = wrapper.find('.lc-compartment')
    await compartment.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted().compartmentClicked).toBeFalsy()
  })

  it('should emit compartmentClicked -Picking', async () => {
    await wrapper.setProps({
      state: 'selectable',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const compartment = wrapper.find('.lc-compartment')
    await compartment.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('compartmentClicked')
    expect(wrapper.emitted().compartmentClicked[0]).toContain('1')
  })

  it('should not highlight quantity -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPickingTask(1),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.text()).toBe('1')
    expect(lcItemCount.classes().includes('highlighted')).toBeFalsy()
  })

  // HIGHLIGHTING currently not needed
  // it('should highlight quantity -Picking', async () => {
  //   await wrapper.setProps({
  //     compartment: getCompartment(),
  //     pcotsLocation: PcotsLocationEnum.Source,
  //     task: getPickingTask(10),
  //     state: 'active',
  //     compartmentCount: 1,
  //     isMultiItem: false,
  //   })
  //   const lcItemCount = wrapper.find('.lc-item-count')
  //   expect(lcItemCount.text()).toBe('10')
  //   expect(lcItemCount.classes().includes('highlighted')).toBeTruthy()
  // })

  it('should apply size-medium -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPickingTask(66666),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.classes()).toContain('size-medium')
  })

  it('should apply size-small -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPickingTask(6666666),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.classes()).toContain('size-small')
  })

  it('should apply size-mini -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPickingTask(66666666666666),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.classes()).toContain('size-mini')
  })

  it('should render scan once for source -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPickingTask(10, [getBarcode(BarcodeTypeEnum.Gtin)]),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-count').text()).toBe('10')
  })

  it('should render scan once for source - scanning completed -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPickingTask(10, [getBarcode(BarcodeTypeEnum.Gtin)]),
      state: 'active',
      scannedBarcodes: ['1'],
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-count').text()).toBe('10')
  })

  it('should render scan each for source -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPickingTask(10, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
      state: 'active',
      scannedBarcodes: ['1'],
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-count').text()).toBe('10')
  })

  it('should render scan each for source - scanning completed -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPickingTask(10, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
      state: 'active',
      scannedBarcodes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-count').text()).toBe('10')
  })

  it('should render scan once for target -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Target,
      task: getPickingTask(10, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanOnce),
      ]),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-description').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-count').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeTruthy()
  })

  it('should show question mark on zero crossing -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPickingTask(10, [getBarcode(BarcodeTypeEnum.Gtin)]),
      state: 'active',
      showZeroCrossing: true,
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.zero-crossing-text').text()).toBe('?')
  })

  it('should hide all details -Picking', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      state: 'active',
      task: getPickingTask(10),
      hideDetails: true,
      showZeroCrossing: false,
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeTruthy()

    expect(wrapper.find('.lc-item-count').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-description').exists()).toBeFalsy()
  })

  it('should render correct stock -Consolidation', async () => {
    const consolidationTaskWithStock2 = getConsolidationTask()
    consolidationTaskWithStock2.item = getItem2()
    await wrapper.setProps({
      compartment: getMultiItemCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: consolidationTaskWithStock2,
      compartmentCount: 1,
      isMultiItem: true,
      hideDetails: false,
      state: CompartmentState.active,
      scannedBarcodes: [] as BarcodeDataType[],
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-description').exists()).toBeTruthy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-pick-indicator').exists()).toBeTruthy()
    const lcItemName = wrapper.find('.lc-item-name')
    expect(lcItemName.text()).toBe('800003')
    const lcItemDescription = wrapper.find('.lc-item-description')
    expect(lcItemDescription.text()).toBe('TGW Shirt')
  })

  it('should render empty compartment correctly -Consolidation', async () => {
    await wrapper.setProps({
      compartment: getEmptyCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getConsolidationTask(),
      state: 'none',
      compartmentCount: 1,
      isMultiItem: false,
      hideDetails: false,
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    const compartmentClasses = wrapper.find('.lc-compartment').classes()
    expect(compartmentClasses.includes('consolidation')).toBeTruthy()
    expect(compartmentClasses.includes('source')).toBeTruthy()
    expect(compartmentClasses.includes('has-item')).toBeFalsy()
    expect(compartmentClasses.includes('selectable')).toBeFalsy()
    expect(wrapper.find('.lc-data').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-count').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-description').exists()).toBeFalsy()
  })

  it('should render filled compartment correctly -Consolidation', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getConsolidationTask(),
      state: 'none',
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    const compartmentClasses = wrapper.find('.lc-compartment').classes()
    expect(compartmentClasses.includes('consolidation')).toBeTruthy()
    expect(compartmentClasses.includes('source')).toBeTruthy()
    expect(compartmentClasses.includes('has-item')).toBeTruthy()
    expect(compartmentClasses.includes('selectable')).toBeFalsy()
    expect(wrapper.find('.lc-data').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-count').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-name').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-description').exists()).toBeTruthy()
  })

  it('should render selectable compartment correctly -Consolidation', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getConsolidationTask(),
      state: 'selectable',
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    const compartmentClasses = wrapper.find('.lc-compartment').classes()
    expect(compartmentClasses.includes('consolidation')).toBeTruthy()
    expect(compartmentClasses.includes('source')).toBeTruthy()
    expect(compartmentClasses.includes('has-item')).toBeTruthy()
    expect(compartmentClasses.includes('selectable')).toBeTruthy()
    expect(wrapper.find('.lc-data').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-count').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-name').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-description').exists()).toBeTruthy()
  })

  it('should render active source compartment correctly -Consolidation', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getConsolidationTask(),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })

    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    const compartmentClasses = wrapper.find('.lc-compartment').classes()
    expect(compartmentClasses.includes('consolidation')).toBeTruthy()
    expect(compartmentClasses.includes('source')).toBeTruthy()
    expect(compartmentClasses.includes('has-item')).toBeTruthy()
    expect(compartmentClasses.includes('active')).toBeTruthy()
    expect(wrapper.find('.lc-data').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-count').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-name').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-description').exists()).toBeTruthy()
    expect(wrapper.find('.compartment-pick-indicator').exists()).toBeTruthy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
  })

  it('should render active target compartment correctly -Consolidation', async () => {
    await wrapper.setProps({
      compartment: getEmptyCompartment(),
      pcotsLocation: PcotsLocationEnum.Target,
      task: getConsolidationTask(),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    const compartmentClasses = wrapper.find('.lc-compartment').classes()
    expect(compartmentClasses.includes('consolidation')).toBeTruthy()
    expect(compartmentClasses.includes('target')).toBeTruthy()
    expect(compartmentClasses.includes('has-item')).toBeFalsy()
    expect(compartmentClasses.includes('active')).toBeTruthy()
    expect(wrapper.find('.lc-data').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-count').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-description').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeTruthy()
    expect(wrapper.find('.compartment-pick-indicator').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
  })

  it('should render target correctly in manual mode -Consolidation', async () => {
    await wrapper.setProps({
      compartment: getEmptyCompartment(),
      pcotsLocation: PcotsLocationEnum.Target,
      task: getManualConsolidationTask(),
      state: CompartmentState.active,
      compartmentCount: 1,
      isMultiItem: false,
      consolidationMode: ConsolidationModeEnum.MANUAL,
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    const compartmentClasses = wrapper.find('.lc-compartment').classes()
    expect(compartmentClasses.includes('consolidation')).toBeTruthy()
    expect(compartmentClasses.includes('target')).toBeTruthy()
    expect(compartmentClasses.includes('has-item')).toBeFalsy()
    expect(compartmentClasses.includes('active')).toBeTruthy()
    expect(compartmentClasses.includes('manual')).toBeTruthy()
    expect(wrapper.find('.lc-data').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-count').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-description').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
  })

  it('should render source correctly in manual mode -Consolidation', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getConsolidationTask(),
      state: CompartmentState.active,
      compartmentCount: 1,
      isMultiItem: false,
      consolidationMode: ConsolidationModeEnum.MANUAL,
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    const compartmentClasses = wrapper.find('.lc-compartment').classes()
    expect(compartmentClasses.includes('consolidation')).toBeTruthy()
    expect(compartmentClasses.includes('source')).toBeTruthy()
    expect(compartmentClasses.includes('has-item')).toBeTruthy()
    expect(compartmentClasses.includes('active')).toBeTruthy()
    expect(compartmentClasses.includes('manual')).toBeTruthy()
    expect(wrapper.find('.lc-data').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-count').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-name').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-description').exists()).toBeTruthy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
  })

  it('should render indicator correctly -CycleCount', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      task: getCycleCountTask('S2T'),
      showIndicator: true,
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    expect(wrapper.find('compartment-indicator-stub').exists()).toBeTruthy()
  })

  it('should render multi item indicator correctly -CycleCount', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      task: getCycleCountTask('S2T'),
      countedCompartments: 0,
      showIndicator: true,
      isMultiItem: true,
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    expect(
      wrapper.find('compartment-indicator-stub').attributes().scannedamount
    ).toBe('0')
  })

  it('should render correct stock -CycleCount', async () => {
    const cycleCountTaskWithStock2 = getCycleCountTask('S2T')
    cycleCountTaskWithStock2.item = getItem2()
    await wrapper.setProps({
      compartment: getMultiItemCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: cycleCountTaskWithStock2,
      compartmentCount: 1,
      isMultiItem: true,
      countedCompartments: 0,
      showIndicator: true,
      state: CompartmentState.active,
      consolidationMode: ConsolidationModeEnum.AUTO,
      scannedBarcodes: [] as BarcodeDataType[],
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-name').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-description').exists()).toBeTruthy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-pick-indicator').exists()).toBeTruthy()
    const helperText = wrapper.find('.lc-item-helper-text')
    expect(helperText.text()).toBe('Count')
    const lcItemName = wrapper.find('.lc-item-name')
    expect(lcItemName.text()).toBe('800003')
    const lcItemDescription = wrapper.find('.lc-item-description')
    expect(lcItemDescription.text()).toBe('TGW Shirt')
  })

  it('should render SOURCE correctly -CycleCount -ScanOnce -S2S', async () => {
    const task = getCycleCountTask('S2S', [
      getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanOnce),
    ])
    // mount wrapper to recalculate computed values
    mountWrapper({
      compartment: getCompartment(),
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Source,
      state: CompartmentState.active,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: true,
      countedCompartments: 0,
    })
    expect(wrapper.find('.lc-data .lc-item-helper-text').text()).toBe('Scan')
    expect(
      wrapper.find('compartment-indicator-stub').attributes().scannedamount
    ).toBe('0')

    await wrapper.setProps({
      scannedBarcodes: ['1'],
    })
    expect(wrapper.find('.lc-data .lc-item-helper-text').text()).toBe('Count')
    expect(
      wrapper.find('compartment-indicator-stub').attributes().scannedamount
    ).toBe('0')
  })

  it('should render TARGET correctly -CycleCount -ScanOnce -S2S', async () => {
    const task = getCycleCountTask('S2S', [
      getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanOnce),
    ])
    // mount wrapper to recalculate computed values
    mountWrapper({
      compartment: getCompartment(),
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Target,
      state: CompartmentState.none,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: false,
      countedCompartments: 0,
    })
    expect(wrapper.find('.lc-data tgw-icon-stub').exists()).toBeFalsy()
    expect(wrapper.find('.lc-data .lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('compartment-indicator-stub').exists()).toBeFalsy()

    await wrapper.setProps({
      scannedBarcodes: ['1'],
    })
    expect(wrapper.find('.lc-data tgw-icon-stub').exists()).toBeFalsy()
    expect(wrapper.find('.lc-data .lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('compartment-indicator-stub').exists()).toBeFalsy()
  })

  it('should render SOURCE correctly -CycleCount -ScanOnce -S2T', async () => {
    const task = getCycleCountTask('S2T', [
      getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanOnce),
    ])
    mountWrapper({
      compartment: getCompartment(),
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Source,
      state: CompartmentState.active,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: true,
      countedCompartments: 0,
    })
    expect(wrapper.find('.lc-data .lc-item-helper-text').text()).toBe('Scan')
    expect(
      wrapper.find('compartment-indicator-stub').attributes().scannedamount
    ).toBe('0')

    await wrapper.setProps({
      scannedBarcodes: ['1'],
    })
    expect(wrapper.find('.lc-data .lc-item-helper-text').text()).toBe('Count')
    expect(
      wrapper.find('compartment-indicator-stub').attributes().scannedamount
    ).toBe('0')
  })

  it('should render TARGET correctly -CycleCount -ScanOnce -S2T', async () => {
    const task = getCycleCountTask('S2T', [
      getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanOnce),
    ])
    mountWrapper({
      compartment: getCompartment(),
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Target,
      state: CompartmentState.none,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: false,
      countedCompartments: 0,
    })
    expect(wrapper.find('.lc-data tgw-icon-stub').exists()).toBeFalsy()
    expect(wrapper.find('.lc-data .lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    expect(wrapper.find('compartment-indicator-stub').exists()).toBeFalsy()

    await wrapper.setProps({
      state: CompartmentState.active,
      scannedBarcodes: ['1'],
    })
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeTruthy()
    expect(wrapper.find('compartment-indicator-stub').exists()).toBeFalsy()
  })

  it('should render SOURCE correctly -CycleCount -ScanEach -S2S', async () => {
    const task = getCycleCountTask('S2S', [
      getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
    ])
    mountWrapper({
      compartment: getCompartment(),
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Source,
      state: CompartmentState.active,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: true,
      countedCompartments: 0,
    })
    expect(wrapper.find('.lc-data .lc-item-helper-text').text()).toBe('Scan')
    expect(
      wrapper.find('compartment-indicator-stub').attributes().scannedamount
    ).toBe('0')

    await wrapper.setProps({
      scannedBarcodes: ['1'],
    })
    expect(wrapper.find('.lc-data .lc-item-helper-text').text()).toBe('Count')
    expect(
      wrapper.find('compartment-indicator-stub').attributes().scannedamount
    ).toBe('0')
  })

  it('should render TARGET correctly -CycleCount -ScanEach -S2S', async () => {
    const task = getCycleCountTask('S2S', [
      getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
    ])
    // mount wrapper to recalculate computed values
    mountWrapper({
      compartment: getCompartment(),
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Target,
      state: CompartmentState.none,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: false,
      countedCompartments: 0,
    })
    expect(wrapper.find('.lc-data tgw-icon-stub').exists()).toBeFalsy()
    expect(wrapper.find('.lc-data .lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('compartment-indicator-stub').exists()).toBeFalsy()

    await wrapper.setProps({
      scannedBarcodes: ['1'],
    })
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    expect(wrapper.find('.lc-data tgw-icon-stub').exists()).toBeFalsy()
    expect(wrapper.find('.lc-data .lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('compartment-indicator-stub').exists()).toBeFalsy()
  })

  it('should render SOURCE correctly -CycleCount -ScanEach -S2T', async () => {
    const task = getCycleCountTask('S2T', [
      getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
    ])
    mountWrapper({
      compartment: getCompartment(),
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Source,
      state: CompartmentState.active,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: true,
      countedCompartments: 0,
    })
    expect(wrapper.find('.lc-data .lc-item-helper-text').text()).toBe('Scan')
    expect(
      wrapper.find('compartment-indicator-stub').attributes().scannedamount
    ).toBe('0')

    await wrapper.setProps({
      scannedBarcodes: ['1'],
    })
    expect(wrapper.find('.lc-data .lc-item-helper-text').text()).toBe('Count')
    expect(
      wrapper.find('compartment-indicator-stub').attributes().scannedamount
    ).toBe('0')
  })

  it('should render TARGET correctly -CycleCount -ScanEach -S2T', async () => {
    const task = getCycleCountTask('S2T', [
      getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
    ])
    mountWrapper({
      compartment: getCompartment(),
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Target,
      state: CompartmentState.none,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: false,
      countedCompartments: 0,
    })
    expect(wrapper.find('.lc-data tgw-icon-stub').exists()).toBeFalsy()
    expect(wrapper.find('.lc-data .lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('compartment-indicator-stub').exists()).toBeFalsy()

    await wrapper.setProps({
      scannedBarcodes: ['1'],
      state: CompartmentState.active,
    })
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeTruthy()
    expect(wrapper.find('.lc-data .lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('compartment-indicator-stub').exists()).toBeFalsy()
  })

  it('should render SOURCE correctly -CycleCount -NoScan -S2S', async () => {
    const task = getCycleCountTask('S2S')
    mountWrapper({
      compartment: getCompartment(),
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Source,
      state: CompartmentState.active,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: true,
      countedCompartments: 0,
    })
    expect(wrapper.find('.lc-data .lc-item-helper-text').text()).toBe('Count')
    expect(
      wrapper.find('compartment-indicator-stub').attributes().scannedamount
    ).toBe('0')
  })

  it('should render SOURCE correctly -CycleCount -NoScan -S2T', async () => {
    const task = getCycleCountTask('S2T')
    mountWrapper({
      compartment: getCompartment(),
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Source,
      state: CompartmentState.active,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: true,
      countedCompartments: 0,
    })
    expect(wrapper.find('.lc-data .lc-item-helper-text').text()).toBe('Count')
    expect(
      wrapper.find('compartment-indicator-stub').attributes().scannedamount
    ).toBe('0')
  })

  it('should render TARGET correctly -CycleCount -NoScan -S2T', async () => {
    const task = getCycleCountTask('S2T')
    mountWrapper({
      compartment: getCompartment(),
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Target,
      state: CompartmentState.active,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: false,
      countedCompartments: 0,
    })
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeTruthy()
    expect(wrapper.find('.lc-data .lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('compartment-indicator-stub').exists()).toBeFalsy()
  })

  it('should render last scanned item -MultiItemCycleCount -ScanEach -S2T', async () => {
    const { addNewUnknownItemToSourceLoadCarrier } = useApiDataHelper()
    const taskStore = useTaskStore()
    const scanModificationStore = useScanModificationStore()
    scanModificationStore.unknownItemTypeCount = 1
    const barcodeStore = useBarcodeStore()
    barcodeStore.barcodes = [
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '1234' } as BarcodeDataType,
    ]
    const loadCarrierStore = useLoadCarrierStore()
    loadCarrierStore.sourceLoadCarrier = getSourceLoadCarrier()
    loadCarrierStore.sourceLoadCarrier.compartments[0].items[0].item.gtins = [
      '1234',
    ]
    const barcodes = [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanEach,
      } as BarcodeType,
    ]
    const task = getMultiItemCycleCountTask('S2T', barcodes)
    taskStore.task = task
    addNewUnknownItemToSourceLoadCarrier(
      [{ barcode: '4321' }] as BarcodeDataType[],
      scanModificationStore.unknownItemTypeCount
    )
    mountWrapper({
      compartment: loadCarrierStore.sourceLoadCarrier.compartments[0],
      scannedBarcodes: [] as BarcodeDataType[],
      pcotsLocation: PcotsLocationEnum.Source,
      state: CompartmentState.active,
      task,
      showZeroCrossing: false,
      hideDetails: false,
      compartmentCount: 1,
      isMultiItem: true,
      showIndicator: false,
      countedCompartments: 0,
    })

    scanModificationStore.handleValidItemScan({
      barcodes: [{ barcodeType: BarcodeTypeEnum.Gtin, barcode: '4321' }],
    })
    await new Promise(process.nextTick)

    expect(wrapper.find('.lc-data .lc-item-helper-text').text()).toBe('Scan')
    expect(wrapper.find('.lc-data .lc-item-description').text()).toBe(
      'Unknown Item 1'
    )
    expect(wrapper.find('.lc-data .lc-item-name').text()).toBe('-')
  })

  it('should render correct stock -Purge And Recall', async () => {
    const purgeAndRecallTaskWithStock = getPurgeAndRecallTask(5)
    purgeAndRecallTaskWithStock.item = getItem2()
    await wrapper.setProps({
      compartment: getMultiItemCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: purgeAndRecallTaskWithStock,
      compartmentCount: 1,
      isMultiItem: true,
      state: CompartmentState.active,
      scannedBarcodes: [] as BarcodeDataType[],
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-description').exists()).toBeTruthy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.text()).toBe('5')
    // HIGHLIGHTING currently not needed
    // expect(lcItemCount.classes()).toContain('highlighted')
    const lcItemName = wrapper.find('.lc-item-name')
    expect(lcItemName.text()).toBe('800003')
    const lcItemDescription = wrapper.find('.lc-item-description')
    expect(lcItemDescription.text()).toBe('TGW Shirt')
  })

  it('should render correctly -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPurgeAndRecallTask(2),
      compartmentCount: 1,
      isMultiItem: false,
      state: CompartmentState.active,
      consolidationMode: ConsolidationModeEnum.AUTO,
      scannedBarcodes: [] as BarcodeDataType[],
    })
    expect(wrapper.find('.lc-compartment').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeTruthy()
    expect(wrapper.find('.lc-item-description').exists()).toBeTruthy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeFalsy()
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.text()).toBe('2')
    // HIGHLIGHTING currently not needed
    // expect(lcItemCount.classes()).toContain('highlighted')
    const lcItemName = wrapper.find('.lc-item-name')
    expect(lcItemName.text()).toBe('800002')
    const lcItemDescription = wrapper.find('.lc-item-description')
    expect(lcItemDescription.text()).toBe('TGW Pen')
  })

  it('should render correctly for target -Purge and Recall', async () => {
    await wrapper.setProps({
      pcotsLocation: PcotsLocationEnum.Target,
      task: getPurgeAndRecallTask(7),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: true,
    })
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeTruthy()
  })

  it('should not emit compartmentClicked -Purge and Recall', async () => {
    await wrapper.setProps({
      task: getPurgeAndRecallTask(7),
      state: 'none',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const compartment = wrapper.find('.lc-compartment')
    await compartment.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted().compartmentClicked).toBeFalsy()
  })

  it('should emit compartmentClicked -Purge and Recall', async () => {
    await wrapper.setProps({
      task: getPurgeAndRecallTask(7),
      state: 'selectable',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const compartment = wrapper.find('.lc-compartment')
    await compartment.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('compartmentClicked')
    expect(wrapper.emitted().compartmentClicked[0]).toContain('1')
  })

  it('should not highlight quantity -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPurgeAndRecallTask(1),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.text()).toBe('1')
    expect(lcItemCount.classes().includes('highlighted')).toBeFalsy()
  })

  // HIGHLIGHTING currently not needed
  // it('should highlight quantity -Purge and Recall', async () => {
  //   await wrapper.setProps({
  //     compartment: getCompartment(),
  //     pcotsLocation: PcotsLocationEnum.Source,
  //     task: getPurgeAndRecallTask(7),
  //     state: 'active',
  //     compartmentCount: 1,
  //     isMultiItem: false,
  //   })
  //   const lcItemCount = wrapper.find('.lc-item-count')
  //   expect(lcItemCount.text()).toBe('7')
  //   expect(lcItemCount.classes().includes('highlighted')).toBeTruthy()
  // })

  it('should apply size-medium -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPurgeAndRecallTask(66666),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.classes()).toContain('size-medium')
  })

  it('should apply size-small -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPurgeAndRecallTask(6666666),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.classes()).toContain('size-small')
  })

  it('should apply size-mini -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPurgeAndRecallTask(66666666666666),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    const lcItemCount = wrapper.find('.lc-item-count')
    expect(lcItemCount.classes()).toContain('size-mini')
  })

  it('should render scan once for source -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPurgeAndRecallTask(7, [getBarcode(BarcodeTypeEnum.Gtin)]),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-count').text()).toBe('7')
  })

  it('should render scan once for source - scanning completed -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPurgeAndRecallTask(7, [getBarcode(BarcodeTypeEnum.Gtin)]),
      state: 'active',
      scannedBarcodes: ['1'],
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-count').text()).toBe('7')
  })

  it('should render scan each for source -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPurgeAndRecallTask(7, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
      state: 'active',
      scannedBarcodes: ['1'],
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-count').text()).toBe('7')
  })

  it('should render scan each for source - scanning completed -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPurgeAndRecallTask(10, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
      state: 'active',
      scannedBarcodes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-count').text()).toBe('10')
  })

  it('should render scan once for target -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Target,
      task: getPurgeAndRecallTask(10, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanOnce),
      ]),
      state: 'active',
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-description').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-count').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeTruthy()
  })

  it('should show question mark on zero crossing -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      task: getPurgeAndRecallTask(10, [getBarcode(BarcodeTypeEnum.Gtin)]),
      state: 'active',
      showZeroCrossing: true,
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.zero-crossing-text').text()).toBe('?')
  })

  it('should hide all details -Purge and Recall', async () => {
    await wrapper.setProps({
      compartment: getCompartment(),
      pcotsLocation: PcotsLocationEnum.Source,
      state: 'active',
      task: getPurgeAndRecallTask(10),
      hideDetails: true,
      showZeroCrossing: false,
      compartmentCount: 1,
      isMultiItem: false,
    })
    expect(wrapper.find('.lc-item-helper-text').exists()).toBeFalsy()
    expect(wrapper.find('.compartment-put-indicator').exists()).toBeTruthy()

    expect(wrapper.find('.lc-item-count').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-name').exists()).toBeFalsy()
    expect(wrapper.find('.lc-item-description').exists()).toBeFalsy()
  })
})
