import type { NextPage } from "next"
import { useMemo, useState } from "react"
import getRandomPokemonId from "../utils/get-random-pokemon-id"
import { trpc } from "../utils/trpc"
import Image from "next/image"

const Home: NextPage = () => {
  const pokemonId = useMemo(() => getRandomPokemonId(), [])

  const [name, setName] = useState("")

  const { data } = trpc.useQuery([
    "get-pokemon-by-id",
    {
      id: pokemonId,
    },
  ])

  const methods = trpc.useMutation("make-guess")

  const onGuess = async () => {
    if (!data) return

    methods.mutate({
      id: data.id,
      name,
    })
  }

  return (
    <>
      <h1 className="text-3xl">Who's that pokemon?</h1>
      <p>How many can you get right in a row?</p>
      {!data && <p>Loading...</p>}
      {data && (
        <>
          <Image src={data.pictureUrl} width={256} height={256} />
        </>
      )}
      <input
        type="text"
        name="name"
        id="name"
        className="p-4 border shadow-md"
        placeholder="Pokemon name..."
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button className="p-4 border shadow-md" onClick={onGuess}>
        Guess
      </button>
    </>
  )
}

export default Home
