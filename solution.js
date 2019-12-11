const MD5 = require('crypto-js/md5')

const hashValues = [
  "e4820b45d2277f3844eac66c903e84be", // Easy
  "23170acc097c24edb98fc5488ab033fe", // Medium
  "665e5bcb0c20062fe8abaaf4628bb154" // Hard
]

const solve = (anagram) => {
  const lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('wordlist')
  })

  const unspaceAnagram = anagram.replace(/ /g, "")

  const chars = {}
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
      foundWords.push(lineArr)
    }
  }).on('close', () => {
    const wordList = [...new Set(foundWords.map(w => JSON.stringify(w)))].map(w => JSON.parse(w))

    for (let words of permutation(wordList, 3, chars)) {
      const md5Str = MD5(words).toString()
      if (hashValues.indexOf(md5Str) > -1) {
        console.log(words);
      }
    }
    console.log("----finish----");
  })
}

function* permutation(arr, size, chars) {
  let len = arr.length
  let data = []
  let indecesUsed = []
  let anagramChars = {...chars}
  let arrChars = {}
  let isValid = true
  yield* permutationUtil(0)

  function* permutationUtil(index) {
    if (index === size) {
      if (Object.values(anagramChars).every(x => !x))
      // if(Object.entries(chars).every(([char, count]) => anagramChars[char] === count))
        return yield data.map(d => d.join('')).join(' ')
      else return
    }

    for (let i = 0; i < len; i++) {
      if (!indecesUsed[i]) {

        arrChars = arr[i].reduce((obj, char) => {
          obj[char] = (obj[char] || 0) + 1
          return obj
        }, {})

        let charEntires = Object.entries(arrChars)

        isValid = charEntires.every(([char, count]) => anagramChars[char] > 0 && anagramChars[char] >= count)
        if (!isValid) continue

        indecesUsed[i] = true
        charEntires.forEach(([char, count]) => anagramChars[char] -= count)

        // data[index].forEach(c => anagramChars[c]++)     
        data[index] = arr[i]
        yield* permutationUtil(index + 1)
        indecesUsed[i] = false
        charEntires.forEach(([char, count]) => anagramChars[char] += count)
      }
    }
  }
}

solve("poultry outwits ants")