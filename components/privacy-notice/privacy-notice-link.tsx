import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { IPrivacyNoticeLinkProps } from './privacy-notice-link.types';

const DEFAULT_TINT = '#007AFF';
const DEFAULT_SIZE = 14;

export const PrivacyNoticeLink: React.FC<IPrivacyNoticeLinkProps> &
  React.FunctionComponent<IPrivacyNoticeLinkProps> = ({
  children,
  ...props
}: IPrivacyNoticeLinkProps): React.ReactNode => {
  return (
    <View style={[styles.container, props.style]}>
      <TouchableOpacity onPress={props.onPress}>
        <Text
          style={[
            styles.text,
            {
              color: props.tint ?? DEFAULT_TINT,
              fontSize: props.size ?? DEFAULT_SIZE,
            },
          ]}
        >
          {children}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  text: {
    color: '#007AFF',
    fontSize: 14,
    marginBottom: -3,
    fontFamily: 'PublicSansSemiBold',
    textDecorationLine: 'underline',
  },
});
