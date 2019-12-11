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
      console.log(words);
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

function checkCharCounts([char, count]) {
  return this[char] === count 
}

function* permutation(arr, size, anagramChars) {
  let len = arr.length
  let data = []
  let used = []
  let anagramCharEntries = Object.entries(anagramChars)
  let anagramLength = Object.values(anagramChars).reduce((a, c) => a + c)
  let charCounts = {}
  let isValid = true
  // let anagramChars = {...chars}
  // let arrChars = {}
  // let isValid = true
  console.time("permutation")
  yield* permute(0)
  
  function* permute(index, dataLen = 0) {
    if (index === size) {
      console.log(data.join(' '));
      if (anagramLength === dataLen) {
        let dataChars = data.reduce(getChars, {})
        isValid = anagramCharEntries.every(checkCharCounts.bind(dataChars))
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
        isValid = true
        charCounts = {}
        data[index] = arr[i]
        if(data.length === 3) {
          for(let word of data) {
            for (let l of word) {
              charCounts[l] = (charCounts[l] || 0) + 1
              if(charCounts[l] > anagramChars[l]) {
                isValid = false
                break
              }
            }
            if(!isValid) break
          }
          if(!isValid) {
            index--
            continue
          }
        } 
        
        
        used[i] = true
        yield* permute(index + 1, dataLen + data[index].length)
        used[i] = false
      }
    }
  }
}

solve("poultry outwits ants")