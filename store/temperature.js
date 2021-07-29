export const state = () => ({
  locations: [],
})

export const mutations = {
  addLocations: (state, items) => (state.locations = items),
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
}
