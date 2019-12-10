const CryptoJS = require('crypto-js')

const solve = () => {
  const lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('wordlist')
  })

  const foundWords = []
  // const str = ["poultry", "outwits", "ants"].map(s => s.split('').sort().join('')).join()
  // const str = "poultry outwits ants".split('').sort().join('')

  const str = "poultryoutwitsants".split('')
  lineReader.on('line', (line) => {
    // let sortedLine = line.toString().split('').sort().join('')
    // if (arr.some(s => s.split('').sort().join('') === sortedLine)) {
    line = line.toString().split('')
    if (line.every(s => str.includes(s) && (line.filter(l => l === s).length <= str.filter(x => x === s).length)))
      foundWords.push(line.join(''))
    // if (str.includes(sortedLine))
    // }
  }).on('close', () => {
    combineWords([...new Set(foundWords)], [])
    // combineWords([...new Set(foundWords)], [])
    // console.log([...new Set(foundWords)].length)
  })
}
// before anagram check. maybe not sort?
combineWords = (words, stack) => {
  if (stack.length === 3) {
    const secret = stack.join(' ')
    const hash = CryptoJS.MD5(secret).toString()
    if (hash === "e4820b45d2277f3844eac66c903e84be") {
      console.log("basic:", secret);
    }
  } else {
    for (let w of words) {
      if (!stack.includes(w)) {
        stack.push(w)
        combineWords(words, stack)
        stack.pop()
      }
    }
  }
}

solve();