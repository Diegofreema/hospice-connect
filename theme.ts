import { createTheme } from '@shopify/restyle';
import { getFontSize } from './features/shared/utils';

export const palette = {
  purpleLight: '#8C6FF7',
  purpleDark: '#9747FF',

  greenDark: '#00A25C',
  greenLight: 'rgba(240, 255, 249, 0.7)',

  black: '#0B0B0B',
  white: '#ffffff',

  blue: '#4C55FF',

  redDark: '#F63A3A',
  redLight: 'rgba(246, 58, 58, 0.13)',

  yellowLight: 'rgba(255, 191, 0, 0.1)',
  yellowDark: '#FFBF00',

  greyLight: '#F8F8F8',
  grey: '#ccc',
  iconGrey: '#666666',
  textGrey: '#8D8D8D',
};

const theme = createTheme({
  colors: {
    mainBackground: palette.white,
    cardBackground: palette.greyLight,
    buttonBackground: palette.blue,
    backgroundRed: palette.redDark,
    black: palette.black,
    borderColor: palette.grey,
    blue: palette.blue,
    white: palette.white,
    textGrey: palette.textGrey,
    transparent: 'transparent',
    error: palette.redDark,
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
  },

  breakpoints: {
    phone: 0,
    longPhone: {
      width: 0,
      height: 812,
    },
    tablet: 768,
    largeTablet: 1024,
  },
  textVariants: {
    header: {
      fontFamily: 'PublicSansBold',
      fontWeight: 'bold',
      fontSize: getFontSize(34),
      lineHeight: 42.5,
      color: 'black',
    },
    subheader: {
      fontFamily: 'PublicSansSemibold',
      fontWeight: '600',
      fontSize: getFontSize(28),
      lineHeight: 36,
      color: 'black',
    },
    body: {
      fontFamily: 'PublicSansRegular',
      fontSize: getFontSize(16),
      lineHeight: 24,
      color: 'black',
    },
    small: {
      fontFamily: 'PublicSansLight',
      fontSize: getFontSize(13),
      lineHeight: 24,
      color: 'black',
    },

    defaults: {
      // We can define a default text variant here.
    },
  },
  cardVariants: {
    defaults: {
      // We can define defaults for the variant here.
      // This will be applied after the defaults passed to createVariant and before the variant defined below.
    },
    regular: {
      // We can refer to other values in the theme here, and use responsive props
      padding: {
        phone: 'm',
        tablet: 'l',
      },
    },
    elevated: {
      padding: {
        phone: 's',
        tablet: 'm',
      },
      shadowColor: 'black',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 5 },
      shadowRadius: 15,
      elevation: 5,
    },
    transparent: {
      padding: {
        phone: 'm',
        tablet: 'l',
      },
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'borderColor',
    },
  },
  buttonVariant: {},
});

export type Theme = typeof theme;
export default theme;
