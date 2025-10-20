import { describe, expect, it, vi } from 'vitest'

import { createPinia, setActivePinia } from 'pinia'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { GetWorkstationStateResponseType } from '@/types/Api/pcots/Get/WorkstationState/GetWorkstationStateResponseType'
import {
  TaskExecutionModeEnum,
  WorkStationDirectionEnum,
  WorkStationModeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { getAvailableStations } from '@/helpers/testDataProvider'
import { useApiMock } from '@/helpers/useApiMock'

const { mockGetSupportedStations, mockFetchUserInfo } = useApiMock()

vi.mock('@/api/wmApi', () => ({
  getSupportedStationsApi: () => mockGetSupportedStations(),
}))

vi.mock('@/api/bfgApi', () => ({
  fetchUserInfo: () => mockFetchUserInfo(),
}))

setActivePinia(createPinia())

describe('Test useWorkspaceStore', () => {
  const workspaceStore = useWorkspaceStore()

  it('should get workspace', () => {
    workspaceStore.user = { id: '69', name: 'Spatti' }
    workspaceStore.workstation = {
      id: '169',
      name: 'Spatti station',
      path: 'Path',
    }
    const workspace = workspaceStore.getWorkspace
    expect(workspace.user).toStrictEqual(workspaceStore.user)
    expect(workspace.workstation).toStrictEqual(workspaceStore.workstation)
  })

  it('should clear workspace', () => {
    workspaceStore.user = { id: '69', name: 'Spatti' }
    workspaceStore.workstation = {
      id: '169',
      name: 'Spatti station',
      path: 'Path',
    }
    workspaceStore.clearWorkspace()
    expect(workspaceStore.user).toStrictEqual({ id: '', name: '' })
    expect(workspaceStore.workstation).toStrictEqual({
      id: '',
      name: '',
      path: '',
    })
  })

  it('should have workstation', () => {
    workspaceStore.workstation = {
      id: '169',
      name: 'Spatti station',
      path: 'Path',
    }
    expect(workspaceStore.hasWorkstation()).toBeTruthy()
  })

  it('should have available station', () => {
    workspaceStore.availableStations = [
      { id: '169', name: 'Spatti station', path: 'Path' },
    ]
    workspaceStore.workstation.id = '169'
    expect(workspaceStore.isWorkstationAvailable()).toBeTruthy()
  })

  it('should not have available station', () => {
    workspaceStore.availableStations = []
    workspaceStore.workstation.id = '169'
    expect(workspaceStore.isWorkstationAvailable()).toBeFalsy()
  })

  it('should update workstation state', () => {
    const workstationState: GetWorkstationStateResponseType = {
      workstationDirection: WorkStationDirectionEnum.RightToLeft,
      workstationMode: WorkStationModeEnum.Picking,
      requestedWorkstationMode: WorkStationModeEnum.Off,
      amountOrdersLeft: 1,
      requestedTaskExecutionMode: TaskExecutionModeEnum.Init,
      taskExecutionMode: TaskExecutionModeEnum.Robot,
      robotSupport: true,
    }
    workspaceStore.updateWorkstationState(workstationState)
    expect(workspaceStore.workstationMode).toBe(
      workstationState.workstationMode
    )
    expect(workspaceStore.taskExecutionMode).toBe(
      workstationState.taskExecutionMode
    )
    expect(workspaceStore.requestedTaskExecutionMode).toBe(
      workstationState.requestedTaskExecutionMode
    )
    expect(workspaceStore.workstationDirection).toBe(
      workstationState.workstationDirection
    )
  })

  it('should load user', async () => {
    await workspaceStore.loadUser()
    expect(mockFetchUserInfo).toHaveBeenCalledOnce
    expect(workspaceStore.user.name).toBe('Tobias Spatt')
  })

  it('should load available workstations', async () => {
    await workspaceStore.loadAvailableStations()
    expect(mockGetSupportedStations).toHaveBeenCalledOnce
    expect(workspaceStore.availableStations).toStrictEqual(
      getAvailableStations()
    )
  })
})
