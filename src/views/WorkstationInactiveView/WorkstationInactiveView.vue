<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { useTextTranslator } from '@/composables/useTextTranslator/useTextTranslator'

import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import { usePcotsWebsockets } from '@/composables/usePcotsWebsockets'
import { usePcotsEventHandler } from '@/composables/usePcotsEventHandler'
import { useRouteToInactiveView } from '@/composables/useRouteToInactiveView/useRouteToInactiveView'
import { getWorkstationState } from '@/composables/usePcotsApi'

useRouteToInactiveView()
const { connectPcotsEvents, disconnectPcotsEvents } = usePcotsWebsockets()
const { getTranslation } = useTranslations('workstation-inactive-view')
const { getTranslatedText } = useTextTranslator()
const { workstation } = storeToRefs(useWorkspaceStore())
const currentTime = useDateFormat(useNow(), 'HH:mm')
const currentDate = useDateFormat(useNow(), 'dddd, MMMM D YYYY')
const rovoflexStore = useRovoflexStore()
const { onHandlePcotsEvent } = usePcotsEventHandler()

const stationName = computed(() => {
  return getTranslatedText(workstation.value.name)
})
const workstationState = computed(() => {
  return getTranslation('inactive')
})
const animationVideoPath = computed(() => {
  let path = 'src/assets/animations/video/workstation-inactive'
  if (isDark.value) {
    path += '_dark.mp4'
  } else {
    path += '_light.mp4'
  }
  return path
})

const onPcotsEventsReconnected = async () => {
  const response = await getWorkstationState()
  if (response) {
    await rovoflexStore.handleWorkstationChangedEvent(response)
  }
}

onMounted(async () => {
  connectPcotsEvents(onHandlePcotsEvent, onPcotsEventsReconnected)
  const response = await getWorkstationState()
  if (response) {
    await rovoflexStore.handleWorkstationChangedEvent(response)
  }
})

onUnmounted(() => {
  disconnectPcotsEvents()
})
</script>

<template>
  <div class="workstation-inactive-view">
    <video
      :key="animationVideoPath"
      autoplay
      loop
      muted
      class="bg-animation"
      oncontextmenu="return false;"
    >
      <source :src="animationVideoPath" type="video/mp4" />
      <!--Satisfy sonar-->
      <track src="" />
    </video>

    <div class="header-container">
      <span class="station-name">
        {{ stationName }}
      </span>
      <span class="current-time">
        {{ currentTime }}
      </span>
      <span class="current-date">
        {{ currentDate }}
      </span>
    </div>

    <div class="workstation-state-container" :class="isDark ? 'dark' : 'light'">
      <span class="workstation-state-container__text">{{
        workstationState
      }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.workstation-inactive-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  .bg-animation {
    position: absolute;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
  }

  .header-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;

    .station-name {
      font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
      color: var(--tgw-text-secondary);
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: 60px 0;
      user-select: none;
    }

    .current-time {
      color: var(--tgw-text-secondary);
      font-size: 96px;
      font-weight: 600;
      margin-bottom: 40px;
      user-select: none;
    }
    .current-date {
      color: var(--tgw-text-secondary);
      font-size: 48px;
      margin-bottom: 269px;
      user-select: none;
    }
  }

  .workstation-state-container {
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 166px;
    width: 100%;

    &.light {
      border-bottom: 1px solid #cbcbcb;
      background: rgba(255, 255, 255, 0.63);
      box-shadow: 0 15px 19px 0 rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(5px);
    }

    &.dark {
      background: rgba(12, 12, 12, 0.5);
      box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(4px);
    }

    .workstation-state-container__text {
      color: var(--tgw-text-secondary);
      font-size: 72px;
      font-weight: 300;
      font-variant: all-small-caps;
      letter-spacing: 4px;
      margin: 42px;
      user-select: none;
    }
  }
}
</style>
