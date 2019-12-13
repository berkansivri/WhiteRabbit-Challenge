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
      if (isValidWord(line))
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

function isValidWord(word, chars = {}) {
  for (let c of word) {
    chars[c] = (chars[c] || 0) + 1
    if (!(chars[c] <= anagramChars[c]))
      return false
  }
  return true
}

function addCharCounts(word, chars = {}) {
  let obj = { ...chars }
  if (isValidWord(word, obj)) {
    Object.assign(chars, obj)
    return true
  }
  return false
}

function removeCharCounts(word, chars) {
  for (let c of word) {
    chars[c] && chars[c]--
  }
}

function findPhrases(wordList) {
  let size = 3

  while (hashValues.length > 0) {

    console.log(`--- Checking with ${size} word ---`)
    for (let words of listFilter(wordList, size)) {
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

function* listFilter(arr, size) {
  const phrase = new Array(size).fill(''),
    anagramLength = Object.values(anagramChars).reduce((a, c) => a + c)
  let filteredArr = [],
    chars = {},
    len = 0

  for (let i = 0; i < arr.length; i++) {
    if (!addCharCounts(arr[i], chars)) continue
    phrase[0] = arr[i]

    for (let j = i; j < arr.length; j++) {
      if (!addCharCounts(arr[j], chars)) continue
      phrase[1] = arr[j]

      len = Object.values(chars).reduce((a, c) => a + c)
      filteredArr = arr.filter(word => {
        if (word.length === (anagramLength - len))
          if (isValidWord(word, { ...chars }))
            return true
        return false
      })

      for (let k = 0; k < filteredArr.length; k++) {
        phrase[2] = filteredArr[k]
        yield* permutation(phrase)
      }
      removeCharCounts(phrase[1], chars)
      phrase[1] = ""
    }
    chars = {}
  }
}


function* permutation(arr, size = arr.length) {
  const data = [],
    used = [],
    len = arr.length
  yield* permutationUtil(0)

  function* permutationUtil(index) {
    if (index === size)
      return yield data.join(' ')

    for (let i = 0; i < len; i++) {
      if (!used[i]) {
        used[i] = true
        data[index] = arr[i]
        yield* permutationUtil(index + 1)
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