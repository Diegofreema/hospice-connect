import { useHospice } from '@/components/context/hospice-context';
import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { type Id } from '@/convex/_generated/dataModel';
import { BackButton } from '@/features/shared/components/back-button';
import { ProfileCard } from '@/features/shared/components/profile-card';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { Spacer } from '@/features/shared/components/spacer';
import { Stack } from '@/features/shared/components/v-stack';

import { Wrapper } from '@/features/shared/components/wrapper';

import { IconChevronRight } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React from 'react';
import { useUnistyles } from 'react-native-unistyles';

const BusinessProfileScreen = () => {
  const { hospice } = useHospice();
  if (hospice === undefined) {
    return <SmallLoader size={50} />;
  }
  if (hospice === null) {
    return null;
  }
  return (
    <Wrapper gap="sm">
      <BackButton
        title="Business Profile"
        marginTop={0}
        rightContent={<RightContent id={hospice._id!} />}
        marginLeft={50}
      />
      <Spacer />
      <ProfileCard
        hospiceId={hospice._id!}
        imageId={hospice.imageId}
        name={hospice.businessName || 'N/A'}
        address={hospice?.address || 'N/A'}
        email={hospice?.email || 'N/A'}
        phoneNumber={hospice.phoneNumber || 'N/A'}
        licenseNumber={hospice.licenseNumber || 'N/A'}
        imageUrl={hospice.image as string}
        zipCode={hospice.zipcode || 'N/A'}
      />
    </Wrapper>
  );
};

export default BusinessProfileScreen;

const RightContent = ({ id }: { id: Id<'hospices'> }) => {
  const onPress = () => router.push(`/business-profile/${id}`);
  const { theme } = useUnistyles();
  return (
    <Stack mode="flexCentered">
      <PrivacyNoticeLink onPress={onPress}>Edit Profile</PrivacyNoticeLink>
      <IconChevronRight size={20} color={theme.colors.blue} />
    </Stack>
  );
};
