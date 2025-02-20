/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    import('tailwind-scrollbar'),
  ],
  variants: {
    scrollbar: ['rounded', 'dark']
  }
}
