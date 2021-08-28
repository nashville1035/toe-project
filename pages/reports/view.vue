<template>
  <div class="con flex flex-col space-y-16">
    <Toolbar>
      <template #left>
        <div class="flex items-center space-x-4">
          <h1 class="text-3xl">View Report</h1>

          <Dropdown
            v-model="selectedLocation"
            class="w-60"
            option-label="name"
            placeholder="Location"
            :options="locationsByName"
          />

          <Dropdown
            v-model="selectedStartYear"
            class="w-40"
            option-label="name"
            option-value="value"
            placeholder="Start Year"
            :disabled="!selectedLocation.id"
            :options="years"
          />

          <Dropdown
            v-model="selectedEndYear"
            class="w-40"
            option-label="name"
            option-value="value"
            placeholder="End Year"
            :disabled="!selectedStartYear"
            :options="years"
          />
        </div>
      </template>
    </Toolbar>

    <Card>
      <template #content>
        <Chart type="bar" :data="data" :options="options" />
      </template>
    </Card>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import ml5 from 'ml5'

export default {
  data() {
    return {
      mass: [],
      selectedLocation: {},
      selectedStartYear: '',
      selectedEndYear: '',
      modelUrl: '',
      modelMetaUrl: '',
      modelWeightsUrl: '',
      nn: null,
      predictedMass: 0,
      state: 'default',
      temps: [],
    }
  },

  async fetch() {
    await this.loadLocationsAsync()
  },

  computed: {
    ...mapGetters('temperature', ['locationsByName']),

    ...mapState('temperature', ['temperatures']),

    ...mapState('fishing', ['landings']),

    currentYear() {
      const now = this.$fireModule.firestore.Timestamp.now()
      const currentYear = this.$dateFns.getYear(now.toDate())
      return currentYear - 1
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

    fixedLandings() {
      const minimum = this.selectedStartYear
      const maximum = this.selectedEndYear

      if (!minimum || !maximum) {
        return []
      }

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
      const minimum = this.selectedStartYear
      const maximum = this.selectedEndYear

      if (!minimum || !maximum) {
        return []
      }

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

    data() {
      const diff = this.selectedEndYear - this.selectedStartYear
      const labels = []
      for (let i = 0; i <= diff; i++) {
        labels.push(this.selectedStartYear + i)
      }

      return {
        labels,
        datasets: [
          {
            label: 'Mass (kg)',
            backgroundColor: '#00bb7e',
            yAxisID: 'y-mass',
            data: this.fixedLandings.map((x) => x.mass.toFixed(3)),
          },
          {
            type: 'line',
            label: 'Avg Temperature',
            borderColor: '#FFA726',
            yAxisID: 'y-temp',
            data: this.fixedTemps.map((t) => t.avg.toFixed(3)),
          },
          // {
          //   label: 'Predicted Mass (kg)',
          //   backgroundColor: '#23bb7e',
          //   yAxisID: 'y-mass',
          //   data: [this.predictedMass],
          // },
        ],
      }
    },

    options() {
      return {
        responsive: true,
        tooltips: {
          mode: 'index',
          intersect: true,
        },
        scales: {
          yAxes: [
            {
              type: 'linear',
              display: true,
              position: 'left',
              id: 'y-mass',
            },
            {
              type: 'linear',
              display: true,
              position: 'right',
              id: 'y-temp',
              gridLines: {
                drawOnChartArea: false,
              },
              ticks: {
                min: 25,
                max: 40,
              },
            },
          ],
        },
      }
    },
  },

  watch: {
    async selectedLocation(val, oldVal) {
      if (val.id && val.id !== oldVal.id) {
        await this.loadTemperaturesAsync(val.id)
        await this.loadLandingsForLocationAsync(val.id)
        this.modelUrl = await this.$fire.storage
          .ref(`uploads/models/${val.id}/model.json`)
          .getDownloadURL()
        this.modelMetaUrl = await this.$fire.storage
          .ref(`uploads/models/${val.id}/model_meta.json`)
          .getDownloadURL()
        this.modelWeightsUrl = await this.$fire.storage
          .ref(`uploads/models/${val.id}/model.weights.bin`)
          .getDownloadURL()

        if (this.modelUrl && this.modelMetaUrl && this.modelWeightsUrl) {
          this.nn = ml5.neuralNetwork({ task: 'regression' })

          const modelDetails = {
            model: this.modelUrl,
            metadata: this.modelMetaUrl,
            weights: this.modelWeightsUrl,
          }

          this.nn.load(modelDetails, this.onModelLoaded)
        }
      }
    },

    fixedTemps(val, oldVal) {
      if (this.modelLoaded) {
        if (val.length && val !== oldVal) {
          // const { avg } = val.pop()
          const { avg, min, max } = val.pop()

          // this.nn.predict({ avg }, this.onPredicted)
          this.nn.predict({ avg, min, max }, this.onPredicted)
        }
      }
    },
  },

  methods: {
    ...mapActions('temperature', [
      'loadLocationsAsync',
      'loadTemperaturesAsync',
    ]),

    ...mapActions('fishing', ['loadLandingsForLocationAsync']),

    getMonthText(month) {
      const baseDate = new Date(1970, 0)
      const dateMonth = this.$dateFns.addMonths(baseDate, month)
      return this.$dateFns.format(dateMonth, 'LLLL')
    },

    onModelLoaded() {
      this.modelLoaded = true
    },

    onPredicted(err, x) {
      if (err) {
        return
      }

      const val = x[0]

      this.$toast.add({
        severity: 'success',
        summary: 'Model Prediction',
        detail: `The predicted mass for ${
          this.selectedEndYear + 1
        } is ${val.mass.toFixed(3)} kg.`,
        // life: 3000,
      })

      this.predictedMass = val.mass.toFixed(3)
    },
  },
}
</script>
