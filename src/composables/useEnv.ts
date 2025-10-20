const env: any = {}

export const useEnv = () => {
  const getEnv = (key: string) => {
    if (!env[key]) {
      return import.meta.env[key]
    } else {
      return env[key]
    }
  }

  const setEnv = (key: string, value: string) => {
    env[key] = value
  }

  return {
    getEnv,
    setEnv,
  }
}
