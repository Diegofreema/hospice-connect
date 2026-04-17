import * as Notifications from 'expo-notifications';
import React, { useCallback } from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onGranted: (token: string) => void;
}

export const PushNotificationPermissionModal: React.FC<Props> = ({
  visible,
  onDismiss,
  onGranted,
}) => {
  const handleEnable = useCallback(async () => {
    // On iOS the system permission dialog can only be shown once. After that
    // we must send the user to Settings. On Android requestPermissionsAsync
    // can be called again (up to the OS limit).
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === 'granted') {
      try {
        const Constants = (await import('expo-constants')).default;
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;
        if (projectId) {
          const token = (
            await Notifications.getExpoPushTokenAsync({ projectId })
          ).data;
          onGranted(token);
          return;
        }
      } catch {
        // fall through to settings
      }
    }

    // Take user to OS settings if permission still not granted
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  }, [onGranted]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon container */}
          <View style={styles.iconWrapper}>
            <Text style={styles.iconEmoji}>🔔</Text>
          </View>

          <Text style={styles.title}>Enable Notifications</Text>

          <Text style={styles.body}>
            Push notifications are recommended to ensure you receive real-time
            shift updates and important alerts without delay.
          </Text>

          {/* Primary CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={handleEnable}
            accessibilityRole="button"
            accessibilityLabel="Grant push notification access"
          >
            <Text style={styles.primaryButtonText}>Enable Notifications</Text>
          </Pressable>

          {/* Secondary action */}
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification prompt"
          >
            <Text style={styles.secondaryButtonText}>Not Now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textGrey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: theme.colors.blue,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.white,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: theme.colors.buttonGrey,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    opacity: 0.75,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.iconGrey,
  },
}));
