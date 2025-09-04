import { Avatar } from '@/components/avatar/Avatar';
import { IconCamera } from '@tabler/icons-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { getFontSize } from '../utils';
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
}: Props) => {
  const headingText = nurse ? `Nurse's` : `Hospice's`;
  const formattedRate = rate ? `$${rate}/hr` : '';
  return (
    <View gap={'m'}>
      <View
        width={100}
        alignSelf={'center'}
        height={100}
        overflow={'hidden'}
        borderRadius={50}
      >
        <View style={styles.container}>
          <Avatar image={{ uri: imageUrl || '', name: name }} size={100} />
          <CameraPreview />
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

const CameraPreview = () => {
  return (
    <TouchableOpacity
      style={styles.camera}
      onPress={() => console.log('camera')}
    >
      <IconCamera size={30} color={'white'} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  camera: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'black',
    opacity: 0.2,
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(5px)',
    zIndex: 1,
  },
  container: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
});
