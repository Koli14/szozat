import { useEffect, useState } from 'react'
import { getStatuses, getGuessStatuses, isCharValue } from '../../lib/statuses'
import { CHAR_VALUES } from '../../lib/wordCommons'
import { VALID_GUESSES as words } from '../../constants/validGuesses'
import { WORDS } from '../../constants/wordlist'
import algo1 from './algo1'
import algo2 from './algo2'
import algo3 from './algo3'

const AlgoContainer = ({ guesses, algo }) => {
  const charStatuses = getStatuses(guesses)
  const [word, setWord] = useState('')
  useEffect(() => {
    const filteredWords = words
      .filter(word => word.every(letter => charStatuses[letter] !== 'absent'))  // Filter words containing absent letters
      .filter(word => {
        for (const [char, status] of Object.entries(charStatuses)) {
          if (status === 'present' && !word.includes(char)) {
            return false
          }
        }
        return true
      }) // Filter words not containing present letter
      .filter(word => {
        let shouldKeep = true
        guesses.forEach(guess => {
          const guessStatuses = getGuessStatuses(guess)
          guessStatuses.forEach((guessStatus, index) => {
            if (guessStatus === 'correct' && guess[index] !== word[index]) {
              shouldKeep = false
              return false
            }
            if (guessStatus === 'present' && guess[index] === word[index]) {
              shouldKeep = false
              return false
            }
          })
        })
        return shouldKeep
      }) // Filter words not having correct character at correct place, or having present letter incorrect place
    const stats = createLetterFrequencyObject(filteredWords, CHAR_VALUES)
    setWord(algo(filteredWords, stats));
  }, [charStatuses])
  return <div className='text-sm text-gray-500 dark:text-gray-300'>{word}</div>
}

const createLetterFrequencyObject = (words, chars) => {
  const stat = {}
  chars.forEach((char) => {
    const count = words.reduce((counter, word) => {
      return counter + word.filter(letter => letter === char).length
    }, 0)
    stat[char] = count
  })
  return stat
}

const Algo1 = ({ guesses }) => <AlgoContainer guesses={guesses} algo={algo1} />
const Algo2 = ({ guesses }) => <AlgoContainer guesses={guesses} algo={algo2} />
const Algo3 = ({ guesses }) => <AlgoContainer guesses={guesses} algo={algo3} />

export { Algo1, Algo2, Algo3 }
