"use client"

import { createContext, useContext } from "react"
import type { HeaderUser } from "./header"

const UserContext = createContext<HeaderUser | undefined>(undefined)

export function UserProvider({ user, children }: { user?: HeaderUser; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser() {
  return useContext(UserContext)
}
