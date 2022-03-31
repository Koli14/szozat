import { isWordEqual } from '../../lib/words'
import { VALID_GUESSES as words } from '../../constants/validGuesses'
import { WORDS } from '../../constants/wordlist'

import { createLetterFrequencyObject } from './index'
import algo1 from './algo1'
import algo2 from './algo2'
import algo3 from './algo3'

const createBigStats = (samples) => {
  const algorhitms = [
    { algoName: 'Legsárgább', algo: algo1 },
    { algoName: 'Legzöldebb', algo: algo2 },
    { algoName: 'Legbénább', algo: algo3 },
  ]
  const stats = {}
  algorhitms.forEach(({ algo, algoName }) => {
    let steps = 0
    const startTime = performance.now()
    let looseCount = 0
    let minStep = 10
    let maxStep = 0
    for (let index = 0; index < samples; index++) {
      let loose = false
      const { solution } = getWordForDay(index)
      const guesses = []
      let currentGuess = []
      let i = 0
      while (!isWordEqual(currentGuess, solution)) {
        const charStatuses = getStatusesForSolution(guesses, solution)
        const filteredWords = filterWords(charStatuses, guesses, solution)
        const letterFrequency = createLetterFrequencyObject(
          filteredWords,
          false
        )
        currentGuess = algo(filteredWords, letterFrequency)
        guesses.push(currentGuess)
        steps++
        i++
        if (i > 8) {
          loose = true
        }
      }
      if (i > maxStep) {
        maxStep = i
      }
      if (i < minStep) {
        minStep = i
      }
      if (loose) {
        looseCount++
      }
    }
    const endTime = performance.now()
    stats[algoName] = {
      steps,
      ratio: steps / samples,
      runTime: endTime - startTime,
      minStep,
      maxStep,
      looseCount,
    }
  })
  return stats
}

const filterWords = (charStatuses, guesses, solution) => {
  return words
    .filter((word) => {
      let shouldKeep = true
      guesses.forEach((guess) => {
        if (isWordEqual(guess, word)) {
          shouldKeep = false
          return false
        }
      })
      return shouldKeep
    }) // filter out guesses
    .filter((word) => word.every((letter) => charStatuses[letter] !== 'absent')) // Filter words containing absent letters
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
        const guessStatuses = getGuessStatusesForSolution(guess, solution)
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

const getGuessStatusesForSolution = (guess, solution) => {
  const solutionCharsTaken = solution.map((_) => false)

  const statuses = Array.from(Array(guess.length))

  // handle all correct cases first
  guess.forEach((letter, i) => {
    if (letter === solution[i]) {
      statuses[i] = 'correct'
      solutionCharsTaken[i] = true
      return
    }
  })

  guess.forEach((letter, i) => {
    if (statuses[i]) return

    if (!solution.includes(letter)) {
      // handles the absent case
      statuses[i] = 'absent'
      return
    }

    // now we are left with "present"s
    const indexOfPresentChar = solution.findIndex(
      (x, index) => x === letter && !solutionCharsTaken[index]
    )

    if (indexOfPresentChar > -1) {
      statuses[i] = 'present'
      solutionCharsTaken[indexOfPresentChar] = true
      return
    } else {
      statuses[i] = 'absent'
      return
    }
  })
  return statuses
}

const getStatusesForSolution = (guesses, solution) => {
  const charObj = {}

  guesses.forEach((word) => {
    word.forEach((letter, i) => {
      if (!solution.includes(letter)) {
        // make status absent
        return (charObj[letter] = 'absent')
      }

      if (letter === solution[i]) {
        //make status correct
        return (charObj[letter] = 'correct')
      }

      if (charObj[letter] !== 'correct') {
        //make status present
        return (charObj[letter] = 'present')
      }
    })
  })

  return charObj
}

const getWordForDay = (i) => {
  // January 1, 2022 Game Epoch
  const epochMs = new Date('January 1, 2022 00:00:00').valueOf()
  const msInDay = 86400000
  const now = epochMs + i * msInDay
  const index = Math.floor((now - epochMs) / msInDay)
  const indexModulo = index % WORDS.length
  const nextday = (index + 1) * msInDay + epochMs

  return {
    solution: WORDS[indexModulo],
    solutionIndex: indexModulo,
    tomorrow: nextday,
  }
}

export default createBigStats
