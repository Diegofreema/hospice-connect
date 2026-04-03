import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { AppState } from 'react-native';

// Module-level flag survives Activity recreation (JS bundle stays alive).
// Prevents re-checking after Android destroys and recreates the Activity
// (e.g. when returning from image picker or file picker).
let hasChecked = false;

export const useUpdate = () => {
  useEffect(() => {
    if (__DEV__) return;
    if (hasChecked) return;
    hasChecked = true;

    async function onFetchUpdateAsync() {
      try {
        if (AppState.currentState !== 'active') return;

        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          // Do not call Updates.reloadAsync() here.
          // The fetched update will auto-apply on next cold start.
          // Calling reloadAsync() caused the app to reload when Android
          // recreated the Activity after returning from native pickers.
        }
      } catch (error) {
        console.log(error);
      }
    }
    void onFetchUpdateAsync();
  }, []);
};
