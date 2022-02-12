import path from 'node:path'
import fs from 'fs'

function createCreateStreamFunc() {
  try {
    fs.statSync(options.in.name)
    return () => fs.createReadStream(path.resolve(options.in.name))
  }
  catch (e) {
    return () => { throw new Error('file not found') }
  }
}

export default {
  withCreateStreams(options) {
    if (options?.in?.name) {
      if (options.in.name.endsWith(path.sep)) {
        options.in.files = []
      }
      else {
        options.in.createStream = createCreateStreamFunc()
      }
      options.in.name = path.resolve(options.in.name)
    }
    return options
  }
}