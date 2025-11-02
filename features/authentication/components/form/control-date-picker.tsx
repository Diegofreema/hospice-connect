import { Text } from "@/features/shared/components/text";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import React, { useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { View } from "../../../shared/components/view";
type Props<TFieldValues extends FieldValues> = {
  label?: string;

  errors: FieldErrors<TFieldValues>;
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;

  placeholder?: string;
  mode?: "date" | "time" | "datetime";
  age?: number;
};

export const ControlledDatePicker = <TFieldValues extends FieldValues>({
  label,
  control,
  errors,
  name,
  mode = "date",
  age,
}: Props<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const onShowDatePicker = () => {
    setOpen(true);
  };
  const showAge = age && age > 0;
  return (
    <View gap="md" flex={1}>
      <Text size="normal">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View>
            <TouchableOpacity
              onPress={onShowDatePicker}
              style={styles.container}
            >
              <Text size="normal" color={value ? "black" : "grey"}>
                {mode === "time"
                  ? format(value || new Date(), "HH:mm")
                  : format(value || new Date(), "MM/dd/yyyy")}{" "}
                {!!showAge && `(${age}yrs)`}
              </Text>
            </TouchableOpacity>
            {open && (
              <View style={{ alignSelf: "center" }}>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={value}
                  mode={mode}
                  is24Hour={true}
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setOpen(false);
                    if (event.type !== "dismissed") {
                      onChange(selectedDate);
                    }
                  }}
                />
              </View>
            )}
          </View>
        )}
      />
      {errors[name]?.message && (
        <Text size="small" color={"red"}>
          {typeof errors[name]?.message === "string"
            ? errors[name]?.message
            : "Invalid input"}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "grey",
    paddingHorizontal: 8,
    paddingVertical: 15,
    borderRadius: 8,
    flex: 1,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
