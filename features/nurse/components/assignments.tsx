import {ActionComponent} from "@/features/shared/components/action-component";
import {SmallLoader} from "@/features/shared/components/small-loader";
import {type AvailableAssignmentType} from "../types";
import {AssignmentAvailableCard} from "./assignment-card";
import {FlatList} from "react-native";

type Props = {
  data: AvailableAssignmentType[];
  handleMore: () => void;
  isLoadingMore: boolean;
  title?: string;
  description?: string;
  onOpenSheet: () => void;
};
export const AssignmentsForNurses = ({
  data,
  handleMore,
  isLoadingMore,
  description = "Please check in later.",
  title = "No available assignments",
  onOpenSheet,
}: Props) => {
  return (
    <>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <AssignmentAvailableCard onOpenSheet={onOpenSheet} item={item} />
        )}
        keyExtractor={(item) => item._id}
        onEndReached={handleMore}
        onEndReachedThreshold={0.5}
        style={{ paddingHorizontal: 15 }}
        contentContainerStyle={{ gap: 20, paddingBottom: 100 }}
        ListFooterComponent={isLoadingMore ? <SmallLoader /> : null}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ActionComponent
            title={title}
            description={description}
            imageUrl={require("@/assets/images/review.png")}
          />
        }
      />
    </>
  );
};
