export const state = () => ({
  vessels: [],
})

export const mutations = {
  addVessels: (state, items) => (state.vessels = items),
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
}

export const actions = {
  async addVesselAsync(_, name) {
    await this.$fire.firestore.collection('vessels').add({
      name,
    })
  },

  async deleteVesselAsync(_, id) {
    await this.$fire.firestore.collection('vessels').doc(id).delete()
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
