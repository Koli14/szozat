/*
 * Karakter pozíciótól függetlenül pontozza a szavakat, kétszer szereplő betű csak 1szer számít
 */

const algo2 = (words, stats) => {
  const scores = words.map((word) => {
    const unique = [...new Set(word)]
    const score = unique.reduce((partialSum, a) => partialSum + stats[a], 0)
    return { word, score }
  })
  scores.sort((a, b) => b.score - a.score)
  return scores[0].word
}

export default algo2
