export const state = () => ({
  locations: [],
  temperatures: [],
})

export const mutations = {
  addLocations: (state, items) => (state.locations = items),

  addTemperatures: (state, items) => (state.temperatures = items),
}

export const getters = {
  locationsByName: (state) =>
    state.locations.slice(0).sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()

      if (aName < bName) {
        return -1
      } else if (aName > bName) {
        return 1
      } else {
        return 0
      }
    }),

  sortedTemperatures: (state) => (year) =>
    state.temperatures
      .filter((x) => x.year === year)
      .sort((a, b) => a.month - b.month),
}

export const actions = {
  async addLocationAsync(_, name) {
    await this.$fire.firestore.collection('temp-location').add({
      name,
    })
  },

  async addTemperatureAsync(_, { location, month, year, avg, max, min }) {
    await this.$fire.firestore
      .collection('temp-location')
      .doc(location)
      .collection('temps')
      .add({
        avg,
        min,
        max,
        month,
        year,
      })
  },

  async deleteLocationAsync(_, id) {
    await this.$fire.firestore.collection('temp-location').doc(id).delete()
  },

  async deleteTemperatureAsync(_, { locId, id }) {
    await this.$fire.firestore
      .collection('temp-location')
      .doc(locId)
      .collection('temps')
      .doc(id)
      .delete()
  },

  async loadLocationsAsync({ commit }) {
    const snap = await this.$fire.firestore.collection('temp-location').get()

    if (snap.empty) {
      return
    }

    const items = []

    snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }))

    commit('addLocations', items)
  },

  async loadTemperaturesAsync({ commit }, id) {
    const snap = await this.$fire.firestore
      .collection('temp-location')
      .doc(id)
      .collection('temps')
      .get()

    if (snap.empty) {
      return
    }

    const items = []
    snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }))

    commit('addTemperatures', items)
  },
}
