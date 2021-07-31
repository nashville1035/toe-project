<template>
  <div class="con flex flex-col space-y-16">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl">Manage Landings</h1>

      <Dropdown
        v-model="selectedVessel"
        class="w-60"
        option-label="name"
        placeholder="Vessel"
        :options="vesselsByName"
      />

      <Dropdown
        v-model="selectedYear"
        class="w-32"
        option-label="name"
        option-value="value"
        placeholder="Year"
        :disabled="!selectedVessel.id"
        :options="years"
      />
    </div>

    <template v-if="state === 'selected'">
      <Card>
        <template #title>
          <h1 class="text-2xl">
            Add landing for <em>{{ selectedVessel.name }}</em>
          </h1>
        </template>

        <template #content>
          <form
            class="flex flex-col space-y-8 w-80"
            @submit.prevent="saveLanding"
          >
            <Dropdown
              v-model="selectedMonth"
              option-label="name"
              option-value="value"
              placeholder="Select a month"
              :options="months"
            />

            <Dropdown
              v-model="selectedLocation"
              option-label="name"
              placeholder="Location"
              :options="locationsByName"
            />

            <span class="p-float-label">
              <InputNumber
                id="mass"
                v-model="mass"
                class="w-full"
                mode="decimal"
                :min-fraction-digits="1"
                :max-fraction-digits="5"
              />
              <label for="mass">Mass in kg</label>
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
            :value="landings"
          >
            <template #header>
              <h1 class="text-2xl">
                {{ selectedVessel.name }} landings for {{ selectedYear }}
              </h1>
            </template>

            <template #empty>
              <p>No landings found.</p>
            </template>

            <Column field="month" header="Month">
              <template #body="slotProps">
                <Skeleton v-if="isLoadingLandings"></Skeleton>

                <template v-else>
                  {{ getMonthText(slotProps.data.month) }}
                </template>
              </template>
            </Column>

            <Column field="location" header="Location">
              <template #body="slotProps">
                <Skeleton v-if="isLoadingLandings"></Skeleton>

                <template v-else>
                  {{ slotProps.data.location.name }}
                </template>
              </template>
            </Column>

            <Column field="mass" header="Mass (kg)">
              <template #body="slotProps">
                <Skeleton v-if="isLoadingLandings"></Skeleton>

                <template v-else>
                  {{ slotProps.data.mass }}
                </template>
              </template>
            </Column>

            <Column header-class="actions__header" body-class="actions__body">
              <template #body="slotProps">
                <Skeleton v-if="isLoadingLandings"></Skeleton>

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
      isLoadingLandings: false,
      isSaving: false,
      filters: {},
      mass: 0,
      selectedVessel: {},
      selectedLocation: {},
      selectedMonth: '',
      selectedYear: '',
      state: 'default',
    }
  },
  async fetch() {
    await this.loadVesselsAsync()
  },
  computed: {
    ...mapGetters('fishing', ['vesselsByName']),

    ...mapGetters('temperature', ['locationsByName']),

    currentYear() {
      const now = this.$fireModule.firestore.Timestamp.now()
      const currentYear = this.$dateFns.getYear(now.toDate())
      return currentYear
    },

    landings() {
      return this.sortedLandings()(this.selectedYear)
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
    async selectedVessel(val, oldVal) {
      if (val.id && val.id !== oldVal.id && this.selectedYear) {
        this.isLoadingLandings = true
        await this.loadLandingsAsync(this.selectedLocation.id)
        await this.loadLocationsAsync()
        this.isLoadingLandings = false
      }
    },

    async selectedYear(val, oldVal) {
      if (val && this.state === 'default') {
        this.state = 'selected'
      }

      if (val && val !== oldVal) {
        this.isLoadingLandings = true
        await this.loadLandingsAsync(this.selectedVessel.id)
        await this.loadLocationsAsync()
        this.isLoadingLandings = false
      }
    },
  },

  methods: {
    ...mapActions('fishing', [
      'addLandingAsync',
      'deleteLandingAsync',
      'loadVesselsAsync',
      'loadLandingsAsync',
    ]),

    ...mapActions('temperature', ['loadLocationsAsync']),

    ...mapGetters('fishing', ['sortedLandings']),

    async saveLanding() {
      if (!this.isSaving) {
        try {
          this.isSaving = true
          const { mass } = this
          const item = {
            location: this.selectedLocation,
            mass,
            month: this.selectedMonth,
            year: this.selectedYear,
            vessel: this.selectedVessel.id,
          }
          await this.addLandingAsync(item)
          await this.loadLandingsAsync(this.selectedVessel.id)
          this.$toast.add({
            severity: 'success',
            summary: 'Landing Saved',
            detail: `A landing has been saved for ${this.getMonthText(
              this.selectedMonth,
            )} ${this.selectedYear} of ${mass} kg.`,
            life: 3000,
          })
          this.resetAddLandingForm()
          this.isSaving = false
        } catch (err) {}
      }
    },

    getMonthText(month) {
      const baseDate = new Date(1970, 0)
      const dateMonth = this.$dateFns.addMonths(baseDate, month)
      return this.$dateFns.format(dateMonth, 'LLLL')
    },

    resetAddLandingForm() {
      this.mass = 0
      this.selectedMonth = ''
      this.selectedLocation = {}
    },

    showDeleteConfirmation(item) {
      this.$confirm.require({
        message: `Are you sure you want to delete the landing for '${
          item.location.name
        }' in '${this.getMonthText(item.month)}' of ${item.mass} kg?`,
        header: 'Confirm Deletion',
        accept: async () => {
          await this.deleteLandingAsync({
            vesselId: this.selectedVessel.id,
            id: item.id,
          })
          this.$toast.add({
            severity: 'success',
            summary: 'Landing Deleted',
            detail: `A landing has been deleted for '${
              item.location.name
            }' in '${this.getMonthText(item.month)}' of ${item.mass} kg.`,
            life: 3000,
          })
          await this.loadLandingsAsync(this.selectedVessel.id)
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
