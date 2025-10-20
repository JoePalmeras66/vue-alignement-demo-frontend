<script setup lang="ts">
import { LoadCarrierTypeType } from '@/types/Api/pcots/PcotsApiModel'

interface Props {
  selectedLcType: string
  numberOfOccupiedCompartments: number
  loadCarrierTypes: LoadCarrierTypeType[]
  currentLcType?: LoadCarrierTypeType
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selectedLcType': [activeLcType: string]
}>()
const properties = toRefs(props)
const activeLcType = computed({
  get() {
    return properties.selectedLcType.value
  },
  set(newValue: string) {
    emit('update:selectedLcType', newValue)
  },
})

const getDisabled = (
  length: number | null | undefined,
  lcType: LoadCarrierTypeType
) => {
  return (
    props.currentLcType &&
    (properties.numberOfOccupiedCompartments.value > (length ?? 0) ||
      lcType.id === props.currentLcType.id)
  )
}
</script>

<template>
  <TgwRadioGroup v-model="activeLcType" class="lc-type-select-container">
    <TgwRadio
      v-for="lcType in loadCarrierTypes"
      :key="lcType.id"
      :label="lcType.id"
      border
      :disabled="getDisabled(lcType.compartments?.length, lcType)"
    >
      <LoadCarrierTypeIcon :data="lcType" />
    </TgwRadio>
  </TgwRadioGroup>
</template>

<style scoped lang="scss">
.lc-type-select-container {
  display: flex;
  justify-content: space-evenly;
  box-sizing: border-box;
  flex-wrap: wrap;

  :deep(.tgw-radio) {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: center;
    padding: 24px 24px 19px 24px;
    margin: 0 8px;
    background-color: var(--tgw-bg-40);
    box-shadow: var(--tgw-dropshadow-soft);
    border: 1px solid var(--tgw-line-00);
    border-radius: 8px;
    row-gap: 12px;

    .load-carrier-icon-wrapper {
      .load-carrier-icon-inner .load-carrier-icon-compartment {
        background-color: var(--tgw-bg-40);
      }
    }

    .tgw-radio__label {
      padding: 0;
    }

    &:focus-within {
      outline: 0;
    }

    &.is-checked {
      box-shadow: 0 0 0 2px var(--tgw-primary);
    }

    &.is-disabled {
      opacity: 100%;
      background: var(--tgw-bg-disabled);

      .load-carrier-icon-wrapper {
        .load-carrier-icon-inner .load-carrier-icon-compartment {
          background: var(--tgw-bg-disabled);
        }
      }
    }
  }

  .load-carrier-icon-wrapper {
    width: 64px;
    box-sizing: border-box;
  }
}
</style>
