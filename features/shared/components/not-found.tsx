import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Text } from './text';
import { Wrapper } from './wrapper';

type Props = {
  description: string;
};

export const NotFound = ({ description }: Props) => {
  return (
    <Wrapper>
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/no-internet.png')}
          style={styles.image}
          contentFit="contain"
        />
        <Text isBold size="medium">
          {description}
        </Text>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -200,
  },
  image: {
    width: 200,
    height: 200,
  },
}));
