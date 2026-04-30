import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e6eeff',
      100: '#c0d4ff',
      200: '#99baff',
      300: '#6699ff',
      400: '#3377ff',
      500: '#004aad',
      600: '#003d91',
      700: '#003075',
      800: '#002459',
      900: '#00173d',
    },
    accent: {
      50: '#fff0f0',
      100: '#ffd6d7',
      200: '#ffacae',
      300: '#ff7b7e',
      400: '#f54a4f',
      500: '#ed1c24',
      600: '#c8151c',
      700: '#a30f15',
      800: '#7e0a0e',
      900: '#590507',
    },
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
  },
  fonts: {
    heading: "'Outfit', sans-serif",
    body: "'Outfit', sans-serif",
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'lg',
        fontWeight: '600',
      },
      variants: {
        glass: {
          bg: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.95)',
          },
        },
      },
    },
    Input: {
      variants: {
        glass: {
          field: {
            bg: 'white',
            border: '1px solid',
            borderColor: 'gray.200',
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px brand.500',
            },
          },
        },
      },
    },
    Select: {
      variants: {
        glass: {
          field: {
            bg: 'white',
            border: '1px solid',
            borderColor: 'gray.200',
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px brand.500',
            },
          },
        },
      },
    },
  },
});

export default theme;
