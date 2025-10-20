// noinspection DuplicatedCode

import { beforeEach, describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import CycleCountActionBar from '@/components/CycleCountActionBar/CycleCountActionBar.vue'
import { BarcodeDataType, BarcodeType } from '@/types/Api/pcots/PcotsApiModel'
import { DisabledButton } from '@/types/DisabledButton'
import {
  addCriticalProblem,
  addTargetFull,
  getBarcode,
  getCompartmentCycleCounting,
  getCycleCountTask,
  getMultiItemCompartment,
  getSourceLoadCarrier,
} from '@/helpers/testDataProvider'
import {
  BarcodeTypeEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { CycleCountState } from '@/types/CycleCountState'

setActivePinia(createPinia())

describe('Test CycleCountActionBar', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'action-bar-texts': {
          confirm: 'Confirm',
          cancel: 'Cancel',
          send_to_reject: 'Send to reject station',
          report_problem: 'Report problem',
          split_pick: 'Split pick',
          undo_split: 'Undo split',
          n_problems_saved: '{n} problem saved | {n} problems saved',
          edit_scans: 'Edit scans',
          undo_last_scan: 'Undo last scan',
          send_target: 'Send target',
        },
        'cycle-count-action-bar': {
          advanced_view: 'Advanced view',
          create_scan: 'Create scan',
          confirm_and_send: 'Confirm & send',
          confirm_count: 'Confirm count',
        },
      },
    },
  })
  const wrapper = mount(CycleCountActionBar, {
    global: {
      plugins: [i18n],
      stubs: {
        TgwIcon: true,
      },
    },
    props: {
      task: getCycleCountTask('S2T'),
      scannedBarcodes: [] as BarcodeDataType[],
      disabledButtons: [] as DisabledButton[],
      showScanError: false,
    },
  })

  const troubleshootingStore = useTroubleshootingStore()
  const loadCarrierStore = useLoadCarrierStore()
  const taskStore = useTaskStore()

  beforeEach(() => {
    troubleshootingStore.$reset()
    loadCarrierStore.$reset()
    taskStore.$reset()
  })

  it('should render correctly - no scan', () => {
    expect(wrapper.find('.cycle-count-action-bar')).toBeTruthy()
    expect(wrapper.find('.action-bar-top')).toBeTruthy()
    expect(wrapper.find('.scan-action-placeholder')).toBeTruthy()
    expect(wrapper.find('.scan-action-wrapper').attributes().style).toBe(
      'display: none;'
    )
    expect(wrapper.find('.action-bar-bottom')).toBeTruthy()
    expect(
      wrapper.find('.scan-action-overlay-wrapper').attributes().style
    ).toBe('display: none;')
    expect(wrapper.find('.scan-icon-text-container')).toBeTruthy()
    expect(wrapper.find('.scan-action-icon')).toBeTruthy()
    expect(wrapper.find('.content')).toBeTruthy()
    expect(wrapper.find('.content-left')).toBeTruthy()
    expect(wrapper.find('.advanced-view-button')).toBeTruthy()
    expect(wrapper.find('.create-scan-button').exists()).toBeFalsy()
    expect(wrapper.find('.content-mid')).toBeTruthy()
    expect(wrapper.find('.confirm-button')).toBeTruthy()
    expect(wrapper.find('.content-right')).toBeTruthy()
    expect(wrapper.find('.report-problem-button')).toBeTruthy()
  })

  it('should render correctly - scan once', async () => {
    await wrapper.setProps({
      task: getCycleCountTask('S2T', [
        {
          barcodeType: BarcodeTypeEnum.Gtin,
          scanRule: ScanRuleEnum.ScanOnce,
        },
        {
          barcodeType: BarcodeTypeEnum.Serial,
          scanRule: ScanRuleEnum.ScanOnce,
        },
      ]),
      scannedBarcodes: [] as BarcodeDataType[],
      disabledButtons: [] as DisabledButton[],
      showScanError: false,
      appendToBody: false,
    })
    expect(wrapper.find('.cycle-count-action-bar')).toBeTruthy()
    expect(wrapper.find('.action-bar-top')).toBeTruthy()
    expect(wrapper.find('.scan-action-placeholder')).toBeTruthy()
    expect(wrapper.find('.scan-action-wrapper')).toBeTruthy()
    expect(wrapper.find('.action-bar-bottom')).toBeTruthy()
    expect(wrapper.find('.scan-action-overlay-wrapper')).toBeTruthy()
    expect(wrapper.find('.scan-icon-text-container')).toBeTruthy()
    expect(wrapper.find('.scan-action-icon').attributes().icon).toBe('barcode')
    expect(wrapper.find('.scan-action-icon').attributes().color).toBe(
      'var(--tgw-primary)'
    )
    expect(wrapper.find('.content')).toBeTruthy()
    expect(wrapper.find('.content-left')).toBeTruthy()
    expect(wrapper.find('.advanced-view-button')).toBeTruthy()
    expect(wrapper.find('.create-scan-button')).toBeTruthy()
    expect(wrapper.find('.content-mid')).toBeTruthy()
    expect(wrapper.find('.confirm-button')).toBeTruthy()
    expect(wrapper.find('.content-right')).toBeTruthy()
    expect(wrapper.find('.report-problem-button')).toBeTruthy()
    await wrapper.setProps({
      scannedBarcodes: [{ barcode: '1', barcodeType: BarcodeTypeEnum.Gtin }],
      disabledButtons: [],
      showScanError: false,
    })
    expect(
      wrapper.find('.create-scan-button').classes().includes('is-disabled')
    ).toBeFalsy()
  })

  it('should render correctly - scan each', async () => {
    await wrapper.setProps({
      task: getCycleCountTask('S2T', [
        {
          barcodeType: BarcodeTypeEnum.Gtin,
          scanRule: ScanRuleEnum.ScanEach,
        },
        {
          barcodeType: BarcodeTypeEnum.Serial,
          scanRule: ScanRuleEnum.ScanEach,
        },
      ]),
      scannedBarcodes: [] as BarcodeDataType[],
      disabledButtons: [] as DisabledButton[],
      showScanError: false,
    })
    expect(wrapper.find('.scan-action-icon').attributes().icon).toBe(
      'barcode-multiple'
    )
    expect(wrapper.find('.scan-action-icon').attributes().color).toBe(
      'var(--tgw-primary)'
    )
  })

  it('should render disabled buttons correctly - DisabledButton.all', async () => {
    await wrapper.setProps({
      scannedBarcodes: [],
      disabledButtons: [],
      showScanError: false,
    })
    expect(
      wrapper.find('.advanced-view-button').classes().includes('is-disabled')
    ).toBeFalsy()
    expect(
      wrapper.find('.create-scan-button').classes().includes('is-disabled')
    ).toBeFalsy()
    expect(
      wrapper.find('.confirm-button').classes().includes('is-disabled')
    ).toBeFalsy()
    expect(
      wrapper.find('.report-problem-button').classes().includes('is-disabled')
    ).toBeFalsy()
    await wrapper.setProps({
      scannedBarcodes: [],
      disabledButtons: [DisabledButton.all],
      showScanError: false,
    })
    expect(
      wrapper.find('.advanced-view-button').classes().includes('is-disabled')
    ).toBeTruthy()
    expect(
      wrapper.find('.create-scan-button').classes().includes('is-disabled')
    ).toBeTruthy()
    expect(
      wrapper.find('.confirm-button').classes().includes('is-disabled')
    ).toBeTruthy()
    expect(
      wrapper.find('.report-problem-button').classes().includes('is-disabled')
    ).toBeTruthy()
  })

  it('should not emit click event for disabled buttons', async () => {
    await wrapper.setProps({
      task: undefined,
      scannedBarcodes: [] as BarcodeDataType[],
      disabledButtons: [DisabledButton.all],
      showScanError: false,
    })
    const advancedViewButton = wrapper.find('.advanced-view-button')
    await advancedViewButton.trigger('click')
    expect(wrapper.find('.create-scan-button').exists()).toBeFalsy()
    const confirmButton = wrapper.find('.confirm-button')
    await confirmButton.trigger('click')
    const reportProblemButton = wrapper.find('.report-problem-button')
    await reportProblemButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).not.toHaveProperty('actionButtonClicked')
  })

  it('should emit click event of buttons', async () => {
    await wrapper.setProps({
      task: getCycleCountTask('S2T', [
        {
          barcodeType: BarcodeTypeEnum.Gtin,
          scanRule: ScanRuleEnum.ScanEach,
        },
        {
          barcodeType: BarcodeTypeEnum.Serial,
          scanRule: ScanRuleEnum.ScanEach,
        },
      ]),
      scannedBarcodes: [] as BarcodeDataType[],
      disabledButtons: [] as DisabledButton[],
      showScanError: false,
    })
    taskStore.setCycleCountQuantity(1)
    const advancedViewButton = wrapper.find('.advanced-view-button')
    await advancedViewButton.trigger('click')
    const createScanButton = wrapper.find('.create-scan-button')
    await createScanButton.trigger('click')
    const confirmButton = wrapper.find('.confirm-button')
    await confirmButton.trigger('click')
    const reportProblemButton = wrapper.find('.report-problem-button')
    await reportProblemButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted('actionButtonClicked')![0]).toEqual([
      'advanced_view',
    ])
    expect(wrapper.emitted('actionButtonClicked')![1]).toEqual(['create_scan'])
    expect(wrapper.emitted('actionButtonClicked')![2]).toEqual(['confirm'])
    expect(wrapper.emitted('actionButtonClicked')![3]).toEqual([
      'report_problem',
    ])
  })

  it('should render disabled buttons correctly', async () => {
    await wrapper.setProps({
      task: getCycleCountTask('S2T', [
        {
          barcodeType: BarcodeTypeEnum.Gtin,
          scanRule: ScanRuleEnum.ScanEach,
        },
        {
          barcodeType: BarcodeTypeEnum.Serial,
          scanRule: ScanRuleEnum.ScanEach,
        },
      ]),
      scannedBarcodes: [] as BarcodeDataType[],
      disabledButtons: [] as DisabledButton[],
      showScanError: false,
    })
    expect(
      wrapper.find('.advanced-view-button').classes().includes('is-disabled')
    ).toBeFalsy()
    expect(
      wrapper.find('.create-scan-button').classes().includes('is-disabled')
    ).toBeFalsy()
    expect(
      wrapper.find('.confirm-button').classes().includes('is-disabled')
    ).toBeFalsy()
    expect(
      wrapper.find('.report-problem-button').classes().includes('is-disabled')
    ).toBeFalsy()
    await wrapper.setProps({
      scannedBarcodes: [],
      disabledButtons: [
        DisabledButton.advanced_view,
        DisabledButton.create_scan,
        DisabledButton.confirm,
        DisabledButton.report_problem,
      ],
      showScanError: false,
    })
    expect(
      wrapper.find('.advanced-view-button').classes().includes('is-disabled')
    ).toBeTruthy()
    expect(
      wrapper.find('.create-scan-button').classes().includes('is-disabled')
    ).toBeTruthy()
    expect(
      wrapper.find('.confirm-button').classes().includes('is-disabled')
    ).toBeTruthy()
    expect(
      wrapper.find('.report-problem-button').classes().includes('is-disabled')
    ).toBeTruthy()
  })

  it('should render critical problem correctly', async () => {
    addCriticalProblem()
    await wrapper.setProps({
      task: getCycleCountTask('S2T'),
      scannedBarcodes: [] as BarcodeDataType[],
      disabledButtons: [] as DisabledButton[],
      showScanError: false,
    })
    expect(wrapper.find('.confirm-button').text()).toBe(
      'Send to reject station'
    )
  })

  it('should change problem button type', async () => {
    await new Promise(process.nextTick)
    expect(wrapper.find('.report-problem-button').classes()).toContain(
      'tgw-button--primary'
    )
    addCriticalProblem()
    await new Promise(process.nextTick)
    expect(wrapper.find('.report-problem-button').classes()).toContain(
      'tgw-button--accent'
    )
  })

  it('should display send target on TargetFull', async () => {
    addTargetFull()
    await wrapper.setProps({
      task: getCycleCountTask('S2T'),
      scannedBarcodes: [] as BarcodeDataType[],
      disabledButtons: [] as DisabledButton[],
      showScanError: false,
    })
    expect(wrapper.find('.content-mid .button-text').text()).toBe('Send target')
  })

  it('should open emptyCompartmentMessageBox when quantity is 0 on confirm', async () => {
    expect(wrapper.emitted('actionButtonClicked')?.length).toBe(4)
    taskStore.resetCycleCountQuantities()
    await wrapper.find('.confirm-button').trigger('click')
    expect(wrapper.find('.empty-compartment-message-box').exists()).toBeTruthy()
    const buttons = wrapper.findAll('.dialog-button')
    expect(buttons.length).toBe(2)
    await buttons[1].trigger('click')
    expect(wrapper.emitted('actionButtonClicked')?.length).toBe(5)
    expect(wrapper.find('.empty-compartment-message-box').exists()).toBeFalsy()
  })

  it('should render confirm button correctly', async () => {
    const todoCompartment = getCompartmentCycleCounting(CycleCountState.toDo, 0)
    const finishedCompartment = getCompartmentCycleCounting(
      CycleCountState.finished,
      10
    )
    const inProgressCompartment = getCompartmentCycleCounting(
      CycleCountState.inProgress,
      0
    )

    // normal cycleCount with one compartment
    loadCarrierStore.sourceLoadCarrier = getSourceLoadCarrier()
    loadCarrierStore.sourceLoadCarrier.compartments[0] = inProgressCompartment
    const barcodeTypes = [
      { barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach },
    ] as BarcodeType[]
    taskStore.task = getCycleCountTask('S2S', barcodeTypes)
    await new Promise(process.nextTick)
    expect(wrapper.find('.confirm-button .button-text').text()).toBe(
      'Confirm & send'
    )

    // normal cycleCount with multiple compartments
    let compartments = [
      JSON.parse(JSON.stringify(todoCompartment)),
      JSON.parse(JSON.stringify(finishedCompartment)),
      JSON.parse(JSON.stringify(inProgressCompartment)),
    ]
    compartments[0].id = '1'
    compartments[1].id = '2'
    compartments[2].id = '3'
    loadCarrierStore.sourceLoadCarrier.compartments = compartments
    await new Promise(process.nextTick)
    expect(wrapper.find('.confirm-button .button-text').text()).toBe(
      'Confirm count'
    )

    loadCarrierStore.sourceLoadCarrier.compartments[0] = JSON.parse(
      JSON.stringify(finishedCompartment)
    )
    await new Promise(process.nextTick)
    expect(wrapper.find('.confirm-button .button-text').text()).toBe(
      'Confirm & send'
    )

    // multiItemloadCarrier with one compartment
    compartments = [getMultiItemCompartment()]
    compartments[0].cycleCountState = CycleCountState.inProgress
    loadCarrierStore.sourceLoadCarrier.compartments = compartments
    await new Promise(process.nextTick)
    expect(wrapper.find('.confirm-button .button-text').text()).toBe(
      'Confirm & send'
    )

    // multiItemloadCarrier with multiple compartments
    loadCarrierStore.sourceLoadCarrier.compartments.push(
      getMultiItemCompartment()
    )
    loadCarrierStore.sourceLoadCarrier.compartments[1].cycleCountState =
      CycleCountState.toDo
    await new Promise(process.nextTick)
    expect(wrapper.find('.confirm-button .button-text').text()).toBe(
      'Confirm count'
    )

    loadCarrierStore.sourceLoadCarrier.compartments[1].cycleCountState =
      CycleCountState.finished
    await new Promise(process.nextTick)
    expect(wrapper.find('.confirm-button .button-text').text()).toBe(
      'Confirm & send'
    )
  })

  it('should disable advanced and scan button on critical problem', async () => {
    addCriticalProblem()
    await wrapper.setProps({
      task: getCycleCountTask('S2T', [getBarcode(BarcodeTypeEnum.Gtin)]),
      scannedBarcodes: [] as BarcodeDataType[],
      disabledButtons: [] as DisabledButton[],
      showScanError: false,
    })

    expect(wrapper.find('.confirm-button').text()).toBe(
      'Send to reject station'
    )
    expect(
      wrapper.find('.create-scan-button').classes().includes('is-disabled')
    ).toBeTruthy()
    expect(
      wrapper.find('.advanced-view-button').classes().includes('is-disabled')
    ).toBeTruthy()
  })

  it('should not display empty compartment message box on critical problem', async () => {
    addCriticalProblem()
    await wrapper.setProps({
      task: getCycleCountTask('S2T', [getBarcode(BarcodeTypeEnum.Gtin)]),
      scannedBarcodes: [] as BarcodeDataType[],
      disabledButtons: [] as DisabledButton[],
      showScanError: false,
    })
    const confirmButton = wrapper.find('.confirm-button')

    expect(confirmButton.text()).toBe('Send to reject station')
    expect(wrapper.find('.empty-compartment-message-box').exists()).toBeFalsy()

    await confirmButton.trigger('click')
    await new Promise(process.nextTick)

    expect(wrapper.find('.empty-compartment-message-box').exists()).toBeFalsy()
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
  })
})
