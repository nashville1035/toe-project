<template>
  <div class="con flex flex-col space-y-16">
    <Toolbar>
      <template #left>
        <h1 class="text-3xl">Temperature Locations</h1>
      </template>

      <template #right>
        <Button
          v-if="state === 'default'"
          label="New"
          icon="mdi mdi-plus"
          @click="state = 'add-location'"
        />

        <Button
          v-else
          class="!bg-secondary-dark !text-white"
          icon="mdi mdi-close"
          @click="closeAddLocation"
        />
      </template>
    </Toolbar>

    <Card v-if="state === 'add-location'">
      <template #title>
        <h1 class="text-2xl">Add Temperature Location</h1>
      </template>

      <template #content>
        <form
          class="flex flex-col space-y-8 w-60"
          @submit.prevent="saveLocation"
        >
          <div class="space-y-2">
            <span class="p-float-label">
              <InputText
                id="name"
                v-model.trim.lazy="form.name"
                class="p-inputtext-sm w-full"
                type="text"
                @blur="$v.form.name.$touch()"
              />

              <label for="name">Name</label>
            </span>

            <p
              v-if="$v.form.name.$error && !$v.form.name.required"
              class="error"
            >
              You must provide a location name
            </p>

            <p
              v-else-if="$v.form.name.$error && !$v.form.name.minLength"
              class="error"
            >
              A location name must be at least 2 characters
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

    <Card>
      <template #content>
        <DataTable
          current-page-report-template="Showing {first} to {last} of {totalRecords} entries"
          data-key="id"
          paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :filters="filters"
          :paginator="true"
          :row-hover="true"
          :rows-per-page-options="[25, 50, 100]"
          :rows="25"
          :value="locationsByName"
        >
          <template #header>
            <h1 class="text-2xl">Temperature Locations</h1>

            <span class="p-input-icon-left">
              <i class="pi pi-search" />

              <InputText v-model="filters['global']" placeholder="Search" />
            </span>
          </template>

          <template #empty>
            <p>No locations found.</p>
          </template>

          <Column field="name" header="Name" :sortable="true">
            <template #body="slotProps">
              <Skeleton v-if="isLoadingLocations"></Skeleton>

              <template v-else>
                {{ slotProps.data.name }}
              </template>
            </template>
          </Column>

          <Column header-class="actions__header" body-class="actions__body">
            <template #body="slotProps">
              <Skeleton v-if="isLoadingLocations"></Skeleton>

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
import { mapActions, mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'
import { minLength, required } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],

  data() {
    return {
      filters: {},
      isLoadingLocations: false,
      isSaving: false,
      form: {
        name: '',
      },
      state: 'default',
    }
  },

  validations: {
    form: {
      name: {
        required,
        minLength: minLength(2),
      },
    },
  },

  computed: {
    ...mapGetters('temperature', ['locationsByName']),
  },

  async mounted() {
    this.isLoadingLocations = true
    await this.loadLocationsAsync()
    this.isLoadingLocations = false
  },

  methods: {
    ...mapActions('temperature', [
      'addLocationAsync',
      'deleteLocationAsync',
      'loadLocationsAsync',
    ]),

    async saveLocation() {
      if (!this.isSaving) {
        this.$v.form.$touch()
        if (!this.$v.form.$invalid) {
          try {
            this.isSaving = true
            const { name } = this.form
            await this.addLocationAsync(name)
            await this.loadLocationsAsync()
            this.$toast.add({
              severity: 'success',
              summary: 'Location Saved',
              detail: `The location ${name} has been saved.`,
              life: 3000,
            })
            this.resetForm()
          } catch (err) {
          } finally {
            this.isSaving = false
          }
        }
      }
    },

    showDeleteConfirmation(item) {
      this.$confirm.require({
        message: `Are you sure you want to delete the location '${item.name}'?`,
        header: 'Confirm Deletion',
        accept: async () => {
          await this.deleteLocationAsync(item.id)
          this.$toast.add({
            severity: 'success',
            summary: 'Location Deleted',
            detail: `The location ${item.name} has been deleted.`,
            life: 3000,
          })
          await this.loadLocationsAsync()
        },
      })
    },

    resetForm() {
      this.form.name = ''
      this.$v.form.$reset()
    },

    closeAddLocation() {
      this.resetForm()
      this.state = 'default'
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
