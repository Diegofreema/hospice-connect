import { createContext } from "react";
import { type DialogContextType } from "../Dialog.types";

export const DialogContext = createContext<DialogContextType | null>(null);
