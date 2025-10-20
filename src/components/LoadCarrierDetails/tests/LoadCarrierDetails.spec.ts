import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import LoadCarrierDetails from '@/components/LoadCarrierDetails/LoadCarrierDetails.vue'
import { getSourceLoadCarrier } from '@/helpers/testDataProvider'

describe('Test LoadCarrierDetails', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'load-carrier-details': {},
      },
    },
  })
  const wrapper = shallowMount(LoadCarrierDetails, {
    global: {
      plugins: [i18n],
    },
    props: {
      selectedCompartment: undefined,
      loadCarrier: getSourceLoadCarrier(),
    },
  })

  it('should render correctly', () => {
    expect(
      wrapper.find('.load-carrier-details-container').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('load-carrier-details-compartments-stub').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('load-carrier-details-compartments-stub').attributes()
    ).toHaveProperty('loadcarrier')
    expect(
      wrapper.find('load-carrier-details-compartments-stub').attributes()
        .loadcarrier
    ).toBeTruthy()
  })
})
