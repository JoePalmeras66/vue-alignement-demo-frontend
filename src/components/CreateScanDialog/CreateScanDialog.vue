<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import type { FormRules } from '@tgw-components/core'
import { useLogger } from '@tgw-components/core'
import { onKeyPressed } from '@vueuse/core'
import { InternalRuleItem } from 'async-validator'
import { BarcodeDataType, TaskType } from '@/types/Api/pcots/PcotsApiModel'
import { useItemScanValidator } from '@/composables/useItemScanValidator/useItemScanValidator'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { useTranslations } from '@/composables/useTranslations'
import { BarcodeTypeEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import {
  CreateScanModelKeyFormat,
  CreateScanModelRecordType,
  getBarcodeTypeFromKey,
} from '@/types/CreateScanModelKeyFormat'

interface Props {
  isVisible: boolean
  task?: TaskType
  createScanModel: CreateScanModelRecordType
}
const props = defineProps<Props>()
const emit = defineEmits(['update:isVisible', 'continue'])

const { getBarcodesFromTask, getVerifyBarcodeFromTask, getCreateScanModelKey } =
  useApiDataHelper()
const { createScanModel: createScanModelRef, isVisible: isVisibleRef } =
  toRefs(props)
const { validateItemScan, validateSingleItemScan } = useItemScanValidator()
const isValid = ref<boolean>(true)
const backendErrorMessageTranslated = ref<string | undefined>(undefined)
const ruleFormRef = ref<FormInstance>()
const { getTranslation } = useTranslations('create-scan-dialog')
const logger = useLogger()
const inputRefs = ref<Record<CreateScanModelKeyFormat, HTMLInputElement>>({})
const isContinueExecuting = ref<boolean>(false)

const dialogVisible = computed({
  get() {
    return isVisibleRef.value
  },
  set(newValue) {
    emit('update:isVisible', newValue)
  },
})
interface BarcodeConfigurationType {
  barcodeType: BarcodeTypeEnum
  key: CreateScanModelKeyFormat
}
const barcodeConfigurations = computed((): BarcodeConfigurationType[] => {
  const barcodes = getBarcodesFromTask(props.task as TaskType)
  const result: BarcodeConfigurationType[] = []

  if (barcodes) {
    for (const barcode of barcodes) {
      result.push({
        barcodeType: barcode.barcodeType,
        key: getCreateScanModelKey(barcodes, barcode),
      })
    }
  }
  return result
})

const isBackendValidation = computed(() => {
  return getVerifyBarcodeFromTask(props.task as TaskType)
})

const isContinueDisabled = computed((): boolean => {
  let isDisabled =
    !!barcodeConfigurations.value &&
    barcodeConfigurations.value.length !==
      Object.keys(createScanModelRef.value).length &&
    !isValid.value
  if (!isDisabled && barcodeConfigurations.value) {
    barcodeConfigurations.value.forEach((barcode) => {
      const barcodeValue = createScanModelRef.value[barcode.key]
      if (!barcodeValue || barcodeValue === '') {
        isDisabled = true
      }
    })
  }
  return isDisabled
})

const createdScanBarcodeData = computed((): BarcodeDataType[] => {
  const barcodeData: BarcodeDataType[] = []
  Object.entries(createScanModelRef.value).forEach(([key, value]) => {
    const barcodeType = getBarcodeTypeFromKey(key as CreateScanModelKeyFormat)
    barcodeData.push({
      barcodeType,
      barcode: value,
    })
  })
  return barcodeData
})
const errorText = computed(() => {
  let scanFields = ''
  Object.keys(createScanModelRef.value).forEach((key: string) => {
    if (scanFields !== '') {
      scanFields += ', '
    }
    scanFields += getBarcodeTypeFromKey(
      key as CreateScanModelKeyFormat
    ).toUpperCase()
  })
  if (isBackendValidation.value && backendErrorMessageTranslated.value) {
    return backendErrorMessageTranslated.value
  } else {
    return getTranslation('error_message', scanFields)
  }
})
const resetAllFields = () => {
  Object.keys(createScanModelRef.value).forEach((key) => {
    delete createScanModelRef.value[key as CreateScanModelKeyFormat]
  })
}
const resetCreatedScan = () => {
  isValid.value = true
  resetAllFields()
}

const barcodeValidator = (
  rule: InternalRuleItem,
  value: any,
  callback: any
) => {
  if (isBackendValidation.value) {
    callback()
  }
  const key = rule.field as CreateScanModelKeyFormat
  const barcodeType = getBarcodeTypeFromKey(key)

  logger.info('Validate', barcodeType, 'with value', value)

  if (props.task) {
    const validationResult = validateSingleItemScan(props.task, {
      barcode: value,
      barcodeType,
    })
    if (validationResult.isValid) {
      callback()
    } else {
      callback(
        new Error(
          getTranslation(
            'error_message_field',
            BarcodeTypeEnum[barcodeType].toUpperCase()
          )
        )
      )
    }
  }
}

const formRules = computed(() => {
  const result: FormRules = {}
  for (const barcodeConfiguration of barcodeConfigurations.value) {
    result[barcodeConfiguration.key] = [
      { validator: barcodeValidator, trigger: 'blur' },
    ]
  }
  return result
})

const closeDialog = () => {
  dialogVisible.value = false
  resetCreatedScan()
}

const selectInput = (key: CreateScanModelKeyFormat) => {
  inputRefs.value[key]?.select()
}

const selectFirstInput = () => {
  selectInput(Object.keys(inputRefs.value)[0] as CreateScanModelKeyFormat)
}

const onContinueClicked = async () => {
  try {
    if (isContinueDisabled.value || isContinueExecuting.value) {
      return
    }
    isContinueExecuting.value = true

    // Only backend validation will be done here with all scans
    if (props.task) {
      if (isBackendValidation.value) {
        const validationResult = await validateItemScan(
          props.task,
          createdScanBarcodeData.value
        )
        backendErrorMessageTranslated.value =
          validationResult.errorMessageTranslated
        isValid.value = validationResult.isValid
        if (!isValid.value) {
          return
        }
      } else if (ruleFormRef.value) {
        // Do client side form validation
        let valid
        try {
          valid = await ruleFormRef.value.validate()
        } catch (error) {
          valid = false
        }
        if (!valid) {
          return
        }
      }
    }

    emit('continue', createdScanBarcodeData.value)
    closeDialog()
  } finally {
    isContinueExecuting.value = false
  }
}

watch(isVisibleRef, async () => {
  if (isVisibleRef.value) {
    // Focus with timeout as next tick does not work properly
    setTimeout(() => {
      selectFirstInput()
    }, 100)
  }
})
onKeyPressed('Enter', (e) => {
  if (
    isContinueDisabled.value ||
    isContinueExecuting.value ||
    (e.target as HTMLElement).className.includes('cancel')
  ) {
    return
  }
  e.preventDefault()
  onContinueClicked()
})
</script>

<template>
  <TgwDialog
    v-model="dialogVisible"
    align-center
    class="scan-dialog"
    :destroy-on-close="true"
    :close-icon="false"
    width="600px"
    :smart-overflow="false"
    @close="closeDialog"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-text">{{
          getTranslation('create_scan')
        }}</span>
      </div>
    </template>
    <template #default>
      <div class="dialog-body">
        <TgwForm
          ref="ruleFormRef"
          :model="createScanModelRef"
          class="create-scan-form"
          :class="{ 'is-invalid': !isValid && isBackendValidation }"
          :rules="formRules"
          @submit.prevent="onContinueClicked"
        >
          <TgwFormItem
            v-for="barcodeConfiguration in barcodeConfigurations"
            :key="barcodeConfiguration.key"
            class="create-scan-item"
            :label="BarcodeTypeEnum[barcodeConfiguration.barcodeType]"
            :prop="barcodeConfiguration.key"
          >
            <TgwInput
              :ref="
                (el:HTMLInputElement) => {
                  inputRefs[barcodeConfiguration.key] = el
                }
              "
              v-model="createScanModelRef[barcodeConfiguration.key]"
              class="barcode-text"
            />
          </TgwFormItem>
        </TgwForm>
        <Transition name="slide">
          <div v-if="isBackendValidation && !isValid" class="error-container">
            <TgwIcon
              class="error-icon"
              icon="status-error-circle"
              color="var(--tgw-status-error)"
            />
            <span class="error-text">{{ errorText }}</span>
          </div>
        </Transition>
      </div>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <TgwButton
          plain
          type="primary"
          class="dialog-button cancel"
          @click="closeDialog"
        >
          {{ getTranslation('cancel') }}
        </TgwButton>
        <TgwButton
          class="dialog-button continue"
          :disabled="isContinueDisabled"
          :loading="isContinueExecuting"
          @click="onContinueClicked"
        >
          {{ getTranslation('continue') }}
        </TgwButton>
      </div>
    </template>
  </TgwDialog>
