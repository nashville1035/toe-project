<template>
  <div class="con flex flex-col space-y-16">
    <Toolbar>
      <template #left>
        <div class="flex items-center space-x-4">
          <h1 class="text-3xl">Manage Temperatures</h1>

          <Dropdown
            v-model="selectedLocation"
            class="w-60"
            option-label="name"
            placeholder="Location"
            :options="locationsByName"
          />
        </div>
      </template>

      <template #right>
        <template v-if="selectedLocation.id">
          <div v-if="state === 'default'" class="flex items-center space-x-4">
            <Button
              label="New"
              icon="mdi mdi-plus"
              @click="state = 'add-temperature'"
            />

            <Button
              class="!bg-secondary"
              label="Import"
              icon="mdi mdi-upload"
              @click="state = 'upload-temperatures'"
            />
          </div>

          <Button
            v-else
            class="!bg-secondary-dark !text-white"
            icon="mdi mdi-close"
            @click="returnDefaultState"
          />
        </template>
      </template>
    </Toolbar>

    <Card v-if="state === 'add-temperature'">
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
          <div class="space-y-2">
            <Dropdown
              v-model="addForm.year"
              class="w-full"
              option-label="name"
              option-value="value"
              placeholder="Year"
              :options="years"
            />

            <p
              v-if="$v.addForm.year.$error && !$v.addForm.year.required"
              class="error"
            >
              You must provide a year
            </p>
          </div>

          <div class="space-y-2">
            <Dropdown
              v-model="addForm.month"
              class="w-full"
              option-label="name"
              option-value="value"
              placeholder="Select a month"
              :options="months"
            />

            <p
              v-if="$v.addForm.month.$error && !$v.addForm.month.required"
              class="error"
            >
              You must provide a month
            </p>
          </div>

          <div class="space-y-2">
            <span class="p-float-label">
              <InputNumber
                id="min"
                v-model.lazy="addForm.min"
                class="w-full"
                mode="decimal"
                :min-fraction-digits="3"
                :max-fraction-digits="3"
                @blur="$v.addForm.min.$touch()"
              />

              <label for="min">Minimum</label>
            </span>

            <p
              v-if="$v.addForm.min.$error && !$v.addForm.min.required"
              class="error"
            >
              You must provide a minimum temperature
            </p>
          </div>

          <div class="space-y-2">
            <span class="p-float-label">
              <InputNumber
                id="max"
                v-model.lazy="addForm.max"
                class="w-full"
                mode="decimal"
                :min-fraction-digits="3"
                :max-fraction-digits="5"
                @blur="$v.addForm.max.$touch()"
              />

              <label for="max">Maximum</label>
            </span>

            <p
              v-if="$v.addForm.max.$error && !$v.addForm.max.required"
              class="error"
            >
              You must provide a maximum temperature
            </p>
          </div>

          <div class="space-y-2">
            <span class="p-float-label">
              <InputNumber
                id="avg"
                v-model.lazy="addForm.avg"
                class="w-full"
                mode="decimal"
                :min-fraction-digits="3"
                :max-fraction-digits="3"
                @blur="$v.addForm.avg.$touch()"
              />

              <label for="avg">Average</label>
            </span>

            <p
              v-if="$v.addForm.avg.$error && !$v.addForm.avg.required"
              class="error"
            >
              You must provide an average temperature
            </p>
          </div>

          <Button
            :disabled="isSaving"
            label="Add"
            class="p-button-outlined p-button-sm"
            type="submit"
          />
        </form>
      </template>
    </Card>

    <Card v-if="state === 'upload-temperatures'">
      <template #title>
        <h1 class="text-2xl">
          Upload temperatures for <em>{{ selectedLocation.name }}</em>
        </h1>
      </template>

      <template #content>
        <FileUpload
          :custom-upload="true"
          :file-limit="1"
          :max-file-size="128 * 1000"
          :show-cancel-button="false"
          accept=".xlsx"
          @uploader="saveFile"
        >
          <template #empty>
            <p>Drag and drop Excel file here to upload.</p>
          </template>
        </FileUpload>
      </template>
    </Card>

    <Card v-if="state === 'default'">
      <template #content>
        <DataTable
          current-page-report-template="Showing {first} to {last} of {totalRecords} entries"
          data-key="id"
          group-rows-by="year"
          paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          row-group-mode="subheader"
          :filters="filters"
          :paginator="true"
          :row-hover="true"
          :rows="60"
          :value="temperaturesWithMonthNames"
        >
          <template #header>
            <h1 class="text-2xl">
              <span v-if="selectedLocation.id"
                >Temperatures for {{ selectedLocation.name }}</span
              >
            </h1>

            <span class="p-input-icon-left">
              <i class="pi pi-search" />

              <InputText v-model="filters['global']" placeholder="Search" />
            </span>
          </template>

          <template #empty>
            <p>No temperatures found.</p>
          </template>

          <template #groupheader="slotProps">
            <span>{{ slotProps.data.year }}</span>
          </template>

          <Column field="month" header="Month">
            <template #body="slotProps">
              <Skeleton v-if="isLoadingTemperatures"></Skeleton>

              <template v-else>
                {{ slotProps.data.month }}
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
                  />
                </div>
              </template>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],

  data() {
    return {
      addForm: {
        avg: 0,
        max: 0,
        min: 0,
        month: '',
        year: '',
      },
      isLoadingTemperatures: false,
      isSaving: false,
      filters: {},
      selectedLocation: {},
      state: 'default',
    }
  },

  validations: {
    addForm: {
      avg: { required },
      max: { required },
      min: { required },
      month: { required },
      year: { required },
    },
  },

  async fetch() {
    await this.loadLocationsAsync()
  },

  computed: {
    ...mapGetters('temperature', ['locationsByName']),

    ...mapState('temperature', ['temperatures']),

    currentYear() {
      const now = this.$fireModule.firestore.Timestamp.now()
      const currentYear = this.$dateFns.getYear(now.toDate())
      return currentYear
    },

    temperaturesWithMonthNames() {
      return this.temperatures.map(({ avg, id, min, max, month, year }) => ({
        avg,
        id,
        min,
        max,
        year,
        month: this.getMonthText(month),
      }))
    },

    years() {
      const startYear = 1900

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
      if (val.id && val.id !== oldVal.id) {
        this.isLoadingTemperatures = true
        await this.loadTemperaturesAsync(val.id)
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
        this.$v.addForm.$touch()
        if (!this.$v.addForm.$invalid) {
          try {
            this.isSaving = true
            const { avg, min, max, month, year } = this.addForm
            const location = this.selectedLocation.id
            const item = {
              avg,
              location,
              max,
              min,
              month,
              year,
            }

            await this.addTemperatureAsync(item)
            await this.loadTemperaturesAsync(location)

            this.$toast.add({
              severity: 'success',
              summary: 'Temperature Saved',
              detail: `A temperature has been saved for ${this.getMonthText(
                month,
              )} ${year}.`,
              life: 3000,
            })

            this.resetAddForm()
          } catch (err) {
          } finally {
            this.isSaving = false
          }
        }
      }
    },

    getMonthText(month) {
      const baseDate = new Date(1970, 0)
      const dateMonth = this.$dateFns.addMonths(baseDate, month)
      return this.$dateFns.format(dateMonth, 'LLLL')
    },

    resetAddForm() {
      this.addForm.avg = 0
      this.addForm.max = 0
      this.addForm.min = 0
      this.addForm.month = ''
      this.addForm.year = ''
      this.$v.addForm.$reset()
    },

    showDeleteConfirmation(item) {
      this.$confirm.require({
        message: `Are you sure you want to delete the '${item.month} ${item.year}' temperature?`,
        header: 'Confirm Deletion',
        accept: async () => {
          await this.deleteTemperatureAsync({
            locId: this.selectedLocation.id,
            id: item.id,
          })
          this.$toast.add({
            severity: 'success',
            summary: 'Temperature Deleted',
            detail: `A temperature has been deleted for ${item.month} ${item.year}.`,
            life: 3000,
          })
          await this.loadTemperaturesAsync(this.selectedLocation.id)
        },
      })
    },

    returnDefaultState() {
      this.state = 'default'
      this.resetAddForm()
    },

    async saveFile(e) {
      const [file] = e.files
      const fileRef = this.$fire.storage.ref(
        `uploads/temperature/${this.selectedLocation.id}/${file.name}`,
      )

      await fileRef.put(file)

      this.$toast.add({
        severity: 'success',
        summary: 'Temperature Data Uploaded',
        detail: `The file has been uploaded. Temperature data will soon be updated.`,
        life: 3000,
      })

      this.returnDefaultState()
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
