<script setup lang="ts">
import { SupportedStationType } from '@/types/Api/wm/WmApiModel'
import { useTextTranslator } from '@/composables/useTextTranslator/useTextTranslator'

withDefaults(defineProps<Props>(), { scrollbarHeight: '100%' })
const emit = defineEmits(['selectedItemChanged'])
const { getTranslatedText } = useTextTranslator()
interface Props {
  list: SupportedStationType[]
  scrollbarHeight?: string
}

const currentSelectedItem: any = ref(null)

watch(currentSelectedItem, (newVal) => {
  emit('selectedItemChanged', newVal)
})
</script>

<template>
  <div class="radio-selection">
    <TgwScrollbar :height="scrollbarHeight" class="radio-selection-scrollbar">
      <TgwRadioGroup
        v-model="currentSelectedItem"
        class="radio-selection-group"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="radio-selection-group__item-container"
        >
          <TgwRadio
            :label="item.id"
            class="radio-selection-group__item"
            @click="currentSelectedItem = item.id"
          >
            <div class="radio-selection-group__item-wrapper">
              <TgwIcon icon="workstation" class="workstation-icon" />
              <div class="workstation-name">
                {{ getTranslatedText(item.name) }}
              </div>
            </div>
          </TgwRadio>
        </div>
      </TgwRadioGroup>
    </TgwScrollbar>
  </div>
</template>

<style scoped lang="scss">
.radio-selection {
  .radio-selection-scrollbar {
    border-top: 1px solid var(--tgw-line-00);
    border-bottom: 1px solid var(--tgw-line-00);

    .radio-selection-group {
      width: calc(100% - 24px);
      margin: 0 12px;

      .radio-selection-group__item-container {
        margin-bottom: 12px;
        display: block;

        :deep(.tgw-radio.radio-selection-group__item) {
          transition: 0.2s;
          height: 80px;
          width: 100%;
          border-radius: 4px;
          display: flex;
          flex-direction: row-reverse;
          align-items: center;
          box-shadow: inset 0 0 0 1px var(--tgw-line-00),
            var(--tgw-dropshadow-soft);
          margin-right: 0;
          font-weight: 500;
          font-size: 16px;
          line-height: 16px;
          box-sizing: border-box;

          &:focus-within {
            outline: 0;
          }

          &:hover {
            cursor: pointer;
            box-shadow: inset 0 0 0 1px var(--tgw-line-00),
              var(--tgw-dropshadow-soft-elevated);
          }

          &:first-child {
            margin-top: 12px;
          }

          &.is-checked {
            box-shadow: inset 0 0 0 2px var(--tgw-primary),
              var(--tgw-dropshadow-soft);

            .tgw-radio__label {
              color: var(--tgw-text-primary);
            }
          }

          .tgw-radio__input {
            margin: 24px;
          }

          .tgw-radio__label {
            width: 100%;
            padding: 0;
            color: var(--tgw-text-primary);
            font-family: Roboto;
            font-size: 16px;
            font-style: normal;
            font-weight: 500;
            line-height: normal;

            .radio-selection-group__item-wrapper {
              display: flex;
              align-items: center;

              .workstation-icon {
                margin: 28px 24px 28px 28px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
