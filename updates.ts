import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import * as Updates from 'expo-updates';

const BACKGROUND_TASK_NAME = 'task-run-expo-update';

export const setupBackgroundUpdates = async () => {
  TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
    return Promise.resolve();
  });

  await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: 60 * 24,
  });
};
