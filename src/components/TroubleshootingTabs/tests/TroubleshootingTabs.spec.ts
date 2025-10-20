import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { VueWrapper } from '@vue/test-utils/dist/vueWrapper'
import TroubleshootingTabs from '@/components/TroubleshootingTabs/TroubleshootingTabs.vue'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { WorkStationDirectionEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

setActivePinia(createPinia())
describe('Test TroubleshootingTabs', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        troubleshooting: {
          tabs: {
            n_problems_selected:
              'No problem selected | 1 problem selected | {n} problems selected',
            selected: 'selected',
            source: 'Source',
            task: 'Others',
            target: 'Target',
            problem_name: {
              0: 'Dirty container',
              1: 'Damaged container',
              2: 'Dirty item',
              3: 'Damaged item',
              4: 'Wrong item',
              5: 'Item missing',
              6: 'Wrong dimension data',
              7: 'Item barcode not readable',
            },
          },
        },
      },
    },
  })

  let wrapper: VueWrapper
  const mountView = (props: any) => {
    if (wrapper) {
      wrapper.unmount()
    }

    wrapper = mount(TroubleshootingTabs, {
      global: {
        plugins: [i18n],
      },
      props,
    })
  }

  const workspaceStore = useWorkspaceStore()
  workspaceStore.workstationDirection = WorkStationDirectionEnum.LeftToRight

  it('should render correctly (enabled source and target tabs)', async () => {
    mountView({
      sourceLcId: '123456',
      targetLcId: '654321',
      selectedSourceLcProblems: 0,
      selectedTargetLcProblems: 0,
      selectedTaskProblems: 0,
      isLoading: false,
    })
    await new Promise(process.nextTick)
    expect(wrapper.find('.troubleshooting-tabs').exists()).toBeTruthy()
    expect(wrapper.find('.tabs-label').exists()).toBeTruthy()
    expect(wrapper.find('.tabs-label-header').exists()).toBeTruthy()
    expect(wrapper.find('.tabs-label-info').exists()).toBeTruthy()
    expect(
      wrapper.find('.troubleshooting-tabs-scrollbar').exists()
    ).toBeTruthy()
    const allTabs = wrapper
      .find(
        '.troubleshooting-tabs .tgw-tabs__header .tgw-tabs__nav-wrap .tgw-tabs__nav'
      )
      .findAll('.tgw-tabs__item')
    expect(allTabs.length).toBe(3)
    expect(allTabs[0].classes()).toContain('is-active')
    expect(allTabs[0].classes()).not.toContain('is-disabled')
    expect(allTabs[2].classes()).not.toContain('is-disabled')
  })

  it('should render the selected amount of problems', async () => {
    mountView({
      sourceLcId: '123456',
      targetLcId: '654321',
      selectedSourceLcProblems: 0,
      selectedTargetLcProblems: 0,
      selectedTaskProblems: 0,
      isLoading: false,
    })
    await new Promise(process.nextTick)
    let allTabs = wrapper
      .find(
        '.troubleshooting-tabs .tgw-tabs__header .tgw-tabs__nav-wrap .tgw-tabs__nav'
      )
      .findAll('.tgw-tabs__item .tabs-label-info')
    expect(allTabs[0].text()).toBe('No problem selected')
    expect(allTabs[1].text()).toBe('No problem selected')
    expect(allTabs[2].text()).toBe('No problem selected')

    // check single problem selected
    await wrapper.setProps({
      selectedSourceLcProblems: 1,
      selectedTaskProblems: 1,
      selectedTargetLcProblems: 1,
    })
    await new Promise(process.nextTick)
    allTabs = wrapper
      .find(
        '.troubleshooting-tabs .tgw-tabs__header .tgw-tabs__nav-wrap .tgw-tabs__nav'
      )
      .findAll('.tgw-tabs__item .tabs-label-info')
    expect(allTabs[0].text()).toBe('1 problem selected')
    expect(allTabs[1].text()).toBe('1 problem selected')
    expect(allTabs[2].text()).toBe('1 problem selected')

    // check multiple problems selected
    await wrapper.setProps({
      selectedSourceLcProblems: 2,
      selectedTaskProblems: 3,
      selectedTargetLcProblems: 4,
    })
    await new Promise(process.nextTick)
    allTabs = wrapper
      .find(
        '.troubleshooting-tabs .tgw-tabs__header .tgw-tabs__nav-wrap .tgw-tabs__nav'
      )
      .findAll('.tgw-tabs__item .tabs-label-info')
    expect(allTabs[0].text()).toBe('2 problems selected')
    expect(allTabs[1].text()).toBe('3 problems selected')
    expect(allTabs[2].text()).toBe('4 problems selected')
  })

  it('should render correctly (disabled source and target tabs)', async () => {
    mountView({
      sourceLcId: null,
      targetLcId: null,
      selectedSourceLcProblems: 0,
      selectedTargetLcProblems: 0,
      selectedTaskProblems: 0,
    })
    await new Promise(process.nextTick)
    const allTabs = wrapper
      .find(
        '.troubleshooting-tabs .tgw-tabs__header .tgw-tabs__nav-wrap .tgw-tabs__nav'
      )
      .findAll('.tgw-tabs__item')
    expect(allTabs.length).toBe(3)
    expect(allTabs[0].classes()).toContain('is-disabled')
    expect(allTabs[2].classes()).toContain('is-disabled')
    expect(allTabs[1].classes()).toContain('is-active')
  })

  it('should enable source-tab when sourceLc arrives', async () => {
    mountView({
      sourceLcId: null,
      targetLcId: null,
      selectedSourceLcProblems: 0,
      selectedTargetLcProblems: 0,
      selectedTaskProblems: 0,
    })
    await new Promise(process.nextTick)
    await wrapper.setProps({ sourceLcId: '111111' })
    const allTabs = wrapper
      .find(
        '.troubleshooting-tabs .tgw-tabs__header .tgw-tabs__nav-wrap .tgw-tabs__nav'
      )
      .findAll('.tgw-tabs__item')
    expect(allTabs.length).toBe(3)
    expect(allTabs[0].classes()).not.toContain('is-disabled')
    expect(allTabs[2].classes()).toContain('is-disabled')
    expect(allTabs[1].classes()).toContain('is-active')
  })

  it('should change the order of the tabs when workstationDirection is right-to-left', async () => {
    mountView({
      sourceLcId: '111111',
      targetLcId: null,
      selectedSourceLcProblems: 0,
      selectedTargetLcProblems: 0,
      selectedTaskProblems: 0,
    })
    expect(wrapper.find('.right-to-left').exists()).toBeFalsy()
    workspaceStore.workstationDirection = WorkStationDirectionEnum.RightToLeft
    await new Promise(process.nextTick)
    expect(wrapper.find('.right-to-left').exists()).toBeTruthy()
  })
})
