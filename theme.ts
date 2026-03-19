// import { createTheme } from '@shopify/restyle';
// import { getFontSize } from './features/shared/utils';

// export const palette = {
//   purpleLight: '#8C6FF7',
//   purpleDark: '#9747FF',

//   greenDark: '#00A25C',
//   greenLight: 'rgba(240, 255, 249, 0.7)',

//   black: '#0B0B0B',
//   white: '#ffffff',

//   blue: '#4C55FF',
//   lightBlue: 'rgba(76, 85, 255, 0.08)',
//   orange: '#FFA500',
//   redDark: '#F63A3A',
//   redLight: 'rgba(246, 58, 58, 0.13)',

//   yellowLight: 'rgba(255, 191, 0, 0.1)',
//   yellowDark: '#FFBF00',

//   greyLight: '#F8F8F8',
//   grey: '#ccc',
//   iconGrey: '#666666',
//   textGrey: '#8D8D8D',
//   buttonGrey: '#F2F2F2',
//   cardGrey: '#efefef',
// };

// const theme = createTheme({
//   colors: {
//     mainBackground: palette.white,
//     cardBackground: palette.greyLight,
//     buttonBackground: palette.blue,
//     backgroundRed: palette.redDark,
//     black: palette.black,
//     borderColor: palette.grey,
//     blue: palette.blue,
//     white: palette.white,
//     textGrey: palette.textGrey,
//     transparent: 'transparent',
//     error: palette.redDark,
//     lightBlue: palette.lightBlue,
//     buttonGrey: palette.buttonGrey,
//   },
//   spacing: {
//     s: 8,
//     m: 16,
//     l: 24,
//     xl: 40,
//   },

//   breakpoints: {
//     phone: 0,
//     longPhone: {
//       width: 0,
//       height: 812,
//     },
//     tablet: 768,
//     largeTablet: 1024,
//   },
//   textVariants: {
//     header: {
//       fontFamily: 'PublicSansBold',
//       fontWeight: 'bold',
//       fontSize: getFontSize(34),
//       lineHeight: 42.5,
//       color: 'black',
//     },
//     subheader: {
//       fontFamily: 'PublicSansSemibold',
//       fontWeight: '600',
//       fontSize: getFontSize(28),
//       lineHeight: 36,
//       color: 'black',
//     },
//     body: {
//       fontFamily: 'PublicSansRegular',
//       fontSize: getFontSize(16),
//       lineHeight: 24,
//       color: 'black',
//     },
//     small: {
//       fontFamily: 'PublicSansLight',
//       fontSize: getFontSize(13),
//       lineHeight: 24,
//       color: 'black',
//     },

//     defaults: {
//       // We can define a default text variant here.
//     },
//   },
//   cardVariants: {
//     defaults: {
//       // We can define defaults for the variant here.
//       // This will be applied after the defaults passed to createVariant and before the variant defined below.
//     },
//     regular: {
//       // We can refer to other values in the theme here, and use responsive props
//       padding: {
//         phone: 'm',
//         tablet: 'l',
//       },
//     },
//     elevated: {
//       padding: {
//         phone: 's',
//         tablet: 'm',
//       },
//       shadowColor: 'black',
//       shadowOpacity: 0.2,
//       shadowOffset: { width: 0, height: 5 },
//       shadowRadius: 15,
//       elevation: 5,
//     },
//     transparent: {
//       padding: {
//         phone: 'm',
//         tablet: 'l',
//       },
//       borderRadius: 8,
//       borderWidth: 1,
//       borderColor: 'borderColor',
//     },
//   },
//   buttonVariant: {},
// });

// export type Theme = typeof theme;
// export default theme;

const sharedColors = {
  purpleLight: '#9747FF1A',
  purpleDark: '#9747FF',
  greenDark: '#00A25C',
  greenLight: 'rgba(240, 255, 249, 0.7)',
  black: '#0B0B0B',
  white: '#ffffff',
  blue: '#4C55FF',
  lightBlue: 'rgba(76, 85, 255, 0.08)',
  orange: '#FFA500',
  redDark: '#F63A3A',
  redLight: 'rgba(246, 58, 58, 0.13)',
  yellowLight: 'rgba(255, 191, 0, 0.1)',
  yellowDark: '#FFBF00',
  greyLight: '#F8F8F8',
  grey: '#ccc',
  iconGrey: '#666666',
  textGrey: '#8D8D8D',
  buttonGrey: '#F2F2F2',
  cardGrey: '#efefef',
} as const;

export const lightTheme = {
  colors: {
    ...sharedColors,
    typography: '#000000',
    background: '#ffffff',
    button: '#00A25C',
    buttonText: '#ffffff',
    linkText: '#00A25C',
    linear1: 'rgba(255, 255, 255, 0.7)',
    linear2: 'rgba(255, 255, 255, 0.9)',
    linear3: '#fff',
    errorText: '#ff0000',
    iconColor: '#666666',
    otpColor: '#f8f8f8',
    orange: '#FF9F2D',
  },
  margins: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    xxl: 16,
  },
  paddings: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    xxl: 16,
  },
  gap: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    xxl: 16,
  },
  borderRadius: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    xxl: 16,
  },
  fontFamily: {
    light: 'PublicSansLight',
    regular: 'PublicSansRegular',
    medium: 'PublicSansMedium',
    semibold: 'PublicSansSemiBold',
    bold: 'PublicSansBold',
  },
} as const;

// export const darkTheme = {
//   colors: {
//     ...sharedColors,
//     typography: '#ffffff',
//     background: '#000000',
//     button: '#3e3535ff',
//     buttonText: '#ffffff',
//     linkText: '#FFFFFF',
//     linear1: 'rgba(0, 0, 0, 0.7)',
//     linear2: 'rgba(0, 0, 0, 0.9)',
//     linear3: '#000000',
//     errorText: '#ffffff',
//     iconColor: '#ffffff',
//     otpColor: '#f8f8f8',
//     orange: '#FF9F2D',
//   },
//   margins: {
//     sm: 2,
//     md: 4,
//     lg: 8,
//     xl: 12,
//     xxl: 16,
//   },
//   paddings: {
//     sm: 2,
//     md: 4,
//     lg: 8,
//     xl: 12,
//     xxl: 16,
//   },
//   gap: {
//     sm: 2,
//     md: 4,
//     lg: 8,
//     xl: 12,
//     xxl: 16,
//   },
//   borderRadius: {
//     sm: 2,
//     md: 4,
//     lg: 8,
//     xl: 12,
//     xxl: 16,
//   },

//   fontFamily: {
//     light: 'PublicSansLight',
//     regular: 'PublicSansRegular',
//     medium: 'PublicSansMedium',
//     semibold: 'PublicSansSemiBold',
//     bold: 'PublicSansBold',
//   },
// } as const;
