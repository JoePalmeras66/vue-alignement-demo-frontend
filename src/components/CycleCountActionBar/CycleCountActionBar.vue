<script setup lang="ts">
import { TgwIcon, TgwMessageBox } from '@tgw-components/web'

import { computed } from 'vue'
import { MessageBoxOptionType } from '@tgw-components/core'
import { ButtonAction } from '@/types/ButtonAction'
import {
  BarcodeDataType,
  CompartmentType,
  CycleCountTaskType,
  MultiItemCycleCountTaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { DisabledButton } from '@/types/DisabledButton'
import { generalHelpers } from '@/helpers/generalHelpers'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { useTranslations } from '@/composables/useTranslations'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'
import { MessageBoxType } from '@/types/MessageBoxType'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { CycleCountState } from '@/types/CycleCountState'

interface Props {
  task?: CycleCountTaskType | MultiItemCycleCountTaskType
  scannedBarcodes: BarcodeDataType[]
  disabledButtons: DisabledButton[]
  showScanError: boolean
  appendToBody?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  actionButtonClicked: [buttonAction: ButtonAction]
}>()
const properties = toRefs(props)
const { getTranslation } = useTranslations('cycle-count-action-bar')
const { getTranslation: getActionBarTranslation } =
  useTranslations('action-bar-texts')
const emptyCompartmentMessageBoxRef = ref<InstanceType<
  typeof TgwMessageBox
> | null>(null)
const scanActionIcon = ref<string>()
const troubleshootingStore = useTroubleshootingStore()
const taskStore = useTaskStore()
const hasTask = computed(() => {
  return props.task !== undefined
})
const areAllButtonsDisabled = computed((): boolean => {
  return props.disabledButtons.includes(DisabledButton.all)
})
const isAdvancedViewDisabled = computed(() => {
  return (
    !hasTask.value ||
    areAllButtonsDisabled.value ||
    troubleshootingStore.hasProblemWithAbort() ||
    props.disabledButtons.includes(DisabledButton.advanced_view)
  )
})

const {
  isScanningRequired,
  isScanEach,
  isScanOnce,
  isMultiItemCycleCountTask,
} = useApiDataHelper()
const isCreateScanVisible = computed(() => {
  return props.task && isScanningRequired(props.task)
})
const isCreateScanDisabled = computed(() => {
  return (
    areAllButtonsDisabled.value ||
    troubleshootingStore.hasProblemWithAbort() ||
    props.disabledButtons.includes(DisabledButton.create_scan)
  )
})

const hasCountedAllCompartmentsAfterwards = (
  compartments: CompartmentType[]
) => {
  // filter multiple compartments
  const sourceLoadCarrierCompartmentAmount = compartments.filter(
    (comp, index) => compartments.findIndex((co) => co.id === comp.id) === index
  )
  // if amount of counted compartments is larger or equal to compartments.length - 1
  return (
    Object.keys(taskStore.cycleCountCountedCompartments).length >=
    sourceLoadCarrierCompartmentAmount.length - 1
  )
}

const hasOnlyOneCompartmentInTodo = () => {
  const loadCarrierStore = useLoadCarrierStore()
  if (loadCarrierStore.sourceLoadCarrier?.compartments) {
    const compartmentsTodo =
      loadCarrierStore.sourceLoadCarrier?.compartments?.filter(
        (comp) => comp.cycleCountState !== CycleCountState.finished
      )
    return compartmentsTodo.length <= 1
  }
  return false
}

const willAllCompartmentsBeCountedAfterConfirm = () => {
  let allCounted = false
  const loadCarrierStore = useLoadCarrierStore()
  if (loadCarrierStore.sourceLoadCarrier?.compartments) {
    if (props.task && isMultiItemCycleCountTask(props.task)) {
      allCounted = hasCountedAllCompartmentsAfterwards(
        loadCarrierStore.sourceLoadCarrier.compartments
      )
    } else {
      allCounted = hasOnlyOneCompartmentInTodo()
    }
  }
  return allCounted
}

const showConfirmAndSendButton = computed(() => {
  if (props.task) {
    return props.task && willAllCompartmentsBeCountedAfterConfirm()
  }
  return false
})
const confirmButtonIcon = computed(() => {
  if (troubleshootingStore.hasProblemWithAbort()) {
    return 'paper-fly'
  } else if (showConfirmAndSendButton.value) {
    return 'direction-up'
  }
  return 'count-validation'
})
const confirmButtonLabel = computed(() => {
  if (troubleshootingStore.isTargetFullOnly()) {
    return getActionBarTranslation('send_target')
  } else if (troubleshootingStore.hasProblemWithAbort()) {
    return getActionBarTranslation('send_to_reject')
  } else if (showConfirmAndSendButton.value) {
    return getTranslation('confirm_and_send')
  }
  return getTranslation('confirm_count')
})
const isConfirmDisabled = computed(() => {
  return (
    !hasTask.value ||
    areAllButtonsDisabled.value ||
    props.disabledButtons.includes(DisabledButton.confirm)
  )
})

const problemButtonType = computed(() => {
  if (troubleshootingStore.getOverallProblemCount > 0) {
    return 'accent'
  }

  return 'primary'
})
const problemButtonLabel = computed(() => {
  if (troubleshootingStore.getOverallProblemCount > 0) {
    return getActionBarTranslation(
      'n_problems_saved',
      troubleshootingStore.getOverallProblemCount
    )
  }

  return getActionBarTranslation('report_problem')
})
const isReportProblemDisabled = computed(() => {
  return (
    !hasTask.value ||
    areAllButtonsDisabled.value ||
    props.disabledButtons.includes(DisabledButton.report_problem)
  )
})

const showScanActionIcon = computed(() => {
  if (props.task) {
    return isScanningRequired(props.task)
  }
  return false
})

// checks if the animation of the scan indicator has ended
const hasAnimationEnded = ref(true)
const showScanPlaceholder = computed(() => {
  return !showScanActionIcon.value && hasAnimationEnded.value
})

const scanPercentage = ref(0)
let timeout: ReturnType<typeof setTimeout>
watch(
  properties.scannedBarcodes,
  async () => {
    if (props.task) {
      if (isScanEach(props.task) && props.scannedBarcodes.length > 0) {
        scanPercentage.value = 100
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          scanPercentage.value = 0
        }, 800)
      } else if (isScanOnce(props.task) && props.scannedBarcodes.length > 0) {
        scanPercentage.value = 100
      } else {
        scanPercentage.value = 0
      }
    }
  },
  { deep: true, immediate: true }
)

