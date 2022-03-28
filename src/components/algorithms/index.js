import { useEffect, useState } from 'react'
import { getStatuses, getGuessStatuses, isCharValue } from '../../lib/statuses'
import { CHAR_VALUES } from '../../lib/wordCommons'
import { VALID_GUESSES as words } from '../../constants/validGuesses'
import algo1 from './algo1'
import algo2 from './algo2'

const AlgoContainer = ({ guesses, algo }) => {
  const charStatuses = getStatuses(guesses)
  const [word, setWord] = useState('')
  // const guesStatues = getGuessStatuses(guesses[1])
  const filteredWords = words
    .filter(word => word.every(letter => charStatuses[letter] !== "absent"))  // Filter words containing absent letters
    .filter(word => {
      for (const [char, status] of Object.entries(charStatuses)) {
        if (status === "present" && !word.includes(char)) {
          return false
        }
      }
      return true
      // word.some(letter => charStatuses[letter] === "present")) 
    }) // Filter words not containing present letter
  // .filter(word => word.some(letter => {})) // Filter words not having correct character at correct place
  console.log(filteredWords)
  useEffect(() => {
    setWord(algo(charStatuses, filteredWords));
  }, [charStatuses])
  return <div className="text-sm text-gray-500 dark:text-gray-300">{word}</div>
}

const Algo1 = ({ guesses }) => <AlgoContainer guesses={guesses} algo={algo1} />
const Algo2 = ({ guesses }) => <AlgoContainer guesses={guesses} algo={algo2} />

export { Algo1, Algo2 }
