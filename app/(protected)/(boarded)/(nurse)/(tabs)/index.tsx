import { useNurse } from '@/components/context/nurse-context';
import { AccountBrief } from '@/features/shared/components/account-brief';
import { Wrapper } from '@/features/shared/components/wrapper';

export default function HomeScreen() {
  const { nurse } = useNurse();
  if (nurse === null) return null;
  const name = nurse.firstName + ' ' + nurse.lastName;
  return (
    <Wrapper>
      <AccountBrief data={{ name, image: nurse.image as string }} isHome />
    </Wrapper>
  );
}
