import { palette } from '@/theme';
import { IconSearch } from '@tabler/icons-react-native';
import { Href, router } from 'expo-router';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { HStack } from './HStack';
import { CustomPressable } from './custom-pressable';

type Props = TextInputProps & {
  path?: Href;
  isButton?: boolean;
};

export const SearchComponent = ({ path, isButton, ...props }: Props) => {
  const onPress = () => {
    if (path) {
      router.push(path);
    }
  };
  if (isButton) {
    return (
      <CustomPressable onPress={onPress} style={{ flex: 1 }}>
        <HStack
          justifyContent={'flex-start'}
          gap={'s'}
          borderRadius={8}
          padding={'m'}
          style={styles.container}
        >
          <IconSearch size={20} />
          <TextInput {...props} editable={false} />
        </HStack>
      </CustomPressable>
    );
  }
  return (
    <HStack
      justifyContent={'flex-start'}
      gap={'s'}
      borderRadius={8}
      padding={'m'}
      style={styles.container}
    >
      <IconSearch size={20} />
      <TextInput {...props} />
    </HStack>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.buttonGrey,
  },
});
