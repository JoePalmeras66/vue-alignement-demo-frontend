<script setup lang="ts">
import LoadCarrierDetailsSwitch from '@/components/LoadCarrierDetailsSwitch/LoadCarrierDetailsSwitch.vue'
import { LoadCarrierDetailsPageEnum } from '@/types/LoadCarrierDetailsPageEnum'
import { useApiVersionStore } from '@/stores/useApiVersionStore/useApiVersionStore'
import { ApiNameEnum } from '@/types/Api/ApiNameEnum'
import { ApiVersionEnum } from '@/types/Api/ApiVersionEnum'

interface Props {
  modelValue: LoadCarrierDetailsPageEnum
}
const props = defineProps<Props>()
const modelValue = defineModel<typeof props.modelValue>()
const apiVersionStore = useApiVersionStore()
const backButtonRef = ref(null)
const { width: backButtonWidth } = useElementSize(backButtonRef)
const router = useRouter()

const transformX = computed(() => {
  return `${backButtonWidth.value * -1}px`
})

const handleBackButton = () => {
  router.push('/')
}
</script>

<template>
  <div class="load-carrier-details-footer">
    <IconButton
      ref="backButtonRef"
      plain
      type="primary"
      class="back-button"
      icon="arrow-left"
      @click="handleBackButton"
    />
    <LoadCarrierDetailsSwitch
      v-if="
        apiVersionStore.isVersionSupported(
          ApiNameEnum.pcotsExt,
          ApiVersionEnum.v2
        )
      "
      v-model="modelValue"
      class="load-carrier-details-switch"
    />
  </div>
</template>

<style scoped lang="scss">
.load-carrier-details-footer {
  height: var(--pcots-footer-bottom-height);
  background-color: var(--tgw-bg-navbar);
  box-sizing: border-box;
  border-top: 1px solid var(--tgw-line-20);
  padding: 0 var(--pcots-outside-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .icon-button.back-button {
    left: var(--pcots-outer-margin);
    height: var(--pcots-footer-button-height);
    aspect-ratio: 1/1;
    border-width: 2px;

    :deep(.flex-container) {
      .tgw-icon.button-icon {
        --icon-button-icon-size: var(--pcots-footer-icon-size);
      }
      .button-text {
        font-size: var(--pcots-font-size-md);
        line-height: calc(
          var(--pcots-font-size-md) + var(--pcots-font-size-offset-md)
        );
      }
    }
  }

  .load-carrier-details-switch {
    //center switch
    transform: translateX(v-bind(transformX));
    margin: 0 auto;
  }
}
</style>
