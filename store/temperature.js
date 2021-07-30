export const state = () => ({
  locations: [],
})

export const mutations = {
  addLocations: (state, items) => (state.locations = items),
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
}

export const actions = {
  async addLocationAsync(_, name) {
    await this.$fire.firestore.collection('temp-location').add({
      name,
    })
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

  async deleteLocationAsync(_, id) {
    await this.$fire.firestore.collection('temp-location').doc(id).delete()
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
}
