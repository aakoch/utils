import debugFunc from 'debug'
const debug = debugFunc('@foo-dog/utils:parse_arguments')

function isNodeProcess(processOrArgv) {
  debug('processOrArgv=', processOrArgv)

  return (
    typeof processOrArgv === 'object' &&
    processOrArgv.hasOwnProperty('argv') &&
    processOrArgv.argv[0].startsWith('/') &&
    processOrArgv.title.endsWith('node')
  )
}

function checkForRequiredParameters(requiredParams, argumentsAndOptions) {
  requiredParams.forEach(requiredParameter => {
    checkForRequiredParam(requiredParameter, argumentsAndOptions)
  })
}

function checkForRequiredParam(requiredParameter, argumentsAndOptions) {
  const nameAndAliases = createNameAndAliasesArray(requiredParameter)

  const argumentsHasNameOrAlias = doArgumentsOrOptionsHaveNameOrAlias(nameAndAliases, argumentsAndOptions)

  if (!argumentsHasNameOrAlias) {
    throw new Error('Required field "' + requiredParameter.name + '" was not found')
  }
}

function createNameAndAliasesArray(requiredParameter) {
  let nameAndAliases = [requiredParameter.name]
  if (requiredParameter.aliases) {
    nameAndAliases = nameAndAliases.concat(requiredParameter.aliases)
  }
  return nameAndAliases
}

/**
 * @returns boolean
 */
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

/**
 * @param processOrArgv A Node process or an array of command line parameters
 * @param printUsage The function to print when "-h" or "--help" is a parameter
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
async function parseArguments(processOrArgv, printUsage = undefined, options = undefined) {
  if (options == undefined) {
    options = typeof printUsage === 'object' ? printUsage : {}
  }

  const optionalParams = options.optional ?? []
  const requiredParams = options.required ?? []

  debug('optional parameters=', optionalParams)
  debug('required parameters=', requiredParams)

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
    if (printUsage != undefined && typeof printUsage === 'function') {
      printUsage()
    } else {
      debug('No help available. Please contact the developer, which is probably Adam Koch, and tell him he is missing the help.')
    }
  } else {
    const internalOptions = {},
      internalArgs = []

    args.forEach(element => {
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
    })

    if (internalArgs.length > 0) {
      ret.args = internalArgs
    }

    if (Object.keys(internalOptions).length > 0) {
      ret.options = internalOptions
    }

    checkForRequiredParameters(requiredParams, ret)

    return ret
  }

}

export default parseArguments
