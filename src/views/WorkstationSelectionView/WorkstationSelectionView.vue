<script setup lang="ts">
import { useAppContainer, useLogger } from '@tgw-components/core'
import { storeToRefs } from 'pinia'
import WorkstationSelection from '@/components/WorkstationSelection/WorkstationSelection.vue'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { useKeycloakStore } from '@/stores/useKeycloakStore/useKeycloakStore'
import { useTranslations } from '@/composables/useTranslations'
import { SupportedStationType } from '@/types/Api/wm/WmApiModel'
import { useApiVersionStore } from '@/stores/useApiVersionStore/useApiVersionStore'
import { useAppContainerConfigStore } from '@/stores/useAppContainerConfigStore/useAppContainerConfigStore'
import { useAppContainer as useAppContainerInternal } from '@/composables/useAppContainer'

const router = useRouter()
const appContainerConfigStore = useAppContainerConfigStore()

const { triggerLogoutUserEvent, triggerBackHomeEvent } = useAppContainer()
const { triggerAppWarningNotificationEvent } = useAppContainerInternal()
const workspaceStore = useWorkspaceStore()
const { availableStations, getWorkspace } = storeToRefs(workspaceStore)
const apiVersionStore = useApiVersionStore()
const { getTranslation } = useTranslations('workstation-selection-view')
const logger = useLogger()

const confirmStationSelection = async (stationId: string) => {
  logger.info('Selected station', stationId)
  const workspace = getWorkspace.value
  const selectedWorkstation = (
    availableStations.value as SupportedStationType[]
  ).find((station) => station.id === stationId) as SupportedStationType
  workspace.workstation = JSON.parse(JSON.stringify(selectedWorkstation))
  workspaceStore.setWorkspace(workspace)
  appContainerConfigStore.updateHeaderSubTitle()
  await apiVersionStore.loadVersions()
  await router.push({ name: 'home' })
}

onMounted(async () => {
  if (workspaceStore.hasWorkstation()) {
    if (workspaceStore.isWorkstationAvailable()) {
      // Current workstation is available
      await confirmStationSelection(workspaceStore.workstation.id)
      return
    } else {
      logger.error(
        'Workstation ',
        workspaceStore.workstation.id,
        'is not available!'
      )
      // Current workstation is not available
      triggerAppWarningNotificationEvent({
        title: getTranslation('warning'),
        description: getTranslation('station_not_supported'),
      })
      if (appContainerConfigStore.canSwitchStation()) {
        logger.info('User is allowed to change station, clear current station')
        workspaceStore.clearWorkstation()
      } else {
        triggerBackHomeEvent()
        return
      }
    }
  }

  if (availableStations.value.length === 1) {
    // If we have only one workstation select this one automatically
    await confirmStationSelection(availableStations.value[0].id)
  }
})

const backToLogin = async () => {
  if (useEnv().getEnv('MODE') === 'development') {
    const { keycloak } = storeToRefs(useKeycloakStore())
    useWorkspaceStore().clearWorkspace()

    keycloak.value.logout()
    sessionStorage.clear()
    localStorage.clear()
  } else {
    triggerLogoutUserEvent()
  }
}
</script>

<template>
  <div class="station-selection-wrapper">
    <TgwCard class="station-selection-content-wrapper">
      <WorkstationSelection
        v-if="availableStations"
        :available-stations="availableStations"
        @station-selected="confirmStationSelection"
        @back-to-login="backToLogin"
      />
    </TgwCard>
  </div>
</template>

<style scoped lang="scss">
.station-selection-wrapper {
  display: flex;
  min-height: 100vh;
  height: 100%;
  min-width: 100vw;
  width: 100vw;
  justify-content: center;
  align-items: center;

  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;

  .station-selection-content-wrapper {
    box-sizing: border-box;
    width: 592px;
    height: 750px;
    padding: 32px 40px 40px 40px;
    border-radius: 8px;
    box-shadow: var(--tgw-dropshadow-soft);

    :deep(.tgw-card__body) {
      padding: 0;
    }
  }
}
</style>
