import { useNurse } from '@/components/context/nurse-context';
import { AccountBrief } from '@/features/shared/components/account-brief';
import { Spacer } from '@/features/shared/components/spacer';
import View from '../../shared/components/view';

export const More = () => {
  const { nurse } = useNurse();
  if (nurse === null) return null;
  const name = nurse.firstName + ' ' + nurse.lastName;
  return (
    <View>
      <Spacer height={30} />
      <AccountBrief data={{ name, image: nurse.image as string }} />
    </View>
  );
};
