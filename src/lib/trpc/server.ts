import "server-only"

import { headers } from "next/headers"
import { cache } from "react"
import { createCaller } from "./init"
import { appRouter } from "./root"
import { createTRPCContext } from "./context"

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const headersList = await headers()
  const heads = new Headers(headersList)
  heads.set("x-trpc-source", "rsc")

  return createTRPCContext({
    req: { headers: heads } as any,
    res: {} as any,
    info: { isBatchCall: false, calls: [] } as any,
  })
})

export const api = createCaller(appRouter)(createContext)