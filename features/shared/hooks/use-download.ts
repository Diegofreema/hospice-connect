import { useToast } from '@/components/demos/toast';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

export const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant media library permission to save PDF files.'
      );
      return false;
    }
  }
  return true;
};

const savePDFToDevice = async (uri: string, filename: string) => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (Platform.OS === 'ios') {
      // iOS: Use sharing
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save PDF',
        UTI: 'com.adobe.pdf',
      });
    } else {
      // Android: Use Storage Access Framework
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        // Read the file as base64
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Create and write to the file in the selected directory
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filename,
          'application/pdf'
        )
          .then(async (newUri) => {
            await FileSystem.writeAsStringAsync(newUri, base64Data, {
              encoding: FileSystem.EncodingType.Base64,
            });

            Alert.alert('Success', `PDF saved as ${filename}`, [
              {
                text: 'Share',
                onPress: () => Sharing.shareAsync(uri),
              },
              { text: 'OK' },
            ]);
          })
          .catch((error) => {
            console.error('Error creating file:', error);
            Alert.alert('Error', 'Failed to save PDF. Please try again.');
          });
      } else {
        // Fallback to sharing if permissions not granted
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save PDF',
        });
      }
    }
  } catch (error) {
    console.error('Error saving PDF:', error);
    Alert.alert('Error', 'Failed to save PDF. Please try again.');
  }
};
type Props = {
  htmlContent: string;
};
export const useDownloadOrPrint = ({ htmlContent }: Props) => {
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const exportViewToPdf = async () => {
    setLoading(true);
    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612,
        height: 792,
      });
      const fileName = `route-sheet-${Date.now()}.pdf`;
      await savePDFToDevice(uri, fileName);
      showToast({
        title: 'Success',
        subtitle: 'PDF saved successfully',
        autodismiss: true,
      });
    } catch (error) {
      console.log(error);
      showToast({
        title: 'Error',
        subtitle: 'Failed to save PDF',
        autodismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };
  const printToFile = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  return {
    loading,
    exportViewToPdf,
    printToFile,
  };
};
