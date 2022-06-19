import * as trpcNext from "@trpc/server/adapters/next"
import superjson from "superjson"
import { z } from "zod"
import { createContext } from "../../../server/context"
import { createRouter } from "../../../server/create-router"

import { distance } from "fastest-levenshtein"

import { prisma } from "../../../server/db"

export const appRouter = createRouter()
  .transformer(superjson)
  .query("get-pokemon-by-id", {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ input }) {
      return await createOrFetchPokemon(input.id)
    },
  })
  .mutation("make-guess", {
    input: z.object({
      id: z.string(),
      name: z.string(),
    }),
    async resolve({ input }) {
      const result = await guessThatPokemon(
        input.id,
        input.name.trim().replace(" ", "-").toLowerCase()
      )

      return {
        success: result.success,
        name: result.name,
      }
    },
  })

const guessThatPokemon = async (id: string, name: string) => {
  const poke = await prisma.pokemon.findFirst({
    where: {
      id,
    },
    select: {
      name: true,
    },
  })

  let success = false

  if (poke!.name === name) {
    success = true
  } else if (distance(poke!.name, name) === 1) {
    success = true
  }

  return { success, name: poke!.name }
}

const createOrFetchPokemon = async (pokedexId: number) => {
  const poke = await prisma.pokemon.findFirst({
    where: {
      pokedexId,
    },
    select: {
      id: true,
      pictureUrl: true,
      name: !process.env.VERCEL,
    },
  })

  return poke
}

// export type definition of API
export type AppRouter = typeof appRouter

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
})
