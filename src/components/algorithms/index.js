import { useEffect, useState } from 'react'
import { getStatuses, getGuessStatuses, isCharValue } from '../../lib/statuses'
import { CHAR_VALUES } from '../../lib/wordCommons'
import { VALID_GUESSES as words } from '../../constants/validGuesses'
import { WORDS } from '../../constants/wordlist'
import algo1 from './algo1'
import algo2 from './algo2'
import algo3 from './algo3'

const AlgoContainer = ({ guesses, algo, withPosition }) => {
  createBigStats()
  const charStatuses = getStatuses(guesses)
  const [word, setWord] = useState('')
  useEffect(() => {
    const filteredWords = filterWords(charStatuses, guesses)
    const stats = createLetterFrequencyObject(filteredWords, CHAR_VALUES, withPosition)
    setWord(algo(filteredWords, stats));
  }, [charStatuses])
  return <div className='text-sm text-gray-500 dark:text-gray-300'>{word}</div>
}

const filterWords = (charStatuses, guesses) => {
  return words
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
}

const createLetterFrequencyObject = (words, chars, withPosition) => {
  const stat = {}
  chars.forEach((char) => {
    let count;
    if (withPosition) {
      count = words.reduce((counter, word) => {
        return word.map((letter, index) => letter === char ? counter[index] + 1 : counter[index])
      }, [0, 0, 0, 0, 0])
    } else {
      count = words.reduce((counter, word) => {
        return counter + word.filter(letter => letter === char).length
      }, 0)
    }
    stat[char] = count
  })
  return stat
}

const Algo1 = ({ guesses }) => <AlgoContainer guesses={guesses} algo={algo1} />
const Algo2 = ({ guesses }) => <AlgoContainer guesses={guesses} algo={algo2} withPosition />
const Algo3 = ({ guesses }) => <AlgoContainer guesses={guesses} algo={algo3} />

const createBigStats = () => {
  const stats = {}
  for (let index = 0; index < 1000; index++) {
    const { solution } = getWordForDay(index)
    const charStatuses = getStatuses([])

  }
}

const getWordForDay = (i) => {
  // January 1, 2022 Game Epoch
  const epochMs = new Date('January 1, 2022 00:00:00').valueOf()
  const msInDay = 86400000
  const now = epochMs + (i * msInDay)
  const index = Math.floor((now - epochMs) / msInDay)
  const indexModulo = index % WORDS.length
  const nextday = (index + 1) * msInDay + epochMs

  return {
    solution: WORDS[indexModulo],
    solutionIndex: indexModulo,
    tomorrow: nextday,
  }
}


export { Algo1, Algo2, Algo3 }

