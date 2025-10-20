import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import AdvancedCycleCountFooter from '@/components/AdvancedCycleCountFooter/AdvancedCycleCountFooter.vue'
import { AdvancedCycleCountButtonAction } from '@/types/AdvancedCycleCountButtonAction'

describe('Test AdvancedCycleCountFooter', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'advanced-cycle-count-footer': {
          delete_count: 'Delete count',
          delete_scan: 'Delete scan',
        },
      },
    },
  })

  const wrapper = shallowMount(AdvancedCycleCountFooter, {
    global: {
      plugins: [i18n],
    },
    props: {
      disabledButtons: [],
      hiddenButtons: [],
    },
  })

  it('should render counted correctly', () => {
    expect(wrapper.find('.advanced-cycle-count-footer').exists()).toBeTruthy()
    expect(wrapper.find('.back-button').exists()).toBeTruthy()
    expect(wrapper.find('.delete-scan-button').exists()).toBeTruthy()
    expect(wrapper.find('.delete-count-button').exists()).toBeTruthy()
    expect(wrapper.find('.delete-count-button').attributes().text).toBe(
      'Delete count'
    )
  })

  it('should render scanned correctly', async () => {
    expect(wrapper.find('.back-button').exists()).toBeTruthy()
    expect(wrapper.find('.delete-scan-button').exists()).toBeTruthy()
    expect(wrapper.find('.delete-scan-button').attributes().text).toBe(
      'Delete scan'
    )
    expect(wrapper.find('.delete-count-button').exists()).toBeTruthy()
  })

  it('should emit button events', async () => {
    await wrapper.find('.back-button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('buttonClicked')
    expect(wrapper.emitted().buttonClicked[0]).toContain(
      AdvancedCycleCountButtonAction.back
    )
    await wrapper.find('.delete-scan-button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('buttonClicked')
    expect(wrapper.emitted().buttonClicked[1]).toContain(
      AdvancedCycleCountButtonAction.delete_scan
    )
    await wrapper.find('.delete-count-button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('buttonClicked')
    expect(wrapper.emitted().buttonClicked[2]).toContain(
      AdvancedCycleCountButtonAction.delete_count
    )
  })

  it('should disable delete count button', async () => {
    await wrapper.setProps({
      disabledButtons: [AdvancedCycleCountButtonAction.delete_count],
      hiddenButtons: [],
    })
    expect(
      wrapper.find('.delete-count-button').attributes().disabled
    ).toBeTruthy()
    await wrapper.find('.delete-count-button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('buttonClicked')
    expect(wrapper.emitted().buttonClicked.length).toBe(3)
  })

  it('should disable delete scan button', async () => {
    await wrapper.setProps({
      disabledButtons: [AdvancedCycleCountButtonAction.delete_scan],
      hiddenButtons: [],
    })
    expect(
      wrapper.find('.delete-scan-button').attributes().disabled
    ).toBeTruthy()
    await wrapper.find('.delete-scan-button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('buttonClicked')
    expect(wrapper.emitted().buttonClicked.length).toBe(3)
  })

  it('should hide delete scan button', async () => {
    await wrapper.setProps({
      hiddenButtons: [AdvancedCycleCountButtonAction.delete_scan],
      disabledButtons: [],
    })
    expect(wrapper.find('.delete-scan-button').classes()).toContain('hidden')
  })

  it('should hide delete count button', async () => {
    await wrapper.setProps({
      hiddenButtons: [AdvancedCycleCountButtonAction.delete_count],
      disabledButtons: [],
    })
    expect(wrapper.find('.delete-count-button').classes()).toContain('hidden')
  })
})
