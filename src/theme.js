import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#f0f0fd',
      100: '#dcdbfa',
      200: '#bab7f5',
      300: '#928ee7',
      400: '#6d67db',
      500: '#2D2B75', // ZomoCook Primary Indigo Blue
      600: '#252362',
      700: '#1d1b4e',
      800: '#14133a',
      900: '#0c0b26',
    },
    secondary: {
      50: '#f0f0fe',
      100: '#d9d8fd',
      200: '#b8b5fc',
      300: '#8e8afa',
      400: '#6a64f7',
      500: '#4C49ED', // ZomoCook Secondary Blue
      600: '#3c39c8',
      700: '#2f2ca3',
      800: '#22207e',
      900: '#15145a',
    },
    accentRed: {
      50: '#ffebe6',
      100: '#ffccc2',
      200: '#ff9985',
      300: '#ff6647',
      400: '#ff331f',
      500: '#ED1C24', // ZomoCook Primary Red Accent
      600: '#c7151c',
      700: '#a10f15',
      800: '#7b0a0e',
      900: '#550408',
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
