import { Badge } from '@/components/badge/Badge';
import { Card, CardContent, CardHeader } from '@/components/card';
import { Id } from '@/convex/_generated/dataModel';
import { CustomPressable } from '@/features/shared/components/custom-pressable';

import { Text } from '@/features/shared/components/text';
import { View } from '../../shared/components/view';

import {
  changeFirstLetterToCapital,
  getFontSize,
  trimText,
} from '@/features/shared/utils';

import {
  IconMapPin,
  IconSend,
  IconStarFilled,
} from '@tabler/icons-react-native';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { Button } from '@/features/shared/components/button';
import { Stack } from '@/features/shared/components/v-stack';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useGetNurseId } from '../hooks/use-get-nurse-id';

type Props = {
  isAssigned?: boolean;
  onAction?: () => void;
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

export const NurseCard = ({ nurse, isAssigned, onAction }: Props) => {
  const isAvailable = !!nurse.available?.available;
  const setNurseId = useGetNurseId((state) => state.setId);
  const badgeText = isAvailable ? 'Available' : 'Unavailable';
  const name = nurse.firstName + ' ' + nurse.lastName;
  const onMessage = () => {};
  const { theme } = useUnistyles();
  const onHandleAction = () => {
    onAction && onAction();
    setNurseId(nurse._id);
  };

  return (
    <Card style={styles.card}>
      <CardHeader style={styles.header}>
        <View gap="md">
          <View
            justifyContent={'center'}
            flexDirection="row"
            alignItems="center"
            maxWidth={70}
            p="lg"
            flex={0}
            borderRadius={'lg'}
            backgroundColor={theme.colors.white}
          >
            <IconStarFilled
              size={getFontSize(20)}
              color={theme.colors.yellowDark}
            />
            <Text>{nurse.ratings ? nurse.ratings : 'N/A'}</Text>
          </View>
          <Text>Discipline: {nurse.discipline}</Text>
          <Text size={'medium'} isMedium>
            {trimText(name, 15)}
          </Text>
          <View
            justifyContent={'flex-start'}
            flexDirection="row"
            alignItems="center"
            gap={'lg'}
          >
            <IconMapPin
              size={getFontSize(14)}
              color={theme.colors.iconGrey}
              style={{ marginRight: -4 }}
            />
            <Text>{changeFirstLetterToCapital(nurse.stateOfRegistration)}</Text>
          </View>
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
            <IconSend
              size={25}
              fill={theme.colors.blue}
              color={theme.colors.blue}
            />
          </CustomPressable>
        </View>
      </CardHeader>
      <CardContent style={styles.content}>
        <Stack mode="flex">
          <View>
            <Text size={'medium'} isMedium fontSize={getFontSize(16)}>
              Available Shift
            </Text>
            {nurse.available?.available &&
              nurse.available.startTime &&
              nurse.available.endTime && (
                <Text size={'small'}>
                  {format(nurse.available.startTime, 'h:mm a')} -{' '}
                  {format(nurse.available.endTime, 'h:mm a')}
                </Text>
              )}
          </View>
          {isAssigned && isAvailable && (
            <Button
              title="Assign"
              style={{ padding: 10 }}
              onPress={onHandleAction}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.cardGrey,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rate: {
    fontSize: getFontSize(20),
    color: theme.colors.blue,
  },
  content: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
  },
  messageBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: theme.colors.white,
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
}));
