import type { NextPage } from "next"
import { useState } from "react"
import getRandomPokemonId from "../utils/get-random-pokemon-id"
import { trpc } from "../utils/trpc"
import Image from "next/image"
import Hearts from "../../public/hearts.svg"
import { usePlausible } from "next-plausible"

const Home: NextPage = () => {
  const [scoreCounter, setScoreCounter] = useState(0)
  const [showLostMessage, setShowLostMessage] = useState(false)
  const [correctPokemonName, setCorrectPokemonName] = useState("")
  const [answeredPokemon, setAnsweredPokemon] = useState<number[]>([])
  const [pokemonId, setPokemonId] = useState(
    getRandomPokemonId(answeredPokemon)
  )
  const [wonGame, setWonGame] = useState(false)
  const [name, setName] = useState("")

  const plausible = usePlausible()

  const { data } = trpc.useQuery(
    [
      "get-pokemon-by-id",
      {
        id: pokemonId,
      },
    ],
    {
      onSuccess: data => {
        if (data === false) {
          setPokemonId(getRandomPokemonId(answeredPokemon))
        }
      },
    }
  )

  const makeGuess = trpc.useMutation("make-guess", {
    onSuccess: data => {
      if (data.success) {
        setScoreCounter(scoreCounter + 1)
        setAnsweredPokemon([...answeredPokemon, pokemonId])
        setPokemonId(getRandomPokemonId(answeredPokemon))
        if (answeredPokemon.length === 151) {
          setWonGame(true)
        }
      } else {
        setCorrectPokemonName(data.name)
        setShowLostMessage(true)
      }
    },
  })

  const onGuess = async () => {
    if (data === undefined || !data || !name) return

    setName("")

    plausible("guess-pokemon")

    await makeGuess.mutateAsync({
      id: data.id,
      name,
    })
  }

  const restartGame = () => {
    setScoreCounter(0)
    setAnsweredPokemon([])
    setPokemonId(getRandomPokemonId([]))
    setCorrectPokemonName("")
    setWonGame(false)
    setShowLostMessage(false)

    plausible("restart-game")
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col items-center justify-center sm:mt-32 mt-10">
        <div className="bg-white sm:max-w-4xl w-full sm:p-8 p-4 sm:rounded-lg sm:shadow-lg flex justify-center items-center flex-col">
          <h1 className="sm:text-5xl text-2xl text-center">
            Guess the Pokémon
          </h1>
          <p className="text-gray-500 text-md mb-4">
            Can you guess all 151 original pokemon?
          </p>
          <p className="sm:text-3xl text-xl mt-2">Your Score: {scoreCounter}</p>
          {wonGame && (
            <div className="flex items-center justify-center flex-col my-4">
              <h1 className="text-2xl">
                Well... Shit... I didn't really plan for anyone to win...
              </h1>
              <button
                onClick={restartGame}
                className="p-4 bg-gray-50 shadow-sm border my-4"
              >
                Try again?
              </button>
            </div>
          )}
          {showLostMessage && (
            <>
              <div>
                {data && (
                  <div className="flex items-center justify-center flex-col">
                    <Image src={data.pictureUrl} width={256} height={256} />
                    <h3 className="text-3xl">
                      Not quite... That was{" "}
                      <span className="font-semibold capitalize">
                        {correctPokemonName}
                      </span>
                    </h3>
                    <button
                      onClick={restartGame}
                      className="p-4 bg-gray-50 shadow-sm border my-4"
                    >
                      Try again?
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {!showLostMessage && !wonGame && (
            <>
              <div>
                {data === undefined && (
                  <Image
                    src={Hearts}
                    width={256}
                    height={256}
                    className="text-pink-300"
                  />
                )}
                {data && (
                  <>
                    <Image src={data.pictureUrl} width={256} height={256} />
                    {data.name && <p className="text-center">{data.name}</p>}
                  </>
                )}
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  onGuess()
                }}
              >
                <div className="shadow-sm border flex my-4">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="p-4"
                    placeholder="Pokemon name..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <button className="p-4 bg-gray-50" onClick={onGuess}>
                    Guess
                  </button>
                </div>
              </form>
            </>
          )}
          <span className="italic text-sm text-gray-500">
            It's case insensitive, go mad.
          </span>
        </div>
      </div>
    </div>
  )
}

export default Home
