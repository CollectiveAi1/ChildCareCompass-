/**
 * Converts a string from snake_case to camelCase
 */
export const snakeToCamel = (str: string): string =>
  str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );

/**
 * Recursively converts object keys from snake_case to camelCase
 */
export const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [snakeToCamel(key)]: toCamelCase(obj[key]),
      }),
      {}
    );
  }
  return obj;
};
