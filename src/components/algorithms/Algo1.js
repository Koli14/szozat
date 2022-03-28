import { useState } from 'react'
import { CharValue, getStatuses, Word, isCharValue } from '../../lib/statuses'

const Algo1 = ({ guesses }) => {
  const charStatuses = getStatuses(guesses)
  console.log(charStatuses.length)
  const [word, setWord] = useState('csirke')

  return <div className="text-sm text-gray-500 dark:text-gray-300">{word}</div>
}

export default Algo1
