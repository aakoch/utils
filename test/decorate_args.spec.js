import tap from 'tap'
import decorateOptions from '../src/decorate_args.js?test'
import path from 'node:path'
import fs from 'node:fs'
import temp from 'temp'
import concat from 'concat-stream'
import stream from 'node:stream'
import {directoryExists} from "../src/utils.js";

function createTestFolderWithFiles(...filesAndDirectory) {
  const tempDirectory = filesAndDirectory.pop()
  const files = filesAndDirectory
  if (!directoryExists(tempDirectory)) {
    fs.mkdirSync(tempDirectory, {recursive: true})
  }
  files.forEach(file => {
    try {
      fs.writeFileSync(path.resolve(tempDirectory, file), "no data")
    } catch (e) {
      console.error('Could not write ' + file + ':' + e.message)
    }
  })

  return files.map(filename => path.resolve(tempDirectory, filename))
}

function deleteTestFolderWithFiles(...filesAndDirectory) {
  const tempDirectory = filesAndDirectory.pop()
  const files = filesAndDirectory

  files.forEach(file => {
    try {
      fs.unlinkSync(path.resolve(tempDirectory, file))
    } catch (e) {
      console.error('Could not delete ' + file + ':' + e.message)
    }
  })

  return files.map(filename => path.resolve(tempDirectory, filename))
}

tap.test('only "in" and "out" properties get decorated - empty object returns empty object', async t => {
  const result = await decorateOptions.withCreateStreams({})
  t.same(result, {})
})

tap.test('only "in" and "out" properties get decorated', async t => {
  const result = await decorateOptions.withCreateStreams({test: "in"})
  t.same(result, {test: "in"})
})

tap.test('empty "in" property does not get decorated', async t => {
  const result = await decorateOptions.withCreateStreams({in: {}})
  t.same(result, {in: {}})
})

tap.test('empty "out" property does not get decorated', async t => {
  const result = await decorateOptions.withCreateStreams({out: {}})
  t.same(result, {out: {}})
})

tap.test('empty "in" and "out" properties do not get decorated', async t => {
  const result = await decorateOptions.withCreateStreams({in: {}, out: {}})
  t.same(result, {in: {}, out: {}})
})

tap.test('"in" property gets decorated with "createStream" when "name" is present and not a directory', async t => {
  const result = await decorateOptions.withCreateStreams({in: {name: 'hello'}})
  const resolvedPath = path.resolve('hello')
  t.same(result.in.name, resolvedPath)
  t.type(result.in.createStream, 'function')
})

tap.test('"in" property gets decorated with "files" when "name" is present and is a directory', async t => {
  temp.track()
  const tempDirectoryName = path.parse(temp.path()).dir
  try {
    // Set up temporary files
    const filenames = createTestFolderWithFiles('file1', 'file2', 'file3', tempDirectoryName)

    const result = await decorateOptions.withCreateStreams({in: {name: tempDirectoryName + path.sep}})

    const resolvedPath = path.resolve(tempDirectoryName)
    t.same(result.in.name, resolvedPath)
    t.ok(Array.isArray(result.in.files))

    // The temp directory returned by temp.path() is a directory existing on my computer and has files, so I don't want to include
    // those.
    const tempFiles = result.in.files.map(file => path.resolve(tempDirectoryName, file)).filter(file => filenames.includes(file))
    t.same(tempFiles.length, 3)
    t.same(tempFiles, filenames)
  } finally {
    // Remove temporary files
    deleteTestFolderWithFiles('file1', 'file2', 'file3', tempDirectoryName)
  }
})

tap.test('calling "in.createStream" will throw an error on file that doesn\'t exist', t => {
  const result = decorateOptions.withCreateStreams({in: {name: 'hello'}})
  const resolvedPath = path.resolve('hello')
  t.same(result.in.name, resolvedPath)
  t.type(result.in.createStream, 'function')
  t.throws(result.in.createStream)
  t.end()
})

tap.test('calling "createStream" on "in" will create a fs.ReadStream', t => {
  // Automatically track and cleanup files at exit
  temp.track();

  // Process the data (note: error handling omitted)
  temp.open('decorate_args_', function (err, info) {
    if (!err) {
      fs.write(info.fd, "test data", (err) => {
        if (err) {
          console.error('Error writing test data', err);
        }
      });
      fs.close(info.fd, function (err) {
        const result = decorateOptions.withCreateStreams({in: {name: info.path}})

        const resolvedPath = path.resolve(info.path)
        t.same(result.in.name, resolvedPath)
        const stream = result.in.createStream()

        t.type(stream, 'ReadStream')

        stream.pipe(concat({encoding: 'string'}, (fileContents) => {
          t.same('test data', fileContents)
          t.end()
        }))
      });
    }
  });
})

tap.test('calling "createStream" on "out" will create a fs.WriteStream if out.name is a file', t => {
  const result = decorateOptions.withCreateStreams({out: {name: 'testOutFilename'}})
  t.type(result.out.createStream, 'function')
  t.end()
})

