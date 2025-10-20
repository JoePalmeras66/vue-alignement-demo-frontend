<script setup lang="ts">
import { Ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { getSupportedProblems } from '@/composables/usePcotsApi'
import {
  LoadCarrierType,
  ProblemDefinitionType,
  ProblemType,
} from '@/types/Api/pcots/PcotsApiModel'
import { useTroubleshootingStore } from '@/stores/useTroubleshootingStore/useTroubleshootingStore'
import { useLoadCarrierStore } from '@/stores/useLoadCarrierStore/useLoadCarrierStore'
import { TroubleshootingButtonAction } from '@/types/TroubleshootingButtonAction'
import { useTranslations } from '@/composables/useTranslations'
import {
  ProblemCategoryEnum,
  ProblemSubCategoryEnum,
  ProblemTypeEnum,
} from '@/types/Api/pcots/PcotsApiModelEnums'
import { LoadCarrierProblemType } from '@/types/LoadCarrierProblemType'
import LeavePageDialog from '@/components/LeavePageDialog/LeavePageDialog.vue'

const router = useRouter()
const { t } = useI18n()
const loadCarrierStore = useLoadCarrierStore()
const isLoading: Ref<boolean> = ref<boolean>(false)
const {
  sourceLoadCarrier,
  targetLoadCarrier,
}: {
  sourceLoadCarrier: Ref<LoadCarrierType | undefined | null>
  targetLoadCarrier: Ref<LoadCarrierType | undefined | null>
} = storeToRefs(loadCarrierStore)
const troubleshootingStore = useTroubleshootingStore()
const {
  allProblems: allAvailableProblems,
  sourceProblems,
  targetProblems,
  taskProblems,
  getOverallProblemCount,
  removedProblems,
} = storeToRefs(troubleshootingStore)
const allSelectedProblemsTemp = ref([] as LoadCarrierProblemType[])
const sourceProblemsSelectedTemp = ref([] as ProblemTypeEnum[])
const targetProblemsSelectedTemp = ref([] as ProblemTypeEnum[])
const taskProblemsSelectedTemp = ref([] as ProblemTypeEnum[])
const removedProblemsTemp = ref([] as ProblemType[])
const problemIcons: Ref<Map<ProblemTypeEnum, string>> = ref<
  Map<ProblemTypeEnum, string>
>(
  new Map<ProblemTypeEnum, string>([
    [ProblemTypeEnum.DirtyLoadCarrier, 'load-carrier-dirty'],
    [ProblemTypeEnum.DamagedLoadCarrier, 'load-carrier-damaged'],
    [ProblemTypeEnum.DirtyItem, 'item-dirty'],
    [ProblemTypeEnum.DamagedItem, 'item-damaged'],
    [ProblemTypeEnum.WrongItem, 'item-wrong'],
    [ProblemTypeEnum.MissingQuantity, 'item-missing'],
    [ProblemTypeEnum.ItemToLarge, 'item-not-fitting'],
    [ProblemTypeEnum.WrongDimensionData, 'icon-placeholder'],
    [ProblemTypeEnum.ItemBarcodeNotReadable, 'icon-placeholder'],
    [ProblemTypeEnum.OtherItemDamaged, 'item-damaged'],
    [ProblemTypeEnum.SectionMismatch, 'item-misplaced'],
    [ProblemTypeEnum.TargetFull, 'load-carrier-full-capacity'],
  ])
)
const leavePageDialogRef = ref<InstanceType<typeof LeavePageDialog> | null>(
  null
)

const problemDefinition = reactive({
  Source: [] as ProblemDefinitionType[],
  Target: [] as ProblemDefinitionType[],
  Task: [] as ProblemDefinitionType[],
})

const hasSelectionChanged = computed(() => {
  const hasChanged = ref(false)
  const { getAllProblems } = useTroubleshootingStore()
  const allProblems = getAllProblems(
    sourceLoadCarrier.value?.id,
    targetLoadCarrier.value?.id
  )
  if (allProblems.length === allSelectedProblemsTemp.value.length) {
    allProblems.forEach((problem) => {
      const containsSameProblem = allSelectedProblemsTemp.value.some(
        (selectedProblem) =>
          selectedProblem.problemType === problem.problemType &&
          selectedProblem.problemCategory === problem.problemCategory &&
          selectedProblem.loadCarrierId === problem.loadCarrierId
      )
      if (!containsSameProblem) {
        hasChanged.value = true
        return hasChanged.value
      }
    })
  } else {
    hasChanged.value = true
  }

  return hasChanged.value
})

const disabledButtons = computed(() => {
  const disabledButtons = [] as TroubleshootingButtonAction[]
  if (!hasSelectionChanged.value) {
    disabledButtons.push(TroubleshootingButtonAction.save)
  }
  return disabledButtons
})

const getProblemName = (problemType: ProblemTypeEnum) => {
  return t(`troubleshooting.tabs.problem_name.${problemType}`)
}

const handleFooterButtonClicked = async (
  buttonAction: TroubleshootingButtonAction
) => {
  if (buttonAction === TroubleshootingButtonAction.back) {
    if (hasSelectionChanged.value) {
      const confirm = await leavePageDialogRef.value?.showAndWait()
      if (confirm) {
        // revert changes
        sourceProblems.value = sourceProblemsSelectedTemp.value
        targetProblems.value = targetProblemsSelectedTemp.value
        taskProblems.value = taskProblemsSelectedTemp.value
        removedProblems.value = removedProblemsTemp.value
        await router.push('/')
      }
    } else {
      await router.push('/')
    }
  } else if (buttonAction === TroubleshootingButtonAction.save) {
    await router.push('/')
  }
}

const getProblemByProblemDefinition = (
  subCategory: ProblemSubCategoryEnum,
  problemCategory: ProblemCategoryEnum
): ProblemType[] => {
  return problemDefinition[problemCategory]
    .filter(
      (problem: ProblemDefinitionType) =>
        problem.subCategory === subCategory &&
        problem.category === problemCategory
    )
    .map((problemDef) => {
      return {
        problemType: problemDef.type,
        problemCategory: problemDef.category,
      } as ProblemType
    })
}

const noProblemsBackground = computed(() => {
  if (isDark.value) {
    return `src/assets/fallback_bg_decoration-dark.svg`
  } else {
    return `src/assets/fallback_bg_decoration-light.svg`
  }
})
const noProblemsImage = computed(() => {
  if (isDark.value) {
    return `src/assets/images/item-details/Empty-LC-Dark.svg`
  } else {
    return `src/assets/images/item-details/Empty-LC-Light.svg`
  }
})

const hasProblem = (tab: ProblemCategoryEnum) => {
  return problemDefinition[tab].length > 0
}
const { getTranslation } = useTranslations('troubleshooting')

watch(colorMode, () => {
  loadCarrierStore.updateUnknownItemsUrls()
})

onMounted(async () => {
  isLoading.value = true
  const problems = await getSupportedProblems()
  isLoading.value = false

  // save start state of the selected problems
  allSelectedProblemsTemp.value = troubleshootingStore.getAllProblems(
    sourceLoadCarrier.value?.id,
    targetLoadCarrier.value?.id
  )
  // deep clone problems
  sourceProblemsSelectedTemp.value = JSON.parse(
    JSON.stringify(sourceProblems.value)
  )
  targetProblemsSelectedTemp.value = JSON.parse(
    JSON.stringify(targetProblems.value)
  )
  taskProblemsSelectedTemp.value = JSON.parse(
    JSON.stringify(taskProblems.value)
  )
  removedProblemsTemp.value = JSON.parse(JSON.stringify(removedProblems.value))

  allAvailableProblems.value = problems

  for (const problem of problems) {
    problemDefinition[problem.category].push(problem)
  }
})
</script>

<template>
  <LeavePageDialog ref="leavePageDialogRef" />
  <div class="troubleshooting">
    <TroubleshootingHeader />
    <TroubleshootingTabs
      :source-lc-id="sourceLoadCarrier?.id"
      :target-lc-id="targetLoadCarrier?.id"
      :selected-source-lc-problems="sourceProblems.length"
      :selected-task-problems="taskProblems.length"
      :selected-target-lc-problems="targetProblems.length"
      :is-loading="isLoading"
    >
      <template
        v-for="(tab, tabIndex) in ProblemCategoryEnum"
        #[tab]
        :key="tab"
      >
        <div class="troubleshooting-content">
          <template
            v-for="(subCategory, subCategoryIndex) in ProblemSubCategoryEnum"
            :key="subCategory"
          >
            <template
              v-if="
                getProblemByProblemDefinition(subCategory, ProblemCategoryEnum[tabIndex] as ProblemCategoryEnum)
                  .length > 0
              "
            >
              <p class="problem-section-title">
                {{ getTranslation(subCategoryIndex.toString().toLowerCase()) }}
              </p>
              <div class="problem-section">
                <ProblemClassificationButton
                  v-for="problem of getProblemByProblemDefinition(
                    subCategory,
                    ProblemCategoryEnum[tabIndex] as ProblemCategoryEnum
                  )"
                  :key="problem.problemType"
                  :model-value="troubleshootingStore.containsProblem(problem)"
                  :button-icon="problemIcons.get(problem.problemType) as string"
                  :button-text="getProblemName(problem.problemType)"
                  button-width="100%"
                  @click="troubleshootingStore.addOrRemoveProblem(problem)"
                />
              </div>
            </template>
          </template>
          <div v-if="!hasProblem(tab)" class="fallback-container">
            <img
              class="no-problems-bg"
              :src="noProblemsBackground"
              :alt="noProblemsBackground"
            />
            <div class="no-problems-container">
              <img
                :src="noProblemsImage"
                :alt="noProblemsImage"
                class="fallback-image"
              />
              <span class="no-problems-text">{{
                getTranslation('no_problem_available')
              }}</span>
              <span class="no-problems-text-sub">{{
                getTranslation('no_problem_available-description')
              }}</span>
            </div>
          </div>
        </div>
      </template>
    </TroubleshootingTabs>
    <TroubleshootingFooter
      :disabled-buttons="disabledButtons"
      :overall-selected-problems="getOverallProblemCount"
      @action-button-clicked="handleFooterButtonClicked"
    />
  </div>
