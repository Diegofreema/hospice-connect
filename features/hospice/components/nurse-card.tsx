import { Badge } from '@/components/badge/Badge';
import { Card, CardContent, CardHeader } from '@/components/card';
import { CustomPressable } from '@/features/shared/components/custom-pressable';

import { Text } from '@/features/shared/components/text';
import { View } from '../../shared/components/view';

import {
  changeFirstLetterToCapital,
  getFontSize,
} from '@/features/shared/utils';

import {
  IconCircle,
  IconMapPin,
  IconSend,
  IconStarFilled,
} from '@tabler/icons-react-native';
import { format } from 'date-fns';
import { Image } from 'expo-image';

import { api } from '@/convex/_generated/api';
import { Button } from '@/features/shared/components/button';
import { Stack } from '@/features/shared/components/v-stack';
import { useMessage } from '@/hooks/use-message';
import { FunctionReturnType } from 'convex/server';
import { router } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useGetNurseId } from '../hooks/use-get-nurse-id';

type Props = {
  isAssigned?: boolean;
  onAction?: (discipline?: string) => void;
  nurse: FunctionReturnType<typeof api.nurses.getNurses>['page'][number];
};

export const NurseCard = ({ nurse, isAssigned, onAction }: Props) => {
  const isAvailable = !!nurse.available?.available;
  const { onMessage } = useMessage({ userToChat: nurse.userId });
  const setNurseId = useGetNurseId((state) => state.setId);
  const badgeText = isAvailable ? 'Available' : 'Unavailable';
  const name = nurse.name;

  const { theme } = useUnistyles();
  const onHandleAction = () => {
    onAction && onAction(nurse.discipline);
    setNurseId(nurse._id);
  };
  const onPress = () => {
    router.push(`/view-nurse-profile?id=${nurse._id}`);
  };

  return (
    <Card style={styles.card}>
      <CardHeader style={styles.header}>
        <View gap="md" flex={1}>
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
          <CustomPressable onPress={onPress}>
            <Text size={'medium'} isMedium style={{ flex: 1 }}>
              {name}
            </Text>
          </CustomPressable>
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
            <Text style={styles.rate}>${nurse.rate || 0}</Text>
            <Text>/hr</Text>
          </View>
          <View>
            <Badge
              label={badgeText}
              variant={'available'}
              icon={
                <IconCircle
                  size={12}
                  fill={isAvailable ? 'lightgreen' : 'red'}
                  color={isAvailable ? 'lightgreen' : 'red'}
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
            contentFit="cover"
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
    width: 150,
    height: 180,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
}));
