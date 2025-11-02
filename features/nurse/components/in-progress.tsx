import {ActionComponent} from "@/features/shared/components/action-component";
import {SmallLoader} from "@/features/shared/components/small-loader";
import React from "react";
import {AssignmentWithBusiness} from "../types";
import {InProgressCard} from "./in-progress-card";
import {FlatList} from "react-native";

type Props = {
  data: AssignmentWithBusiness[];
  handleMore: () => void;
  isLoadingMore: boolean;
  title?: string;
  description?: string;
  onOpenSheet: () => void;
};

export const InProgress = ({
  data,
  handleMore,
  isLoadingMore,
  onOpenSheet,
  description = "Please check available assignments.",
  title = "No assignments in progress",
}: Props) => {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <InProgressCard onOpenSheet={onOpenSheet} item={item} />
      )}
      keyExtractor={(item) => item._id}
      onEndReached={handleMore}
      onEndReachedThreshold={0.5}
      style={{ paddingHorizontal: 15 }}
      contentContainerStyle={{ gap: 20, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={isLoadingMore ? <SmallLoader /> : null}
      ListEmptyComponent={
        <ActionComponent
          title={title}
          description={description}
          imageUrl={require("@/assets/images/review.png")}
        />
      }
    />
  );
};
