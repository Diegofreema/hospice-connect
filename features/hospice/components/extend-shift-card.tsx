import { Badge } from '@/components/badge/Badge';
import { BadgeVariant } from '@/components/badge/types';
import { Card, CardHeader } from '@/components/card';
import { api } from '@/convex/_generated/api';
import { Text } from '@/features/shared/components/text';
import {
  getScheduleStatusAndColor,
  getScheduleStatusText,
} from '@/features/shared/utils';
import { IconCircle } from '@tabler/icons-react-native';
import { FunctionReturnType } from 'convex/server';
import { format, parse } from 'date-fns';
import { Image } from 'expo-image';
import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { SlideInLeft } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

const AnimatedCard = Animated.createAnimatedComponent(Card);
type Props = {
  shift: Partial<
    FunctionReturnType<typeof api.shifts.getShifts>['shifts'][number]
  >;
};

export const ExtendShiftCard = ({ shift }: Props) => {
  const { width } = useWindowDimensions();
  const size = width * 0.13;

  const statusText = getScheduleStatusText(shift.status!);
  const statusInfo = getScheduleStatusAndColor(shift.status!);

  const today = new Date();
  const startDate = parse(shift.startDate!, 'yyyy-MM-dd', today);
  const endDate = parse(shift.endDate!, 'yyyy-MM-dd', today);
  const startTime = shift.startTime as string;
  const endTime = shift.endTime as string;

  const formattedStartTime = format(
    parse(`${shift.startDate} ${startTime}`, 'yyyy-MM-dd HH:mm', today),
    'h:mm a'
  );

  const formattedEndTime = format(
    parse(`${shift.endDate} ${endTime}`, 'yyyy-MM-dd HH:mm', today),
    'h:mm a'
  );

  return (
    <AnimatedCard
      style={styles.card}
      entering={SlideInLeft.springify()
        .duration(1000)
        .damping(80)
        .stiffness(200)}
    >
      <CardHeader style={{ gap: 10 }}>
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <View style={styles.imageContainer(size)}>
              <Image style={styles.image} source={shift.nurse?.image} />
            </View>
            <View>
              <Text size="normal" isBold>
                No nurse assigned
              </Text>

              <Text size="normal" isBold>
                {format(startDate, 'MM/dd/yy')} - {format(endDate, 'MM/dd/yy')}
              </Text>
              <Text size="small">
                {formattedStartTime} - {formattedEndTime}
              </Text>
            </View>
          </View>
          <View style={styles.right}>
            <Badge
              label={statusText}
              variant={statusInfo.status as BadgeVariant}
              size="sm"
              icon={
                <IconCircle
                  size={12}
                  fill={statusInfo.color}
                  color={statusInfo.color}
                />
              }
            />
            <Text size="large" isBold style={{ alignSelf: 'flex-end' }}>
              ${shift.rate}/hr
            </Text>
          </View>
        </View>
      </CardHeader>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create((theme) => ({
  imageContainer: (size: number) => ({
    width: size,
    height: size,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.colors.grey,
  }),
  image: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: theme.colors.cardGrey,
  },
  header: {
    flexDirection: 'row',

    alignItems: 'center',
    gap: 10,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,

    width: '100%',
  },
  right: {
    gap: 5,
  },
}));
