/*
 * Karakter pozíciótól függetlenül pontozza a szavakat, kétszer szereplő betű 2szer számít
 */
const algo3 = (words, stats) => {
  const scores = words.map((word) => {
    const score = word.reduce((partialSum, a) => partialSum + stats[a], 0)
    return { word, score }
  })
  scores.sort((a, b) => b.score - a.score)
  return scores[0].word
}

export default algo3
