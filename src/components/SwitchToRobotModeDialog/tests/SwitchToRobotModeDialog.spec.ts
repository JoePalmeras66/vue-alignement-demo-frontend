import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import SwitchToRobotModeDialog from '@/components/SwitchToRobotModeDialog/SwitchToRobotModeDialog.vue'

describe('Test SwitchToRobotModeDialog', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'switch-to-robot-mode-dialog': {
          switch_to_robot_mode: 'Switch to robot mode',
          description1: 'Do you really want to switch into the robot mode?',
          description2:
            'The switch will take place after finishing the ongoing pick.',
          switch: 'Switch',
          cancel: 'Cancel',
        },
      },
    },
  })
  const wrapper = mount(SwitchToRobotModeDialog, {
    global: {
      plugins: [i18n],
      stubs: { TgwIcon: true },
    },
    props: {
      appendToBody: false,
    },
  })

  it('should render correctly', async () => {
    let submitted: boolean | undefined = false

    setTimeout(async () => {
      submitted = await (
        wrapper.vm as InstanceType<typeof SwitchToRobotModeDialog>
      ).showAndWait()
    }, 1)
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(wrapper.find('.switch-to-robot-mode-dialog').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').exists()).toBeTruthy()
    expect(wrapper.find('tgw-icon-stub').attributes().icon).toBe(
      'status-question-circle'
    )
    expect(wrapper.find('.tgw-message-box__title').exists()).toBeTruthy()
    expect(wrapper.find('.tgw-message-box__title').text()).toBe(
      'Switch to robot mode'
    )
    expect(
      wrapper.find('.switch-to-robot-mode-dialog__description').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.switch-to-robot-mode-dialog__description').text()
    ).toBe('Do you really want to switch into the robot mode?')
    expect(
      wrapper
        .find('.switch-to-robot-mode-dialog__description.highlighted')
        .exists()
    ).toBeTruthy()
    expect(
      wrapper
        .find('.switch-to-robot-mode-dialog__description.highlighted')
        .text()
    ).toBe('The switch will take place after finishing the ongoing pick.')
    expect(wrapper.findAll('.dialog-button').length).toBe(2)
    expect(wrapper.findAll('.dialog-button')[0].text()).toBe('Cancel')
    expect(wrapper.findAll('.dialog-button')[1].text()).toBe('Switch')

    await wrapper.findAll('.dialog-button')[1].trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(submitted).toBeTruthy()
  })
})
