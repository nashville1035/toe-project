<template>
  <div class="w-full pt-4 px-3 flex flex-col space-y-8">
    <h1 class="text-2xl font-sans">Thermal Ocean Eyes</h1>

    <Menu :model="items" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          label: 'Temperatures',
          items: [
            {
              label: 'Manage',
              icon: 'mdi mdi-coolant-temperature',
              to: { name: 'temperature-manage' },
            },
            {
              label: 'Locations',
              icon: 'mdi mdi-map-outline',
              to: { name: 'temperature-locations' },
            },
          ],
        },
        {
          label: 'Fishing',
          items: [
            {
              label: 'Landings',
              icon: 'mdi mdi-book-open-outline',
              to: { name: 'fishing-manage' },
            },
            {
              label: 'Vessels',
              icon: 'mdi mdi-ferry',
              to: { name: 'fishing-vessels' },
            },
          ],
        },
        {
          label: 'Reports',
          items: [
            {
              label: 'Models',
              icon: 'mdi mdi-infinity',
              to: { name: 'reports-model' },
            },
            {
              label: 'View',
              icon: 'mdi mdi-chart-box-outline',
              to: { name: 'reports-view' },
            },
          ],
        },
      ],
    }
  },
}
</script>

<style lang="postcss" scoped>
.p-menu {
  @apply w-full bg-transparent border-none;
}
</style>
