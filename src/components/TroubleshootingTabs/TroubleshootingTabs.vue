<script setup lang="ts">
import { ComputedRef } from 'vue'
import { useTranslations } from '@/composables/useTranslations'
import { ProblemCategoryEnum } from '@/types/Api/pcots/PcotsApiModelEnums'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore/useWorkspaceStore'

interface Props {
  sourceLcId?: string | null
  targetLcId?: string | null
  selectedSourceLcProblems: number
  selectedTargetLcProblems: number
  selectedTaskProblems: number
  isLoading?: boolean
}
interface TabInfoItem {
  loadCarrierId: ComputedRef<undefined | string>
  name: ProblemCategoryEnum
  selectedProblems: ComputedRef<number>
}
const props = defineProps<Props>()
const { getTranslation } = useTranslations('troubleshooting.tabs')
const properties = toRefs(props)
const activeTab = ref(ProblemCategoryEnum.Task)
const workspaceStore = useWorkspaceStore()

const sourceLcIdComputed = computed(() => {
  if (props.sourceLcId === null) {
    return undefined
  }

  return props.sourceLcId
})

const targetLcIdComputed = computed(() => {
  if (props.targetLcId === null) {
    return undefined
  }

  return props.targetLcId
})

const scrollBarHeight = computed(() => {
  return 'calc(100vh - 134px - 99px - 236px)'
})

const tabInfos = ref<TabInfoItem[]>([
  {
    loadCarrierId: sourceLcIdComputed,
    name: ProblemCategoryEnum.Source,
    selectedProblems: properties.selectedSourceLcProblems,
  } as TabInfoItem,
  {
    loadCarrierId: ref<string>(ProblemCategoryEnum[ProblemCategoryEnum.Task]),
    name: ProblemCategoryEnum.Task,
    selectedProblems: properties.selectedTaskProblems,
  } as TabInfoItem,
  {
    loadCarrierId: targetLcIdComputed,
    name: ProblemCategoryEnum.Target,
    selectedProblems: properties.selectedTargetLcProblems,
  } as TabInfoItem,
])

onMounted(() => {
  if (sourceLcIdComputed.value) {
    activeTab.value = ProblemCategoryEnum.Source
  }
})
</script>

<template>
  <TgwTabs
    v-model="activeTab"
    v-loading="isLoading"
    :card="true"
    class="troubleshooting-tabs"
    :class="{
      'right-to-left': workspaceStore.isRightToLeft(),
    }"
  >
    <TgwTabPane
      v-for="tabInfo of tabInfos"
      :key="tabInfo.name"
      :label="tabInfo.name"
      :disabled="tabInfo.loadCarrierId === undefined"
      :name="tabInfo.name"
    >
      <template #label>
        <div class="tabs-label">
          <span class="tabs-label-header">
            {{ getTranslation(tabInfo.name.toString().toLowerCase()) }}
            <strong
              v-if="
                tabInfo.loadCarrierId !== undefined &&
                tabInfo.loadCarrierId !== ProblemCategoryEnum.Task
              "
              >#{{ tabInfo.loadCarrierId }}</strong
            >
          </span>
          <template v-if="tabInfo.loadCarrierId !== undefined">
            <span class="tabs-label-info">
              {{
                getTranslation('n_problems_selected', tabInfo.selectedProblems)
              }}
            </span>
          </template>
        </div>
      </template>
      <TgwScrollbar
        :height="scrollBarHeight"
        class="troubleshooting-tabs-scrollbar"
      >
        <slot :name="tabInfo.name" />
      </TgwScrollbar>
    </TgwTabPane>
  </TgwTabs>
</template>

<style scoped lang="scss">
.tgw-tabs.tgw-tabs--top.is-card.troubleshooting-tabs {
  display: flex;
  flex-direction: column;
  flex: 1;
  user-select: none;
  border: none;
  border-top: 1px solid var(--tgw-line-10);

  :deep(.tgw-tabs__header) {
    border-bottom: none;
    width: 100%;

    .tgw-tabs__nav-wrap {
      width: 100%;
      display: flex;

      .tgw-tabs__nav-scroll {
        width: 100%;
        .tgw-tabs__nav {
          width: 100%;
        }
      }
    }

    .tgw-tabs__item {
      transition: none;
      height: 100px;
      width: 100%;
      background-color: var(--tgw-bg-20);
      border: none;
      margin-right: -1px;
      box-shadow: inset 0 -9px 10px -10px var(--tgw-bg-overlay),
        -1px 0 0 0 var(--tgw-line-00);

      strong {
        color: var(--tgw-text-primary);
      }

      &.is-active {
        z-index: 10;
        color: var(--tgw-primary);
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
    // 100vh - header height - tab-navbar height - footer height
    height: calc(100vh - 134px - 99px - 236px);
    padding: 0;

    .tgw-tab__pane {
      height: 100%;

      .troubleshooting-tabs-scrollbar {
        min-height: 150px;
        border-bottom: none;
      }
    }
  }

  &.right-to-left {
    :deep(.tgw-tabs__header) {
      .tgw-tabs__nav {
        flex-direction: row-reverse;

        .tgw-tabs__nav-scroll {
          width: 100%;
        }
      }
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

    strong {
      user-select: text;
    }
  }

  .tabs-label-info {
    color: var(--tgw-text-secondary);
    font-size: 16px;
    line-height: 19px;
    margin-top: 6px;
  }
}
</style>
