import { IconSearch, IconX } from '@tabler/icons-react-native';
import { type Href, router } from 'expo-router';
import { TextInput, type TextInputProps } from 'react-native';

import { type Dispatch, type SetStateAction } from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { CustomPressable } from './custom-pressable';
import { Text } from './text';
import { Stack } from './v-stack';

type Props = TextInputProps & {
  path?: Href;
  isButton?: boolean;
  setValue?: Dispatch<SetStateAction<string>>;
};

export const SearchComponent = ({
  path,
  isButton,
  setValue,
  ...props
}: Props) => {
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
          padding={'xl'}
          backgroundColor={theme.colors.buttonGrey}
        >
          <IconSearch size={20} />
          <Text size="normal" color={theme.colors.grey}>
            {props.placeholder || 'Search'}
          </Text>
        </Stack>
      </CustomPressable>
    );
  }
  return (
    <Stack
      mode={'flex'}
      gap={'sm'}
      isFlexCentered
      borderRadius={'md'}
      padding={'xl'}
      backgroundColor={theme.colors.buttonGrey}
    >
      <IconSearch size={20} />
      <TextInput
        {...props}
        value={props.value}
        onChangeText={setValue}
        autoCapitalize="none"
        style={{ flex: 1 }}
      />
      {props.value && (
        <CustomPressable
          onPress={() => {
            console.log('clear');
            setValue?.('');
          }}
        >
          <IconX size={25} color={theme.colors.grey} />
        </CustomPressable>
      )}
    </Stack>
  );
};
