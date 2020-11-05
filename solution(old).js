//    Challenge link: https://followthewhiterabbit.trustpilot.com/cs/step3.html

const fs = require('fs');
const readline = require('readline');
const md5 = require('md5');

const hashValues = [
  'e4820b45d2277f3844eac66c903e84be', // Easy
  '23170acc097c24edb98fc5488ab033fe', // Medium
  '665e5bcb0c20062fe8abaaf4628bb154', // Hard,
];
let anagramChars = {};

const main = (fileName, anagram) => {
  console.time('found in');

  const lineReader = readline.createInterface({
    input: fs.createReadStream(fileName),
  });

  anagramChars = getCharsOfAnagram(anagram);
  const foundWords = [];

  lineReader
    .on('line', (line) => {
      if (isValidWord(line)) foundWords.push(line);
    })
    .on('close', () => {
      findPhrases([...new Set(foundWords)]);
    });
};

function getCharsOfAnagram(anagram) {
  const obj = {};
  const unspaceAnagram = anagram.replace(/ /g, '');

  for (const char of unspaceAnagram) {
    obj[char] = (obj[char] || 0) + 1;
  }
  return Object.freeze(obj);
}

function isValidWord(word = '', chars = {}) {
  for (const c of word) {
    chars[c] = (chars[c] || 0) + 1;
    if (!(chars[c] <= anagramChars[c])) return;
  }
  return chars;
}

function findPhrases(wordList) {
  let wordCount = 1;
  while (hashValues.length > 0) {
    console.log(`--------- Checking with ${wordCount} word combination --------`);
    console.log(`===================================================`);

    for (const phrase of listFilter(wordList, wordCount)) {
      const md5String = md5(phrase).toString();
      const index = hashValues.indexOf(md5String);

      if (index > -1) {
        showResult(hashValues[index], phrase);
        hashValues.splice(index, 1);
        if (hashValues.length === 0) break;
      }
    }

    wordCount++;
  }
}

function* listFilter(wordList, wordCount) {
  const phrase = [];
  const chars = {};
  const anagramLength = Object.values(anagramChars).reduce((a, c) => a + c);

  function* fn(index) {
    if (index === wordCount - 1) {
      const suitableLength = anagramLength - Object.values(chars).reduce((a, c) => a + c, 0);
      const filteredWordList = wordList.filter(
        (word) => word.length === suitableLength && isValidWord(word, { ...chars })
      );

      for (const word of filteredWordList) {
        phrase[index] = word;
        return yield* permutation(phrase);
      }
    } else {
      for (const word of wordList) {
        if (phrase[index]) {
          removeCharCounts(phrase[index], chars);
          phrase[index] = '';
        }

        if (!addCharCounts(word, chars)) continue;

        phrase[index] = word;
        yield* fn(index + 1);
      }
    }
  }
  yield* fn(0);
}

function addCharCounts(word = '', chars = {}) {
  const newChars = isValidWord(word, { ...chars });
  if (newChars) return Object.assign(chars, newChars);
}

function removeCharCounts(word = '', chars = {}) {
  for (const c of word) {
    chars[c]--;
  }
}

function* permutation(arr) {
  const data = [];
  const used = [];
  const len = arr.length;
  yield* perm(0);

  function* perm(index) {
    if (index === len) return yield data.join(' ');

    for (let i = 0; i < len; i++) {
      if (!used[i]) {
        used[i] = true;
        data[index] = arr[i];
        yield* perm(index + 1);
        used[i] = false;
      }
    }
  }
}

function showResult(hash, phrase) {
  console.timeLog('found in', `\n\t ${hash} : ${phrase}`);
  console.log(`---------------------------------------------------`);
}

main('wordlist', 'poultry outwits ants');
