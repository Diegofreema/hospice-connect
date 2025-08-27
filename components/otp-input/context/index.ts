import { createContext } from "react";
import { OtpContextProps } from "../types";

export const OtpContext = createContext<OtpContextProps>({} as OtpContextProps);
