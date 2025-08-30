import { useNurse } from '@/components/context/nurse-context';
import { AccountBrief } from '@/features/shared/components/account-brief';
import { Spacer } from '@/features/shared/components/spacer';
import View from '../../shared/components/view';
import { LinkType } from '../types';
import { MoreLinks } from './more-links';

export const More = () => {
  const { nurse } = useNurse();
  if (nurse === null) return null;
  const name = nurse.firstName + ' ' + nurse.lastName;
  return (
    <View>
      <Spacer height={30} />
      <AccountBrief data={{ name, image: nurse.image as string }} />
      <Spacer height={30} />
      <MoreLinks links={links} />
    </View>
  );
};

const links: LinkType[] = [
  {
    label: 'Availability',
    name: 'calendar.and.person',
    link: '/(protected)/(boarded)/(nurse)/(other-screens)/availability',
  },
  {
    label: 'Card and Billing',
    name: 'creditcard',
    link: '/(protected)/(boarded)/(nurse)/(other-screens)/billing',
  },
  {
    label: 'Reset Password',
    name: 'lock',
    link: '/reset-password',
  },
  {
    label: 'Support',
    name: 'beats.headphones',
    link: '/support',
  },
  {
    label: 'Privacy Policy',
    name: 'note.text',
    link: '/privacy',
  },
];
