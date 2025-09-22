import { useHospice } from '@/components/context/hospice-context';
import { AccountBrief } from '@/features/shared/components/account-brief';
import { Spacer } from '@/features/shared/components/spacer';
import { MoreLinks } from '../nurse/components/more-links';
import { LinkType } from '../nurse/types';
import View from '../shared/components/view';

export const HospiceMore = () => {
  const { hospice } = useHospice();
  if (hospice === null) return null;

  return (
    <View>
      <Spacer height={30} />
      <AccountBrief
        data={{ name: hospice.name || 'N/A', image: hospice.image as string }}
        title="Business Profile"
        href={'/business-profile'}
      />
      <Spacer height={30} />
      <MoreLinks links={links} />
    </View>
  );
};

const links: LinkType[] = [
  {
    label: 'Subscriptions',
    name: 'calendar.badge.checkmark',
    link: '/(other-screens)/subscription',
  },

  {
    label: 'Support',
    name: 'beats.headphones',
    link: 'https://hospice-connect-web.vercel.app/contact',
  },
  {
    label: 'Privacy Policy',
    name: 'note.text',
    link: 'https://hospice-connect-web.vercel.app/privacy-policy',
  },
];
