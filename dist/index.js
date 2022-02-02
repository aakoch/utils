import t from"minimist";import e from"debug";import s from"path";import a from"fs";const r=e("@aakoch:utils");function o(t){return r("isSupportedFileExtension(): fileExtWithDot="+t),".pug"==t.toLowerCase()||".foo-dog"==t.toLowerCase()}function n(t){try{return a.accessSync(t),!0}catch(t){return!1}}async function i(e,o){const n=t(e.argv.slice(2));r("argv=",n);let i={in:{},out:{}};if(n.help||n.h)r("help option detected"),null!=o&&"function"==typeof o?o():console.log("No help available. Please contact the developer, which is probably Adam Koch, and tell him he is missing the help."),e.exit();else if(0==n._.length)r("no arguments - using stdin and stdout"),i={in:{name:"stdin",createStream:()=>e.stdin},out:{name:"stdout",createStream:()=>e.stdout}};else if(1==n._.length){r("one argument - reading file and piping to stdout");try{a.accessSync(n._[0],a.constants.R_OK)}catch(t){throw new Error(`Could not ${t.syscall} "${t.path}"`)}r("creating read stream for "+(null==n?void 0:n._[0])),i={in:{name:n._[0],createStream:()=>a.createReadStream(n._[0])},out:{name:"stdout",createStream:()=>e.stdout},override:n.f}}else{if(r("two or more arguments"),"-"==n._[0])r("first argument was - - using stdin"),i.in={name:"stdin",createStream:()=>e.stdin},r("Reading from stdin");else{const t=s.resolve(n._[0]);r(`first argument was ${n._[0]}. Resolved is ${t} - reading file`);try{a.accessSync(t,a.constants.R_OK),i.in={name:t,createStream:()=>a.createReadStream(t)}}catch(t){throw t.hasOwnProperty("syscall")?new Error(`Could not ${t.syscall} "${t.path}"`,{cause:t}):t}}if("-"==n._[1])r("second argument was - - using stdout"),i.out={name:"stdout",createStream:()=>e.stdout},console.log("writing to stdout");else{const t=s.resolve(n._[1]),e=s.dirname(t);r(`creating (if not already existing) ${e}`),a.mkdirSync(e,{recursive:!0}),r(`second argument was ${n._[1]}. Resolved ${t} - writing file`);try{i.out={name:t,createStream:()=>a.createWriteStream(t,{flags:"w"})}}catch(t){throw t.hasOwnProperty("syscall")?new Error(`Could not ${t.syscall} "${t.path}"`,{cause:t}):t}}}return n.hasOwnProperty("f")&&(i.override=n.f),n.hasOwnProperty("allow-digits-to-start-css-classes")?(i.allowDigitToStartClassName=!!n["allow-digits-to-start-css-classes"],r("ret.allowDigitToStartClassName=",i.allowDigitToStartClassName)):n.hasOwnProperty("allowDigitToStartClassName")&&(i.allowDigitToStartClassName=new Boolean(n.allowDigitToStartClassName),r("ret.allowDigitToStartClassName=",i.allowDigitToStartClassName)),i}function l(){const t=process.cwd();let e=!0;for(;e;)try{a.accessSync("package.json",a.constants.F_OK),e=!1}catch(t){process.chdir("..")}const s=process.cwd();return process.chdir(t),s}Array.prototype.peek=function(){return this[this.length-1]},String.prototype.removeFromEnd=function(t){return this.endsWith(t)?this.substring(0,this.lastIndexOf(t)):this.toString()};export{o as isSupportedFileExtension,n as exists,i as parseArguments,l as simpleProjectRootDir};
//# sourceMappingURL=index.js.map
