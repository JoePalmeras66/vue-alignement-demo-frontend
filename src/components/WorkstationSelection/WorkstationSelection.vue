<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'
import { SupportedStationType } from '@/types/Api/wm/WmApiModel'

interface Props {
  availableStations: SupportedStationType[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  stationSelected: [stationId: string]
  backToLogin: []
}>()
const properties = toRefs(props)
const stationFilter = ref('')
const selectedStationId = ref<string | undefined>()

const { getTranslation } = useTranslations('station-selection')

const filteredStations = computed(() => {
  return properties.availableStations.value.filter((station) =>
    station.name.toUpperCase().includes(stationFilter.value.toUpperCase())
  )
})

const onConfirmClick = () => {
  if (selectedStationId.value) {
    emit('stationSelected', selectedStationId.value)
  }
}

const handleStationSelection = (selectedStation: string) => {
  selectedStationId.value = selectedStation
}

const backToLogin = async () => {
  emit('backToLogin')
}
</script>

<template>
  <div class="station-selection">
    <div class="station-selection__header">
      <h1 class="station-selection__header-title">
        {{ getTranslation('select_station') }}
      </h1>
    </div>
    <div class="station-selection__body">
      <TgwInput
        v-model="stationFilter"
        class="station-selection__body-input"
        :placeholder="getTranslation('filter_stations')"
        prefix-icon="search"
      />
      <div class="station-selection__body-cards">
        <RadioSelection
          :list="filteredStations"
          scrollbar-height="426px"
          class="station-selection__body-cards-item"
          @selected-item-changed="handleStationSelection($event)"
        />
      </div>
    </div>
    <div class="station-selection__footer">
      <TgwButton
        class="back-to-login-button"
        icon="arrow-left-1"
        plain
        @click="backToLogin"
        >{{ getTranslation('back_to_login') }}</TgwButton
      >
      <TgwButton
        class="continue-button"
        :disabled="!selectedStationId"
        @click="onConfirmClick"
        >{{ getTranslation('continue') }}</TgwButton
      >
    </div>
  </div>
</template>

<style scoped lang="scss">
.station-selection {
  width: 512px;
  .station-selection__header {
    margin-bottom: 56px;
    .station-selection__header-title {
      font-family: RedHatDisplay, Roboto, Helvetica, sans-serif;
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--tgw-text-primary);
      margin: 0;
    }
  }

  .station-selection__body {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    margin-bottom: 0;

    .station-selection__body-input {
      display: flex;
      width: 100%;
      height: 40px;
      flex-direction: column;
      align-items: flex-start;
      border-radius: 4px;
      border: 1px solid var(--tgw-line-20);
      background: var(--tgw-bg-input);
    }

    .station-selection__body-cards {
      width: 100%;
      //height: 420px;
      margin-bottom: 26px;

      .radio-selection {
        width: 100%;
      }
    }
  }

  .station-selection__footer {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;

    .back-to-login-button {
      display: flex;
      font-size: 12px;
      height: 14px;
      margin-bottom: 16px;
      outline: none;
      box-shadow: none;
      justify-content: center;
      align-items: center;
      padding: 12px 0;

      :deep(.tgw-icon) {
        margin-right: -8px;

        svg {
          width: 12px;
          height: 12px;
          path {
            fill: var(--tgw-primary);
          }
        }
      }
    }

    .continue-button {
      width: 100%;
      height: 56px;
      font-weight: 500;
      font-size: 18px;
      line-height: 22px;
      margin-left: 0;
      padding: 0 28px 0 16px;
    }
  }
}
</style>
