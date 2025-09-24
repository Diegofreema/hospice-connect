import { ResponsiveValue } from '@shopify/restyle';
import { PropsWithChildren } from 'react';
import { FlexAlignType, StyleProp, ViewStyle } from 'react-native';
import View from './view';

type Props = {
  flexDirection?: ResponsiveValue<
    'row' | 'column' | 'row-reverse' | 'column-reverse' | undefined,
    {
      phone: number;
      longPhone: {
        width: number;
        height: number;
      };
      tablet: number;
      largeTablet: number;
    }
  >;
  alignItems?: ResponsiveValue<
    FlexAlignType | undefined,
    {
      phone: number;
      longPhone: {
        width: number;
        height: number;
      };
      tablet: number;
      largeTablet: number;
    }
  >;
  justifyContent?: ResponsiveValue<
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | undefined,
    {
      phone: number;
      longPhone: {
        width: number;
        height: number;
      };
      tablet: number;
      largeTablet: number;
    }
  >;
  gap?:
    | ResponsiveValue<
        's' | 'm' | 'l' | 'xl',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  margin?:
    | ResponsiveValue<
        's' | 'm' | 'l' | 'xl',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  marginBottom?:
    | ResponsiveValue<
        's' | 'm' | 'l' | 'xl',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  marginTop?:
    | ResponsiveValue<
        's' | 'm' | 'l' | 'xl',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  marginLeft?:
    | ResponsiveValue<
        's' | 'm' | 'l' | 'xl',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  marginRight?:
    | ResponsiveValue<
        's' | 'm' | 'l' | 'xl',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  padding?:
    | ResponsiveValue<
        's' | 'm' | 'l' | 'xl',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  paddingBottom?:
    | ResponsiveValue<
        's' | 'm' | 'l' | 'xl',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  paddingTop?:
    | ResponsiveValue<
        's' | 'm' | 'l' | 'xl',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  paddingLeft?:
    | ResponsiveValue<
        's' | 'm' | 'l' | 'xl',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  paddingRight?:
    | ResponsiveValue<
        's' | 'm' | 'l' | 'xl',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  flex?: ResponsiveValue<
    number | undefined,
    {
      phone: number;
      longPhone: {
        width: number;
        height: number;
      };
      tablet: number;
      largeTablet: number;
    }
  >;
  borderRadius?:
    | ResponsiveValue<
        number,
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  borderWidth?: ResponsiveValue<
    number | undefined,
    {
      phone: number;
      longPhone: {
        width: number;
        height: number;
      };
      tablet: number;
      largeTablet: number;
    }
  >;
  borderColor?:
    | ResponsiveValue<
        | 'mainBackground'
        | 'cardBackground'
        | 'buttonBackground'
        | 'backgroundRed'
        | 'black'
        | 'borderColor'
        | 'blue'
        | 'white'
        | 'textGrey'
        | 'transparent'
        | 'error'
        | 'lightBlue'
        | 'buttonGrey',
        {
          phone: number;
          longPhone: {
            width: number;
            height: number;
          };
          tablet: number;
          largeTablet: number;
        }
      >
    | undefined;
  style?: StyleProp<ViewStyle>;
};

export const HStack = ({
  children,
  flexDirection = 'row',
  alignItems = 'center',
  justifyContent = 'space-between',
  gap = 'm',
  ...props
}: PropsWithChildren<Props>) => {
  return (
    <View
      flexDirection={flexDirection}
      alignItems={alignItems}
      justifyContent={justifyContent}
      gap={gap}
      {...props}
    >
      {children}
    </View>
  );
};
