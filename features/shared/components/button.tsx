import { Theme } from '@/theme';
import {
  backgroundColor,
  BackgroundColorProps,
  border,
  BorderProps,
  composeRestyleFunctions,
  spacing,
  SpacingProps,
  useRestyle,
} from '@shopify/restyle';
import { ReactNode } from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';
import Text from './text';
import View from './view';

type RestyleProps = SpacingProps<Theme> &
  BorderProps<Theme> &
  BackgroundColorProps<Theme>;

const restyleFunctions = composeRestyleFunctions<Theme, RestyleProps>([
  spacing,
  // @ts-ignore
  border,
  backgroundColor,
]);

type Props = RestyleProps & {
  onPress: () => void;
  label: string;
  rightIcon?: ReactNode;
  color?:
    | 'mainBackground'
    | 'cardBackground'
    | 'buttonBackground'
    | 'backgroundRed'
    | 'black'
    | 'borderColor'
    | 'blue'
    | 'white'
    | 'textGrey'
    | 'transparent';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Button = ({
  onPress,
  label,
  rightIcon,
  color = 'white',
  disabled = false,
  loading,
  loadingText,
  icon,
  style,
  ...rest
}: Props) => {
  const props = useRestyle(restyleFunctions, rest);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[{ opacity: disabled ? 0.5 : 1, flex: 1 }, style]}
    >
      <View
        alignItems={'center'}
        justifyContent={'center'}
        p={'m'}
        bg={'blue'}
        borderRadius={5}
        flexDirection={'row'}
        g={'s'}
        {...props}
      >
        {rightIcon}
        <Text variant="body" color={color}>
          {loading ? loadingText : label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
