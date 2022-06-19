import { inferAsyncReturnType } from "@trpc/server"
import { CreateNextContextOptions } from "@trpc/server/adapters/next"

export const createContext = (opts?: CreateNextContextOptions) => {
  return {}
}

export type Context = inferAsyncReturnType<typeof createContext>
