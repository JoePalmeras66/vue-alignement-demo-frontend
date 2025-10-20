// noinspection DuplicatedCode

import { beforeEach, describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { shallowMount } from '@vue/test-utils'
import ConsolidationActionBar from '@/components/ConsolidationActionBar/ConsolidationActionBar.vue'
import {
  addCriticalProblem,
  addTargetFull,
  getBarcode,
  getConsolidationTask,
  getConsolidationTaskWithQuantity,
  getManualConsolidationTask,
} from '@/helpers/testDataProvider'
import { ButtonAction } from '@/types/ButtonAction'
import { DisabledButton } from '@/types/DisabledButton'
import { ConsolidationModeEnum } from '@/types/ConsolidationModeEnum'
import {
  BarcodeTypeEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'
import { BarcodeType } from '@/types/Api/pcots/PcotsApiModel'

setActivePinia(createPinia())

describe('Test ConsolidationActionBar', () => {
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
        'consolidation-action-bar': {
          edit: 'Edit',
          mode_switch: 'Manual mode',
          inventory: 'Inventory',
          swap: 'Swap',
          move: 'Move',
          move_description: 'Select the compartment which you want to move',
          move_description2: 'Select the target compartment',
        },
      },
    },
  })
  const wrapper = shallowMount(ConsolidationActionBar, {
    global: {
      plugins: [i18n],
    },
    props: {
      task: undefined,
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    },
  })

  const taskStore = useTaskStore()
  const troubleshootingStore = useTroubleshootingStore()

  beforeEach(() => {
    troubleshootingStore.$reset()
  })

  it('should render correctly', () => {
    expect(wrapper.find('.content-left').exists()).toBeTruthy()
    expect(wrapper.find('.content-mid').exists()).toBeTruthy()
    expect(wrapper.find('.content-right').exists()).toBeTruthy()
    expect(wrapper.find('.confirm-pick-button.confirm').exists()).toBeTruthy()
    expect(wrapper.find('.confirm-pick-button.send-away').exists()).toBeFalsy()
    expect(wrapper.find('.report-problem-button').exists()).toBeTruthy()
    expect(wrapper.find('.confirm-pick-button').attributes().text).toBe(
      'Confirm'
    )
    expect(wrapper.find('.switch-wrapper').exists()).toBeFalsy()
    expect(wrapper.find('.mode-switch').exists()).toBeFalsy()
    expect(wrapper.find('.switch-text').exists()).toBeFalsy()
    expect(wrapper.find('.undo-last-scan-button').exists()).toBeFalsy()
  })

  it('should render correctly for manual consolidation task', async () => {
    await wrapper.setProps({
      task: getManualConsolidationTask(),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    expect(wrapper.find('.switch-wrapper').exists()).toBeTruthy()
    expect(wrapper.find('.mode-switch').exists()).toBeTruthy()
    expect(wrapper.find('tgw-switch-stub').exists()).toBeTruthy()
    expect(wrapper.find('tgw-switch-stub').attributes().label).toBe(
      'Manual mode'
    )
    expect(wrapper.find('.split-pick-button').exists()).toBeFalsy()
    expect(wrapper.find('.undo-last-scan-button').exists()).toBeFalsy()
  })

  it('should render critical problem correctly', async () => {
    addCriticalProblem()
    await wrapper.setProps({
      task: getConsolidationTask(2, [getBarcode(BarcodeTypeEnum.Gtin)]),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    expect(wrapper.find('.confirm-pick-button').attributes().text).toBe(
      'Send to reject station'
    )
    expect(wrapper.find('.confirm-pick-button.send-away').exists()).toBeTruthy()
    expect(wrapper.find('.edit-scans-button').attributes().disabled).toBe(
      'true'
    )
  })

  it('should not emit click event for confirm', async () => {
    await wrapper.setProps({
      task: undefined,
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    const confirmPickButton = wrapper.find('.confirm-pick-button')
    await confirmPickButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).not.toHaveProperty('actionButtonClicked')
  })

  it('should not emit click event for report problem', async () => {
    await wrapper.setProps({
      task: undefined,
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    const reportProblemButton = wrapper.find('.report-problem-button')
    await reportProblemButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).not.toHaveProperty('actionButtonClicked')
  })

  it('should emit click event for confirm', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
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
    await wrapper.setProps({
      task: getConsolidationTask(),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    const reportProblemButton = wrapper.find('.report-problem-button')
    await reportProblemButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[1]).toContain(
      ButtonAction.report_problem.toString()
    )
  })

  it('should emit click event for edit scans', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(2, [getBarcode(BarcodeTypeEnum.Gtin)]),
      disabledButtons: [],
      scannedBarcodes: [{ barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin }],
      showZeroCrossing: false,
    })
    const editScans = wrapper.find('.edit-scans-button')
    await editScans.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[2]).toContain(
      ButtonAction.edit_scans.toString()
    )
  })

  it('should disable all buttons', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(),
      disabledButtons: [DisabledButton.all],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    expect(wrapper.find('.report-problem-button').attributes()).toHaveProperty(
      'disabled'
    )
    expect(wrapper.find('.confirm-pick-button').attributes()).toHaveProperty(
      'disabled'
    )
  })

  it('should disable confirm button', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(),
      disabledButtons: [DisabledButton.confirm],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    expect(wrapper.find('.report-problem-button').attributes().disabled).toBe(
      'false'
    )
    expect(wrapper.find('.confirm-pick-button').attributes().disabled).toBe(
      'true'
    )
  })

  it('should render scanning buttons', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(2, [getBarcode(BarcodeTypeEnum.Gtin)]),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    const editScans = wrapper.find('.edit-scans-button')
    expect(editScans.attributes().text).toBe('Edit scans')
    expect(wrapper.find('.undo-last-scan-button').exists()).toBeTruthy()
  })

  it('should render scanning once is in process', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(2, [getBarcode(BarcodeTypeEnum.Gtin)]),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
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

  it('should render scanning once done', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(2, [getBarcode(BarcodeTypeEnum.Gtin)]),
      disabledButtons: [],
      scannedBarcodes: [{ barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin }],
      showZeroCrossing: false,
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

  it('should render scanning each is in process', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(2, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
      disabledButtons: [],
      scannedBarcodes: [{ barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin }],
      showZeroCrossing: false,
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

  it('should render scanning each done', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(2, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
      disabledButtons: [],
      scannedBarcodes: [
        { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
        { barcode: '1234', barcodeType: BarcodeTypeEnum.Gtin },
      ],
      showZeroCrossing: false,
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
    await new Promise(process.nextTick)
    expect(wrapper.find('.report-problem-button').attributes().text).toBe(
      'Report problem'
    )
    addCriticalProblem()
    await new Promise(process.nextTick)
    expect(wrapper.find('.report-problem-button').attributes().text).toBe(
      '1 problem saved'
    )
    addCriticalProblem()
    await new Promise(process.nextTick)
    expect(wrapper.find('.report-problem-button').attributes().text).toBe(
      '2 problems saved'
    )
  })

  it('should change problem button type', async () => {
    await new Promise(process.nextTick)
    expect(wrapper.find('.report-problem-button').attributes()).toHaveProperty(
      'type'
    )
    expect(wrapper.find('.report-problem-button').attributes().type).toBe(
      'primary'
    )
    addCriticalProblem()
    await new Promise(process.nextTick)
    expect(wrapper.find('.report-problem-button').attributes()).toHaveProperty(
      'type'
    )
    expect(wrapper.find('.report-problem-button').attributes().type).toBe(
      'accent'
    )
  })

  it('should render manual mode', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(),
      scannedBarcodes: [],
      disabledButtons: [],
      showZeroCrossing: false,
    })
    await new Promise(process.nextTick)
    wrapper.vm.consolidationMode = ConsolidationModeEnum.MANUAL
    await new Promise(process.nextTick)
    expect(wrapper.find('.manual-mode-buttons-wrapper').exists()).toBeTruthy()
    expect(wrapper.findAll('.manual-mode-button').length).toBe(3)
    expect(wrapper.findAll('.manual-mode-button')[0].attributes().text).toBe(
      'Inventory'
    )
    expect(wrapper.findAll('.manual-mode-button')[1].attributes().text).toBe(
      'Move'
    )
    expect(wrapper.findAll('.manual-mode-button')[2].attributes().text).toBe(
      'Swap'
    )
  })

  it('should render first step for move', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(),
      scannedBarcodes: [],
      activeCompartmentCount: undefined,
      disabledButtons: [],
      showZeroCrossing: false,
    })
    await new Promise(process.nextTick)
    wrapper.vm.consolidationMode = ConsolidationModeEnum.MANUAL
    wrapper.vm.buttonClicked(ButtonAction.move)
    await new Promise(process.nextTick)
    expect(wrapper.find('.cancel-button').exists()).toBeTruthy()
    expect(wrapper.find('.cancel-button').attributes().text).toBe('Cancel')
    expect(wrapper.find('.consolidation-action-progress').exists()).toBeTruthy()
    expect(
      wrapper.find('.consolidation-action-progress').attributes()
    ).toHaveProperty('percentage')
    expect(
      wrapper.find('.consolidation-action-progress').attributes().percentage
    ).toBe('0')
  })

  it('should render second step for move', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(),
      disabledButtons: [],
      scannedBarcodes: [],
      activeCompartmentCount: 1,
      showZeroCrossing: false,
    })
    await new Promise(process.nextTick)
    wrapper.vm.consolidationMode = ConsolidationModeEnum.MANUAL
    wrapper.vm.buttonClicked(ButtonAction.move)
    await new Promise(process.nextTick)
    expect(wrapper.find('.cancel-button').exists()).toBeTruthy()
    expect(wrapper.find('.cancel-button').attributes().text).toBe('Cancel')
    expect(wrapper.find('.consolidation-action-progress').exists()).toBeTruthy()
    expect(
      wrapper.find('.consolidation-action-progress').attributes()
    ).toHaveProperty('percentage')
    expect(
      wrapper.find('.consolidation-action-progress').attributes().percentage
    ).toBe('50')
  })

  it('should disable split pick button when quantity <= 1', async () => {
    taskStore.originalQuantity = 1
    await wrapper.setProps({
      task: getConsolidationTaskWithQuantity({
        value: taskStore.originalQuantity,
        minValue: 0,
        maxValue: 10,
      }),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.split-pick-button').exists()).toBeTruthy()
    expect(wrapper.find('.split-pick-button').attributes().disabled).toBe(
      'true'
    )
  })

  it('should disable split pick button when a critical problem is selected', async () => {
    addCriticalProblem()
    taskStore.originalQuantity = 2
    await wrapper.setProps({
      task: getConsolidationTaskWithQuantity({
        value: taskStore.originalQuantity,
        minValue: 0,
        maxValue: 10,
      }),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.split-pick-button').exists()).toBeTruthy()
    expect(wrapper.find('.split-pick-button').attributes().disabled).toBe(
      'true'
    )
  })

  it('should change split pick button', async () => {
    taskStore.originalQuantity = 2
    await wrapper.setProps({
      task: getConsolidationTaskWithQuantity({
        value: taskStore.originalQuantity,
        minValue: 0,
        maxValue: 10,
      }),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
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

  it('should not render split pick button without min max quantity', async () => {
    await wrapper.setProps({
      task: getConsolidationTaskWithQuantity({
        value: 2,
        minValue: undefined,
        maxValue: undefined,
      }),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    expect(wrapper.find('.split-pick-button').exists()).toBeFalsy()
  })

  it('should display send target on TargetFull', async () => {
    addTargetFull()
    await wrapper.setProps({
      task: getConsolidationTask(),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: false,
    })
    expect(wrapper.find('.confirm-pick-button').attributes().text).toBe(
      'Send target'
    )
  })

  it('should render zero crossing correctly', async () => {
    await wrapper.setProps({
      task: getConsolidationTask(2, [
        { barcodeType: BarcodeTypeEnum.Gtin, scanRule: ScanRuleEnum.ScanEach },
      ] as BarcodeType[]),
      disabledButtons: [],
      scannedBarcodes: [],
      showZeroCrossing: true,
    })
    expect(wrapper.find('.edit-scans-button').exists()).toBeFalsy()
    expect(wrapper.find('.undo-last-scan-button').exists()).toBeFalsy()
    expect(wrapper.findAll('.zero-crossing-button').length).toBe(2)
  })

  it('should emit click event for empty and filled', async () => {
    const empty = wrapper.findAll('.zero-crossing-button')[1]
    await empty.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[7]).toContain(
      ButtonAction.zero_crossing_empty_yes.toString()
    )

    const filled = wrapper.findAll('.zero-crossing-button')[0]
    await filled.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[8]).toContain(
      ButtonAction.zero_crossing_empty_no.toString()
    )
  })

  it('should disable zero crossing buttons correctly', async () => {
    await wrapper.setProps({
      task: getConsolidationTaskWithQuantity({
        value: 2,
        minValue: undefined,
        maxValue: undefined,
      }),
      scannedBarcodes: [],
      showZeroCrossing: true,
      disabledButtons: [
        DisabledButton.zero_crossing_empty_yes,
        DisabledButton.zero_crossing_empty_no,
      ],
    })
    expect(
      wrapper.findAll('.zero-crossing-button')[0].attributes().disabled
    ).toBeTruthy()
    expect(
      wrapper.findAll('.zero-crossing-button')[1].attributes().disabled
    ).toBeTruthy()
    await wrapper.setProps({
      task: getConsolidationTaskWithQuantity({
        value: 2,
        minValue: undefined,
        maxValue: undefined,
      }),
      scannedBarcodes: [],
      showZeroCrossing: true,
      disabledButtons: [DisabledButton.all],
    })
    await new Promise(process.nextTick)
    expect(
      wrapper.findAll('.zero-crossing-button')[0].attributes().disabled
    ).toBeTruthy()
    expect(
      wrapper.findAll('.zero-crossing-button')[1].attributes().disabled
    ).toBeTruthy()
  })
})
