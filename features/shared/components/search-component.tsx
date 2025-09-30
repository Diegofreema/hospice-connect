import { IconSearch } from '@tabler/icons-react-native';
import { Href, router } from 'expo-router';
import { TextInput, TextInputProps } from 'react-native';

import { useUnistyles } from 'react-native-unistyles';
import { CustomPressable } from './custom-pressable';
import { Stack } from './v-stack';

type Props = TextInputProps & {
  path?: Href;
  isButton?: boolean;
};

export const SearchComponent = ({ path, isButton, ...props }: Props) => {
  const { theme } = useUnistyles();
  const onPress = () => {
    if (path) {
      router.push(path);
    }
  };
  if (isButton) {
    return (
      <CustomPressable onPress={onPress} style={{ flex: 1 }}>
        <Stack
          mode={'flex'}
          gap={'sm'}
          isFlexCentered
          borderRadius={'md'}
          padding={'xxl'}
          backgroundColor={theme.colors.buttonGrey}
        >
          <IconSearch size={20} />
          <TextInput {...props} editable={false} />
        </Stack>
      </CustomPressable>
    );
  }
  return (
    <Stack
      mode={'flex'}
      isFlexCentered
      gap={'sm'}
      borderRadius={'md'}
      padding={'md'}
      backgroundColor={theme.colors.buttonGrey}
    >
      <IconSearch size={20} />
      <TextInput {...props} />
    </Stack>
  );
};