tap.test('if out.name is a directory AND in is a single file, then createStream() should use the in.name but in the "out" directory', t => {
  const tempDirectoryName = path.parse(temp.path()).dir
  try {
    const inName = path.resolve(tempDirectoryName, 'file1.txt');
    createTestFolderWithFiles('file1.txt', tempDirectoryName)
    const expectedOutPath = path.resolve(tempDirectoryName, 'file1.out')

    const result = decorateOptions.withCreateStreams({in: {name: inName}, out: {name: tempDirectoryName}, options: {'out-extension': 'out'}})
    t.same(result.out.name, expectedOutPath, "Expected the out path to be " + expectedOutPath + ", but was " + result.out.name)
    t.type(result.out.createStream, 'function')

    stream.Readable.from('test').pipe(result.out.createStream())
    t.same(fs.readFileSync(result.out.name, {encoding: 'utf8'}), 'test')
  } catch (e) {
    console.error('test: ' + e.message)
    t.fail(e.message)
  } finally {
    // fs.unlinkSync(path.resolve(tempDirectoryName, 'file1'))
    deleteTestFolderWithFiles('file1.txt', tempDirectoryName)
    t.end()
  }
})

tap.test('if out.name is a directory AND in is a directory, then out.name should stay the name of the output directory', t => {
  const tempDirectoryName = path.parse(temp.path()).dir
  const inPath = path.resolve(tempDirectoryName + path.sep + 'nested' + path.sep + 'in' + path.sep);
  const outPath = path.resolve(tempDirectoryName + path.sep + 'output' + path.sep);
  try {
    const filenames = createTestFolderWithFiles('file1', 'file2', 'file3', tempDirectoryName)
    console.log("filenames=", filenames)
    console.log("Creating input temp directory for test: " + tempDirectoryName + path.sep + 'nested' + path.sep + 'in' + path.sep)
    fs.mkdirSync(inPath, {recursive: true})

    console.log("Creating output temp directory for test: " + tempDirectoryName + path.sep + 'output' + path.sep)
    fs.mkdirSync(outPath)

    const result = decorateOptions.withCreateStreams({
      in: {name: inPath}, out: {name: outPath}
    })
    const resolvedPath = path.resolve(tempDirectoryName, 'output/')
    t.same(result.out.name, resolvedPath)
    t.ok(result.out.isDir())
  } catch (e) {
    console.error('test: ' + e.message)
    t.fail(e.message)
  } finally {
    fs.rmdirSync(inPath)
    fs.rmdirSync(outPath)
    // Remove temporary files
    deleteTestFolderWithFiles('file1', 'file2', 'file3', tempDirectoryName)
    t.end()
  }
})

tap.test('if in/out directories don\'t exist, then out.name should stay the name of the output directory', t => {
  const tempDirectoryName = path.parse(temp.path()).dir
  const inPath = path.resolve(tempDirectoryName + path.sep + 'in' + path.sep + 'basic.pug');

  const filenames = createTestFolderWithFiles('basic.pug', tempDirectoryName + path.sep + 'in')
  const outPath = path.resolve(tempDirectoryName + path.sep + 'output' + path.sep);
  try {
    const result = decorateOptions.withCreateStreams({
      in: {name: inPath}, out: {name: outPath}
    })
    const resolvedPath = path.resolve(tempDirectoryName, 'output/')
    // console.log("resolvedPath=", resolvedPath)
    // console.log("result.out=", result.out)
    t.same(result.out.name, resolvedPath)
    t.end()
  } catch (e) {
    console.error('test: ' + e.message)
    t.fail(e.message)
  } finally {
    deleteTestFolderWithFiles('basic.pug', tempDirectoryName + path.sep + 'in')
  }
})

tap.test("in is a file that exists, out is a directory, file with that name should be output (but what about the extension?)", t => {
  const tempDirectoryName = path.parse(temp.path()).dir
  const filenames = createTestFolderWithFiles('basic.pug', tempDirectoryName + path.sep + 'in')
  const inPath = path.resolve(tempDirectoryName + path.sep + 'in' + path.sep + 'basic.pug');
  const outPath = path.resolve(tempDirectoryName + path.sep + 'output' + path.sep);
  try {
    const result = decorateOptions.withCreateStreams({
      in: {name: inPath}, out: {name: outPath}
    })
    const resolvedPath = path.resolve(tempDirectoryName, 'output/')
    console.log("resolvedPath=", resolvedPath)
    console.log("result.out=", result.out)
    t.same(result.out.name, resolvedPath)
    t.notOk(result.out.isDir())
    t.end()
  } catch (e) {
    console.error('test: ' + e.message)
    t.fail(e.message)
  } finally {
    deleteTestFolderWithFiles('basic.pug', tempDirectoryName + path.sep + 'in')
  }
})

tap.test("verifying previous scenario", async t => {
  const result = await decorateOptions.withCreateStreams({
    options: {'out-extension': 'json'},
    in: {
      name: '/Users/aakoch/projects/new-foo/workspaces/lexing-transformer/build/in/basic.pug'
    },
    out: {name: 'build/out/'}
  })

  const resolvedPath = path.resolve('.', 'build/out/basic.json')
  t.same(result.out.name, resolvedPath)
})
