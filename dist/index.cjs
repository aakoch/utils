const { fileURLToPath } = require('url')
const minimist = require('minimist')
const chalk = require('chalk')
const debugFunc = require('debug')
const path = require('path')
const fs = require('fs')

const debug = debugFunc('aakoch:utils')

function isSupportedFileExtension(fileExtWithDot) {
  debug('isSupportedFileExtension(): fileExtWithDot=' + fileExtWithDot)
  return fileExtWithDot.toLowerCase() === '.pug' || fileExtWithDot.toLowerCase() === '.foo-dog'
}

if (typeof String.fill !== 'function') {
  String.fill = function (length, char) {
    return ''.padStart(length, char || ' ')
  }
}

Array.prototype.peek = function () {
  return this[this.length - 1]
}

String.prototype.removeFromEnd = function(str) {
  return this.endsWith(str) ? this.substring(0, this.indexOf(str)) : this
}

function exists(filename) {
  try {
    fs.accessSync(filename)
    return true
  } catch (e) {
    return false
  }
}


async function parseArguments(process, printUsage) {
  const argv = minimist(process.argv.slice(2))
  console.log('argv=', argv)

  if (argv.help || argv.h) {
    debug('help option detected')
    printUsage()
    process.exit()
  }
  else if (argv._.length == 0) {
    debug('no arguments - using stdin and stdout')
    return { in: { name: 'stdin', createStream: () => process.stdin }, out: { name: 'stdout', createStream: () => process.stdout } }
  }
  else if (argv._.length == 1) {
    debug('one argument - reading file and piping to stdout')
    try {
      fs.accessSync(argv._[0], fs.constants.R_OK)
    } catch (e) {
      throw new Error(`Could not ${e.syscall} "${e.path}"`)
    }

    debug('creating read stream for ' + argv?._[0])
    return {
      in: { name: argv._[0], createStream: () => fs.createReadStream(argv._[0]) },
      out: { name: 'stdout', createStream: () => process.stdout },
      override: argv.f
    }
  }
  else {
    debug('two or more arguments')
    const ret = { in: {}, out: {} }

    if (argv._[0] == '-') {
      debug('first argument was - - using stdin')
      ret.in = {
        name: 'stdin',
        createStream: () => process.stdin
      }
      debug('Reading from stdin');
    }
    else {
      const resolvedIn = path.resolve(argv._[0])
      debug(`first argument was ${argv._[0]}. Resolved is ${resolvedIn} - reading file`)
      try {
        fs.accessSync(resolvedIn, fs.constants.R_OK)

        ret.in = {
          name: resolvedIn,
          createStream: () => fs.createReadStream(resolvedIn)
        }
      } catch (e) {
        if (e.hasOwnProperty('syscall'))
          throw new Error(`Could not ${e.syscall} "${e.path}"`, { cause: e })
        else
          throw e;
      }
    }

    if (argv._[1] == '-') {
      debug('second argument was - - using stdout')
      ret.out = {
        name: 'stdout',
        createStream: () => process.stdout
      }
      console.log('writing to stdout');
    }
    else {
      const destFileToWriteTo = path.resolve(argv._[1]);
      const destFolderToCreate = path.dirname(destFileToWriteTo);
      debug(`creating (if not already existing) ${destFolderToCreate}`);
      fs.mkdirSync(destFolderToCreate, { recursive: true });

      debug(`second argument was ${argv._[1]}. Resolved ${destFileToWriteTo} - writing file`)

      try {
        ret.out = {
          name: destFileToWriteTo,
          createStream: () => fs.createWriteStream(destFileToWriteTo, { flags: 'w' })
        }
      } catch (e) {
        if (e.hasOwnProperty('syscall'))
          throw new Error(`Could not ${e.syscall} "${e.path}"`, { cause: e })
        else
          throw e;
      }
    }

    if (argv.hasOwnProperty('f')) {
      ret.override = argv.f
    }

    return ret
  }
}

function simpleProjectRootDir() {
  const originalDir = process.cwd()
  let notFound = true
    while(notFound) {
    try {
      fs.accessSync('package.json', fs.constants.F_OK)
      notFound = false
    }
    catch (e) {
      process.chdir('..')
    }
  }
  const pkgDir = process.cwd()
  process.chdir(originalDir)
  return pkgDir
}

exports.exists = exists
exports.isSupportedFileExtension = isSupportedFileExtension
exports.parseArguments = parseArguments
exports.simpleProjectRootDir = simpleProjectRootDir