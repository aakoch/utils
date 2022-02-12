import $lbsd4$minimist from "minimist";
import $lbsd4$debug from "debug";
import $lbsd4$path from "path";
import $lbsd4$fs from "fs";
import "crypto";






const $1096e5373824c862$var$debug = $lbsd4$debug('@foo-dog:utils');
function $1096e5373824c862$export$777d1004acb65c30(fileExtWithDot) {
    $1096e5373824c862$var$debug('isSupportedFileExtension(): fileExtWithDot=' + fileExtWithDot);
    return fileExtWithDot.toLowerCase() == '.pug' || fileExtWithDot.toLowerCase() == '.foo-dog';
}
Array.prototype.peek = function() {
    return this[this.length - 1];
};
String.prototype.removeFromEnd = function(str) {
    return this.endsWith(str) ? this.substring(0, this.lastIndexOf(str)) : this.toString();
};
function $1096e5373824c862$export$f7e9f41ea797a17(filename) {
    try {
        return $lbsd4$fs.accessSync(filename), true;
    } catch (e) {
        return false;
    }
}
function $1096e5373824c862$var$directoryExists(dir) {
    try {
        // fs.lstatSync(destFileToWriteTo)
        $lbsd4$fs.accessSync(dir, $lbsd4$fs.constants.R_OK);
        return true;
    } catch (e) {
    }
    return false;
}
function $1096e5373824c862$var$createDirectory(dir) {
    $lbsd4$fs.mkdirSync(dir, {
        recursive: true
    });
}
/**
 * @param process Node process (TODO: pass in arguments only)
 * @param printUsage function
 */ // This isn't fully flushed out yet
