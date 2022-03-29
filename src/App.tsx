import {
  InformationCircleIcon,
  ChartBarIcon,
  PlusCircleIcon,
  CogIcon,
} from '@heroicons/react/outline'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Alert } from './components/alerts/Alert'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { InfoModal } from './components/modals/InfoModal'
import { StatsModal } from './components/modals/StatsModal'
import {
  isWordInWordList,
  isWinningWord,
  solution,
  isWordEqual,
  findFirstUnusedReveal,
} from './lib/words'
import { SettingsModal } from './components/modals/SettingsModal'
import {
  GAME_TITLE,
  WIN_MESSAGES,
  GAME_COPIED_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
  CORRECT_WORD_MESSAGE,
} from './constants/strings'
import {
  MAX_WORD_LENGTH,
  MAX_CHALLENGES,
  ALERT_TIME_MS,
  REVEAL_TIME_MS,
  GAME_LOST_INFO_DELAY,
} from './constants/settings'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  setStoredIsHighContrastMode,
  getStoredIsHighContrastMode,
} from './lib/localStorage'
import { CharValue, Word } from './lib/statuses'
import { CreatePuzzleModal } from './components/modals/CreatePuzzleModal'
import { DOUBLE_LETTERS } from './lib/hungarianWordUtils'
import { getPuzzleName } from './lib/share'

import { Algo1, Algo2, Algo3 } from './components/algorithms'

import './App.css'

