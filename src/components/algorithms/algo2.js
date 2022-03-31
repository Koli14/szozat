/*
 * Karakter poziciónként pontozza a szavakat
 */

const algo2 = (words, stats) => {
  const scores = words.map((word) => {
    const score = word.reduce(
      (partialSum, char, index) => partialSum + stats[char][index],
      0
    )
    return { word, score }
  })
  scores.sort((a, b) => b.score - a.score)
  return scores[0].word
}

export default algo2
