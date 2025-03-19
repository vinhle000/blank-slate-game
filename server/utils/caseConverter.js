/**
 * Converts camelCase keys in an object to snake_case for PostgreSQL queries.
 */
function camelToSnake(obj) {
  if (!obj || typeof obj !== 'object') return obj; // Return if non-object

  const newObj = {};
  for (const key in obj) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    newObj[snakeKey] = obj[key];
  }
  return newObj;
}

/**
 * Converts snake_case keys in an object to camelCase for frontend use.
 */
function snakeToCamel(data) {
  if (Array.isArray(data)) {
    return data.map((obj) => snakeToCamel(obj));
  }

  if (typeof data === 'object' && data !== null) {
    const newObj = {};
    for (const key in data) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()); // Convert snake_case to camelCase
      newObj[camelKey] = data[key];
    }
    return newObj;
  }
  return data;
}

module.exports = {
  snakeToCamel,
  camelToSnake,
};
