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
};

export const Button = ({ onPress, label, ...rest }: Props) => {
  const props = useRestyle(restyleFunctions, rest);

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        alignItems={'center'}
        justifyContent={'center'}
        p={'m'}
        bg={'blue'}
        borderRadius={5}
        {...props}
      >
        <Text variant="body" color={'white'}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
