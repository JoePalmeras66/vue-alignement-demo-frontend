<script setup lang="ts">
import { RouteLocationNormalized } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLoadCarrierDetailsStore } from '@/stores/useLoadCarrierDetailsStore/useLoadCarrierDetailsStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { Position } from '@/types/Position'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

const transitionName = ref('')
const routeInternal = useRoute()
const loadCarrierDetailsStore = useLoadCarrierDetailsStore()
const { pcotsLocation: loadCarrierDetailsLocation } = storeToRefs(
  loadCarrierDetailsStore
)
const workspaceStore = useWorkspaceStore()

const loadCarrierDetailsPosition = computed(() => {
  if (!workspaceStore.isRightToLeft()) {
    return loadCarrierDetailsLocation.value === PcotsLocationEnum.Source
      ? Position.left
      : Position.right
  } else {
    return loadCarrierDetailsLocation.value === PcotsLocationEnum.Source
      ? Position.right
      : Position.left
  }
})

watch(
  () => routeInternal.path,
  (to, from) => {
    if (
      to === '/editScans' ||
      to === '/advancedCycleCount' ||
      (to === '/loadCarrierDetails' &&
        loadCarrierDetailsPosition.value === Position.left)
    ) {
      transitionName.value = 'slide-right-z1'
    } else if (
      from === '/editScans' ||
      from === '/advancedCycleCount' ||
      (from === '/loadCarrierDetails' &&
        loadCarrierDetailsPosition.value === Position.left)
    ) {
      transitionName.value = 'slide-left-z2'
    } else if (
      to === '/troubleshooting' ||
      (to === '/loadCarrierDetails' &&
        loadCarrierDetailsPosition.value === Position.right)
    ) {
      transitionName.value = 'slide-left-z1'
    } else if (
      from === '/troubleshooting' ||
      (from === '/loadCarrierDetails' &&
        loadCarrierDetailsPosition.value === Position.right)
    ) {
      transitionName.value = 'slide-right-z2'
    } else {
      transitionName.value = ''
    }
  }
)

const transitionMode = computed(() => {
  if (transitionName.value === '') {
    return 'out-in'
  } else {
    return 'default'
  }
})
const getRouteName = (route: RouteLocationNormalized) => {
  if (route && route.name) {
    return route.name
  }
  return ''
}
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition :name="transitionName" :mode="transitionMode">
      <div :key="getRouteName(route)">
        <component :is="Component" />
      </div>
    </Transition>
  </RouterView>
</template>

<style lang="scss">
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

body {
  background-color: var(--tgw-bg-10);
  height: 100vh;
  align-items: center;
}
</style>

<style scoped lang="scss">
$duration: 0.5s;
$transform-x-small: 10%;
$transform-x-big: 100%;

/*#region slide-left-z1*/
//First part
.slide-left-z1-leave-active {
  position: fixed;
  width: 100%;
  min-height: 100vh;
  top: 0;
  transition: all $duration ease;
  z-index: 1;
}

.slide-left-z1-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-left-z1-leave-to {
  opacity: 0;
  transform: translateX(-$transform-x-small);
}

//Second part
.slide-left-z1-enter-active {
  position: fixed;
  width: 100%;
  min-height: 100vh;
  top: 0;
  transition: all $duration ease-out;
  z-index: 2;
}

.slide-left-z1-enter-to {
  transform: translateX(0);
}

.slide-left-z1-enter-from {
  transform: translateX($transform-x-big);
}
/*#endregion*/

/*#region slide-left-z2*/
//First part
.slide-left-z2-leave-active {
  position: fixed;
  width: 100%;
  min-height: 100vh;
  top: 0;
  transition: all $duration ease;
  z-index: 2;
}

.slide-left-z2-leave-from {
  transform: translateX(0);
}

.slide-left-z2-leave-to {
  transform: translateX(-$transform-x-big);
}

//Second part
.slide-left-z2-enter-active {
  position: fixed;
  width: 100%;
  min-height: 100vh;
  top: 0;
  transition: all $duration ease-out;
  z-index: 1;
}

.slide-left-z2-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-left-z2-enter-from {
  transform: translateX($transform-x-small);
  opacity: 0;
}
/*#endregion*/

/*#region slide-right-z1*/
//First part
.slide-right-z1-leave-active {
  position: fixed;
  width: 100%;
  min-height: 100vh;
  top: 0;
  transition: all $duration ease;
  z-index: 1;
}

.slide-right-z1-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-right-z1-leave-to {
  transform: translateX($transform-x-small);
  opacity: 0;
}

//Second part
.slide-right-z1-enter-active {
  position: fixed;
  width: 100%;
  min-height: 100vh;
  top: 0;
  transition: all $duration ease-out;
  z-index: 2;
}

.slide-right-z1-enter-to {
  transform: translateX(0);
}

.slide-right-z1-enter-from {
  transform: translateX(-$transform-x-big);
}
/*#endregion*/

/*#region slide-right-z2*/
//First part
.slide-right-z2-leave-active {
  position: fixed;
  width: 100%;
  min-height: 100vh;
  top: 0;
  transition: all $duration ease;
  z-index: 2;
}

.slide-right-z2-leave-from {
  transform: translateX(0);
}

.slide-right-z2-leave-to {
  transform: translateX($transform-x-big);
}

//Second part
.slide-right-z2-enter-active {
  position: fixed;
  width: 100%;
  min-height: 100vh;
  top: 0;
  transition: all $duration ease-out;
  z-index: 1;
}

.slide-right-z2-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-right-z2-enter-from {
  transform: translateX(-$transform-x-small);
  opacity: 0;
}
/*#endregion*/
</style>