const scanActionIconColor = computed(() => {
  if (properties.showScanError.value) {
    return 'var(--tgw-status-error)'
  } else if (scanPercentage.value === 100) {
    return 'var(--tgw-status-success)'
  }
  return 'var(--tgw-primary)'
})

const isButtonDisabled = (buttonAction: ButtonAction) => {
  switch (buttonAction) {
    case ButtonAction.advanced_view:
      return isAdvancedViewDisabled.value
    case ButtonAction.create_scan:
      return isCreateScanDisabled.value
    case ButtonAction.confirm:
      return isConfirmDisabled.value
    case ButtonAction.report_problem:
      return isReportProblemDisabled.value
  }
}

const emptyCompartmentMessageBoxConfig = computed(() => {
  return {
    type: MessageBoxType.question,
    title: getTranslation('empty_compartment_message_box_title'),
    description: getTranslation('empty_compartment_message_box_description'),
    dontShowAgain: false,
    okButton: {
      label: getActionBarTranslation('confirm'),
      type: 'primary',
    },
    cancelButton: {
      label: getActionBarTranslation('cancel'),
      type: 'default',
    },
    closeIcon: false,
  } as MessageBoxOptionType
})

const buttonClicked = async (buttonAction: ButtonAction) => {
  if (isButtonDisabled(buttonAction)) {
    return
  }

  if (buttonAction === ButtonAction.confirm) {
    if (
      !taskStore.hasCycleCountedQuantities() &&
      !troubleshootingStore.hasProblemWithAbort()
    ) {
      const confirmed = await emptyCompartmentMessageBoxRef.value?.show()
      if (!confirmed) {
        return
      }
    }
    if (props.task && isScanningRequired(props.task)) {
      // set hasAnimationEnded to false when confirm is clicked and current task is with scanning
      hasAnimationEnded.value = false
    }
  }

  emit('actionButtonClicked', buttonAction)
}

