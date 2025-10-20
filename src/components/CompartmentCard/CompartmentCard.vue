<script setup lang="ts">
import { Nullable } from 'vitest'
import { CompartmentType, TaskType } from '@/types/Api/pcots/PcotsApiModel'
import { CompartmentState } from '@/types/CompartmentState'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { useTextTranslator } from '@/composables/useTextTranslator/useTextTranslator'

const props = defineProps<Props>()
const emit = defineEmits<{
  compartmentClicked: [compartmentId: string]
}>()
const { getStockFromCompartment, getItemNumberDisplay } = useApiDataHelper()
interface Props {
  task: Nullable<TaskType>
  compartment: CompartmentType
  state: CompartmentState
}
const { getTranslatedText } = useTextTranslator()

const stock = computed(() => {
  if (props.compartment && props.task) {
    return getStockFromCompartment(props.compartment, props.task)
  }
})
const item = computed(() => {
  return stock.value?.item
})
const quantity = computed(() => {
  if (props.compartment && stock.value) {
    return stock.value?.quantity
  }
})

const itemImage = computed(() => {
  return item.value?.images?.at(0)?.url
})
const itemName = computed((): string | undefined => {
  return getItemNumberDisplay(item.value?.id)
})
const itemDescription = computed((): string | undefined => {
  return getTranslatedText(item.value?.name)
})

const quantityDisplayText = computed(() => {
  if (quantity.value || quantity.value === 0) {
    return `${quantity.value}`
  }
})
const classes = computed(() => {
  if (props.state && props.state !== CompartmentState.none) {
    return `${props.state}`
  }
})
const compartmentClicked = () => {
  if (props.state === CompartmentState.selectable) {
    emit('compartmentClicked', props.compartment.id)
  }
}
</script>

<template>
  <div class="compartment-card" :class="classes" @click="compartmentClicked">
    <ElImage
      v-if="itemImage"
      class="item-image"
      :src="itemImage"
      :alt="itemImage"
      fit="cover"
    >
      <template #error>
        <div class="no-image-container">
          <TgwIcon
            class="no-image-icon"
            icon="image"
            color="var(--tgw-icon-fallback)"
          />
        </div>
      </template>
    </ElImage>
    <span class="quantity">{{ quantityDisplayText }}</span>
    <span class="item-description">{{ itemDescription }}</span>
    <span class="item-name">{{ itemName }}</span>
  </div>
</template>

<style scoped lang="scss">
.compartment-card {
  $padding: 16px;
  $border-state-width: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--tgw-bg-40);
  box-shadow: var(--tgw-dropshadow-soft);
  border-radius: 3px;
  height: 100%;
  min-width: 200px;
  max-width: 200px;
  max-height: 280px;
  padding: $padding;
  box-sizing: border-box;

  &.active {
    padding: calc($padding - $border-state-width);
    border: $border-state-width solid var(--tgw-primary);
  }

  &.selectable {
    padding: calc($padding - $border-state-width);
    border: $border-state-width dashed var(--tgw-line-30);
  }

  .item-image {
    user-select: none;
    aspect-ratio: 1/1;
    width: 48%;

    :deep(.el-image__wrapper) {
      .no-image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;

        .no-image-icon {
          --item-picture-no-image-icon-size: 80px;
          width: var(--item-picture-no-image-icon-size) !important;
          height: var(--item-picture-no-image-icon-size) !important;

          svg {
            width: var(--item-picture-no-image-icon-size);
            height: var(--item-picture-no-image-icon-size);
          }
        }
      }
    }
  }

  .quantity {
    user-select: none;
    color: var(--tgw-text-primary);
    font-weight: 700;
    font-size: 57px;
    line-height: 55px;
    margin: 16px 0;
    text-align: center;
  }

  .item-description {
    user-select: none;
    color: var(--tgw-primary);
    text-align: center;
    font-weight: 700;
    font-size: 20px;
    font-style: normal;
    line-height: normal;
    margin-bottom: 8px;
  }

  .item-name {
    user-select: none;
    color: var(--tgw-text-secondary);
    font-weight: 500;
    font-size: 14px;
    line-height: normal;
    text-align: center;
  }
}
</style>
