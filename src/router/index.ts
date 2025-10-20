import {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
  createRouter,
  createWebHashHistory,
} from 'vue-router'
import LivePickTsView from '@/views/LivePickTsView.vue'
import ScanModificationView from '@/views/ScanModificationView/ScanModificationView.vue'
import Troubleshooting from '@/views/Troubleshooting/Troubleshooting.vue'
import WorkstationSelectionView from '@/views/WorkstationSelectionView/WorkstationSelectionView.vue'
import LoadCarrierDetailsView from '@/views/LoadCarrierDetailsView/LoadCarrierDetailsView.vue'
import AdvancedCycleCountView from '@/views/AdvancedCycleCountView/AdvancedCycleCountView.vue'
import ExitRobotModeView from '@/views/ExitRobotModeView.vue'
import WorkstationInactiveView from '@/views/WorkstationInactiveView/WorkstationInactiveView.vue'
import RobotInstructionView from '@/views/RobotInstructionView.vue'
import MoveRobotToHomeView from '@/views/MoveRobotToHomeView.vue'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'

const { getEnv } = useEnv()

export const routes = [
  {
    path: '/',
    name: 'home',
    component: LivePickTsView,
  },
  {
    path: '/troubleshooting',
    name: 'troubleshooting',
    component: Troubleshooting,
  },
  {
    path: '/editScans',
    name: 'editScans',
    component: ScanModificationView,
  },
  {
    path: '/station',
    name: 'station',
    component: WorkstationSelectionView,
  },
  {
    path: '/loadCarrierDetails',
    name: 'loadCarrierDetails',
    component: LoadCarrierDetailsView,
  },
  {
    path: '/advancedCycleCount',
    name: 'advancedCycleCount',
    component: AdvancedCycleCountView,
  },
  {
    path: '/robotInstruction:instruction',
    name: 'robotInstruction',
    component: RobotInstructionView,
  },
  {
    path: '/exitRobotMode',
    name: 'exitRobotMode',
    component: ExitRobotModeView,
  },
  {
    path: '/inactive',
    name: 'inactive',
    component: WorkstationInactiveView,
  },
  {
    path: '/moveRobotToHome',
    name: 'moveRobotToHome',
    component: MoveRobotToHomeView,
  },
] as RouteRecordRaw[]

export const routerBeforeEach = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const workspaceStore = useWorkspaceStore()
  if (to.fullPath === '/station') {
    // Load workstationId from url param or local storage
    workspaceStore.loadWorkstationId(to)
  } else if (!workspaceStore.hasWorkstation()) {
    next('/station')
    return
  }
  next()
}

export const router = createRouter({
  history: createWebHashHistory(getEnv('BASE_URL')),
  routes,
})
router.beforeEach(routerBeforeEach)
