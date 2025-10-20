<script setup lang="ts">
import { useAppContainer, useLogger } from '@tgw-components/core'
import { defineStore, getActivePinia, storeToRefs } from 'pinia'
import {
  useWorkspaceStore,
  workspaceStoreId,
} from '@/stores/useWorkspaceStore/useWorkspaceStore'
import {
  getUserPermissions,
  getUserPermissionsV2,
  getVersions,
} from '@/composables/useBfgApi'
import { AppContainerActionEnum } from '@/types/AppContainerActionEnum'
import {
  appContainerConfigStoreId,
  useAppContainerConfigStore,
} from '@/stores/useAppContainerConfigStore/useAppContainerConfigStore'
import i18n from '@/plugins/i18nFactory'
import { useMessageWebsockets } from '@/composables/useMessageWebsockets'
import { apiVersionStoreId } from '@/stores/useApiVersionStore/useApiVersionStore'
import { keycloakStoreId } from '@/stores/useKeycloakStore/useKeycloakStore'
import { UserPermissionType } from '@/types/Api/bfg/Get/UserPermissions/GetUserPermissionsResponseType'
import { colorMode } from '@/composables/useTheme'

const router = useRouter()
const { connectMessageEvents, disconnectMessageEvents } = useMessageWebsockets()
const {
  onLanguageChange,
  onThemeChange,
  onExecuteAction,
  triggerAppLoadedEvent,
  onAppInit,
  triggerAppFilterEvent,
} = useAppContainer()
const workspaceStore = useWorkspaceStore()
const { user, workstation, availableStations } = storeToRefs(workspaceStore)
const { locale, availableLocales } = useI18n()
const { getTranslation } = useTranslations('')
const logger = useLogger()
const { getEnv } = useEnv()
const promiseResolver = ref<(value: boolean) => void | undefined>()

const setPiniaCustomProperties = () => {
  getActivePinia()?.use(({ store }) => {
    store.router = markRaw(router)
    store.getTranslation = getTranslation
  })
}

setPiniaCustomProperties()

// Init after settings properties, because we need getTranslations
const appContainerConfigStore = useAppContainerConfigStore()
const { hasLanguageChanged } = storeToRefs(appContainerConfigStore)

const resetStores = () => {
  const activePinia = getActivePinia()

  if (activePinia) {
    Object.entries(activePinia.state.value).forEach(([storeName, state]) => {
      if (
        storeName !== keycloakStoreId &&
        storeName !== apiVersionStoreId &&
        storeName !== workspaceStoreId &&
        storeName !== appContainerConfigStoreId
      ) {
        const storeDefinition = defineStore(storeName, state)
        const store = storeDefinition(activePinia)
        store.$reset()
      }
    })
  }
}

const onHandleExecuteAppContainerAction = async (data: {
  data: {
    payload: { url: string; actionName: string }
  }
}) => {
  if (data.data.payload.actionName === AppContainerActionEnum.SwitchStation) {
    logger.info('Switch station')
    resetStores()
    workspaceStore.clearWorkstation()
    logger.info('Disconnect message events')
    disconnectMessageEvents()
    appContainerConfigStore.updateHeaderSubTitle()
    await router.push({ name: 'station' })
  }
}

const useLatestUserPermissionsCall = async () => {
  const versionResponse = await getVersions()
  let useLatestCall = false
  if (Object.keys(versionResponse).length > 0) {
    const versionsSorted = versionResponse.data.sort((item1, item2) =>
      item1.version > item2.version ? -1 : 1
    )
    if (Number(versionsSorted[0].version) >= 2 && versionsSorted[0].supported) {
      useLatestCall = true
    }
  }

  return useLatestCall
}

const updateSwitchStationByPermission = async () => {
  const useLatestPermissionCall: boolean = await useLatestUserPermissionsCall()
  try {
    // check if old or new call should be used
    const response = useLatestPermissionCall
      ? await getUserPermissionsV2()
      : await getUserPermissions()

    const pcotsResource = response?.find(
      (permission: UserPermissionType) => permission.rsname === 'Pcots'
    )
    if (
      pcotsResource?.scopes?.some((scope: string) => scope === 'SWITCH_STATION')
    ) {
      logger.info('User has permission to switch station')
      appContainerConfigStore.addMenuItem(AppContainerActionEnum.SwitchStation)
    } else {
      logger.info('User has no permission to switch station')
      appContainerConfigStore.removeMenuItem(
        AppContainerActionEnum.SwitchStation
      )
    }
  } catch (e) {
    logger.error('Failed to get user roles')
    appContainerConfigStore.removeMenuItem(AppContainerActionEnum.SwitchStation)
  }
}

