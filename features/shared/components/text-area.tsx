import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

type Props = TextInputProps & {
  label?: string;
};

export const Textarea = ({ label, ...props }: Props) => {
  return (
    <View style={styles.container}>
      <Text>{label}</Text>
      <View style={[styles.textareaContainer]}>
        <TextInput
          style={styles.textarea}
          multiline={true}
          numberOfLines={Platform.OS === 'ios' ? 1 : 6}
          {...props}
          textAlignVertical="top"
          scrollEnabled={true}
          autoCorrect={true}
          spellCheck={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textareaContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 12,
    minHeight: 120,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  textareaContainerFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  textarea: {
    fontSize: 16,
    color: '#333',
    minHeight: 96,
    ...Platform.select({
      ios: {
        paddingTop: 8,
      },
      android: {
        paddingTop: 0,
        textAlignVertical: 'top',
      },
    }),
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
});
