<template>
  <div class="con flex flex-col space-y-16">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl">Manage Temperature</h1>

      <Dropdown
        v-model="selectedLocation"
        class="w-60"
        option-label="name"
        placeholder="Location"
        :options="locationsByName"
      />

      <Dropdown
        v-model="selectedYear"
        class="w-32"
        option-label="name"
        option-value="value"
        placeholder="Year"
        :disabled="!selectedLocation.id"
        :options="years"
      />
    </div>

    <template v-if="state === 'selected'">
      <Card>
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
                :max-fraction-digits="5"
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

      <Card>
        <template #content>
          <DataTable
            data-key="id"
            :filters="filters"
            :row-hover="true"
            :rows="12"
            :value="temperatures"
          >
            <template #header>
              <h1 class="text-2xl">
                {{ selectedLocation.name }} temperatures for {{ selectedYear }}
              </h1>
            </template>

            <template #empty>
              <p>No temperatures found.</p>
            </template>

            <Column field="month" header="Month">
              <template #body="slotProps">
                <Skeleton v-if="isLoadingTemperatures"></Skeleton>

                <template v-else>
                  {{ getMonthText(slotProps.data.month) }}
                </template>
              </template>
            </Column>

            <Column field="avg" header="Average">
              <template #body="slotProps">
                <Skeleton v-if="isLoadingTemperatures"></Skeleton>

                <template v-else>
                  {{ slotProps.data.avg }}
                </template>
              </template>
            </Column>

            <Column field="min" header="Minimum">
              <template #body="slotProps">
                <Skeleton v-if="isLoadingTemperatures"></Skeleton>

                <template v-else>
                  {{ slotProps.data.min }}
                </template>
              </template>
            </Column>

            <Column field="max" header="Maximum">
              <template #body="slotProps">
                <Skeleton v-if="isLoadingTemperatures"></Skeleton>

                <template v-else>
                  {{ slotProps.data.max }}
                </template>
              </template>
            </Column>

            <Column header-class="actions__header" body-class="actions__body">
              <template #body="slotProps">
                <Skeleton v-if="isLoadingTemperatures"></Skeleton>

                <template v-else>
                  <div class="flex space-x-3 items-center">
                    <Button
                      class="p-button-danger p-button-rounded p-button-text"
                      icon="mdi mdi-delete-outline"
                      type="button"
                      @click="showDeleteConfirmation(slotProps.data)"
                    ></Button>
                  </div>
                </template>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      avg: 0,
      isLoadingTemperatures: false,
      isSaving: false,
      filters: {},
      max: 0,
      min: 0,
      selectedLocation: {},
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

    temperatures() {
      return this.sortedTemperatures()(this.selectedYear)
    },

    years() {
      const startYear = 1970

      return Array.from(
        { length: 1 + this.currentYear - startYear },
        (x, i) => {
          const value = this.currentYear - i
          return {
            value,
            name: `${value}`,
          }
        },
      )
    },

    months() {
      return Array.from({ length: 12 }, (x, i) => {
        return {
          value: i,
          name: this.getMonthText(i),
        }
      })
    },
  },

  watch: {
    async selectedLocation(val, oldVal) {
      if (val.id && val.id !== oldVal.id && this.selectedYear) {
        this.isLoadingTemperatures = true
        await this.loadTemperaturesAsync(this.selectedLocation.id)
        this.isLoadingTemperatures = false
      }
    },

    async selectedYear(val, oldVal) {
      if (val && this.state === 'default') {
        this.state = 'selected'
      }

      if (val && val !== oldVal) {
        this.isLoadingTemperatures = true
        await this.loadTemperaturesAsync(this.selectedLocation.id)
        this.isLoadingTemperatures = false
      }
    },
  },

  methods: {
    ...mapActions('temperature', [
      'addTemperatureAsync',
      'deleteTemperatureAsync',
      'loadLocationsAsync',
      'loadTemperaturesAsync',
    ]),

    ...mapGetters('temperature', ['sortedTemperatures']),

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
          await this.loadTemperaturesAsync(this.selectedLocation.id)
          this.$toast.add({
            severity: 'success',
            summary: 'Temperature Saved',
            detail: `A temperature has been saved for ${this.getMonthText(
              this.selectedMonth,
            )} ${this.selectedYear}.`,
            life: 3000,
          })
          this.resetAddTempForm()
          this.isSaving = false
        } catch (err) {}
      }
    },

    getMonthText(month) {
      const baseDate = new Date(1970, 0)
      const dateMonth = this.$dateFns.addMonths(baseDate, month)
      return this.$dateFns.format(dateMonth, 'LLLL')
    },

    resetAddTempForm() {
      this.avg = 0
      this.max = 0
      this.min = 0
      this.selectedMonth = ''
    },

    showDeleteConfirmation(item) {
      this.$confirm.require({
        message: `Are you sure you want to delete the '${this.getMonthText(
          item.month,
        )} ${item.year}' temperature?`,
        header: 'Confirm Deletion',
        accept: async () => {
          await this.deleteTemperatureAsync({
            locId: this.selectedLocation.id,
            id: item.id,
          })
          this.$toast.add({
            severity: 'success',
            summary: 'Temperature Deleted',
            detail: `A temperature has been deleted for ${this.getMonthText(
              item.month,
            )} ${item.year}.`,
            life: 3000,
          })
          await this.loadTemperaturesAsync(this.selectedLocation.id)
        },
      })
    },
  },
}
</script>

<style lang="postcss" scoped>
::v-deep {
  .p-datatable-header {
    @apply flex justify-between items-center mb-8 px-0 border-none;
  }

  .p-paginator {
    @apply border-none mt-8;

    &-current {
      @apply ml-auto;
    }
  }

  .p-confirm-dialog-message {
    @apply !ml-0;
  }

  .actions {
    &__header {
      @apply w-24;
    }

    &__body {
      @apply flex justify-center;
    }
  }
}
</style>
