import {
  isSupportedFileExtension,
  simpleProjectRootDir,
  exists
} from './utils.js'
import originalParseArguments from '../src/parse_arguments.js'
import decorateArgs from '../src/decorate_args.js'

function defined(obj) {
  return obj != null && typeof obj != 'undefined'
}

function existsLength(obj, keyForArray) {
  return defined(obj) && defined(obj[keyForArray]) && Array.isArray(obj[keyForArray]) ? obj[keyForArray].length : -1
}

function defaultInName(obj) {
  return existsLength(obj, 'args') > 0 ? obj.args[0] : 'stdin'
}

function defaultOutName(obj) {
  return existsLength(obj, 'args') > 1 ? obj.args[1] : 'stdout'
}

const parseArguments = async (...arr) => {
  const parsedArgs = await originalParseArguments(...arr)
  const newArgs = {...parsedArgs}
  newArgs.in = { name: defaultInName(parsedArgs) }
  newArgs.out = { name: defaultOutName(parsedArgs) }
  return decorateArgs.withCreateStreams(newArgs)
}

const withCreateStreams = decorateArgs.withCreateStreams

export {
  exists,
  isSupportedFileExtension,
  parseArguments,
  simpleProjectRootDir,
  withCreateStreams
}