async function $1096e5373824c862$export$63c5b6d6ff5b7ee1(process, printUsage) {
    const argv = $lbsd4$minimist(process.argv.slice(2));
    // debug('argv=', argv)
    let ret = {
        in: {
        },
        out: {
        }
    };
    if (argv.help || argv.h) {
        $1096e5373824c862$var$debug('help option detected');
        if (printUsage != undefined && typeof printUsage === 'function') printUsage();
        else console.log('No help available. Please contact the developer, which is probably Adam Koch, and tell him he is missing the help.');
        process.exit();
    } else if (argv._.length == 0) {
        $1096e5373824c862$var$debug('no arguments - using stdin and stdout');
        ret = {
            in: {
                name: 'stdin',
                createStream: ()=>process.stdin
                ,
                isDir: ()=>false
            },
            out: {
                name: 'stdout',
                createStream: ()=>process.stdout
                ,
                isDir: ()=>false
            }
        };
    } else if (argv._.length == 1) {
        $1096e5373824c862$var$debug('one argument - reading file and piping to stdout');
        try {
            $lbsd4$fs.accessSync(argv._[0], $lbsd4$fs.constants.R_OK);
        } catch (e) {
            throw new Error(`Could not ${e.syscall} "${e.path}"`);
        }
        // debug('creating read stream for ' + argv?._[0])
        const resolvedIn = $lbsd4$path.resolve(argv._[0]);
        ret = {
            in: {
                name: argv._[0],
                createStream: ()=>$lbsd4$fs.createReadStream(resolvedIn)
                ,
                isDir: ()=>$lbsd4$fs.lstatSync(argv._[0]).isDirectory()
                ,
                files: ()=>$lbsd4$fs.lstatSync(resolvedIn).isDirectory() ? $lbsd4$fs.readdirSync(resolvedIn, {
                        withFileTypes: true
                    }).filter((dirent)=>dirent.isFile() && $1096e5373824c862$export$777d1004acb65c30($lbsd4$path.extname(dirent.name.slice(1)))
                    ).map((dirrent)=>dirrent.name
                    ) : resolvedIn
            },
            out: {
                name: 'stdout',
                createStream: ()=>process.stdout
                ,
                isDir: ()=>false
            },
            override: argv.f
        };
    } else {
        $1096e5373824c862$var$debug('two or more arguments');
        if (argv._[0] == '-') {
            $1096e5373824c862$var$debug('first argument was - - using stdin');
            ret.in = {
                name: 'stdin',
                createStream: ()=>process.stdin
                ,
                isDir: ()=>false
            };
            $1096e5373824c862$var$debug('Reading from stdin');
        } else {
            const resolvedIn = $lbsd4$path.resolve(argv._[0]);
            $1096e5373824c862$var$debug(`first argument was ${argv._[0]}. Resolved is ${resolvedIn}`);
            try {
                $lbsd4$fs.accessSync(resolvedIn, $lbsd4$fs.constants.R_OK);
                $1096e5373824c862$var$debug('fs.readdirSync(resolvedIn)=', $lbsd4$fs.readdirSync(resolvedIn));
                ret.in = {
                    name: resolvedIn,
                    createStream: ()=>$lbsd4$fs.createReadStream(resolvedIn)
                    ,
                    isDir: ()=>$lbsd4$fs.lstatSync(resolvedIn).isDirectory()
                    ,
                    files: ()=>{
                        if ($lbsd4$fs.lstatSync(resolvedIn).isDirectory()) return $lbsd4$fs.readdirSync(resolvedIn, {
                            withFileTypes: true
                        }).filter((dirent)=>dirent.isFile() && $1096e5373824c862$export$777d1004acb65c30($lbsd4$path.extname(dirent.name.slice(1)))
                        ).map((dirrent)=>{
                            $1096e5373824c862$var$debug('dirrent.name=' + dirrent.name);
                            $1096e5373824c862$var$debug('path.resolve(resolvedIn, dirrent.name)=' + $lbsd4$path.resolve(resolvedIn, dirrent.name));
                            return $lbsd4$path.resolve(resolvedIn, dirrent.name);
                        });
                        else return resolvedIn;
                    }
                };
            } catch (e) {
                if (e.hasOwnProperty('syscall')) throw new Error(`Could not ${e.syscall} "${e.path}"`, {
                    cause: e
                });
                else throw e;
            }
        }
        if (argv._[1] == '-') {
            $1096e5373824c862$var$debug('second argument was - - using stdout');
            ret.out = {
                name: 'stdout',
                createStream: ()=>process.stdout
                ,
                isDir: ()=>false
            };
            $1096e5373824c862$var$debug('writing to stdout');
        } else {
            $1096e5373824c862$var$debug('argv._[1]=', argv._[1]);
            const dest = $lbsd4$path.resolve(argv._[1]);
            $1096e5373824c862$var$debug('dest=', dest);
            if (argv._[1].endsWith($lbsd4$path.sep)) {
                // handle out as directory
                // check if the directory exists
                if (!$1096e5373824c862$var$directoryExists(dest)) $1096e5373824c862$var$createDirectory(dest);
                ret.out = {
                    name: dest,
                    createStream: ()=>$lbsd4$fs.createWriteStream(dest, {
                            flags: 'w'
                        })
                    ,
                    isDir: ()=>true
                };
            } else {
                // handleOutAsFile
                const destDir = $lbsd4$path.dirname(argv._[1]);
                // check if the directory exists
                if (!$1096e5373824c862$var$directoryExists(destDir)) $1096e5373824c862$var$createDirectory(destDir);
                ret.out = {
                    name: argv._[1],
                    createStream: ()=>{
                        return $lbsd4$fs.createWriteStream(dest, {
                            flags: 'w'
                        });
                    },
                    isDir: ()=>false
                };
            }
        }
    }
    if (argv.hasOwnProperty('f')) ret.override = argv.f;
    if (argv.hasOwnProperty('allow-digits-to-start-css-classes')) {
        ret.allowDigitToStartClassName = !!argv['allow-digits-to-start-css-classes'];
        $1096e5373824c862$var$debug('ret.allowDigitToStartClassName=', ret.allowDigitToStartClassName);
    } else if (argv.hasOwnProperty('allowDigitToStartClassName')) {
        ret.allowDigitToStartClassName = new Boolean(argv['allowDigitToStartClassName']);
        $1096e5373824c862$var$debug('ret.allowDigitToStartClassName=', ret.allowDigitToStartClassName);
    }
    return ret;
}
function $1096e5373824c862$export$af6bad00634a71e4() {
    const originalDir = process.cwd();
    let notFound = true;
    while(notFound)try {
        $lbsd4$fs.accessSync('package.json', $lbsd4$fs.constants.F_OK);
        notFound = false;
    } catch (e) {
        process.chdir('..');
    }
    const pkgDir = process.cwd();
    process.chdir(originalDir);
    return pkgDir;
}



const $1681c5b662d48d75$var$debug = $lbsd4$debug('@foo-dog/utils:parse_arguments');
const $1681c5b662d48d75$var$shouldExit = !"file:///workspaces/utils/src/parse_arguments.js".endsWith('?test');
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
 */ // This isn't fully flushed out yet
