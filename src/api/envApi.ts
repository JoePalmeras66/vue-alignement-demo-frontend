import api from './api'

const envUrl = './'

const URLS = {
  fetchEnvUrl: 'env',
}

export const fetchEnvironmentVariables = (config = {}) => {
  return api.get(URLS.fetchEnvUrl, {
    baseURL: envUrl,
    ...config,
  })
}
