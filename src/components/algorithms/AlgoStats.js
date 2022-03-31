const AlgoStats = ({ algoStats }) => {
  const simlpeStat = []
  if (algoStats) {
    for (const [key, value] of Object.entries(algoStats)) {
      simlpeStat.push(
        <div key={key} className="text-sm text-gray-500 dark:text-gray-300">
          <h3 className="text-m grow font-bold dark:text-white">{key}</h3>
          <ul className="pl-4">
            <li>Átlag: {value.ratio}</li>
            <li>Futási idő: {value.runTime / 1000}s</li>
            <li>Legkevesebb lépés: {value.minStep}</li>
            <li>Legtöbb lépés: {value.maxStep}</li>
            <li>Ennyiszer vesztett volna: {value.looseCount}</li>
          </ul>
        </div>
      )
    }
  }
  return <>{simlpeStat}</>
}

export default AlgoStats
