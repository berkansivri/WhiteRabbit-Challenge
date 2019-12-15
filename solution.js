//    Challenge link: https://followthewhiterabbit.trustpilot.com/cs/step3.html
//    Easy secret phrase: printout stout yawls
//    Medium secret phrase: ty outlaws printouts
//    Hard secret phrase: wu lisp not statutory


const MD5 = require('md5')

const hashValues = [
  "e4820b45d2277f3844eac66c903e84be", // Easy
  "23170acc097c24edb98fc5488ab033fe", // Medium
  "665e5bcb0c20062fe8abaaf4628bb154", // Hard,
  "96ec6e6479abf6421446b34b4954ff10" // dublicate 
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

// function* getChars(word, chars) {
//   for (let c of chars) {
//     chars[c] = (chars[c] || 0) + 1
//     yield chars
//   }
// }

function isValidWord(word = "", chars = {}) {
  for (let c of word) {
    chars[c] = (chars[c] || 0) + 1
    if (!(chars[c] <= anagramChars[c]))
      return false
  }
  return true
}

function addCharCounts(word = "", chars = {}) {
  let obj = { ...chars }
  if (isValidWord(word, obj)) {
    Object.assign(chars, obj)
    return true
  }
  return false
}

function removeCharCounts(word = "", chars = {}) {
  for (let c of word) {
    chars[c] && chars[c]--
  }
}

function findPhrases(wordList) {
  let wordCount = 1
  while (hashValues.length > 0) {

    console.log(`--------- Checking with ${wordCount} word combination --------`)
    console.log(`===================================================`)
    
    for (let phrase of listFilter(wordList, wordCount)) {
      const md5String = MD5(phrase).toString()
      const index = hashValues.indexOf(md5String)

      if (index > -1) {
        showResult(hashValues[index], phrase)
        hashValues.splice(index, 1)
      }
    }
    wordCount++
  }
}

function* listFilter(wordList, wordCount) {
  const phrase = [],
    anagramLength = Object.values(anagramChars).reduce((a, c) => a + c)
  let filteredArr,
    suitableLength,
    chars = {}

  function* fn(index)   {
    if (index === wordCount - 1) {

      suitableLength = anagramLength - Object.values(chars).reduce((a, c) => a + c, 0)
      let copyChars = { ...chars }
      filteredArr = wordList.filter(word => word.length === suitableLength && isValidWord(word, { ...chars }))

      if(filteredArr.length > 0) {
        for (let j = 0; j < filteredArr.length; j++) {
          phrase[index] = filteredArr[j]
          return yield* permutation(phrase)
        }
      }

    } else {

      for (let i = 0; i < wordList.length; i++) {
        if(phrase[index]) {
          removeCharCounts(phrase[index], chars)
        }
        phrase[index] = ""
        if (!addCharCounts(wordList[i], chars)) continue
        phrase[index] = wordList[i]
        yield* fn(index + 1)
      }
    }
  } 
  yield* fn(0)
}


// function* permutation(arr, size = arr.length) {
//   const data = [],
//     used = [],
//     len = arr.length
//   yield* perm(0)

//   function* perm(index) {
//     if (index === size)
//       return yield data.join(' ')

//     for (let i = 0; i < len; i++) {
//       if (!used[i]) {
//         used[i] = true
//         data[index] = arr[i]
//         yield* perm(index + 1)
//         used[i] = false
//       }
//     }
//   }
// }

function* permutation(arr) {
  let size = arr.length
  yield* heapsUtil(0)
  function* heapsUtil(index) {
    if (index === size) {
      return yield arr.join(' ')
    }

    for (let j = index; j < size; j++) {
      swap(arr, index, j)
      yield* heapsUtil(index + 1)
      swap(arr, index, j)
    }
  }
}

function swap(arr, i, j) {
  let temp = arr[j]
  arr[j] = arr[i]
  arr[i] = temp
  return arr
}

function showResult(hash, phrase) {
  console.timeLog("found in", `\n\t ${hash} : ${phrase}`)
  console.log(`---------------------------------------------------`)
}

main("wordlist", "poultry outwits ants")