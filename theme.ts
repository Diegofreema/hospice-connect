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
};

const theme = createTheme({
  colors: {
    mainBackground: palette.white,
    cardBackground: palette.greyLight,
    buttonBackground: palette.blue,
    backgroundRed: palette.redDark,
    black: palette.black,
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
});

export type Theme = typeof theme;
export default theme;
