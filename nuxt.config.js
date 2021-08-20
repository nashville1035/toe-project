export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Thermal Ocean Eyes',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxtjs/date-fns',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['primevue/nuxt', '@nuxtjs/firebase'],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extractCSS: process.env.NODE_ENV === 'production',

    postcss: {
      plugins: {
        'postcss-nested': {},
        'postcss-nested-props': {},
        'postcss-import': {},
      },
    },
  },

  // Server config
  server: {
    host: '0.0.0.0',
    port: 7000,
  },

  // PrimeVue
  primevue: {
    theme: 'md-dark-deeppurple',
    ripple: true,
    components: [
      'Button',
      'Card',
      'Chart',
      'Column',
      'ConfirmDialog',
      'DataTable',
      'Dropdown',
      'InputNumber',
      'InputText',
      'Menu',
      'ScrollPanel',
      'Skeleton',
      'Toast',
      'Toolbar',
    ],
    directives: [],
    services: ['ConfirmationService', 'ToastService'],
  },

  // Google Fonts
  googleFonts: {
    prefetch: true,
    preconnect: true,
    preload: true,
    display: 'swap',
    families: {
      Raleway: true,
    },
  },

  // Firebase config
  firebase: {
    config: {
      apiKey: 'AIzaSyAlwTTtYfBbA_TF5sG13EdWjFcp3MBMCdQ',
      authDomain: 'thermal-ocean-eyes.firebaseapp.com',
      projectId: 'thermal-ocean-eyes',
      storageBucket: 'thermal-ocean-eyes.appspot.com',
      messagingSenderId: '845986632897',
      appId: '1:845986632897:web:49f652eb998c69c551f040',
      measurementId: 'G-MDZQ11855N',
    },
    services: {
      auth: true,
      firestore: true,
      analytics: true,
      storage: true,
    },
  },
}
