<template>
  <div class="con">
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
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      name: '',
      isSaving: false,
    }
  },

  methods: {
    ...mapActions('temperature', ['addLocationAsync', 'loadLocationsAsync']),

    async saveLocation() {
      if (!this.isSaving) {
        try {
          this.isSaving = true
          await this.addLocationAsync(this.name)
          await this.loadLocationsAsync()
          this.name = ''
          this.isSaving = false
        } catch (err) {}
      }
    },
  },
}
</script>
