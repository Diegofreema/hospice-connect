import { useNurse } from '@/components/context/nurse-context';
import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { BackButton } from '@/features/shared/components/back-button';
import { LoadingComponent } from '@/features/shared/components/loading';
import { ProfileCard } from '@/features/shared/components/profile-card';
import { Spacer } from '@/features/shared/components/spacer';
import { Stack } from '@/features/shared/components/v-stack';

import { Wrapper } from '@/features/shared/components/wrapper';

import { IconChevronRight } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React from 'react';
import { useUnistyles } from 'react-native-unistyles';

const NurseProfileScreen = () => {
  const { nurse } = useNurse();
  if (nurse === undefined) {
    return <LoadingComponent />;
  }
  if (nurse === null) {
    return null;
  }

  const name = nurse?.name;
  return (
    <Wrapper>
      <BackButton
        title="Profile"
        marginTop={0}
        rightContent={<RightContent />}
        marginLeft={50}
      />
      <Spacer />
      <ProfileCard
        nurseId={nurse._id}
        imageId={nurse.imageId}
        nurse
        name={name}
        address={nurse?.address || 'N/A'}
        email={nurse?.email}
        discipline={nurse.discipline}
        zipCode={nurse.zipCode || 'N/A'}
        phoneNumber={nurse.phoneNumber || 'N/A'}
        licenseNumber={nurse.licenseNumber || 'N/A'}
        rate={nurse.rate || 0}
        imageUrl={nurse.image as string}
        state={nurse.stateOfRegistration}
      />
    </Wrapper>
  );
};

export default NurseProfileScreen;

const RightContent = () => {
  const onPress = () => router.push('/nurse-profile/edit-profile');
  const { theme } = useUnistyles();
  return (
    <Stack mode="flexCentered">
      <PrivacyNoticeLink onPress={onPress}>Edit Profile</PrivacyNoticeLink>
      <IconChevronRight size={20} color={theme.colors.blue} />
    </Stack>
  );
};
