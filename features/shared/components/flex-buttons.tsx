import { StyleSheet } from 'react-native-unistyles';
import { CustomPressable } from './custom-pressable';
import { Text } from './text';
import { View } from './view';

type Props = {
  disabled?: boolean;
  onPress: () => void;
  onCancel: () => void;
  buttonText?: string;
  buttonText2?: string;
  disabled2?: boolean;
  hideCancelButton?: boolean;
};

export const FlexButtons = ({
  onCancel,
  onPress,
  disabled,
  buttonText2 = ' Yes, Cancel',
  buttonText = "No, Don't Cancel",
  disabled2,
  hideCancelButton,
}: Props) => {
  return (
    <View flexDirection="row" gap="lg" style={styles.footer} mt="lg">
      {!hideCancelButton && (
        <CustomPressable
          onPress={onCancel}
          style={[
            styles.button,
            styles.viewSchedule,
            { opacity: disabled ? 0.5 : 1 },
          ]}
          disabled={disabled2}
        >
          <Text size={'normal'} color={'blue'}>
            {buttonText}
          </Text>
        </CustomPressable>
      )}

      <CustomPressable
        onPress={onPress}
        style={[styles.button, styles.assign, { opacity: disabled ? 0.5 : 1 }]}
        disabled={disabled}
      >
        <Text size={'normal'} color={'white'} style={{ textAlign: 'center' }}>
          {buttonText2}
        </Text>
      </CustomPressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  viewSchedule: {
    borderWidth: 1,
    borderColor: theme.colors.cardGrey,
  },
  assign: {
    backgroundColor: theme.colors.blue,
  },
  button: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
}));
