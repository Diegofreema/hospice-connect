import React, { forwardRef } from 'react';
import { View } from 'react-native';
import Signature, { SignatureViewRef } from 'react-native-signature-canvas';
import { StyleSheet } from 'react-native-unistyles';
import { Button } from './button';
type Props = {
  onOK: (signature: string) => void;
  onClear: () => void;
};
const style = `.m-signature-pad--footer {display: none; margin: 0px;}`;

const SignatureComponent = forwardRef<SignatureViewRef, Props>(
  ({ onOK, onClear }, ref) => {
    const handleOK = (signature: string) => {
      onOK(signature);
    };

    const handleClear = () => {
      // @ts-ignore
      ref?.current.clearSignature();
      onClear();
    };

    const handleConfirm = () => {
      console.log('end');
      // @ts-ignore
      ref?.current.readSignature();
    };
    // @ts-ignore

    return (
      <View style={styles.container}>
        <Signature ref={ref} onOK={handleOK} webStyle={style} />
        <View style={styles.row}>
          <Button title="Clear" onPress={handleClear} style={{ flex: 1 }} />
          <Button title="Confirm" onPress={handleConfirm} style={{ flex: 1 }} />
        </View>
      </View>
    );
  }
);

SignatureComponent.displayName = 'SignatureComponent';

export default SignatureComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    padding: 10,
    gap: 20,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
});
