import { storeToRefs } from 'pinia'
import api from '@/api/api'
import { createHeader } from '@/api/header'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { useApiVersionStore } from '@/stores/useApiVersionStore/useApiVersionStore'
import { useUrlJoiner } from '@/composables/useUrlJoiner/useUrlJoiner'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'

const { getEnv } = useEnv()
const { joinUrls } = useUrlJoiner()

const getBackEndUrl = () => {
  let backEndUrl = getEnv('VITE_APP_BACKEND_ADAPTER')

  if (backEndUrl === undefined || backEndUrl === '') {
    backEndUrl = getEnv('VITE_APP_CILOG_ADAPTER')
  }

  return backEndUrl
}

const getFullUrl = (
  apiName: ApiNameEnum,
  operation: string,
  useVersion: boolean,
  useWorkstationPath: boolean
) => {
  const workspaceStore = useWorkspaceStore()
  const apiVersionStore = useApiVersionStore()
  const { workstation } = storeToRefs(workspaceStore)
  const baseUrl = getBackEndUrl()
  let version = ''
  let workstationPath = ''
  if (useVersion) {
    version = apiVersionStore.getHighestSupportedVersionByApi(apiName)
  }
  if (
    workstation.value?.path &&
    workstation.value.path !== '' &&
    useWorkstationPath
  ) {
    workstationPath = workstation.value.path
  }
  return joinUrls(baseUrl, apiName, version, workstationPath, operation)
}

export const apiGet = (
  apiName: ApiNameEnum,
  operation: string,
  request?: any,
  useVersion = true,
  useWorkstationPath = true
): Promise<any> => {
  let fullUrl = getFullUrl(apiName, operation, useVersion, useWorkstationPath)
  if (request) {
    const urlParams = Object.keys(request)
      .map((key) => {
        if (Array.isArray(request[key])) {
          // Handle array values
          return request[key]
            .map(
              (value: any) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            )
            .join('&')
        } else {
          return `${encodeURIComponent(key)}=${encodeURIComponent(
            request[key]
          )}`
        }
      })
      .join('&')
    fullUrl += `?${urlParams}`
  }
  return api.get(fullUrl, {
    headers: createHeader(),
  })
}

export const apiPost = (
  apiName: ApiNameEnum,
  operation: string,
  request: any,
  useVersion = true,
  useWorkstationPath = true
): Promise<any> => {
  return api.post(
    getFullUrl(apiName, operation, useVersion, useWorkstationPath),
    JSON.stringify(request),
    {
      headers: createHeader(),
    }
  )
}
