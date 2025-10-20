import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import WorkstationSelection from '@/components/WorkstationSelection/WorkstationSelection.vue'
import { SupportedStationType } from '@/types/Api/wm/WmApiModel'

const availableStationsMock: SupportedStationType[] = [
  {
    id: '101',
    name: 'My Station 1',
    path: '',
  },
  {
    id: '102',
    name: 'My Station 2',
    path: '',
  },
]

describe('Test WorkstationSelection', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        'station-selection': {
          select_station: 'Select your Workstation',
          filter_stations: 'Filter stations',
          continue: 'Continue',
          back_to_login: 'Back to Login',
        },
      },
    },
  })
  const wrapper = mount(WorkstationSelection, {
    global: {
      plugins: [i18n],
    },
    props: { availableStations: availableStationsMock },
  })

  it('should render correctly', () => {
    expect(wrapper.find('.station-selection').exists()).toBeTruthy()
    expect(wrapper.find('.station-selection__header').exists()).toBeTruthy()
    expect(
      wrapper.find('.station-selection__header-title').exists()
    ).toBeTruthy()
    expect(wrapper.find('.station-selection__body').exists()).toBeTruthy()
    expect(wrapper.find('.station-selection__body-input').exists()).toBeTruthy()
    expect(wrapper.find('.station-selection__body-cards').exists()).toBeTruthy()
    expect(
      wrapper.findAll('.radio-selection-group__item').length > 0
    ).toBeTruthy()
    expect(wrapper.find('.station-selection__footer').exists()).toBeTruthy()
    expect(wrapper.find('.back-to-login-button').exists()).toBeTruthy()
    expect(wrapper.find('.continue-button').exists()).toBeTruthy()
  })

  it('should filter list', async () => {
    let stations = wrapper.findAll('.radio-selection-group__item')
    expect(stations.length === 2).toBeTruthy()

    const filterInput = wrapper.find('.station-selection__body-input input')
    await filterInput.setValue('my station')
    await new Promise(process.nextTick)
    stations = wrapper.findAll('.radio-selection-group__item')
    expect(stations.length === 2).toBeTruthy()

    await filterInput.setValue('1')
    await new Promise(process.nextTick)
    stations = wrapper.findAll('.radio-selection-group__item')
    expect(stations.length === 1).toBeTruthy()

    await filterInput.setValue('not available')
    await new Promise(process.nextTick)
    stations = wrapper.findAll('.radio-selection-group__item')
    expect(stations.length === 0).toBeTruthy()

    await filterInput.setValue('')
    await new Promise(process.nextTick)
    stations = wrapper.findAll('.radio-selection-group__item')
    expect(stations.length === 2).toBeTruthy()
  })

  it('should enable continue button on station selection', async () => {
    expect(wrapper.find('.continue-button').classes()).toContain('is-disabled')
    const stations = wrapper.findAll('.radio-selection-group__item')
    expect(stations.length === 2).toBeTruthy()
    await stations[0].trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.find('.continue-button').classes()).not.toContain(
      'is-disabled'
    )
  })

  it('should emit on back to login button press', async () => {
    const backToLoginButton = wrapper.find('.back-to-login-button')
    await backToLoginButton.trigger('click')
    await new Promise(process.nextTick)
    expect(wrapper.emitted()).toHaveProperty('backToLogin')
  })

  it('should emit on continue button press', async () => {
    const continueButton = wrapper.find('.continue-button')
    await continueButton.trigger('click')
    await new Promise(process.nextTick)
    const event = wrapper.emitted('stationSelected')
    expect(event).toHaveLength(1)
    expect(event![0]).toEqual(['101'])
  })
})
