import { storeToRefs } from 'pinia'
import { useKeycloakStore } from '@/stores/useKeycloakStore/useKeycloakStore'

/**
 * get bearer token
 * @returns {any} user object
 */
function fetchBearerToken() {
  const result = {
    token: '',
  }

  const { login } = storeToRefs(useKeycloakStore())
  result.token = login.value.accessToken

  return result
}

/**
 * creates the http header for the bfg backend. If the oauth2 proxy isn't used, the jwt access token is added to header.
 * @returns {{"content-type": string}|{authorization: string, "content-type": string}}
 */
export const createHeader = () => {
  const { oauth2ProxyUsed } = storeToRefs(useKeycloakStore())
  if (oauth2ProxyUsed.value) {
    return {
      'content-type': 'application/json',
    }
  }

  return {
    authorization: `Bearer ${fetchBearerToken().token}`,
    'content-type': 'application/json',
  }
}
