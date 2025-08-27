import { StyleSheet } from "react-native";
import { WIDTH } from "./const";

export const otpInputStyles = StyleSheet.create({
  container: {
    width: WIDTH,
    height: 120,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  inputSize: {
    marginHorizontal: 6,
  },
  input: {
    alignItems: "center",
    justifyContent: "center",
  },
  inputFocused: {
    borderColor: "#f8fafc",
    backgroundColor: "#0f0f23",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#1c0a0a",
  },
  text: {
    fontWeight: "600",
    fontSize: 18,
    color: "#f8fafc",
  },
  textError: {
    color: "#fecaca",
  },
  blurContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 56,
  },
  overlay: {
    position: "absolute",
  },
  errorMessage: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 16,
  },
});
