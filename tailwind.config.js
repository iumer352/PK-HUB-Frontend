//** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',     // Extra small devices
        'sm': '640px',     // Small devices
        'md': '768px',     // Medium devices
        'lg': '1024px',    // Large devices
        'xl': '1300px',    // Extra large devices
        '2xl': '1550px',   // 2X Extra large devices
        'custom': '1200px' // Your custom breakpoint
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};


