<template>
  <div class="main-container">
    <ScrollPanel class="panel--side">
      <Sidebar />
    </ScrollPanel>

    <ScrollPanel class="panel--main">
      <nuxt class="con" />
    </ScrollPanel>

    <Toast></Toast>
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script>
import Sidebar from '~/components/Sidebar.vue'

export default {
  components: {
    Sidebar,
  },
}
</script>

<style lang="postcss">
@import '@mdi/font/css/materialdesignicons';

.error {
  @apply text-xs text-red-500 leading-none mt-2;
}

.p {
  &-button {
    @apply bg-primary text-white;

    &:enabled:hover,
    &:enabled:active {
      @apply bg-primary-light text-white;
    }

    &:enabled:focus {
      @apply bg-primary-light;
    }

    &&-outlined {
      @apply text-primary;

      &:enabled:hover,
      &:enabled:active {
        @apply border border-primary-light text-primary-light;
      }
    }
  }
}
</style>

<style lang="postcss" scoped>
.main-container {
  @apply w-full h-screen text-white;

  display: grid;
  grid-template-columns: auto 1fr;
  grid-template: {
    rows: 1fr;
    areas: sidebar main;
  }
}

.con {
  @apply w-4/5 mx-auto max-w-screen-desk;
}

::v-deep {
  .panel--side {
    @apply bg-gray-900;

    .p-scrollpanel-wrapper {
      @apply w-80;
    }
  }

  .panel--main {
    @apply bg-black bg-opacity-95 pt-6;
  }
}
</style>
