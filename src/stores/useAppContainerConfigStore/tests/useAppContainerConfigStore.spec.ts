import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { useAppContainerConfigStore } from '@/stores/useAppContainerConfigStore/useAppContainerConfigStore'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import { RovoflexState } from '@/types/RovoflexState'
import { AppContainerActionEnum } from '@/types/AppContainerActionEnum'
import { setConsoleLogger } from '@/helpers/loggerHelper'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import i18nFactory from '@/plugins/i18nFactory'

setActivePinia(createPinia())

const mockTriggerAppMetaDataEvent = vi.fn()
vi.mock('@/composables/useAppContainer', () => ({
  useAppContainer() {
    const triggerAppMetaDataEvent = mockTriggerAppMetaDataEvent
    return { triggerAppMetaDataEvent }
  },
}))

describe('Test useAppContainerConfigStore', () => {
  const appContainerConfigStore = useAppContainerConfigStore()
  const rovoflexStore = useRovoflexStore()
  const workspaceStore = useWorkspaceStore()
  const { appMeta, possibleMenuItems } = storeToRefs(appContainerConfigStore)
  const { getTranslation } = useTranslations('')
  appContainerConfigStore.getTranslation = getTranslation

  const changeCulture = (culture: 'de' | 'en') => {
    i18nFactory.global.locale.value = culture
  }

  setConsoleLogger()

  beforeEach(() => {
    workspaceStore.$reset()
    appContainerConfigStore.$reset()
    appContainerConfigStore.addMenuItem(AppContainerActionEnum.SwitchStation)
    appContainerConfigStore.addMenuItem(
      AppContainerActionEnum.SwitchToRobotMode
    )
    mockTriggerAppMetaDataEvent.mockClear()
  })

  afterEach(() => {
    changeCulture('en')
  })

  it('should render correctly to de', () => {
    changeCulture('de')
    appContainerConfigStore.languageChanged()
    expect(appMeta.value.containerHeaderMenuItems![0].title).toBe(
      'Station wechseln'
    )
    expect(possibleMenuItems.value[0].title).toBe('Station wechseln')
    expect(appMeta.value.containerHeaderMenuItems![1].title).toBe(
      'Zu Robotermodus wechseln'
    )
    expect(possibleMenuItems.value[1].title).toBe('Zu Robotermodus wechseln')
    expect(mockTriggerAppMetaDataEvent).toHaveBeenCalledWith(appMeta.value)
  })

  it('should render correctly to en', () => {
    appContainerConfigStore.languageChanged()
    expect(appMeta.value.containerHeaderMenuItems![0].title).toBe(
      'Change station'
    )
    expect(possibleMenuItems.value[0].title).toBe('Change station')
    expect(appMeta.value.containerHeaderMenuItems![1].title).toBe(
      'Change to robot mode'
    )
    expect(possibleMenuItems.value[1].title).toBe('Change to robot mode')
    expect(mockTriggerAppMetaDataEvent).toHaveBeenCalledWith(appMeta.value)
  })

  it('should translate exit robot mode to de', () => {
    changeCulture('de')
    rovoflexStore.updateRovoflexState(RovoflexState.RovoflexPickingRequested)
    appContainerConfigStore.updateRobotModeMenuItem()
    expect(appMeta.value.containerHeaderMenuItems![1].title).toBe(
      'Robotermodus beenden'
    )
    expect(mockTriggerAppMetaDataEvent).toHaveBeenCalledWith(appMeta.value)
  })

  it('should translate exit robot mode to en', () => {
    rovoflexStore.updateRovoflexState(RovoflexState.RovoflexPickingRequested)
    appContainerConfigStore.updateRobotModeMenuItem()
    expect(appMeta.value.containerHeaderMenuItems![1].title).toBe(
      'Exit robot mode'
    )
  })

  it('should update robot menu item by rovoflex state', () => {
    rovoflexStore.updateRovoflexState(RovoflexState.RovoflexPickingRequested)
    appContainerConfigStore.updateRobotModeMenuItem()
    expect(appContainerConfigStore.getCurrentRobotActionByRovoflexState()).toBe(
      AppContainerActionEnum.ExitRobotMode
    )
    expect(appMeta.value.containerHeaderMenuItems![1].title).toBe(
      'Exit robot mode'
    )
    rovoflexStore.updateRovoflexState(RovoflexState.ManualPickingRequested)
    appContainerConfigStore.updateRobotModeMenuItem()
    expect(appContainerConfigStore.getCurrentRobotActionByRovoflexState()).toBe(
      AppContainerActionEnum.SwitchToRobotMode
    )
    expect(appMeta.value.containerHeaderMenuItems![1].title).toBe(
      'Change to robot mode'
    )
  })

  it('should update header sub title', () => {
    workspaceStore.workstation.id = '69'
    appContainerConfigStore.updateHeaderSubTitle()
    expect(appMeta.value.containerHeaderSubTitle).toBe('Station 69')
    expect(mockTriggerAppMetaDataEvent).toHaveBeenCalledWith(appMeta.value)
  })

  it('should remove menuItems', () => {
    appContainerConfigStore.removeMenuItem(AppContainerActionEnum.SwitchStation)
    expect(mockTriggerAppMetaDataEvent).toHaveBeenCalledWith(appMeta.value)
    mockTriggerAppMetaDataEvent.mockClear()
    appContainerConfigStore.removeMenuItem(
      AppContainerActionEnum.SwitchToRobotMode
    )
    expect(mockTriggerAppMetaDataEvent).toHaveBeenCalledWith(appMeta.value)
  })
})
