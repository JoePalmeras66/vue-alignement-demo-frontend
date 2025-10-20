import { describe, expect, it } from 'vitest'
import Keycloak from 'keycloak-js'
import { createPinia, setActivePinia } from 'pinia'
import { useKeycloakStore } from '@/stores/useKeycloakStore/useKeycloakStore'
import { LoginPayload } from '@/types/LoginPayload'

setActivePinia(createPinia())

describe('Test useKeycloakStore', () => {
  const keycloakStore = useKeycloakStore()

  it('should set login', () => {
    const loginPayload: LoginPayload = { accessToken: '4711', idToken: '0815' }
    keycloakStore.setLogin(loginPayload)
    expect(keycloakStore.login).toStrictEqual(loginPayload)
  })

  it('should set keycloak', () => {
    const keycloak = new Keycloak({
      url: 'Url',
      realm: 'Realm',
      clientId: '0815',
    })
    keycloakStore.setKeycloak(keycloak)
    expect(keycloakStore.keycloak).toStrictEqual(keycloak)
  })
})
