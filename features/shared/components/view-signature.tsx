import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  signature: string;
};

export const ViewSignature = ({ signature }: Props) => {
  return (
    <View style={styles.signatureContainer}>
      <Image
        source={{ uri: signature }}
        style={styles.signature}
        contentFit="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  signature: {
    width: '100%',
    height: '100%',
  },
  signatureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 150,
    backgroundColor: theme.colors.cardGrey,
    borderRadius: 10,
    alignSelf: 'center',
  },
}));
