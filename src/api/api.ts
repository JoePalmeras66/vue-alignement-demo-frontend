import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { useLogger } from '@tgw-components/core'

// Axios retry config
const retryAmount = 2
const waitTime = 300
const timeout = 10000

// Default config for the axios instance
const axiosParams = {
  // Set different base URL based on the environment
  baseURL:
    import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '/',
  timeout,
}

const axiosInstance = axios.create(axiosParams)

interface RequestRetry {
  [key: string]: number
}
const requestRetries = reactive({} as RequestRetry)
// Checks if there is a requestRetry with the given url
const requestRetryExists = (config: AxiosRequestConfig) => {
  const retry = requestRetries[`${config.url}-${config.data}`]

  return !!retry
}

// Gets the retry count and creates a new requestRetry if there is none with the given url
const getRetryCount = (config: AxiosRequestConfig) => {
  const retry = requestRetries[`${config.url}-${config.data}`]

  if (retry) {
    return retry
  } else {
    requestRetries[`${config.url}-${config.data}`] = 1
    return 1
  }
}

// Increments the retry count of the given url
const incrementRetryCount = (config: AxiosRequestConfig) => {
  requestRetries[`${config.url}-${config.data}`] =
    requestRetries[`${config.url}-${config.data}`] + 1
}

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    if (requestRetryExists(response.config)) {
      // remove request from requestRetries
      delete requestRetries[`${response.config.url}-${response.config.data}`]
    }

    return response
  },
  async (error) => {
    const logger = useLogger()
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (
      getRetryCount(error.config) <= retryAmount &&
      !error.status &&
      (error.message === 'Network Error' || error.code === 'ECONNABORTED')
    ) {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (logger !== undefined) {
            logger.info(
              `${getRetryCount(error.config)} retry attempt of request ${
                error.request.responseURL
              }`,
              error
            )
            incrementRetryCount(error.config)
            resolve(axiosInstance(error.config))
          }
        }, waitTime)
      })
    } else if (
      getRetryCount(error.config) > retryAmount &&
      !error.status &&
      (error.message === 'Network Error' || error.code === 'ECONNABORTED') &&
      logger !== undefined
    ) {
      logger.error(
        `Request ${error.request.responseURL} failed after ${getRetryCount(
          error.config
        )} tries!`,
        error
      )
      if (requestRetryExists(error.config)) {
        // remove request from requestRetries
        delete requestRetries[`${error.config.url}-${error.config.data}`]
      }
    }

    return Promise.reject(error)
  }
)

const didAbort = (error: any) => axios.isCancel(error)

const getCancelSource = () => axios.CancelToken.source()

const withAbort =
  (fn: any) =>
  async (...args: Array<any>) => {
    const originalConfig = args[args.length - 1]
    // Extract abort property from the config
    const { abort, ...config } = originalConfig

    // Create cancel token and abort method only if abort
    // function was passed

    if (typeof abort === 'function') {
      const { cancel, token } = getCancelSource()
      config.cancelToken = token
      abort(cancel)
    }

    try {
      // Pass all arguments from args besides the config
      return await fn(...args.slice(0, args.length - 1), config)
    } catch (error) {
      // Add "aborted" property to the error if the request was cancelled
      didAbort({ error }) && ((error as any).aborted = true)
      throw error
    }
  }

// Main api function
const api = (axios: AxiosInstance) => {
  return {
    get: (url: string, config: AxiosRequestConfig = {}) =>
      withAbort(axios.get)(url, config),
    post: (url: string, body: unknown, config: AxiosRequestConfig = {}) =>
      withAbort(axios.post)(url, body, config),
    put: (url: string, body: unknown, config: AxiosRequestConfig = {}) =>
      withAbort(axios.put)(url, body, config),
    patch: (url: string, body: unknown, config: AxiosRequestConfig = {}) =>
      withAbort(axios.patch)(url, body, config),
    delete: (url: string, config: AxiosRequestConfig = {}) =>
      withAbort(axios.delete)(url, config),
  }
}
/**
 *
 * @return {AxiosInstance}
 */
export const getAxiosInstance = () => axiosInstance
export default api(axiosInstance)
