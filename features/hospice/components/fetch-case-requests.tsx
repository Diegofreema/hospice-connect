import { Card, CardHeader } from "@/components/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CustomPressable } from "@/features/shared/components/custom-pressable";
import { FlexText } from "@/features/shared/components/flex-text";
import { SmallLoader } from "@/features/shared/components/small-loader";
import { Text } from "@/features/shared/components/text";
import { View } from "@/features/shared/components/view";
import {
  changeFirstLetterToCapital,
  generateErrorMessage,
  getFontSize,
  trimText,
} from "@/features/shared/utils";
import {
  IconMapPin,
  IconSend,
  IconStarFilled,
} from "@tabler/icons-react-native";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import React, { useState } from "react";

import { useHospice } from "@/components/context/hospice-context";
import { useToast } from "@/components/demos/toast";
import { FlexButtons } from "@/features/shared/components/flex-buttons";
import { format, parse } from "date-fns";
import { ScrollView } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useMarkAsRead } from "@/features/hospice/hooks/use-mark-as-read";

type Props = {
  nurseId: Id<"nurses">;
  hospiceId: Id<"hospices">;
  scheduleId: Id<"schedules">;
  notificationId: Id<"hospiceNotifications">;
};

const FetchCaseRequest = ({
  hospiceId,
  nurseId,
  scheduleId,
  notificationId,
}: Props) => {
  const { hospice } = useHospice();
  const [processing, setProcessing] = useState(false);
  const caseRequest = useQuery(api.schedules.getCaseRequest, {
    hospiceId,
    nurseId,
    scheduleId,
    notificationId,
  });

  const declineCaseRequest = useMutation(api.schedules.declineCaseRequest);
  const acceptCaseRequest = useMutation(api.schedules.acceptCaseRequest);
  useMarkAsRead({ notificationId });
  const { showToast } = useToast();
  const { theme } = useUnistyles();

  if (caseRequest === undefined) {
    return <SmallLoader size={50} />;
  }
  const onMessage = () => {};
  const onDecline = async () => {
    if (!hospice) return;
    setProcessing(true);
    try {
      await declineCaseRequest({
        notificationId: notification._id,
        nurseId,
        scheduleId,
        hospiceId: caseRequest.notification.hospiceId,
        hospiceName: hospice.businessName as string,
      });
      showToast({
        title: "Success",
        subtitle: "Case request declined successfully",
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        "Failed to decline case request",
      );
      showToast({
        title: "Error",
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setProcessing(false);
    }
  };
  const onAcceptCaseRequest = async () => {
    if (!hospice) return;
    setProcessing(true);
    try {
      await acceptCaseRequest({
        notificationId: notification._id,
        nurseId,
        scheduleId,
        hospiceId: caseRequest.notification.hospiceId,
        hospiceName: hospice.businessName as string,
      });
      showToast({
        title: "Success",
        subtitle: "Case request accepted successfully",
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        "Failed to accept case request",
      );
      showToast({
        title: "Error",
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setProcessing(false);
    }
  };
  const { nurse, assignment, schedule, notification } = caseRequest;
  const name = nurse.firstName + " " + nurse.lastName;
  const patientName =
    assignment.patientFirstName + " " + assignment.patientLastName;
  const startDate = parse(schedule.startDate, "dd-MM-yyyy", new Date());
  const endDate = parse(schedule.endDate, "dd-MM-yyyy", new Date());
  const showButtons =
    notification.status !== "accepted" && notification.status !== "declined";
  const isDeclined = notification?.status === "declined";
  const isAccepted = notification?.status === "accepted";
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View gap="xxl">
        <Card style={styles.card}>
          <CardHeader style={styles.header}>
            <View gap="md">
              <View
                justifyContent={"center"}
                flexDirection="row"
                alignItems="center"
                maxWidth={70}
                p="lg"
                flex={0}
                borderRadius={"lg"}
                backgroundColor={theme.colors.white}
              >
                <IconStarFilled
                  size={getFontSize(20)}
                  color={theme.colors.yellowDark}
                />
                <Text>{nurse.ratings ? nurse.ratings : "N/A"}</Text>
              </View>
              <Text>Discipline: {nurse.discipline}</Text>
              <Text size={"medium"} isMedium>
                {trimText(name, 15)}
              </Text>
              <View
                justifyContent={"flex-start"}
                flexDirection="row"
                alignItems="center"
                gap={"lg"}
              >
                <IconMapPin
                  size={getFontSize(14)}
                  color={theme.colors.iconGrey}
                  style={{ marginRight: -4 }}
                />
                <Text>
                  {changeFirstLetterToCapital(nurse.stateOfRegistration)}
                </Text>
              </View>
              <View flexDirection={"row"} alignItems={"baseline"}>
                <Text style={styles.rate}>${nurse.rate}</Text>
                <Text>/hr</Text>
              </View>
            </View>
            <View height={"100%"} flex={1}>
              <Image
                source={{ uri: nurse.image as string }}
                style={styles.image}
                contentFit="contain"
                placeholderContentFit="contain"
                placeholder={require("@/assets/images/person.jpg")}
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
        </Card>
        <Card style={styles.card}>
          <CardHeader style={styles.header}>
            <Text size={"normal"}>{trimText(patientName, 15)}</Text>
          </CardHeader>
          <View style={styles.content}>
            <FlexText
              leftText="Phone number"
              rightText={assignment.phoneNumber}
            />
            <FlexText leftText="Care level" rightText={assignment.careLevel} />
            <FlexText leftText="Discipline" rightText={assignment.discipline} />

            <FlexText
              leftText="Location"
              rightText={trimText(assignment.patientAddress, 20)}
            />
          </View>
        </Card>
        <View style={styles.scheduleCard}>
          <View>
            <Text size="normal" isBold>
              {format(startDate, "MM/dd/yy")} - {format(endDate, "MM/dd/yy")}
            </Text>
            <Text size="small">
              {schedule.startTime} - {schedule.endTime}
            </Text>
          </View>
        </View>
      </View>
      {showButtons && (
        <FlexButtons
          onPress={onAcceptCaseRequest}
          onCancel={onDecline}
          disabled2={processing}
          disabled={processing}
          buttonText="Decline"
          buttonText2="Accept"
        />
      )}
      <View mt="lg">
        {isDeclined && (
          <Text size="medium" color="red" isBold textAlign="center">
            Declined
          </Text>
        )}
        {isAccepted && (
          <Text size="medium" color="green" isBold textAlign="center">
            Accepted
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default FetchCaseRequest;

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.cardGrey,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: theme.colors.white,
    padding: 5,
    borderRadius: 30,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    flex: 1,
  },
  scheduleCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: theme.colors.cardGrey,
    padding: theme.paddings.xxl,
    borderRadius: 10,
  },
}));