function App() {
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches

  const [currentGuess, setCurrentGuess] = useState<Word>([])
  const [isGameWon, setIsGameWon] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isHardModeAlertOpen, setIsHardModeAlertOpen] = useState(false)
  const [isCreatePuzzleModalOpen, setIsCreatePuzzleModalOpen] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const [currentRowClass, setCurrentRowClass] = useState('')
  const [shareComplete, setShareComplete] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  const [isGameLost, setIsGameLost] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme')
      ? localStorage.getItem('theme') === 'dark'
      : prefersDarkMode
      ? true
      : false
  )
  const [isHighContrastMode, setIsHighContrastMode] = useState(
    getStoredIsHighContrastMode()
  )
  const [successAlert, setSuccessAlert] = useState('')
  const [isRevealing, setIsRevealing] = useState(false)
  const [guesses, setGuesses] = useState<Word[]>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (loaded == null) {
      setIsInfoModalOpen(true)
    }
    if (loaded == null || !isWordEqual(loaded.solution, solution)) {
      return []
    }
    const gameWasWon = loaded.guesses.some((guess) =>
      isWordEqual(guess, solution)
    )
    if (gameWasWon) {
      setIsGameWon(true)
    }
    if (loaded.guesses.length === MAX_CHALLENGES && !gameWasWon) {
      setIsGameLost(true)
    }
    return loaded.guesses
  })
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 })

  const gridContainerRef = useRef<HTMLDivElement>(null)

  const [stats, setStats] = useState(() => loadStats())

  const [isHardMode, setIsHardMode] = useState(
    localStorage.getItem('gameMode')
      ? localStorage.getItem('gameMode') === 'hard'
      : false
  )

  const [isMissingPreviousLetters, setIsMissingPreviousLetters] =
    useState(false)
  const [missingLetterMessage, setIsMissingLetterMessage] = useState('')

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isHighContrastMode) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [isDarkMode, isHighContrastMode])

  const handleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  const handleHardMode = (isHard: boolean) => {
    if (guesses.length === 0 || localStorage.getItem('gameMode') === 'hard') {
      setIsHardMode(isHard)
      localStorage.setItem('gameMode', isHard ? 'hard' : 'normal')
    } else {
      setIsHardModeAlertOpen(true)
      return setTimeout(() => {
        setIsHardModeAlertOpen(false)
      }, ALERT_TIME_MS)
    }
  }

  const handleHighContrastMode = (isHighContrast: boolean) => {
    setIsHighContrastMode(isHighContrast)
    setStoredIsHighContrastMode(isHighContrast)
  }

  useEffect(() => {
    const handleResize = () => {
      if (gridContainerRef.current == null) {
        return
      }
      const gridContainerHeight = gridContainerRef.current.clientHeight
      const gridWidth = Math.min(
        Math.floor(gridContainerHeight * (MAX_WORD_LENGTH / MAX_CHALLENGES)),
        350
      )
      const gridHeight = Math.floor(
        (MAX_CHALLENGES * gridWidth) / MAX_WORD_LENGTH
      )
      setGridSize({ width: gridWidth, height: gridHeight })
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    setTimeout(handleResize, 500)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setGridSize])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    saveGameStateToLocalStorage({ guesses, solution })
  }, [guesses])

  useEffect(() => {
    if (isGameWon) {
      setTimeout(() => {
        setSuccessAlert(
          WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
        )
        setTimeout(() => {
          setSuccessAlert('')
          setIsStatsModalOpen(true)
        }, ALERT_TIME_MS)
      }, REVEAL_TIME_MS * MAX_WORD_LENGTH)
    }
    if (isGameLost) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }, GAME_LOST_INFO_DELAY)
    }
  }, [isGameWon, isGameLost])

  const onChar = (value: CharValue) => {
    if (guesses.length >= MAX_CHALLENGES || isGameWon) {
      return
    }
    const currentGuessLastChar =
      currentGuess.length > 0
        ? currentGuess[currentGuess.length - 1]
        : undefined
    const currentGuessPenultimateChar =
      currentGuess.length > 1
        ? currentGuess[currentGuess.length - 2]
        : undefined
    const potentialDoubleLetter =
      currentGuessLastChar === undefined
        ? undefined
        : `${currentGuessLastChar}${value}`
    const potentialTripleLetter =
      currentGuessLastChar === undefined ||
      currentGuessPenultimateChar === undefined
        ? undefined
        : `${currentGuessPenultimateChar}${currentGuessLastChar}${value}`
    const tripleMatch = DOUBLE_LETTERS.find(
      (doubleLetter) =>
        doubleLetter.form.toUpperCase() === potentialTripleLetter
    )
    const newGuessWithTriple =
      tripleMatch === undefined
        ? undefined
        : ([
            ...currentGuess.slice(0, currentGuess.length - 2),
            ...tripleMatch.letters.map((letter) => letter.toUpperCase()),
          ] as Word)
    if (
      newGuessWithTriple !== undefined &&
      newGuessWithTriple.length <= MAX_WORD_LENGTH
    ) {
      setCurrentGuess(newGuessWithTriple)
      return
    }
    const doubleMatch = DOUBLE_LETTERS.find(
      (doubleLetter) =>
        doubleLetter.form.toUpperCase() === potentialDoubleLetter
    )
    const newGuessWithDouble =
      doubleMatch === undefined
        ? undefined
        : ([
            ...currentGuess.slice(0, currentGuess.length - 1),
            ...doubleMatch.letters.map((letter) => letter.toUpperCase()),
          ] as Word)
    if (
      newGuessWithDouble !== undefined &&
      newGuessWithDouble.length <= MAX_WORD_LENGTH
    ) {
      setCurrentGuess(newGuessWithDouble)
      return
    }
    const newGuessWithSingle = [...currentGuess, value]
    if (newGuessWithSingle.length <= MAX_WORD_LENGTH) {
      setCurrentGuess(newGuessWithSingle)
      return
    }
  }

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1))
  }

  const onEnter = () => {
    if (isGameWon || isGameLost) {
      return
    }
    if (!(currentGuess.length === MAX_WORD_LENGTH)) {
      setIsNotEnoughLetters(true)
      setCurrentRowClass('jiggle')
      return setTimeout(() => {
        setIsNotEnoughLetters(false)
        setCurrentRowClass('')
      }, ALERT_TIME_MS)
    }

    if (
      !isWordInWordList(currentGuess) &&
      !isWordEqual(currentGuess, solution)
    ) {
      setIsWordNotFoundAlertOpen(true)
      setCurrentRowClass('jiggle')
      return setTimeout(() => {
        setIsWordNotFoundAlertOpen(false)
        setCurrentRowClass('')
      }, ALERT_TIME_MS)
    }

    // enforce hard mode - all guesses must contain all previously revealed letters
    if (isHardMode) {
      const firstMissingReveal = findFirstUnusedReveal(currentGuess, guesses)
      if (firstMissingReveal) {
        setIsMissingLetterMessage(firstMissingReveal)
        setIsMissingPreviousLetters(true)
        setCurrentRowClass('jiggle')
        return setTimeout(() => {
          setIsMissingPreviousLetters(false)
          setCurrentRowClass('')
        }, ALERT_TIME_MS)
      }
    }

    setIsRevealing(true)
    // turn this back off after all
    // chars have been revealed
    setTimeout(() => {
      setIsRevealing(false)
    }, REVEAL_TIME_MS * MAX_WORD_LENGTH)

    const winningWord = isWinningWord(currentGuess)

    if (
      currentGuess.length === MAX_WORD_LENGTH &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess([])

      if (winningWord) {
        setStats(addStatsForCompletedGame(stats, guesses.length))
        return setIsGameWon(true)
      }

      if (guesses.length === MAX_CHALLENGES - 1) {
        setStats(addStatsForCompletedGame(stats, guesses.length + 1))
        setIsGameLost(true)
      }
    }
  }

  const handleShareCopySuccess = useCallback(() => {
    setShareComplete(true)
    setTimeout(() => {
      setShareComplete(false)
    }, ALERT_TIME_MS)
  }, [])

  const handleShareFailure = useCallback(() => {
    setShareFailed(true)
    setTimeout(() => {
      setShareFailed(false)
    }, ALERT_TIME_MS)
  }, [])
  return (
    <>
      <Alert message={NOT_ENOUGH_LETTERS_MESSAGE} isOpen={isNotEnoughLetters} />
      <Alert
        message={WORD_NOT_FOUND_MESSAGE}
        isOpen={isWordNotFoundAlertOpen}
      />
      <Alert message={missingLetterMessage} isOpen={isMissingPreviousLetters} />
      <Alert
        message={CORRECT_WORD_MESSAGE(solution)}
        isOpen={isGameLost && !isRevealing}
      />
      <Alert
        message={successAlert}
        isOpen={successAlert !== ''}
        variant="success"
        topMost={true}
      />
      <Alert
        message={GAME_COPIED_MESSAGE}
        isOpen={shareComplete}
        variant="success"
      />
      <Alert
        message="Nem sikerült a megosztás - lehet, hogy beágyazott böngészőt használsz?"
        isOpen={shareFailed}
        variant="warning"
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        handleClose={() => setIsInfoModalOpen(false)}
      />
      <StatsModal
        isOpen={isStatsModalOpen}
        handleClose={() => setIsStatsModalOpen(false)}
        guesses={guesses}
        gameStats={stats}
        isGameLost={isGameLost}
        isGameWon={isGameWon}
        handleShareCopySuccess={handleShareCopySuccess}
        handleShareFailure={handleShareFailure}
        isHardMode={isHardMode}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        handleClose={() => setIsSettingsModalOpen(false)}
        isHardMode={isHardMode}
        handleHardMode={handleHardMode}
        isDarkMode={isDarkMode}
        handleDarkMode={handleDarkMode}
        isHardModeErrorModalOpen={isHardModeAlertOpen}
        isHighContrastMode={isHighContrastMode}
        handleHighContrastMode={handleHighContrastMode}
      />
      <CreatePuzzleModal
        isOpen={isCreatePuzzleModalOpen}
        handleClose={() => setIsCreatePuzzleModalOpen(false)}
      />
      <div className="transition-all flex justify-center items-center">
        <div className="flex flex-col h-[100vh] pt-2 w-[100%] max-w-[500px] sm:px-6 lg:px-8">
          <div className="flex w-80 mx-auto items-center mb-2">
            <h1 className="text-xl grow font-bold dark:text-white">
              {GAME_TITLE} - {getPuzzleName()}
            </h1>
            <InformationCircleIcon
              className="h-6 w-6 mr-2 cursor-pointer dark:stroke-white"
              onClick={() => setIsInfoModalOpen(true)}
            />
            <ChartBarIcon
              className="h-6 w-6 mr-2 cursor-pointer dark:stroke-white"
              onClick={() => setIsStatsModalOpen(true)}
            />
            <PlusCircleIcon
              className="h-6 w-6 mr-2 cursor-pointer dark:stroke-white"
              onClick={() => setIsCreatePuzzleModalOpen(true)}
            />
            <CogIcon
              className="h-6 w-6 cursor-pointer dark:stroke-white"
              onClick={() => setIsSettingsModalOpen(true)}
            />
          </div>
          <div
            ref={gridContainerRef}
            className="grow flex justify-center items-center overflow-hidden mb-2"
          >
            <Grid
              guesses={guesses}
              currentGuess={currentGuess}
              size={gridSize}
              isRevealing={isRevealing}
              currentRowClassName={currentRowClass}
            />
          </div>
          <div className="pb-2">
            <Keyboard
              onChar={onChar}
              onDelete={onDelete}
              onEnter={onEnter}
              guesses={guesses}
              isRevealing={isRevealing}
            />
          </div>
        </div>
        <div className="flex justify-content items-center flex-col">
          <h1 className="text-xl grow font-bold dark:text-white">
            Statisztikák
          </h1>
          <div className="grid grid-cols-2 gap-4">
            <div className="my-2 mx-4">
              <h2
                className="text-m grow font-bold dark:text-white"
                title="Karakter pozíciótól függetlenül pontozza a szavakat, kétszer szereplő betű csak 1szer számít"
              >
                Legsárgább szó
              </h2>
              <Algo1 guesses={guesses} />
            </div>
            <div className="my-2 mx-4">
              <h2
                className="text-m grow font-bold dark:text-white"
                title="Karakter poziciónként pontozza a szavakat"
              >
                Legvalószínűbb szó
              </h2>
              <Algo2 guesses={guesses} />
            </div>
            <div className="my-2 mx-4">
              <h2
                className="text-m grow font-bold dark:text-white"
                title="Karakter pozíciótól függetlenül pontozza a szavakat, kétszer szereplő betű 2szer számít"
              >
                Legbénább algoritmus
              </h2>
              <Algo3 guesses={guesses} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
