<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ButtonAction } from '@/types/ButtonAction'
import {
  BarcodeDataType,
  PickingTaskType,
  PurgeAndRecallTaskType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { DisabledButton } from '@/types/DisabledButton'
import { generalHelpers } from '@/helpers/generalHelpers'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { useTranslations } from '@/composables/useTranslations'
import { useRovoflexStore } from '@/stores/useRovoflexStore/useRovoflexStore'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'

interface Props {
  showZeroCrossing: boolean
  scannedBarcodes: BarcodeDataType[]
  disabledButtons: DisabledButton[]
  task?: TaskType
}
const props = defineProps<Props>()
const emit = defineEmits<{
  actionButtonClicked: [buttonAction: ButtonAction]
}>()
const { locale } = useI18n()
const {
  isScanningRequired,
  isScanEach,
  isScanningFinished,
  getScannedAmount,
  isTaskSplitted,
} = useApiDataHelper()
const { getTranslation } = useTranslations('action-bar')
const { getTranslation: getActionBarTranslation } =
  useTranslations('action-bar-texts')
const { getTranslation: getZeroCrossingTranslation } =
  useTranslations('zero-crossing')
const troubleshootingStore = useTroubleshootingStore()

const hasTask = computed(() => {
  return props.task !== undefined
})
const quantity = computed(() => {
  const workingTask = props.task as PickingTaskType | PurgeAndRecallTaskType
  if (workingTask?.quantity) {
    return workingTask.quantity.value
  }
})
const scannedBarcodesAmount = computed(() => {
  return getScannedAmount(props.task as PickingTaskType, props.scannedBarcodes)
})
const areAllButtonsDisabled = computed((): boolean => {
  return props.disabledButtons.includes(DisabledButton.all)
})
const isConfirmDisabled = computed((): boolean => {
  return (
    (!hasTask.value ||
      props.disabledButtons?.includes(DisabledButton.confirm) ||
      areAllButtonsDisabled.value ||
      (isScanningRequired(props.task as TaskType) &&
        !isScanningFinished(
          props.task as PickingTaskType | PurgeAndRecallTaskType,
          props.scannedBarcodes
        ))) &&
    !troubleshootingStore.hasProblemWithAbort()
  )
})
const isReportProblemDisabled = computed((): boolean => {
  return (
    !hasTask.value ||
    props.disabledButtons?.includes(DisabledButton.report_problem) ||
    areAllButtonsDisabled.value
  )
})
const isSplitPickDisabled = computed((): boolean => {
  return (
    !hasTask.value ||
    props.disabledButtons?.includes(DisabledButton.split_pick) ||
    areAllButtonsDisabled.value ||
    (quantity.value !== undefined &&
      quantity.value <= 1 &&
      !isTaskSplitted(props.task)) ||
    troubleshootingStore.hasProblemWithAbort()
  )
})
const isEditScansDisabled = computed((): boolean => {
  return (
    !hasTask.value ||
    props.disabledButtons?.includes(DisabledButton.edit_scans) ||
    areAllButtonsDisabled.value ||
    troubleshootingStore.hasProblemWithAbort()
  )
})
const isUndoLastScanDisabled = computed((): boolean => {
  return (
    !hasTask.value ||
    props.disabledButtons?.includes(DisabledButton.edit_scans) ||
    areAllButtonsDisabled.value ||
    (scannedBarcodesAmount.value !== undefined &&
      scannedBarcodesAmount.value <= 0)
  )
})
const isZeroCrossingYesDisabled = computed((): boolean => {
  return (
    props.disabledButtons?.includes(DisabledButton.zero_crossing_empty_yes) ||
    areAllButtonsDisabled.value
  )
})
const isZeroCrossingNoDisabled = computed((): boolean => {
  return (
    props.disabledButtons?.includes(DisabledButton.zero_crossing_empty_no) ||
    areAllButtonsDisabled.value
  )
})
const showConfirmButton = computed((): boolean => {
  return !props.showZeroCrossing
})
const showProblemButton = computed((): boolean => {
  return !props.showZeroCrossing
})
const showSplitPickButton = computed((): boolean => {
  return !props.showZeroCrossing
})
const showEditScansButtons = computed((): boolean => {
  return isScanningRequired(props.task as TaskType) && !props.showZeroCrossing
})
const showUndoLastScanButton = computed((): boolean => {
  return isScanningRequired(props.task as TaskType) && !props.showZeroCrossing
})
const scanActionIcon = computed((): string | undefined => {
  if (isScanningRequired(props.task as TaskType)) {
    return isScanEach(props.task as TaskType) ? 'barcode-multiple' : 'barcode'
  }
})
const scanActionIconColor = computed(() => {
  if (isScanningRequired(props.task as TaskType)) {
    if (
      !isScanningFinished(props.task as PickingTaskType, props.scannedBarcodes)
    ) {
      if (isScanEach(props.task as TaskType)) {
        return 'var(--tgw-status-warning)'
      } else {
        return 'var(--tgw-primary)'
      }
    } else {
      return 'var(--tgw-status-success)'
    }
  }
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

const getProblemButtonType = computed(() => {
  if (
    troubleshootingStore.getOverallProblemCount > 0 &&
    !props.showZeroCrossing
  ) {
    return 'accent'
  }

  return 'primary'
})

const getSplitPickButtonType = computed(() => {
  if (isTaskSplitted(props.task)) {
    return 'accent'
  }
  return 'primary'
})

const getSplitButtonIcon = computed(() => {
  if (isTaskSplitted(props.task)) {
    return 'reset'
  }
  return 'split'
})

const splitPickButtonLabel = computed(() => {
  if (isTaskSplitted(props.task)) {
    return getActionBarTranslation('undo_split')
  }
  return getActionBarTranslation('split_pick')
})

const confirmButtonLabel = computed(() => {
  if (troubleshootingStore.isTargetFullOnly()) {
    return getActionBarTranslation('send_target')
  } else if (troubleshootingStore.hasProblemWithAbort()) {
    return getActionBarTranslation('send_to_reject')
  }
  return getActionBarTranslation('confirm')
})

const scanPercentage = computed(() => {
  let percentage = 0
  if (isScanningRequired(props.task as TaskType)) {
    if (
      isScanEach(props.task as TaskType) &&
      quantity.value &&
      scannedBarcodesAmount.value !== undefined
    ) {
      percentage = (scannedBarcodesAmount.value / quantity.value) * 100
    } else {
      percentage = props.scannedBarcodes.length > 0 ? 100 : 0
    }
  }
  return percentage > 100 ? 100 : percentage
})

// checks if the animation of the scan indicator has ended
const hasAnimationEnded = ref(true)
const showScanPlaceholder = computed(() => {
  return !scanActionIcon.value && hasAnimationEnded.value
})
const showScanActionIcon = computed(() => {
  return !props.showZeroCrossing && isScanningRequired(props.task as TaskType)
})

const showScanText = computed(() => {
  return isScanEach(props.task as TaskType)
})

const robotPaused = computed(() => {
  const { hasConfirmedError } = storeToRefs(useRovoflexStore())
  return hasConfirmedError.value
})
const robotPausedText = computed(() => {
  return getTranslation('robot_paused')
})

const scanActionWidth = computed(() => {
  if (locale.value === 'en') {
    return '286px'
  }
  return '324px'
})

const isButtonDisabled = (buttonAction: ButtonAction) => {
  switch (buttonAction) {
    case ButtonAction.confirm:
      return isConfirmDisabled.value
    case ButtonAction.report_problem:
      return isReportProblemDisabled.value
    case ButtonAction.split_pick:
      return isSplitPickDisabled.value
    case ButtonAction.zero_crossing_empty_yes:
      return isZeroCrossingYesDisabled.value
    case ButtonAction.zero_crossing_empty_no:
      return isZeroCrossingNoDisabled.value
    case ButtonAction.edit_scans:
      return isEditScansDisabled.value
  }
}

const buttonClicked = async (buttonAction: ButtonAction) => {
  if (isButtonDisabled(buttonAction)) {
    return
  }

  if (buttonAction === ButtonAction.confirm && showEditScansButtons.value) {
    // set hasAnimationEnded to false when confirm is clicked and current task is with scanning
    hasAnimationEnded.value = false
  }
  emit('actionButtonClicked', buttonAction)
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
})

defineExpose({ buttonClicked })
</script>

<template>
  <div class="action-bar" :class="{ 'robot-paused': robotPaused }">
    <div class="action-bar-top">
      <div v-if="showScanPlaceholder" class="scan-action-placeholder" />
      <Transition name="scan-action" mode="out-in">
        <div
          v-show="showScanActionIcon || robotPaused"
          class="scan-action-wrapper"
        />
      </Transition>
    </div>
    <div class="action-bar-bottom">
      <Transition name="scan-action-overlay" mode="out-in">
        <div
          v-show="showScanActionIcon || robotPaused"
          class="scan-action-overlay"
        >
          <template v-if="showScanActionIcon">
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
              <div v-show="showScanText" class="scan-text-container">
                <span class="scan-text-container__text highlighted">{{
                  scannedBarcodesAmount
                }}</span>
                <span class="scan-text-container__text">/{{ quantity }}</span>
              </div>
            </div>
          </template>
          <template v-else-if="robotPaused">
            <span class="robot-paused-text"> {{ robotPausedText }} </span>
            <div class="robot-paused-indicator">
              <TgwIcon
                icon="media-player-pause"
                size="20px"
                color="var(--tgw-icon-primary-contrast)"
              />
            </div>
          </template>
        </div>
      </Transition>

      <div class="content">
        <div class="content-left">
          <IconButton
            v-if="showUndoLastScanButton"
            plain
            type="primary"
            class="undo-last-scan-button"
            icon="reset"
            :disabled="isUndoLastScanDisabled"
            :text="getActionBarTranslation('undo_last_scan')"
            @click="buttonClicked(ButtonAction.undo_last_scan)"
          />
          <IconButton
            v-if="showEditScansButtons"
            plain
            type="primary"
            class="edit-scans-button"
            icon="edit"
            :disabled="isEditScansDisabled"
            :text="getActionBarTranslation('edit_scans')"
            @click="buttonClicked(ButtonAction.edit_scans)"
          />
          <IconButton
            v-if="robotPaused"
            plain
            type="primary"
            class="error-info-button"
            icon="status-info-circle"
            :text="getTranslation('error_info')"
            @click="buttonClicked(ButtonAction.error_info)"
          />
        </div>
        <div class="content-mid">
          <IconButton
            v-if="showZeroCrossing"
            type="primary"
            plain
            class="zero-crossing-button"
            :disabled="isZeroCrossingNoDisabled"
            :text="getZeroCrossingTranslation('zero_crossing_empty_no')"
            @click="buttonClicked(ButtonAction.zero_crossing_empty_no)"
          />
          <IconButton
            v-if="showZeroCrossing"
            type="primary"
            class="zero-crossing-button"
            :disabled="isZeroCrossingYesDisabled"
            :text="getZeroCrossingTranslation('zero_crossing_empty_yes')"
            @click="buttonClicked(ButtonAction.zero_crossing_empty_yes)"
          />
          <IconButton
            v-if="
              showConfirmButton && !troubleshootingStore.hasProblemWithAbort()
            "
            type="primary"
            :disabled="isConfirmDisabled"
            class="confirm-pick-button confirm"
            icon="tick"
            :text="confirmButtonLabel"
            @click="buttonClicked(ButtonAction.confirm)"
          />
          <IconButton
            v-if="
              showConfirmButton && troubleshootingStore.hasProblemWithAbort()
            "
            type="primary"
            :disabled="isConfirmDisabled"
            class="confirm-pick-button send-away"
            icon="paper-fly"
            :text="confirmButtonLabel"
            @click="buttonClicked(ButtonAction.confirm)"
          />
        </div>
        <div class="content-right">
          <IconButton
            v-if="showSplitPickButton"
            :type="getSplitPickButtonType"
            plain
            :icon="getSplitButtonIcon"
            class="split-pick-button"
            :disabled="isSplitPickDisabled"
            :text="splitPickButtonLabel"
            @click="buttonClicked(ButtonAction.split_pick)"
          />
          <IconButton
            v-if="showProblemButton"
            :type="getProblemButtonType"
            plain
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
.action-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-height: var(--pcots-footer-height);
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
    background-color: var(--tgw-bg-navbar);
    border-top: 1px solid var(--tgw-line-20);
    max-height: var(--pcots-footer-bottom-height);
    height: var(--pcots-footer-bottom-height);
    width: 100%;
    z-index: 1;
    position: relative;
    box-sizing: border-box;

    .scan-action-overlay {
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

          .el-progress-bar__outer {
            background-color: transparent;
          }
        }
      }

      .scan-icon-text-container {
        display: flex;
        justify-content: space-evenly;
        align-items: center;

        .scan-action-icon {
          --scan-action-icon-size: 40px;
          width: var(--scan-action-icon-size) !important;
          height: var(--scan-action-icon-size) !important;

          :deep(svg) {
            width: var(--scan-action-icon-size);
            height: var(--scan-action-icon-size);
          }
        }

        .scan-text-container {
          .scan-text-container__text {
            font-weight: 500;
            font-size: 22px;
            color: var(--tgw-text-primary);
            user-select: none;

            &.highlighted {
              font-weight: 800;
              font-size: 32px;
            }
          }
        }
      }

      .robot-paused-text {
        color: var(--tgw-text-secondary);
        text-align: center;
        font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
        font-size: 28px;
        font-weight: 700;
        text-transform: uppercase;
        margin-top: 4px;
      }

      .robot-paused-indicator {
        background: var(--tgw-accent-g);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        position: absolute;
        top: -14px;
        right: -14px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--tgw-dropshadow-medium);
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

      :deep(.scan-text-container) {
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

      :deep(.scan-text-container) {
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

      :deep(.scan-text-container) {
        scale: 1;
        opacity: 1;
      }
    }

    .content {
      display: flex;
      flex-direction: row;
      height: 100%;
      width: 100%;
      padding: 0 var(--pcots-outside-padding);

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

      .content-left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: 100%;
        flex: 1;

        .edit-scans-button,
        .undo-last-scan-button,
        .error-info-button {
          width: 50%;
          height: var(--pcots-footer-button-height);
          max-width: 260px;
          min-width: 150px;
          border-width: 2px;
        }
      }

      .content-mid {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        flex: 1;
        margin: 0 12px;

        .zero-crossing-button,
        .confirm-pick-button {
          width: 100%;
          height: var(--pcots-footer-button-height);
          max-width: 400px;
          z-index: 1;
        }

        .zero-crossing-button {
          max-width: 300px;
        }
      }

      .content-right {
        position: relative;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        height: 100%;
        flex: 1;
        min-width: 312px;

        :deep(.split-pick-button),
        :deep(.report-problem-button) {
          max-width: 260px;
          width: 100%;
          height: var(--pcots-footer-button-height);
          border-width: 2px;
        }
      }
    }
  }

  &.robot-paused {
    --scan-action-width: v-bind(scanActionWidth);

    .action-bar-top {
      .scan-action-wrapper {
        width: calc(var(--scan-action-width) + 2px);
      }
    }
    .action-bar-bottom {
      .scan-action-overlay {
        width: var(--scan-action-width);
      }
    }
  }
}
</style>
