const convertToCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj; // Return if non-object

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase()),
      value,
    ])
  );
};

module.exports = convertToCamelCase;
