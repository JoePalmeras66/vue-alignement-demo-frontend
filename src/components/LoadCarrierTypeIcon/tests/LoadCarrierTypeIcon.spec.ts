// disable typescript check here because shallow objects are used in tests
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import LoadCarrierTypeIcon from '@/components/LoadCarrierTypeIcon/LoadCarrierTypeIcon.vue'
import { getLoadCarrierTypeWithCompartments } from '@/helpers/testDataProvider'

describe('Test LoadCarrierTypeIcon', () => {
  const loadCarrierType = getLoadCarrierTypeWithCompartments(1)
  const wrapper = shallowMount(LoadCarrierTypeIcon, {
    global: {
      plugins: [],
    },
    props: {
      data: loadCarrierType,
    },
  })
  it('should render one compartment correctly', () => {
    expect(wrapper.find('.load-carrier-icon-wrapper')).toBeTruthy()
    expect(wrapper.find('.load-carrier-icon-inner')).toBeTruthy()
    const compartments = wrapper.findAll('.load-carrier-icon-compartment')
    expect(compartments.length).toBe(1)
    expect(compartments[0].attributes().style).toBe(
      'grid-column: 1 / 2; grid-row: -1 / -2;'
    )
  })

  it('should render multiple compartments correctly', async () => {
    await wrapper.setProps({
      data: getLoadCarrierTypeWithCompartments(6),
    })
    expect(wrapper.find('.load-carrier-icon-wrapper')).toBeTruthy()
    expect(wrapper.find('.load-carrier-icon-inner')).toBeTruthy()
    const compartments = wrapper.findAll('.load-carrier-icon-compartment')
    expect(compartments.length).toBe(6)
    expect(compartments[0].attributes().style).toBe(
      'grid-column: 1 / 2; grid-row: -2 / -3;'
    )
    expect(compartments[1].attributes().style).toBe(
      'grid-column: 1 / 2; grid-row: -1 / -2;'
    )
    expect(compartments[2].attributes().style).toBe(
      'grid-column: 2 / 3; grid-row: -2 / -3;'
    )
    expect(compartments[3].attributes().style).toBe(
      'grid-column: 2 / 3; grid-row: -1 / -2;'
    )
    expect(compartments[4].attributes().style).toBe(
      'grid-column: 3 / 4; grid-row: -2 / -3;'
    )
    expect(compartments[5].attributes().style).toBe(
      'grid-column: 3 / 4; grid-row: -1 / -2;'
    )
  })
})