async function $1681c5b662d48d75$var$parseArguments(processOrArgv, printUsage, options) {
    function looksLikeAProcess(processOrNot) {
        $1681c5b662d48d75$var$debug('processOrNot=', processOrNot);
        return processOrNot[0].startsWith('/') || processOrNot.hasOwnProperty('argv');
    }
    if (options == undefined) {
        if (printUsage !== null && typeof printUsage === 'object') options = printUsage;
        else options = {
        };
    }
    const optionalParams = options.optional ?? [];
    const requiredParams = options.required ?? [];
    $1681c5b662d48d75$var$debug('options.required=', options.required);
    $1681c5b662d48d75$var$debug('requiredParams=', requiredParams);
    const ret = {
    };
    let args;
    if (looksLikeAProcess(processOrArgv)) {
        ret.nodePath = processOrArgv[0];
        ret.program = processOrArgv[1];
        args = processOrArgv.slice(2);
    } else args = (processOrArgv === null || processOrArgv === void 0 ? void 0 : processOrArgv.argv) || processOrArgv;
    if (args.includes('-h') || args.includes('--help')) {
        printUsage();
        if ($1681c5b662d48d75$var$shouldExit) process.exit(0);
    }
    const internalOptions = {
    }, internalArgs = [];
    for(let i = 0; i < args.length; i++){
        const element = args[i];
        if (element.startsWith('-')) {
            const [key, val] = element.split('=');
            internalOptions[key] = val ?? true;
        } else internalArgs.push(element);
    }
    if (internalArgs.length > 0) ret.args = internalArgs;
    if (Object.keys(internalOptions).length > 0) ret.options = internalOptions;
    $1681c5b662d48d75$var$debug('requiredParams.length=', requiredParams.length);
    for(let reqIdx = 0; reqIdx < requiredParams.length; reqIdx++){
        const element = requiredParams[reqIdx];
        $1681c5b662d48d75$var$debug('required=', element);
        $1681c5b662d48d75$var$debug('ret?.args=', ret === null || ret === void 0 ? void 0 : ret.args);
        $1681c5b662d48d75$var$debug('requiredParams[reqIdx].aliases=', requiredParams[reqIdx].aliases);
        $1681c5b662d48d75$var$debug('(new Array()).concat(element.name).concat(requiredParams[reqIdx].aliases)=', new Array().concat(element.name).concat(requiredParams[reqIdx].aliases));
        new Array(element.name).concat(requiredParams[reqIdx].aliases).forEach((requiredName)=>{
            $1681c5b662d48d75$var$debug(requiredName);
        });
        if (!new Array(element.name).concat(requiredParams[reqIdx].aliases).some((requiredName)=>{
            var ref, ref1, ref2, ref3;
            $1681c5b662d48d75$var$debug('!!ret?.args?.contains(requiredName)=', !!(ret === null || ret === void 0 ? void 0 : (ref = ret.args) === null || ref === void 0 ? void 0 : ref.contains(requiredName)));
            $1681c5b662d48d75$var$debug('ret?.options?.hasOwnProperty(requiredName)=', ret === null || ret === void 0 ? void 0 : (ref1 = ret.options) === null || ref1 === void 0 ? void 0 : ref1.hasOwnProperty(requiredName));
            if (!!(ret === null || ret === void 0 ? void 0 : (ref2 = ret.args) === null || ref2 === void 0 ? void 0 : ref2.contains(requiredName)) || (ret === null || ret === void 0 ? void 0 : (ref3 = ret.options) === null || ref3 === void 0 ? void 0 : ref3.hasOwnProperty(requiredName))) {
                $1681c5b662d48d75$var$debug('don\'t throw');
                return true;
            } else {
                $1681c5b662d48d75$var$debug('throw');
                return false;
            }
        })) throw new Error('Required field "' + element.name + '" was not found');
    }
    return ret;
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
var $1681c5b662d48d75$export$2e2bcd8739ae039 = $1681c5b662d48d75$var$parseArguments;




export {$1096e5373824c862$export$f7e9f41ea797a17 as exists, $1096e5373824c862$export$777d1004acb65c30 as isSupportedFileExtension, $1681c5b662d48d75$export$2e2bcd8739ae039 as parseArguments, $1096e5373824c862$export$af6bad00634a71e4 as simpleProjectRootDir};
//# sourceMappingURL=index.js.map
