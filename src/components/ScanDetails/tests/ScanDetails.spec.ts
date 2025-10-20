import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ScanDetails from '@/components/ScanDetails/ScanDetails.vue'
import {
  getBarcode,
  getBarcodeData,
  getCycleCountTask,
  getItem1,
  getPickingTask,
} from '@/helpers/testDataProvider'
import {
  BarcodeTypeEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { useScanModificationStore } from '@/stores/useScanModificationStore/useScanModificationStore'
import { unknownItemUrlLight } from '@/constants/unknownItemUrl'

setActivePinia(createPinia())

describe('Test ScanDetails', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'scan-details': {
          unknown_item_type: 'Unknown Item',
          unknown_item_description:
            'The item type could not be detected. Treat it as any other item and put it in the corresponding load carrier sector.',
        },
      },
    },
  })
  const wrapper = shallowMount(ScanDetails, {
    global: {
      plugins: [i18n],
    },
    props: {
      barcodes: [getBarcodeData(BarcodeTypeEnum.Gtin)],
      item: getItem1(),
      task: getPickingTask(2),
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.scan-details').exists()).toBeTruthy()
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(wrapper.find('.quantity').exists()).toBeTruthy()
    expect(wrapper.find('.item-name').exists()).toBeTruthy()
    expect(wrapper.find('.content').exists()).toBeTruthy()
    expect(wrapper.find('.content-left').exists()).toBeTruthy()
    expect(wrapper.find('.content-right').exists()).toBeTruthy()
    expect(wrapper.find('.scan-item').exists()).toBeTruthy()
    expect(wrapper.find('.barcode-type').exists()).toBeTruthy()
    expect(wrapper.find('.barcode-text').exists()).toBeTruthy()
    expect(wrapper.find('item-image-stub').exists()).toBeTruthy()
    expect(wrapper.find('item-image-stub').attributes()).toHaveProperty(
      'itemimageurls'
    )
    expect(wrapper.find('item-image-stub').attributes().itemimageurls).not.toBe(
      ''
    )
    expect(wrapper.find('item-image-stub').attributes()).toHaveProperty(
      'allowopengallery'
    )
    expect(wrapper.find('item-image-stub').attributes().allowopengallery).toBe(
      'false'
    )
    expect(wrapper.find('.quantity').text()).toBe('2x')
    expect(wrapper.find('.item-name').text()).toBe('TGW Pen')
    expect(wrapper.find('.barcode-type').text()).toBe('Gtin')
    expect(wrapper.find('.barcode-text').text()).toBe('0815')
  })

  it('should show quantity one for scan each', async () => {
    await wrapper.setProps({
      barcodes: [getBarcodeData(BarcodeTypeEnum.Gtin)],
      item: getItem1(),
      task: getPickingTask(10, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
    })
    expect(wrapper.find('.quantity').text()).toBe('1x')
  })

  it('should show quantity 10 for scan once', async () => {
    await wrapper.setProps({
      barcodes: [getBarcodeData(BarcodeTypeEnum.Gtin)],
      item: getItem1(),
      task: getPickingTask(10, [getBarcode(BarcodeTypeEnum.Gtin)]),
    })
    expect(wrapper.find('.quantity').text()).toBe('10x')
  })

  it('should render unknown item correctly', async () => {
    const scanModificationStore = useScanModificationStore()
    scanModificationStore.unknownItemTypeCount = 3

    await wrapper.setProps({
      barcodes: [getBarcodeData(BarcodeTypeEnum.Gtin)],
      item: undefined,
      task: getPickingTask(10, [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
    })

    expect(wrapper.find('.header .quantity').text()).toBe('1x')
    expect(wrapper.find('.header .item-name').text()).toBe('Unknown Item 3')
    expect(wrapper.find('.content .content-top span').text()).toBe(
      'The item type could not be detected. Treat it as any other item and put it in the corresponding load carrier sector.'
    )
    expect(
      wrapper.find('.content .content-left .scan-item .barcode-type').text()
    ).toBe('Gtin')
    expect(
      wrapper.find('.content .content-left .scan-item .barcode-text').text()
    ).toBe('0815')
    expect(
      wrapper.find('.content .content-right item-image-stub').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.content .content-right item-image-stub').attributes()
        .itemimageurls
    ).toBe(unknownItemUrlLight)
  })

  it('should not show increased quantity for each scan in cycle count', async () => {
    await wrapper.setProps({
      barcodes: [getBarcodeData(BarcodeTypeEnum.Gtin)],
      item: getItem1(),
      task: getCycleCountTask('S2T', [
        getBarcode(BarcodeTypeEnum.Gtin),
        getBarcode(BarcodeTypeEnum.Gtin),
      ]),
    })
    expect(wrapper.find('.quantity').text()).toBe('1x')
  })
})
