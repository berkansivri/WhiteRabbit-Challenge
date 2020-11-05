class CharMap {
  constructor(string = '') {
    this.chars = this.getChars(string);
    this.length = string.length;
  }

  getChars(string = '') {
    return string.split('').reduce((obj, char) => {
      obj[char] = (obj[char] || 0) + 1;
      return obj;
    }, {});
  }

  addChars(string = '') {
    const addingChars = this.getChars(string);
    for (const c in addingChars) {
      this.chars[c] = (this.chars[c] || 0) + addingChars[c];
    }
    this.length += string.length;
  }

  removeChars(string = '') {
    for (const c of string) {
      this.chars[c]--;
    }
    this.length -= string.length;
  }

  isValidAnagramForItself(string = '') {
    const obj = {};
    for (const c of string) {
      obj[c] = (obj[c] || 0) + 1;
      if (!(obj[c] <= this.chars[c])) return false;
    }
    return true;
  }

  isValidAnagramForGiven(anagramCharMap, string = '') {
    const obj = { ...this.chars };
    for (const c of string) {
      obj[c] = (obj[c] || 0) + 1;
      if (!(obj[c] <= anagramCharMap.chars[c])) return false;
    }
    return true;
  }
}

module.exports = CharMap;
