<template>
  <div class="con flex flex-col space-y-16">
    <Toolbar>
      <template #left>
        <div class="flex items-center space-x-4">
          <h1 class="text-3xl">Manage Models</h1>

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
              @click="state = 'add-model'"
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

    <Card v-if="state === 'add-model'">
      <template #title>
        <h1 class="text-2xl">
          Add model for <em>{{ selectedLocation.name }}</em>
        </h1>
      </template>

      <template #content>
        <form
          class="flex flex-col space-y-8 w-80"
          @submit.prevent="generateModel"
        >
          <div class="space-y-2">
            <Dropdown
              v-model="model.batchSize"
              class="w-full"
              option-label="name"
              option-value="value"
              placeholder="Batch Size"
              :options="batches"
            />

            <p
              v-if="$v.model.batchSize.$error && !$v.model.batchSize.required"
              class="error"
            >
              You must provide a batch size
            </p>
          </div>

          <div class="space-y-2">
            <Dropdown
              v-model="model.epochs"
              class="w-full"
              option-label="name"
              option-value="value"
              placeholder="Epochs"
              :options="epochs"
            />

            <p
              v-if="$v.model.epochs.$error && !$v.model.epochs.required"
              class="error"
            >
              You must provide the number of epochs
            </p>
          </div>

          <Button
            :disabled="isGenerating"
            label="Generate"
            class="p-button-outlined p-button-sm"
            type="submit"
          />
        </form>
      </template>
    </Card>

    <Card v-if="state === 'upload-model'">
      <template #title>
        <h1 class="text-2xl">
          Upload model for <em>{{ selectedLocation.name }}</em>
        </h1>
      </template>

      <template #content>
        <div class="space-y-8">
          <FileUpload
            :custom-upload="true"
            :file-limit="1"
            :max-file-size="128 * 1000"
            :show-cancel-button="false"
            accept=".json"
            @uploader="saveFile"
          >
            <template #empty>
              <p>Drag and drop 'model.json' file here.</p>
            </template>
          </FileUpload>

          <FileUpload
            :custom-upload="true"
            :file-limit="1"
            :max-file-size="128 * 1000"
            :show-cancel-button="false"
            accept=".json"
            @uploader="saveFile"
          >
            <template #empty>
              <p>Drag and drop 'model_meta.json' file here.</p>
            </template>
          </FileUpload>

          <FileUpload
            :custom-upload="true"
            :file-limit="1"
            :max-file-size="128 * 1000"
            :show-cancel-button="false"
            accept=".bin"
            @uploader="saveFile"
          >
            <template #empty>
              <p>Drag and drop 'model.weights.bin' file here.</p>
            </template>
          </FileUpload>
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import ml5 from 'ml5'

