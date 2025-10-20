import { describe, expect, it } from 'vitest'

import { shallowMount } from '@vue/test-utils'
import EnterRobotModeStep from '@/components/EnterRobotModeStep/EnterRobotModeStep.vue'

describe('Test EnterRobotModeStep', () => {
  const wrapper = shallowMount(EnterRobotModeStep, {
    global: {
      plugins: [],
    },
    props: { stepNumber: 69, imagePath: 'myImage', hintText: 'This is a hint' },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.enter-robot-mode-step').exists()).toBeTruthy()
    expect(wrapper.find('.step_number').exists()).toBeTruthy()
    expect(wrapper.find('img').exists()).toBeTruthy()
    expect(wrapper.find('.step_number').text()).toBe('069')
    expect(wrapper.find('.hint-text-container').exists()).toBeTruthy()
    expect(
      wrapper.find('.hint-text-container__tgw-highlighted').exists()
    ).toBeTruthy()
  })
})
