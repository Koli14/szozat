import { useEffect, useState } from 'react'
import { getStatuses, getGuessStatuses } from '../../lib/statuses'
import { CHAR_VALUES } from '../../lib/wordCommons'
import { VALID_GUESSES as words } from '../../constants/validGuesses'
import algo1 from './algo1'
import algo2 from './algo2'
import algo3 from './algo3'
import createBigStats from './bigStats'

const AlgoContainer = ({ guesses, algo, withPosition }) => {
  const charStatuses = getStatuses(guesses)
  const [word, setWord] = useState('')
  useEffect(() => {
    const filteredWords = words
      .filter((word) =>
        word.every((letter) => charStatuses[letter] !== 'absent')
      ) // Filter words containing absent letters
      .filter((word) => {
        for (const [char, status] of Object.entries(charStatuses)) {
          if (status === 'present' && !word.includes(char)) {
            return false
          }
        }
        return true
      }) // Filter words not containing present letter
      .filter((word) => {
        let shouldKeep = true
        guesses.forEach((guess) => {
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
    const stats = createLetterFrequencyObject(filteredWords, withPosition)
    setWord(algo(filteredWords, stats))
  }, [charStatuses, algo, guesses, withPosition])
  return <div className="text-sm text-gray-500 dark:text-gray-300">{word}</div>
}

const createLetterFrequencyObject = (words, withPosition) => {
  const stat = {}
  CHAR_VALUES.forEach((char) => {
    let count
    if (withPosition) {
      count = words.reduce(
        (counter, word) => {
          return word.map((letter, index) =>
            letter === char ? counter[index] + 1 : counter[index]
          )
        },
        [0, 0, 0, 0, 0]
      )
    } else {
      count = words.reduce((counter, word) => {
        return counter + word.filter((letter) => letter === char).length
      }, 0)
    }
    stat[char] = count
  })
  return stat
}

const Algo1 = ({ guesses }) => <AlgoContainer guesses={guesses} algo={algo1} />
const Algo2 = ({ guesses }) => (
  <AlgoContainer guesses={guesses} algo={algo2} withPosition />
)
const Algo3 = ({ guesses }) => <AlgoContainer guesses={guesses} algo={algo3} />

export { Algo1, Algo2, Algo3, createBigStats, createLetterFrequencyObject }