export default {
  mixins: [validationMixin],

  data() {
    return {
      isGenerating: false,
      model: {
        batchSize: 16,
        epochs: 50,
      },
      modelUploaded: false,
      modelMetaUploaded: false,
      modelWeightsUploaded: false,
      nn: null,
      selectedLocation: {},
      state: 'default',
    }
  },

  validations: {
    model: {
      batchSize: { required },
      epochs: { required },
    },
  },

  async fetch() {
    await this.loadLocationsAsync()
  },

  computed: {
    ...mapGetters('temperature', ['locationsByName']),

    ...mapState('temperature', ['temperatures']),

    ...mapState('fishing', ['landings']),

    batches() {
      return [8, 16, 32, 64, 128].map((b) => ({ name: b.toString(), value: b }))
    },

    epochs() {
      return Array.from({ length: 10 }, (x, i) => {
        const val = (i + 1) * 10
        return {
          value: val,
          name: val.toString(),
        }
      })
    },

    fixedLandings() {
      const minimum = Math.min(...this.landings.map((x) => x.year))
      const maximum = Math.max(...this.landings.map((x) => x.year))

      const landings = []
      for (let i = minimum; i <= maximum; i++) {
        const landingsArr = this.landings
          .filter((x) => x.year === i)
          .map((x) => x.mass)
        const mass = landingsArr.reduce((acc, curr) => acc + curr)
        landings.push({ year: i, mass })
      }

      return landings
    },

    fixedTemps() {
      const minimum = Math.min(...this.temperatures.map((x) => x.year))
      const maximum = Math.max(...this.temperatures.map((x) => x.year))

      const temps = []
      for (let i = minimum; i <= maximum; i++) {
        const averages = this.temperatures
          .filter((x) => x.year === i)
          .map((x) => x.avg)
        const avgTotal = averages.reduce((acc, curr) => acc + curr)
        const avg = avgTotal / averages.length

        const mins = this.temperatures
          .filter((x) => x.year === i)
          .map((x) => x.min)
        const minTotal = mins.reduce((acc, curr) => acc + curr)
        const min = minTotal / mins.length

        const maxes = this.temperatures
          .filter((x) => x.year === i)
          .map((x) => x.max)
        const maxTotal = maxes.reduce((acc, curr) => acc + curr)
        const max = maxTotal / maxes.length

        temps.push({ year: i, avg, min, max })
      }

      return temps
    },
  },

  watch: {
    async selectedLocation(val, oldVal) {
      if (val.id && val.id !== oldVal.id) {
        await this.loadTemperaturesAsync(val.id)
        await this.loadLandingsForLocationAsync(val.id)
      }
    },
  },

  methods: {
    ...mapActions('temperature', [
      'loadLocationsAsync',
      'loadTemperaturesAsync',
    ]),

    ...mapActions('fishing', ['loadLandingsForLocationAsync']),

    returnDefaultState() {
      this.state = 'default'
    },

    generateModel() {
      if (!this.isGenerating) {
        this.$v.model.$touch()
        if (!this.$v.model.$invalid) {
          this.isGenerating = true

          const options = {
            inputs: 3,
            outputs: 1,
            task: 'regression',
            // debug: true,
          }

          this.nn = ml5.neuralNetwork(options)

          this.fixedTemps.forEach(({ avg, min, max, year }, i) => {
            const x = i + 1

            if (x >= this.landings.length) {
              return
            }

            const inputs = {
              avg,
              min,
              max,
            }

            const { mass } = this.landings[x]

            if (!mass) {
              return
            }

            const output = {
              mass,
            }

            this.nn.addData(inputs, output)
          })

          this.nn.normalizeData()

          const { batchSize, epochs } = this.model

          this.nn.train({ batchSize, epochs }, this.trainComplete)
        }
      }
    },

    trainComplete() {
      this.$toast.add({
        severity: 'success',
        summary: 'Save Model',
        detail: `Please save the model files that have been generated.`,
        life: 3000,
      })
      this.state = 'upload-model'
      this.nn.save()

      this.isGenerating = false
    },

    async saveFile(e) {
      const [file] = e.files
      if (
        file.name !== 'model_meta.json' &&
        file.name !== 'model.json' &&
        file.name !== 'model.weights.bin'
      ) {
        this.$toast.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: `You have supplied an invalid model file.`,
          life: 3000,
        })
        return
      }

      const fileRef = this.$fire.storage.ref(
        `uploads/models/${this.selectedLocation.id}/${file.name}`,
      )

      await fileRef.put(file)

      if (file.name === 'model.json') {
        this.modelUploaded = true
      } else if (file.name === 'model_meta.json') {
        this.modelMetaUploaded = true
      } else if (file.name === 'model.weights.bin') {
        this.modelWeightsUploaded = true
      }

      this.$toast.add({
        severity: 'success',
        summary: 'Model Uploaded',
        detail: `The model file '${file.name}' has been uploaded.`,
        life: 3000,
      })

      if (
        this.modelUploaded &&
        this.modelMetaUploaded &&
        this.modelWeightsUploaded
      ) {
        this.$toast.add({
          severity: 'success',
          summary: 'All Models Uploaded',
          detail: `You have uploaded all the model files. You can make predictions now.`,
          life: 3000,
        })
        this.returnDefaultState()
      }
    },
  },
}
</script>
