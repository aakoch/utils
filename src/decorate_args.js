import path from 'node:path'
import fs from 'fs'
import { readdirSync } from 'node:fs'
import { exists } from '../src/utils.js'
import debugFunc from 'debug'
const debug = debugFunc('@foo-dog/utils:decorate_args')

function createCreateReadStreamFunc(filename) {
  try {
    debug('createCreateReadStreamFunc(): looking for', filename)
    const stat = fs.statSync(filename)
    debug('createCreateReadStreamFunc(): found', filename)
    debug('createCreateReadStreamFunc(): stat.isDirectory()=', stat.isDirectory())
    return () => fs.createReadStream(filename)
  }
  catch (e) {
    debug('createCreateReadStreamFunc(): didn\'t find', filename)
    if (e.message == "ENOENT: no such file or directory, stat '" + filename + "'")
      return () => { throw new Error('file not found') }
    else
      throw e
  }
}

function isWritableDirectory(dir) {
  try {

    debug('isWritableDirectory(): dir=', dir)
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

function createObject(inOrOutput, processStreamFunc, fileFunc, dirFunc) {
  
  if (inOrOutput === 'stdin' || inOrOutput === 'stdout') {
    return processStreamFunc()
  }
  else {
    const resolvedName = path.resolve(inOrOutput)
    if (isWritableDirectory(resolvedName)) {
      debug('createObject(): ' + resolvedName + ' is a writable directory')
      return dirFunc(resolvedName)
    }
    else {
      debug('createObject(): ' + resolvedName + ' is not a writable directory')
      return fileFunc(resolvedName)
    }
  }

  // options, direction, directoryFunction) {

  // if (options[direction]?.name) {
  //   const resolvedName = path.resolve(options[direction].name)
  //   if (isWritableDirectory(resolvedName)) {
  //     options[direction].isDir = () => true
  //     directoryFunction(options)
  //   }
  //   else {
  //     options[direction].isDir = () => false
  //     if (direction === 'in') {
  //       options[direction].createStream = createReadCreateStreamFunc(resolvedName)
  //     }
  //   }
  //   options[direction].name = options[direction]?.name === 'stdin' || options[direction]?.name === 'stdout' ? options[direction]?.name : resolvedName
  // }
}

function defaultInName(obj) {
  const inName = obj?.in?.name ?? 'stdin'
  return inName === '-' ? 'stdin' : inName
}

function defaultOutName(obj) {
  const outName = obj?.out?.name ?? 'stdout'
  return outName === '-' ? 'stdout' : outName
}

export default {
  withCreateStreams(options = {}) {

    debug('withCreateStreams(): options=', options)

    const decoratedOptions = {...options}

    if (options?.in?.name) {
      decoratedOptions.in = createObject(
        defaultInName(options),
        () => ({ 
          name: 'stdin',
          createStream: () => process.stdin,
          isDir: () => false
        }),
        (filename) => ({ 
          name: path.resolve(filename),
          createStream: createCreateReadStreamFunc(path.resolve(filename)),
          isDir: () => false
        }),
        (directory) => ({
          name: directory,
          files: readdirSync(directory),
          isDir: () => true
        })
      )
    }

    if (options?.out?.name) {
      decoratedOptions.out = createObject(
        defaultOutName(options),
        () => ({ 
          name: 'stdout',
          createStream: () => process.stdout,
          isDir: () => false
        }),
        (filename) => ({ 
          name: filename,
          createStream: () => fs.createWriteStream(filename),
          isDir: () => false
        }),
        (directory) => {
          debug('withCreateStreams(): directory=', directory)

          const outObj = {name: directory, isDir: () => true}
          // If we are in here, out.name ends with a path separator
          const dirName = path.resolve(directory)
          if (decoratedOptions.in.isDir()) {
            outObj.name = path.resolve(dirName)
          }
          else {
            outObj.name = path.resolve(dirName, path.parse(decoratedOptions.in.name).name)
          }
          try {
            outObj.createStream = () => fs.createWriteStream(outObj.name)
          }
          catch (e) {
            console.error('Could not find directory: ' + dirName + ' or write ' + outObj.name + ': ' + e.message)
            if (e.message == "ENOENT: no such file or directory, stat '" + dirName + "'")
              return () => { throw new Error('file not found') }
            else
              throw e
          }
          return outObj
        }
      )
    }

    debug('withCreateStreams(): decoratedOptions=', decoratedOptions)

    return decoratedOptions
  }
}
