import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
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
async function clearPendingRoute() {
  try {
    await SecureStore.deleteItemAsync(PENDING_ROUTE_KEY);
  } catch (error) {
    // ignore
  }
}

/**
 * Hook to check for pending image picker results on app startup.
 * If Android killed the Activity while the picker was open,
 * this navigates back to the saved route so the user can see
 * their picked image.
 *
 * Place this in your root layout or a top-level component.
 */
export function usePendingImageRedirect() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const check = async () => {
      try {
        const pendingRoute = await SecureStore.getItemAsync(PENDING_ROUTE_KEY);
        if (!pendingRoute) return;

        // Check if there's a pending image picker result
        const result = await ImagePicker.getPendingResultAsync();
        const hasPendingImage =
          result &&
          'canceled' in result &&
          !result.canceled &&
          result.assets?.[0]?.uri;

        // Clear the saved route
        await clearPendingRoute();

        if (hasPendingImage) {
          // Small delay to let the navigation stack settle
          setTimeout(() => {
            router.replace(pendingRoute as any);
          }, 500);
        }
      } catch (error) {
        console.error('Error checking pending image redirect:', error);
        await clearPendingRoute();
      }
    };

    check();
  }, []);
}
