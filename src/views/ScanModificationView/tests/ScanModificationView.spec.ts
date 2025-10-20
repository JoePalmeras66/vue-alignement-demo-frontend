import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createI18n } from 'vue-i18n'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ScanModificationView from '@/views/ScanModificationView/ScanModificationView.vue'
import { useBarcodeStore } from '@/stores/useBarcodeStore/useBarcodeStore'
import {
  BarcodeTypeEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { getPickingTask } from '@/helpers/testDataProvider'

setActivePinia(createPinia())
const mockRouterPush = vi.fn()
const mockRouterBack = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush, back: mockRouterBack }),
}))

describe('Test ScanModificationView', () => {
  let wrapper: VueWrapper<any>
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'scan-modification-view': {
          header_text: 'Edit scans',
          header_description: 'Manually create and delete scans',
          confirm: 'Confirm',
          delete_scan: ' Delete scan',
          create_scan: 'Create scan',
          no_scans: 'No scans found',
        },
        'scan-footer': {
          create_scan: 'Create scan',
          delete_scan: 'Delete scan',
        },
        'scan-hint-dialog': {
          cancel: 'Cancel',
          confirm: 'Confirm',
          delete_header: 'Delete scan',
          create_header: 'Create scan',
          source: 'Source load carrier',
          target: 'Target load carrier',
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

  const barcodeStore = useBarcodeStore()
  const taskStore = useTaskStore()

  beforeEach(() => {
    barcodeStore.$reset()
    taskStore.$reset()
    mockRouterPush.mockClear()
    mockRouterBack.mockClear()
  })

  const remount = (props?: any) => {
    wrapper = mount(ScanModificationView, {
      global: {
        plugins: [i18n],
      },
      props,
    })
  }

  it('should render correctly without scans', () => {
    remount()
    expect(wrapper.find('.scan-modification-view').exists()).toBeTruthy()
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(wrapper.find('.header .header-text').text()).toBe('Edit scans')
    expect(wrapper.find('.header .header-description').text()).toBe(
      'Manually create and delete scans'
    )

    expect(wrapper.find('.content').exists()).toBeTruthy()
    const contentElement = wrapper.find('.content .no-scans-container')
    expect(contentElement.exists()).toBeTruthy()
    expect(contentElement.find('.no-scans-bg').exists()).toBeTruthy()
    expect(contentElement.find('.no-scans-image').exists()).toBeTruthy()
    expect(contentElement.find('.no-scans-text').text()).toBe('No scans found')

    const footer = wrapper.find('.footer .scan-footer .content')
    expect(footer.exists()).toBeTruthy()
    expect(footer.find('.content-left .back-button').exists()).toBeTruthy()
    expect(
      footer.find('.content-mid .create-scan-button').exists()
    ).toBeTruthy()
    expect(
      footer.find('.content-mid .delete-scan-button').exists()
    ).toBeTruthy()
    expect(
      footer
        .find('.content-mid .delete-scan-button')
        .classes()
        .includes('is-disabled')
    ).toBeTruthy()
    expect(footer.find('.content-right').exists()).toBeTruthy()
  })

  it('should render correctly with scans', async () => {
    taskStore.task = getPickingTask(2, [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanOnce,
      },
    ])
    barcodeStore.barcodes.push({
      barcodeType: BarcodeTypeEnum.Gtin,
      barcode: '1234',
    })
    await new Promise(process.nextTick)

    expect(wrapper.find('.scan-item').exists()).toBeTruthy()
    expect(
      wrapper.find('.scan-item').classes().includes('is-selected')
    ).toBeTruthy()
    expect(
      wrapper
        .find('.footer .create-scan-button')
        .classes()
        .includes('is-disabled')
    ).toBeTruthy()
    expect(
      wrapper
        .find('.footer .delete-scan-button')
        .classes()
        .includes('is-disabled')
    ).not.toBeTruthy()

    barcodeStore.clearBarcodes()
    await new Promise(process.nextTick)
    expect(wrapper.find('.scan-item').exists()).toBeFalsy()
    expect(
      wrapper
        .find('.footer .create-scan-button')
        .classes()
        .includes('is-disabled')
    ).not.toBeTruthy()
    expect(
      wrapper
        .find('.footer .delete-scan-button')
        .classes()
        .includes('is-disabled')
    ).toBeTruthy()
  })

  it('should create scan', async () => {
    taskStore.task = getPickingTask(2, [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanOnce,
      },
    ])
    ;(wrapper.vm as typeof ScanModificationView).onContinueClicked([
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        barcode: '1234',
      },
    ])
    ;(wrapper.vm as typeof ScanModificationView).onConfirmClicked()
    await new Promise(process.nextTick)
    expect(wrapper.find('.scan-item').exists()).toBeTruthy()
    expect(
      wrapper.find('.scan-item').classes().includes('is-selected')
    ).toBeTruthy()
    expect(
      wrapper
        .find('.footer .create-scan-button')
        .classes()
        .includes('is-disabled')
    ).toBeTruthy()
    expect(
      wrapper
        .find('.footer .delete-scan-button')
        .classes()
        .includes('is-disabled')
    ).not.toBeTruthy()
    expect(wrapper.vm.selectedBarcodes).toEqual([
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        barcode: '1234',
      },
    ])
    expect(wrapper.vm.isCreateScanDialogVisible).toBeFalsy()
    expect(wrapper.vm.isScanHintDialogVisible).toBeFalsy()
  })

  it('should delete scan', async () => {
    taskStore.task = getPickingTask(2, [
      {
        barcodeType: BarcodeTypeEnum.Gtin,
        scanRule: ScanRuleEnum.ScanOnce,
      },
    ])
    barcodeStore.barcodes.push({
      barcodeType: BarcodeTypeEnum.Gtin,
      barcode: '1234',
    })
    await new Promise(process.nextTick)
    await wrapper.find('.delete-scan-button').trigger('click')
    wrapper.vm.onConfirmClicked()
    await new Promise(process.nextTick)
    expect(wrapper.find('.scan-item').exists()).toBeFalsy()
    expect(
      wrapper
        .find('.footer .create-scan-button')
        .classes()
        .includes('is-disabled')
    ).not.toBeTruthy()
    expect(
      wrapper
        .find('.footer .delete-scan-button')
        .classes()
        .includes('is-disabled')
    ).toBeTruthy()
    expect(wrapper.vm.selectedBarcodes).toEqual([])
  })

  it('should trigger router back', async () => {
    expect(wrapper.find('.footer .back-button').exists()).toBeTruthy()
    await wrapper.find('.footer .back-button').trigger('click')
    expect(mockRouterBack).toHaveBeenCalledOnce()
  })
})
