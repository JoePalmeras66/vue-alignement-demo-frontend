import { describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ProblemClassificationButton from '@/components/ProblemClassificationButton/ProblemClassificationButton.vue'

describe('Test ProblemClassificationButton', () => {
  const wrapper = shallowMount(ProblemClassificationButton, {
    global: {
      plugins: [],
    },
    props: {
      buttonText: 'MyTestButton',
      modelValue: false,
      buttonIcon: 'load-carrier-damaged',
      buttonWidth: 'auto',
    },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.problem-classification-button').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').exists()).toBeTruthy()
    expect(wrapper.find('.problem-classification-text').exists()).toBeTruthy()
    expect(
      wrapper.find('.problem-classification-button').attributes().style
    ).toBe('width: inherit;')
  })

  it('should be active and emit on click', async () => {
    expect(
      wrapper.find('.problem-classification-button.active').exists()
    ).toBeFalsy()
    const button = wrapper.find('.problem-classification-button')
    await button.trigger('click')
    await new Promise(process.nextTick)
    expect(
      wrapper.find('.problem-classification-button.active').exists()
    ).toBeTruthy()
    expect(wrapper.vm.buttonChecked).toBeTruthy()
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([true])
  })

  it('should be inactive and emit on click', async () => {
    expect(
      wrapper.find('.problem-classification-button.active').exists()
    ).toBeTruthy()
    const button = wrapper.find('.problem-classification-button')
    await button.trigger('click')
    await new Promise(process.nextTick)
    expect(
      wrapper.find('.problem-classification-button.active').exists()
    ).toBeFalsy()
    expect(wrapper.vm.buttonChecked).toBeFalsy()
    expect(wrapper.emitted()['update:modelValue'][1]).toEqual([false])
  })
})
