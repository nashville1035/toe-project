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
              label: 'Manage Locations',
              icon: 'pi pi-map',
              to: { name: 'temperature-manage-locations' },
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
