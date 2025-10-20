<script setup lang="ts">
import { Ref, computed } from 'vue'
import {
  LoadCarrierType,
  LoadCarrierTypeType,
} from '@/types/Api/pcots/PcotsApiModel'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { useTranslations } from '@/composables/useTranslations'
import { PcotsLocationEnum } from '@/types/Api/pcots/PcotsApiModelEnums'

interface Props {
  isVisible: boolean
  loadCarrierTypes: LoadCarrierTypeType[]
  pcotsLocation: PcotsLocationEnum
  loadCarrier?: LoadCarrierType
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isVisible': [isVisible: boolean]
  convertLoadCarrier: [loadCarrierType: string]
}>()
const properties = toRefs(props)
const { getTranslation } = useTranslations('convert-load-carrier-dialog')

const dialogVisible = computed({
  get() {
    return properties.isVisible.value
  },
  set(newValue) {
    emit('update:isVisible', newValue)
  },
})

const closeDialog = () => {
  dialogVisible.value = false
}

const selectedLoadCarrierType: Ref<string> = ref<string>('')

const isContinueDisabled = computed(() => {
  return selectedLoadCarrierType.value === ''
})

const { isCompartmentEmpty } = useApiDataHelper()
const numberOfOccupiedCompartments = computed(() => {
  if (props.loadCarrier) {
    return props.loadCarrier.compartments.filter(
      (compartment) => !isCompartmentEmpty(compartment)
    ).length
  }
  return 0
})

const onConvertClicked = () => {
  emit('convertLoadCarrier', selectedLoadCarrierType.value)
  dialogVisible.value = false
}
defineExpose({ onConvertClicked })
</script>

<template>
  <TgwDialog
    v-model="dialogVisible"
    align-center
    class="convert-load-carrier-dialog"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :show-close="false"
    :lock-scroll="false"
    width="720px"
    :smart-overflow="false"
    @closed="selectedLoadCarrierType = ''"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-text">{{
          getTranslation(
            'convert_load_carrier_title',
            getTranslation(
              `${PcotsLocationEnum[pcotsLocation].toLowerCase()}_load_carrier`
            )
          )
        }}</span>
        <span class="dialog-header-description">
          {{ getTranslation('convert_load_carrier_description') }}
        </span>
      </div>
    </template>
    <template #default>
      <LoadCarrierTypeSelect
        v-model:selected-lc-type="selectedLoadCarrierType"
        :load-carrier-types="loadCarrierTypes"
        :number-of-occupied-compartments="numberOfOccupiedCompartments"
        :current-lc-type="loadCarrier?.loadCarrierType"
      />
    </template>
    <template #footer>
      <div class="dialog-footer">
        <TgwButton
          plain
          type="primary"
          class="dialog-button"
          @click="closeDialog"
        >
          {{ getTranslation('cancel') }}
        </TgwButton>
        <TgwButton
          type="primary"
          class="dialog-button"
          :disabled="isContinueDisabled"
          @click="onConvertClicked"
        >
          {{ getTranslation('convert') }}
        </TgwButton>
      </div>
    </template>
  </TgwDialog>
</template>

<style scoped lang="scss">
.tgw-dialog.convert-load-carrier-dialog {
  .tgw-dialog__header {
    .dialog-header {
      display: flex;
      flex-direction: column;

      .dialog-header-text {
        font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
        font-weight: 700;
        font-size: 28px;
        line-height: 37px;
        margin-bottom: 16px;
        letter-spacing: 1px;
      }
      .dialog-header-description {
        color: var(--tgw-text-secondary);
        font-size: 21px;
        font-weight: 400;
      }
    }
  }
  .tgw-dialog__footer {
    .dialog-footer {
      display: flex;
      gap: 24px;

      .dialog-button {
        width: 100%;
        height: 88px;
        border-radius: 8px;
        margin: 0;
        font-weight: 700;
        font-size: 24px;
        line-height: 28px;

        &.is-plain {
          border-width: 2px;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.tgw-dialog.convert-load-carrier-dialog {
  .tgw-dialog__header {
    padding: 40px 48px 32px;
    margin: 0;
  }
  .tgw-dialog__body {
    padding: 12px 24px;
  }
  .tgw-dialog__footer {
    padding: 40px 48px 32px;
  }
}
</style>
