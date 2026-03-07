import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const PENDING_ROUTE_KEY = 'pending_picker_route';

/**
 * Saves the current route before opening the image picker.
 * Call this right before launching the picker so we can
 * navigate back if Android destroys the Activity.
 */
export async function savePendingRoute(pathname: string) {
  if (Platform.OS !== 'android') return;
  try {
    await SecureStore.setItemAsync(PENDING_ROUTE_KEY, pathname);
  } catch (error) {
    console.error('Error saving pending route:', error);
  }
}

/**
 * Clears the saved pending route.
 */
export async function clearPendingRoute() {
  try {
    await SecureStore.deleteItemAsync(PENDING_ROUTE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Hook to restore navigation after Android kills the Activity while
 * the image picker / gallery / file system is open.
 *
 * @param isReady - Pass `true` once auth has resolved and navigation is mounted.
 */
export function usePendingImageRedirect(isReady: boolean) {
  const hasChecked = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!isReady) return;
    if (hasChecked.current) return; // Only attempt once per app lifecycle
    hasChecked.current = true;

    const restoreRoute = async () => {
      try {
        const pendingRoute = await SecureStore.getItemAsync(PENDING_ROUTE_KEY);
        if (!pendingRoute) return;

        // Clear immediately so we don't redirect again on next restart
        await clearPendingRoute();

        // Try to recover the picked image (if any)
        try {
          const result = await ImagePicker.getPendingResultAsync();
          if (
            result &&
            'canceled' in result &&
            !result.canceled &&
            result.assets?.[0]?.uri
          ) {
            console.log('Recovered pending image:', result.assets[0].uri);
          }
        } catch {
          // getPendingResultAsync can throw if there's nothing pending
        }

        // Navigate back to where the user was.
        // Use setTimeout to ensure the navigation stack is fully mounted.
        setTimeout(() => {
          try {
            router.replace(pendingRoute as any);
          } catch (e) {
            console.error('Failed to restore route:', e);
          }
        }, 500);
      } catch (error) {
        console.error('Error restoring route after Activity restart:', error);
        await clearPendingRoute();
      }
    };

    restoreRoute();
  }, [isReady]);
}
