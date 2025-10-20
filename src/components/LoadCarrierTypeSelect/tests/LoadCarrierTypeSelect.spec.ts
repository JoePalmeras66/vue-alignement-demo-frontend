import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadCarrierTypeSelect from '@/components/LoadCarrierTypeSelect/LoadCarrierTypeSelect.vue'
import { getAllLoadCarrierTypes } from '@/helpers/testDataProvider'
import LoadCarrierTypeIcon from '@/components/LoadCarrierTypeIcon/LoadCarrierTypeIcon.vue'

const allLoadCarrierTypes = getAllLoadCarrierTypes()
describe('Test LoadCarrierTypeSelect', () => {
  const wrapper = mount(LoadCarrierTypeSelect, {
    global: {
      plugins: [],
      stubs: {
        LoadCarrierTypeIcon: true,
      },
    },
    props: {
      selectedLcType: '',
      numberOfOccupiedCompartments: 0,
      loadCarrierTypes: allLoadCarrierTypes,
      currentLcType: undefined,
    },
  })
  it('should render correctly', () => {
    expect(wrapper.find('.lc-type-select-container')).toBeTruthy()
    const selectionItems = wrapper.findAll('.tgw-radio')
    expect(selectionItems.length).toBe(3)
    expect(selectionItems[0].classes()).not.toContain('is-disabled')
    expect(selectionItems[1].classes()).not.toContain('is-disabled')
    expect(selectionItems[2].classes()).not.toContain('is-disabled')
    expect(wrapper.findComponent(LoadCarrierTypeIcon)).toBeTruthy()
  })

  it('should render currentLcType correctly', async () => {
    await wrapper.setProps({
      selectedLcType: '',
      numberOfOccupiedCompartments: 0,
      loadCarrierTypes: allLoadCarrierTypes,
      currentLcType: allLoadCarrierTypes[0],
    })
    const selectionItems = wrapper.findAll('.tgw-radio')
    expect(selectionItems.length).toBe(3)
    expect(selectionItems[0].classes()).toContain('is-disabled')
    expect(selectionItems[1].classes()).not.toContain('is-disabled')
    expect(selectionItems[2].classes()).not.toContain('is-disabled')
  })

  it('should render numberOfOccupiedCompartments correctly', async () => {
    await wrapper.setProps({
      selectedLcType: '',
      numberOfOccupiedCompartments: 6,
      loadCarrierTypes: allLoadCarrierTypes,
      currentLcType: allLoadCarrierTypes[0],
    })
    const selectionItems = wrapper.findAll('.tgw-radio')
    expect(selectionItems.length).toBe(3)
    expect(selectionItems[0].classes()).toContain('is-disabled')
    expect(selectionItems[1].classes()).toContain('is-disabled')
    expect(selectionItems[2].classes()).not.toContain('is-disabled')
  })

  it('should check selectedLcType', async () => {
    await wrapper.setProps({
      selectedLcType: '',
      numberOfOccupiedCompartments: 0,
      loadCarrierTypes: allLoadCarrierTypes,
      currentLcType: allLoadCarrierTypes[0],
    })
    await new Promise(process.nextTick)
    let selectionItems = wrapper.findAll('.tgw-radio')
    expect(selectionItems.length).toBe(3)
    expect(selectionItems[0].classes()).not.toContain('is-checked')
    expect(selectionItems[1].classes()).not.toContain('is-checked')
    expect(selectionItems[2].classes()).not.toContain('is-checked')
    await wrapper.setProps({
      selectedLcType: allLoadCarrierTypes[2].id,
      numberOfOccupiedCompartments: 0,
      loadCarrierTypes: allLoadCarrierTypes,
      currentLcType: allLoadCarrierTypes[0],
    })
    await new Promise(process.nextTick)
    selectionItems = wrapper.findAll('.tgw-radio')
    expect(selectionItems[0].classes()).not.toContain('is-checked')
    expect(selectionItems[1].classes()).not.toContain('is-checked')
    expect(selectionItems[2].classes()).toContain('is-checked')
    expect(wrapper.findAll('.tgw-radio')[2].classes()).toContain('is-checked')
  })
})
