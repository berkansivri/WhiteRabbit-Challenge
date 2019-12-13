const MD5 = require('crypto-js/md5')

//    Easy secret phrase: printout stout yawls
//    Medium secret phrase: ty outlaws printouts
//    Hard secret phrase: wu lisp not statutory

const hashValues = [
  "e4820b45d2277f3844eac66c903e84be", // Easy
  "23170acc097c24edb98fc5488ab033fe", // Medium
  "665e5bcb0c20062fe8abaaf4628bb154" // Hard
]
let anagramChars = {}

const main = (fileName, anagram) => {
  console.time("found in")

  const lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(fileName)
  })

  anagramChars = getCharsOfAnagram(anagram)
  const foundWords = []

  lineReader.on('line', line => {
      if (checkCharCounts.call({}, line))
        foundWords.push(line)
    })
    .on('close', () => {
      findPhrases([...new Set(foundWords)])
    })
}

function getCharsOfAnagram(anagram) {
  const obj = {},
    unspaceAnagram = anagram.replace(/ /g, "")

  for (let char of unspaceAnagram) {
    obj[char] = (obj[char] || 0) + 1
  }
  return Object.freeze(obj)
}

function checkCharCounts(word) {
  for (let c of word) {
    this[c] = (this[c] || 0) + 1
    if (!(this[c] <= anagramChars[c]))
      return false
  }
  return true
}

function findPhrases(wordList) {
  let size = 1

  while (hashValues.length > 0) {

    console.log(`--- Checking with ${size} word ---`)
    for (let words of permutation(wordList, size)) {

      const md5String = MD5(words).toString()
      const index = hashValues.indexOf(md5String)
  
      if (index > -1) {
        showResult(hashValues[index], words)
        hashValues.splice(index, 1)
      }
    }
    size++
  }
}


function* permutation(arr, size) {
  const datasetLen = arr.length,
    data = [],
    used = [],
    anagramLength = Object.values(anagramChars).reduce((a, c) => a + c)
  let isValid = true
  yield* permute(0)

  function* permute(index, len = 0) {
    if (index === size) {
      if (isValid)
        return yield data.join(' ')
      else
        return
    }

    for (let i = 0; i < datasetLen; i++) {
      if (!used[i]) {
        isValid = true
        const wordLength = len + arr[i].length

        if ((wordLength === anagramLength)) {
          let tempData = [...data]
          tempData[index] = arr[i]
          isValid = tempData.every(checkCharCounts.bind({}))

          if (!isValid)
            continue
        } else
          isValid = false
        
        used[i] = true
        data[index] = arr[i]
        yield* permute(index + 1, wordLength)
        used[i] = false
      }
    }
  }
}

function showResult(hash, phrase) {
  console.timeEnd("found in")
  console.log(`${hash} : ${phrase}`)
  console.time("found in")
}

main("wordlist", "poultry outwits ants")