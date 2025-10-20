import { defineStore } from 'pinia'
import { RouteLocationNormalized } from 'vue-router'
import { useLogger } from '@tgw-components/core'
import {
  TaskExecutionModeEnum,
  WorkStationDirectionEnum,
  WorkStationModeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { UserType } from '@/types/UserType'
import { WorkspaceType } from '@/types/WorkspaceType'
import { SupportedStationType } from '@/types/Api/wm/WmApiModel'
import { GetWorkstationStateResponseType } from '@/types/Api/pcots/Get/WorkstationState/GetWorkstationStateResponseType'
import { getUserInfo } from '@/composables/useBfgApi'
import { getSupportedStations } from '@/composables/useWmApi'

export const workspaceStoreId = 'workspace'
const workstationIdLocalStorageKey = 'pcots-workstationId'

export const useWorkspaceStore = defineStore({
  id: workspaceStoreId,

  persist: {
    storage: sessionStorage,
  },
  state: () => ({
    availableStations: [] as SupportedStationType[],
    workstation: { id: '', name: '', path: '' } as SupportedStationType,
    workstationMode: WorkStationModeEnum.None as WorkStationModeEnum,
    user: { id: '1', name: '' } as UserType,
    taskExecutionMode: undefined as TaskExecutionModeEnum | undefined,
    requestedTaskExecutionMode: undefined as TaskExecutionModeEnum | undefined,
    workstationDirection: WorkStationDirectionEnum.LeftToRight as
      | WorkStationDirectionEnum
      | undefined,
  }),
  getters: {
    getWorkspace(state) {
      return {
        workstation: state.workstation,
        user: state.user,
      } as WorkspaceType
    },
    isExtendedApiSupported(state): boolean {
      return !!state.workstation?.isExtendedApiSupported
    },
  },
  actions: {
    updateWorkstationState(workstationState: GetWorkstationStateResponseType) {
      this.taskExecutionMode = workstationState.taskExecutionMode
      this.requestedTaskExecutionMode =
        workstationState.requestedTaskExecutionMode
      this.workstationMode = workstationState.workstationMode
      this.workstationDirection = workstationState.workstationDirection
    },
    setWorkspace(newWorkspace: WorkspaceType): void {
      this.workstation = newWorkspace.workstation
      this.user = newWorkspace.user
      this.saveWorkstationIdToLocalStorage()
    },
    hasWorkstation(): boolean {
      return this.workstation.id !== ''
    },
    clearWorkspace(): void {
      this.clearWorkstation()
      this.user.id = ''
      this.user.name = ''
    },
    clearWorkstationIdFromLocalStorage(): void {
      localStorage.removeItem(workstationIdLocalStorageKey)
    },
    clearWorkstation(): void {
      this.workstation.id = ''
      this.workstation.name = ''
      this.workstation.path = ''
      this.clearWorkstationIdFromLocalStorage()
    },
    isWorkstationAvailable(): boolean {
      return (
        this.availableStations.filter(
          (workstation) => workstation.id === this.workstation.id
        ).length > 0
      )
    },
    isRightToLeft(): boolean {
      return this.workstationDirection === WorkStationDirectionEnum.RightToLeft
    },
    saveWorkstationIdToLocalStorage(): void {
      localStorage.setItem(workstationIdLocalStorageKey, this.workstation.id)
    },
    loadWorkstationId(route: RouteLocationNormalized): void {
      const logger = useLogger()
      const workstationId: string | undefined =
        (route.query.workstationId as string) ??
        (route.redirectedFrom?.query.workstationId as string)
      if (workstationId && workstationId !== '') {
        this.workstation.id = workstationId
        logger.info(
          'Loaded workstationId',
          this.workstation.id,
          'from url parameter!'
        )
      } else if (
        localStorage.getItem(workstationIdLocalStorageKey) !== null &&
        localStorage.getItem(workstationIdLocalStorageKey) !== ''
      ) {
        this.workstation.id = localStorage.getItem(
          workstationIdLocalStorageKey
        ) as string
        logger.info(
          'Loaded workstationId',
          this.workstation.id,
          'from local storage!'
        )
      }
    },
    async loadUser() {
      const userInfoResponse = await getUserInfo()
      if (userInfoResponse) {
        const userInformation = JSON.parse(userInfoResponse)
        if (userInformation && userInformation.sub !== this.user.id) {
          this.user.id = userInformation.sub
          this.user.name = userInformation.name
        }
      }
    },
    async loadAvailableStations() {
      const getSupportedStationsResponse = await getSupportedStations()
      if (
        getSupportedStationsResponse &&
        getSupportedStationsResponse.length > 0
      ) {
        this.availableStations = getSupportedStationsResponse
      }
    },
  },
})
