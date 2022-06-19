const MAX_ID = 151

const getRandomPokemonId = (seenList: number[]): number => {
  const randomId = Math.floor((Math.random() * MAX_ID) + 1)

  if (seenList.includes(randomId)) {
    return getRandomPokemonId(seenList)
  }

  return randomId
}

export default getRandomPokemonId
