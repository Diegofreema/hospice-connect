import { type Icon } from "@tabler/icons-react-native";
import { View } from "react-native";
import { Text } from "@/features/shared/components/text";
import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: -3,
  },
  unread: (isMany: boolean, isSmall: boolean) => ({
    position: "absolute",
    top: -5,
    right: isMany ? -20 : -10,
    width: isMany ? 35 : isSmall ? 20 : 30,
    height: 20,
    backgroundColor: "blue",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  }),
});

type Props = {
  color: string;
  size?: number;
  icon: Icon;
  unreadCount?: number;
};

export const TabBarIcon = ({
  color,
  size = 28,
  icon: Icon,
  unreadCount,
}: Props) => {
  const isMany = (unreadCount || 0) > 99;
  const isSmall = (unreadCount || 0) < 10;
  return (
    <View>
      <Icon size={size} color={color} style={styles.tabBarIcon} />
      {!!unreadCount && unreadCount > 0 && (
        <View style={styles.unread(isMany, isSmall)}>
          <Text color={"white"} size={"small"}>
            {isMany ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
};
