<script setup lang="ts">
import { Ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { TgwMessageBox } from '@tgw-components/web'
import { MessageBoxOptionType } from '@tgw-components/web/dist/packages/core/src'
import {
  AdditionalDataKeyEnum,
  PcotsLocationEnum,
  WorkStationModeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import type {
  BarcodeDataType,
  ItemType,
  LoadCarrierType,
  LoadCarrierTypeType,
} from '@/types/Api/pcots/PcotsApiModel'
import { CompartmentType, TaskType } from '@/types/Api/pcots/PcotsApiModel'
import { Position } from '@/types/Position'
import { CompartmentInfo } from '@/types/CompartmentInfo'
import { ConsolidationModeEnum } from '@/types/ConsolidationModeEnum'
import { MessageBoxType } from '@/types/MessageBoxType'
import { LoadCarrierAction } from '@/types/LoadCarrierAction'
import { LoadCarrierEvent } from '@/types/LoadCarrierEvent'
import { CompartmentStyle } from '@/types/CompartmentStyle'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { TriggerCompartmentAnimationData } from '@/types/TriggerCompartmentAnimationData'
import { useTranslations } from '@/composables/useTranslations'
import { isDark } from '@/composables/useTheme'
import { CountedCompartmentsType } from '@/types/CountedCompartmentsType'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'
import { PcotsLocationType } from '@/types/PcotsLocationType'

const props = defineProps<Props>()
const emit = defineEmits<{
  activeCompartmentChanged: [compartment: CompartmentType | undefined]
  viewContentClicked: []
  identifyLoadCarrier: [loadCarrierNumber: string]
  loadCarrierAction: [params?: LoadCarrierEvent]
}>()

interface Props {
  pcotsLocation: PcotsLocationType
  loadCarrier?: LoadCarrierType
  task: TaskType | null | undefined
  position: Position
  scannedBarcodes: BarcodeDataType[]
  showZeroCrossing: boolean
  headerData?: string
  sendToReject?: boolean
  showModificationMenu?: boolean
  compartmentInfos?: CompartmentInfo[]
  consolidationMode?: ConsolidationModeEnum
  loadCarrierTypes: LoadCarrierTypeType[]
  isDriveThrough?: boolean
  workstationMode: WorkStationModeEnum
  countedCompartments: CountedCompartmentsType
  showViewContent?: boolean
  showDummyLoadCarrier: boolean
  isRovoflexPicking?: boolean
  appendDialogToBody?: boolean
}
const {
  getAdditionalDataValue,
  isMultiItem,
  getQuantityFromTask,
  getQuantityFromStocks,
  getItemFromTask,
  getCompartmentByTask,
} = useApiDataHelper()
const loadCarrierCompartmentsRef = ref()
const { getTranslation } = useTranslations('load-carrier')
const troubleshootingStore = useTroubleshootingStore()
const hasLoadCarrier = computed((): boolean => {
  return props.loadCarrier !== undefined
})
const isNoRead = computed((): boolean => {
  if (props.loadCarrier) {
    return !!getAdditionalDataValue(
      props.loadCarrier,
      AdditionalDataKeyEnum.IsNoRead
    )
  }
  return false
})
const showViewContentButton = computed(() => {
  return (
    hasLoadCarrier.value &&
    !props.showZeroCrossing &&
    !isNoRead.value &&
    props.showViewContent
  )
})
const loadCarrierNumber = computed(() => {
  if (isNoRead.value) {
    return `#${getTranslation('no_read')}`
  } else if (props.loadCarrier && !isNoRead.value) {
    return `#${props.loadCarrier.id}`
  }
  return undefined
})
const isViewContentButtonDisabled = computed(() => {
  return props.isRovoflexPicking || troubleshootingStore.hasProblemWithAbort()
})
const compartmentStyle = computed((): CompartmentStyle => {
  if (
    isMultiItem(props.loadCarrier?.compartments) &&
    props.consolidationMode === ConsolidationModeEnum.MANUAL
  ) {
    return CompartmentStyle.card
  } else {
    return CompartmentStyle.default
  }
})
const contentClasses = computed(() => {
  let classList = 'dashed-border'
  if (props.showDummyLoadCarrier) {
    return 'dummy-load-carrier'
  }
  if (hasLoadCarrier.value && !isNoRead.value) {
    return 'load-carrier-arrived'
  } else if (props.isDriveThrough) {
    classList += ' drive-through'
  }
  return classList
})
const viewContentText = computed(() => {
  return getTranslation('view_details')
})
const contentText = computed(() => {
  if (props.isDriveThrough) {
    return getTranslation('drive_through')
  } else {
    return getTranslation('waiting_for_load_carrier')
  }
})
const showModificationMenuComputed = computed(() => {
  return hasLoadCarrier.value && props.showModificationMenu
})
const modificationMenuClass = computed(() => {
  if (props.position === Position.left) {
    return Position.right
  } else if (props.position === Position.right) {
    return Position.left
  }
  return null
})
const loadCarrierOccupationText = computed(() => {
  let taskQuantity = 0
  let taskItem: ItemType | undefined
  let stockQuantity = 0
  if (props.task && props.loadCarrier) {
    const activeCompartment = getCompartmentByTask(
      props.pcotsLocation,
      props.loadCarrier,
      props.task
    )
    taskItem = getItemFromTask(props.task)
    taskQuantity = getQuantityFromTask(props.task, props.scannedBarcodes) ?? 0
    if (taskItem && activeCompartment) {
      stockQuantity = getQuantityFromStocks(activeCompartment.items, taskItem)
    }
  }
  if (props.pcotsLocation === PcotsLocationEnum.Target) {
    return stockQuantity + taskQuantity
  }
  return stockQuantity - taskQuantity
})

const showLoadCarrierOccupationIndicator = computed(() => {
  const { hasConfirmedError } = storeToRefs(useRovoflexStore())
  return hasConfirmedError.value
})

const sendLoadCarrierAway = () => {
  emit('loadCarrierAction', { loadCarrierAction: LoadCarrierAction.send_away })
}

const sendAwayDialogRef = ref<InstanceType<typeof TgwMessageBox> | null>(null)
const openSendAwayMessageBox = async () => {
  await sendAwayDialogRef.value?.show()
}

const onSendAwayLoadCarrierConfirm = () => {
  sendLoadCarrierAway()
}

const sendAwayMessageBoxConfigVariable: Ref<MessageBoxOptionType> = computed(
  () => {
    return {
      type: MessageBoxType.question,
      title: getTranslation('send_away_title'),
      dontShowAgain: true,
      okButton: {
        type: 'primary',
        label: getTranslation('send_away'),
        onOk: onSendAwayLoadCarrierConfirm,
      },
      cancelButton: {
        type: 'default',
        label: getTranslation('cancel'),
      },
      closeIcon: false,
    }
  }
)

const showConvertLoadCarrierDialog: Ref<boolean> = ref(false)
const openChangeTypeDialog = () => {
  showConvertLoadCarrierDialog.value = true
}

const convertLoadCarrier = (loadCarrierType: string) => {
  if (props.loadCarrier?.id) {
    emit('loadCarrierAction', {
      loadCarrierAction: LoadCarrierAction.change_load_carrier_type,
      loadCarrierType,
    })
  }
}

const identifyLoadCarrierNumber = (loadCarrierNumber: string) => {
  emit('identifyLoadCarrier', loadCarrierNumber.toString())
}

const onActiveCompartmentChanged = (
  compartment: CompartmentType | undefined
) => {
  emit('activeCompartmentChanged', compartment)
}
const viewContentClicked = () => {
  emit('viewContentClicked')
}
const triggerAnimation = (data: TriggerCompartmentAnimationData) => {
  if (loadCarrierCompartmentsRef.value) {
    loadCarrierCompartmentsRef.value.triggerAnimation(data)
  }
}

const animationLink = computed(() => {
  if (!isDark.value && !props.isDriveThrough) {
    return 'src/assets/animations/lottie/waiting_LC_animation_light.json'
  } else if (isDark.value && !props.isDriveThrough) {
    return 'src/assets/animations/lottie/waiting_LC_animation_dark.json'
  } else {
    return 'src/assets/animations/lottie/waiting_LC_animation_orange.json'
  }
})

defineExpose({ triggerAnimation })
</script>

<template>
  <div class="load-carrier">
    <div class="header">
      <LoadCarrierHeader
        v-if="!showDummyLoadCarrier"
        :pcots-location="pcotsLocation"
        :load-carrier="loadCarrier"
        :position="position"
        :header-data="!showZeroCrossing ? headerData : undefined"
        :no-read="isNoRead"
      />
      <div v-else class="load-carrier-header-placeholder" />
    </div>

    <div class="content" :class="contentClasses">
      <div
        v-if="showModificationMenuComputed"
        class="modification-menu-container"
        :class="modificationMenuClass"
      >
        <IconButton
          class="modification-button"
          icon="direction-up"
          plain
          type="primary"
          @click="openSendAwayMessageBox"
        />
        <IconButton
          class="modification-button"
          plain
          icon="settings-cog"
          type="primary"
          @click="openChangeTypeDialog"
        />
      </div>
      <div v-if="!hasLoadCarrier && !showDummyLoadCarrier" class="content-info">
        <LottieAnimation
          :key="animationLink"
          :auto-play="true"
          :loop="true"
          class="lottie-player"
          :animation-link="animationLink"
        />
        <span class="content-text">{{ contentText }}</span>
      </div>
      <div
        v-else-if="showDummyLoadCarrier"
        class="dummy-load-carrier-container"
      />
      <LoadCarrierNoRead
        v-else-if="isNoRead"
        @identify-load-carrier="identifyLoadCarrierNumber"
      />
      <div
        v-else-if="compartmentStyle === CompartmentStyle.card"
        class="compartment-cards"
      >
        <CompartmentCards
          :task="task"
          :compartments="loadCarrier?.compartments"
          :compartment-infos="compartmentInfos"
          @active-compartment-changed="onActiveCompartmentChanged"
        />
      </div>
      <template v-else>
        <LoadCarrierCompartments
          ref="loadCarrierCompartmentsRef"
          :load-carrier="loadCarrier"
          :pcots-location="pcotsLocation"
          :task="task"
          :scanned-barcodes="scannedBarcodes"
          :show-zero-crossing="showZeroCrossing"
          :compartment-infos="compartmentInfos"
          :consolidation-mode="consolidationMode"
          :counted-compartments="countedCompartments"
          @active-compartment-changed="onActiveCompartmentChanged"
        />
      </template>
      <CircleIndicator
        v-if="hasLoadCarrier && sendToReject"
        class="send-to-reject-information"
        :class="position"
        background-color="var(--pcots-warning-linear)"
        icon="direction-up"
        icon-size="48"
        color="rgba(13, 16, 20, 0.86)"
        :text="getTranslation('reject')"
      />
      <CircleIndicator
        v-if="
          task &&
          hasLoadCarrier &&
          !showZeroCrossing &&
          showLoadCarrierOccupationIndicator
        "
        class="load-carrier-occupation-indicator"
        :class="position"
        background-color="var(--tgw-primary-g)"
        icon="load-carrier"
        icon-size="40"
        color="var(--tgw-text-primary-contrast)"
        :text="loadCarrierOccupationText"
      />
    </div>
    <div v-if="showViewContentButton || loadCarrierNumber" class="footer">
      <IconButton
        v-if="showViewContentButton"
        plain
        type="primary"
        :disabled="isViewContentButtonDisabled"
        class="view-content-button"
        icon="visibility"
        :text="viewContentText"
        icon-alignment="left"
        @click="viewContentClicked"
      />
      <span
        v-if="loadCarrierNumber"
        class="load-carrier-number"
        :class="{ bottom: !showViewContentButton, 'no-read': isNoRead }"
        >{{ loadCarrierNumber }}</span
      >
    </div>
    <TgwMessageBox
      ref="sendAwayDialogRef"
      class="send-away-load-carrier-dialog"
      :options="sendAwayMessageBoxConfigVariable"
      :close-on-click-modal="false"
      is-touch
      :append-to-body="appendDialogToBody"
    >
      <template #default>
        <span class="send-away-description">
          {{ getTranslation('send_away_description_1') }}
          <b>{{
            getTranslation(PcotsLocationEnum[pcotsLocation].toLowerCase())
          }}</b>
          {{ getTranslation('send_away_description_2') }}
          <b>#{{ loadCarrier?.id }}</b>
          {{ getTranslation('send_away_description_3') }}
        </span>
      </template>
    </TgwMessageBox>
    <!--suppress TypeScriptValidateTypes-->
    <ConvertLoadCarrierDialog
      v-model:is-visible="showConvertLoadCarrierDialog"
      :load-carrier-types="loadCarrierTypes"
      :pcots-location="pcotsLocation"
      :load-carrier="loadCarrier"
      @convert-load-carrier="convertLoadCarrier"
    />
  </div>
</template>

<style scoped lang="scss">
.tgw-message-box {
  &.send-away-load-carrier-dialog {
    .tgw-dialog__body {
      .send-away-description {
        color: var(--tgw-text-secondary);
        font-size: 21px;
        margin-top: 24px;
        padding: 0 140px;
        text-align: center;
        word-break: break-word;
      }
    }
  }
}

.load-carrier {
  display: flex;
  flex-direction: column;
  align-items: center;
  //65vh - view-content-button height
  max-width: calc(65vh - 54px);
  width: 100%;

  .header {
    width: 100%;
  }

  .load-carrier-header-placeholder {
    height: var(--pcots-load-carrier-headline-height);
  }

  .content {
    width: 100%;
    aspect-ratio: var(--pcots-lc-aspect-ratio);
    padding: 24px;
    border-radius: 8px;
    box-sizing: border-box;
    position: relative;

    .modification-menu-container {
      $offset: 100%;
      position: absolute;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: flex-end;
      height: 100%;
      width: 96px;
      top: 0;

      :deep(.modification-button.icon-button) {
        box-shadow: var(--tgw-dropshadow-intense-elevated);
        border-color: var(--pcots-stroke-deep-effect);
        background-color: var(--pcots-bg-action-button-default);
        outline: 0;
        width: 100%;
        height: 34%;
      }

      &.left {
        right: $offset;

        :deep(.modification-button.icon-button) {
          border-radius: 8px 0 0 8px;
          border-width: 1px 1px 0 0;
        }
      }

      &.right {
        left: $offset;

        :deep(.modification-button.icon-button) {
          border-radius: 0 8px 8px 0;
          border-width: 1px 0 0 1px;
        }
      }
    }

    .content-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .content-text {
        font-size: 28px;
        line-height: 33px;
        font-weight: 400;
        color: var(--tgw-icon-fallback);
        user-select: none;
      }

      .lottie-animation-container {
        --img-size: 16vw;
        --max-img-size: 218px;
        width: var(--img-size);
        height: var(--img-size);
        max-width: var(--max-img-size);
        max-height: var(--max-img-size);
        //Workaround, because lottie image is to dark
        opacity: 80%;
      }
    }

    &.dashed-border {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 6px dashed var(--tgw-line-30);

      &.drive-through {
        border-color: var(--tgw-status-warning);
      }
    }

    &.load-carrier-arrived {
      box-shadow: var(--tgw-dropshadow-medium);
      border-radius: 8px;
      background: var(--pcots-bg-load-carrier-frame);
    }

    &.dummy-load-carrier {
      border-radius: 8px;
      background: var(--pcots-bg-load-carrier-frame);

      .dummy-load-carrier-container {
        box-sizing: border-box;
        aspect-ratio: var(--pcots-lc-aspect-ratio);
        width: 100%;
        height: 100%;
        background: var(--tgw-bg-10);
        border-radius: 4px;
        border: 3px solid var(--pcots-stroke-deep-effect);
      }
    }

    :deep(.send-to-reject-information),
    :deep(.load-carrier-occupation-indicator) {
      width: 100px;
      height: 100px;
      position: absolute;
      z-index: 2;
    }

    :deep(.send-to-reject-information) {
      gap: 4px;

      &.left {
        top: -50px;
        right: -36px;
      }
      &.right {
        top: -50px;
        left: -36px;
      }

      .circle-indicator-text {
        font-weight: 700;
        font-size: 20px;
        line-height: 18px;
        margin-bottom: 8px;
      }
    }

    :deep(.load-carrier-occupation-indicator) {
      flex-direction: column-reverse;

      &.left {
        bottom: -50px;
        right: -36px;
      }
      &.right {
        bottom: -50px;
        left: -36px;
      }
    }
  }

  .footer {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;

    .view-content-button {
      height: 54px;
      font-weight: 700;
      font-size: 16px;
      line-height: 19px;
      border-width: 2px;
      margin-bottom: 20px;
    }

    .load-carrier-number {
      color: var(--tgw-text-primary);
      font-size: 24px;
      font-weight: 700;
      line-height: 150%;
      letter-spacing: 1px;
      position: absolute;
      top: 74px;

      &.bottom {
        top: 0;
      }

      &.no-read {
        color: var(--tgw-status-error);
      }
    }
  }
}
</style>

<style lang="scss">
.tgw-dialog-mask {
  .tgw-message-box.send-away-load-carrier-dialog {
    .tgw-dialog__body {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
