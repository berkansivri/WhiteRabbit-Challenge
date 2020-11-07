//    Challenge link: https://followthewhiterabbit.trustpilot.com/cs/step3.html

//                                                      Approximately Found Times
//    Easy secret phrase:     printout stout yawls            3.4   second
//    Medium secret phrase:   ty outlaws printouts            1.5   second
//    Hard secret phrase:     wu lisp not statutory           2.40  minute

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
      yield [...perm.slice(0, i), first, ...perm.slice(i)];
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
function* generatePhraseFromList(wordList, anagramCharMap, wordCount) {
  const phrase = [];
  const phraseCharMap = new CharMap();

  function* fn(index) {
    if (index === wordCount - 1) {
      const suitableLength = anagramCharMap.length - phraseCharMap.length; // length necessary length to reach total anagram length
      // filter the wordList to get all valid words
      const filteredWordList = wordList.filter(
        // firstly check for length for rapidity and then check for is all character set are same as given phrase
        (word) => word.length === suitableLength && phraseCharMap.isValidAnagramForGiven(anagramCharMap, word)
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
          phraseCharMap.removeChars(phrase[index]);
          phrase[index] = '';
        }
        // if the current phrase candidate suitable for given anagram yield to the findPhrases function for check hash
        if (phraseCharMap.isValidAnagramForGiven(anagramCharMap, word)) {
          phraseCharMap.addChars(word);
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

    for (const phrase of generatePhraseFromList(wordList, anagramCharMap, wordCount)) {
      const hash = md5(phrase.join(' '));
      const index = hashValues.indexOf(hash);

      if (index > -1) {
        showResult(hashValues[index], phrase.join(' '));
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
