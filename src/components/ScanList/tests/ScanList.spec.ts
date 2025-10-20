import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import ScanList from '@/components/ScanList/ScanList.vue'
import { BarcodeDataType } from '@/types/Api/pcots/PcotsApiModel'
import {
  getBarcode,
  getBarcodeData,
  getPickingTask,
} from '@/helpers/testDataProvider'
import {
  BarcodeTypeEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'

describe('Test ScanList', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
  })
  const barcodes = ref<BarcodeDataType[]>([
    getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
    getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
    getBarcodeData(BarcodeTypeEnum.Gtin, '0817'),
  ])
  const wrapper = mount(ScanList, {
    global: {
      plugins: [i18n],
      stubs: { ScanItem: true },
    },
    props: {
      barcodes: barcodes.value,
      task: getPickingTask(5, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
    },
  })

  it('should render correctly', async () => {
    expect(wrapper.find('.scan-list').exists()).toBeTruthy()
    expect(wrapper.find('.scan-items-container').exists()).toBeTruthy()
    expect(wrapper.find('.scan-items').exists()).toBeTruthy()
    expect(wrapper.find('.scan-item').exists()).toBeTruthy()
    expect(wrapper.findAll('.scan-item').length).toBe(3)
  })

  it('should display correct scan numbers', async () => {
    const lastScanItem = wrapper.findAll('.scan-item')[0]
    expect(lastScanItem.attributes()).toHaveProperty('scannumber')
    expect(lastScanItem.attributes()).toHaveProperty('maxscans')
    expect(lastScanItem.attributes().scannumber).toBe('3')
    expect(lastScanItem.attributes().maxscans).toBe('5')
  })

  it('should select item on click', async () => {
    const secondScanItem = wrapper.findAll('.scan-item')[1]
    await secondScanItem.trigger('click')
    await new Promise(process.nextTick)
    expect(secondScanItem.attributes()).toHaveProperty('isselected')
    expect(secondScanItem.attributes().isselected).toBe('true')
    expect(wrapper.emitted()).toHaveProperty('barcodesSelected')
    expect(wrapper.emitted().barcodesSelected.length).toBe(2)
    const selectedBarcodes: BarcodeDataType[] = (
      wrapper.emitted().barcodesSelected[1] as any[]
    )[0] as BarcodeDataType[]
    expect(selectedBarcodes.length).toBe(1)
    expect(selectedBarcodes[0].barcode).toBe('0816')
    expect(selectedBarcodes[0].barcodeType).toBe(BarcodeTypeEnum.Gtin)
  })

  it('should select first item after removing an item', async () => {
    const firstScanItem = wrapper.findAll('.scan-item')[2]
    await firstScanItem.trigger('click')
    await new Promise(process.nextTick)
    expect(firstScanItem.attributes()).toHaveProperty('isselected')
    expect(firstScanItem.attributes().isselected).toBe('true')
    expect(wrapper.emitted().barcodesSelected.length).toBe(3)
    // Remove 0815
    barcodes.value.splice(0, 1)
    await new Promise(process.nextTick)
    expect(wrapper.emitted().barcodesSelected.length).toBe(4)
    const selectedBarcodes = (
      wrapper.emitted().barcodesSelected[3] as any[]
    )[0] as BarcodeDataType[]
    expect(selectedBarcodes.length).toBe(1)
    expect(selectedBarcodes[0].barcode).toBe('0817')
    expect(selectedBarcodes[0].barcodeType).toBe(BarcodeTypeEnum.Gtin)
  })
})
