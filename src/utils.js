import debugFunc from 'debug'
import fs from 'fs'

const debug = debugFunc('@foo-dog/utils')

function isSupportedFileExtension(fileExtWithDot) {
  return fileExtWithDot.toLowerCase() == '.pug' || fileExtWithDot.toLowerCase() == '.foo-dog' || fileExtWithDot.toLowerCase() == '.fd'
}

Array.prototype.peek = function () {
  return this[this.length - 1]
}

String.prototype.removeFromEnd = function (str) {
  return this.endsWith(str) ? this.substring(0, this.lastIndexOf(str)) : this.toString()
}

function exists(filename) {
  try {
    return (fs.accessSync(filename), true)
  } catch (e) {
    return false
  }
}

function directoryExists(dir) {
  try {
    // fs.lstatSync(destFileToWriteTo)
    fs.accessSync(dir, fs.constants.R_OK)
    return true
  } catch (e) { }
  return false
}

function createDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function simpleProjectRootDir() {
  const originalDir = process.cwd()
  let notFound = true
  while (notFound) {
    try {
      fs.accessSync('package.json', fs.constants.F_OK)
      notFound = false
    } catch (e) {
      process.chdir('..')
    }
  }
  const pkgDir = process.cwd()
  process.chdir(originalDir)
  return pkgDir
}

export {
  exists,
  isSupportedFileExtension,
  directoryExists,
  createDirectory,
  simpleProjectRootDir
}