module.exports = {
  content: [
    "./pages/*.{html,js}",
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./components/**/*.{html,js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Agricultural heritage with modern confidence
        primary: {
          50: "#F0F9F0",
          100: "#D4F1D4",
          200: "#A8E2A8",
          300: "#7DD37D",
          400: "#51C451",
          500: "#3A9B3A",
          600: "#2D5A27", // primary
          700: "#1F3E1F",
          800: "#122312",
          900: "#0A140A",
          DEFAULT: "#2D5A27" // custom green-800
        },
        // Secondary Colors - Technological trust without coldness
        secondary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6", // blue-500
          600: "#2563EB", // blue-600
          700: "#1D4ED8", // blue-700
          800: "#1E3A8A", // secondary
          900: "#1E40AF", // blue-900
          DEFAULT: "#1E3A8A" // blue-800
        },
        // Accent Colors - Innovation and sustainability intersection
        accent: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6", // teal-500
          600: "#0D9488", // teal-600
          700: "#0F766E", // accent
          800: "#115E59", // teal-800
          900: "#134E4A", // teal-900
          DEFAULT: "#0F766E" // teal-700
        },
        // Background Colors
        background: "#FAFAFA", // gray-50
        surface: "#F8F9FA", // custom gray-25
        // Text Colors
        text: {
          primary: "#1F2937", // gray-800
          secondary: "#6B7280" // gray-500
        },
        // Status Colors
        success: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981", // emerald-500
          600: "#059669", // success
          DEFAULT: "#059669" // emerald-600
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B", // amber-500
          600: "#D97706", // warning
          DEFAULT: "#D97706" // amber-600
        },
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444", // red-500
          600: "#DC2626", // error
          DEFAULT: "#DC2626" // red-600
        },
        // Border Colors
        border: {
          DEFAULT: "#E5E7EB", // gray-200
          light: "#F3F4F6" // gray-100
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        jetbrains: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }]
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'float': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      },
      borderRadius: {
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem'
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms'
      },
      transitionTimingFunction: {
        'smooth': 'ease-in-out'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      }
    }
  },
  plugins: []
}