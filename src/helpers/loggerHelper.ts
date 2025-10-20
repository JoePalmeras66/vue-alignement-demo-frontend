import {
  ILoggerConfig,
  createLoggerService,
  setGlobalLogger,
} from '@tgw-components/core'

export const unitTestLoggerConfig = {
  url: 'http://127.0.0.1', // usually a fluentD endpoint https://www.fluentd.org/
  production: false, // if false, the logger will only log to the console
  enableAutoLog: true, // if true, the logger will automatically log all errors to the host (optional)
} as ILoggerConfig

export const setConsoleLogger = () => {
  setGlobalLogger(createLoggerService(unitTestLoggerConfig))
}
