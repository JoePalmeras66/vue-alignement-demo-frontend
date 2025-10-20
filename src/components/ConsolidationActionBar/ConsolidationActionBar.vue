<script setup lang="ts">
import { ButtonAction } from '@/types/ButtonAction'
import {
  BarcodeDataType,
  ConsolidationTaskType,
  ManualConsolidationTaskType,
  TaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import { DisabledButton } from '@/types/DisabledButton'
import { generalHelpers } from '@/helpers/generalHelpers'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import { ConsolidationModeEnum } from '@/types/ConsolidationModeEnum'
import { ConsolidationActionEnum } from '@/types/ConsolidationActionEnum'
import { useTranslations } from '@/composables/useTranslations'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'

interface Props {
  scannedBarcodes: BarcodeDataType[]
  disabledButtons: DisabledButton[]
  task: ConsolidationTaskType | ManualConsolidationTaskType | undefined
  activeCompartmentCount?: number
  showZeroCrossing: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'actionButtonClicked', buttonAction: ButtonAction): Promise<void>
  (
    event: 'consolidationModeChanged',
    consolidationMode: ConsolidationModeEnum
  ): void
}>()
const {
  isScanningRequired,
  isScanEach,
  isScanningFinished,
  getScannedAmount,
  isManualConsolidationTask,
  getManualConsolidationTask,
  getQuantityFromTask,
  getConsolidationTask,
  isTaskSplitted,
} = useApiDataHelper()
const consolidationMode = ref<ConsolidationModeEnum>(ConsolidationModeEnum.AUTO)
const previousConsolidationAction = ref<ConsolidationActionEnum>()
const consolidationAction = ref<ConsolidationActionEnum>()
const triggerConsolidationActionAnimation = ref<boolean>(false)
const { getTranslation } = useTranslations('consolidation-action-bar')
const { getTranslation: getActionBarTranslation } =
  useTranslations('action-bar-texts')
const { getTranslation: getZeroCrossingTranslation } =
  useTranslations('zero-crossing')
const troubleshootingStore = useTroubleshootingStore()

