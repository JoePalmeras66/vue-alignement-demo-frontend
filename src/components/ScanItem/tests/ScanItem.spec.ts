import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import ScanItem from '@/components/ScanItem/ScanItem.vue'
import { getBarcodeData } from '@/helpers/testDataProvider'
import { BarcodeTypeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

describe('Test ScanItem', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
  })
  const wrapper = shallowMount(ScanItem, {
    global: {
      plugins: [i18n],
    },
    props: {
      barcodes: [getBarcodeData(BarcodeTypeEnum.Gtin)],
      isSelected: true,
      scanNumber: 1,
      maxScans: 5,
    },
  })

  it('should render correctly', async () => {
    expect(wrapper.find('.scan-item').exists()).toBeTruthy()
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(wrapper.find('.header-icon').exists()).toBeTruthy()
    expect(wrapper.find('.scan-number-container').exists()).toBeTruthy()
    expect(wrapper.find('.scan-number').exists()).toBeTruthy()
    expect(wrapper.find('.scan-number').text()).toBe('1')
    expect(wrapper.find('.max-scans').text()).toBe('/5')
    expect(wrapper.find('.max-scans').exists()).toBeTruthy()
    expect(wrapper.find('.barcodes').exists()).toBeTruthy()
    expect(wrapper.find('.barcode').exists()).toBeTruthy()
    expect(wrapper.find('.barcode-type').exists()).toBeTruthy()
    expect(wrapper.find('.barcode-text').exists()).toBeTruthy()
    expect(wrapper.find('.scan-item').classes()).toContain('is-selected')
    expect(wrapper.find('.barcode-type').text()).toBe('Gtin')
    expect(wrapper.find('.barcode-text').text()).toBe('0815')
  })
})
