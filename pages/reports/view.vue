<template>
  <div class="con flex flex-col space-y-16">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl">View Report</h1>

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

      <Dropdown
        v-model="selectedMonth"
        option-label="name"
        option-value="value"
        placeholder="Month"
        :disabled="!selectedEndYear"
        :options="months"
      />
    </div>

    <Card>
      <template #content>
        <Chart type="bar" :data="data" :options="options" />
      </template>
    </Card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      mass: [],
      selectedLocation: {},
      selectedMonth: '',
      selectedStartYear: '',
      selectedEndYear: '',
      state: 'default',
      temps: [],
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
      return currentYear - 1
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
            data: this.mass,
          },
          {
            type: 'line',
            label: 'Avg Temperature',
            borderColor: '#FFA726',
            yAxisID: 'y-temp',
            data: this.temps.map((t) => t.avg),
          },
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
      if (
        val.id &&
        val.id !== oldVal.id &&
        this.selectedStartYear &&
        this.selectedEndYear &&
        this.selectedMonth
      ) {
        await this.loadData()
      }
    },

    async selectedStartYear(val, oldVal) {
      if (val && val !== oldVal && this.selectedEndYear && this.selectedMonth) {
        await this.loadData()
      }
    },

    async selectedEndYear(val, oldVal) {
      if (val && val !== oldVal && this.selectedMonth) {
        await this.loadData()
      }
    },

    async selectedMonth(val, oldVal) {
      if (this.state === 'default') {
        this.state = 'selected'
      }

      if (val !== oldVal) {
        await this.loadData()
      }
    },
  },

  methods: {
    ...mapActions('temperature', ['loadLocationsAsync']),

    async loadData() {
      const snap = await this.$fire.firestore
        .collection('temp-location')
        .doc(this.selectedLocation.id)
        .collection('temps')
        .where('year', '>=', this.selectedStartYear)
        .where('year', '<=', this.selectedEndYear)
        .get()

      if (snap.empty) {
        return
      }

      this.temps = []
      snap.forEach((doc) => this.temps.push({ id: doc.id, ...doc.data() }))

      const landingsSnap = await this.$fire.firestore
        .collectionGroup('landings')
        .where('location.id', '==', this.selectedLocation.id)
        .get()

      if (landingsSnap.empty) {
        return
      }

      const tempLandings = []
      landingsSnap.forEach((doc) =>
        tempLandings.push({ id: doc.id, ...doc.data() }),
      )

      const landingsFiltered = tempLandings
        .filter((x) => x.year >= this.selectedStartYear)
        .filter((x) => x.year <= this.selectedEndYear)
        .filter((x) => x.month === this.selectedMonth)

      this.mass = []
      for (let i = this.selectedStartYear; i <= this.selectedEndYear; i++) {
        const perYearMass = landingsFiltered
          .filter((x) => x.year === i)
          .map((x) => x.mass)
        const totalMass = perYearMass.reduce((acc, curr) => acc + curr)
        this.mass.push(totalMass)
      }
    },

    getMonthText(month) {
      const baseDate = new Date(1970, 0)
      const dateMonth = this.$dateFns.addMonths(baseDate, month)
      return this.$dateFns.format(dateMonth, 'LLLL')
    },
  },
}
</script>
