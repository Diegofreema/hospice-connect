import { createContext } from "react";
import { type OtpContextProps } from "../types";

export const OtpContext = createContext<OtpContextProps>({} as OtpContextProps);
