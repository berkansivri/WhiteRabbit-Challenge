/**
 * Code for the Trustpilot backend challenge.
 * 
 * This program will perform a type of dictionary attack against a list of MD5 hashes. An anagram of the hashed strings are know, which reduces the search space greatly.
 * 
 * After the program has run, the following secret phrases will have been found:
 * Easy secret phrase:     printout stout yawls
 * Medium secret phrase:   ty outlaws printouts
 * Hard secret phrase:     wu lisp not statutory
 */



 /**
 * Below is a bit of information about the program:
 * 
 * The program is written in Javascript with Node.js, not because it's the best tool for the job, the performance isn't as great as some other languages, but because it's one of the languages I'm most familiar with and as far as I can see on Stackshare, it's what is used at Trustpilot.
 * 
 * Also, I'm well aware that this specific challenge could have been solved with less code, but I wanted to create something that could handle large amounts of data. A stream is used for reading the wordlist line by line, loading each line into the dictionary. This way a very large wordlist can be loaded without using a lot of memory.
 * 
 * For the dictionary data structure, a trie (a type of tree) is used. Each node has a number of children with letters as keys. A node can also be marked as the end of a word. This way words can be stored very memory efficient. 
 * 
 * For example, the words "hey", "hell" and "hello" would be stored like this:
 *                    h
 *                    |
 *                    e
 *                   / \
 * end of a word -> y   l
 *                       \
 *                        l <- end of a word
 *                         \
 *                          o <- end of a word
 */

const fs = require("fs");
const md5 = require("md5");
const readline = require("readline");

function main() {
    // We just care about the letters, not the spaces, when creating anagrams.
    const anagramWithoutSpaces = "poultry outwits ants".replace(/ /g, "");
    // The hashes we want to find the phrases for.
    const hashes = [
        "e4820b45d2277f3844eac66c903e84be", // Easy
        "23170acc097c24edb98fc5488ab033fe", // Medium
        "665e5bcb0c20062fe8abaaf4628bb154"  // Hard
    ];
    // Dictionary root node.
    const dictionary = {
        children: {},
        isWord: false
    };
    // Read the word list then begin finding the phrases.
    readWordList(
        "wordlist",
        word => addWordToDictionary(
            word,
            dictionary,
            () => dictFilter(word, anagramWithoutSpaces)
        ),
        () => findPhrases(dictionary, anagramWithoutSpaces, hashes, 0)
    );
}

/**
 * Read a wordlist from a file, streaming each line to a callback.
 * 
 * @param {string} path Path to the wordlist.
 * @param {Function} lineCallback Called for each line in file.
 * @param {Function} closeCallback Called when file has been read.
 */
function readWordList(path, lineCallback, closeCallback) {
    fs.exists(path, (exists) => {
        if (!exists) {
            console.error(`Couldn't find wordlist with path "${path}"`);
            return;
        }
        console.log("Reading word list...");
        const readStream = fs.createReadStream(path);
        const rl = readline.createInterface({
            input: readStream
        });
        if (lineCallback) {
            rl.on("line", lineCallback);
        }
        if (closeCallback) {
            rl.on("close", closeCallback);
        }
    });
}

/**
 * Add a word to the dictionary tree.
 * 
 * @param {string} word Word to add to the dictionary.
 * @param {Object} dict Dictionary tree to add the word to.
 * @param {Function} filter Filter function for words. Words will only get added if returns true.
 */
function addWordToDictionary(word, dict, filter) {
    word = word.toLowerCase();
    if (!filter || !filter(word)) {
        return;
    }
    let currentNode = dict;
    for (let i = 0; i < word.length; i++) {
        if (!currentNode.children.hasOwnProperty(word[i])) {
            currentNode.children[word[i]] = {
                children: {},
                isWord: false
            };
        }
        currentNode = currentNode.children[word[i]];
    }
    currentNode.isWord = true;
}

/**
 * Find secret phrases based on a dictionary tree.
 * Each valid phrase is tested against a list of hashes. 
 * 
 * @param {string} dict Dictionary tree to test use.
 * @param {string} anagram Anagram of the secret phrases.
 * @param {Array} hashes Hashes to test secret phrases against.
 * @param {number} spaces Number of spaces in the phrase.
 */
function findPhrases(dict, anagramWithoutSpaces, hashes, spaces) {
    console.log(`Finding secret phrases with ${spaces} spaces...`);
    const fn = (node, phrase, letters, curSpaces) => {
        // Check hash of the phrase if it's a valid phrase
        if (letters.length === 0) {
            if (node.isWord && curSpaces === spaces && hashes.indexOf(md5(phrase)) > -1) {
                console.log(`${md5(phrase)} : ${phrase}`);
            }
            return;
        }
        // Branch out through the dictionary tree.
        for (const key of Object.keys(node.children)) {
            const index = letters.indexOf(key);
            if (index === -1) {
                continue;
            }
            const newLetters = letters.slice(0, index) + letters.slice(index + 1);
            fn(node.children[key], phrase + key, newLetters, curSpaces);
        }
        if (node.isWord && curSpaces < spaces) {
            fn(dict, phrase + " ", letters, curSpaces + 1);
        }
    };
    fn(dict, "", anagramWithoutSpaces, 0);
    console.log(`Finished checking all phrases with ${spaces} spaces.`);
    findPhrases(dict, anagramWithoutSpaces, hashes, spaces + 1);
}

/**
 * Returns true if the word could be in the secret phrase.
 * 
 * @param {string} word Word to check.
 * @returns {boolean} Whether to use the word.
 */
function dictFilter(word, anagramWithoutSpaces) {
    // Filter null and empty strings;
    if (!word) {
        return false;
    }
    // Filter words longer than anagram.
    if (word.length > anagramWithoutSpaces.length) {
        return false;
    }
    // Will take each letter of the word and remove it from a list of remaining letters.
    // If a letter doesn't exist in the remaining letters, the word cannot be part of the anagram.
    let letters = anagramWithoutSpaces;
    for (let i = 0; i < word.length; i++) {
        const index = letters.indexOf(word[i]);
        if (index === -1) {
            return false;
        }
        letters = letters.slice(0, index) + letters.slice(index + 1);
    }
    return true;
}

main();