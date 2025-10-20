import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CompartmentIndicator from '@/components/CompartmentIndicator/CompartmentIndicator.vue'

describe('Test CompartmentIndicator', () => {
  const wrapper = mount(CompartmentIndicator, {
    global: {
      plugins: [],
    },
    props: {
      small: true,
      scannedAmount: undefined,
    },
  })
  it('should render correctly without scannedAmount', () => {
    expect(wrapper.find('.compartment-scanned-indicator.small')).toBeTruthy()
    expect(wrapper.find('.scanned-amount').exists()).toBeFalsy()
    expect(wrapper.find('.tgw-icon')).toBeTruthy()
  })

  it('should render 0 correctly', async () => {
    await wrapper.setProps({
      scannedAmount: 0,
    })
    expect(wrapper.find('.compartment-scanned-indicator.small')).toBeTruthy()
    expect(
      wrapper
        .find('.compartment-scanned-indicator')
        .classes()
        .includes('multi-item')
    ).toBeTruthy()
    expect(wrapper.find('.scanned-amount').exists()).toBeTruthy()
    expect(wrapper.find('.scanned-amount').text()).toBe('0')
    expect(wrapper.find('.tgw-icon')).toBeTruthy()
  })

  it('should render scannedAmount correctly', async () => {
    await wrapper.setProps({
      scannedAmount: 2,
    })
    expect(wrapper.find('.compartment-scanned-indicator.small')).toBeTruthy()
    expect(
      wrapper
        .find('.compartment-scanned-indicator')
        .classes()
        .includes('multi-item')
    ).toBeTruthy()
    expect(wrapper.find('.scanned-amount').exists()).toBeTruthy()
    expect(wrapper.find('.scanned-amount').text()).toBe('2')
    expect(wrapper.find('.tgw-icon')).toBeTruthy()
  })

  it('should render default size correctly', async () => {
    await wrapper.setProps({
      small: false,
      scannedAmount: undefined,
    })
    expect(wrapper.find('.compartment-scanned-indicator').exists()).toBeTruthy()
    expect(
      wrapper.find('.compartment-scanned-indicator.small').exists()
    ).toBeFalsy()
    expect(
      wrapper
        .find('.compartment-scanned-indicator')
        .classes()
        .includes('multi-item')
    ).toBeFalsy()
    expect(wrapper.find('.scanned-amount').exists()).toBeFalsy()
    expect(wrapper.find('.tgw-icon')).toBeTruthy()
  })
})