</template>

<style scoped lang="scss">
.troubleshooting {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
  background-color: var(--tgw-bg-10);

  .troubleshooting-content {
    padding: 64px var(--pcots-outside-padding);

    .problem-section-title {
      font-weight: 700;
      font-size: 24px;
      line-height: 36px;
      text-transform: uppercase;
      color: var(--tgw-text-secondary);
      margin: 0 0 16px;
    }

    .problem-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, 428px);
      width: 100%;
      box-sizing: border-box;
      gap: 16px;
      margin-bottom: 40px;
    }

    .fallback-container {
      display: flex;
      justify-content: center;
      height: 100%;
      margin-top: 4vh;

      .no-problems-bg {
        position: absolute;
        height: 500px;
        width: auto;
        max-height: 100%;
        top: 36px;
        transform: translateX(24px);
      }

      .no-problems-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .fallback-image {
          height: 16vh;
          flex-grow: 1;
          width: auto;
        }
        .no-problems-text {
          max-width: 240px;
          font-weight: 700;
          font-size: 28px;
          color: var(--tgw-text-secondary);
          margin-top: 32px;
          text-align: center;
        }
        .no-problems-text-sub {
          max-width: 340px;
          font-size: 20px;
          color: var(--tgw-text-secondary);
          margin-top: 16px;
          text-align: center;
        }
      }
    }
  }
}

@media screen and (max-height: 900px) {
  .troubleshooting {
    .troubleshooting-content {
      .fallback-container {
        margin-top: 2vh;

        .no-problems-container {
          .fallback-image {
            height: 12vh;
            flex-grow: 1;
          }
          .no-problems-text {
            max-width: 200px;
            font-size: 26px;
            margin-top: 20px;
          }
          .no-problems-text-sub {
            font-size: 16px;
            margin-top: 12px;
            max-width: 300px;
          }
        }
      }
    }
  }
}
</style>
