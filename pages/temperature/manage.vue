<template>
  <div class="con flex flex-col space-y-16">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl">Manage Temperature</h1>

      <Dropdown
        v-model="selectedLocation"
        option-label="name"
        placeholder="Location"
        :options="locationsByName"
      />
    </div>

    <Card v-if="state === 'selected'">
      <template #title>
        <h1 class="text-2xl">
          Add Temperature for <em>{{ selectedLocation.name }}</em>
        </h1>
      </template>

      <template #content>
        <form
          class="flex flex-col space-y-8 w-80"
          @submit.prevent="saveTemperature"
        >
          <Dropdown
            v-model="selectedYear"
            placeholder="Select a year"
            :options="years"
          />

          <Dropdown
            v-model="selectedMonth"
            option-label="name"
            option-value="value"
            placeholder="Select a month"
            :options="months"
          />

          <span class="p-float-label">
            <InputNumber
              id="min"
              v-model="min"
              class="w-full"
              mode="decimal"
              :min-fraction-digits="3"
              :max-fraction-digits="3"
            />
            <label for="min">Minimum</label>
          </span>

          <span class="p-float-label">
            <InputNumber
              id="max"
              v-model="max"
              class="w-full"
              mode="decimal"
              :min-fraction-digits="3"
              :max-fraction-digits="3"
            />
            <label for="max">Maximum</label>
          </span>

          <span class="p-float-label">
            <InputNumber
              id="avg"
              v-model="avg"
              class="w-full"
              mode="decimal"
              :min-fraction-digits="3"
              :max-fraction-digits="3"
            />
            <label for="avg">Average</label>
          </span>

          <Button
            :disabled="isSaving"
            label="Add"
            class="p-button-outlined p-button-sm"
            type="submit"
          />
        </form>
      </template>
    </Card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      avg: 0,
      isSaving: false,
      max: 0,
      min: 0,
      selectedLocation: '',
      selectedMonth: '',
      selectedYear: '',
      state: 'default',
    }
  },
  async fetch() {
    await this.loadLocationsAsync()
  },
  computed: {
    ...mapGetters('temperature', ['locationsByName']),

    currentYear() {
      const now = this.$fireModule.firestore.Timestamp.now()
      const currentYear = this.$dateFns.getYear(now.toDate())
      return currentYear
    },

    years() {
      const startYear = 1970

      return Array.from(
        { length: 1 + this.currentYear - startYear },
        (x, i) => this.currentYear - i,
      )
    },

    months() {
      return Array.from({ length: 12 }, (x, i) => {
        const baseDate = new Date(1970, 0)
        const dateMonth = this.$dateFns.addMonths(baseDate, i)
        return {
          value: i,
          name: this.$dateFns.format(dateMonth, 'LLLL'),
        }
      })
    },
  },

  watch: {
    selectedLocation(val, oldVal) {
      if (val && this.state === 'default') {
        this.state = 'selected'
      }
    },
  },

  methods: {
    ...mapActions('temperature', ['addTemperatureAsync', 'loadLocationsAsync']),

    async saveTemperature() {
      if (!this.isSaving) {
        try {
          this.isSaving = true
          const { avg, min, max } = this
          const item = {
            location: this.selectedLocation.id,
            month: this.selectedMonth,
            year: this.selectedYear,
            avg,
            min,
            max,
          }
          await this.addTemperatureAsync(item)
          this.resetAddTempForm()
          this.isSaving = false
        } catch (err) {}
      }
    },

    resetAddTempForm() {
      this.avg = 0
      this.max = 0
      this.min = 0
      this.selectedMonth = ''
      this.selectedYear = ''
    },
  },
}
</script>
