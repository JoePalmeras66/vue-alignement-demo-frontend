import { describe, expect, it } from 'vitest'

import { VueWrapper, shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import AdvancedCycleCountTabCounted from '@/components/AdvancedCycleCountTabCounted/AdvancedCycleCountTabCounted.vue'
import {
  getCompartmentCycleCounting,
  getCycleCountTask,
  getEmptyCompartment,
  getSourceLoadCarrier,
} from '@/helpers/testDataProvider'
import { CycleCountState } from '@/types/CycleCountState'

describe('Test AdvancedCycleCountTabCounted', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'advanced-cycle-count-tab-counted': {},
      },
    },
  })
  const wrapper: VueWrapper<any> = shallowMount(AdvancedCycleCountTabCounted, {
    global: {
      plugins: [i18n],
    },
    props: {
      task: getCycleCountTask('S2T', []),
      loadCarrier: getSourceLoadCarrier(),
      selectedCompartment: getCompartmentCycleCounting(
        CycleCountState.inProgress,
        1
      ),
    },
  })

  it('should render correctly', () => {
    expect(
      wrapper.find('.advanced-cycle-count-tab-counted').exists()
    ).toBeTruthy()
    expect(wrapper.find('.content').exists()).toBeTruthy()
    expect(wrapper.find('item-image-stub').exists()).toBeTruthy()
    expect(wrapper.find('item-image-stub').attributes()).toHaveProperty(
      'itemimageurls'
    )
    expect(wrapper.find('item-image-stub').attributes().itemimageurls).toBe(
      '../../../src/assets/images/item-images/TGW_PEN.png,../../../src/assets/images/item-images/TGW_NOTES.png,../../../src/assets/images/item-images/TGW_MINT.png'
    )
    expect(wrapper.find('cycle-count-input-stub').exists()).toBeTruthy()
  })

  it('should emit quantity changed', async () => {
    wrapper.vm.countedQuantity = 200
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('quantityChanged')
    expect(wrapper.emitted().quantityChanged[1]).toContain(200)
  })

  it('should render not counted', async () => {
    await wrapper.setProps({ selectedCompartment: getEmptyCompartment() })
    expect(wrapper.find('.content').exists()).toBeFalsy()
    expect(wrapper.find('not-counted-stub').exists()).toBeTruthy()
  })
})
