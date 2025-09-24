import { useNurse } from '@/components/context/nurse-context';
import { AccountBrief } from '@/features/shared/components/account-brief';
import { Spacer } from '@/features/shared/components/spacer';
import {
  IconCalendarWeek,
  IconCreditCardPay,
  IconHeadset,
  IconShieldCheck,
} from '@tabler/icons-react-native';
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
    icon: IconCalendarWeek,
    link: '/(protected)/(boarded)/(nurse)/(other-screens)/availability',
  },
  {
    label: 'Card and Billing',
    icon: IconCreditCardPay,
    link: '/(protected)/(boarded)/(nurse)/(other-screens)/billing',
  },
  // {
  //   label: 'Reset Password',
  //   icon: IconPasswordUser,
  //   link: '/reset-password',
  // },
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
];
