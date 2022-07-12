/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        'button': {
          borderRadius: '.25rem',
          fontWeight: '600',
          color: 'black',
          backgroundColor: 'white',
          border: 'solid 1px black',
          transition: 'background-color 300ms linear',
          '&:hover': {
            backgroundColor: 'gray',
          }
        }
      })
    }),
    require('@tailwindcss/forms')
  ]
}