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
import { TouchableOpacity } from 'react-native';
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
};

export const Button = ({
  onPress,
  label,
  rightIcon,
  color = 'white',
  ...rest
}: Props) => {
  const props = useRestyle(restyleFunctions, rest);

  return (
    <TouchableOpacity onPress={onPress}>
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
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
