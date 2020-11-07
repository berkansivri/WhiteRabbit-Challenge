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

const fs = require('fs');
const readline = require('readline');
const md5 = require('md5-jkmyers');
const CharMap = require('./CharMap');

const hashValues = [
  'e4820b45d2277f3844eac66c903e84be', // Easy
  '23170acc097c24edb98fc5488ab033fe', // Medium
  '665e5bcb0c20062fe8abaaf4628bb154', // Hard,
];

/**
 * @param {Array} arr / array of current secret phrase candidate words
 */
function* permutation(arr) {
  if (arr.length === 1) return yield arr;

  const [first, ...rest] = arr;
  for (const perm of permutation(rest)) {
    for (let i = 0; i < arr.length; i++) {
      const start = perm.slice(0, i);
      const rest = perm.slice(i);
      yield [...start, first, ...rest];
    }
  }
}

// shows pandora's box
function showResult(hash, phrase) {
  console.timeLog('found in', `\n\t ${hash} : ${phrase}`);
  console.log(`---------------------------------------------------`);
}

/**
 * @param {Array} wordList / filtered word list from the file
 * @param {object} wordCount / length for current secret phrase
 * @returns {function} / call for recursive generator function
 */
function* listFilter(wordList, wordCount, anagramCharMap) {
  const phrase = [];
  const charMap = new CharMap();

  function* fn(index) {
    if (index === wordCount - 1) {
      const suitableLength = anagramCharMap.length - charMap.length; // length necessary length to reach total anagram length
      // filter the wordList to get all valid words
      const filteredWordList = wordList.filter(
        // firstly check for length for rapidity and then check for is all character set are same as given phrase
        (word) => word.length === suitableLength && charMap.isValidAnagramForGiven(anagramCharMap, word)
      );
      // permutate all valid words with generator function and yield to check hash
      for (const word of filteredWordList) {
        phrase[index] = word;
        yield* permutation(phrase);
      }
    } else {
      for (const word of wordList) {
        if (phrase[index]) {
          // each iteration sync character set of phrase with new words
          charMap.removeChars(phrase[index]);
          phrase[index] = '';
        }
        // continue instantly if the word character set is not valid with given secret phrase
        if (charMap.isValidAnagramForGiven(anagramCharMap, word)) {
          charMap.addChars(word);
          phrase[index] = word;
          yield* fn(index + 1);
        }
      }
    }
  }
  yield* fn(0);
}

/**
 * @param {Array} wordList // filtered word list from the file
 */
function findPhrases(wordList, anagramCharMap) {
  let wordCount = 1;

  while (hashValues.length > 0) {
    console.log(`--------- Checking with ${wordCount} word combination --------`);
    console.log(`===================================================`);

    for (const phrase of listFilter(wordList, wordCount, anagramCharMap)) {
      const hash = md5(phrase.join(' '));
      const index = hashValues.indexOf(hash);

      if (index > -1) {
        showResult(hashValues[index], phrase);
        hashValues.splice(index, 1);
        if (hashValues.length === 0) break;
      }
    }

    wordCount++;
  }
}

const main = (fileName, anagramOfThePhrase) => {
  console.time('found in');

  const anagramCharMap = new CharMap(anagramOfThePhrase.replace(/ /g, ''));

  const lineReader = readline.createInterface({
    input: fs.createReadStream(fileName),
  });
  // keeps the valid words from wordlist file
  const foundWords = [];

  lineReader
    .on('line', (word) => {
      // reading the file line by line and populate the array with suitable words for anagram of given phrase
      if (anagramCharMap.isValidAnagramForItself(word)) {
        foundWords.push(word);
      }
    })
    .on('close', () => {
      // remove dublicates from the array and send them to find function with character map of given anagram phrase
      findPhrases([...new Set(foundWords)], anagramCharMap);
    });
};

main('wordlist', 'poultry outwits ants');
