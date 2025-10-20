import Keycloak from 'keycloak-js'
import { defineStore } from 'pinia'
import { LoginPayload } from '@/types/LoginPayload'

export const keycloakStoreId = 'keycloakStore'

/**
 * Keycloak store implemented with pinia
 */
export const useKeycloakStore = defineStore(keycloakStoreId, {
  state: () => ({
    login: {} as LoginPayload,
    keycloak: new Keycloak(),
    oauth2ProxyUsed: false as boolean,
  }),
  actions: {
    setLogin(payload: LoginPayload) {
      this.login = payload
    },
    setKeycloak(payload: any) {
      this.keycloak = payload
    },
  },
})
