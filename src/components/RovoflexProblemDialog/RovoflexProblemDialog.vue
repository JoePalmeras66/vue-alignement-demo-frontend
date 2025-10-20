<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { TgwMessageBox } from '@tgw-components/web'
import { MessageBoxOptionType } from '@tgw-components/web/dist/packages/core/src'
import { useTranslations } from '@/composables/useTranslations'
import { useTaskStore } from '@/stores/useTaskStore/useTaskStore'
import { MessageBoxType } from '@/types/MessageBoxType'

interface RovoflexErrorItem {
  title: string
  description: string
}
interface Props {
  errors: string[]
  appendToBody?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  appendToBody: true,
})
const activeCollapseItemNames = ref<string[]>([])
const { task } = storeToRefs(useTaskStore())

const { getTranslation } = useTranslations('rovoflex-problem-dialog')
const { getTranslation: getErrorTranslation } =
  useTranslations('rovoflex-errors')

const messageBoxRef = ref<InstanceType<typeof TgwMessageBox> | null>(null)

const dialogTitle = computed(() => {
  if (
    task.value === undefined &&
    props.errors.length === 1 &&
    props.errors[0] === 'UnknownMovementError'
  ) {
    return getTranslation('handle_possible_problems')
  }
  return getTranslation('complete_pick_manually')
})

const options = computed(() => {
  return {
    type: MessageBoxType.error,
    title: dialogTitle.value,
    okButton: {
      label: getTranslation('ok'),
      type: 'primary',
    },
    cancelButton: {
      hide: true,
    },
    closeIcon: false,
  } as MessageBoxOptionType
})

const collapseTitle = computed(() => {
  if (props.errors.length === 1) {
    return getErrorTranslation(`${props.errors[0]}_title`)
  } else if (props.errors.length > 1) {
    return getTranslation('n_problems_occurred', props.errors.length)
  }
  return ''
})

const errorItems = computed(() => {
  const errorItems: RovoflexErrorItem[] = []
  props.errors.forEach((errorItem) => {
    errorItems.push({
      title: `${errorItem}_title`,
      description: `${errorItem}_description`,
    })
  })
  return errorItems
})

const isCollapsed = computed(() => {
  return activeCollapseItemNames.value.length === 0
})

const alignmentClass = computed(() => {
  if (props.errors.length > 1) {
    return 'align-left'
  }
})

const showAndWait = async () => {
  return await messageBoxRef?.value?.show()
}

defineExpose({ showAndWait })
</script>

<template>
  <TgwMessageBox
    ref="messageBoxRef"
    class="rovoflex-problem-dialog"
    :class="alignmentClass"
    :options="options"
    is-touch
    :close-on-click-modal="false"
    width="720px"
    :append-to-body="appendToBody"
  >
    <template #default>
      <TgwCollapse
        v-if="errors.length > 1"
        v-model="activeCollapseItemNames"
        class="problem-collapse"
        icon-position="right"
      >
        <TgwCollapseItem class="problem-collapse-item" name="1">
          <template #title>
            <TgwHighlighted
              color="var(--tgw-primary)"
              class="problem-collapse-item__header-text"
              >{{ collapseTitle }}</TgwHighlighted
            >
            <TgwIcon
              icon="arrow-down-1"
              :class="{ 'is-collapsed': isCollapsed }"
              class="arrow-icon"
              color="var(--tgw-primary)"
              size="32px"
            />
          </template>
          <ol class="rovoflex-problem-dialog__error-list">
            <li
              v-for="error in errorItems"
              :key="error.title"
              class="rovoflex-problem-dialog__error-list-item"
            >
              <span class="rovoflex-problem-dialog__error-title">{{
                getErrorTranslation(error.title)
              }}</span>
              <p class="rovoflex-problem-dialog__error-description">
                {{ getErrorTranslation(error.description) }}
              </p>
            </li>
          </ol>
        </TgwCollapseItem>
      </TgwCollapse>

      <p v-else class="rovoflex-problem-dialog__error-description">
        {{ getErrorTranslation(`${errors[0]}_description`) }}
      </p>
      <p class="rovoflex-problem-dialog__error-hint">
        {{ getTranslation('press_ok_and_finish_pick') }}
      </p>
    </template>
  </TgwMessageBox>
</template>

<style scoped lang="scss">
.rovoflex-problem-dialog {
  .problem-collapse {
    margin-top: 32px;
    background: var(--tgw-bg-40);

    :deep(.problem-collapse-item) {
      border-bottom: none;
      .tgw-collapse-item__header-container {
        display: flex;
        height: 68px;
        justify-content: space-between;
        align-items: center;

        .problem-collapse-item__header-text {
          display: flex;
          margin-left: 40px;
          color: var(--tgw-text-secondary);
          font-size: 20px;
          font-weight: 400;
          font-family: Roboto, Helvetica, sans-serif;
          line-height: 47px;
          letter-spacing: 1px;
          user-select: none;

          .highlighted {
            color: var(--tgw-text-secondary);
            font-size: 20px;
            font-weight: 600;
            margin-right: 4px;
          }
        }

        .arrow-icon {
          margin-right: 32px;
          transform: rotate(180deg);
          transition: 0.4s ease all;

          &.is-collapsed {
            transform: none;
          }
        }
      }
    }
  }

  .rovoflex-problem-dialog__error-list {
    margin: 0 0 0 32px;

    .rovoflex-problem-dialog__error-list-item {
      .rovoflex-problem-dialog__error-title,
      &::marker {
        color: var(--tgw-text-primary);
        font-weight: 700;
        font-size: 20px;
      }

      .rovoflex-problem-dialog__error-description {
        margin: 0 0 12px;
        padding: 0;
        font-size: 20px;
        text-align: left;
        color: var(--tgw-text-secondary);
      }
    }
  }

  .rovoflex-problem-dialog__error-description {
    margin: 0;
    padding: 24px 40px 0;
    text-align: center;
    font-size: 20px;
    color: var(--tgw-text-secondary);
  }

  .rovoflex-problem-dialog__error-hint {
    width: 100%;
    margin: 32px 0 0;
    font-size: 21px;
    text-align: center;
    font-weight: 600;
    color: var(--tgw-text-secondary);
  }
}
</style>

<style lang="scss">
.tgw-dialog.rovoflex-problem-dialog {
  .tgw-dialog__body {
    padding: 0;
  }
}
</style>
