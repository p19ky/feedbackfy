export const isObject = (objValue) =>
  objValue !== null &&
  typeof objValue === "object" &&
  objValue.constructor === Object;

export const array_chunks = (array, chunk_size) =>
  Array(Math.ceil(array.length / chunk_size))
    .fill()
    .map((_, index) => index * chunk_size)
    .map((begin) => array.slice(begin, begin + chunk_size));

export const generateKeywordsArrayForText = (text, caseSensitive = true) => {
  if (!(typeof text === "string" || text instanceof String)) return null;

  if (!text) return null;

  if (text?.length === 1)
    return ["", caseSensitive ? text : text.toLowerCase()];

  const result = text
    .split("")
    .reduce((acc, v) => [
      ...acc,
      caseSensitive
        ? acc[acc.length - 1] + v
        : (acc[acc.length - 1] + v).toLowerCase(),
    ]);
  result.unshift("");
  return result;
};
