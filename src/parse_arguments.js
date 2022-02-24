import fs from 'node:fs'
import path from 'node:path'
import debugFunc from 'debug'
import { directoryExists, createDirectory } from './utils.js'
const debug = debugFunc('@foo-dog/utils:parse_arguments')
const isInTest = import.meta.url.endsWith('?test')

/**
 * @param process Node process (TODO: pass in arguments only)
 * @param printUsage function to print when "-h" or "--help" is a parameter
 * @param options optional and required parameters:
 *        {
 *          optional: [
 *            {
 *              name: '',
 *              aliases: []
 *            }
 *          ],
 *          required: [
 *            {
 *              name: '',
 *              aliases: []
 *            }
 *          ]
 *        }
 */
// This isn't fully flushed out yet
async function parseArguments(processOrArgv, printUsage, options) {
  function isNodeProcess(processOrArgv) {
    debug('processOrArgv=', processOrArgv)

    return (
      typeof processOrArgv === 'object' &&
      processOrArgv.hasOwnProperty('argv') &&
      processOrArgv.argv[0].startsWith('/') &&
      processOrArgv.title === 'node'
    )
  }

  if (options == undefined) {
    if (printUsage !== null && typeof printUsage === 'object') {
      options = printUsage
    } else {
      options = {}
    }
  }

  const optionalParams = options.optional ?? []
  const requiredParams = options.required ?? []

  debug('options.required=', options.required)
  debug('requiredParams=', requiredParams)

  const ret = {}
  let args
  if (isNodeProcess(processOrArgv)) {
    ret.nodePath = processOrArgv.argv[0]
    ret.program = processOrArgv.argv[1]
    args = processOrArgv.argv.slice(2)
  } else {
    args = processOrArgv?.argv || processOrArgv
  }

  if (args.includes('-h') || args.includes('--help')) {
    printUsage()
    if (!isInTest) {
      process.exit(0)
    } else {
      return
    }
  }

  const internalOptions = {},
    internalArgs = []
  for (let i = 0; i < args.length; i++) {
    const element = args[i]
    if (element === '-') {
      internalArgs.push(element)
    } else if (element.startsWith('--')) {
      const [key, val] = element.split('=')
      internalOptions[key.slice(2)] = val || true
    } else if (element.startsWith('-')) {
      const [key, val] = element.split('=')
      internalOptions[key.slice(1)] = val || true
    } else {
      internalArgs.push(element)
    }
  }

  if (options.hasOwnProperty('skipCreateStreamFunctions') && options.skipCreateStreamFunctions === true) {
    if (internalArgs.length > 0) {
      ret.args = internalArgs
    }
  } else {
    const [inFilename, outFilename] = internalArgs
    ret.in = createInObject(inFilename)
    ret.out = createOutObject(outFilename)
    ret.args = internalArgs.slice(2)
  }

  if (Object.keys(internalOptions).length > 0) {
    ret.options = internalOptions
  }

  checkForRequiredParameters(requiredParams, ret)

  return ret

  function createInObject(inFilename) {
    const inObj = {}
    inObj.name = inFilename ?? 'stdin'
    if (inObj.name === 'stdin') {
      inObj.createStream = () => process.stdin
      inObj.isDir = () => false
    } else {
      const resolvedIn = path.resolve(inObj.name)

      try {
        fs.accessSync(resolvedIn, fs.constants.R_OK)
      } catch (e) {
        console.error(e)
        throw new Error(`Could not ${e.syscall} "${e.path}"`)
      }

      inObj.createStream = () => fs.createReadStream(resolvedIn)
      ;(inObj.isDir = () => fs.lstatSync(resolvedIn).isDirectory()),
        (inObj.files = () =>
          fs.lstatSync(resolvedIn).isDirectory()
            ? fs
                .readdirSync(resolvedIn, { withFileTypes: true })
                .filter(dirent => dirent.isFile() && isSupportedFileExtension(path.extname(dirent.name.slice(1))))
                .map(dirrent => dirrent.name)
            : resolvedIn)
    }

    return inObj
  }

  function createOutObject(outFilename) {
    const outObj = {}
    outObj.name = outFilename ?? 'stdout'
    if (outObj.name === 'stdout') {
      outObj.createStream = () => process.stdout
      outObj.isDir = () => false
    } else {
      const dest = path.resolve(outObj.name)
      debug('dest=', dest)

      if (outObj.name.endsWith(path.sep)) {
        // handle out as directory

        // check if the directory exists
        if (!directoryExists(dest)) {
          createDirectory(dest)
        }

        outObj.name = dest
        outObj.createStream = () => fs.createWriteStream(dest, { flags: 'w' })
        outObj.isDir = () => true
      } else {
        // handleOutAsFile
        const destDir = path.dirname(outObj.name)

        // check if the directory exists
        if (!directoryExists(destDir)) {
          createDirectory(destDir)
        }
        outObj.name = outObj.name
        outObj.createStream = () => {
          return fs.createWriteStream(dest, { flags: 'w' })
        }
        outObj.isDir = () => false
      }
    }
    return outObj
  }

  function checkForRequiredParameters(requiredParams, argumentsAndOptions) {
    requiredParams.forEach(requiredParameter => {
      checkForRequiredParam(requiredParameter, argumentsAndOptions)
    })
  }

  function checkForRequiredParam(requiredParameter, argumentsAndOptions) {
    let nameAndAliases = [requiredParameter.name]
    if (requiredParameter.aliases) {
      nameAndAliases = nameAndAliases.concat(requiredParameter.aliases)
    }

    const argumentsHasNameOrAlias = doArgumentsOrOptionsHaveNameOrAlias(nameAndAliases, argumentsAndOptions)

    if (!argumentsHasNameOrAlias) {
      throw new Error('Required field "' + requiredParameter.name + '" was not found')
    }
  }

  function doArgumentsOrOptionsHaveNameOrAlias(nameAndAliases, argumentsAndOptions) {
    return (
      checkCollectionForNameOrAlias(nameAndAliases, argumentsAndOptions.args) ||
      checkCollectionForNameOrAlias(nameAndAliases, argumentsAndOptions.options)
    )
  }

  function checkCollectionForNameOrAlias(nameAndAliases, parameterCollection) {
    let argumentsHaveNameOrAlias = false
    debug('nameAndAliases=', nameAndAliases)
    debug('parameterCollection=', parameterCollection)
    if (parameterCollection != undefined) {
      if (Array.isArray(parameterCollection) && parameterCollection.length) {
        argumentsHaveNameOrAlias = nameAndAliases.some(name => parameterCollection.includes(name))
      } else if (typeof parameterCollection === 'object') {
        argumentsHaveNameOrAlias = nameAndAliases.some(name => parameterCollection.hasOwnProperty(name))
      } else {
        console.error(
          'Unexpected error in checkCollectionForNameOrAlias(). nameAndAliases=',
          nameAndAliases,
          ', parameterCollection=',
          parameterCollection
        )
        throw new Error('Unexpected error (and nothing coded to handle it)')
      }
    }
    return argumentsHaveNameOrAlias
  }
  // // const argv = minimist(process.argv.slice(2))
  // // debug('argv=', argv)
  // let ret = { in: {}, out: {} }

  // if (argv.help || argv.h) {
  //   debug('help option detected')
  //   if (printUsage != undefined && typeof printUsage === 'function') {
  //     printUsage()
  //   }
  //   else {
  //     debug('No help available. Please contact the developer, which is probably Adam Koch, and tell him he is missing the help.')
  //   }
  //   process.exit()
  // } else if (argv._.length == 0) {
  //   debug('no arguments - using stdin and stdout')
  //   ret = {
  //     in: {
  //       name: 'stdin',
  //       createStream: () => process.stdin,
  //       isDir: () => false
  //     },
  //     out: {
  //       name: 'stdout',
  //       createStream: () => process.stdout,
  //       isDir: () => false
  //     }
  //   }
  // } else if (argv._.length == 1) {
  //   debug('one argument - reading file and piping to stdout')
  //   try {
  //     fs.accessSync(argv._[0], fs.constants.R_OK)
  //   } catch (e) {
  //     throw new Error(`Could not ${e.syscall} "${e.path}"`)
  //   }

  //   // debug('creating read stream for ' + argv?._[0])
  //   const resolvedIn = path.resolve(argv._[0])

  //   ret = {
  //     in: {
  //       name: argv._[0],
  //       createStream: () => fs.createReadStream(resolvedIn),
  //       isDir: () => fs.lstatSync(argv._[0]).isDirectory(),
  //       files: () => fs.lstatSync(resolvedIn).isDirectory() ? fs.readdirSync(resolvedIn, { withFileTypes: true }).filter(dirent => dirent.isFile() && isSupportedFileExtension(path.extname(dirent.name.slice(1)))).map(dirrent => dirrent.name) : resolvedIn
  //     },
  //     out: { name: 'stdout', createStream: () => process.stdout, isDir: () => false },
  //     override: argv.f
  //   }
  // } else {
  //   debug('two or more arguments')

  //   if (argv._[0] == '-') {
  //     debug('first argument was - - using stdin')
  //     ret.in = {
  //       name: 'stdin',
  //       createStream: () => process.stdin,
  //       isDir: () => false
  //     }
  //     debug('Reading from stdin');
  //   } else {
  //     const resolvedIn = path.resolve(argv._[0])
  //     debug(`first argument was ${argv._[0]}. Resolved is ${resolvedIn}`)
  //     try {
  //       fs.accessSync(resolvedIn, fs.constants.R_OK)

  //       debug('fs.readdirSync(resolvedIn)=', fs.readdirSync(resolvedIn))

  //       ret.in = {
  //         name: resolvedIn,
  //         createStream: () => fs.createReadStream(resolvedIn),
  //         isDir: () => fs.lstatSync(resolvedIn).isDirectory(),
  //         files: () => {
  //           if (fs.lstatSync(resolvedIn).isDirectory()) {
  //             return fs
  //               .readdirSync(resolvedIn, { withFileTypes: true })
  //               .filter(dirent => dirent.isFile() && isSupportedFileExtension(path.extname(dirent.name.slice(1))))
  //               .map(dirrent => {
  //                 debug('dirrent.name=' + dirrent.name)
  //                 debug('path.resolve(resolvedIn, dirrent.name)=' + path.resolve(resolvedIn, dirrent.name))
  //                 return path.resolve(resolvedIn, dirrent.name)
  //               })
  //            }
  //            else {
  //             return resolvedIn
  //            }
  //         }
  //       }
  //     } catch (e) {
  //       if (e.hasOwnProperty('syscall'))
  //         throw new Error(`Could not ${e.syscall} "${e.path}"`, { cause: e })
  //       else
  //         throw e;
  //     }
  //   }

  //   if (argv._[1] == '-') {
  //     debug('second argument was - - using stdout')
  //     ret.out = {
  //       name: 'stdout',
  //       createStream: () => process.stdout,
  //       isDir: () => false
  //     }
  //     debug('writing to stdout');
  //   } else {

  //     debug('argv._[1]=', argv._[1])
  //     const dest = path.resolve(argv._[1]);
  //     debug('dest=', dest)

  //     if (argv._[1].endsWith(path.sep)) {
  //       // handle out as directory

  //       // check if the directory exists
  //       if (!directoryExists(dest)) {
  //         createDirectory(dest)
  //       }
  //       ret.out = {
  //         name: dest,
  //         createStream: () => fs.createWriteStream(dest, { flags: 'w' }),
  //         isDir: () => true
  //       }
  //     }
  //     else {
  //       // handleOutAsFile

  //       const destDir = path.dirname(argv._[1]);

  //       // check if the directory exists
  //       if (!directoryExists(destDir)) {
  //         createDirectory(destDir)
  //       }
  //       ret.out = {
  //         name: argv._[1],
  //         createStream: () => {
  //           return fs.createWriteStream(dest, { flags: 'w' })
  //         },
  //         isDir: () => false
  //       }

  //     }
  //   }
  // }

  // if (argv.hasOwnProperty('f')) {
  //   ret.override = argv.f
  // }
  // if (argv.hasOwnProperty('allow-digits-to-start-css-classes')) {
  //   ret.allowDigitToStartClassName = !!argv['allow-digits-to-start-css-classes']
  //   debug('ret.allowDigitToStartClassName=', ret.allowDigitToStartClassName)
  // } else if (argv.hasOwnProperty('allowDigitToStartClassName')) {
  //   ret.allowDigitToStartClassName = new Boolean(argv['allowDigitToStartClassName'])
  //   debug('ret.allowDigitToStartClassName=', ret.allowDigitToStartClassName)
  // }

  // return ret
}

export default parseArguments
