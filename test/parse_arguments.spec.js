import tap from 'tap'
import parseArguments from '../src/parse_arguments.js?test'

tap.test('parse arguments', async t => {
  const result = await parseArguments(['/usr/local/bin/node', 'somefile.js'])
  t.same(result, { "nodePath": "/usr/local/bin/node", "program": "somefile.js" })
})

tap.test('-h prints help', async t => {
  const args = ['/usr/local/bin/node', 'somefile.js', '-h']
  let usagePrinted = false
  await parseArguments(args, () => usagePrinted = true)
  t.ok(usagePrinted)
})

tap.test('--help prints help', async t => {
  const args = ['/usr/local/bin/node', 'somefile.js', '--help']
  let usagePrinted = false
  await parseArguments(args, () => usagePrinted = true)
  t.ok(usagePrinted)
})

tap.test('an "h" by iteself doesnt\'t print help', async t => {
  const args = ['/usr/local/bin/node', 'somefile.js', 'h']
  let usagePrinted = false
  await parseArguments(args, () => usagePrinted = true)
  t.notOk(usagePrinted)
})

tap.test('"help" by iteself doesnt\'t print help', async t => {
  const args = ['/usr/local/bin/node', 'somefile.js', 'help']
  let usagePrinted = false
  await parseArguments(args, () => usagePrinted = true)
  t.notOk(usagePrinted)
})

tap.test('arguments with no dash are added to arguments and not as an option', async t => {
  const args = '/usr/local/bin/node somefile.js -t -u -v -w t u'.split(' ')

  parseArguments(args)
    .then(parsed => {
      t.same(parsed, {
        nodePath: "/usr/local/bin/node",
        program: "somefile.js",
        args: ['t', 'u'],
        options: { '-t': true, '-u': true, '-v': true, '-w': true }
      })
      t.end()
    })
})

tap.test('arguments can come before options', async t => {
  const args = '/usr/local/bin/node somefile.js t u -t -u -v -w'.split(' ')

  parseArguments(args)
    .then(parsed => {
      t.same(parsed, {
        nodePath: "/usr/local/bin/node",
        program: "somefile.js",
        args: ['t', 'u'],
        options: { '-t': true, '-u': true, '-v': true, '-w': true }
      })
      t.end()
    })
})

tap.test('options can have 2 dashes', async t => {
  const args = '/usr/local/bin/node somefile.js t u --test --uno --verbose --walk'.split(' ')

  parseArguments(args)
    .then(parsed => {
      t.same(parsed, {
        nodePath: "/usr/local/bin/node",
        program: "somefile.js",
        args: ['t', 'u'],
        options: { '--test': true, '--uno': true, '--verbose': true, '--walk': true }
      })
      t.end()
    })
})

tap.test('arguments with equal signs are left as such', async t => {
  const args = ['debug=all']

  parseArguments(args)
    .then(parsed => {
      t.same(parsed, {
        args: ['debug=all']
      })
      t.end()
    })
})

tap.test('flags with equal signs use the right side as the value', async t => {
  const args = ['--debug=all', '-p=yy']

  parseArguments(args)
    .then(parsed => {
      t.same(parsed, {
        options: { '--debug': 'all', '-p': 'yy' }
      })
      t.end()
    })
})

tap.test('required options that are missing throw an error', async t => {
  const args = ['--debug=all', '-p=yy']
  t.rejects(parseArguments(args, { required: [ { name: 'required' } ] }))
})

tap.test('required options that are missing but has an alias does NOT throw an error', async t => {
  const args = ['--debug=all', '-p=yy']
  t.resolveMatch(parseArguments(args, { 
    required: [ { name: 'required', aliases: ['-p'] } ] 
  }), {})
})