const hasTask = computed(() => {
  return props.task !== undefined
})
const quantity = computed(() => {
  const quantity = getQuantityFromTask(
    props.task as TaskType,
    props.scannedBarcodes
  )
  if (quantity) {
    return quantity
  }
})
const scannedBarcodesAmount = computed(() => {
  return getScannedAmount(props.task as TaskType, props.scannedBarcodes)
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
        !isScanningFinished(props.task as TaskType, props.scannedBarcodes))) &&
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
  return (
    consolidationMode.value === ConsolidationModeEnum.AUTO &&
    !props.showZeroCrossing
  )
})
const showProblemButton = computed((): boolean => {
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
    if (!isScanningFinished(props.task as TaskType, props.scannedBarcodes)) {
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

const consolidationActionText = computed(() => {
  if (consolidationAction.value) {
    return getTranslation(consolidationAction.value)
  } else if (previousConsolidationAction.value) {
    return getTranslation(previousConsolidationAction.value)
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
  if (troubleshootingStore.getOverallProblemCount > 0) {
    return 'accent'
  }

  return 'primary'
})

const confirmButtonLabel = computed(() => {
  const manualConsolidationTask = getManualConsolidationTask(props.task)
  if (troubleshootingStore.isTargetFullOnly()) {
    return getActionBarTranslation('send_target')
  } else if (troubleshootingStore.hasProblemWithAbort()) {
    return getActionBarTranslation('send_to_reject')
  }
  if (manualConsolidationTask?.isCompleted) {
    return getTranslation('send')
  }
  return getActionBarTranslation('confirm')
})

const modeSwitchText = computed(() => {
  return getTranslation('mode_switch')
})

const showSplitPickButton = computed((): boolean => {
  const consolidationTask = getConsolidationTask(props.task)
  return (
    consolidationTask?.quantity.minValue !== undefined &&
    consolidationTask?.quantity.maxValue !== undefined &&
    !props.showZeroCrossing
  )
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

const splitPickButtonLabel = computed(() => {
  if (isTaskSplitted(props.task)) {
    return getActionBarTranslation('undo_split')
  }
  return getActionBarTranslation('split_pick')
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

const consolidationActionPercentage = computed(() => {
  let percentage = 0
  if (props.activeCompartmentCount && props.activeCompartmentCount > 0) {
    percentage = 50
  }
  return percentage
})

// checks if the animation of the scan indicator has ended
const hasAnimationEnded = ref(true)
const showScanPlaceholder = computed(() => {
  return !scanActionIcon.value && hasAnimationEnded.value
})
const showScanActionIcon = computed(() => {
  return isScanningRequired(props.task as TaskType) && !props.showZeroCrossing
})

const hasConsolidationAnimationEnded = ref(false)
const showConsolidationActionPlaceholder = computed(() => {
  return (
    !scanActionIcon.value &&
    consolidationAction.value === undefined &&
    hasConsolidationAnimationEnded.value
  )
})

const showScanText = computed(() => {
  return isScanEach(props.task as TaskType)
})

const showManualModeSwitch = computed(() => {
  return (
    props.task &&
    !isScanningRequired(props.task) &&
    isManualConsolidationTask(props.task) &&
    !props.showZeroCrossing
  )
})

const isButtonDisabled = (buttonAction: ButtonAction) => {
  switch (buttonAction) {
    case ButtonAction.confirm:
      return isConfirmDisabled.value
    case ButtonAction.report_problem:
      return isReportProblemDisabled.value
    case ButtonAction.edit_scans:
      return isEditScansDisabled.value
  }
}

const isModeSwitchDisabled = computed(() => {
  return areAllButtonsDisabled.value || !hasTask.value
})

const buttonClicked = async (buttonAction: ButtonAction) => {
  if (isButtonDisabled(buttonAction)) {
    return
  }

  if (buttonAction === ButtonAction.inventory) {
    consolidationAction.value = ConsolidationActionEnum.inventory
    triggerConsolidationActionAnimation.value =
      !triggerConsolidationActionAnimation.value
  } else if (buttonAction === ButtonAction.swap) {
    consolidationAction.value = ConsolidationActionEnum.swap
    triggerConsolidationActionAnimation.value =
      !triggerConsolidationActionAnimation.value
  } else if (buttonAction === ButtonAction.move) {
    consolidationAction.value = ConsolidationActionEnum.move
    triggerConsolidationActionAnimation.value =
      !triggerConsolidationActionAnimation.value
  } else if (buttonAction === ButtonAction.cancel) {
    hasConsolidationAnimationEnded.value = false
    previousConsolidationAction.value = consolidationAction.value
    consolidationAction.value = undefined
    triggerConsolidationActionAnimation.value =
      !triggerConsolidationActionAnimation.value
  }

  if (buttonAction === ButtonAction.confirm && showEditScansButtons.value) {
    // set hasAnimationEnded to false when confirm is clicked and current task is with scanning
    hasConsolidationAnimationEnded.value = false
    hasAnimationEnded.value = false
  }
  await emit('actionButtonClicked', buttonAction)
}

watch(consolidationMode, async () => {
  if (
    consolidationMode.value === ConsolidationModeEnum.AUTO &&
    consolidationAction.value
  ) {
    await buttonClicked(ButtonAction.cancel)
  }
  emit('consolidationModeChanged', consolidationMode.value)
})

watch(
  () => props.task,
  () => {
    // Reset consolidation mode when task changes
    if (props.task && !isManualConsolidationTask(props.task)) {
      consolidationMode.value = ConsolidationModeEnum.AUTO
    }
  }
)

onMounted(() => {
  const { addMultipleListeners } = generalHelpers()
  // set event listener to the end of the animation of the scanning indicator to show the placeholder at the correct time
  const scanActionWrapper = document.querySelector(
    '.action-bar-top .scan-action-wrapper'
  )
  const consolidationActionWrapper = document.querySelector(
    '.action-bar-top .consolidation-action-wrapper'
  )
  if (scanActionWrapper) {
    addMultipleListeners(
      document.querySelector('.action-bar-top .scan-action-wrapper')!,
      ['transitionend', 'transitioncancel'],
      () => {
        hasAnimationEnded.value = true
      }
    )
  }
  if (consolidationActionWrapper) {
    addMultipleListeners(
      document.querySelector('.action-bar-top .consolidation-action-wrapper')!,
      ['transitionend'],
      () => {
        hasConsolidationAnimationEnded.value = true
      }
    )
  }
})

defineExpose({ buttonClicked, consolidationMode })
</script>

<template>
  <div class="consolidation-action-bar">
    <div class="action-bar-top">
      <div v-if="showScanPlaceholder" class="scan-action-placeholder" />
      <Transition name="scan-action" mode="out-in">
        <div v-show="showScanActionIcon" class="scan-action-wrapper" />
      </Transition>
      <div
        v-if="showConsolidationActionPlaceholder"
        class="consolidation-action-placeholder"
      />
      <Transition name="consolidation-action" mode="out-in">
        <div
          v-show="triggerConsolidationActionAnimation"
          class="consolidation-action-wrapper"
        />
      </Transition>
    </div>
    <div class="action-bar-bottom">
      <Transition name="scan-action-overlay" mode="out-in">
        <div v-show="showScanActionIcon" class="scan-action-overlay">
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
        </div>
      </Transition>
      <Transition name="consolidation-action-overlay" mode="out-in">
        <div
          v-show="triggerConsolidationActionAnimation"
          class="consolidation-action-overlay"
        >
          <ElProgress
            v-if="
              consolidationAction === ConsolidationActionEnum.move ||
              consolidationAction === ConsolidationActionEnum.swap
            "
            :percentage="consolidationActionPercentage"
            class="consolidation-action-progress"
            :show-text="false"
            status="success"
            :stroke-width="4"
          />
          <span class="consolidation-action__text">{{
            consolidationActionText
          }}</span>
        </div>
      </Transition>
      <div class="content">
        <div class="content-left">
          <div v-if="showManualModeSwitch" class="switch-wrapper">
            <TgwSwitch
              v-model="consolidationMode"
              :active-value="ConsolidationModeEnum.MANUAL.toString()"
              :inactive-value="ConsolidationModeEnum.AUTO.toString()"
              class="mode-switch"
              :disabled="isModeSwitchDisabled"
              width="112"
              :is-touch="true"
              :label="modeSwitchText"
            />
          </div>
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
        </div>
        <div class="content-mid">
          <div
            v-if="
              consolidationMode === ConsolidationModeEnum.MANUAL &&
              !consolidationAction
            "
            class="manual-mode-buttons-wrapper"
          >
            <IconButton
              type="primary"
              class="manual-mode-button"
              icon="amount"
              :text="getTranslation(ButtonAction.inventory)"
              @click="buttonClicked(ButtonAction.inventory)"
            />
            <IconButton
              type="primary"
              class="manual-mode-button"
              icon="move"
              :text="getTranslation(ButtonAction.move)"
              @click="buttonClicked(ButtonAction.move)"
            />
            <IconButton
              type="primary"
              class="manual-mode-button"
              icon="swap-horizontal"
              :text="getTranslation(ButtonAction.swap)"
              @click="buttonClicked(ButtonAction.swap)"
            />
          </div>
          <div
            v-if="consolidationAction"
            class="cancel-consolidation-action-wrapper"
          >
            <IconButton
              v-if="consolidationAction"
              plain
              type="primary"
              class="cancel-button"
              icon="close"
              :text="getActionBarTranslation(ButtonAction.cancel)"
              icon-alignment="left"
              @click="buttonClicked(ButtonAction.cancel)"
            />
          </div>
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
.consolidation-action-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  --pcots-scan-indicator-anim-offset: 40px;
  --pcots-scan-indicator-anim-start: 8px;

  .action-bar-top {
    .consolidation-action-wrapper,
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

    .consolidation-action-wrapper {
      width: 243px;
    }

    .consolidation-action-placeholder,
    .scan-action-placeholder {
      height: 40px;
    }

    /*#region scan-action transition*/
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
    /*#endregion*/

    /*#region consolidation-action transition*/
    .consolidation-action-enter-from,
    .consolidation-action-leave-to {
      translate: 0
        calc(
          var(--pcots-scan-indicator-anim-start) +
            var(--pcots-scan-indicator-anim-offset)
        );
    }

    .consolidation-action-enter-active,
    .consolidation-action-leave-active {
      transition: all 0.6s;
    }

    .consolidation-action-enter-to,
    .consolidation-action-leave-from {
      translate: 0 0;
    }
    /*#endregion*/
  }

  .action-bar-bottom {
    display: flex;
    justify-content: center;
    background-color: var(--tgw-bg-navbar);
    border-top: 1px solid var(--tgw-line-20);
    max-height: var(--pcots-footer-height);
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
    }

    .consolidation-action-overlay {
      position: absolute;
      top: 0;
      translate: 0 calc(var(--pcots-scan-indicator-anim-offset) * -1);
      background-color: var(--tgw-bg-navbar);
      height: 72px;
      width: 241px;
      border-radius: 4px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;

      .consolidation-action-progress {
        position: relative;
        //Move progress bar in corners
        width: calc(100% + 1px);
        transform: translateX(-0.5px);

        :deep(.el-progress-bar) {
          .el-progress-bar__inner,
          .el-progress-bar__outer {
            border-bottom-right-radius: 1px;
            border-bottom-left-radius: 1px;
          }

          .el-progress-bar__outer {
            background-color: transparent;
          }
        }
      }

      .consolidation-action__text {
        font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
        font-weight: 700;
        font-size: 28px;
        line-height: 37px;
        text-transform: uppercase;
        letter-spacing: 0.01em;
        color: var(--tgw-text-secondary);
        user-select: none;
        text-align: center;
      }
    }

    /*#region scan-action-overlay transition*/
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
    /*#endregion*/

    /*#region consolidation-action-overlay transition*/
    .consolidation-action-overlay-enter-from,
    .consolidation-action-overlay-leave-to {
      translate: 0 calc(var(--pcots-scan-indicator-anim-start));

      .consolidation-action__text {
        scale: 0.5;
        opacity: 0;
      }
    }

    .consolidation-action-overlay-enter-active,
    .consolidation-action-overlay-leave-active {
      transition: all 0.6s;

      .consolidation-action__text {
        transition: all 0.6s;
      }
    }

    .consolidation-action-overlay-enter-to,
    .consolidation-action-overlay-leave-from {
      translate: 0 calc(var(--pcots-scan-indicator-anim-offset) * -1);

      .consolidation-action__text {
        scale: 1;
        opacity: 1;
      }
    }
    /*#endregion*/

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

        .switch-wrapper {
          background: var(--tgw-primary-alpha5);
          border: 2px solid var(--tgw-primary-alpha10);
          border-radius: 8px;
          height: 120px;
          width: 195px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          :deep(.tgw-switch) span {
            font-weight: 700;
            font-size: 24px;
            user-select: none;
            padding: 0;
          }
        }

        .edit-scans-button,
        .undo-last-scan-button {
          width: 50%;
          height: var(--pcots-footer-button-height);
          max-width: 260px;
          min-width: 150px;
          border-width: 2px;

          :deep(.button-icon) {
            --icon-button-icon-size: calc(
              var(--pcots-footer-icon-size) - var(--pcots-font-size-offset-md)
            );
          }
        }
      }

      .content-mid {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        flex: v-bind('showSplitPickButton ? 1 : 2');

        .manual-mode-buttons-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;

          .manual-mode-button {
            height: var(--pcots-footer-button-height);
            width: 100%;
            max-width: 300px;
          }
        }

        .cancel-consolidation-action-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          align-items: center;
          height: 100%;
          width: 100%;

          .cancel-consolidation-action-text {
            font-weight: 600;
            font-size: 24px;
            line-height: 28px;
            letter-spacing: 1px;
            color: var(--tgw-text-action);
            user-select: none;
            z-index: 1;
          }

          .cancel-button {
            max-width: 240px;
            width: 100%;
            height: 120px;
            border-width: 2px;
          }
        }

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

          .button-icon {
            --icon-button-icon-size: calc(
              var(--pcots-footer-icon-size) - var(--pcots-font-size-offset-md)
            );
          }
        }
      }
    }
  }
}
</style>
