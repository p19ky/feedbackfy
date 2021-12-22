export const isObject = objValue =>
  objValue !== null &&
  typeof objValue === 'object' &&
  objValue.constructor === Object;