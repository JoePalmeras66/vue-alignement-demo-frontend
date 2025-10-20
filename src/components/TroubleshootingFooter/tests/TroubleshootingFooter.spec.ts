import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import TroubleshootingFooter from '@/components/TroubleshootingFooter/TroubleshootingFooter.vue'
import { TroubleshootingButtonAction } from '@/types/TroubleshootingButtonAction'

describe('Test TroubleshootingFooter', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        troubleshooting: {
          footer: {
            n_problems: '{n} Problem selected | {n} Problems selected',
            save: 'Save',
          },
        },
      },
    },
  })
  const wrapper = shallowMount(TroubleshootingFooter, {
    global: {
      plugins: [i18n],
    },
    props: { disabledButtons: [], overallSelectedProblems: 0 },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.content-right').exists()).toBeTruthy()
    expect(wrapper.find('.troubleshooting-footer').exists()).toBeTruthy()
    expect(wrapper.find('.back-button').exists()).toBeTruthy()
    expect(wrapper.find('.save-button').exists()).toBeTruthy()
  })

  it('should render correctly with selected Problems', async () => {
    await wrapper.setProps({ disabledButtons: [], overallSelectedProblems: 1 })
    expect(wrapper.find('.troubleshooting-footer').exists()).toBeTruthy()
    expect(wrapper.find('.back-button').exists()).toBeTruthy()
    expect(wrapper.find('.save-button').exists()).toBeTruthy()
    expect(wrapper.find('.selected-problems').exists()).toBeTruthy()
    expect(
      wrapper.find('.selected-problems tgw-icon-stub').exists()
    ).toBeTruthy()
    expect(wrapper.find('.selected-problems span').text()).toBe(
      '1 Problem selected'
    )
    await wrapper.setProps({ disabledButtons: [], overallSelectedProblems: 2 })
    expect(wrapper.find('.selected-problems').exists()).toBeTruthy()
    expect(
      wrapper.find('.selected-problems tgw-icon-stub').exists()
    ).toBeTruthy()
    expect(wrapper.find('.selected-problems span').text()).toBe(
      '2 Problems selected'
    )
  })

  it('should emit on back button click', async () => {
    const backButton = wrapper.find('.back-button')
    await backButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[0]).toContain(
      TroubleshootingButtonAction.back.toString()
    )
  })

  it('should emit on send to reject button click', async () => {
    const backButton = wrapper.find('.save-button')
    await backButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('actionButtonClicked')
    expect(wrapper.emitted().actionButtonClicked[1]).toContain(
      TroubleshootingButtonAction.save.toString()
    )
  })

  it('should disable save button', async () => {
    await wrapper.setProps({
      disabledButtons: [TroubleshootingButtonAction.save],
      overallSelectedProblems: 0,
    })
    await new Promise(process.nextTick)
    const rejectButton = wrapper.find('.save-button')
    expect(rejectButton.attributes()).toHaveProperty('disabled')
    expect(rejectButton.attributes().disabled).toBe('true')
  })

  it('should disable back button', async () => {
    await wrapper.setProps({
      disabledButtons: [TroubleshootingButtonAction.back],
      overallSelectedProblems: 0,
    })
    await new Promise(process.nextTick)
    const backButton = wrapper.find('.back-button')
    expect(backButton.attributes()).toHaveProperty('disabled')
    expect(backButton.attributes().disabled).toBe('true')
  })
})
