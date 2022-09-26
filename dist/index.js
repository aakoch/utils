import e from"debug";import t from"fs";import r from"node:path";import{readdirSync as n}from"node:fs";e("@foo-dog/utils");function o(e){return".pug"==e.toLowerCase()||".foo-dog"==e.toLowerCase()||".fd"==e.toLowerCase()}function s(e){try{return t.accessSync(e),!0}catch(e){return!1}}function i(){const e=process.cwd();let r=!0;for(;r;)try{t.accessSync("package.json",t.constants.F_OK),r=!1}catch(e){process.chdir("..")}const n=process.cwd();return process.chdir(e),n}Array.prototype.peek=function(){return this[this.length-1]},String.prototype.removeFromEnd=function(e){return this.endsWith(e)?this.substring(0,this.lastIndexOf(e)):this.toString()};const a=e("@foo-dog/utils:parse_arguments");function c(e,t){e.forEach((e=>{!function(e,t){const r=function(e){let t=[e.name];e.aliases&&(t=t.concat(e.aliases));return t}(e);if(!function(e,t){return l(e,t.args)||l(e,t.options)}(r,t))throw new Error('Required field "'+e.name+'" was not found')}(e,t)}))}function l(e,t){let r=!1;if(a("nameAndAliases=",e),a("parameterCollection=",t),null!=t)if(Array.isArray(t)&&t.length)r=e.some((e=>t.includes(e)));else{if("object"!=typeof t)throw console.error("Unexpected error in checkCollectionForNameOrAlias(). nameAndAliases=",e,", parameterCollection=",t),new Error("Unexpected error (and nothing coded to handle it)");r=e.some((e=>t.hasOwnProperty(e)))}return r}var u=async function(e,t,r){null==r&&(r="object"==typeof t?t:{});const n=r.optional??[],o=r.required??[];a("optional parameters=",n),a("required parameters=",o);const s={};let i;if(!function(e){return a("processOrArgv=",e),"object"==typeof e&&e.hasOwnProperty("argv")&&e.argv[0].startsWith("/")&&e.title.endsWith("node")}(e)?i=(null==e?void 0:e.argv)||e:(s.nodePath=e.argv[0],s.program=e.argv[1],i=e.argv.slice(2)),!i.includes("-h")&&!i.includes("--help")){const e={},t=[];return i.forEach((r=>{if("-"===r)t.push(r);else if(r.startsWith("--")){const[t,n]=r.split("=");e[t.slice(2)]=n||!0}else if(r.startsWith("-")){const[t,n]=r.split("=");e[t.slice(1)]=n||!0}else t.push(r)})),t.length>0&&(s.args=t),Object.keys(e).length>0&&(s.options=e),c(o,s),s}null!=t&&"function"==typeof t?t():a("No help available. Please contact the developer, which is probably Adam Koch, and tell him he is missing the help.")};const d=e("@foo-dog/utils:decorate_args");function m(e){try{d("createCreateReadStreamFunc(): looking for",e);const r=t.statSync(e);return d("createCreateReadStreamFunc(): found",e),d("createCreateReadStreamFunc(): stat.isDirectory()=",r.isDirectory()),()=>t.createReadStream(e)}catch(t){if(d("createCreateReadStreamFunc(): didn't find",e),t.message=="ENOENT: no such file or directory, stat '"+e+"'")return()=>{throw new Error("file not found")};throw t}}function f(e,n,o,s){if("stdin"===e||"stdout"===e)return n();{const n=r.resolve(e);return function(e){try{return d("isWritableDirectory(): dir=",e),!!t.statSync(e).isDirectory()&&(t.accessSync(e,t.constants.R_OK|t.constants.W_OK),!0)}catch(t){if("ENOTDIR"===t.code||"ENOENT"===t.code)return!1;throw console.error("Error testing if "+e+" is a directory. Error: "+t.message),t}}(n)?(d("createObject(): "+n+" is a writable directory"),s(n)):(d("createObject(): "+n+" is not a writable directory"),o(n))}}var h={withCreateStreams(e={}){var o,s;d("withCreateStreams(): options=",e);const i={...e};return(null==e||null===(o=e.in)||void 0===o?void 0:o.name)&&(i.in=f(function(e){var t;const r=(null==e||null===(t=e.in)||void 0===t?void 0:t.name)??"stdin";return"-"===r?"stdin":r}(e),(()=>({name:"stdin",createStream:()=>process.stdin,isDir:()=>!1})),(e=>({name:r.resolve(e),createStream:m(r.resolve(e)),isDir:()=>!1})),(e=>({name:e,files:n(e),isDir:()=>!0})))),(null==e||null===(s=e.out)||void 0===s?void 0:s.name)&&(i.out=f(function(e){var t;const r=(null==e||null===(t=e.out)||void 0===t?void 0:t.name)??"stdout";return"-"===r?"stdout":r}(e),(()=>({name:"stdout",createStream:()=>process.stdout,isDir:()=>!1})),(e=>({name:e,createStream:()=>t.createWriteStream(e),isDir:()=>!1})),(n=>{var o;const s={name:n,isDir:()=>!0},a=r.resolve(n);i.in.isDir()?s.name=r.resolve(a):(null==e||null===(o=e.options)||void 0===o?void 0:o.hasOwnProperty("out-extension"))?s.name=r.resolve(a,r.parse(i.in.name).name+"."+e.options["out-extension"]):s.name=a;try{s.createStream=()=>(console.log("Writing to "+s.name),t.createWriteStream(s.name))}catch(e){if(console.error("Could not find directory: "+a+" or write "+s.name+": "+e.message),e.message=="ENOENT: no such file or directory, stat '"+a+"'")return()=>{throw new Error("file not found")};throw e}return s}))),d("withCreateStreams(): decoratedOptions=",i),i}};function p(e){return null!=e&&null!=e}function g(e,t){return p(e)&&p(e[t])&&Array.isArray(e[t])?e[t].length:-1}function y(e){return g(e,"args")>1?e.args[1]:"stdout"}const v=async(...e)=>{const t=await u(...e),r={...t};var n;return r.in={name:(n=t,g(n,"args")>0?n.args[0]:"stdin")},r.out={name:y(t)},h.withCreateStreams(r)};export{v as parseArguments,s as exists,o as isSupportedFileExtension,i as simpleProjectRootDir};
//# sourceMappingURL=index.js.map
