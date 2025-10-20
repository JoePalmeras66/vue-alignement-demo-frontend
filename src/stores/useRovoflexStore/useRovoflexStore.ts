import { defineStore, storeToRefs } from 'pinia'
import { useLogger } from '@tgw-components/core'
import { notify } from '@tgw-components/web'
import { RovoflexState } from '@/types/RovoflexState'
import { RobotStateChangedEventType } from '@/types/Api/pcots/Events/RobotStateChanged/RobotStateChangedEventType'
import {
  MessageTypeEnum,
  RobotOperatingStateEnum,
  TaskExecutionModeEnum,
  WorkStationModeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { WorkstationChangedEventType } from '@/types/Api/pcots/Events/WorkstationChanged/WorkstationChangedEventType'
import { getWorkstationState } from '@/composables/usePcotsApi'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { GetRobotStateResponseType } from '@/types/Api/pcots/Get/RobotState/GetRobotStateResponseType'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { RovoflexInstructionEnum } from '@/types/RovoflexInstructionEnum'
import { MessageType } from '@/types/Api/pcots/PcotsApiModel'
import { useMessage } from '@/composables/useMessage/useMessage'
import { useAppContainerConfigStore } from '@/stores/useAppContainerConfigStore/useAppContainerConfigStore'
import { AppContainerActionEnum } from '@/types/AppContainerActionEnum'
import { RovoflexErrorType } from '@/types/RovoflexErrorType'

export const useRovoflexStore = defineStore('rovoflex', {
  state: () => ({
    rovoflexState: RovoflexState.ManualPicking as RovoflexState,
    currentRobotState: undefined as GetRobotStateResponseType | undefined,
    hasConfirmedError: false,
    notificationInstance: undefined as any,
  }),
  actions: {
    isNotificationOpen() {
      return this.notificationInstance !== undefined
    },
    closeNotification() {
      if (this.isNotificationOpen()) {
        this.notificationInstance.close()
        this.notificationInstance = undefined
      }
    },
    showNotification(message: MessageType) {
      this.closeNotification()
      const { getMessageTitle, getMessageText } = useMessage()
      this.notificationInstance = notify({
        title: getMessageTitle(message),
        description: getMessageText(message),
        type: message.messageType.toLowerCase(),
        duration: 0,
        closeable: false,
      })
    },
    async loadStates() {
      const logger = useLogger()
      const { workstationMode, taskExecutionMode } = storeToRefs(
        useWorkspaceStore()
      )
      const response = await getWorkstationState()
      const appContainerConfigStore = useAppContainerConfigStore()
      logger.info(
        'workstationMode',
        workstationMode.value,
        'WorkstationState response',
        response
      )
      if (response) {
        await this.handleWorkstationChangedEvent(response)
      }
      if (
        workstationMode.value !== WorkStationModeEnum.Off &&
        taskExecutionMode.value !== TaskExecutionModeEnum.Init
      ) {
        if (response.robotSupport) {
          appContainerConfigStore.addMenuItem(
            AppContainerActionEnum.SwitchToRobotMode
          )
          const response = await getRobotState()
          logger.info('getRobotState response', response)
          if (response) {
            await this.handleRovoflexEvent(response)
          }
        }
      }
    },
    updateOrderState(newRobotState: GetRobotStateResponseType | undefined) {
      this.currentRobotState = newRobotState
    },
    updateRovoflexState(newRovoflexState: RovoflexState) {
      const logger = useLogger()
      logger.info('updateRovoflexState', newRovoflexState)
      this.rovoflexState = newRovoflexState
    },
    async handleWorkstationChangedEvent(data: WorkstationChangedEventType) {
      const logger = useLogger()
      const workspaceStore = useWorkspaceStore()
      const { workstationMode } = storeToRefs(useWorkspaceStore())

      workspaceStore.updateWorkstationState(data)
      logger.info(
        'handleWorkstationChangedEvent - requestedTaskExecutionMode',
        data.requestedTaskExecutionMode,
        ' taskExecutionMode',
        data.taskExecutionMode,
        ' rovoflexState',
        this.rovoflexState
      )

      if (workstationMode.value !== WorkStationModeEnum.Off) {
        if (
          data.requestedTaskExecutionMode === TaskExecutionModeEnum.Robot &&
          data.taskExecutionMode !== TaskExecutionModeEnum.Robot &&
          this.rovoflexState !== RovoflexState.RovoflexPickingRequested
        ) {
          logger.info('handleWorkstationChanged - RovoflexPickingRequested')
          this.updateRovoflexState(RovoflexState.RovoflexPickingRequested)
          this.showNotification({
            messageType: MessageTypeEnum.Information,
            messageTitle: 'rovoflex-messages.rovoflex_picking_requested_title',
            messageText: 'rovoflex-messages.rovoflex_picking_requested_text',
            parameters: [],
          })
        } else if (
          data.requestedTaskExecutionMode === TaskExecutionModeEnum.Human &&
          data.taskExecutionMode !== TaskExecutionModeEnum.Human &&
          this.rovoflexState !== RovoflexState.ManualPickingRequested
        ) {
          logger.info('handleWorkstationChanged - ManualPickingRequested')
          this.updateRovoflexState(RovoflexState.ManualPickingRequested)
          this.showNotification({
            messageType: MessageTypeEnum.Information,
            messageTitle:
              'rovoflex-messages.rovoflex_manual_picking_requested_title',
            messageText:
              'rovoflex-messages.rovoflex_manual_picking_requested_text',
            parameters: [],
          })
        } else if (
          data.taskExecutionMode === TaskExecutionModeEnum.Human &&
          (this.rovoflexState === RovoflexState.ManualPickingRequested ||
            this.rovoflexState === RovoflexState.RovoflexPicking)
        ) {
          logger.info('handleWorkstationChanged - exitRobotMode')
          this.closeNotification()
          await this.router.push('exitRobotMode')
          this.updateRovoflexState(RovoflexState.ManualPicking)
        }
      }
    },
    async handleRovoflexEvent(data: RobotStateChangedEventType) {
      const logger = useLogger()
      const workspaceStore = useWorkspaceStore()
      const { workstationMode } = storeToRefs(workspaceStore)
      const taskStore = useTaskStore()

      if (workstationMode.value !== WorkStationModeEnum.Off) {
        this.updateOrderState(data)
        logger.info(
          'handleRovoflexEvent',
          data,
          'rovoflexState',
          this.rovoflexState,
          'hasConfirmedError',
          this.hasConfirmedError
        )

        // special handling when rovoflex turns off with error state (example: GPU failure)
        if (
          data.operatingState === RobotOperatingStateEnum.Off &&
          this.rovoflexState === RovoflexState.Error
        ) {
          logger.info(
            'Rovoflex is turned off and robot in error state! Errors present ',
            this.getErrors
          )
          if (this.getErrors.length > 0) {
            logger.info('Errors present switch to normal error handling')
            await this.router.push('/')
            this.updateRovoflexState(RovoflexState.Error)
          } else {
            logger.info('No errors present switch to manual picking')
            await this.router.push('exitRobotMode')
            this.updateRovoflexState(RovoflexState.ManualPicking)
          }
        } else {
          if (
            data.operatingState === RobotOperatingStateEnum.Auto &&
            data.requestedOperatingState === undefined &&
            this.rovoflexState !== RovoflexState.ManualPickingRequested
          ) {
            this.updateRovoflexState(RovoflexState.RovoflexPicking)
            this.closeNotification()
            await this.router.push({ name: 'home' })
          }
          if (
            data.operatingState === RobotOperatingStateEnum.Error &&
            !this.hasConfirmedError
          ) {
            if (this.getErrors.length >= 1 && !data.robotInHome) {
              await this.router.push('moveRobotToHome')
              this.updateRovoflexState(RovoflexState.Error)
            } else if (
              this.router.currentRoute.value.name === 'moveRobotToHome' &&
              data.robotInHome
            ) {
              await this.router.push('/')
              this.updateRovoflexState(RovoflexState.Error)
            } else if (
              !taskStore.hasTask &&
              data.errors.length === 1 &&
              data.errors[0] === 'SafetyStopActive'
            ) {
              // When we're having an SafetyZoneViolation without a task
              logger.info('SafetyZoneViolation without a task')
              this.closeNotification()
              // It's not an actual error state
              await this.router.push({
                name: 'robotInstruction',
                params: { instruction: RovoflexInstructionEnum.Continue },
              })
            } else {
              this.updateRovoflexState(RovoflexState.Error)
            }
          }
          if (
            data.requestedOperatingState === RobotOperatingStateEnum.Auto &&
            data.operatingState !== RobotOperatingStateEnum.Error &&
            !taskStore.hasTask
          ) {
            this.closeNotification()
            this.updateRovoflexState(RovoflexState.RovoflexPickingRequested)
            await this.router.push({
              name: 'robotInstruction',
              params: { instruction: RovoflexInstructionEnum.Switch },
            })
          }
        }
      } else {
        logger.info(
          'handleRovoflexEvent ignored because WorkStationModeEnum.Off'
        )
      }
    },
    submitError() {
      const workspaceStore = useWorkspaceStore()
      const logger = useLogger()
      logger.info(
        'Submit error requestedTaskExecutionMode',
        workspaceStore.requestedTaskExecutionMode,
        'requestedOperatingState',
        this.currentRobotState?.requestedOperatingState,
        'taskExecutionMode',
        workspaceStore.taskExecutionMode,
        'operatingState',
        this.currentRobotState?.operatingState
      )
      const taskExecutionMode =
        workspaceStore.requestedTaskExecutionMode ??
        workspaceStore.taskExecutionMode
      const operatingState =
        this.currentRobotState?.requestedOperatingState ??
        this.currentRobotState?.operatingState
      if (
        taskExecutionMode !== TaskExecutionModeEnum.Human &&
        operatingState !== RobotOperatingStateEnum.Off
      ) {
        logger.info('RovoflexPickingRequested')
        this.updateRovoflexState(RovoflexState.RovoflexPickingRequested)
      } else {
        logger.info('ManualPicking')
        this.updateRovoflexState(RovoflexState.ManualPicking)
      }
      if (!this.isNotificationOpen()) {
        let title = 'rovoflex-messages.rovoflex_robotic_picking_paused_title'
        let text = 'rovoflex-messages.rovoflex_robotic_picking_paused_text'
        if (this.rovoflexState === RovoflexState.ManualPicking) {
          title = 'rovoflex-messages.rovoflex_manual_mode_switch_title'
          text = 'rovoflex-messages.rovoflex_manual_mode_switch_text'
        }
        this.showNotification({
          messageType: MessageTypeEnum.Warning,
          messageTitle: title,
          messageText: text,
          parameters: [],
        })
      }
      this.hasConfirmedError = true
    },
  },
  getters: {
    getPutQuantity: (state): number => {
      return state.currentRobotState?.orderStatus?.putQuantity ?? 0
    },
    getErrors: (state): string[] => {
      let errors: string[] = []
      if (state.currentRobotState) {
        if (
          state.currentRobotState.errors &&
          state.currentRobotState.errors.length > 0
        ) {
          errors = errors.concat(state.currentRobotState.errors)
        }
        if (
          state.currentRobotState.orderStatus?.errors &&
          state.currentRobotState.orderStatus?.errors.length > 0
        ) {
          errors = errors.concat(state.currentRobotState.orderStatus.errors)
        }
      }
      return errors
    },
    hasMonitorPositionError(): boolean {
      const errorList: string[] = this.getErrors
      if (errorList.length > 0) {
        if (errorList.includes(RovoflexErrorType.PickScreenError.toString())) {
          return true
        }
      }

      return false
    },
  },
})
