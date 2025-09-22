import { useHospice } from '@/components/context/hospice-context';
import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { Id } from '@/convex/_generated/dataModel';
import { BackButton } from '@/features/shared/components/back-button';
import { LoadingComponent } from '@/features/shared/components/loading';
import { ProfileCard } from '@/features/shared/components/profile-card';
import { Spacer } from '@/features/shared/components/spacer';
import View from '@/features/shared/components/view';
import { Wrapper } from '@/features/shared/components/wrapper';
import { palette } from '@/theme';
import { IconChevronRight } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React from 'react';

const BusinessProfileScreen = () => {
  const { hospice } = useHospice();
  if (hospice === undefined) {
    return <LoadingComponent />;
  }
  if (hospice === null) {
    return null;
  }
  return (
    <Wrapper gap="s">
      <BackButton
        title="Business Profile"
        marginTop={0}
        rightContent={<RightContent id={hospice._id!} />}
        marginLeft={50}
      />
      <Spacer />
      <ProfileCard
        hospiceId={hospice._id!}
        imageId={hospice.user.imageId}
        name={hospice.businessName || 'N/A'}
        address={hospice?.address || 'N/A'}
        email={hospice?.email || 'N/A'}
        phoneNumber={hospice.phoneNumber || 'N/A'}
        licenseNumber={hospice.licenseNumber || 'N/A'}
        imageUrl={hospice.image as string}
      />
    </Wrapper>
  );
};

export default BusinessProfileScreen;

const RightContent = ({ id }: { id: Id<'hospices'> }) => {
  const onPress = () => router.push(`/business-profile/${id}`);
  return (
    <View flexDirection={'row'} alignItems={'center'}>
      <PrivacyNoticeLink onPress={onPress}>Edit Profile</PrivacyNoticeLink>
      <IconChevronRight size={20} color={palette.blue} />
    </View>
  );
};
