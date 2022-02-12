import tap from 'tap'
import decorateOptions from '../src/decorate_args.js?test'
import path from 'node:path'

tap.test('only "in" and "out" properties get decorated - empty object returns empty object', async t => {
  const result = await decorateOptions.withCreateStreams({})
  t.same(result, {})
})

tap.test('only "in" and "out" properties get decorated', async t => {
  const result = await decorateOptions.withCreateStreams({ test: "in" })
  t.same(result, { test: "in" })
})

tap.test('empty "in" property does not get decorated', async t => {
  const result = await decorateOptions.withCreateStreams({ in: {} })
  t.same(result, { in: {} })
})

tap.test('empty "out" property does not get decorated', async t => {
  const result = await decorateOptions.withCreateStreams({ out: {} })
  t.same(result, { out: {} })
})

tap.test('empty "in" and "out" properties do not get decorated', async t => {
  const result = await decorateOptions.withCreateStreams({ in: {}, out: {} })
  t.same(result, { in: {}, out: {} })
})

tap.test('"in" property gets decorated with "createStream" when "name" is present and not a directory', async t => {
  const result = await decorateOptions.withCreateStreams({ in: { name: 'hello' } })
  const resolvedPath = path.resolve('hello')
  t.same(result.in.name, resolvedPath)
  t.type(result.in.createStream, 'function')
})

// This wouldn't verify if the directory existed or not
tap.test('"in" property gets decorated with "files" when "name" is present and is a directory', async t => {
  const result = await decorateOptions.withCreateStreams({ in: { name: 'hello/' } })
  const resolvedPath = path.resolve('hello/')
  t.same(result.in.name, resolvedPath)
  t.ok(Array.isArray(result.in.files))
})

tap.test('calling resulting "createStream" will throw an error on file that doesn\'t exist', t => {
  try {
    const result = decorateOptions.withCreateStreams({ in: { name: 'hello' } })
    console.log('result=', result)
      // .then(result, () => {
    const resolvedPath = path.resolve('hello')
    t.same(result.in.name, resolvedPath)
    t.type(result.in.createStream, 'function')
    t.throws(result.in.createStream)
    t.end()
  }
  catch (e) {
    console.error('test: ' + e.message)
  }
})

// tap.test('-h prints help', async t => {
//   const args = ['/usr/local/bin/node', 'somefile.js', '-h']
//   let usagePrinted = false
//   await parseArguments(args, () => usagePrinted = true)
//   t.ok(usagePrinted)
// })

// tap.test('--help prints help', async t => {
//   const args = ['/usr/local/bin/node', 'somefile.js', '--help']
//   let usagePrinted = false
//   await parseArguments(args, () => usagePrinted = true)
//   t.ok(usagePrinted)
// })

// tap.test('an "h" by iteself doesnt\'t print help', async t => {
//   const args = ['/usr/local/bin/node', 'somefile.js', 'h']
//   let usagePrinted = false
//   await parseArguments(args, () => usagePrinted = true)
//   t.notOk(usagePrinted)
// })

// tap.test('"help" by iteself doesnt\'t print help', async t => {
//   const args = ['/usr/local/bin/node', 'somefile.js', 'help']
//   let usagePrinted = false
//   await parseArguments(args, () => usagePrinted = true)
//   t.notOk(usagePrinted)
// })

// tap.test('arguments with no dash are added to arguments and not as an option', async t => {
//   const args = '/usr/local/bin/node somefile.js -t -u -v -w t u'.split(' ')

//   parseArguments(args)
//     .then(parsed => {
//       t.same(parsed, {
//         nodePath: "/usr/local/bin/node",
//         program: "somefile.js",
//         args: ['t', 'u'],
//         options: { '-t': true, '-u': true, '-v': true, '-w': true }
//       })
//       t.end()
//     })
// })

// tap.test('arguments can come before options', async t => {
//   const args = '/usr/local/bin/node somefile.js t u -t -u -v -w'.split(' ')

//   parseArguments(args)
//     .then(parsed => {
//       t.same(parsed, {
//         nodePath: "/usr/local/bin/node",
//         program: "somefile.js",
//         args: ['t', 'u'],
//         options: { '-t': true, '-u': true, '-v': true, '-w': true }
//       })
//       t.end()
//     })
// })

// tap.test('options can have 2 dashes', async t => {
//   const args = '/usr/local/bin/node somefile.js t u --test --uno --verbose --walk'.split(' ')

//   parseArguments(args)
//     .then(parsed => {
//       t.same(parsed, {
//         nodePath: "/usr/local/bin/node",
//         program: "somefile.js",
//         args: ['t', 'u'],
//         options: { '--test': true, '--uno': true, '--verbose': true, '--walk': true }
//       })
//       t.end()
//     })
// })

// tap.test('arguments with equal signs are left as such', async t => {
//   const args = ['debug=all']

//   parseArguments(args)
//     .then(parsed => {
//       t.same(parsed, {
//         args: ['debug=all']
//       })
//       t.end()
//     })
// })

// tap.test('flags with equal signs use the right side as the value', async t => {
//   const args = ['--debug=all', '-p=yy']

//   parseArguments(args)
//     .then(parsed => {
//       t.same(parsed, {
//         options: { '--debug': 'all', '-p': 'yy' }
//       })
//       t.end()
//     })
// })

// tap.test('required options that are missing throw an error', async t => {
//   const args = ['--debug=all', '-p=yy']
//   t.rejects(parseArguments(args, { required: [ { name: 'required' } ] }))
// })

// tap.test('required options that are missing but has an alias does NOT throw an error', async t => {
//   const args = ['--debug=all', '-p=yy']
//   t.resolveMatch(parseArguments(args, { 
//     required: [ { name: 'required', aliases: ['-p'] } ] 
//   }), {})
// })
