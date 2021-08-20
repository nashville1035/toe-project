module.exports = {
  mode: 'jit',
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#007769',
        'primary-dark': '#004a3f',
        'primary-light': '#48a697',
        secondary: '#ff5722',
        'secondary-dark': '#c41c00',
        'secondary-light': '#ff8a50',
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
