// Run with: node tests/compare.test.js
const assert = require("assert");
const { compare, bestAlternative } = require("../js/compare.js");

let r = compare("I tried to explain to him that I needed help.", "I tried to explain for him that I needed help");
assert.deepStrictEqual(r.missed, ["to"]);
assert.ok(r.score > 85 && r.score < 100);

r = compare("I'm building an app to practice my English.", "I am building an app to practice my english");
assert.strictEqual(r.score, 100);

r = compare("I'm building an app.", "I building an app");
assert.deepStrictEqual(r.missed, ["i'm"]);
assert.strictEqual(r.tokens[0].status, "partial");

r = compare("We waited in line for twenty minutes.", "we waited in line for 20 minutes");
assert.strictEqual(r.score, 100);

r = compare("Hello there.", "");
assert.strictEqual(r.score, 0);

const b = bestAlternative("I gave it to him.", ["I gave it for him", "I gave it to him"]);
assert.strictEqual(b.result.score, 100);

const L = require("vm"); const ctx = { window: {} }; L.createContext(ctx);
L.runInContext(require("fs").readFileSync(__dirname + "/../js/lessons.js", "utf8"), ctx);
let n = 0, chars = 0;
for (const l of ctx.window.LESSONS) for (const s of l.sections) for (const it of s.items) { assert.ok(it.en && it.pt); n++; chars += it.en.length; }
console.log(`ok · ${ctx.window.LESSONS.length} lessons, ${n} sentences, ${chars} characters`);
