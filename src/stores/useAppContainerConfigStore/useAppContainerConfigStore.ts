import { defineStore, storeToRefs } from 'pinia'
import { AppMeta } from '@tgw-components/core'
import { HeaderMenuItem } from '@tgw-components/web/dist/packages/core/src/plugins/AppContainer/src/types'
import { AppContainerActionEnum } from '@/types/AppContainerActionEnum'
import { useAppContainer } from '@/composables/useAppContainer'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import { RovoflexState } from '@/types/RovoflexState'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'

export const appContainerConfigStoreId = 'appContainerConfig'

export const useAppContainerConfigStore = defineStore(
  appContainerConfigStoreId,
  {
    state: () => ({
      possibleMenuItems: [
        {
          appName: 'app_name_pcots',
          url: '/station',
          actionName: AppContainerActionEnum.SwitchStation,
          title: 'Switch station',
        },
        {
          appName: 'app_name_pcots',
          actionName: AppContainerActionEnum.SwitchToRobotMode,
          title: 'Robot mode',
        },
      ] as HeaderMenuItem[],
      appMeta: {
        containerHeaderSubTitle: '',
        containerHeaderMenuItems: [],
      } as AppMeta,
      hasLanguageChanged: false,
    }),
    actions: {
      getCurrentRobotActionByRovoflexState():
        | AppContainerActionEnum.ExitRobotMode
        | AppContainerActionEnum.SwitchToRobotMode {
        const { rovoflexState } = storeToRefs(useRovoflexStore())
        if (
          rovoflexState.value === RovoflexState.ManualPicking ||
          rovoflexState.value === RovoflexState.ManualPickingRequested
        ) {
          return AppContainerActionEnum.SwitchToRobotMode
        }
        return AppContainerActionEnum.ExitRobotMode
      },
      updateConfigInAppContainer() {
        const { triggerAppMetaDataEvent } = useAppContainer()
        triggerAppMetaDataEvent(this.appMeta)
      },
      languageChanged() {
        for (const menuItem of this.possibleMenuItems) {
          menuItem.title = this.getTranslation(
            `app-container-menu-items.${menuItem.actionName}`
          )
        }
        this.updateHeaderSubTitle()
      },
      updateRobotModeMenuItem() {
        const menuItem = this.possibleMenuItems.find(
          (item) =>
            item.actionName === AppContainerActionEnum.SwitchToRobotMode ||
            item.actionName === AppContainerActionEnum.ExitRobotMode
        )
        if (menuItem) {
          menuItem.actionName = this.getCurrentRobotActionByRovoflexState()
          this.languageChanged()
        }
      },
      updateHeaderSubTitle() {
        const stationId = useWorkspaceStore().workstation.id
        this.appMeta.containerHeaderSubTitle =
          stationId === undefined || stationId === ''
            ? ''
            : this.getTranslation('app-container-sub-text.station', stationId)
        this.updateConfigInAppContainer()
      },
      removeMenuItem(action: AppContainerActionEnum) {
        const menuItem = this.appMeta.containerHeaderMenuItems?.find(
          (menuItem) => menuItem.actionName === action
        )
        if (menuItem) {
          const menuItemIndex =
            this.appMeta.containerHeaderMenuItems?.indexOf(menuItem)
          if (menuItemIndex !== undefined && menuItemIndex >= 0) {
            this.appMeta.containerHeaderMenuItems?.splice(menuItemIndex, 1)
            this.updateConfigInAppContainer()
          }
        }
      },
      addMenuItem(action: AppContainerActionEnum) {
        if (this.appMeta.containerHeaderMenuItems) {
          const menuItem = this.possibleMenuItems.find(
            (possibleItem) => possibleItem.actionName === action
          )
          if (
            menuItem &&
            !this.appMeta.containerHeaderMenuItems.some(
              (item) => item.actionName === action
            )
          ) {
            this.appMeta.containerHeaderMenuItems.push(menuItem)
            this.updateConfigInAppContainer()
          }
        }
      },
      canSwitchStation() {
        return !!this.appMeta.containerHeaderMenuItems?.some(
          (menuItem) =>
            menuItem.actionName === AppContainerActionEnum.SwitchStation
        )
      },
    },
  }
)
