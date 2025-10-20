import api from '@/api/api'
import { createHeader } from '@/api/header'

const { getEnv } = useEnv()

const URLS = {
  versions: '/bfg/v2/versions',
  userInfoUrl: '/Authorization/GetUserRolesWithIdToken',
  userPermissions: '/Authorization/GetUserPermissions',
  userPermissionsV2: '/bfg/v2/authorization/user/permissions',
}

export const getVersionsApi = () => {
  return api.get(getEnv('VITE_APP_BFG_URL') + URLS.versions, {
    headers: createHeader(),
  })
}

export const fetchUserInfo = () => {
  return api.get(getEnv('VITE_APP_BFG_URL') + URLS.userInfoUrl, {
    headers: createHeader(),
  })
}

export const getUserPermissionsApi = () => {
  return api.get(getEnv('VITE_APP_BFG_URL') + URLS.userPermissions, {
    headers: createHeader(),
  })
}

export const getUserPermissionsV2Api = () => {
  return api.get(getEnv('VITE_APP_BFG_URL') + URLS.userPermissionsV2, {
    headers: createHeader(),
  })
}
