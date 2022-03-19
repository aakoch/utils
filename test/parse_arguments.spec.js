import tap from "tap";
import parseArguments from "../src/parse_arguments.js?test";

tap.test("parse arguments", async (t) => {
  const result = await parseArguments(["/usr/local/bin/node", "somefile.js"], {skipCreateStreamFunctions:true});
  t.same(result, { args: ["/usr/local/bin/node", "somefile.js"] });
});

tap.test("-h prints help", async (t) => {
  const args = ["/usr/local/bin/node", "somefile.js", "-h"];
  let usagePrinted = false;
  await parseArguments(args, () => (usagePrinted = true), {skipCreateStreamFunctions:true});
  t.ok(usagePrinted);
});

tap.test("--help prints help", async (t) => {
  const args = ["/usr/local/bin/node", "somefile.js", "--help"];
  let usagePrinted = false;
  await parseArguments(args, () => (usagePrinted = true), {skipCreateStreamFunctions:true});
  t.ok(usagePrinted);
});

tap.test('an "h" by iteself doesnt\'t print help', async (t) => {
  const args = ["/usr/local/bin/node", "somefile.js", "h"];
  let usagePrinted = false;
  await parseArguments(args, () => (usagePrinted = true), {skipCreateStreamFunctions:true});
  t.notOk(usagePrinted);
});

tap.test('"help" by iteself doesnt\'t print help', async (t) => {
  const args = ["/usr/local/bin/node", "somefile.js", "help"];
  let usagePrinted = false;
  await parseArguments(args, () => (usagePrinted = true), {skipCreateStreamFunctions:true});
  t.notOk(usagePrinted);
});

tap.test(
  "arguments with no dash are added to arguments and not as an option",
  async (t) => {
    const args = "--t --u --v --w t u".split(" ");

    parseArguments(args, {skipCreateStreamFunctions:true}).then((parsed) => {
      t.same(parsed, {
        args: ["t", "u"],
        options: { t: true, u: true, v: true, w: true },
      });
      t.end();
    });
  }
);

tap.test("arguments can come before options", async (t) => {
  const args = "t u --t --u --v --w".split(" ");

  parseArguments(args, {skipCreateStreamFunctions:true}).then((parsed) => {
    t.same(parsed, {
      args: ["t", "u"],
      options: { t: true, u: true, v: true, w: true },
    });
    t.end();
  });
});

tap.test("options can have 2 dashes", async (t) => {
  const args = "t u --test --uno --verbose --walk".split(" ");

  parseArguments(args, {skipCreateStreamFunctions:true}).then((parsed) => {
    t.same(parsed, {
      args: ["t", "u"],
      options: { test: true, uno: true, verbose: true, walk: true },
    });
    t.end();
  });
});

tap.test("arguments with equal signs are left as such", async (t) => {
  const args = ["debug=all"];

  parseArguments(args, {skipCreateStreamFunctions:true}).then((parsed) => {
    t.same(parsed, {
      args: ["debug=all"],
    });
    t.end();
  });
});

tap.test(
  "flags with equal signs use the right side as the value",
  async (t) => {
    const args = ["--debug=all", "-p=yy"];

    parseArguments(args, {skipCreateStreamFunctions:true,
      optional: [{ name: "debug", aliases: ["p"] }],
    }).then((parsed) => {
      t.same(parsed, {
        options: { debug: "all", p: "yy" },
      });
      t.end();
    });
  }
);

tap.test("required options that are missing throw an error", async (t) => {
  const args = ["--debug=all", "-p=yy"];
  t.rejects(
    parseArguments(args, {skipCreateStreamFunctions:true,
      required: [{ name: "required" }],
      optional: [{ name: "airbag", aliases: ["p"] }],
    })
  );
});

tap.test(
  "required options that are missing but has an alias does NOT throw an error",
  async (t) => {
    const args = ["--debug=all", "-p=yy"];
    t.resolveMatch(
      parseArguments(args, {skipCreateStreamFunctions:true,
        required: [{ name: "required", aliases: ["p"] }],
      }),
      { options: { p: "yy" } }
    );
  }
);

tap.test("flags without an equals sign returns true", async (t) => {
  const args = ["--debug", "-p"];
  t.resolveMatch(parseArguments(args, {skipCreateStreamFunctions:true}), {options: { debug: true, p: true } });
});

tap.test("Node process is handled correctly", async (t) => {
  const args = {...process};
  args.argv= [
    "/usr/local/bin/node",
    "/workspaces/lexing-transformer/src/cli.js",
    "build/attr.es2015.pug",
    "--required",
  ],

  t.resolveMatch(parseArguments(args, { skipCreateStreamFunctions: true }), {
    nodePath: "/usr/local/bin/node",
    program: "/workspaces/lexing-transformer/src/cli.js",
    options: { required: true },
  });
});

tap.test(
  "shorthand/alias flags are only valid when accompanying a required or optional option/flag"
);

tap.test("flags with dashes should be converted to camel case");

tap.test("a single dash is treated as an argument", async (t) => {
  const args = ["-"];
  t.resolveMatch(parseArguments(args, {skipCreateStreamFunctions:true}), { args: ["-"] });
});

tap.test("a single dash should return stdin");

tap.test("a dash for the output should return stdout");

tap.test("passing in a directory will read the contents");

tap.test("a missing output directory will be created (so createDirectory is called)")
