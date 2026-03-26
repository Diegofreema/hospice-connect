import { useHospice } from '@/components/context/hospice-context';
import { MoreLinks } from '@/features/nurse/components/more-links';
import { type LinkType } from '@/features/nurse/types';
import { AccountBrief } from '@/features/shared/components/account-brief';
import { Spacer } from '@/features/shared/components/spacer';
import { Stack } from '@/features/shared/components/v-stack';

import {
  IconCreditCardPay,
  IconHeadset,
  IconShieldBolt,
  IconShieldCheck,
  IconTrash,
} from '@tabler/icons-react-native';

export const HospiceMore = () => {
  const { hospice } = useHospice();
  if (hospice === null) return null;
  const isVerified = hospice.status === 'approved';
  return (
    <Stack>
      <Spacer height={30} />
      <AccountBrief
        data={{
          name: hospice.businessName || 'N/A',
          image: hospice.image as string,
        }}
        title="Business Profile"
        href={'/business-profile'}
        verified={isVerified}
      />
      <Spacer height={30} />
      <MoreLinks links={links} />
    </Stack>
  );
};

const links: LinkType[] = [
  {
    label: 'Subscriptions',
    icon: IconCreditCardPay,
    // @ts-ignore
    link: '/(other-screens)/subscription',
  },

  {
    label: 'Support',
    icon: IconHeadset,
    link: 'https://hospice-connect-web.vercel.app/contact',
  },
  {
    label: 'Privacy Policy',
    icon: IconShieldCheck,
    link: 'https://hospice-connect-web.vercel.app/privacy-policy',
  },
  {
    label: 'Terms of Service',
    icon: IconShieldBolt,
    link: 'https://hospice-connect-web.vercel.app/terms',
  },
  {
    label: 'Delete Account',
    icon: IconTrash,
    link: '/delete-account',
  },
];
