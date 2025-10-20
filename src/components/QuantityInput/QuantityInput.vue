<script setup lang="ts">
import { onKeyPressed } from '@vueuse/core'
import { useTranslations } from '@/composables/useTranslations'

interface Props {
  isVisible: boolean
  title: string
  subtitle?: string
  quantity?: number
  min?: number
  max?: number
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isVisible': [isVisible: boolean]
  quantityChanged: [quantity: number]
}>()
const properties = toRefs(props)

const dialogVisible = computed({
  get() {
    return properties.isVisible.value
  },
  set(newValue) {
    emit('update:isVisible', newValue)
  },
})

const { getTranslation } = useTranslations('quantity_input')

const showErrorMessage = ref(false)
const validationMessage = ref('')
const quantityInputRef = ref()
const validateForm = ref(false)
const formModel = reactive({
  quantity: '',
})

const validateQuantity = (rule: any, value: string, callback: any) => {
  if (!validateForm.value) {
    return
  }
  const transformedValue = Number.parseFloat(value.trim()) // transform string value to number value

  // reset values
  showErrorMessage.value = false
  validationMessage.value = ''

  if (!value || value.trim() === '' || !/^[\d-]+$/.test(value.trim())) {
    // not a number value
    showErrorMessage.value = true
    validationMessage.value = getTranslation('enter_a_number')
  } else if (
    (properties.min?.value || properties.min?.value === 0) &&
    transformedValue < properties.min.value
  ) {
    // value under minimum
    showErrorMessage.value = true
    validationMessage.value = getTranslation('validation_error_min', {
      min: properties.min.value,
    })
  } else if (
    (properties.max?.value || properties.max?.value === 0) &&
    transformedValue > properties.max.value
  ) {
    // value above maximum
    showErrorMessage.value = true
    validationMessage.value = getTranslation('validation_error_max', {
      max: properties.max.value,
    })
  }

  if (showErrorMessage.value) {
    callback(new Error(validationMessage.value))
  } else {
    showErrorMessage.value = false
    validationMessage.value = ''
    callback()
  }
}

const formRules = reactive({
  quantity: [
    {
      validator: validateQuantity,
    },
  ],
})

const errorMessage = computed(() => {
  if (showErrorMessage.value) {
    return validationMessage.value
  }
  return ''
})

const isFirstChange = ref(false)
const inputFormRef = ref()
const confirmDialog = () => {
  validateForm.value = true
  inputFormRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('quantityChanged', Number.parseInt(formModel.quantity.trim()))
      dialogVisible.value = false
    } else {
      isFirstChange.value = true
      if (
        quantityInputRef &&
        quantityInputRef.value !== undefined &&
        quantityInputRef.value !== null
      ) {
        quantityInputRef.value.select()
      }
    }
  })
  validateForm.value = false
}

onKeyPressed(
  ['Enter'],
  (e) => {
    if (!(e.target as HTMLElement).className.includes('close-button')) {
      confirmDialog()
    }
  },
  { passive: true }
)

const initializeDialog = () => {
  setTimeout(() => {
    if (quantityInputRef.value) {
      quantityInputRef.value.focus()
      quantityInputRef.value.select()
    }
    isFirstChange.value = true
  }, 300)
}

onMounted(() => {
  if (properties.quantity?.value || properties.quantity?.value === 0) {
    formModel.quantity = properties.quantity.value.toString()
  }
  initializeDialog()
})

const closeDialog = () => {
  dialogVisible.value = false
}

const onNumberClick = (value: number) => {
  if (formModel.quantity.trim() === '0' || isFirstChange.value) {
    formModel.quantity = value.toString()
    isFirstChange.value = false
  } else {
    if (formModel.quantity.length < 8) {
      formModel.quantity += value
    }
  }
}

const onClearButtonClick = () => {
  formModel.quantity = '0'
  showErrorMessage.value = false
  validationMessage.value = ''
}

const onQuantityInput = (event: KeyboardEvent) => {
  const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  if (!allowedKeys.includes(event.key)) {
    event.preventDefault()
  }
}

watch(dialogVisible, () => {
  if (dialogVisible.value) {
    if (properties.quantity?.value || properties.quantity?.value === 0) {
      formModel.quantity = properties.quantity.value.toString()
    }
    initializeDialog()
  }
})
</script>

<template>
  <TgwDialog
    v-model="dialogVisible"
    :lock-scroll="false"
    class="quantity-input-dialog"
    :close-on-click-modal="false"
    width="546px"
    :show-close="false"
    :smart-overflow="false"
  >
    <template #header>
      <span class="quantity-input-title">
        {{ title }}
      </span>
      <span v-if="subtitle" class="quantity-input-subtitle">{{
        subtitle
      }}</span>
    </template>
    <div class="quantity-input-content">
      <TgwForm
        ref="inputFormRef"
        :rules="formRules"
        :model="formModel"
        :show-message="false"
        @submit.prevent
      >
        <TgwFormItem prop="quantity">
          <TgwInput
            ref="quantityInputRef"
            v-model="formModel.quantity"
            maxlength="8"
            class="quantity-input-element"
            :class="{ 'is-error': showErrorMessage }"
            @keypress="onQuantityInput"
          />
        </TgwFormItem>
      </TgwForm>
      <span class="error-message">{{ errorMessage }}</span>
      <div class="quantity-input-buttons">
        <TgwButton
          v-for="number in 9"
          :key="number"
          plain
          class="quantity-input-button"
          @click="onNumberClick(number)"
          >{{ number }}</TgwButton
        >
        <TgwButton
          class="quantity-input-button button-zero"
          @click="onNumberClick(0)"
          >0</TgwButton
        >
        <TgwButton
          class="quantity-input-button button-clear"
          @click="onClearButtonClick"
          >C</TgwButton
        >
      </div>
    </div>
    <div class="quantity-input-footer">
      <IconButton
        icon="close"
        type="primary"
        plain
        class="close-button"
        @click="closeDialog"
      />
      <IconButton
        icon="tick"
        type="primary"
        class="submit-button"
        @click="confirmDialog"
      />
    </div>
  </TgwDialog>
