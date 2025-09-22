import { Avatar } from '@/components/avatar/Avatar';
import { SpinnerArc } from '@/components/loaders';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';
import { palette } from '@/theme';
import { IconUpload } from '@tabler/icons-react-native';
import { useMutation } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import {
  generateErrorMessage,
  getFontSize,
  uploadProfilePicture,
} from '../utils';
import { Card } from './card';
import { FlexText } from './flex-text';
import Text from './text';
import View from './view';

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
}: Props) => {
  const headingText = nurse ? `Nurse's` : `Hospice's`;
  const formattedRate = rate ? `$${rate}/hr` : '';
  const [image, setImage] = useState<string | null>(null);
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
          description: 'Image updated',
          type: 'success',
        });
      }
      setImage(null);
    } catch (error) {
      showToast({
        title: 'Error',
        description: generateErrorMessage(error, 'Failed to update image'),
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };
  return (
    <View gap={'m'}>
      <View width={120} alignSelf={'center'} height={120} borderRadius={80}>
        <View style={styles.container}>
          <Avatar
            image={{ uri: image || imageUrl || '', name: name }}
            size={120}
            onPress={pickImage}
          />
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
                <IconUpload size={25} color={palette.white} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View backgroundColor={'cardBackground'} p={'s'}>
        <Text
          variant={'subheader'}
          fontSize={getFontSize(16)}
          textAlign={'center'}
        >
          {headingText} information
        </Text>
        <Card backgroundColor={'white'} p={'m'} borderRadius={8}>
          <FlexText leftText="Name" rightText={name} />
          <FlexText leftText="Email" rightText={email} />
          <FlexText leftText="Mobile number" rightText={phoneNumber} />
          {licenseNumber && (
            <FlexText leftText="License number" rightText={licenseNumber} />
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
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  camera: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    backgroundColor: palette.blue,
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
});
