import { config } from '@vue/test-utils'
import { LoggerServicePlugin } from '@tgw-components/core'
import TgwWebComponents from '@tgw-components/web'
import ElementPlus from 'element-plus'
import { beforeAll, vi } from 'vitest'
import { configureDevExpressLicence } from './devextreme-key'
import { unitTestLoggerConfig } from '@/helpers/loggerHelper'

config.global.plugins = [
  TgwWebComponents,
  [LoggerServicePlugin, unitTestLoggerConfig],
  ElementPlus,
]

beforeAll(() => {
  configureDevExpressLicence()
  const { getComputedStyle } = window
  window.getComputedStyle = (elt) => getComputedStyle(elt)
})

vi.mock('devextreme/core/utils/window', async () => {
  const actualModule = (await vi.importActual(
    'devextreme/esm/core/utils/window'
  )) as any
  return {
    __esModule: true,
    ...actualModule,
    hasWindow: () => false,
    getWindow: () => {
      return {
        length: 0,
        nodeType: 1,
        window: {},
        getComputedStyle: vi.fn(() => ({
          fontFamily: 'dx.generic.light',
        })),
      }
    },
  }
})

vi.mock('devextreme/core/utils/position', async () => {
  const actualModule = (await vi.importActual(
    'devextreme/esm/core/utils/position'
  )) as any
  return {
    __esModule: true,
    ...actualModule,
    getBoundingRect: () => ({
      return: {
        width: 100,
        height: 100,
      },
    }),
  }
})
vi.mock('devextreme/core/utils/size', async () => {
  const actualModule = (await vi.importActual(
    'devextreme/esm/core/utils/size'
  )) as any
  return {
    __esModule: true,
    ...actualModule,
    getOffset: () => ({
      return: {
        top: 0,
        left: 0,
      },
    }),
  }
})
