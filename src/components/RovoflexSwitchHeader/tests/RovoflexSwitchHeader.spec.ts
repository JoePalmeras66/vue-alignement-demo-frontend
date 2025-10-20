import { describe, expect, it } from 'vitest'

import { createI18n } from 'vue-i18n'
import { VueWrapper, mount } from '@vue/test-utils'
import RovoflexSwitchHeader from '@/components/RovoflexSwitchHeader/RovoflexSwitchHeader.vue'
import { RovoflexState } from '@/types/RovoflexState'

describe('Test RovoflexSwitchHeader', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'rovoflex-switch-header': {
          rovoflex_picking:
            'Switching to [highlighted]Robot picking[/highlighted]',
          manual_picking:
            'Switching to [highlighted]Manual picking[/highlighted]',
          reset_robot_position:
            'Reset robot position [highlighted][/highlighted]',
        },
      },
    },
  })
  let wrapper: VueWrapper<InstanceType<typeof RovoflexSwitchHeader>>

  const mountView = (props: any) => {
    if (wrapper) {
      wrapper.unmount()
    }

    wrapper = mount(RovoflexSwitchHeader, {
      global: {
        plugins: [i18n],
        stubs: {
          TgwIcon: true,
        },
      },
      props,
    })
  }

  it('should render Picking correctly', async () => {
    mountView({
      switchToState: RovoflexState.RovoflexPicking,
      switchFromError: false,
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.rovoflex-switch-header').exists()).toBeTruthy()
    expect(
      wrapper.find('.rovoflex-switch-header__tgw-highlighted').exists()
    ).toBeTruthy()
    expect(wrapper.find('.highlighted').text()).toBe('Robot picking')
    expect(wrapper.find('.image-container').exists()).toBeTruthy()
    expect(wrapper.find('.first-image').exists()).toBeTruthy()
    expect(wrapper.find('.first-image').attributes().src).toBe(
      'src/assets/images/rovoflex/manual_picking_light.png'
    )
    expect(wrapper.find('tgw-icon-stub').exists()).toBeTruthy()
    expect(wrapper.find('.second-image').exists()).toBeTruthy()
    expect(wrapper.find('.second-image').attributes().src).toBe(
      'src/assets/images/rovoflex/robot_picking_light.png'
    )
  })

  it('should render ManualPickingRequested correctly', async () => {
    mountView({
      switchToState: RovoflexState.ManualPickingRequested,
      switchFromError: false,
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.rovoflex-switch-header').exists()).toBeTruthy()
    expect(
      wrapper.find('.rovoflex-switch-header__tgw-highlighted').exists()
    ).toBeTruthy()
    expect(wrapper.find('.highlighted').text()).toBe('Manual picking')
    expect(wrapper.find('.image-container').exists()).toBeTruthy()
    expect(wrapper.find('.first-image').exists()).toBeTruthy()
    expect(wrapper.find('.first-image').attributes().src).toBe(
      'src/assets/images/rovoflex/robot_picking_light.png'
    )
    expect(wrapper.find('tgw-icon-stub').exists()).toBeTruthy()
    expect(wrapper.find('.second-image').exists()).toBeTruthy()
    expect(wrapper.find('.second-image').attributes().src).toBe(
      'src/assets/images/rovoflex/manual_picking_light.png'
    )
  })

  it('should render switchFromError Picking correctly', async () => {
    mountView({
      headerText: 'Reset robot position',
      switchToState: RovoflexState.RovoflexPicking,
      switchFromError: true,
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.rovoflex-switch-header').exists()).toBeTruthy()
    expect(
      wrapper.find('.rovoflex-switch-header__tgw-highlighted').exists()
    ).toBeTruthy()
    expect(
      wrapper.find('.rovoflex-switch-header__tgw-highlighted').text()
    ).contains('Reset robot position')
    expect(wrapper.find('.image-container').exists()).toBeTruthy()
    expect(wrapper.find('.header__icon').exists()).toBeTruthy()
    expect(wrapper.find('.header__icon').attributes().icon).toBe(
      'status-error-circle'
    )
    expect(wrapper.find('tgw-icon-stub').exists()).toBeTruthy()
    expect(wrapper.find('.second-image').exists()).toBeTruthy()
    expect(wrapper.find('.second-image').attributes().src).toBe(
      'src/assets/images/rovoflex/robot_picking_icon_light.png'
    )
  })
})