const recalculateScanActionIcon = () => {
  // Recalculate icon only when we've a task -> to keep icon when indicator closes
  if (props.task) {
    scanActionIcon.value = isScanEach(props.task)
      ? 'barcode-multiple'
      : 'barcode'
  }
}

onMounted(() => {
  const { addMultipleListeners } = generalHelpers()
  // set event listener to the end of the animation of the scanning indicator to show the placeholder at the correct time
  const actionBarTop = document.querySelector(
    '.action-bar-top .scan-action-wrapper'
  )
  if (actionBarTop) {
    addMultipleListeners(
      document.querySelector('.action-bar-top .scan-action-wrapper')!,
      ['transitionend', 'transitioncancel'],
      () => {
        hasAnimationEnded.value = true
      }
    )
  }
  recalculateScanActionIcon()
})
watch(
  () => props.task,
  () => {
    recalculateScanActionIcon()
  },
  { deep: true }
)
defineExpose({ buttonClicked })
</script>

<template>
  <div class="cycle-count-action-bar">
    <TgwMessageBox
      ref="emptyCompartmentMessageBoxRef"
      class="empty-compartment-message-box"
      :options="emptyCompartmentMessageBoxConfig"
      :is-touch="true"
      :close-on-cllick-modal="false"
      :append-to-body="appendToBody"
    />
    <div class="action-bar-top">
      <div v-if="showScanPlaceholder" class="scan-action-placeholder" />
      <Transition name="scan-action" mode="out-in">
        <div v-show="showScanActionIcon" class="scan-action-wrapper" />
      </Transition>
    </div>
    <div class="action-bar-bottom">
      <Transition name="scan-action-overlay" mode="out-in">
        <div v-show="showScanActionIcon" class="scan-action-overlay-wrapper">
          <ElProgress
            :percentage="scanPercentage"
            class="scan-progress"
            :show-text="false"
            status="success"
            :stroke-width="4"
          />
          <div class="scan-icon-text-container">
            <TgwIcon
              class="scan-action-icon"
              :icon="scanActionIcon"
              :color="scanActionIconColor"
            />
          </div>
        </div>
      </Transition>

      <div class="content">
        <div class="content-left">
          <IconButton
            plain
            type="primary"
            class="advanced-view-button"
            icon="wrench"
            :disabled="isAdvancedViewDisabled"
            :text="getTranslation('advanced_view')"
            @click="buttonClicked(ButtonAction.advanced_view)"
          />
          <IconButton
            v-if="isCreateScanVisible"
            plain
            type="primary"
            class="create-scan-button"
            icon="add"
            :disabled="isCreateScanDisabled"
            :text="getTranslation('create_scan')"
            @click="buttonClicked(ButtonAction.create_scan)"
          />
        </div>
        <div class="content-mid">
          <IconButton
            type="primary"
            :disabled="isConfirmDisabled"
            class="confirm-button"
            :icon="confirmButtonIcon"
            :text="confirmButtonLabel"
            @click="buttonClicked(ButtonAction.confirm)"
          />
        </div>
        <div class="content-right">
          <IconButton
            plain
            :type="problemButtonType"
            icon="status-warning-triangle"
            class="report-problem-button"
            :disabled="isReportProblemDisabled"
            :text="problemButtonLabel"
            @click="buttonClicked(ButtonAction.report_problem)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cycle-count-action-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  --pcots-scan-indicator-anim-offset: 40px;
  --pcots-scan-indicator-anim-start: 8px;

  .action-bar-top {
    .scan-action-wrapper {
      display: flex;
      align-items: center;
      background-color: var(--tgw-bg-10);
      border-top: 1px solid var(--tgw-line-20);
      border-left: 1px solid var(--tgw-line-20);
      border-right: 1px solid var(--tgw-line-20);
      border-radius: 4px 4px 0 0;
      text-transform: uppercase;
      width: 175px;
      height: 40px;
      justify-content: center;
      box-sizing: border-box;
    }

    .scan-action-placeholder {
      height: 40px;
    }

    .scan-action-enter-from,
    .scan-action-leave-to {
      translate: 0
        calc(
          var(--pcots-scan-indicator-anim-start) +
            var(--pcots-scan-indicator-anim-offset)
        );
    }

    .scan-action-enter-active,
    .scan-action-leave-active {
      transition: all 0.6s;
    }

    .scan-action-enter-to,
    .scan-action-leave-from {
      translate: 0 0;
    }
  }

  .action-bar-bottom {
    display: flex;
    justify-content: center;
    width: 100%;
    position: relative;
    border-top: 1px solid var(--tgw-line-20);
    box-sizing: border-box;
    background-color: var(--tgw-bg-navbar);

    .scan-action-overlay-wrapper {
      position: absolute;
      top: 0;
      translate: 0 calc(var(--pcots-scan-indicator-anim-offset) * -1);
      background-color: var(--tgw-bg-navbar);
      height: 72px;
      width: 173px;
      border-radius: 4px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;

      .scan-progress {
        position: relative;
        //Move progress bar in corners
        width: calc(100% + 1px);
        transform: translateX(-0.5px);

        :deep(.el-progress-bar) {
          .el-progress-bar__inner,
          .el-progress-bar__outer {
            background-color: var(--tgw-status-success);
            border-bottom-right-radius: 1px;
            border-bottom-left-radius: 1px;
          }

          .el-progress-bar__inner {
            transition: width 0.3s ease;
          }

          .el-progress-bar__outer {
            background-color: transparent;
          }
        }
      }

      .scan-icon-text-container {
        display: flex;
        justify-content: center;

        .scan-action-icon {
          --scan-action-icon-size: 40px;
          width: var(--scan-action-icon-size) !important;
          height: var(--scan-action-icon-size) !important;

          :deep(svg) {
            width: var(--scan-action-icon-size);
            height: var(--scan-action-icon-size);
          }
        }
      }
    }

    .scan-action-overlay-enter-from,
    .scan-action-overlay-leave-to {
      translate: 0 calc(var(--pcots-scan-indicator-anim-start));

      :deep(.tgw-icon.scan-action-icon) {
        scale: 0.5;
        opacity: 0;
      }

      :deep(.scan-progress) {
        scale: 0.5;
        opacity: 0;
      }
    }
    .scan-action-overlay-enter-active,
    .scan-action-overlay-leave-active {
      transition: all 0.6s;

      :deep(.tgw-icon.scan-action-icon) {
        transition: all 0.6s;
      }

      :deep(.scan-progress) {
        transition: all 0.6s;
      }
    }
    .scan-action-overlay-enter-to,
    .scan-action-overlay-leave-from {
      translate: 0 calc(var(--pcots-scan-indicator-anim-offset) * -1);

      :deep(.tgw-icon.scan-action-icon) {
        scale: 1;
        opacity: 1;
      }

      :deep(.scan-progress) {
        scale: 1;
        opacity: 1;
      }
    }

    .content {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
      height: var(--pcots-footer-bottom-height);
      padding: 0 var(--pcots-outer-lc-padding);
      box-sizing: border-box;

      .icon-button {
        height: var(--pcots-footer-button-height);

        &.is-plain {
          border-width: 2px;
        }

        &.is-disabled {
          box-shadow: none;
        }

        :deep(.flex-container) {
          .tgw-icon.button-icon {
            --icon-button-icon-size: var(--pcots-footer-icon-size);
          }
          .button-text {
            display: flex;
            align-items: center;
            font-size: var(--pcots-font-size-md);
            height: 48px;
          }
        }
      }

      .content-left,
      .content-right {
        display: flex;
        flex: 1;
        .icon-button {
          width: 100%;
          max-width: 260px;
        }
      }

      .content-right {
        justify-content: flex-end;
      }

      .content-mid {
        display: flex;
        flex: 1;
        justify-content: center;

        .icon-button {
          width: 100%;
          max-width: 400px;
          margin: 0 12px;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.empty-compartment-message-box {
  // fixes visual pixel bug which occurs when using a resolution of
  // 1920 x 1020 with 70% zoom, where the background comes through
  background-color: var(--tgw-bg-20);

  .tgw-dialog__header {
    .tgw-message-box__dialog-header {
      .tgw-message-box__text-container {
        .tgw-message-box__description {
          white-space: pre;
        }
      }
    }
  }
}
</style>
