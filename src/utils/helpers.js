export const isObject = (objValue) =>
  objValue !== null &&
  typeof objValue === "object" &&
  objValue.constructor === Object;

export const array_chunks = (array, chunk_size) =>
  Array(Math.ceil(array.length / chunk_size))
    .fill()
    .map((_, index) => index * chunk_size)
    .map((begin) => array.slice(begin, begin + chunk_size));

function combination(item, n) {
  const filter = typeof n !== "undefined";
  n = n ? n : item.length;
  const result = [];
  const isArray = item.constructor.name === "Array";
  const count = isArray ? item.length : item;

  const pow = (x, n, m = []) => {
    if (n > 0) {
      for (var i = 0; i < count; i++) {
        const value = pow(x, n - 1, [...m, isArray ? item[i] : i]);
        result.push(value);
      }
    }
    return m;
  };
  pow(isArray ? item.length : item, n);

  return filter ? result.filter((item) => item.length === n) : result;
}

/**
  for "larisa pargea patricia"
  it returns:
  [
    "",
    "l",
    "la",
    "lar",
    "lari",
    "laris",
    "larisa",
    "larisa ",
    "larisa p",
    "larisa pa",
    "larisa par",
    "larisa parg",
    "larisa parge",
    "larisa pargea",
    "larisa pat",
    "larisa patr",
    "larisa patri",
    "larisa patric",
    "larisa patrici",
    "larisa patricia",
    "larisa pargea ",
    "larisa pargea p",
    "larisa pargea pa",
    "larisa pargea pat",
    "larisa pargea patr",
    "larisa pargea patri",
    "larisa pargea patric",
    "larisa pargea patrici",
    "larisa pargea patricia",
    "larisa patricia ",
    "larisa patricia p",
    "larisa patricia pa",
    "larisa patricia par",
    "larisa patricia parg",
    "larisa patricia parge",
    "larisa patricia pargea",
    "p",
    "pa",
    "par",
    "parg",
    "parge",
    "pargea",
    "pargea ",
    "pargea l",
    "pargea la",
    "pargea lar",
    "pargea lari",
    "pargea laris",
    "pargea larisa",
    "pargea larisa ",
    "pargea larisa p",
    "pargea larisa pa",
    "pargea larisa pat",
    "pargea larisa patr",
    "pargea larisa patri",
    "pargea larisa patric",
    "pargea larisa patrici",
    "pargea larisa patricia",
    "pargea p",
    "pargea pa",
    "pargea pat",
    "pargea patr",
    "pargea patri",
    "pargea patric",
    "pargea patrici",
    "pargea patricia",
    "pargea patricia ",
    "pargea patricia l",
    "pargea patricia la",
    "pargea patricia lar",
    "pargea patricia lari",
    "pargea patricia laris",
    "pargea patricia larisa",
    "pat",
    "patr",
    "patri",
    "patric",
    "patrici",
    "patricia",
    "patricia ",
    "patricia l",
    "patricia la",
    "patricia lar",
    "patricia lari",
    "patricia laris",
    "patricia larisa",
    "patricia larisa ",
    "patricia larisa p",
    "patricia larisa pa",
    "patricia larisa par",
    "patricia larisa parg",
    "patricia larisa parge",
    "patricia larisa pargea",
    "patricia p",
    "patricia pa",
    "patricia par",
    "patricia parg",
    "patricia parge",
    "patricia pargea",
    "patricia pargea ",
    "patricia pargea l",
    "patricia pargea la",
    "patricia pargea lar",
    "patricia pargea lari",
    "patricia pargea laris",
    "patricia pargea larisa"
]
 */
export const generateKeywordsArrayForText = (text, caseSensitive = true) => {
  if (!(typeof text === "string" || text instanceof String)) return null;

  if (!text) return null;

  if (text?.length === 1)
    return ["", caseSensitive ? text : text.toLowerCase()];

  const wordsFromText = text.split(" ");
  const allWordsPermutedFromText = Array.from(
    new Set(
      combination(wordsFromText)
        .map((e) => [...new Set(e)])
        .map(JSON.stringify)
    ),
    JSON.parse
  ).map((arr) => arr.join(" "));

  const arraysOfKeywordsForEachPermutation = allWordsPermutedFromText.map((e) =>
    e
      .split("")
      .reduce((acc, v) => [
        ...acc,
        caseSensitive
          ? acc[acc.length - 1] + v
          : (acc[acc.length - 1] + v).toLowerCase(),
      ])
  );

  const result = Array.from(
    new Set(arraysOfKeywordsForEachPermutation.flatMap((e) => e))
  );

  result.unshift("");
  return result;
};
