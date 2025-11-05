import { useLocalSearchParams } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SmallLoader } from "@/features/shared/components/small-loader";
import { View } from "react-native";
import { Avatar } from "@/components/avatar/Avatar";
import { FlexText } from "@/features/shared/components/flex-text";
import {
  calculateAge,
  changeFirstLetterToCapital,
} from "@/features/shared/utils";
import { LongInfo } from "@/features/shared/components/long-info";
import { StyleSheet } from "react-native-unistyles";
import { useTheme } from "stream-chat-expo";
import { parse } from "date-fns";

export const FetchNurseInfo = () => {
  const { id } = useLocalSearchParams<{ id: Id<"nurses"> }>();
  const { theme } = useTheme();
  const nurseInfo = useQuery(api.nurses.getNurseByNurseId, { nurseId: id });
  if (nurseInfo === undefined) {
    return <SmallLoader size={40} />;
  }

  const {
    zipCode,
    dateOfBirth,
    discipline,
    address,
    image,
    firstName,
    lastName,
    licenseNumber,
    gender,
    phoneNumber,
    rate,
    stateOfRegistration,
    email,
  } = nurseInfo;
  const name = firstName + " " + lastName;
  const formatedRate = `$${rate}/hr`;
  const formatedDateOfBirth = parse(dateOfBirth, "MM/dd/yy", new Date());
  const age = calculateAge(formatedDateOfBirth);
  return (
    <View style={{ gap: 10, minHeight: 450 }}>
      <View style={styles.top}>
        <View style={styles.container}>
          <Avatar image={{ uri: image || "", name }} size={120} />
        </View>
      </View>
      <View
        style={{ backgroundColor: theme.colors.cardGrey, padding: 10, flex: 1 }}
      >
        <View style={styles.card}>
          <View style={styles.content}>
            <FlexText leftText="Name" rightText={name} />
            <FlexText leftText="Email" rightText={email} />
            <FlexText leftText="Mobile number" rightText={phoneNumber} />
            <FlexText leftText="Gender" rightText={gender} />
            <FlexText leftText="Age" rightText={`${age}yrs`} />
            {licenseNumber && (
              <FlexText leftText="License number" rightText={licenseNumber} />
            )}

            <FlexText
              leftText="State"
              rightText={changeFirstLetterToCapital(stateOfRegistration)}
            />

            {discipline && (
              <FlexText leftText="Discipline" rightText={discipline} />
            )}

            <FlexText leftText="Rate/hr" rightText={formatedRate} />
            {zipCode && <FlexText leftText="Zip code" rightText={zipCode} />}

            {address && <LongInfo title={"Address"} description={address} />}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  camera: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    width: 50,
    height: 50,
    zIndex: 1,
  },
  container: {
    width: 120,
    height: 120,
    borderRadius: 80,
  },
  top: {
    width: 120,
    height: 120,
    borderRadius: 80,
    alignSelf: "center",
  },
  card: {
    backgroundColor: "white",
    padding: theme.paddings.xl,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.margins.md,
    gap: 15,
    flex: 1,
  },
  content: {
    gap: 10,
    flex: 1,
  },
}));
