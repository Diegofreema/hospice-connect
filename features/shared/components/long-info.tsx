import { View } from "@/features/shared/components/view";
import { Text } from "@/features/shared/components/text";

type Props = {
  title: string;
  description: string;
};
export const LongInfo = ({ title, description }: Props) => {
  return (
    <View gap={"md"}>
      <Text isBold size={"medium"}>
        {title}
      </Text>
      <Text>{description}</Text>
    </View>
  );
};
