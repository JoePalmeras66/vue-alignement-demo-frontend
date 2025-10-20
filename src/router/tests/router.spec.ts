import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { Router, createRouter, createWebHashHistory } from 'vue-router'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'
import { setConsoleLogger } from '@/helpers/loggerHelper'
import { routerBeforeEach, routes } from '@/router'

setActivePinia(createPinia())
describe('Test router', async () => {
  let testingRouter: Router
  const workspaceStore = useWorkspaceStore()
  setConsoleLogger()

  beforeEach(() => {
    workspaceStore.clearWorkstationIdFromLocalStorage()
    workspaceStore.$reset()
    testingRouter = createRouter({
      history: createWebHashHistory('testing'),
      routes,
    })
    testingRouter.beforeEach(routerBeforeEach)
  })

  const initRouter = async () => {
    await testingRouter.push('/')
    await testingRouter.isReady()
  }

  it('should route to station selection', async () => {
    await initRouter()
    expect(testingRouter.currentRoute.value.name).toBe('station')
  })

  it('should load workstationId from localStorage and route to station selection', async () => {
    workspaceStore.workstation.id = '0816'
    workspaceStore.saveWorkstationIdToLocalStorage()
    workspaceStore.workstation.id = ''
    await initRouter()
    expect(testingRouter.currentRoute.value.name).toBe('station')
    expect(workspaceStore.workstation.id).toBe('0816')
  })

  it('should skip station selection when workstation is available', async () => {
    workspaceStore.workstation.id = '0815'
    await initRouter()
    expect(testingRouter.currentRoute.value.name).toBe('home')
  })
})
