import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import {
  cacheDirectory,
  deleteAsync,
  downloadAsync,
  EncodingType,
  readAsStringAsync,
  StorageAccessFramework,
} from 'expo-file-system/legacy';

const ANDROID_DOWNLOAD_DIRECTORY_URI_KEY = 'chat-attachment-download-directory-uri';

type SaveChatAssetToDeviceArgs = {
  fileName?: string | null;
  mimeType?: string | null;
  url: string;
};

const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  'application/msword': 'doc',
  'application/pdf': 'pdf',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/zip': 'zip',
  'audio/aac': 'aac',
  'audio/m4a': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'text/plain': 'txt',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};

const sanitizeFileName = (fileName: string) => {
  return fileName
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
};

const getExtensionFromUrl = (url: string) => {
  try {
    const pathname = new URL(url).pathname;
    const lastSegment = pathname.split('/').pop();

    if (!lastSegment || !lastSegment.includes('.')) {
      return null;
    }

    return lastSegment.split('.').pop()?.toLowerCase() ?? null;
  } catch {
    return null;
  }
};

const ensureFileName = ({
  fileName,
  mimeType,
  url,
}: SaveChatAssetToDeviceArgs) => {
  const cleanedName = sanitizeFileName(fileName || 'chat-attachment');

  if (cleanedName.includes('.')) {
    return cleanedName;
  }

  const extension =
    (mimeType ? MIME_TYPE_TO_EXTENSION[mimeType] : undefined) ||
    getExtensionFromUrl(url) ||
    'bin';

  return `${cleanedName}.${extension}`;
};

const splitFileName = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex <= 0) {
    return { baseName: fileName, extension: null };
  }

  return {
    baseName: fileName.slice(0, lastDotIndex),
    extension: fileName.slice(lastDotIndex + 1),
  };
};

const getTemporaryFileUri = (fileName: string) => {
  if (!cacheDirectory) {
    throw new Error('Temporary storage is unavailable on this device.');
  }

  return `${cacheDirectory}${Date.now()}-${encodeURIComponent(fileName)}`;
};

const requestAndroidDownloadDirectory = async () => {
  const savedDirectoryUri = await AsyncStorage.getItem(
    ANDROID_DOWNLOAD_DIRECTORY_URI_KEY,
  );

  if (savedDirectoryUri) {
    return savedDirectoryUri;
  }

  const permission =
    await StorageAccessFramework.requestDirectoryPermissionsAsync(
      StorageAccessFramework.getUriForDirectoryInRoot('Download'),
    );

  if (!permission.granted) {
    throw new Error('Download cancelled before a save folder was selected.');
  }

  await AsyncStorage.setItem(
    ANDROID_DOWNLOAD_DIRECTORY_URI_KEY,
    permission.directoryUri,
  );

  return permission.directoryUri;
};

const saveAndroidFileToSelectedDirectory = async ({
  localUri,
  fileName,
  mimeType,
}: {
  fileName: string;
  localUri: string;
  mimeType: string;
}) => {
  const { baseName } = splitFileName(fileName);
  const encodedFile = await readAsStringAsync(localUri, {
    encoding: EncodingType.Base64,
  });

  const writeToDirectory = async (directoryUri: string) => {
    const targetFileUri = await StorageAccessFramework.createFileAsync(
      directoryUri,
      baseName,
      mimeType,
    );

    await StorageAccessFramework.writeAsStringAsync(targetFileUri, encodedFile, {
      encoding: EncodingType.Base64,
    });
  };

  const directoryUri = await requestAndroidDownloadDirectory();

  try {
    await writeToDirectory(directoryUri);
  } catch {
    await AsyncStorage.removeItem(ANDROID_DOWNLOAD_DIRECTORY_URI_KEY);

    const refreshedPermission =
      await StorageAccessFramework.requestDirectoryPermissionsAsync(
        StorageAccessFramework.getUriForDirectoryInRoot('Download'),
      );

    if (!refreshedPermission.granted) {
      throw new Error('Download cancelled before a save folder was selected.');
    }

    await AsyncStorage.setItem(
      ANDROID_DOWNLOAD_DIRECTORY_URI_KEY,
      refreshedPermission.directoryUri,
    );

    await writeToDirectory(refreshedPermission.directoryUri);
  }
};

export const saveChatAssetToDevice = async ({
  fileName,
  mimeType,
  url,
}: SaveChatAssetToDeviceArgs) => {
  const resolvedFileName = ensureFileName({ fileName, mimeType, url });
  const resolvedMimeType = mimeType || 'application/octet-stream';
  const shouldDownloadRemotely = /^https?:\/\//i.test(url);
  const temporaryFileUri = shouldDownloadRemotely
    ? getTemporaryFileUri(resolvedFileName)
    : null;

  try {
    let localUri = url;

    if (shouldDownloadRemotely && temporaryFileUri) {
      localUri = (await downloadAsync(url, temporaryFileUri)).uri;
    }

    if (process.env.EXPO_OS === 'android') {
      await saveAndroidFileToSelectedDirectory({
        fileName: resolvedFileName,
        localUri,
        mimeType: resolvedMimeType,
      });

      return {
        action: 'saved',
        fileName: resolvedFileName,
      } as const;
    }

    await Sharing.shareAsync(localUri, {
      dialogTitle: `Save ${resolvedFileName}`,
      mimeType: resolvedMimeType,
      UTI: resolvedMimeType,
    });

    return {
      action: 'shared',
      fileName: resolvedFileName,
    } as const;
  } finally {
    if (temporaryFileUri) {
      await deleteAsync(temporaryFileUri, { idempotent: true });
    }
  }
};
