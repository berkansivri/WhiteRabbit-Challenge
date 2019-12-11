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
      foundWords.push(lineArr.join(''))
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

function getChars(obj, word) {
  for (let l of word) {
    obj[l] = (obj[l] || 0) + 1
  }
  return obj
}

function checkChars([char, count]) {
  return this[char] === count 
}

function* permutation(arr, size, chars) {
  let len = arr.length
  let data = []
  let used = []
  let charEntries = Object.entries(chars)
  let anagramLength = Object.values(chars).reduce((a, c) => a + c)
  // let anagramChars = {...chars}
  // let arrChars = {}
  // let isValid = true
  console.time("permutation")
  yield* permutationUtil(0)
  
  function* permutationUtil(index, dataLen = 0) {
    if (index === size) {
      if (anagramLength === dataLen) {
        let dataChars = data.reduce(getChars, {})
        let isValid = charEntries.every(checkChars.bind(dataChars))
        if (isValid) {
          console.timeEnd("permutation")
          console.time("permutation")
          return yield data.join(' ')
        }
      }
      return
    }

    for (let i = 0; i < len; i++) {
      if (!used[i]) {

        // arrChars = {}
        // isValid = true
        // let word = arr[i]
        // for (let char of word) {
        //   if (anagramChars[char]) {
        //     arrChars[char] = (arrChars[char] || 0) + 1
        //     anagramChars[char]--
        //   }
        //   else {
        //     let entries = Object.entries(arrChars)
        //     if(entries.length > 0)
        //       entries.forEach(([char, count]) => anagramChars[char] += count)
        //     isValid = false
        //     break
        //   }
        // }

        // arrChars = arr[i].reduce((obj, char) => {
        //   obj[char] = (obj[char] || 0) + 1
        //   return obj
        // }, {})

        // let charEntires = Object.entries(arrChars)

        // isValid = charEntires.every(([char, count]) => anagramChars[char] > 0 && anagramChars[char] >= count)
        // if (!isValid) continue

        used[i] = true
        // charEntires.forEach(([char, count]) => anagramChars[char] -= count)

        data[index] = arr[i]
        yield* permutationUtil(index + 1, dataLen + data[index].length)
        used[i] = false
        // charEntires.forEach(([char, count]) => anagramChars[char] += count)
      }
    }
  }
}

solve("poultry outwits ants")