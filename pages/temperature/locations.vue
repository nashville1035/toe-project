<template>
  <div class="con flex flex-col space-y-16">
    <Card>
      <template #title>
        <h1 class="text-2xl">Add Temperature Location</h1>
      </template>

      <template #content>
        <form
          class="flex flex-col space-y-8 w-60"
          @submit.prevent="saveLocation"
        >
          <span class="p-float-label">
            <InputText
              id="name"
              v-model.trim="name"
              class="p-inputtext-sm w-full"
              type="text"
            />
            <label for="name">Name</label>
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

export default {
  data() {
    return {
      filters: {},
      isSaving: false,
      isLoadingLocations: false,
      name: '',
    }
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
        try {
          this.isSaving = true
          await this.addLocationAsync(this.name)
          await this.loadLocationsAsync()
          this.$toast.add({
            severity: 'success',
            summary: 'Location Saved',
            detail: `The location ${this.name} has been saved.`,
            life: 3000,
          })
          this.name = ''
          this.isSaving = false
        } catch (err) {}
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
