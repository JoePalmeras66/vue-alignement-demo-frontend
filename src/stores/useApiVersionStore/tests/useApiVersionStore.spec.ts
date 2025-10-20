import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useApiVersionStore } from '@/stores/useApiVersionStore/useApiVersionStore'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { ApiVersionEnum } from '@/types/Api/ApiVersionEnum'
import { useApiMock } from '@/helpers/useApiMock'
import { setConsoleLogger } from '@/helpers/loggerHelper'

const {
  mockGetSupportedVersionsPcotsApi,
  mockGetSupportedVersionsPcotsExtApi,
} = useApiMock()

vi.mock('@/api/pcotsApi', () => ({
  getSupportedVersionsApi: () => mockGetSupportedVersionsPcotsApi(),
}))

vi.mock('@/api/pcotsExtApi', () => ({
  getSupportedVersionsApi: () => mockGetSupportedVersionsPcotsExtApi(),
}))

setActivePinia(createPinia())

describe('Test useApiVersionStore', () => {
  const apiVersionStore = useApiVersionStore()
  const workspaceStore = useWorkspaceStore()
  setConsoleLogger()

  beforeEach(() => {
    apiVersionStore.$reset()
    workspaceStore.$reset()
    workspaceStore.setWorkspace({
      user: { id: '69', name: 'Spatti' },
      workstation: {
        id: '0815',
        name: '0815 Station',
        isExtendedApiSupported: true,
        path: 'none',
      },
    })
  })

  it('should load versions', async () => {
    await apiVersionStore.loadVersions()
    let versions = apiVersionStore.getSupportedVersionsByBackend(
      ApiNameEnum.pcots
    )
    expect(versions).not.toBeUndefined()
    expect(versions!.length).toBe(2)
    expect(versions![0].version).toBe('1.0')
    expect(versions![1].version).toBe('2.0')
    versions = apiVersionStore.getSupportedVersionsByBackend(
      ApiNameEnum.pcotsExt
    )
    expect(versions).not.toBeUndefined()
    expect(versions!.length).toBe(2)
    expect(versions![0].version).toBe('1.0')
    expect(versions![1].version).toBe('2.0')
  })

  it('should return the highest supported version for pcots', async () => {
    await apiVersionStore.loadVersions()
    const version = apiVersionStore.getHighestSupportedVersionByApi(
      ApiNameEnum.pcots
    )
    // Only v1 is supported currently
    expect(version).toBe('v1')
    expect(
      apiVersionStore.isVersionSupported(ApiNameEnum.pcots, ApiVersionEnum.v1)
    ).toBeTruthy()
    expect(
      apiVersionStore.isVersionSupported(ApiNameEnum.pcots, ApiVersionEnum.v2)
    ).toBeFalsy()
  })

  it('should return the highest supported version for pcotsExt', async () => {
    await apiVersionStore.loadVersions()
    const version = apiVersionStore.getHighestSupportedVersionByApi(
      ApiNameEnum.pcotsExt
    )
    expect(version).toBe('v2')
    expect(
      apiVersionStore.isVersionSupported(
        ApiNameEnum.pcotsExt,
        ApiVersionEnum.v1
      )
    ).toBeTruthy()
    expect(
      apiVersionStore.isVersionSupported(
        ApiNameEnum.pcotsExt,
        ApiVersionEnum.v2
      )
    ).toBeTruthy()
  })

  it('should not load pcotsExt, because it is not supported', async () => {
    workspaceStore.workstation.isExtendedApiSupported = false
    await apiVersionStore.loadVersions()
    expect(
      apiVersionStore.getSupportedVersionsByBackend(ApiNameEnum.pcotsExt)
    ).toBe(undefined)
    const version = apiVersionStore.getHighestSupportedVersionByApi(
      ApiNameEnum.pcotsExt
    )
    expect(version).toBe('')
    expect(
      apiVersionStore.isVersionSupported(
        ApiNameEnum.pcotsExt,
        ApiVersionEnum.v1
      )
    ).toBeFalsy()
    expect(
      apiVersionStore.isVersionSupported(
        ApiNameEnum.pcotsExt,
        ApiVersionEnum.v2
      )
    ).toBeFalsy()
  })
})
