<template>
  <div class="con flex flex-col space-y-16">
    <Toolbar>
      <template #left>
        <div class="flex items-center space-x-4">
          <h1 class="text-3xl">Manage Landings</h1>

          <Dropdown
            v-model="selectedVessel"
            class="w-60"
            option-label="name"
            placeholder="Vessel"
            :options="vesselsByName"
          />
        </div>
      </template>

      <template #right>
        <template v-if="selectedVessel.id">
          <div v-if="state === 'default'" class="flex items-center space-x-4">
            <Button
              label="New"
              icon="mdi mdi-plus"
              @click="state = 'add-landing'"
            />

            <Button
              class="!bg-secondary"
              label="Import"
              icon="mdi mdi-upload"
              @click="state = 'upload-landings'"
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

    <Card v-if="state === 'add-landing'">
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
            <Dropdown
              v-model="addForm.location"
              class="w-full"
              option-label="name"
              placeholder="Location"
              :options="locationsByName"
            />

            <p
              v-if="$v.addForm.location.$error && !$v.addForm.location.required"
              class="error"
            >
              You must provide a location
            </p>
          </div>

          <div class="space-y-2">
            <span class="p-float-label">
              <InputNumber
                id="mass"
                v-model.lazy="addForm.mass"
                class="w-full"
                mode="decimal"
                :min-fraction-digits="1"
                :max-fraction-digits="5"
                @blur="$v.addForm.mass.$touch()"
              />

              <label for="mass">Mass in kg</label>
            </span>

            <p
              v-if="$v.addForm.mass.$error && !$v.addForm.mass.required"
              class="error"
            >
              You must provide catch mass in kilogrammes
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

    <Card v-if="state === 'upload-landings'">
      <template #title>
        <h1 class="text-2xl">
          Upload landings for <em>{{ selectedVessel.name }}</em>
        </h1>
      </template>

      <template #content>
        <div class="space-y-2">
          <Dropdown
            v-model="upload.location"
            class="w-full"
            option-label="name"
            placeholder="Location"
            :options="locationsByName"
          />

          <p
            v-if="$v.upload.location.$error && !$v.upload.location.required"
            class="error"
          >
            You must provide a location
          </p>
        </div>

        <FileUpload
          class="mt-4"
          accept=".xlsx"
          :custom-upload="true"
          :file-limit="1"
          :max-file-size="128 * 1000"
          :show-cancel-button="false"
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
          :rows="50"
          :value="landingsWithMonthNames"
        >
          <template #header>
            <h1 class="text-2xl">
              <span v-if="selectedVessel.id">
                Landings for {{ selectedVessel.name }}
              </span>
            </h1>

            <span class="p-input-icon-left">
              <i class="pi pi-search" />

              <InputText v-model="filters['global']" placeholder="Search" />
            </span>
          </template>

          <template #empty>
            <p>No landings found.</p>
          </template>

          <template #groupheader="slotProps">
            <span>{{ slotProps.data.year }}</span>
          </template>

          <Column field="month" header="Month">
            <template #body="slotProps">
              <Skeleton v-if="isLoadingLandings"></Skeleton>

              <template v-else>
                {{ slotProps.data.month }}
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
        location: null,
        mass: 0,
        month: '',
        year: '',
      },
      filters: {},
      isLoadingLandings: false,
      isSaving: false,
      selectedVessel: {},
      state: 'default',
      upload: {
        location: '',
      },
    }
  },

  validations: {
    addForm: {
      location: { required },
      mass: { required },
      month: { required },
      year: { required },
    },
    upload: {
      location: { required },
    },
  },

  async fetch() {
    await this.loadVesselsAsync()
    await this.loadLocationsAsync()
  },

  computed: {
    ...mapGetters('fishing', ['vesselsByName']),

    ...mapGetters('temperature', ['locationsByName']),

    ...mapState('fishing', ['landings']),

    landingsWithMonthNames() {
      return this.landings.map(({ id, mass, location, month, year }) => ({
        id,
        mass,
        location,
        year,
        month: this.getMonthText(month),
      }))
    },

    currentYear() {
      const now = this.$fireModule.firestore.Timestamp.now()
      const currentYear = this.$dateFns.getYear(now.toDate())
      return currentYear
    },

    years() {
      const startYear = 1965

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
      if (val.id && val.id !== oldVal.id) {
        this.isLoadingLandings = true
        await this.loadLandingsAsync(val.id)
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

    async saveLanding() {
      if (!this.isSaving) {
        this.$v.addForm.$touch()
        if (!this.$v.addForm.$invalid) {
          try {
            this.isSaving = true
            const { mass, location, year, month } = this.addForm
            const item = {
              location,
              mass,
              month,
              year,
              vessel: this.selectedVessel.id,
            }

            await this.addLandingAsync(item)
            await this.loadLandingsAsync(this.selectedVessel.id)

            this.$toast.add({
              severity: 'success',
              summary: 'Landing Saved',
              detail: `A landing has been saved for ${this.getMonthText(
                month,
              )} ${year} of ${mass} kg.`,
              life: 3000,
            })

            this.resetAddLandingForm()
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

    resetAddLandingForm() {
      this.addForm.mass = 0
      this.addForm.month = ''
      this.addForm.year = ''
      this.addForm.location = null
      this.$v.addForm.$reset()
    },

    returnDefaultState() {
      this.state = 'default'
      this.resetAddLandingForm()
      this.upload.location = null
    },

    showDeleteConfirmation(item) {
      const {
        id,
        location: { name },
        month,
        mass,
      } = item

      this.$confirm.require({
        message: `Are you sure you want to delete the landing for '${name}' in '${month}' of ${mass} kg?`,
        header: 'Confirm Deletion',
        accept: async () => {
          await this.deleteLandingAsync({
            vesselId: this.selectedVessel.id,
            id,
          })

          this.$toast.add({
            severity: 'success',
            summary: 'Landing Deleted',
            detail: `A landing has been deleted for '${name}' in '${month}' of ${mass} kg.`,
            life: 3000,
          })

          await this.loadLandingsAsync(this.selectedVessel.id)
        },
      })
    },

    async saveFile(e) {
      this.$v.upload.$touch()
      if (!this.$v.upload.$invalid) {
        const { location } = this.upload
        const [file] = e.files
        const fileRef = this.$fire.storage.ref(
          `uploads/landings/${this.selectedVessel.id}/${location.id}/${file.name}`,
        )

        await fileRef.put(file)

        this.$toast.add({
          severity: 'success',
          summary: 'Landing Data Uploaded',
          detail: `The file has been uploaded. Landing data will soon be updated.`,
          life: 3000,
        })

        this.returnDefaultState()
      }
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
