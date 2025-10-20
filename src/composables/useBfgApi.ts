import { useApi } from '@/api/composables/useApi'
import {
  fetchUserInfo,
  getUserPermissionsApi,
  getUserPermissionsV2Api,
  getVersionsApi,
} from '@/api/bfgApi'
import {
  getMessageKeyError,
  getMessageKeyPermission,
  handleRequestError,
} from '@/helpers/apiHelpers'
import { GetUserInfoResponseType } from '@/types/Api/bfg/Get/UserInfo/GetUserInfoResponseType'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'
import {
  GetUserPermissionsResponseType,
  UserPermissionsType,
} from '@/types/Api/bfg/Get/UserPermissions/GetUserPermissionsResponseType'
import { GetVersionsResponseType } from '@/types/Api/bfg/Get/Version/GetVersionsResponseType'

export const getVersions = async (): Promise<GetVersionsResponseType> => {
  const { response, exec } = useApi<GetVersionsResponseType>(
    'getVersionsApi',
    getVersionsApi,
    {
      responseAdapter: (response: GetVersionsResponseType) => response,
    }
  )

  await exec()

  // error handling disabled because version check is used for legacy V1 handling!!
  // await handleRequestError(response.value, error, [
  //   getMessageKeyPermission(ApiNameEnum.bfg, 'get_user_info'),
  //   getMessageKeyError(ApiNameEnum.bfg, 'get_user_info'),
  // ])
  return response.value
}

export const getUserInfo = async (): Promise<string> => {
  const { response, error, exec } = useApi<GetUserInfoResponseType>(
    'fetchUserInfo',
    fetchUserInfo,
    {
      responseAdapter: (response: GetUserInfoResponseType) => response.data,
    }
  )

  await exec()

  await handleRequestError(response.value, error, [
    getMessageKeyPermission(ApiNameEnum.bfg, 'get_user_info'),
    getMessageKeyError(ApiNameEnum.bfg, 'get_user_info'),
  ])

  return response.value.data
}

export const getUserPermissions = async (): Promise<UserPermissionsType> => {
  const { response, error, exec } = useApi<GetUserPermissionsResponseType>(
    'getUserPermissionsApi',
    getUserPermissionsApi,
    {
      responseAdapter: (response: GetUserPermissionsResponseType) =>
        response.data,
    }
  )

  await exec()

  await handleRequestError(response.value, error, [
    getMessageKeyPermission(ApiNameEnum.bfg, 'get_user_info'),
    getMessageKeyError(ApiNameEnum.bfg, 'get_user_info'),
  ])

  return response.value.data
}

export const getUserPermissionsV2 = async (): Promise<UserPermissionsType> => {
  const { response, error, exec } = useApi<GetUserPermissionsResponseType>(
    'permissions',
    getUserPermissionsV2Api,
    {
      responseAdapter: (response: GetUserPermissionsResponseType) =>
        response.data,
    }
  )
  await exec()

  await handleRequestError(response.value, error, [
    getMessageKeyPermission(ApiNameEnum.bfg, 'get_user_info'),
    getMessageKeyError(ApiNameEnum.bfg, 'get_user_info'),
  ])

  return response.value.data
}
