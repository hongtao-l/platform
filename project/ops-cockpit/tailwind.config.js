/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0E14',
        surface: '#0A0E14',
        'surface-container-lowest': '#0C1017',
        'surface-container-low': '#12171F',
        'surface-container': '#161C26',
        'surface-container-high': '#1B222E',
        'surface-container-highest': '#212936',
        'on-surface': '#E8EAED',
        'on-surface-variant': '#8B949E',
        outline: '#484F58',
        'outline-variant': 'rgba(255,255,255,0.06)',
        primary: '#00F2FF',
        'on-primary': '#00272B',
        secondary: '#3E63DD',
        tertiary: '#7000FF',
        success: '#00E676',
        warning: '#FFB74D',
        error: '#FF5252',
        'grid-line': 'rgba(255,255,255,0.04)',
        glow: 'rgba(0,242,255,0.08)'
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        lg: '12px',
        xl: '1.5rem',
        full: '9999px'
      },
      fontFamily: {
        headline: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        'data-num': ['"JetBrains Mono"', 'monospace'],
        label: ['Geist', 'sans-serif']
      },
      fontSize: {
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.04em' }],
        'headline-md': ['24px', { lineHeight: '32px' }],
        'body-md': ['14px', { lineHeight: '20px' }]
      }
    }
  },
  plugins: []
}
