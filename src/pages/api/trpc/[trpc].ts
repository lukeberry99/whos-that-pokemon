import * as trpcNext from "@trpc/server/adapters/next"
import superjson from "superjson"
import { z } from "zod"
import { createContext } from "../../../server/context"
import { createRouter } from "../../../server/create-router"

import { prisma } from "../../../server/db"
import { MainClient } from "pokenode-ts"

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
      const result = await guessThatPokemon(input.id, input.name.toLowerCase())

      return {
        success: result,
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

  if (!poke) {
    return false
  }

  return poke.name === name
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

  if (!poke) {
    const api = new MainClient()
    const pokemon = await api.pokemon.getPokemonById(pokedexId)

    const result = await prisma.pokemon.create({
      data: {
        pokedexId,
        name: pokemon.name,
        generation: 0,
        pictureUrl: pokemon.sprites.front_default || "",
      },
      select: {
        id: true,
        pictureUrl: true,
        name: !process.env.VERCEL,
      },
    })

    return result
  }
  return poke
}

// export type definition of API
export type AppRouter = typeof appRouter

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
})
