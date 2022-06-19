const MAX_ID = 100

const getRandomPokemonId =  () => {
  const randomId = Math.floor(Math.random() * MAX_ID + 1 - 1)

  return randomId
}

export default getRandomPokemonId
