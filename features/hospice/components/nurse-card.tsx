import { Id } from '@/convex/_generated/dataModel';
import { Text, View } from 'react-native';

type Props = {
  nurse: {
    image: string | null;
    _id: Id<'nurses'>;
    _creationTime: number;
    imageId?: Id<'_storage'> | undefined;
    rate?: number | undefined;
    address?: string | undefined;
    zipCode?: string | undefined;
    firstName: string;
    lastName: string;
    gender: string;
    phoneNumber: string;
    licenseNumber: string;
    stateOfRegistration: string;
    dateOfBirth: string;
    discipline: 'RN' | 'LVN' | 'HHA';
    isApproved: boolean;
    userId: Id<'users'>;
  };
};

export const NurseCard = ({ nurse }: Props) => {
  return (
    <View>
      <Text> nurse-card</Text>
    </View>
  );
};
