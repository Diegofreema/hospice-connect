import { Card, CardContent, CardHeader } from '@/components/card';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { FlexText } from '@/features/shared/components/flex-text';
import { MyMenu } from '@/features/shared/components/menu';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { trimText } from '@/features/shared/utils';
import { palette } from '@/theme';
import { IconDots } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { SFSymbol } from 'expo-symbols';
import { StyleSheet } from 'react-native';
import { PostType } from '../types';

type Props = {
  post: PostType;
};

const data: { label: string; value: string; ios: SFSymbol; android: string }[] =
  [
    {
      label: 'Edit',
      value: 'edit',
      ios: 'pencil',
      android: 'edit_text',
    },
    {
      label: 'Delete',
      value: 'delete',
      ios: 'trash',
      android: 'ic_delete',
    },
  ];
export const Post = ({ post }: Props) => {
  const name = post.patientFirstName + ' ' + post.patientLastName;
  const onClick = (value: string) => {
    if (value === 'edit') {
      router.push(`/edit/${post._id}`);
    }
    if (value === 'delete') {
      console.log('delete');
    }
  };
  const onViewSchedule = () => {};
  return (
    <Card style={styles.card}>
      <CardHeader style={styles.header}>
        <Text variant={'body'}>{trimText(name, 15)}</Text>
        <MyMenu
          trigger={
            <View style={styles.trigger}>
              <IconDots color={palette.black} size={20} />
            </View>
          }
          menuItems={data}
          onClick={onClick}
        />
      </CardHeader>
      <CardContent style={styles.content}>
        <FlexText leftText="Phone number" rightText={post.phoneNumber} />
        <FlexText leftText="Care level" rightText={post.careLevel} />
        <FlexText leftText="Discipline" rightText={post.discipline} />
        <FlexText
          leftText="Location"
          rightText={trimText(post.patientAddress, 15)}
        />
        <View style={styles.footer}>
          <CustomPressable
            onPress={onViewSchedule}
            style={[styles.button, styles.viewSchedule]}
          >
            <Text variant={'body'} color={'blue'}>
              View Schedule
            </Text>
          </CustomPressable>
          <CustomPressable
            onPress={onViewSchedule}
            style={[styles.button, styles.assign]}
          >
            <Text variant={'body'} color={'white'}>
              Assign
            </Text>
          </CustomPressable>
        </View>
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
  trigger: {
    padding: 5,
    borderRadius: 5,
  },
  content: {
    gap: 5,
    marginTop: -15,
    backgroundColor: palette.white,
    borderRadius: 15,
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  viewSchedule: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    borderWidth: 1,
    borderColor: palette.cardGrey,
  },
  assign: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    backgroundColor: palette.blue,
  },
  button: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
  },
});
