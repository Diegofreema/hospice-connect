import { Avatar } from '@/components/avatar/Avatar';
import { SpinnerArc } from '@/components/loaders';
import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { IconCamera, IconUpload } from '@tabler/icons-react-native';
import { useMutation } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import {
  changeFirstLetterToCapital,
  formatPhoneNumber,
  generateErrorMessage,
  uploadProfilePicture,
} from '../utils';

import { useToast } from '@/components/demos/toast';
import { LongInfo } from '@/features/shared/components/long-info';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { FlexText } from './flex-text';

type Props = {
  imageUrl?: string;
  name: string;
  email: string;
  address: string;
  licenseNumber?: string;
  faxNumber?: string;
  phoneNumber: string;
  zipCode?: string;
  discipline?: string;
  nurse?: boolean;
  rate?: number;
  nurseId?: Id<'nurses'>;
  hospiceId?: Id<'hospices'>;
  imageId?: Id<'_storage'>;
  state?: string;
};

export const ProfileCard = ({
  address,
  email,
  name,
  discipline,
  faxNumber,
  licenseNumber,
  phoneNumber,
  zipCode,
  imageUrl,
  rate,
  nurseId,
  imageId,
  hospiceId,
  state,
}: Props) => {
  const formattedRate = rate ? `$${rate}/hr` : '';

  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<ImagePicker.ImagePickerAsset>();

  const { theme } = useUnistyles();
  const [uploading, setUploading] = useState(false);
  const generateUploadUrl = useMutation(api.helper.generateUploadUrl);
  const updateImage = useMutation(api.nurses.updateNurseProfilePicture);
  const updateHospiceImage = useMutation(api.hospices.updateHospiceImage);
  const { showToast } = useToast();

  const pickImage = async () => {
    try {
      // Modern photo picker doesn't require explicit permission requests
      // Users grant access on a per-image basis through the system picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImage(uri);
        setFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const uploadImage = async () => {
    if (!image) return;
    setUploading(true);
    try {
      const response = await uploadProfilePicture(generateUploadUrl, file);

      if (response) {
        const { storageId } = response;
        if (nurseId) {
          await updateImage({
            nurseId,
            imageId: storageId,
            oldImageId: imageId,
          });
        } else if (hospiceId) {
          await updateHospiceImage({
            hospiceId,
            imageId: storageId,
            oldImageId: imageId,
          });
        }
        showToast({
          title: 'Success',
          subtitle: 'Image updated',
          autodismiss: true,
        });
        // Clear both state and storage after successful upload
        setImage(null);
      }
    } catch (error) {
      console.log({ error });
      showToast({
        title: 'Error',
        subtitle: generateErrorMessage(error, 'Failed to update image'),
      });
    } finally {
      setUploading(false);
    }
  };

  console.log({ image });

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.top}>
        <View style={styles.container}>
          <Avatar
            image={{ uri: image || imageUrl || '', name: name }}
            size={120}
            onPress={pickImage}
          />
          {!image && (
            <View style={styles.camera} pointerEvents="none">
              <IconCamera size={25} color={theme.colors.black} />
            </View>
          )}
          {image && (
            <TouchableOpacity
              onPress={uploadImage}
              style={[styles.camera, { opacity: uploading ? 0.5 : 1 }]}
              hitSlop={20}
              disabled={uploading}
            >
              {uploading ? (
                <SpinnerArc />
              ) : (
                <IconUpload size={25} color={theme.colors.black} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={{ backgroundColor: theme.colors.cardGrey, padding: 10 }}>
        <View style={styles.card}>
          <View style={styles.content}>
            <FlexText leftText="Name" rightText={name} />
            <FlexText leftText="Email" rightText={email} />
            <FlexText
              leftText="Mobile number"
              rightText={formatPhoneNumber(phoneNumber)}
            />
            {licenseNumber && (
              <FlexText leftText="License number" rightText={licenseNumber} />
            )}
            {state && (
              <FlexText
                leftText="State"
                rightText={changeFirstLetterToCapital(state)}
              />
            )}

            {discipline && (
              <FlexText leftText="Discipline" rightText={discipline} />
            )}

            {formattedRate && (
              <FlexText leftText="Rate/hr" rightText={formattedRate} />
            )}
            {zipCode && <FlexText leftText="Zip code" rightText={zipCode} />}
            {faxNumber && (
              <FlexText leftText="Fax number" rightText={faxNumber} />
            )}
            {address && <LongInfo title={'Address'} description={address} />}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  camera: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    width: 50,
    height: 50,
    zIndex: 1,
  },
  container: {
    width: 120,
    height: 120,
    borderRadius: 80,
  },
  top: {
    width: 120,
    height: 120,
    borderRadius: 80,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: theme.paddings.xl,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.margins.md,
    gap: 15,
  },
  content: {
    gap: 10,
  },
}));
