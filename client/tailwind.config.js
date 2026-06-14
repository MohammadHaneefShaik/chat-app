/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chat: {
          bg: '#1E1E24', // Deep dark gray background
          panel: '#2B2B36', // Lighter panel for sidebar/cards
          hover: '#363644', // Hover state
          bubbleSent: '#4A4D62', // Sent message bubble
          bubbleRecv: '#343645', // Received message bubble
          inputBg: '#2A2A35', // Input field background
          accent: '#5E63B6', // A soft blue/purple accent
          accentHover: '#4C5199',
          textMain: '#FFFFFF',
          textMuted: '#9CA3AF', // Gray-400
          border: '#363644'
        }
      }
    },
  },
  plugins: [
    require('daisyui')
  ],
}
