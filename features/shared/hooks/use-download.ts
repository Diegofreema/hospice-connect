import { useToast } from '@/components/demos/toast';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';

// Force reload: Switch to Sharing to avoid SAF/copyAsync errors on Android
const savePDFToDevice = async (
  uri: string,
  filename: string, // Kept for consistency, though sharing handles filename via UTI/title differently
  onProgress?: (progress: number) => void,
): Promise<boolean> => {
  try {
    if (onProgress) onProgress(0.5);

    // Unified logic: Use Sharing for both iOS and Android
    // This avoids the "To protect your privacy" error on Android SAF
    // and lets the user choose "Save to..." or their File Manager app
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Save ${filename}`,
      UTI: 'com.adobe.pdf',
    });

    if (onProgress) onProgress(1);
    return true;
  } catch (error) {
    console.error('Error sharing/saving PDF:', error);
    // Alert is handled by caller usually or implicit in share failure
    return false;
  }
};

type Props = {
  htmlContent: string;
};

export const useDownloadOrPrint = ({ htmlContent }: Props) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showToast } = useToast();
  const [uri, setUri] = useState<string | null>(null);

  const exportViewToPdf = async () => {
    setLoading(true);
    setProgress(0);
    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612,
        height: 792,
      });
      setUri(uri);
      setProgress(0.1);

      const fileName = `route-sheet-${Date.now()}.pdf`;

      // Use the unified sharing approach
      const saved = await savePDFToDevice(uri, fileName, setProgress);

      if (saved) {
        showToast({
          title: 'Success',
          subtitle: 'PDF ready to save/share',
          autodismiss: true,
        });
      }
    } catch (error) {
      console.log(error);
      showToast({
        title: 'Error',
        subtitle: 'Failed to generate PDF',
        autodismiss: true,
      });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
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
    progress,
    uri,
  };
};
