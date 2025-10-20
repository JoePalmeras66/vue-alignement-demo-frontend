<script setup lang="ts">
import { onKeyPressed } from '@vueuse/core'
import { CompartmentInfo } from '@/types/CompartmentInfo'
import {
  BarcodeDataType,
  LoadCarrierType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { ScanModificationMode } from '@/types/ScanModificationMode'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { useTranslations } from '@/composables/useTranslations'
import {
  BarcodeTypeEnum,
  PcotsLocationEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'

const props = defineProps<Props>()
const emit = defineEmits(['update:isVisible', 'confirm'])
const { getItemFromTask } = useApiDataHelper()
interface Props {
  isVisible: boolean
  mode: ScanModificationMode
  task?: TaskType
  loadCarrier?: LoadCarrierType
  barcodes: BarcodeDataType[]
  compartmentInfos?: CompartmentInfo[]
}
const properties = toRefs(props)
const { getTranslation } = useTranslations('scan-hint-dialog')
const workspaceStore = useWorkspaceStore()
const loadCarrierStore = useLoadCarrierStore()

const dialogVisible = computed({
  get() {
    return properties.isVisible.value
  },
  set(newValue) {
    emit('update:isVisible', newValue)
  },
})
const headerText = computed(() => {
  if (props.mode === ScanModificationMode.create) {
    return getTranslation('create_header')
  } else if (props.mode === ScanModificationMode.delete) {
    return getTranslation('delete_header')
  }
})
const headerDescription = computed(() => {
  if (
    props.loadCarrier &&
    props.loadCarrier.compartments &&
    props.loadCarrier.compartments.length > 1
  ) {
    if (props.mode === ScanModificationMode.create) {
      return getTranslation('create_scan_sector_description')
    } else if (props.mode === ScanModificationMode.delete) {
      return getTranslation('delete_scan_sector_description')
    }
  } else {
    if (props.mode === ScanModificationMode.create) {
      return getTranslation('create_scan_description')
    } else if (props.mode === ScanModificationMode.delete) {
      return getTranslation('delete_scan_description')
    }
  }
})
const loadCarrierDescription = computed(() => {
  if (
    props.loadCarrier &&
    props.loadCarrier.compartments &&
    props.loadCarrier.compartments.length > 1
  ) {
    if (props.mode === ScanModificationMode.create) {
      return ` ${getTranslation('target_sector')}:`
    } else if (props.mode === ScanModificationMode.delete) {
      return ` ${getTranslation('source_sector')}:`
    }
  }
  if (props.mode === ScanModificationMode.create) {
    return ` ${getTranslation('target_desc')}:`
  } else if (props.mode === ScanModificationMode.delete) {
    return ` ${getTranslation('source_desc')}:`
  }
})
const pcotsLocation = computed(() => {
  if (props.mode === ScanModificationMode.create) {
    return PcotsLocationEnum.Target
  }
  return PcotsLocationEnum.Source
})
const itemData = computed(() => {
  const { getItemByGtin } = useApiDataHelper()

  if (props.task) {
    const itemFromTask = getItemFromTask(props.task)
    if (itemFromTask) {
      return itemFromTask
    } else {
      // Cycle count - searches item with last scanned gtin in the sourceLoadCarrier
      const sourceLoadCarrier = loadCarrierStore.sourceLoadCarrier
      const scannedGtin = props.barcodes.find(
        (barcode) => barcode.barcodeType === BarcodeTypeEnum.Gtin
      )

      return getItemByGtin(
        sourceLoadCarrier?.compartments,
        scannedGtin?.barcode
      )
    }
  }
})
const loadCarrierHeaderText = computed(() => {
  return getTranslation(PcotsLocationEnum[pcotsLocation.value].toLowerCase())
})
const positionClass = computed(() => {
  if (props.mode === ScanModificationMode.create) {
    return !workspaceStore.isRightToLeft() ? 'right' : 'left'
  } else if (props.mode === ScanModificationMode.delete) {
    return !workspaceStore.isRightToLeft() ? 'left' : 'right'
  }
})
const closeDialog = () => {
  dialogVisible.value = false
}
const onConfirmClicked = () => {
  emit('confirm')
  closeDialog()
}
const onCancelClicked = () => {
  closeDialog()
}

onKeyPressed(
  ['Enter'],
  (e) => {
    if (
      dialogVisible.value &&
      !(e.target as HTMLElement).className.includes('cancel')
    ) {
      onConfirmClicked()
      e.preventDefault()
    }
  },
  {
    target: document,
  }
)

defineExpose({ itemData, closeDialog })
</script>

<template>
  <TgwDialog
    v-model="dialogVisible"
    class="scan-hint-dialog"
    :destroy-on-close="true"
    :show-close="false"
    :lock-scroll="false"
    width="1120px"
    :smart-overflow="false"
    @close="closeDialog"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-header-text">{{ headerText }}</span>
        <div class="dialog-header-description-container">
          <span class="dialog-header-description">{{ headerDescription }}</span>
          <span class="dialog-header-description highlighted">{{
            loadCarrierDescription
          }}</span>
        </div>
      </div>
    </template>
    <template #default>
      <div class="dialog-body">
        <div class="scan-information" :class="positionClass">
          <div class="scan-details-container">
            <span class="header-text">{{ getTranslation('item') }}</span>
            <ScanDetails
              v-if="dialogVisible"
              class="scan-details"
              :barcodes="barcodes"
              :item="itemData"
              :task="task"
            />
          </div>
          <TgwIcon
            icon="arrow-right-1"
            class="arrow-icon"
            color="var(--tgw-icon-sub)"
            :class="positionClass"
          />
          <div class="header-compartment-container">
            <span class="header-text">{{ loadCarrierHeaderText }}</span>
            <div v-if="loadCarrier && task" class="compartments-container">
              <LoadCarrierCompartments
                :hide-details="true"
                :load-carrier="loadCarrier"
                :task="task"
                :pcots-location="pcotsLocation"
                :show-zero-crossing="false"
                :compartment-infos="compartmentInfos"
                :scanned-barcodes="barcodes"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <TgwButton
          type="primary"
          class="dialog-button cancel"
          plain
          @click="onCancelClicked"
        >
          {{ getTranslation('cancel') }}
        </TgwButton>
        <TgwButton
          type="primary"
          class="dialog-button confirm"
          @click="onConfirmClicked"
        >
          {{ getTranslation('confirm') }}
        </TgwButton>
      </div>
    </template>
  </TgwDialog>
</template>

<style scoped lang="scss">
.scan-hint-dialog {
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
      font-weight: 400;

      &.highlighted {
        font-weight: 700;
      }
    }
  }

  .dialog-body {
    .scan-information {
      display: flex;
      flex-direction: row;
      gap: 54px;
      align-items: stretch;

      &.left {
        flex-direction: row-reverse;
      }

      &.right {
        flex-direction: row;
      }

      .scan-details-container {
        display: flex;
        flex-direction: column;
        //50% - 53px gap
        width: calc(50% - 53px);

        .header-text {
          align-self: center;
          font-weight: 700;
          font-size: 20px;
          line-height: 23px;
          color: var(--tgw-text-primary);
          margin-bottom: 16px;
          visibility: hidden;
        }

        .scan-details {
          background-color: var(--tgw-bg-40);
          height: 100%;
        }
      }

      .arrow-icon {
        align-self: center;
        //Height of header
        margin-top: 39px;
        margin-bottom: 12px;
        --arrow--icon-width: 48px;
        width: var(--arrow--icon-width) !important;
        height: var(--arrow--icon-width) !important;

        :deep(svg) {
          width: var(--arrow--icon-width);
          height: var(--arrow--icon-width);
        }

        &.left {
          transform: rotate(-180deg);
        }
      }

      .header-compartment-container {
        display: flex;
        flex-direction: column;
        //50% - 53px gap
        width: calc(50% - 53px);

        .header-text {
          align-self: center;
          font-weight: 700;
          font-size: 20px;
          line-height: 23px;
          color: var(--tgw-text-primary);
          margin-bottom: 16px;
        }

        .compartments-container {
          aspect-ratio: var(--pcots-lc-aspect-ratio);
          padding: 12px;
          border-radius: 8px;
          box-sizing: border-box;
          box-shadow: var(--tgw-dropshadow-medium);
          background: var(--pcots-bg-load-carrier-frame);

          :deep(.load-carrier-compartments) {
            .lc-compartment {
              &.active {
                border: 8px solid var(--tgw-primary);
              }
            }
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;

    .dialog-button + .dialog-button {
      margin-left: 24px;
    }

    .dialog-button {
      font-size: 28px;
      font-weight: 500;
      border-radius: 8px;
      width: 50%;
      height: 80px;
    }
  }
}
</style>

<style lang="scss">
.tgw-dialog.scan-hint-dialog {
  background-color: var(--tgw-bg-20);
  .tgw-dialog__header {
    word-break: normal;
    padding: 40px 48px;
  }

  .tgw-dialog__body {
    padding: 0 48px;
  }

  .tgw-dialog__footer {
    padding: 52px 48px 32px;
  }
}
</style>
