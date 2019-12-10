const { MD5 } = require('crypto-js')
const { permutation } = require('generatorics')

const solve = (anagram) => {
  const lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('wordlist')
  })

  const unspaceAnagram =  anagram.replace(/ /g, "")

  const chars = {}
  for(let char of unspaceAnagram) {
    chars[char] = (chars[char] || 0) + 1
  }
  
  const foundWords = []

  lineReader.on('line', (line) => {
    const lineArr = line.toString().split('')
    const letterChars = {}
    
    lineArr.forEach(l => letterChars[l] = (letterChars[l] || 0) + 1)

    const isValid = lineArr.every(l => chars[l] && (letterChars[l] <= chars[l]))
    if(isValid) {
      foundWords.push(lineArr.join(''))
    }
  }).on('close', () => {
    const wordList = [...new Set(foundWords)].slice(0, 5)
    // combineWords(wordList, [], wordList.length, 0)
    // combineWords([1,2,3], [], 3, 0)
    permutation(wordList, 3).
  })
}

combineWords = (words, stack, len, i) => {
  if (stack.length === 3) {
    console.log(stack.join(''));
    const secret = stack.join(' ')
    stack = []
    // const hash = MD5(secret).toString()
    // if (hash === "e4820b45d2277f3844eac66c903e84be") {
    //   console.log("basic:", secret);
    // }
  } 
    for (; i < len; i++) {
      stack.push(words[i])
      combineWords(words, stack, len, i+1)
      i-=2
      stack.pop()
    }
}

solve("poultry outwits ants")