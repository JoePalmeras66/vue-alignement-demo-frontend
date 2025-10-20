import { describe, expect, it } from 'vitest'

import { shallowMount } from '@vue/test-utils'
import RovoflexToManual from '@/components/RovoflexToManual/RovoflexToManual.vue'
import { RovoflexState } from '@/types/RovoflexState'

describe('Test RovoflexToManual', () => {
  const wrapper = shallowMount(RovoflexToManual, {
    global: {
      plugins: [],
    },
    props: {
      leftToRight: true,
      state: RovoflexState.RovoflexPicking,
    },
  })

  it('should render Picking correctly', () => {
    expect(wrapper.find('.rovoflex-to-manual').exists()).toBeTruthy()
    expect(wrapper.find('.image-rovoflex').exists()).toBeTruthy()
    expect(wrapper.find('.image-rovoflex').attributes().src).toBe(
      'src/assets/images/rovoflex/robot_picking_icon_yellow.png'
    )
  })

  it('should render right to left correctly', async () => {
    await wrapper.setProps({
      leftToRight: false,
      state: RovoflexState.RovoflexPicking,
    })
    expect(
      wrapper.find('.rovoflex-to-manual.right-to-left').exists()
    ).toBeTruthy()
    expect(wrapper.find('.image-rovoflex').exists()).toBeTruthy()
    expect(wrapper.find('.image-rovoflex').attributes().src).toBe(
      'src/assets/images/rovoflex/robot_picking_icon_yellow.png'
    )
  })

  it('should render ManualPickingRequested correctly', async () => {
    await wrapper.setProps({
      leftToRight: false,
      state: RovoflexState.ManualPickingRequested,
    })
    expect(wrapper.find('.rovoflex-to-manual').exists()).toBeTruthy()
    expect(
      wrapper.find('.image-rovoflex.is-manual-picking-requested').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.image-rovoflex.is-manual-picking-requested').attributes()
        .src
    ).toBe('src/assets/images/rovoflex/robot_picking_icon_yellow.png')
    expect(wrapper.find('.arrow-icon').exists()).toBeTruthy()
    expect(wrapper.find('.arrow-icon').attributes().icon).toBe('direction-up')
    expect(wrapper.find('.pulse-container').exists()).toBeTruthy()
    expect(wrapper.find('.pulse-ring.small').exists()).toBeTruthy()
    expect(wrapper.find('.pulse-ring.large').exists()).toBeTruthy()
    expect(wrapper.find('.image-manual-picking').exists()).toBeTruthy()
    expect(wrapper.find('.image-manual-picking').attributes().src).toBe(
      'src/assets/images/rovoflex/manual_picking_icon.png'
    )
  })

  it('should render Error correctly', async () => {
    await wrapper.setProps({ leftToRight: true, state: RovoflexState.Error })
    expect(wrapper.find('.rovoflex-to-manual').exists()).toBeTruthy()
    expect(wrapper.find('.image-rovoflex').exists()).toBeTruthy()
    expect(wrapper.find('.image-rovoflex').attributes().src).toBe(
      'src/assets/images/rovoflex/robot_picking_icon_black.png'
    )
  })
})
