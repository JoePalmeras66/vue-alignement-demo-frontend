<script setup lang="ts">
import { RovoflexState } from '@/types/RovoflexState'
import { useTranslations } from '@/composables/useTranslations'

const props = defineProps<Props>()
const { getTranslation } = useTranslations('rovoflex-footer')
interface Props {
  state: RovoflexState
}
const header = computed(() => {
  if (
    props.state === RovoflexState.RovoflexPicking ||
    props.state === RovoflexState.ManualPickingRequested
  ) {
    return getTranslation(`picking_header`)
  }
  return getTranslation(`error_header`)
})
const description = computed(() => {
  if (
    props.state === RovoflexState.RovoflexPicking ||
    props.state === RovoflexState.ManualPickingRequested
  ) {
    return getTranslation(`picking_description`)
  }
  return getTranslation(`error_description`)
})
const iconColor = computed(() => {
  if (
    props.state === RovoflexState.RovoflexPicking ||
    props.state === RovoflexState.ManualPickingRequested
  ) {
    return 'var(--tgw-accent-lighten)'
  }
  return 'rgba(13, 16, 20, 0.86)'
})
const midIcon = computed(() => {
  if (
    props.state === RovoflexState.RovoflexPicking ||
    props.state === RovoflexState.ManualPickingRequested
  ) {
    return 'status-warning-triangle'
  }
  return 'status-error-circle'
})
</script>

<template>
  <div
    class="rovoflex-footer"
    :class="{ error: state === RovoflexState.Error }"
  >
    <div class="content-left">
      <RovoflexToManual :left-to-right="true" :state="state" />
    </div>
    <div class="content-mid" :class="{ error: state === RovoflexState.Error }">
      <TgwIcon
        class="icon-mid"
        size="56px"
        :icon="midIcon"
        :color="iconColor"
      />
      <span class="header">{{ header }}</span>
      <span class="description">{{ description }}</span>
    </div>
    <div class="content-right">
      <RovoflexToManual :left-to-right="false" :state="state" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.rovoflex-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--pcots-footer-bottom-height);
  max-height: var(--pcots-footer-bottom-height);
  background: var(--pcots-bg-robot-mode-g);
  padding: 0 var(--pcots-outside-padding);
  box-sizing: border-box;
  overflow: hidden;
  border-top: 1px solid var(--tgw-line-20);

  &.error {
    background: var(--tgw-status-error-g);
  }

  .content-mid {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    height: 100%;

    .header {
      font-family: Roboto, Helvetica, sans-serif;
      font-weight: 700;
      font-size: 40px;
      line-height: 47px;
      text-transform: uppercase;
      color: var(--tgw-accent-lighten);
      user-select: none;
    }

    .description {
      font-family: Roboto, Helvetica, sans-serif;
      font-style: normal;
      font-weight: 700;
      font-size: 28px;
      line-height: 33px;
      color: var(--tgw-accent-lighten);
      user-select: none;
    }

    &.error {
      .header {
        color: rgba(13, 16, 20, 0.86);
      }
      .description {
        color: rgba(13, 16, 20, 0.86);
      }
    }
  }
}
</style>
