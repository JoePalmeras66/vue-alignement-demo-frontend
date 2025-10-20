<script setup lang="ts">
interface Props {
  stepAmount?: 2 | 3
}
const props = withDefaults(defineProps<Props>(), {
  stepAmount: 2,
})

const marginLeft = computed(() => {
  if (props.stepAmount === 2) {
    return '2vw'
  }
  return '3vw'
})

const backgroundClasses = computed(() => {
  let classes = 'rovoflex-stepper-background'
  if (props.stepAmount === 2) {
    classes += ' two-stepper'
  } else if (props.stepAmount === 3) {
    classes += ' three-stepper'
  }

  return classes
})
</script>

<template>
  <div :class="backgroundClasses">
    <div class="one" />
    <div class="two" />
    <div v-if="stepAmount === 3" class="three" />
  </div>
</template>

<style scoped lang="scss">
.rovoflex-stepper-background {
  position: absolute;
  display: grid;
  width: 100%;
  height: 100%;

  &.two-stepper {
    grid-template-columns: 50vw 48vw;
  }
  &.three-stepper {
    grid-template-columns: 32vw 36vw 32vw;
  }

  .one,
  .two,
  .three {
    width: 100%;
    height: 100%;
  }

  .one {
    background: var(--tgw-bg-20);
    border-right: v-bind(marginLeft) solid var(--tgw-bg-20);
  }
  .two {
    background: var(--tgw-bg-30);
    filter: var(--pcots-dropshadow-stepper);
    z-index: 1;
    margin-left: v-bind(marginLeft);

    --offset-two: -70px;
    &:before,
    &:after {
      content: '';
      height: 100%;
      width: 70px;
      background: var(--tgw-bg-30);
      left: calc(var(--offset-two) + 1px);
      position: absolute;
      clip-path: polygon(100% 0%, 100% 50%, 100% 100%, 0% 100%, 90% 50%, 0% 0%);
    }
    // border for the shape
    &:after {
      z-index: -1;
      left: calc(var(--offset-two) - 1px);
      background: var(--tgw-line-10);
    }
  }
  .three {
    background: var(--tgw-bg-40);
    filter: var(--pcots-dropshadow-stepper);
    z-index: 2;

    --offset-three: -70px;
    &:before,
    &:after {
      content: '';
      height: 100%;
      width: 70px;
      background: var(--tgw-bg-40);
      position: absolute;
      left: calc(var(--offset-three) + 1px);
      clip-path: polygon(100% 0%, 100% 50%, 100% 100%, 0% 100%, 90% 50%, 0% 0%);
    }
    // border for the shape
    &:after {
      z-index: -1;
      left: calc(var(--offset-three) - 1px);
      background: var(--tgw-line-10);
    }
  }
}
</style>
