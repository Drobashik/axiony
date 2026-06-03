"use client";

import { createContext, useContext } from "react";

export interface BootStatus {
  loaded: boolean;
}

export const BootContext = createContext<BootStatus>({ loaded: true });

export const useBootStatus = (): BootStatus => useContext(BootContext);
