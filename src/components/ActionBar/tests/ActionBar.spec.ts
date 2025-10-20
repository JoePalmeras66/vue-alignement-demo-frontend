// noinspection DuplicatedCode

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { VueWrapper, shallowMount } from '@vue/test-utils'
import ActionBar from '@/components/ActionBar/ActionBar.vue'
import { ButtonAction } from '@/types/ButtonAction'
import { DisabledButton } from '@/types/DisabledButton'
import {
  addCriticalProblem,
  addTargetFull,
  getBarcode,
  getPickingTask,
} from '@/helpers/testDataProvider'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import {
  BarcodeTypeEnum,
  ProblemTypeEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'

setActivePinia(createPinia())

describe('Test ActionBar', () => {
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
        'zero-crossing': {
          zero_crossing_empty_no: 'Nein',
          zero_crossing_empty_yes: 'Ja',
        },
        'action-bar': {
          edit: 'Edit',
          error_info: 'Error info',
          robot_paused: 'Robot paused',
        },
      },
    },
  })

  let wrapper: VueWrapper<InstanceType<typeof ActionBar>>

  const mountActionBar = (props: InstanceType<typeof ActionBar>['$props']) => {
    wrapper = shallowMount(ActionBar, {
      global: {
        plugins: [i18n],
      },
      props,
    })
  }

  const taskStore = useTaskStore()
  const rovoflexStore = useRovoflexStore()
  const troubleshootingStore = useTroubleshootingStore()

  const resetStores = () => {
    troubleshootingStore.$reset()
    taskStore.$reset()
    rovoflexStore.$reset()
  }

  beforeEach(() => {
    resetStores()
    rovoflexStore.hasConfirmedError = false
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should render correctly', () => {
    mountActionBar({
      task: undefined,
      showZeroCrossing: false,
      disabledButtons: [],
      scannedBarcodes: [],
    })
    expect(wrapper.find('.content-left').exists()).toBeTruthy()
    expect(wrapper.find('.content-mid').exists()).toBeTruthy()
    expect(wrapper.find('.content-right').exists()).toBeTruthy()
    expect(wrapper.find('.confirm-pick-button.confirm').exists()).toBeTruthy()
    expect(wrapper.find('.confirm-pick-button.send-away').exists()).toBeFalsy()
    expect(wrapper.find('.split-pick-button').exists()).toBeTruthy()
    expect(wrapper.find('.report-problem-button').exists()).toBeTruthy()
    expect(wrapper.find('.confirm-pick-button').attributes().text).toBe(
      'Confirm'
    )
  })

  it('should render critical problem correctly', () => {
    addCriticalProblem()
    mountActionBar({
      task: getPickingTask(1, [getBarcode(BarcodeTypeEnum.Gtin)]),
      showZeroCrossing: false,
      scannedBarcodes: [],
      disabledButtons: [],
    })

    expect(wrapper.find('.confirm-pick-button').attributes().text).toBe(
      'Send to reject station'
    )
    expect(wrapper.find('.confirm-pick-button.send-away').exists()).toBeTruthy()
    expect(wrapper.find('.edit-scans-button').attributes().disabled).toBe(
      'true'
    )
  })

  it('should render zero crossing correctly', async () => {
    mountActionBar({
      task: getPickingTask(1, [getBarcode(BarcodeTypeEnum.Gtin)]),
      showZeroCrossing: true,
      scannedBarcodes: [],
      disabledButtons: [],
    })
    expect(wrapper.findAll('.edit-scans-button').length).toBe(0)
    expect(wrapper.findAll('.zero-crossing-button').length).toBe(2)
  })

  it('should not emit click event for confirm', async () => {
    mountActionBar({
      task: undefined,
      scannedBarcodes: [],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    const confirmPickButton = wrapper.find('.confirm-pick-button')
    await confirmPickButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).not.toHaveProperty('actionButtonClicked')
  })

  it('should not emit click event for report problem and split pick', async () => {
    mountActionBar({
      task: undefined,
      scannedBarcodes: [],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    const reportProblemButton = wrapper.find('.report-problem-button')
    await reportProblemButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).not.toHaveProperty('actionButtonClicked')

    const splitPickButton = wrapper.find('.split-pick-button')
    await splitPickButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).not.toHaveProperty('actionButtonClicked')
  })

  it('should emit click event for confirm', async () => {
    mountActionBar({
      task: getPickingTask(1),
      scannedBarcodes: [],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    const confirmPickButton = wrapper.find('.confirm-pick-button')
    await confirmPickButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[0]).toContain(
      ButtonAction.confirm.toString()
    )
  })

  it('should emit click event for report problem', async () => {
    mountActionBar({
      task: getPickingTask(1),
      scannedBarcodes: [],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    const reportProblemButton = wrapper.find('.report-problem-button')
    await reportProblemButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[0]).toContain(
      ButtonAction.report_problem.toString()
    )
  })

  it('should emit click event for split pick', async () => {
    mountActionBar({
      task: getPickingTask(2),
      scannedBarcodes: [],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    const splitPickButton = wrapper.find('.split-pick-button')
    await splitPickButton.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[0]).toContain(
      ButtonAction.split_pick.toString()
    )
  })

  it('should disable split pick button when quantity is 1', () => {
    taskStore.originalQuantity = 1
    mountActionBar({
      task: getPickingTask(1),
      scannedBarcodes: [],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    const splitPickButton = wrapper.find('.split-pick-button')
    expect(splitPickButton.attributes().disabled).toEqual('true')
  })

  it('should disable split pick button when a critical problem is selected', () => {
    addCriticalProblem()
    mountActionBar({
      task: getPickingTask(2),
      scannedBarcodes: [],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    const splitPickButton = wrapper.find('.split-pick-button')
    expect(splitPickButton.attributes().disabled).toEqual('true')
  })

  it('should emit click event for empty', async () => {
    mountActionBar({
      task: getPickingTask(1),
      showZeroCrossing: true,
      disabledButtons: [],
      scannedBarcodes: [],
    })
    const empty = wrapper.findAll('.zero-crossing-button')[1]
    await empty.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[0]).toContain(
      ButtonAction.zero_crossing_empty_yes.toString()
    )
  })

  it('should emit click event for filled', async () => {
    mountActionBar({
      task: getPickingTask(1),
      showZeroCrossing: true,
      disabledButtons: [],
      scannedBarcodes: [],
    })
    const filled = wrapper.findAll('.zero-crossing-button')[0]
    await filled.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[0]).toContain(
      ButtonAction.zero_crossing_empty_no.toString()
    )
  })

  it('should emit click event for edit scans', async () => {
    mountActionBar({
      task: getPickingTask(1, [getBarcode(BarcodeTypeEnum.Gtin)]),
      showZeroCrossing: false,
      disabledButtons: [],
      scannedBarcodes: [{ barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin }],
    })
    const editScans = wrapper.find('.edit-scans-button')
    await editScans.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[0]).toContain(
      ButtonAction.edit_scans.toString()
    )
  })

  it('should disable all buttons', () => {
    mountActionBar({
      task: getPickingTask(1),
      showZeroCrossing: false,
      scannedBarcodes: [],
      disabledButtons: [DisabledButton.all],
    })
    expect(wrapper.find('.report-problem-button').attributes()).toHaveProperty(
      'disabled'
    )
    expect(wrapper.find('.confirm-pick-button').attributes()).toHaveProperty(
      'disabled'
    )
    expect(wrapper.find('.split-pick-button').attributes()).toHaveProperty(
      'disabled'
    )
  })

  it('should disable confirm button', () => {
    mountActionBar({
      task: getPickingTask(1),
      showZeroCrossing: false,
      scannedBarcodes: [],
      disabledButtons: [DisabledButton.confirm],
    })
    expect(wrapper.find('.report-problem-button').attributes().disabled).toBe(
      'false'
    )
    expect(wrapper.find('.confirm-pick-button').attributes().disabled).toBe(
      'true'
    )
  })

  it('should render scanning buttons', () => {
    mountActionBar({
      task: getPickingTask(1, [getBarcode(BarcodeTypeEnum.Gtin)]),
      showZeroCrossing: false,
      scannedBarcodes: [],
      disabledButtons: [],
    })
    const editScans = wrapper.find('.edit-scans-button')
    expect(editScans.attributes().text).toBe('Edit scans')
    expect(wrapper.find('.undo-last-scan-button').exists()).toBeTruthy()
  })

  it('should render scanning once is in process', () => {
    mountActionBar({
      task: getPickingTask(1, [getBarcode(BarcodeTypeEnum.Gtin)]),
      showZeroCrossing: false,
      scannedBarcodes: [],
      disabledButtons: [],
    })
    expect(wrapper.find('.scan-progress').exists()).toBeTruthy()
    expect(wrapper.find('.scan-progress').attributes()).toHaveProperty(
      'percentage'
    )
    expect(wrapper.find('.scan-progress').attributes().percentage).toBe('0')
    expect(wrapper.find('.scan-action-icon').exists()).toBeTruthy()
    expect(wrapper.find('.scan-action-icon').attributes()).toHaveProperty(
      'color'
    )
    expect(wrapper.find('.scan-action-icon').attributes().color).toBe(
      'var(--tgw-primary)'
    )
    expect(wrapper.find('.scan-action-icon').attributes()).toHaveProperty(
      'icon'
    )
    expect(wrapper.find('.scan-action-icon').attributes().icon).toBe('barcode')
  })

  it('should render scanning once done', () => {
    mountActionBar({
      task: getPickingTask(1, [getBarcode(BarcodeTypeEnum.Gtin)]),
      scannedBarcodes: [{ barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin }],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    expect(wrapper.find('.scan-progress').exists()).toBeTruthy()
    expect(wrapper.find('.scan-progress').attributes()).toHaveProperty(
      'percentage'
    )
    expect(wrapper.find('.scan-progress').attributes().percentage).toBe('100')
    expect(wrapper.find('.scan-action-icon').exists()).toBeTruthy()
    expect(wrapper.find('.scan-action-icon').attributes()).toHaveProperty(
      'color'
    )
    expect(wrapper.find('.scan-action-icon').attributes().color).toBe(
      'var(--tgw-status-success)'
    )
    expect(wrapper.find('.scan-action-icon').attributes()).toHaveProperty(
      'icon'
    )
    expect(wrapper.find('.scan-action-icon').attributes().icon).toBe('barcode')
  })

  it('should render scanning each is in process', () => {
    mountActionBar({
      task: getPickingTask(2, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
      scannedBarcodes: [{ barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin }],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    const scanTextElements = wrapper.findAll('.scan-text-container__text')
    expect(scanTextElements.length).toBe(2)
    expect(scanTextElements[0].text()).toBe('1')
    expect(scanTextElements[1].text()).toBe('/2')
    expect(wrapper.find('.scan-progress').exists()).toBeTruthy()
    expect(wrapper.find('.scan-progress').attributes()).toHaveProperty(
      'percentage'
    )
    expect(wrapper.find('.scan-progress').attributes().percentage).toBe('50')
    expect(wrapper.find('.scan-action-icon').exists()).toBeTruthy()
    expect(wrapper.find('.scan-action-icon').attributes()).toHaveProperty(
      'color'
    )
    expect(wrapper.find('.scan-action-icon').attributes().color).toBe(
      'var(--tgw-status-warning)'
    )
    expect(wrapper.find('.scan-action-icon').attributes()).toHaveProperty(
      'icon'
    )
    expect(wrapper.find('.scan-action-icon').attributes().icon).toBe(
      'barcode-multiple'
    )
  })

  it('should render scanning each done', () => {
    mountActionBar({
      task: getPickingTask(2, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
      scannedBarcodes: [
        { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
        { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      ],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    const scanTextElements = wrapper.findAll('.scan-text-container__text')
    expect(scanTextElements.length).toBe(2)
    expect(scanTextElements[0].text()).toBe('2')
    expect(scanTextElements[1].text()).toBe('/2')
    expect(wrapper.find('.scan-progress').exists()).toBeTruthy()
    expect(wrapper.find('.scan-progress').attributes()).toHaveProperty(
      'percentage'
    )
    expect(wrapper.find('.scan-progress').attributes().percentage).toBe('100')
    expect(wrapper.find('.scan-action-icon').exists()).toBeTruthy()
    expect(wrapper.find('.scan-action-icon').attributes()).toHaveProperty(
      'color'
    )
    expect(wrapper.find('.scan-action-icon').attributes().color).toBe(
      'var(--tgw-status-success)'
    )
    expect(wrapper.find('.scan-action-icon').attributes()).toHaveProperty(
      'icon'
    )
    expect(wrapper.find('.scan-action-icon').attributes().icon).toBe(
      'barcode-multiple'
    )
  })

  it('should show the number of saved problems', async () => {
    mountActionBar({
      task: getPickingTask(2, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
      scannedBarcodes: [
        { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
        { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      ],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    expect(wrapper.find('.report-problem-button').attributes().text).toBe(
      'Report problem'
    )
    troubleshootingStore.sourceProblems.push(ProblemTypeEnum.DamagedLoadCarrier)
    await new Promise(process.nextTick)
    expect(wrapper.find('.report-problem-button').attributes().text).toBe(
      '1 problem saved'
    )
    troubleshootingStore.sourceProblems.push(ProblemTypeEnum.DamagedLoadCarrier)
    await new Promise(process.nextTick)
    expect(wrapper.find('.report-problem-button').attributes().text).toBe(
      '2 problems saved'
    )
  })

  it('should change problem button type', async () => {
    mountActionBar({
      task: getPickingTask(2, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
      scannedBarcodes: [
        { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
        { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      ],
      showZeroCrossing: false,
      disabledButtons: [],
    })
    expect(wrapper.find('.report-problem-button').attributes()).toHaveProperty(
      'type'
    )
    expect(wrapper.find('.report-problem-button').attributes().type).toBe(
      'primary'
    )
    troubleshootingStore.sourceProblems.push(ProblemTypeEnum.DamagedLoadCarrier)
    await new Promise(process.nextTick)
    expect(wrapper.find('.report-problem-button').attributes()).toHaveProperty(
      'type'
    )
    expect(wrapper.find('.report-problem-button').attributes().type).toBe(
      'accent'
    )
  })

  it('should change problem button type and text', async () => {
    mountActionBar({
      task: getPickingTask(1),
      showZeroCrossing: false,
      scannedBarcodes: [],
      disabledButtons: [],
    })
    taskStore.originalQuantity = 1
    await new Promise(process.nextTick)
    expect(wrapper.find('.split-pick-button').attributes()).toHaveProperty(
      'type'
    )
    expect(wrapper.find('.split-pick-button').attributes().type).toBe('primary')
    expect(wrapper.find('.split-pick-button').attributes().text).toBe(
      'Split pick'
    )
    expect(wrapper.find('.split-pick-button').attributes().icon).toBe('split')
    taskStore.originalQuantity = 0
    await new Promise(process.nextTick)
    expect(wrapper.find('.split-pick-button').attributes()).toHaveProperty(
      'type'
    )
    expect(wrapper.find('.split-pick-button').attributes().type).toBe('accent')
    expect(wrapper.find('.split-pick-button').attributes().text).toBe(
      'Undo split'
    )
    expect(wrapper.find('.split-pick-button').attributes().icon).toBe('reset')
  })

  it('should show robot paused state', async () => {
    mountActionBar({
      task: getPickingTask(1),
      showZeroCrossing: false,
      scannedBarcodes: [],
      disabledButtons: [],
    })
    rovoflexStore.hasConfirmedError = true
    await new Promise(process.nextTick)
    expect(wrapper.find('.error-info-button').exists()).toBeTruthy()
    expect(wrapper.find('.robot-paused').exists()).toBeTruthy()
    expect(
      wrapper.find('.robot-paused .robot-paused-text').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.robot-paused .robot-paused-indicator').exists()
    ).toBeTruthy()
  })

  it('should display send target on TargetFull', () => {
    addTargetFull()
    mountActionBar({
      task: getPickingTask(1),
      showZeroCrossing: false,
      scannedBarcodes: [],
      disabledButtons: [],
    })
    expect(wrapper.find('.confirm-pick-button').attributes().text).toBe(
      'Send target'
    )
  })
})
