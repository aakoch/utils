import path from 'path';
import chalk, { chalkStderr } from 'chalk';
import { parseArguments } from './index.js'

function printUsage() {
  const help = [''];
  const p = str => help.push(str ?? '')
  const b = str => help.push(chalk.bold(str))
  b("Test CLI")
  p('Testing for different command line arguments')
  p()
  b('Usage')
  p(chalk.blue('node '+ path.relative(process.env.PWD, process.argv[1]) + ' [-h] [inFile] [outFile]'))
  p('inFile and outFile are both optional and will default to stdin and stdout if omitted.')
  p('You can also use "-" for inFile and outFile for their respective streams.')
  p()
  console.log(help.join('\n'))
}

let options;
try {
  options = await parseArguments(process, printUsage)

  if (options.in.isDir()) {
    console.log('options.in.files=')
    options.in.files.forEach(file => {
      console.log('  ' + file)
    })
  }

  if (options.out.isDir()) {
    console.log('options.out=')
  }

  console.log('options=', options)

} catch (e) {
  if (chalkStderr.supportsColor) {
    console.error(chalk.stderr(chalk.red(e.message)))
    console.error(e)
  }
  else {
    console.error('*'.repeat(30) + '\n' + e.message)
    console.error(e)
  }
}