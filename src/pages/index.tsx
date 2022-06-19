import type { NextPage } from "next"
import { useMemo, useState } from "react"
import getRandomPokemonId from "../utils/get-random-pokemon-id"
import { trpc } from "../utils/trpc"
import Image from "next/image"

const Home: NextPage = () => {
  const { invalidateQueries } = trpc.useContext()
  const [pokemonId, setPokemonId] = useState(getRandomPokemonId())
  const [scoreCounter, setScoreCounter] = useState(0)
  const [showLostMessage, setShowLostMessage] = useState(false)

  useMemo(() => getRandomPokemonId(), [])

  const [name, setName] = useState("")

  const { data } = trpc.useQuery([
    "get-pokemon-by-id",
    {
      id: pokemonId,
    },
  ])

  const makeGuess = trpc.useMutation("make-guess", {
    onSuccess: data => {
      if (data.success) {
        setScoreCounter(scoreCounter + 1)
      } else {
        setShowLostMessage(true)
      }
    },
  })

  const onGuess = async () => {
    if (!data) return

    let newPokemonId = getRandomPokemonId()
    if (newPokemonId === pokemonId) {
      newPokemonId = getRandomPokemonId()
    }

    setPokemonId(newPokemonId)
    setName("")

    makeGuess.mutate({
      id: data.id,
      name,
    })
  }

  return (
    <>
      <h1 className="text-3xl">Who's that pokemon?</h1>
      <p>How many can you get right in a row?</p>
      <h1>{scoreCounter}</h1>
      {!data && <p>Loading...</p>}
      {data && (
        <>
          <Image src={data.pictureUrl} width={256} height={256} />
          {data.name && <p>{data.name}</p>}
        </>
      )}
      <form
        onSubmit={e => {
          e.preventDefault()
          onGuess()
        }}
      >
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
      </form>
      {makeGuess.data && (
        <p>{makeGuess.data.success ? "YO YOU GOT IT" : "YOU'RE SHIT"}</p>
      )}
    </>
  )
}

export default Home
