// Compares what the learner said (speech recognition transcript) with the
// target sentence, word by word. Pure functions, no DOM, so it can be tested
// with Node: `node tests/compare.test.js`.
(function (root) {
  const CONTRACTIONS = {
    "i'm": "i am", "you're": "you are", "he's": "he is", "she's": "she is", "it's": "it is",
    "we're": "we are", "they're": "they are", "that's": "that is", "what's": "what is",
    "there's": "there is", "here's": "here is", "where's": "where is", "who's": "who is",
    "how's": "how is", "let's": "let us",
    "i've": "i have", "you've": "you have", "we've": "we have", "they've": "they have",
    "i'll": "i will", "you'll": "you will", "he'll": "he will", "she'll": "she will",
    "we'll": "we will", "they'll": "they will", "it'll": "it will",
    "i'd": "i would", "you'd": "you would", "he'd": "he would", "she'd": "she would",
    "we'd": "we would", "they'd": "they would",
    "don't": "do not", "doesn't": "does not", "didn't": "did not", "can't": "can not",
    "cannot": "can not", "won't": "will not", "isn't": "is not", "aren't": "are not",
    "wasn't": "was not", "weren't": "were not", "haven't": "have not", "hasn't": "has not",
    "hadn't": "had not", "couldn't": "could not", "shouldn't": "should not",
    "wouldn't": "would not", "o'clock": "o'clock",
  };

  // Recognition often writes small numbers as digits.
  const NUMBERS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
    "eighteen", "nineteen", "twenty"];
  const TENS = { 30: "thirty", 40: "forty", 50: "fifty", 60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety" };

  // Spelling variants that should count as the same word.
  const VARIANTS = { okay: "ok", practise: "practice", practised: "practiced", practising: "practicing",
    colour: "color", favourite: "favorite", neighbourhood: "neighborhood", centre: "center",
    mr: "mister", mrs: "missus", percent: "%" };

  function cleanToken(tok) {
    return tok.toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/[^a-z0-9'%]/g, "")
      .replace(/^'+|'+$/g, "");
  }

  // One written token -> list of comparable words ("I'm" -> ["i", "am"]).
  function expand(tok) {
    const t = cleanToken(tok);
    if (!t) return [];
    if (CONTRACTIONS[t]) return CONTRACTIONS[t].split(" ");
    if (/^\d+$/.test(t)) {
      const n = parseInt(t, 10);
      if (n <= 20) return [NUMBERS[n]];
      if (TENS[n]) return [TENS[n]];
      return [t];
    }
    let w = t.replace(/'s$/, ""); // possessive: "friend's" ~ "friends"/"friend"
    if (w !== t) return [w];
    return [VARIANTS[w] || w];
  }

  // "twenty minutes" and "20 minutes" -> same words; also hyphens split words.
  function splitTokens(text) {
    return String(text).replace(/[—–-]/g, " ").split(/\s+/).filter(Boolean);
  }

  function words(text) {
    const out = [];
    for (const tok of splitTokens(text)) out.push(...expand(tok));
    return out;
  }

  // Longest common subsequence: which target words were matched.
  function lcsMatch(a, b) {
    const n = a.length, m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--)
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const matchedA = new Array(n).fill(false), matchedB = new Array(m).fill(false);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { matchedA[i] = matchedB[j] = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    return { matchedA, matchedB, count: dp[0][0] };
  }

  /**
   * compare(target, said) ->
   * { score: 0-100,
   *   tokens: [{ text, status: 'ok'|'miss'|'partial'|'punct', word }],  // target, for display
   *   said:   [{ text, status: 'ok'|'extra' }],
   *   missed: ['explain', 'him'] }                                      // normalized missed words
   */
  function compare(target, said) {
    const tTokens = splitTokens(target).map((text) => ({ text, parts: expand(text) }));
    const flatT = [], owner = [];
    tTokens.forEach((tok, idx) => tok.parts.forEach((p) => { flatT.push(p); owner.push(idx); }));

    const sTokens = splitTokens(said).map((text) => ({ text, parts: expand(text) }));
    const flatS = [], sOwner = [];
    sTokens.forEach((tok, idx) => tok.parts.forEach((p) => { flatS.push(p); sOwner.push(idx); }));

    const { matchedA, matchedB, count } = lcsMatch(flatT, flatS);

    const tokens = tTokens.map((tok, idx) => {
      if (!tok.parts.length) return { text: tok.text, status: "punct" };
      const flags = [];
      owner.forEach((o, k) => { if (o === idx) flags.push(matchedA[k]); });
      const ok = flags.filter(Boolean).length;
      const status = ok === flags.length ? "ok" : ok === 0 ? "miss" : "partial";
      return { text: tok.text, status, word: cleanToken(tok.text) };
    });

    const saidTokens = sTokens.map((tok, idx) => {
      const flags = [];
      sOwner.forEach((o, k) => { if (o === idx) flags.push(matchedB[k]); });
      return { text: tok.text, status: flags.length && flags.every(Boolean) ? "ok" : "extra" };
    });

    const missed = [];
    tokens.forEach((t) => { if ((t.status === "miss" || t.status === "partial") && t.word && !missed.includes(t.word)) missed.push(t.word); });

    const score = flatT.length ? Math.round((count / flatT.length) * 100) : 0;
    return { score, tokens, said: saidTokens, missed };
  }

  // Pick the recognition alternative that best matches the target.
  function bestAlternative(target, alternatives) {
    let best = null;
    for (const alt of alternatives) {
      const r = compare(target, alt);
      if (!best || r.score > best.result.score) best = { text: alt, result: r };
    }
    return best;
  }

  const api = { compare, bestAlternative, words, cleanToken };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Compare = api;
})(this);
