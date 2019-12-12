const MD5 = require('crypto-js/md5')

//    Easy secret phrase: printout stout yawls
//    Medium secret phrase: ty outlaws printouts
//    Hard secret phrase: wu lisp not statutory
const hashValues = [
  "e4820b45d2277f3844eac66c903e84be", // Easy
  "23170acc097c24edb98fc5488ab033fe", // Medium
  "665e5bcb0c20062fe8abaaf4628bb154" // Hard
]
const chars = {}

const solve = (anagram) => {
  const lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('wordlist')
  })

  const unspaceAnagram = anagram.replace(/ /g, "")

  for (let char of unspaceAnagram) {
    chars[char] = (chars[char] || 0) + 1
  }

  const foundWords = []

  lineReader.on('line', (line) => {
    const lineArr = line.toString().split('')
    const letterChars = {}

    lineArr.forEach(l => letterChars[l] = (letterChars[l] || 0) + 1)

    const isValid = lineArr.every(l => chars[l] && (letterChars[l] <= chars[l]))
    if (isValid) {
      foundWords.push(lineArr.join(''))
    }
  }).on('close', () => {
    const wordList = [...new Set(foundWords.map(w => JSON.stringify(w)))].map(w => JSON.parse(w))
    console.time("solution")
    for (let words of permutation(wordList, 3, chars)) {
      console.log(words);
      const md5Str = MD5(words).toString()
      if (hashValues.indexOf(md5Str) > -1) {
        console.timeEnd("solution");
        console.log(words);
        console.time("solution");
      }
    }
  })
}

function getChars(obj, word) {
  for (let l of word) {
    obj[l] = (obj[l] || 0) + 1
  }
  return obj
}

function checkCharCounts(word) {
  for (let c of word) {
    this[c] = (this[c] || 0) + 1
    if (!(this[c] <= chars[c])) return false
  }
  return true
}

function* permutation(arr, size, anagramChars) {
  let datasetLen = arr.length
  let data = []
  let used = []
  let anagramLength = Object.values(anagramChars).reduce((a, c) => a + c)
  let isValid = true
  yield* permute(0)

  function* permute(index, len = 0) {
    if (index === size) {
      if (isValid) return yield data.join(' ')
      return
    }
    for (let i = 0; i < datasetLen; i++) {
      if (!used[i]) {
        
        isValid = true
        let wordLength = len + arr[i].length

        if ((wordLength === anagramLength)) {
          charCounts = {}
          let tempData = [...data]
          tempData[index] = arr[i]

          isValid = tempData.every(checkCharCounts.bind(charCounts))
          if (!isValid) continue
        } else isValid = false
        
        used[i] = true
        data[index] = arr[i]
        yield* permute(index + 1, wordLength)
        used[i] = false
      }
    }
  }
}

solve("poultry outwits ants")
// solve("abc")