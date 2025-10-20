import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import {
  getBarcode,
  getBarcodeData,
  getCompartmentCycleCounting,
  getCycleCountTask,
} from '@/helpers/testDataProvider'
import { CycleCountState } from '@/types/CycleCountState'
import {
  BarcodeTypeEnum,
  ScanRuleEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { BarcodeDataType } from '@/types/Api/pcots/PcotsApiModel'
import AdvancedCycleCountTabScans from '@/components/AdvancedCycleCountTabScans/AdvancedCycleCountTabScans.vue'

describe('Test AdvancedCycleCountTabScans', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'advanced-cycle-count-tab-scans': {},
      },
    },
  })
  const barcodes = ref<BarcodeDataType[]>([
    getBarcodeData(BarcodeTypeEnum.Gtin, '0815'),
    getBarcodeData(BarcodeTypeEnum.Gtin, '0816'),
    getBarcodeData(BarcodeTypeEnum.Gtin, '0817'),
  ])
  const wrapper = mount(AdvancedCycleCountTabScans, {
    global: {
      plugins: [i18n],
    },
    props: {
      selectedCompartment: getCompartmentCycleCounting(
        CycleCountState.inProgress,
        10
      ),
      barcodes: barcodes.value,
      task: getCycleCountTask('S2S', [
        getBarcode(BarcodeTypeEnum.Gtin, ScanRuleEnum.ScanEach),
      ]),
    },
  })

  it('should render correctly', () => {
    expect(
      wrapper.find('.advanced-cycle-count-tab-scans').exists()
    ).toBeTruthy()
    expect(wrapper.find('.scan-list').exists()).toBeTruthy()
  })

  it('should emit barcodes selected', () => {
    const expectedBarcodeData: BarcodeDataType[] = [
      { barcodeType: BarcodeTypeEnum.Gtin, barcode: '0817' },
    ]
    wrapper.findAll('.scan-item')[2].trigger('click')
    expect(wrapper.emitted()).toHaveProperty('barcodesSelected')
    expect(wrapper.emitted().barcodesSelected[1]).toStrictEqual([
      expectedBarcodeData,
    ])
  })
})
