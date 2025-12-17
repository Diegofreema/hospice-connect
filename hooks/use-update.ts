import * as Updates from 'expo-updates';
import { useEffect } from 'react';

export const useUpdate = () => {
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    const fetchUpdate = async () => {
      try {
        console.log('Fetching latest Expo update...');
        await Updates.fetchUpdateAsync();
        // After successful fetch, the update becomes "pending"
        // Expo will set isUpdatePending to true automatically
      } catch (error) {
        console.error('Error fetching latest Expo update:', error);
        // Optional: alert user or send to error tracking
        // Alert.alert('Update Error', 'Failed to check for updates.');
      }
    };
    if (isUpdateAvailable) fetchUpdate();
  }, [isUpdateAvailable, isUpdatePending]);

  // Separate effect for reloading when update is ready
  useEffect(() => {
    const reloadApp = async () => {
      try {
        await Updates.reloadAsync({
          reloadScreenOptions: {
            fade: true,
            backgroundColor: '#fff',
            image: require('@/assets/images/hospice.png'),
          },
        });
      } catch (error) {
        console.error('Error reloading app with new update:', error);
      }
    };

    if (isUpdatePending) {
      reloadApp();
    }
  }, [isUpdatePending]);
};
