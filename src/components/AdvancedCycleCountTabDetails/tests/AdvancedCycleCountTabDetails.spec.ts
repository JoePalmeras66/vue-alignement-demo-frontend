import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import {
  getCompartment,
  getCycleCountTask,
  getSourceLoadCarrier,
} from '@/helpers/testDataProvider'
import AdvancedCycleCountTabDetails from '@/components/AdvancedCycleCountTabDetails/AdvancedCycleCountTabDetails.vue'
import { CycleCountState } from '@/types/CycleCountState'

describe('Test AdvancedCycleCountTabDetails', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'advanced-cycle-count-tab-details': {},
      },
    },
  })
  const wrapper = shallowMount(AdvancedCycleCountTabDetails, {
    global: {
      plugins: [i18n],
    },
    props: {
      task: getCycleCountTask('S2T', []),
      loadCarrier: getSourceLoadCarrier(),
      selectedCompartment: getCompartment(),
    },
  })

  it('should render correctly', async () => {
    expect(
      wrapper.find('.advanced-cycle-count-tab-details').exists()
    ).toBeTruthy()
    expect(wrapper.find('load-carrier-item-details-stub').exists()).toBeFalsy()

    const countedCompartment = getCompartment()
    countedCompartment.cycleCountState = CycleCountState.finished
    await wrapper.setProps({
      task: getCycleCountTask('S2T', []),
      loadCarrier: getSourceLoadCarrier(),
      selectedCompartment: countedCompartment,
    })
    expect(wrapper.find('load-carrier-item-details-stub').exists()).toBeTruthy()
    expect(
      wrapper.find('load-carrier-item-details-stub').attributes().loadcarrier
    ).toBeTruthy()
    expect(
      wrapper.find('load-carrier-item-details-stub').attributes()
        .selectedcompartment
    ).toBe('[object Object]')
  })
})
