<script setup lang="ts">
import type { TabsPaneContext } from 'element-plus'
import { CycleCountTabs } from '@/types/CycleCountTabs'
import AdvancedCycleCountTabCounted from '@/components/AdvancedCycleCountTabCounted/AdvancedCycleCountTabCounted.vue'
import AdvancedCycleCountTabDetails from '@/components/AdvancedCycleCountTabDetails/AdvancedCycleCountTabDetails.vue'
import AdvancedCycleCountTabScans from '@/components/AdvancedCycleCountTabScans/AdvancedCycleCountTabScans.vue'
import { useApiDataHelper } from '@/helpers/useApiDataHelper/useApiDataHelper'
import {
  BarcodeDataType,
  CompartmentType,
  CycleCountTaskType,
  LoadCarrierType,
  MultiItemCycleCountTaskType,
} from '@/types/Api/pcots/PcotsApiModel'
import {
  BarcodeTypeEnum,
  PcotsLocationEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { BarcodeGroup } from '@/types/BarcodeGroup'

const props = defineProps<Props>()
const emit = defineEmits<{
  quantityChanged: [quantity: number]
  barcodesSelected: [barcodes: BarcodeDataType[]]
  activeTabChanged: [tab: CycleCountTabs | undefined]
}>()
const { isScanEach, isMultiItemCycleCountTask, getBarcodeGroups } =
  useApiDataHelper()
interface Props {
  loadCarrier: LoadCarrierType
  task: CycleCountTaskType | MultiItemCycleCountTaskType
  pcotsLocation: PcotsLocationEnum
  barcodes?: BarcodeDataType[]
  selectedCompartment?: CompartmentType
}
interface TabInfo {
  name: CycleCountTabs
  disabled: boolean
  component: any
}

const { t } = useI18n()
const activeTab = ref<CycleCountTabs>()
const lastClickedTab = ref<CycleCountTabs>()
const tabInfos = ref<TabInfo[]>([
  {
    name: CycleCountTabs.counted,
    disabled: false,
    component: shallowRef(AdvancedCycleCountTabCounted),
  },
  {
    name: CycleCountTabs.scanned,
    disabled: false,
    component: shallowRef(AdvancedCycleCountTabScans),
  },
  {
    name: CycleCountTabs.item_type_details,
    disabled: false,
    component: shallowRef(AdvancedCycleCountTabDetails),
  },
])

const barcodeGroups = computed((): BarcodeGroup[] => {
  if (props.task) {
    return getBarcodeGroups(props.task, props.barcodes ?? [])
  }
  return []
})

const currentBarcodes = computed(() => {
  if (isMultiItemCycleCountTask(props.task)) {
    const groups = barcodeGroups.value.filter((barcodeGroup) =>
      props.selectedCompartment?.items.find((item) =>
        item.item.gtins.includes(
          barcodeGroup.barcodes.find(
            (barcode) => barcode.barcodeType === BarcodeTypeEnum.Gtin
          )?.barcode ?? ''
        )
      )
    )
    const barcodes: BarcodeDataType[] = []
    groups.forEach((group) =>
      group.barcodes.forEach((barcode) => barcodes.push(barcode))
    )
    return barcodes
  }
  return props.barcodes
})

const isTabShown = (tabName: CycleCountTabs) => {
  if (tabName === CycleCountTabs.counted) {
    if (props.pcotsLocation === PcotsLocationEnum.Source) {
      return !isScanEach(props.task)
    } else {
      return false
    }
  } else if (tabName === CycleCountTabs.item_type_details) {
    return true
  } else if (tabName === CycleCountTabs.scanned) {
    if (props.pcotsLocation === PcotsLocationEnum.Source) {
      return isScanEach(props.task) && (currentBarcodes.value?.length ?? 0) > 0
    }
    return false
  }
}

const visibleTabInfos = computed(() => {
  const visibleTabs = []
  for (const tabInfo of tabInfos.value) {
    if (isTabShown(tabInfo.name)) {
      visibleTabs.push(tabInfo)
    }
  }
  return visibleTabs
})

const getTranslation = (key: string) => {
  return t(`advanced-cycle-count-tabs.${key}`)
}

const onQuantityChanged = (quantity: number) => {
  emit('quantityChanged', quantity)
}
const onBarcodesSelected = (barcodes: BarcodeDataType[]) => {
  emit('barcodesSelected', barcodes)
}

const isTabDisabled = (tabName?: CycleCountTabs) => {
  if (tabName) {
    return visibleTabInfos.value.find((tab) => tab.name === tabName)?.disabled
  }
}

const selectFirstEnabledTab = () => {
  const firstVisibleTab = visibleTabInfos.value.find((tab) => !tab.disabled)
  if (firstVisibleTab) {
    activeTab.value = firstVisibleTab.name
  }
}

const selectLastClickedTab = () => {
  if (
    lastClickedTab.value !== undefined &&
    isTabShown(lastClickedTab.value) &&
    !isTabDisabled(lastClickedTab.value)
  ) {
    activeTab.value = lastClickedTab.value
  } else {
    selectFirstEnabledTab()
  }
}

const onTabClick = (pane: TabsPaneContext) => {
  if (!isTabDisabled(pane.paneName as CycleCountTabs)) {
    lastClickedTab.value = pane.paneName as CycleCountTabs
  }
}

watch(
  () => props.selectedCompartment,
  () => {
    const countedTab = tabInfos.value.find(
      (tabInfo) => tabInfo.name === CycleCountTabs.counted
    )
    const scannedTab = tabInfos.value.find(
      (tabInfo) => tabInfo.name === CycleCountTabs.scanned
    )

    if (scannedTab && isScanEach(props.task)) {
      scannedTab.disabled =
        props.selectedCompartment?.cycleCountState ===
          CycleCountState.finished ||
        props.selectedCompartment?.cycleCountState === CycleCountState.toDo
    } else if (countedTab) {
      countedTab.disabled = !!(
        props.selectedCompartment &&
        (props.selectedCompartment.cycleCountState ===
          CycleCountState.finished ||
          props.selectedCompartment.cycleCountState === CycleCountState.toDo)
      )
    }

    if (
      (props.selectedCompartment && activeTab.value === undefined) ||
      isTabDisabled(activeTab.value) ||
      activeTab.value !== lastClickedTab.value
    ) {
      selectLastClickedTab()
    }
  },
  { deep: true }
)
watch(activeTab, () => {
  emit('activeTabChanged', activeTab.value)
})

watch(visibleTabInfos, () => {
  if (visibleTabInfos.value.length === 1) {
    activeTab.value = visibleTabInfos.value[0].name
  }
})

onMounted(() => {
  if (activeTab.value === undefined) {
    selectFirstEnabledTab()
  }
})
</script>

<template>
  <div class="advanced-cycle-count-tabs">
    <TgwTabs v-model="activeTab" :card="true" @tab-click="onTabClick">
      <TgwTabPane
        v-for="tabInfo of visibleTabInfos"
        :key="tabInfo.name"
        :name="tabInfo.name"
        :disabled="tabInfo.disabled"
      >
        <template #label>
          <div class="tabs-label">
            <span class="tabs-label-header">
              {{ getTranslation(tabInfo.name) }}
            </span>
          </div>
        </template>
        <component
          :is="tabInfo.component"
          :load-carrier="loadCarrier"
          :task="task"
          :barcodes="currentBarcodes"
          :selected-compartment="selectedCompartment"
          @quantity-changed="onQuantityChanged"
          @barcodes-selected="onBarcodesSelected"
        />
      </TgwTabPane>
    </TgwTabs>
  </div>
</template>

<style scoped lang="scss">
.advanced-cycle-count-tabs {
  box-shadow: var(--tgw-dropshadow-soft);
  background: var(--tgw-bg-30);
  display: flex;
  flex-direction: column;
  flex: 1;

  .tgw-tabs {
    display: flex;
    flex-direction: column;
    flex: 1;
    background: var(--tgw-bg-30);
  }

  :deep(.tgw-tabs__header) {
    border-bottom: none;
    width: 100%;

    .tgw-tabs__nav-wrap {
      width: 100%;
      display: flex;
      overflow: hidden;

      .tgw-tabs__nav-scroll {
        width: 100%;
        .tgw-tabs__nav {
          width: 100%;
        }
      }
    }

    .tgw-tabs__active-bar {
      display: none;
      transition: none;
    }

    .tgw-tabs__item {
      transition: none;
      height: 80px;
      width: 100%;
      background-color: var(--tgw-bg-20);
      border: none;
      margin-right: -1px;
      box-shadow: inset 0 -9px 10px -10px var(--tgw-bg-overlay),
        -1px 0 0 0 var(--tgw-line-00);

      &.is-active {
        z-index: 10;
        color: var(--tgw-primary);
        //background: red;
        background-color: var(--tgw-bg-30);
        box-shadow: inset 0 6px 0 0 var(--tgw-primary),
          0 0 10px -3px var(--tgw-bg-overlay);

        strong {
          color: var(--tgw-primary);
        }

        .tabs-label-info {
          strong {
            color: var(--tgw-text-primary);
          }
        }

        &:hover {
          color: var(--tgw-primary);
        }
      }

      &.is-disabled {
        background-color: var(--tgw-bg-disabled);
        color: var(--tgw-text-sub);

        .tabs-label-info {
          color: var(--tgw-text-sub);
        }

        &:hover {
          color: var(--tgw-text-sub);
          cursor: not-allowed;
        }
      }

      &:hover {
        color: var(--tgw-text-secondary);
      }
    }
  }

  :deep(.tgw-tabs__content) {
    flex: 1;
    padding: 0;
    background: var(--tgw-bg-30);

    .tgw-tab-pane {
      height: 100%;

      .troubleshooting-tabs-scrollbar {
        min-height: 150px;
      }
    }
  }

  .tabs-label {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .tabs-label-header {
      font-size: 32px;
      line-height: 38px;
      font-weight: normal;
      text-transform: uppercase;
      user-select: none;
    }
  }
}
</style>