</template>

<style scoped lang="scss">
:deep(.tgw-dialog) .tgw-dialog-header-icons {
  display: none;
}

.quantity-input-dialog {
  .tgw-dialog__header {
    flex-direction: column;
    align-items: flex-start;

    .quantity-input-title {
      font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
      font-weight: 700;
      font-size: 28px;
      letter-spacing: 1px;
      word-break: break-word;
    }

    .quantity-input-subtitle {
      font-size: 16px;
      line-height: 19px;
      color: var(--tgw-text-secondary);
    }
  }

  .quantity-input-content {
    .tgw-form-item {
      margin-bottom: 8px;
    }

    .error-message {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      min-height: 28px;
      font-weight: 300;
      font-size: 24px;
      line-height: 28px;
      text-align: right;
      color: var(--tgw-status-error);
      padding: 0 48px;
      box-sizing: border-box;
    }

    .quantity-input-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      padding: 32px 48px 64px;

      .quantity-input-button {
        height: 96px;
        width: 100%;
        margin: 0;
        font-weight: 300;
        font-size: 64px;
        line-height: 75px;
        box-shadow: var(--tgw-dropshadow-soft-elevated);
        border-radius: 8px;
        outline: 1px solid var(--tgw-line-10);
        background: var(--tgw-bg-40);
        color: var(--tgw-text-primary);

        &.button-zero {
          grid-column: 2 / 3;
        }

        &.button-clear {
          grid-column: 3 / 4;
          font-weight: 400;
          color: var(--tgw-text-primary-contrast);
          background: var(--tgw-icon-secondary);
        }
      }
    }

    :deep(.quantity-input-element) {
      box-shadow: none;
      background-color: transparent;
      border: none;
      border-bottom: 2px solid var(--tgw-line-00);
      border-radius: 0;
      padding: 0 48px;
      width: 100%;
      height: 88px;
      font-size: 88px;
      line-height: 88px;

      &.is-error {
        border-color: var(--tgw-status-error);
      }

      .tgw-input__text {
        height: 88px;
        font-size: 88px;
        line-height: 88px;
        text-align: right;
      }
    }
  }

  .quantity-input-footer {
    display: flex;
    padding: 0 48px 32px;
    height: 120px;
    column-gap: 24px;

    .close-button,
    .submit-button {
      height: 100%;
      width: 100%;
      margin: 0;
      border-radius: 12px;
    }

    .submit-button {
      // 2/3 - 24px gap between buttons + 16px grid gap to align with number buttons
      width: calc(66.6% - 24px + 16px);
    }

    .close-button {
      flex: 1;
      width: auto;
      border-width: 2px;
    }
  }
}

@media (max-height: 1064px) {
  .quantity-input-dialog {
    .quantity-input-content {
      .tgw-form-item {
        margin-bottom: 4px;
      }

      .error-message {
        min-height: 24px;
        font-size: 20px;
        line-height: 24px;
      }

      .quantity-input-buttons {
        padding: 28px 48px 56px;

        .quantity-input-button {
          height: 92px;
        }
      }
    }

    .quantity-input-footer {
      height: 112px;
    }
  }
}

@media (max-height: 870px) {
  .quantity-input-dialog {
    .quantity-input-content {
      .tgw-form-item {
        margin-bottom: 4px;
      }

      .error-message {
        min-height: 20px;
        font-size: 20px;
        line-height: 20px;
      }

      .quantity-input-buttons {
        padding: 20px 48px 48px;

        .quantity-input-button {
          height: 80px;
          font-size: 52px;
        }
      }

      :deep(.quantity-input-element) {
        height: 72px;
        font-size: 72px;
        line-height: 72px;

        .tgw-input__text {
          height: 72px;
          font-size: 72px;
          line-height: 72px;
        }
      }
    }

    .quantity-input-footer {
      height: 104px;
    }
  }
}
</style>

<style lang="scss">
.tgw-dialog.quantity-input-dialog {
  margin: 0;

  .tgw-dialog__header {
    flex-direction: column;
    align-items: flex-start;
    padding: 40px 48px 24px;
  }

  .tgw-dialog__body {
    padding: 0;
  }
}

@media (max-height: 1064px) {
  .tgw-dialog.quantity-input-dialog {
    .tgw-dialog__header {
      padding: 32px 48px 16px;
    }
  }
}
@media (max-height: 870px) {
  .tgw-dialog.quantity-input-dialog {
    .tgw-dialog__header {
      padding: 24px 48px 12px;
    }
  }
}
</style>
