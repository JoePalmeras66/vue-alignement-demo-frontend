import { computed, reactive, ref, toRefs } from 'vue'
import { upperFirst } from 'lodash-es'
import { AxiosError } from 'axios'
import { apiStatus } from '../constants/apiStatus'
import { MessageTypeValidator } from '@/types/Api/pcots/PcotsApiModel'

const { IDLE, SUCCESS, PENDING, ERROR } = apiStatus

/**
 * Create an object of computed statuses
 *
 * @param {Symbol} status
 * @param {String} apiName
 */
const createNormalisedApiStatuses = (status: any, apiName: any) => {
  const normalisedApiStatuses = {}

  for (const [statusKey, statusValue] of Object.entries(apiStatus)) {
    let propertyName = ''
    // Create a property name for each computed status
    if (apiName) {
      propertyName = `${apiName}Status${upperFirst(statusKey.toLowerCase())}`
    } else {
      propertyName = `status${statusKey.toLowerCase()}`
    }

    // Create a computed that returns true/false based on
    // the currently selected status
    ;(normalisedApiStatuses as any)[propertyName] = computed(
      () => statusValue === status.value
    )
  }
  return normalisedApiStatuses
}

/**
 * @param {string} apiName
 * @param {function} fn
 * @param {object} config
 */
export const useApi = <T>(apiName: any, fn: any, config: any = {}) => {
  const { responseAdapter } = config
  // Reactive values to store data and API status
  const result = reactive({
    response: {} as T,
    error: '',
  })
  const status = ref(IDLE)

  /**
   * Initialise the api request
   */
  const exec = async (...args: any[]) => {
    try {
      status.value = PENDING
      const response = await fn(...args)
      result.response =
        typeof responseAdapter === 'function'
          ? responseAdapter(response)
          : response
      status.value = SUCCESS
    } catch (error: any) {
      if (error?.name === 'AxiosError') {
        const axiosError = error as AxiosError
        const messageParseResult = MessageTypeValidator.safeParse(
          axiosError?.response?.data
        )
        if (messageParseResult.success) {
          result.response = { data: messageParseResult.data } as any
        }
      }
      result.error = error as string
      status.value = ERROR
    }
  }

  const setStatus = (nextStatus: any) => {
    status.value = nextStatus
  }

  return {
    ...toRefs(result),
    status,
    exec,
    setStatus,
    ...createNormalisedApiStatuses(status, apiName),
  }
}
