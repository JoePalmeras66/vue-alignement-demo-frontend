<script setup lang="ts">
import { Ref } from 'vue'
import DeleteCountMessageBox from '@/components/DeleteCountMessageBox/DeleteCountMessageBox.vue'
import { useTranslations } from '@/composables/useTranslations'

interface Props {
  modelValue: number
  disabled?: boolean
  modifiable?: boolean
  showDeleteMessageBox?: boolean
  quantityColor?: string
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  modifiable: true,
  quantityColor: 'var(--tgw-text-primary)',
})
const emit = defineEmits<{
  'update:modelValue': [modelValue: number]
}>()
const deleteCountMessageBoxRef = ref()
const properties = toRefs(props)
const { getTranslation } = useTranslations('cycle-count-input')

enum ModificationButtons {
  Reduce,
  Add,
}

const count = computed({
  get() {
    return properties.modelValue.value ?? 0
  },
  set(newValue) {
    emit('update:modelValue', newValue)
  },
})
const inputTextCssVar = computed(() => {
  return `--pcots-cycle-count-input-color: ${properties.quantityColor.value}`
})
const onReduceClick = async () => {
  if (
    count.value !== undefined &&
    count.value - 1 === 0 &&
    props.showDeleteMessageBox
  ) {
    const deleteCounted = await deleteCountMessageBoxRef.value.showAndWait()
    if (!deleteCounted) {
      return
    }
  }
  if (count.value !== undefined && count.value > 0) {
    count.value--
  }
}

const onIncreaseClick = () => {
  if (count.value === undefined) {
    count.value = 0
  } else {
    count.value++
  }
}

const isQuantityInputVisible: Ref<boolean> = ref<boolean>(false)
const openQuantityInput = () => {
  if (!props.disabled && props.modifiable) {
    isQuantityInputVisible.value = true
  }
}

const quantityChanged = async (newQuantity: number) => {
  if (newQuantity === 0 && props.showDeleteMessageBox) {
    const deleteCounted = await deleteCountMessageBoxRef.value.showAndWait()
    if (!deleteCounted) {
      return
    }
  }
  count.value = newQuantity
}

const isModifyButtonDisabled = (modificationButton: ModificationButtons) => {
  if (
    modificationButton === ModificationButtons.Reduce &&
    (count.value === undefined || count.value <= 0)
  ) {
    return true
  }
  return props.disabled || !props.modifiable
}
</script>

<template>
  <DeleteCountMessageBox ref="deleteCountMessageBoxRef" />
  <div class="cycle-count-input">
    <IconButton
      icon="remove"
      type="primary"
      :disabled="isModifyButtonDisabled(ModificationButtons.Reduce)"
      class="cycle-count-input__button reduce-button"
      @click="onReduceClick"
      >-</IconButton
    >
    <TgwCard
      class="input-field"
      :class="{ 'is-disabled': disabled, 'is-not-modifiable': !modifiable }"
      @click="openQuantityInput"
    >
      <span class="input-field__text" :style="inputTextCssVar">{{
        count
      }}</span>
    </TgwCard>
    <IconButton
      icon="add"
      type="primary"
      :disabled="isModifyButtonDisabled(ModificationButtons.Add)"
      class="cycle-count-input__button increase-button"
      @click="onIncreaseClick"
      >+</IconButton
    >
  </div>
  <QuantityInput
    v-if="isQuantityInputVisible"
    v-model:is-visible="isQuantityInputVisible"
    :title="getTranslation('quantity_input_title')"
    :quantity="count"
    @quantity-changed="quantityChanged"
  />
</template>

<style scoped lang="scss">
.cycle-count-input {
  display: flex;
  gap: 16px;
  height: 120px;

  .icon-button.cycle-count-input__button {
    width: 200px;
    height: 100%;
    box-shadow: var(--tgw-dropshadow-intense-elevated);

    &.is-disabled {
      box-shadow: none;
      border: 1px solid var(--tgw-line-30);
      opacity: 0.75;
    }

    :deep(.tgw-icon) {
      --icon-button-icon-size: 60px;
    }
  }

  .input-field {
    width: 348px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--tgw-dropshadow-soft-elevated);
    cursor: pointer;
    background-color: var(--tgw-bg-40);
    border-radius: 8px;
    user-select: none;

    :deep(.tgw-card__body) {
      padding: 0;
    }

    .input-field__text {
      font-weight: 900;
      font-size: 96px;
      line-height: 112px;
      color: var(--pcots-cycle-count-input-color);
    }

    &.is-disabled {
      background-color: var(--tgw-bg-30);
      box-shadow: none;
      border: 1px solid var(--tgw-line-20);
      cursor: not-allowed;

      .input-field__text {
        color: var(--tgw-text-sub);
      }
    }

    &.is-not-modifiable {
      cursor: not-allowed;
      box-shadow: var(--tgw-dropshadow-soft);
    }
  }
}
@media screen and (max-height: 900px) {
  .cycle-count-input {
    height: 100px;

    .icon-button.cycle-count-input__button {
      width: 160px;

      :deep(.tgw-icon) {
        --icon-button-icon-size: 50px;
      }
    }

    .input-field {
      width: 300px;

      .input-field__text {
        font-size: 80px;
        line-height: 100px;
      }
    }
  }
}
</style>