</template>

<style scoped lang="scss">
.scan-dialog {
  .dialog-header {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .dialog-header-text {
      font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
      font-size: 28px;
      line-height: 37px;
      letter-spacing: 1px;
      font-weight: 700;
      user-select: none;
    }

    .dialog-header-description {
      color: var(--tgw-text-secondary);
      font-size: 21px;
      line-height: 24px;
    }
  }

  .dialog-body {
    display: flex;
    flex-direction: column;
    align-items: center;

    .create-scan-form {
      display: flex;
      flex-direction: column;
      width: 100%;

      .create-scan-item {
        display: flex;
        flex-direction: column;

        :deep(.tgw-form-item__label) {
          justify-content: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 20px;
          color: var(--tgw-text-primary);
          text-transform: uppercase;
        }

        .barcode-text {
          height: 60px;
          font-size: 24px;
          line-height: 16px;
          width: 100%;
          color: var(--tgw-text-primary);
          border-color: var(--tgw-line-10);
        }
      }
    }

    .error-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
      gap: 16px;

      .error-icon {
        --error-icon-size: 48px;
        width: var(--error-icon-size) !important;
        height: var(--error-icon-size) !important;

        :deep(svg) {
          width: var(--error-icon-size);
          height: var(--error-icon-size);
        }
      }

      .error-text {
        word-break: normal;
        color: var(--tgw-status-error);
        font-weight: 400;
        font-size: 20px;
        line-height: 23px;
      }
    }
    .slide-leave-active,
    .slide-enter-active {
      transition: all 0.8s;
    }

    .slide-enter-from,
    .slide-leave-to {
      max-height: 0;
      opacity: 0;
    }

    .slide-enter-to {
      max-height: 100px;
    }
  }

  .dialog-footer {
    display: flex;
    column-gap: 14px;

    .dialog-button {
      font-size: 24px;
      line-height: 28px;
      font-weight: 700;
      border-radius: 8px;
      width: 100%;
      height: 80px !important;
    }
  }
}
</style>

<style lang="scss">
.scan-dialog {
  .tgw-dialog__header {
    word-break: normal;
    padding: 40px 48px;
  }

  .tgw-dialog__body {
    padding: 0 48px;
  }

  .tgw-dialog__footer {
    padding: 61px 48px 32px;
  }
}
</style>
