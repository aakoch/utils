import fs from 'fs'
import { simpleProjectRootDir } from '../src/index.js'

process.chdir(simpleProjectRootDir())

const sourceFile = fs.readFileSync('src/index.js', 'utf8')
const header = fs.readFileSync('src/header.cjs', 'utf8')
const exports = fs.readFileSync('src/export.cjs', 'utf8')

const startIndex = sourceFile.indexOf('// <<< HEADER') + '// <<< HEADER'.length
const endIndex = sourceFile.indexOf('// EXPORT >>>')
let code = header + sourceFile.substring(startIndex, endIndex) + exports

fs.writeFileSync('dist/index.cjs', code)
fs.copyFileSync('src/index.js', 'dist/index.mjs')