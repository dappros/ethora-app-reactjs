// Theme tokens live in src/index.css as RGB channel triplets (`--c-*`) and
// are swapped by the `.dark` class on <html>. Wrapping them like this keeps
// Tailwind's opacity modifiers (`bg-gray-200/50`) working.
const tok = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'gray-50': tok('gray-50'),
        'gray-100': tok('gray-100'),
        'gray-200': tok('gray-200'),
        'gray-300': tok('gray-300'),
        'gray-400': tok('gray-400'),
        'gray-500': tok('gray-500'),
        'gray-600': tok('gray-600'),
        'gray-700': tok('gray-700'),
        'gray-800': tok('gray-800'),
        'gray-900': tok('gray-900'),
        'gray-950': tok('gray-950'),

        'brand-50': tok('brand-50'),
        'brand-100': tok('brand-100'),
        'brand-150': tok('brand-150'),
        'brand-200': tok('brand-200'),
        'brand-250': tok('brand-250'),
        'brand-300': '#99B4E6',
        'brand-400': '#437ED4',
        // 'brand-500': '#0052CD',
        'brand-500': 'var(--bg-brand-primary)',
        'brand-600': '#004AC2',
        'brand-700': '#0040B6',
        'brand-800': '#0035AB',
        'brand-850': '#0035AB',
        'brand-900': '#002398',
        'brand-950': '#001766',

        'green-50': '#F0FDF5',
        'green-100': '#DCFCE8',
        'green-200': '#BBF7D1',
        'green-300': '#86EFAD',
        'green-400': '#4ADE81',
        'green-500': '#22C55E',
        'green-600': '#16A34A',
        'green-700': '#15803C',
        'green-800': '#166533',
        'green-900': '#14532B',
        'green-950': '#052E14',

        'red-50': '#EEF4FF',
        'red-100': '#FFCDD2',
        'red-200': '#EF9A9A',
        'red-300': '#E57373',
        'red-400': '#EF5350',
        'red-500': '#F44336',
        'red-600': '#E53935',
        'red-700': '#D32F2F',
        'red-800': '#C62828',
        'red-900': '#B71C1C',
        'red-950': '#8E0000',

        'yellow-800': '#FFD001',
        'brand-hover': 'var(--brand-hover)',

        black: '#121219',
        white: '#ffffff',
        page: tok('page'),
        surface: tok('surface'),
        fg: tok('fg'),
        preview: 'var(--bg-brand-preview-auth)',
        'brand-darker': 'var(--brand-darker)'
      },
      // `white` and `black` mean different things per utility. As a
      // background, `bg-white` is "the card surface" and must go dark with
      // the theme; as text, `text-white` sits on brand-coloured buttons and
      // must stay white. Likewise `text-black` is body text (themed) while
      // `bg-black/50` is a modal scrim (not themed).
      backgroundColor: {
        white: tok('surface'),
      },
      gradientColorStops: {
        white: tok('surface'),
      },
      textColor: {
        black: tok('fg'),
        // Brand-coloured text is lightened in dark mode (see --brand-text).
        'brand-500': 'var(--brand-text)',
      },
      fontFamily: {
        sans: ['Open Sans'],
        varela: ['Varela Round'],
        inter: ['Inter'],
      },
    },
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
