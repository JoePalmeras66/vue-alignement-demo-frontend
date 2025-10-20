import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import ScanFooter from '@/components/ScanFooter/ScanFooter.vue'
import { ScanButtonAction } from '@/types/ScanButtonAction'

describe('Test ScanFooter', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'scan-footer': {
          create_scan: 'Create scan',
          delete_scan: 'Delete scan',
        },
      },
    },
  })
  const wrapper = shallowMount(ScanFooter, {
    global: {
      plugins: [i18n],
    },
    props: { disabledButtons: [] },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.scan-footer').exists()).toBeTruthy()
    expect(wrapper.find('.content').exists()).toBeTruthy()
    expect(wrapper.find('.content-left').exists()).toBeTruthy()
    expect(wrapper.find('.content-mid').exists()).toBeTruthy()
    expect(wrapper.find('.content-right').exists()).toBeTruthy()
    expect(wrapper.find('.back-button').exists()).toBeTruthy()
    expect(wrapper.find('.create-scan-button').exists()).toBeTruthy()
    expect(wrapper.find('.delete-scan-button').exists()).toBeTruthy()
    expect(wrapper.find('.create-scan-button').attributes().text).toBe(
      'Create scan'
    )
    expect(wrapper.find('.delete-scan-button').attributes().text).toBe(
      'Delete scan'
    )
    expect(wrapper.find('.create-scan-button').attributes()).toHaveProperty(
      'disabled'
    )
    expect(wrapper.find('.create-scan-button').attributes().disabled).toBe(
      'false'
    )
    expect(wrapper.find('.delete-scan-button').attributes()).toHaveProperty(
      'disabled'
    )
    expect(wrapper.find('.delete-scan-button').attributes().disabled).toBe(
      'false'
    )
    expect(wrapper.find('.back-button').attributes()).toHaveProperty('disabled')
    expect(wrapper.find('.back-button').attributes().disabled).toBe('false')
  })

  it('should emit back button clicked', async () => {
    await wrapper.setProps({ disabledButtons: [] })
    const backButton = wrapper.find('.back-button')
    await backButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('buttonClicked')
    expect(wrapper.emitted().buttonClicked[0]).toContain(
      ScanButtonAction.back.toString()
    )
  })

  it('should emit create button clicked', async () => {
    await wrapper.setProps({ disabledButtons: [] })
    const createButton = wrapper.find('.create-scan-button')
    await createButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('buttonClicked')
    expect(wrapper.emitted().buttonClicked[1]).toContain(
      ScanButtonAction.create_scan.toString()
    )
  })

  it('should emit delete button clicked', async () => {
    await wrapper.setProps({ disabledButtons: [] })
    const deleteButton = wrapper.find('.delete-scan-button')
    await deleteButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('buttonClicked')
    expect(wrapper.emitted().buttonClicked[2]).toContain(
      ScanButtonAction.delete_scan.toString()
    )
  })

  it('should disable all buttons', async () => {
    await wrapper.setProps({
      disabledButtons: [
        ScanButtonAction.create_scan,
        ScanButtonAction.delete_scan,
        ScanButtonAction.back,
      ],
    })
    expect(wrapper.find('.create-scan-button').attributes()).toHaveProperty(
      'disabled'
    )
    expect(wrapper.find('.delete-scan-button').attributes()).toHaveProperty(
      'disabled'
    )
    expect(wrapper.find('.back-button').attributes()).toHaveProperty('disabled')
  })
})
