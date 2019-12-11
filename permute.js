var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js");
const readline = require('readline');
const fs = require('fs');
var _ = require('underscore-node');
var easySecretPhraseMD5Hash = 'e4820b45d2277f3844eac66c903e84be';
var mediumSecretPhraseMD5Hash = '23170acc097c24edb98fc5488ab033fe';
var hardSecretPhraseMD5Hash = '665e5bcb0c20062fe8abaaf4628bb154';
var testSecretPhraseMD5Hash = '8dae3a5858ad4f9d4973b55f8a3b5be6';
var anagramArray = ['p', 'o', 'u', 'l', 't', 'r', 'y', 'w', 'i', 's', 'a,', 'n'];
var anagram = 'poultry outwits ants';
var validWords = [];
var frequencies = {
  p: 1,
  o: 2,
  u: 2,
  l: 1,
  t: 4,
  r: 1,
  y: 1,
  w: 1,
  i: 1,
  s: 2,
  a: 1,
  n: 1
};

var initialize = function () {
  easySecretPhraseMD5Hash = 'e4820b45d2277f3844eac66c903e84be';
  mediumSecretPhraseMD5Hash = '23170acc097c24edb98fc5488ab033fe';
  hardSecretPhraseMD5Hash = '665e5bcb0c20062fe8abaaf4628bb154';
  testSecretPhraseMD5Hash = '8dae3a5858ad4f9d4973b55f8a3b5be6';
  anagramArray = ['p', 'o', 'u', 'l', 't', 'r', 'y', 'w', 'i', 's', 'a,', 'n'];
  anagram = 'poultry outwits ants';
  validWords = [];
  frequencies = buildFrequencyDictionary(anagram);
}

var http = require('http');
//create a server object:
http.createServer(function (req, res) {
  console.log(req.query);
  console.time("dbsave");
  initialize();
  readDataFile(req.query.param);
  res.writeHead(200, {
    'Content-Type': 'text/html'
  }); // http heade
  res.write('<h1>Hello World!<h1>'); //write a response
  res.end(); //end the response
}).listen(3000, function () {
  console.log("server start at port 3000"); //the server object listens on port 3000
});

var checkHash = function (hashToCheck) {
  if (hashToCheck === easySecretPhraseMD5Hash) {
    console.log('You guessed easiest secret phrase correctly! ' + hashToCheck);
  } else if (hashToCheck === mediumSecretPhraseMD5Hash) {
    console.log('You guessed medium secret phrase correctly! ' + hashToCheck);
  } else if (hashToCheck === hardSecretPhraseMD5Hash) {
    console.log('You guessed hardest secret phrase correctly! ' + hashToCheck);
  } else if (hashToCheck === testSecretPhraseMD5Hash) {
    console.log('You guessed test secret phrase correctly! ' + hashToCheck);
  }
};

var countOccurencies = function (word, subStr) {
  return (word.match(new RegExp(subStr, 'gi')) || []).length;
}

var buildFrequencyDictionary = function (word) {
  var spaceLessWord = withoutSpaces(word);
  var dict = _.countBy(spaceLessWord, function (letter) {
    return letter;
  });

  return dict;
}

var compareFreqDictionaries = function (dictToCompareTo) {
  var result = _.every(dictToCompareTo, function (count, letter) {

    return frequencies[letter] >= count; //_.contains(anagram, letter) && 

  });

  return result;
}

var allLettersInAnagram = function (word) {
  var comparisonResult = compareFreqDictionaries(buildFrequencyDictionary(word));
  return comparisonResult;
}

var buildPossibleSentences = function (startFrom) {
  var possibleWords = [];
  var index = validWords.indexOf(startFrom);
  wordFinder(possibleWords, index);
}

var wordFinder = function (possibleWords, startFromIndex) {
  var currentWord = possibleWords.join(' ');

  if (lengthOfWordWithoutSpaces(currentWord) == lengthOfWordWithoutSpaces(anagram)) {
    return;
  } else {
    for (var wordIterator = startFromIndex; wordIterator < validWords.length; wordIterator++) {
      var word = validWords[wordIterator];

      if ((_.contains(word, 'a') || _.contains(word, 'e') || _.contains(word, 'i') || _.contains(word, 'o') || _.contains(word, 'u') || _.contains(word, 'y')) &&
        word.length > 1) {

        possibleWords.push(word);
        var possibleWord = possibleWords.join(' ');

        if (wordIsStillValid(possibleWord) == true) {
          checkWordValidityAndPrint(possibleWord);

          wordFinder(possibleWords, 0);
        }

        possibleWords.splice(-1, 1);

      }


    }
  }
}

var lengthOfWordWithoutSpaces = function (word) {
  return withoutSpaces(word).length;
}

var withoutSpaces = function (word) {
  return word.split(' ').join('');
}

var wordIsStillValid = function (possibleWord) {
  return allLettersInAnagram(possibleWord);
}

var checkWordValidityAndPrint = function (possibleWord) {
  if (lengthOfWordWithoutSpaces(possibleWord) == lengthOfWordWithoutSpaces(anagram)) {
    var md5HashOfParameter = CryptoJS.MD5(possibleWord).toString();
    var lineToWrite = [possibleWord, md5HashOfParameter].join(' ');
    console.log(lineToWrite + '\r');
    checkHash(md5HashOfParameter);
    return true;
  }

  return false;
}

var readDataFile = function (startFrom) {
  validWords = [];
  const rl = readline.createInterface({
    input: fs.createReadStream('validWords.txt'),
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    validWords.push(line);
  }).on('close', () => {
    console.log('Valid words: ' + validWords.length);
    buildPossibleSentences(startFrom);
    console.timeEnd("dbsave");
  });
}