export const state = () => ({
  landings: [],
  vessels: [],
})

export const mutations = {
  addVessels: (state, items) => (state.vessels = items),

  addLandings: (state, items) => (state.landings = items),
}

export const getters = {
  vesselsByName: (state) =>
    state.vessels.slice(0).sort((a, b) => {
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

  sortedLandings: (state) => (year) =>
    state.landings
      .filter((x) => x.year === year)
      .sort((a, b) => a.month - b.month),
}

export const actions = {
  async addLandingAsync(_, { vessel, location, month, year, mass }) {
    await this.$fire.firestore
      .collection('vessels')
      .doc(vessel)
      .collection('landings')
      .add({
        location,
        mass,
        month,
        year,
      })
  },

  async addVesselAsync(_, name) {
    await this.$fire.firestore.collection('vessels').add({
      name,
    })
  },

  async deleteLandingAsync(_, { vesselId, id }) {
    await this.$fire.firestore
      .collection('vessels')
      .doc(vesselId)
      .collection('landings')
      .doc(id)
      .delete()
  },

  async deleteVesselAsync(_, id) {
    await this.$fire.firestore.collection('vessels').doc(id).delete()
  },

  async loadLandingsAsync({ commit }, id) {
    const snap = await this.$fire.firestore
      .collection('vessels')
      .doc(id)
      .collection('landings')
      .get()

    if (snap.empty) {
      return
    }

    const items = []
    snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }))

    commit('addLandings', items)
  },

  async loadVesselsAsync({ commit }) {
    const snap = await this.$fire.firestore.collection('vessels').get()

    if (snap.empty) {
      return
    }

    const items = []

    snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }))

    commit('addVessels', items)
  },
}
