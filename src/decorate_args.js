import path from 'node:path'
import fs from 'fs'
import { readdirSync } from 'node:fs'

function createCreateStreamFunc(filename) {
  try {
    fs.statSync(filename)
    return () => fs.createReadStream(filename)
  }
  catch (e) {
    if (e.message == "ENOENT: no such file or directory, stat '" + filename + "'")
      return () => { throw new Error('file not found') }
    else
      throw e
  }
}

function isWritableDirectory(directory) {
  const dir = path.resolve(directory)
  try {
    if (fs.statSync(dir).isDirectory()) {
      fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK)
      return true
    }
    return false
  }
  catch (e) {
    if (e.code === 'ENOTDIR' || e.code === 'ENOENT')
      return false

    console.error("Error testing if " + dir + " is a directory. Error: " + e.message)
    throw e
  }
}

function handleDirection(options, direction, directoryFunction) {
  if (options[direction]?.name) {
    if (isWritableDirectory(options[direction].name)) {
      directoryFunction(options)
    }
    else {
      options[direction].createStream = createCreateStreamFunc(options[direction].name)
    }
    options[direction].name = path.resolve(options[direction].name)
  }
}

export default {
  withCreateStreams(options) {
    handleDirection(options, 'in', function(options) {
      options.in.files = readdirSync(options.in.name)
    })
    handleDirection(options, 'out', function(options) {
      // If we are in here, out.name ends with a path separator
      const dirName = path.resolve(options.out.name)
      options.out.name = path.resolve(options.out.name, path.parse(options.in.name).name)
      try {
        fs.statSync(dirName)
        options.out.createStream = () => fs.createWriteStream(options.out.name)
      }
      catch (e) {
        console.error('Could not find directory: ' + dirName + ': ' + e.message)
        if (e.message == "ENOENT: no such file or directory, stat '" + dirName + "'")
          return () => { throw new Error('file not found') }
        else
          throw e
      }
    })
    return options
  }
}
