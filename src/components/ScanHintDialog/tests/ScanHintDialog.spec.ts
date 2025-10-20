import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { VueWrapper, mount } from '@vue/test-utils'
import ScanHintDialog from '@/components/ScanHintDialog/ScanHintDialog.vue'
import {
  getBarcode,
  getBarcodeData,
  getCompartment,
  getMultiItemCycleCountTask,
  getPickingTask,
  getSourceLoadCarrier,
  getSourceLoadCarrierWithCompartments,
} from '@/helpers/testDataProvider'
import { ScanModificationMode } from '@/types/ScanModificationMode'
import {
  BarcodeTypeEnum,
  WorkStationDirectionEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'

setActivePinia(createPinia())
describe('Test ScanHintDialog', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'scan-hint-dialog': {
          cancel: 'Cancel',
          confirm: 'Confirm',
          delete_header: 'Delete scan',
          create_header: 'Create scan',
          source: 'Source load carrier',
          source_sector: 'source load carrier',
          source_desc: 'source load carrier',
          target: 'Target load carrier',
          target_sector: 'target load carrier',
          target_desc: 'target load carrier',
          item: 'Item',
          create_scan_sector_description:
            'Please put the following item into the marked sector of the',
          create_scan_description: 'Please put the following item into the',
          delete_scan_sector_description:
            'Please put the following item back into the marked sector of the',
          delete_scan_description:
            'Please put the following item back into the',
        },
      },
    },
  })

  let wrapper: VueWrapper<InstanceType<typeof ScanHintDialog>>
  const mountScanHintDialog = (
    props: InstanceType<typeof ScanHintDialog>['$props']
  ) => {
    wrapper = mount(ScanHintDialog, {
      global: {
        plugins: [i18n],
        stubs: { LoadCarrierCompartments: true, ScanDetails: true },
      },
      props,
    })
  }

  const workspaceStore = useWorkspaceStore()

  beforeEach(() => {
    workspaceStore.$reset()
    workspaceStore.workstationDirection = WorkStationDirectionEnum.LeftToRight
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should render correctly', async () => {
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.create,
      task: getPickingTask(2, [getBarcode(BarcodeTypeEnum.Gtin)], '', true),
      loadCarrier: getSourceLoadCarrier(),
      barcodes: [
        getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
        getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
      ],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.scan-hint-dialog').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-text').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-text').text()).toBe('Create scan')
    expect(
      wrapper.find('.dialog-header-description-container').exists()
    ).toBeTruthy()
    expect(wrapper.find('.dialog-header-description').exists()).toBeTruthy()
    expect(wrapper.find('.dialog-header-description').text()).toBe(
      'Please put the following item into the'
    )
    expect(
      wrapper.find('.dialog-header-description.highlighted').exists()
    ).toBeTruthy()
    expect(wrapper.find('.dialog-header-description.highlighted').text()).toBe(
      'target load carrier:'
    )
    expect(wrapper.find('.dialog-body').exists()).toBeTruthy()
    expect(wrapper.find('.scan-information').exists()).toBeTruthy()
    expect(wrapper.find('.scan-information').classes()).toContain('right')
    expect(wrapper.find('.scan-details-container').exists()).toBeTruthy()
    expect(
      wrapper.find('.scan-details-container .header-text').exists()
    ).toBeTruthy()
    expect(wrapper.find('.scan-details-container .header-text').text()).toBe(
      'Item'
    )
    expect(wrapper.find('scan-details-stub').exists()).toBeTruthy()
    expect(wrapper.find('.arrow-icon').exists()).toBeTruthy()
    expect(wrapper.find('.arrow-icon').classes()).toContain('right')
    expect(wrapper.find('.header-compartment-container').exists()).toBeTruthy()
    expect(
      wrapper.find('.header-compartment-container .header-text').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.header-compartment-container .header-text').text()
    ).toBe('Target load carrier')
    expect(wrapper.find('.compartments-container').exists()).toBeTruthy()
    expect(wrapper.find('load-carrier-compartments-stub').exists()).toBeTruthy()
    expect(wrapper.findAll('.dialog-button').length).toBe(2)
    expect(wrapper.findAll('.dialog-button')[0].text()).toBe('Cancel')
    expect(wrapper.findAll('.dialog-button')[1].text()).toBe('Confirm')
  })

  it('should close on cancel click', async () => {
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.create,
      task: getPickingTask(2, [getBarcode(BarcodeTypeEnum.Gtin)], '', true),
      loadCarrier: getSourceLoadCarrier(),
      barcodes: [
        getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
        getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
      ],
    })
    await new Promise(process.nextTick)
    expect(wrapper.vm.isVisible).toBeTruthy()
    const cancelButton = wrapper.findAll('.dialog-button')[0]
    await cancelButton.trigger('click')
    await new Promise(process.nextTick)
    expect((wrapper.emitted()['update:isVisible'][0] as [0])[0]).toBeFalsy()
  })

  it('should emit continue', async () => {
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.create,
      task: getPickingTask(2, [getBarcode(BarcodeTypeEnum.Gtin)], '', true),
      loadCarrier: getSourceLoadCarrier(),
      barcodes: [
        getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
        getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
      ],
    })
    await new Promise(process.nextTick)
    expect(wrapper.vm.isVisible).toBeTruthy()
    const confirmButton = wrapper.findAll('.dialog-button')[1]
    expect(confirmButton.attributes()).not.toHaveProperty('disabled')
    await confirmButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('confirm')
    expect((wrapper.emitted().confirm[0] as [0])[0]).toEqual(undefined)
  })

  it('should render RightToLeft in mode create', async () => {
    workspaceStore.workstationDirection = WorkStationDirectionEnum.RightToLeft
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.create,
      task: getPickingTask(2, [getBarcode(BarcodeTypeEnum.Gtin)], '', true),
      loadCarrier: getSourceLoadCarrier(),
      barcodes: [
        getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
        getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
      ],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.scan-information').classes()).toContain('left')
    expect(wrapper.find('.arrow-icon').classes()).toContain('left')
  })

  it('should render LeftToRight in mode create', async () => {
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.create,
      task: getPickingTask(2, [getBarcode(BarcodeTypeEnum.Gtin)], '', true),
      loadCarrier: getSourceLoadCarrier(),
      barcodes: [
        getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
        getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
      ],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.scan-information').classes()).toContain('right')
    expect(wrapper.find('.arrow-icon').classes()).toContain('right')
  })

  it('should render RightToLeft in mode delete', async () => {
    workspaceStore.workstationDirection = WorkStationDirectionEnum.RightToLeft
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.delete,
      task: getPickingTask(2, [getBarcode(BarcodeTypeEnum.Gtin)], '', true),
      loadCarrier: getSourceLoadCarrier(),
      barcodes: [
        getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
        getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
      ],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.scan-information').classes()).toContain('right')
    expect(wrapper.find('.arrow-icon').classes()).toContain('right')
  })

  it('should render LeftToRight in mode delete', async () => {
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.delete,
      task: getPickingTask(2, [getBarcode(BarcodeTypeEnum.Gtin)], '', true),
      loadCarrier: getSourceLoadCarrier(),
      barcodes: [
        getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
        getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
      ],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.scan-information').classes()).toContain('left')
    expect(wrapper.find('.arrow-icon').classes()).toContain('left')
  })

  it('should render delete scan', async () => {
    workspaceStore.workstationDirection = WorkStationDirectionEnum.RightToLeft
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.delete,
      task: getPickingTask(2, [getBarcode(BarcodeTypeEnum.Gtin)], '', true),
      loadCarrier: getSourceLoadCarrier(),
      barcodes: [
        getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
        getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
      ],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.dialog-header-text').text()).toBe('Delete scan')
    expect(wrapper.find('.dialog-header-description').text()).toBe(
      'Please put the following item back into the'
    )
    expect(wrapper.find('.dialog-header-description.highlighted').text()).toBe(
      'source load carrier:'
    )
  })

  it('should render delete scan multiple compartments', async () => {
    workspaceStore.workstationDirection = WorkStationDirectionEnum.RightToLeft
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.delete,
      task: getPickingTask(2, [getBarcode(BarcodeTypeEnum.Gtin)], '', true),
      loadCarrier: getSourceLoadCarrierWithCompartments([
        getCompartment(),
        getCompartment(),
      ]),
      barcodes: [
        getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
        getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
      ],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.dialog-header-text').text()).toBe('Delete scan')
    expect(wrapper.find('.dialog-header-description').text()).toBe(
      'Please put the following item back into the marked sector of the'
    )
    expect(wrapper.find('.dialog-header-description.highlighted').text()).toBe(
      'source load carrier:'
    )
  })

  it('should render create scan multiple compartments', async () => {
    workspaceStore.workstationDirection = WorkStationDirectionEnum.RightToLeft
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.create,
      task: getPickingTask(2, [getBarcode(BarcodeTypeEnum.Gtin)], '', true),
      loadCarrier: getSourceLoadCarrierWithCompartments([
        getCompartment(),
        getCompartment(),
      ]),
      barcodes: [
        getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
        getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
      ],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.dialog-header-text').text()).toBe('Create scan')
    expect(wrapper.find('.dialog-header-description').text()).toBe(
      'Please put the following item into the marked sector of the'
    )
    expect(wrapper.find('.dialog-header-description.highlighted').text()).toBe(
      'target load carrier:'
    )
  })

  it('should load task without item correctly', async () => {
    const loadCarrierStore = useLoadCarrierStore()
    loadCarrierStore.sourceLoadCarrier = getSourceLoadCarrier()
    loadCarrierStore.sourceLoadCarrier.compartments[0].items[0].item.gtins.push(
      '0815'
    )
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.create,
      task: getMultiItemCycleCountTask('S2T', [
        getBarcode(BarcodeTypeEnum.Gtin),
      ]),
      loadCarrier: getSourceLoadCarrier(),
      barcodes: [getBarcodeData(BarcodeTypeEnum.Gtin, '0815')],
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('scan-details-stub').exists()).toBeTruthy()
    expect(
      (wrapper.vm as InstanceType<typeof ScanHintDialog>).itemData
    ).toEqual(loadCarrierStore.sourceLoadCarrier.compartments[0].items[0].item)
  })

  it('should change opened when onOpened gets triggered and emit confirm on enter press', async () => {
    mountScanHintDialog({
      isVisible: true,
      mode: ScanModificationMode.create,
      task: getMultiItemCycleCountTask('S2T', [
        getBarcode(BarcodeTypeEnum.Gtin),
      ]),
      loadCarrier: getSourceLoadCarrier(),
      barcodes: [getBarcodeData(BarcodeTypeEnum.Gtin, '0815')],
    })
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).not.toHaveProperty('confirm')
    const event = new KeyboardEvent('keypress', {
      key: 'Enter',
    })
    // add a target property to the KeyboardEvent to be able to check what was focused
    Object.defineProperty(event, 'target', {
      value: wrapper.find('.cancel').element,
      writable: true,
    })
    document.dispatchEvent(event)
    expect(wrapper.emitted()).not.toHaveProperty('confirm')

    Object.defineProperty(event, 'target', {
      value: wrapper.find('.confirm').element,
      writable: true,
    })

    document.dispatchEvent(event)
    expect(wrapper.emitted().confirm.length).toBe(1)
  })
})
