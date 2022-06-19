import * as trpcNext from "@trpc/server/adapters/next"
import superjson from "superjson"
import { distance } from "fastest-levenshtein"
import { z } from "zod"

import { createContext } from "../../../server/context"
import { createRouter } from "../../../server/create-router"
import pokemonData from "./data.json"

type Pokemon = {
  id: string
  createdAt?: string
  pokedexId: number
  generation?: number
  name?: string
  pictureUrl: string
}

export const appRouter = createRouter()
  .transformer(superjson)
  .query("get-pokemon-by-id", {
    input: z.object({
      id: z.number(),
    }),
    resolve({ input }) {
      return fetchPokemon(input.id)
    },
  })
  .mutation("make-guess", {
    input: z.object({
      id: z.string(),
      name: z.string(),
    }),
    resolve({ input }) {
      const result = guessThatPokemon(
        input.id,
        input.name.trim().replace(" ", "-").toLowerCase()
      )

      return {
        success: result.success,
        name: result.name,
      }
    },
  })

const guessThatPokemon = (id: string, name: string) => {
  const poke = pokemonData.filter(pokemon => pokemon.id === id)[0]!

  let success = false

  if (poke.name === name) {
    success = true
  } else if (distance(poke.name, name) === 1) {
    success = true
  }

  return { success, name: poke.name }
}

const fetchPokemon = (pokedexId: number) => {
  const poke: Pokemon = pokemonData.filter(
    pokemon => pokemon.pokedexId === pokedexId
  )[0]!

  return {
    id: poke.id,
    pictureUrl: poke.pictureUrl,
  }
}

// export type definition of API
export type AppRouter = typeof appRouter

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
})
