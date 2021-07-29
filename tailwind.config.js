module.exports = {
  mode: 'jit',
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#e91e63',
      },
    },
    screens: {
      tab: '640px',
      lap: '1024px',
      desk: '1280px',
    },
    fontFamily: {
      sans: ['Raleway', 'ui-sans-serif'],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
