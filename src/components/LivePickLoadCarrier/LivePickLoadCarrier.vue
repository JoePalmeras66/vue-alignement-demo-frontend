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

const props = defineProps<PropsLivePickLoadCarrier>()
const emit = defineEmits<{
  activeCompartmentChanged: [compartment: CompartmentType | undefined]
  viewContentClicked: []
  identifyLoadCarrier: [loadCarrierNumber: string]
  loadCarrierAction: [params?: LoadCarrierEvent]
}>()

export interface PropsLivePickLoadCarrier {
  headerTextOverride?: string
  pcotsLocation: PcotsLocationType
  loadCarrier?: LoadCarrierType
  task: TaskType | null | undefined
  position: Position
  headerTextSize?: string | undefined
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
  showLoadCarrierHeader?: boolean
  showLoadCarrierNumber?: boolean
  showLoadCarrierHeaderItems?: boolean
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

const cssVars = computed(
  () =>
    ({
      '--lc-header-text-size': props.headerTextSize,
    } as Record<string, string>)
)

defineExpose({ triggerAnimation })
</script>

<template>
  <div class="load-carrier" :class="`position-${position}`">
    <div v-if="showLoadCarrierHeader" class="header">
      <LivePickLoadCarrierHeader
        v-if="!showDummyLoadCarrier"
        :pcots-location="pcotsLocation"
        :load-carrier="loadCarrier"
        :position="position"
        :header-text-override="headerTextOverride"
        :header-data="!showZeroCrossing ? headerData : undefined"
        :no-read="isNoRead"
        :show-load-carrier-header-items="showLoadCarrierHeaderItems"
        :style="cssVars"
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
        v-if="loadCarrierNumber && showLoadCarrierNumber"
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
@use '@/styles/load-carrier' as *;
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
</style>

<style lang="scss">
@use '@/styles/load-carrier' as *;
.tgw-dialog-mask {
  .tgw-message-box.send-away-load-carrier-dialog {
    .tgw-dialog__body {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
