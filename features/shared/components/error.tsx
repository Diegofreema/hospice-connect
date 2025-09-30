import { Text, View } from 'react-native';
import { Button } from './button';

type Props = {
  refetch: any;
  text: string;
};

export const ErrorComponent = ({ refetch, text }: Props) => {
  const handleRefetch = () => {
    refetch();
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: 'black',
          fontFamily: 'PublicSansBold',
          fontSize: 20,
          textAlign: 'center',
        }}
      >
        {text || 'Something went wrong, please try again'}
      </Text>
      <Button title="Retry" onPress={handleRefetch} />
    </View>
  );
};
