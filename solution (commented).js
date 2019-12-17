//    Challenge link: https://followthewhiterabbit.trustpilot.com/cs/step3.html

//                                                      Approximately Found Times
//    Easy secret phrase:     printout stout yawls            2.6   second
//    Medium secret phrase:   ty outlaws printouts            1.3   second
//    Hard secret phrase:     wu lisp not statutory           3.20  minute

/**
 * --- Ideas about algorithm ---,
 * Keep the character set of anagraf of the phrase.
 * Read the file (100k word) line by line and after checking strings with anagram of phrase populate an array.
 * Remove dublicates (1659 left) of the array and start to try crack hashes.
 * Start with iterate over wordlist to get a word and check conditions.
 *    Firstly check the length of the phrase (faster).
 *    Then check for the each character of the phrase with anagram characters.
 * If the phrase is valid, get permutation of the phrase and check for each phrase MD5 hash is valid.
 * Until there is no hashes left, re-iterate over word list and increase the word limit for secret phrase to join them with space.
 */

const fs = require('fs')
const readline = require('readline')
const md5 = require('md5')

const hashValues = [
  'e4820b45d2277f3844eac66c903e84be', // Easy
  '23170acc097c24edb98fc5488ab033fe', // Medium
  '665e5bcb0c20062fe8abaaf4628bb154', // Hard,
]
// keeps the character set of anagram globally.
let anagramChars = {}

const main = (fileName, anagram) => {
  console.time('found in')

  const lineReader = readline.createInterface({
    input: fs.createReadStream(fileName),
  })
  // parse anagram to characters
  anagramChars = getCharsOfAnagram(anagram)
  // keeps the valid words from wordlist file
  const foundWords = []

  lineReader
    .on('line', (line) => {
      // reading the file line by line and populate the array
      if (isValidWord(line)) foundWords.push(line)
    })
    .on('close', () => {
      // remove dublicates from the array and send them to real function
      findPhrases([...new Set(foundWords)])
    })
}

/**
 * @param {string} anagram / given anagram of the phrase
 * @returns {object} / object of characters like key-value pairs
 */
function getCharsOfAnagram(anagram) {
  const obj = {}
  const unspaceAnagram = anagram.replace(/ /g, '')

  for (const char of unspaceAnagram) {
    obj[char] = (obj[char] || 0) + 1
  }
  return Object.freeze(obj)
}

/**
 * @param {string} word / word to check for whether matches characters with anagram characters
 * @param {object} chars / all character set of current secret phrase candidate
 * @returns {object} / if the word is valid return character set for concatenate phrase, otherwise return undefined (falsy)
 */
function isValidWord(word = '', chars = {}) {
  for (const c of word) {
    chars[c] = (chars[c] || 0) + 1
    // return undefined (falsy), any time encounter with unrelated character, for performance reasons
    if (!(chars[c] <= anagramChars[c])) return
  }
  return chars
}

/**
 * @param {Array} wordList / filtered word list from the file
 */
function findPhrases(wordList) {
  let wordCount = 1
  while (hashValues.length > 0) {
    console.log(`--------- Checking with ${wordCount} word combination --------`)
    console.log(`===================================================`)

    for (const phrase of listFilter(wordList, wordCount)) {
      const md5String = md5(phrase).toString()
      const index = hashValues.indexOf(md5String)

      if (index > -1) {
        showResult(hashValues[index], phrase)
        hashValues.splice(index, 1)
        if (hashValues.length === 0) break
      }
    }

    wordCount++
  }
}

/**
 * @param {Array} wordList / filtered word list from the file
 * @param {object} wordCount / length for current secret phrase
 * @returns {function} / call for recursive generator function
 */
function* listFilter(wordList, wordCount) {
  const phrase = []
  const chars = {}
  const anagramLength = Object.values(anagramChars).reduce((a, c) => a + c) // length of given anagram phrase
  let filteredWordList
  let suitableLength

  function* fn(index) {
    if (index === wordCount - 1) {
      suitableLength = anagramLength - Object.values(chars).reduce((a, c) => a + c, 0) // length necessary length to react anagram length
      // filter the wordList to get all valid words
      filteredWordList = wordList.filter(
        // firstly check for length for rapidity and then check for is all character set are same as given phrase
        (word) => word.length === suitableLength && isValidWord(word, { ...chars })
      )
      // permutate all valid words with generator function and return to check hash
      for (const word of filteredWordList) {
        phrase[index] = word
        return yield* permutation(phrase)
      }
    } else {
      for (const word of wordList) {
        if (phrase[index]) {
          // each iteration sync character set of phrase with new words
          removeCharCounts(phrase[index], chars)
          phrase[index] = ''
        }
        // continue instantly if the word character set is not valid with given secret phrase
        if (!addCharCounts(word, chars)) continue

        phrase[index] = word
        yield* fn(index + 1)
      }
    }
  }
  yield* fn(0)
}

/**
 * @param {string} word / word to check for whether matches characters with anagram characters
 * @param {object} chars / all character set of current secret phrase candidate
 * @returns {object} / if the word is valid return combinated character set for phrase, otherwise return undefined (falsy)
 */
function addCharCounts(word = '', chars = {}) {
  const newChars = isValidWord(word, { ...chars }) // sending hard copy of chars for prevent mutate if is not valid
  if (newChars) return Object.assign(chars, newChars)
}

/**
 * @param {string} word / word to remove from secret phrase candidate character set
 * @param {object} chars / all character set of current secret phrase candidate
 */
function removeCharCounts(word = '', chars = {}) {
  for (const c of word) {
    chars[c]--
  }
}

/**
 * @param {Array} arr / array of current secret phrase candidate words
 */
function* permutation(arr) {
  const data = []
  const used = []
  const len = arr.length
  yield* perm(0)

  function* perm(index) {
    if (index === len) return yield data.join(' ')

    for (let i = 0; i < len; i++) {
      if (!used[i]) {
        used[i] = true
        data[index] = arr[i]
        yield* perm(index + 1)
        used[i] = false
      }
    }
  }
}

// shows pandora's box
function showResult(hash, phrase) {
  console.timeLog('found in', `\n\t ${hash} : ${phrase}`)
  console.log(`---------------------------------------------------`)
}

main('wordlist', 'poultry outwits ants')
