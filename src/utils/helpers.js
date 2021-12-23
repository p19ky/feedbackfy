export const isObject = (objValue) =>
  objValue !== null &&
  typeof objValue === "object" &&
  objValue.constructor === Object;

export const array_chunks = (array, chunk_size) =>
  Array(Math.ceil(array.length / chunk_size))
    .fill()
    .map((_, index) => index * chunk_size)
    .map((begin) => array.slice(begin, begin + chunk_size));
