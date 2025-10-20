import { defineStore } from 'pinia'
import { SupportedVersionType } from '@/types/Api/pcots/PcotsApiModel'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { ApiVersionEnum } from '@/types/Api/ApiVersionEnum'

export const apiVersionStoreId = 'apiVersion'

export const useApiVersionStore = defineStore(apiVersionStoreId, {
  persist: {
    storage: sessionStorage,
  },
  state: () => ({
    supportedVersionsByFrontend: {
      [ApiNameEnum.pcots]: [ApiVersionEnum.v1],
      [ApiNameEnum.pcotsExt]: [ApiVersionEnum.v1, ApiVersionEnum.v2],
    },
    supportedVersionsByBackend: {} as {
      [key in ApiNameEnum]: SupportedVersionType[]
    },
  }),
  actions: {
    getSupportedVersionsByFrontend(
      apiName: ApiNameEnum
    ): ApiVersionEnum[] | undefined {
      switch (apiName) {
        case ApiNameEnum.pcots:
          return this.supportedVersionsByFrontend[ApiNameEnum.pcots]
        case ApiNameEnum.pcotsExt:
          return this.supportedVersionsByFrontend[ApiNameEnum.pcotsExt]
      }
    },
    getSupportedVersionsByBackend(
      apiName: ApiNameEnum
    ): SupportedVersionType[] | undefined {
      switch (apiName) {
        case ApiNameEnum.pcots:
          return this.supportedVersionsByBackend[ApiNameEnum.pcots]
        case ApiNameEnum.pcotsExt:
          return this.supportedVersionsByBackend[ApiNameEnum.pcotsExt]
      }
    },
    async loadVersionsByApi(apiName: ApiNameEnum) {
      let response: SupportedVersionType[] = []
      if (apiName === ApiNameEnum.pcotsExt) {
        response = await getSupportedVersionsPcotsExt()
      } else if (apiName === ApiNameEnum.pcots) {
        response = await getSupportedVersionsPcots()
      }
      if (response && response.length > 0) {
        switch (apiName) {
          case ApiNameEnum.pcots:
            this.supportedVersionsByBackend.pcots = response
            break
          case ApiNameEnum.pcotsExt:
            this.supportedVersionsByBackend['pcots-ext'] = response
            break
        }
      }
    },
    async loadVersions() {
      const workspaceStore = useWorkspaceStore()
      await this.loadVersionsByApi(ApiNameEnum.pcots)
      if (workspaceStore.isExtendedApiSupported) {
        await this.loadVersionsByApi(ApiNameEnum.pcotsExt)
      }
    },
    isVersionSupported(apiName: ApiNameEnum, apiVersion: ApiVersionEnum) {
      const majorVersion = apiVersion.substring(1)
      const supportedVersionsByFrontend =
        this.getSupportedVersionsByFrontend(apiName)
      const supportedVersionsByBackend =
        this.getSupportedVersionsByBackend(apiName)

      if (supportedVersionsByFrontend && supportedVersionsByBackend) {
        const isSupportedByFrontend =
          supportedVersionsByFrontend.includes(apiVersion)
        const isSupportedByBackend =
          supportedVersionsByBackend.filter((supportedVersion) =>
            supportedVersion.version.startsWith(majorVersion)
          ).length > 0
        return isSupportedByFrontend && isSupportedByBackend
      }
      return false
    },
    getHighestSupportedVersionByApi(apiName: ApiNameEnum) {
      // Start from highest version
      for (const apiVersion of Object.keys(ApiVersionEnum).reverse()) {
        if (this.isVersionSupported(apiName, apiVersion as ApiVersionEnum)) {
          return apiVersion
        }
      }
      return ''
    },
  },
})
