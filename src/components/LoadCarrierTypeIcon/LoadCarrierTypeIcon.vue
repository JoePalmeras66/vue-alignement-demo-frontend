<script setup lang="ts">
import { Ref } from 'vue'
import {
  CompartmentDefinitionType,
  LoadCarrierTypeType,
} from '@/types/Api/pcots/PcotsApiModel'
import { useCompartmentStyler } from '@/composables/useCompartmentStyler/useCompartmentStyler'

interface Props {
  data: LoadCarrierTypeType
}
const props = defineProps<Props>()

const { getCompartmentStyle } = useCompartmentStyler()
const compartmentDefinitions: Ref<CompartmentDefinitionType[]> = computed(
  () => {
    if (props.data && props.data.compartments) {
      return props.data.compartments
    }
    return []
  }
)
</script>

<template>
  <div class="load-carrier-icon-wrapper">
    <div class="load-carrier-icon-inner">
      <div
        v-for="compartmentDef in compartmentDefinitions"
        :key="compartmentDef.id ?? undefined"
        class="load-carrier-icon-compartment"
        :style="getCompartmentStyle(data, undefined, 0, compartmentDef)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.load-carrier-icon-wrapper {
  aspect-ratio: var(--pcots-lc-aspect-ratio);
  padding: 4px;
  background-color: var(--tgw-icon-secondary);
  border-radius: 4px;

  .load-carrier-icon-inner {
    height: 100%;
    width: 100%;
    border-radius: 2px;
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-rows: 1fr;
    gap: 2px;

    .load-carrier-icon-compartment {
      background-color: var(--tgw-bg-20);
      height: 100%;
      width: 100%;
      border-radius: 2px;
      display: flex;
      position: relative;

      .load-carrier-icon-target {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .tgw-icon {
          display: flex;
        }
      }
    }
  }
}
</style>
