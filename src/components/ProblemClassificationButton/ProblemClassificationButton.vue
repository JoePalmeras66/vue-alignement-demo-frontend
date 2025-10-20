<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

interface Props {
  buttonText: string
  modelValue: boolean
  buttonIcon: string
  buttonWidth?: string
}

const props = withDefaults(defineProps<Props>(), { buttonWidth: '515px' })
const emit = defineEmits<{
  'update:modelValue': [currentValue: boolean]
}>()
const buttonChecked = ref(props.modelValue)
const computedButtonWidth = reactive({
  width: props.buttonWidth,
})

// set width to inherit if width is set to auto
if (props.buttonWidth === 'auto') {
  computedButtonWidth.width = 'inherit'
}

const problemButtonClicked = () => {
  buttonChecked.value = !buttonChecked.value
}

watch(buttonChecked, (currentValue) => {
  emit('update:modelValue', currentValue)
})

const classes = computed(() => {
  let classes = ''
  if (buttonChecked.value) {
    classes += 'active'
  }
  return classes
})
defineExpose({ buttonChecked })
</script>

<template>
  <div
    class="problem-classification-button"
    :class="classes"
    :style="computedButtonWidth"
    @click="problemButtonClicked"
  >
    <TgwIcon
      size="48"
      :icon="buttonIcon"
      color="var(--tgw-icon-secondary)"
      secondary-color="var(--pcots-icon-primary-light)"
    />
    <span class="problem-classification-text">{{ buttonText }}</span>
    <TgwCheckbox
      v-model="buttonChecked"
      size="24"
      @click.prevent="problemButtonClicked"
    />
  </div>
</template>

<style lang="scss">
.problem-classification-button {
  --pcots-icon-primary-light: rgba(14, 19, 26, 0.86);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  column-gap: 24px;
  padding: 0 24px;
  height: 96px;
  border-radius: 4px;
  box-shadow: var(--tgw-dropshadow-soft), inset 0 0 0 1px var(--tgw-line-00);
  background: var(--tgw-bg-30);
  cursor: pointer;

  &.active {
    background: var(--tgw-bg-40);
    border-color: var(--tgw-primary);
    box-shadow: var(--tgw-dropshadow-soft), inset 0 0 0 3px var(--tgw-primary);

    &:hover {
      box-shadow: var(--tgw-dropshadow-soft-elevated),
        inset 0 0 0 3px var(--tgw-primary);
    }
  }

  &:hover {
    box-shadow: var(--tgw-dropshadow-soft-elevated),
      inset 0 0 0 1px var(--tgw-line-00);
  }

  .problem-classification-text {
    width: 100%;
    font-weight: 700;
    font-size: 24px;
    color: var(--tgw-text-primary);
    user-select: none;
  }
}
</style>
