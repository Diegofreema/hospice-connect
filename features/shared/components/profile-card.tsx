import { Avatar } from '@/components/avatar/Avatar';
import { SpinnerArc } from '@/components/loaders';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

import { IconCamera, IconUpload } from '@tabler/icons-react-native';
import { useMutation } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import {
  changeFirstLetterToCapital,
  generateErrorMessage,
  uploadProfilePicture,
} from '../utils';

import { useToast } from '@/components/demos/toast';
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
  nurse = false,
  rate,
  nurseId,
  imageId,
  hospiceId,
  state,
}: Props) => {
  const formattedRate = rate ? `$${rate}/hr` : '';
  console.log({ nurseState: state });

  const [image, setImage] = useState<string | null>(null);
  const { theme } = useUnistyles();
  const [uploading, setUploading] = useState(false);
  const generateUploadUrl = useMutation(api.helper.generateUploadUrl);
  const updateImage = useMutation(api.nurses.updateNurseProfilePicture);
  const updateHospiceImage = useMutation(api.hospices.updateHospiceImage);
  const { showToast } = useToast();
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return;
    setUploading(true);
    try {
      const response = await uploadProfilePicture(generateUploadUrl, image);
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
        });
      }
      setImage(null);
    } catch (error) {
      showToast({
        title: 'Error',
        subtitle: generateErrorMessage(error, 'Failed to update image'),
      });
    } finally {
      setUploading(false);
    }
  };
  return (
    <View style={{ gap: 10, height: 400 }}>
      <View style={styles.top}>
        <View style={styles.container}>
          <Avatar
            image={{ uri: image || imageUrl || '', name: name }}
            size={120}
            onPress={pickImage}
          />
          <View style={styles.camera} pointerEvents="none">
            <IconCamera size={25} color={theme.colors.black} />
          </View>
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
                <IconUpload size={25} color={theme.colors.white} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View
        style={{ backgroundColor: theme.colors.cardGrey, padding: 10, flex: 1 }}
      >
        <View style={styles.card}>
          <View style={styles.content}>
            <FlexText leftText="Name" rightText={name} />
            <FlexText leftText="Email" rightText={email} />
            <FlexText leftText="Mobile number" rightText={phoneNumber} />
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
            {address && <FlexText leftText="Address" rightText={address} />}

            {formattedRate && (
              <FlexText leftText="Rate/hr" rightText={formattedRate} />
            )}
            {zipCode && !nurse && (
              <FlexText leftText="Zip code" rightText={zipCode} />
            )}
            {faxNumber && (
              <FlexText leftText="Fax number" rightText={faxNumber} />
            )}
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
    flex: 1,
  },
  content: {
    gap: 10,
    flex: 1,
  },
}));
