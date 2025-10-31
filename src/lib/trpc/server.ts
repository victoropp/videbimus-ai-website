import "server-only"

import { cache } from "react"
import { createCaller } from "./init"
import { appRouter } from "./root"
import { createTRPCContext } from "./context"

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  // For RSC, we don't have req/res, so we pass empty object
  return createTRPCContext({} as any)
})

export const api = createCaller(appRouter)(createContext)