const updateAppContainerConfigLanguage = () => {
  const appContainerConfigStore = useAppContainerConfigStore()
  appContainerConfigStore.languageChanged()
}

const hasLanguageChangedTimedOut = ref(false)
let timeout: ReturnType<typeof setTimeout>
const handleLanguageChange = () => {
  hasLanguageChanged.value = true
  clearTimeout(timeout)
  logger.info('Language changed to', locale.value)
  i18n.global.locale.value = locale.value
  updateAppContainerConfigLanguage()
  if (promiseResolver.value && !hasLanguageChangedTimedOut.value) {
    promiseResolver.value(true)
  }
}

const initAppOnLanguageChange = async () => {
  const waitForLanguageChangePromise = new Promise<boolean>((resolve) => {
    promiseResolver.value = resolve
  })
  const waitingDuration = 500
  timeout = setTimeout(() => {
    if (promiseResolver.value && !hasLanguageChanged.value) {
      promiseResolver.value(false)
      hasLanguageChangedTimedOut.value = true
      logger.info(
        `Waiting for language change timed out (took longer than ${waitingDuration}ms)`
      )
    }
  }, waitingDuration)
  onAppInit()
  await waitForLanguageChangePromise
}

onMounted(async () => {
  onLanguageChange(locale, handleLanguageChange, availableLocales)
  onThemeChange(colorMode, undefined, ThemeEnum)

  // Trigger app loaded event after language change registration
  triggerAppLoadedEvent()
  await initAppOnLanguageChange()

  // enable portal app filtering with Ctrl+K keys
  triggerAppFilterEvent()

  const appContainerConfigStore = useAppContainerConfigStore()
  appContainerConfigStore.languageChanged()

  await workspaceStore.loadUser()
  await updateSwitchStationByPermission()
  await workspaceStore.loadAvailableStations()

  onExecuteAction<typeof onHandleExecuteAppContainerAction>(
    onHandleExecuteAppContainerAction
  )

  // Uncomment this code if you want to use user idle tracking
  // useAppIdle().registerIdleSensor()

  if (workspaceStore.hasWorkstation()) {
    if (!workspaceStore.isWorkstationAvailable()) {
      logger.warn(
        'Route to station selection, because workstation is not available!'
      )
      await router.push('/station')
    } else {
      const availableWorkstation = workspaceStore.availableStations.find(
        (x) => x.id === workspaceStore.workstation.id
      )
      workspaceStore.workstation.name = availableWorkstation!.name
      workspaceStore.workstation.path = availableWorkstation!.path
    }
  }
})

const shouldRender = computed((): boolean => {
  return !!(
    user.value.id &&
    user.value.id !== '1' &&
    availableStations.value.length > 0 &&
    (hasLanguageChanged.value || hasLanguageChangedTimedOut.value)
  )
})

watch(
  workstation,
  (value, oldValue) => {
    if (oldValue?.id && oldValue?.id !== '' && oldValue?.id !== value.id) {
      logger.info('Disconnect message events')
      disconnectMessageEvents()
    }
    if (value.id !== '' && oldValue?.id !== value.id) {
      logger.info('Connect message events')
      connectMessageEvents()
      appContainerConfigStore.updateHeaderSubTitle()
    }
  },
  { deep: true, immediate: true }
)
onUnmounted(() => {
  logger.info('Disconnect message events')
  disconnectMessageEvents()
})
if (getEnv('MODE') === 'development') {
  const keys = useMagicKeys()
  const SWITCH_STATION = 'Ctrl+Alt+S'
  const switchStation = keys[SWITCH_STATION]
  logger.info(`Register dev keystroke ${SWITCH_STATION} for switch station`)
  watch(switchStation, (v) => {
    logger.info(
      `Route to switch station was triggered by pressing ${SWITCH_STATION}`
    )
    if (v && workspaceStore.hasWorkstation()) {
      onHandleExecuteAppContainerAction({
        data: {
          payload: {
            actionName: AppContainerActionEnum.SwitchStation,
            url: '',
          },
        },
      })
    }
  })
}
</script>

<template>
  <Layout v-if="shouldRender" />
</template>

<style lang="scss">
@import '@/styles/globals.scss';
</style>
