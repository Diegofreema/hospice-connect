import { Badge } from '@/components/badge/Badge';
import { Card, CardContent, CardHeader } from '@/components/card';
import { Id } from '@/convex/_generated/dataModel';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { HStack } from '@/features/shared/components/HStack';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';

import {
  changeFirstLetterToCapital,
  getFontSize,
  trimText,
} from '@/features/shared/utils';
import { palette } from '@/theme';
import {
  IconMapPin,
  IconSend,
  IconStarFilled,
} from '@tabler/icons-react-native';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet } from 'react-native';

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
    available:
      | {
          startTime?: number | undefined;
          endTime?: number | undefined;
          available: boolean;
          day:
            | 'Monday'
            | 'Tuesday'
            | 'Wednesday'
            | 'Thursday'
            | 'Friday'
            | 'Saturday'
            | 'Sunday';
        }
      | undefined;
    ratings: number;
  };
};

export const NurseCard = ({ nurse }: Props) => {
  const isAvailable = !!nurse.available?.available;
  const badgeText = isAvailable ? 'Available' : 'Unavailable';
  const name = nurse.firstName + ' ' + nurse.lastName;
  const onMessage = () => {};
  return (
    <Card style={styles.card}>
      <CardHeader style={styles.header}>
        <View style={{ gap: 2 }}>
          <HStack
            justifyContent={'center'}
            style={{ backgroundColor: palette.white, maxWidth: 70 }}
            padding={'s'}
            flex={0}
            borderRadius={5}
          >
            <IconStarFilled size={getFontSize(20)} color={palette.yellowDark} />
            <Text style={{ marginLeft: -10 }}>
              {nurse.ratings ? nurse.ratings : 'N/A'}
            </Text>
          </HStack>
          <Text>Discipline: {nurse.discipline}</Text>
          <Text variant={'subheader'} fontSize={getFontSize(20)}>
            {trimText(name, 15)}
          </Text>
          <HStack justifyContent={'flex-start'} gap={'s'}>
            <IconMapPin
              size={getFontSize(14)}
              color={palette.iconGrey}
              style={{ marginRight: -4 }}
            />
            <Text>{changeFirstLetterToCapital(nurse.stateOfRegistration)}</Text>
          </HStack>
          <View flexDirection={'row'} alignItems={'baseline'}>
            <Text style={styles.rate}>${nurse.rate}</Text>
            <Text>/hr</Text>
          </View>
          <View>
            <Badge
              label={badgeText}
              variant={'available'}
              icon={
                <SymbolView
                  name="circle.fill"
                  size={12}
                  tintColor={isAvailable ? 'lightgreen' : 'red'}
                />
              }
              size="sm"
              style={{ width: 100 }}
            />
          </View>
        </View>
        <View height={'100%'} flex={1}>
          <Image
            source={{ uri: nurse.image as string }}
            style={styles.image}
            contentFit="contain"
            placeholderContentFit="contain"
            placeholder={require('@/assets/images/person.jpg')}
          />
          <CustomPressable onPress={onMessage} style={styles.messageBtn}>
            <IconSend size={25} fill={palette.blue} color={palette.blue} />
          </CustomPressable>
        </View>
      </CardHeader>
      <CardContent style={styles.content}>
        <Text variant={'subheader'} fontSize={getFontSize(16)}>
          Available Shift
        </Text>
        {nurse.available?.available &&
          nurse.available.startTime &&
          nurse.available.endTime && (
            <Text variant={'small'}>
              {format(nurse.available.startTime, 'h:mm a')} -{' '}
              {format(nurse.available.endTime, 'h:mm a')}
            </Text>
          )}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.cardGrey,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rate: {
    fontSize: getFontSize(20),
    color: palette.blue,
  },
  content: {
    backgroundColor: palette.white,
    borderRadius: 8,
    padding: 12,
  },
  messageBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: palette.white,
    padding: 5,
    borderRadius: 30,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
  },
});
